package com.publiccustomerapp;

import android.graphics.PointF;
import android.location.Location;
import android.util.Log;
import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;

import com.dot.nenativemap.MapChangeListener;
import com.dot.nenativemap.TouchInput;
import com.dot.nenativemap.annotations.PolylineOptions;
import com.dot.nenativemap.directions.RouteElementInstructionsDisplay;
import com.dot.nenativemap.directions.RouteResponse;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactMethod;
import com.dot.nenativemap.CameraPosition;
import com.dot.nenativemap.MapView;
import com.dot.nenativemap.Marker;
import com.dot.nenativemap.MapController;
import com.dot.nenativemap.MapView.MapReadyCallback;
import com.dot.nenativemap.SceneError;
import com.dot.nenativemap.LngLat;
import com.dot.nenativemap.geometry.Polyline;
import com.dot.nenativemap.annotations.MarkerOptions;
import com.dot.nenativemap.LocationListener;
import com.dot.nenativemap.navigation.NavigationMode;
import com.dot.nenativemap.navigation.NavigationStatus;
import com.dot.nenativemap.navigation.Navigator;
import com.dot.nenativemap.directions.Directions;
import com.dot.nenativemap.directions.DirectionsCriteria;
import com.dot.nenativemap.directions.RouteCallback;
import com.dot.nenativemap.directions.RouteCount;
import com.dot.nenativemap.directions.RouteInstructionsDisplay;
import com.dot.nenativemap.directions.VHRoutingRequest;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import com.dot.nenativemap.search.Search;
import com.dot.nenativemap.search.SearchResultCallback;
import com.dot.nenativemap.search.SearchResponse;
import com.dot.nenativemap.search.SearchData;
import com.dot.nenativemap.search.PlaceName;
import com.dot.nenativemap.search.AreaName;
import com.dot.nenativemap.search.Coordinates;
import com.dot.nenativemap.search.Postcode;
import com.dot.nenativemap.search.StreetName;
import com.dot.nenativemap.search.SearchPOIConstant;

import org.json.JSONArray;

import com.nenative.services.android.navigation.ui.v5.NENativeNavigationFragment;
import com.nenative.services.android.navigation.ui.v5.NavigationEndListener;
import com.nenative.services.android.navigation.ui.v5.NavigationRateListener;
import com.nenative.services.android.navigation.ui.v5.NavigationLauncher;
import com.nenative.services.android.navigation.ui.v5.NavigationLauncherOptions;
import com.nenative.services.android.navigation.ui.v5.utils.Coordinate;
import com.nenative.services.android.navigation.ui.v5.utils.RoutePointData;
import com.nenative.services.android.navigation.v5.routeprogress.ProgressChangeListener;
import com.virtualmaze.ne_location_management.location.ProviderType;
import com.dot.nenativemap.CameraUpdateFactory;
import com.dot.nenativemap.OnMarkerCreateListener;
import com.dot.nenativemap.annotations.StyleType;
import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;

// import com.dot.nenativemap.annotations.PolylineOptions;

public class NeNativeModule extends ViewGroupManager<MapView> implements LifecycleEventListener {
    public static final String REACT_CLASS = "NeNativeModule";
    private int mapLoaded = 1;
    private MapView mapView;
    private String navMode = "realtime";
    private MapController mapController;
    public ThemedReactContext reactNativeContext;

    private ThemedReactContext reactNavigationContext;
    private Set<Polyline> addedPolylines = new HashSet<>();
    private Directions directions;
    private RouteInstructionsDisplay routeInstructionsDisplay;
    private Navigator navigator;
    boolean isNavMode = false;
    private Map<String, String> settingsProps = new HashMap<>();

    private Search search;
    // Handler navHandler;
    Runnable navRunnable;
    private Location currentLocation;
    private List<RoutePointData> selectedRoutePoints;
    private LinearLayout parentLayout;
    private FrameLayout frameLayout;
    private android.view.View dummyView; // Us
    // private static final int DUMMY_VIEW_ID = View.generateViewId();
    private static final int DUMMY_VIEW_IDS = View.generateViewId();

    private Set<Marker> addedMarkers = Collections.newSetFromMap(new ConcurrentHashMap<>());
    private HashMap<String, String> markerTextures = new HashMap<>();

    private TouchInput.TapResponder tapResponder = new TouchInput.TapResponder() {
        @Override
        public boolean onSingleTapUp(float x, float y) {
            return false;
        }

        // on mapclick get the coordinates and emit event to react-native layer
        @Override
        public boolean onSingleTapConfirmed(float x, float y) {
            LngLat tappedPoint = mapController.screenPositionToLngLat(new PointF(x, y));
            double longitude = tappedPoint.longitude;
            double latitude = tappedPoint.latitude;
            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putDouble("longitude", longitude);
            eventData.putDouble("latitude", latitude);

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onMapClick", eventData);
            return true;
        }
    };

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public void onHostResume() {
        if (mapView != null) {
            mapView.onResume();
            Log.e("RESUME", "RESUME");
        }

    }

    @ReactMethod
    public void pauseMap() {
        if (mapView != null) {
            mapView.onPause();
            Log.e("PAUSE", "PAUSE");
        }
    }

    @ReactMethod
    public void resumeMap() {
        if (mapView != null) {
            mapView.onResume();
            Log.e("RESUME", "RESUME");
        }
    }

    @Override
    public void onHostPause() {
        // Handle pause event, e.g.,
        if (mapView != null) {
            mapView.onPause();
            Log.e("PAUSE", "PAUSE");
        }

    }

    @Override
    public void onHostDestroy() {
        if (mapView != null) {
            mapView.onDestroy();
            Log.e("DESTROY", "DESTROY");
        }
    }

    @Override
    protected MapView createViewInstance(ThemedReactContext reactContext) {
        reactNativeContext = reactContext;
        mapView = new MapView(reactContext);
        mapView.onCreate(null);
        reactContext.addLifecycleEventListener(this);

        mapView.getMapAsync(
                new MapReadyCallback() {
                    @Override
                    public void onMapReady(MapController mapCtrler) {

                        // set map controller
                        mapController = mapCtrler;
                        // set click listener
                        mapController.getTouchInput().setTapResponder(tapResponder);

                        mapController.enable3dBuildingsVisibility(false);
                        mapController.enableExtrusionsVisibility(false);

                        mapController.setMapChangeListener(new MapChangeListener() {
                            @Override
                            public void onViewComplete() {

                            }

                            @Override
                            public void onRegionWillChange(boolean b) {

                            }

                            @Override
                            public void onRegionIsChanging() {
                            }

                            @Override
                            public void onRegionDidChange(boolean b) {

                                LngLat mapCenter = new LngLat(
                                        mapController.getCameraPosition().latitude,
                                        mapController.getCameraPosition().longitude);

                                double latitude = mapCenter.latitude;
                                double longitude = mapCenter.longitude;

                                WritableMap eventData = Arguments.createMap();
                                eventData.putDouble("latitude", latitude);
                                eventData.putDouble("longitude", longitude);
                                eventData.putBoolean("moving", b);
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onMapCenterChanged", eventData);
                            }
                        });

                        // Map is ready, perform any necessary operations
                        Log.e("MAP LOADING DONE", mapCtrler.toString());
                        mapCtrler.setMinimumZoomLevel(4.0f);
                        mapCtrler.setMaximumZoomLevel(18.0f);
                        mapCtrler.setMapMode(MapController.MapMode.ONLINE);
                        mapCtrler.setCurrentLocationEnabled(true);
                        LngLat origin = new LngLat(77.181608, 8.341317);
                        CameraPosition camera = mapCtrler.getCameraPosition();
                        camera.longitude = origin.longitude;
                        camera.latitude = origin.latitude;
                        camera.zoom = 10;
                        mapCtrler.flyToCameraPosition(camera, 100, null);

                        // mapCtrler.requestRender();
                        mapCtrler.setSceneLoadListener(new MapController.SceneLoadListener() {
                            @Override
                            public void onSceneReady(int sceneId, SceneError sceneError) {
                                Log.e("AJIN", "" + sceneId);
                                mapLoaded = 1;
                                initSearch("southern-zone", "India Southern Zone");
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onMapReady", new WritableNativeMap());
                            }
                        });
                        mapCtrler.setRouteCallback(getRouteCallback());

                        mapCtrler.addCurrentLocationListener(new LocationListener() {
                            @Override
                            public void onLocationChanged(Location location) {
                                // Log.e("My Location",""+location);
                                double longitude = location.getLongitude();
                                double latitude = location.getLatitude();
                                WritableNativeMap eventData = new WritableNativeMap();
                                eventData.putDouble("longitude", longitude);
                                eventData.putDouble("latitude", latitude);

                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onUserLocationChange", eventData);

                            }
                        });
                    }

                }

        );
        SharedDirections.setSharedMapView(mapView);
        return mapView;
    }

    @ReactProp(name = "enable3D")
    public void set3DVisibility(MapView mapView, boolean enable) {
        if (mapController != null) {
            mapController.enable3dBuildingsVisibility(enable);
            mapController.enableExtrusionsVisibility(false);
            // mapView.getMapAsync;
        }
    }

    @ReactProp(name = "settingsProps")
    public void setSettingsProps(MapView mapView, ReadableMap settingsProps) {
        Log.e("SettingsProps", " " + settingsProps);
        if (settingsProps != null) {
            ReadableMapKeySetIterator iterator = settingsProps.keySetIterator();
            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();
                String value = settingsProps.getString(key);
                this.settingsProps.put(key, value);
            }
//            if(mapController != null) mapController.setMapLangCode(this.settingsProps.get("language"));
        }
    }

    public void initSearch(String mapUnit, String mapUnitName) {
        Log.e("Error initSearch", " " + search + " " + mapController);
        if (mapController != null) {
            search = new Search();
            String pathPrefix = reactNativeContext.getFilesDir().getAbsolutePath();
            HashMap<String, String> searchFilePaths = new HashMap<>();
            if (!mapUnit.isEmpty() && !mapUnitName.isEmpty()) {
                searchFilePaths.put(mapUnit, mapUnitName);
            }
            Log.e("Search", "load" + " " + mapController + " " + pathPrefix + searchFilePaths);
            search.getInstance().init(mapController, pathPrefix, searchFilePaths);
        } else {
            Log.e("Search", "Error in initSearch: search or mapController is null");
        }
    }

    private List<VMSearchData> getResults(SearchResponse result, ReadableArray currentLocation) {
        List<VMSearchData> vmSearchData = new ArrayList<>();
        SearchData data = result.getSearchData();
        List<String> cityNames = new ArrayList<>(); // List to store city names
        double currentLatitude = currentLocation.getDouble(0);
        double currentLongitude = currentLocation.getDouble(1);
        if (data.getPlaceName() != null && !data.getPlaceName().isEmpty()) {
            for (PlaceName placeName : data.getPlaceName()) {
                String address = "";
                for (String place_address : placeName.getAddress()) {
                    address = place_address.isEmpty() ? address : address.isEmpty() ? place_address : address + ", " + place_address;
                }
                LngLat position = new LngLat(placeName.getPos().get(0), placeName.getPos().get(1));
                String name = placeName.getPlaceName().get(placeName.getPlaceName().size() - 1);
                if (name.isEmpty()) {
                    name = placeName.getPlaceName().get(0);
                }
                name = capitalizeFirstLetter(name);
                address = capitalizeFirstLetter(address);
                String category = placeName.getCategory().get(placeName.getCategory().size() - 1);
                double distance = calculateDistance(currentLatitude, currentLongitude, position.latitude, position.longitude);
                VMSearchData vmsearchData = new VMSearchData(name, address, "", AutocompleteResultType.TYPE_ADDRESS, position, "", category, "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        if (data.getStreetName() != null && !data.getStreetName().isEmpty()) {
            for (StreetName streetName : data.getStreetName()) {
                String address = "";
                if(streetName.getAddress() != null) {
                    for (String street_address : streetName.getAddress()) {
                        address = street_address.isEmpty() ? address : address.isEmpty() ? street_address : address + ", " + street_address;
                    }
                }
                String name = streetName.getName().get(streetName.getName().size() - 1);
                if (name.isEmpty()) {
                    name = streetName.getName().get(0);
                }
                LngLat lngLat = new LngLat(streetName.getPos().get(0), streetName.getPos().get(1));
                name = capitalizeFirstLetter(name);
                address = capitalizeFirstLetter(address);
                double distance = calculateDistance(currentLatitude, currentLongitude, lngLat.latitude, lngLat.longitude);
                VMSearchData vmsearchData = new VMSearchData(name, address, "", AutocompleteResultType.TYPE_STREET, lngLat, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        if (data.getAreaName() != null && !data.getAreaName().isEmpty()) {
            for (AreaName areaName : data.getAreaName()) {
                String address = "";
                if(areaName.getAddress() != null) {
                    for (String area_address : areaName.getAddress()) {
                        address = area_address.isEmpty() ? address : address.isEmpty() ? area_address : address + ", " + area_address;
                    }
                }
                String name = areaName.getName().get(areaName.getName().size() - 1);
                if (name.isEmpty()) {
                    name = areaName.getName().get(0);
                }
                LngLat lngLat = new LngLat(areaName.getPos().get(0), areaName.getPos().get(1));
                name = capitalizeFirstLetter(name);
                address = capitalizeFirstLetter(address);
                double distance = calculateDistance(currentLatitude, currentLongitude, lngLat.latitude, lngLat.longitude);
                VMSearchData vmsearchData = new VMSearchData(name, address, "", AutocompleteResultType.TYPE_LOCATIONS, lngLat, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        if (data.getCity() != null && !data.getCity().isEmpty()) {
            for (AreaName city : data.getCity()) {
                String address = "";
                if(city.getAddress() != null) {
                    for (String city_address : city.getAddress()) {
                        address = city_address.isEmpty() ? address : address.isEmpty() ? city_address : address + ", " + city_address;
                    }
                }
                String name = city.getName().get(city.getName().size() - 1);
                if (name.isEmpty()) {
                    name = city.getName().get(0);
                }
                cityNames.add(name);
                LngLat lngLat = new LngLat(city.getPos().get(0), city.getPos().get(1));
                name = capitalizeFirstLetter(name);
                address = capitalizeFirstLetter(address);
                double distance = -1;
                if (currentLatitude != 0.0 && currentLongitude != 0.0) {
                    distance = calculateDistance(currentLatitude, currentLongitude, lngLat.latitude, lngLat.longitude);
                }
                VMSearchData vmsearchData = new VMSearchData(name, address, "", AutocompleteResultType.TYPE_LOCATIONS, lngLat, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        if (data.getDistrict() != null && !data.getDistrict().isEmpty()) {
            for (AreaName district : data.getDistrict()) {
                String address = "";
                if(district.getAddress() != null) {
                    for (String district_address : district.getAddress()) {
                        address = district_address.isEmpty() ? address : address.isEmpty() ? district_address : address + ", " + district_address;
                    }
                }
                String name = district.getName().get(district.getName().size() - 1);
                if (name.isEmpty()) {
                    name = district.getName().get(0);
                }
                if(cityNames.contains(name)) {
                    continue;
                }
                LngLat lngLat = new LngLat(district.getPos().get(0), district.getPos().get(1));
                name = capitalizeFirstLetter(name);
                address = capitalizeFirstLetter(address);
                double distance = -1;
                if (currentLatitude != 0.0 && currentLongitude != 0.0) {
                    distance = calculateDistance(currentLatitude, currentLongitude, lngLat.latitude, lngLat.longitude);
                }
                VMSearchData vmsearchData = new VMSearchData(name, address, "", AutocompleteResultType.TYPE_LOCATIONS, lngLat, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        if (data.getState() != null && !data.getState().isEmpty()) {
            for (AreaName state : data.getState()) {
                String address = "";
                if(state.getAddress() != null) {
                    for (String state_address : state.getAddress()) {
                        address = state_address.isEmpty() ? address : address.isEmpty() ? state_address : address + ", " + state_address;
                    }
                }
                String name = state.getName().get(state.getName().size() - 1);
                if (name.isEmpty()) {
                    name = state.getName().get(0);
                }
                LngLat lngLat = new LngLat(state.getPos().get(0), state.getPos().get(1));
                name = capitalizeFirstLetter(name);
                address = capitalizeFirstLetter(address);
                double distance = -1;
                if (currentLatitude != 0.0 && currentLongitude != 0.0) {
                    distance = calculateDistance(currentLatitude, currentLongitude, lngLat.latitude, lngLat.longitude);
                }
                VMSearchData vmsearchData = new VMSearchData(name, address, "", AutocompleteResultType.TYPE_LOCATIONS, lngLat, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        if (data.getPostcode() != null && !data.getPostcode().isEmpty()) {
            for (Postcode postCode : data.getPostcode()) {
                String name = postCode.getPcode();
                LngLat lngLat = new LngLat(postCode.getPos().get(0), postCode.getPos().get(1));
                name = capitalizeFirstLetter(name);
                double distance = -1;
                if (currentLatitude != 0.0 && currentLongitude != 0.0) {
                    distance = calculateDistance(currentLatitude, currentLongitude, lngLat.latitude, lngLat.longitude);
                }
                VMSearchData vmsearchData = new VMSearchData(name, "", "", AutocompleteResultType.TYPE_LOCATIONS, lngLat, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        if (data.getCoords() != null && !data.getCoords().isEmpty()) {
            for (Coordinates coord : data.getCoords()) {
                String name = coord.getPos().get(1) + "," + coord.getPos().get(0);
                LngLat lngLat = new LngLat(coord.getPos().get(0), coord.getPos().get(1));
                double distance = -1;
                if (currentLatitude != 0.0 && currentLongitude != 0.0) {
                    distance = calculateDistance(currentLatitude, currentLongitude, lngLat.latitude, lngLat.longitude);
                }
                VMSearchData vmsearchData = new VMSearchData(name, "", "", AutocompleteResultType.TYPE_LOCATIONS, lngLat, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }

        return vmSearchData;
    }

    private static final double DEG2RADFACTOR = Math.PI / 180.0;
    private static final double KEquatorialRadius = 6378137.0; // in meters
    private static final double KPolarRadius = 6356752.3142; // in meters

    private double calculateDistance(double lon1, double lat1, double lon2, double lat2) {
        // calculates angle between latitude
        final double deltaLat = (lat2 - lat1) * DEG2RADFACTOR;
        // calculates angle between longitude
        final double deltaLon = (lon2 - lon1) * DEG2RADFACTOR;
        // calculates the earth radius at the specific latitude
        final double currentRadius = KEquatorialRadius * Math.cos(lat1 * DEG2RADFACTOR);
        // multiplies the latitude by the smaller polar radius
        final double meter_Y = KPolarRadius * deltaLat;
        // multiplies the longitude by the current earth radius.
        final double meter_X = currentRadius * deltaLon;
        // calculates the distance between the two points assuming that the
        // curvature is equal in X and Y using Pythagoras' theorem.
        return Math.sqrt(meter_X * meter_X + meter_Y * meter_Y);
    }

    private String capitalizeFirstLetter(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }

    @ReactProp(name = "searchUnit")
    public void setSearchUnit(MapView mapView, ReadableMap searchUnit) {
        if (mapController == null || search == null) {
            Log.e("NeNativeModule", "mapController or search is null in setSearchUnit");
            return;
        }

        try {
            SearchResultCallback searchResultCallback = new SearchResultCallback() {
                @Override
                public void onSuccess(SearchResponse result) {
                    if (result != null) {
                        Log.e("Search Result", "" + result);
                        List<VMSearchData> searchData = getResults(result, searchUnit.getArray("start_location"));
                        // Process and emit the search results to React Native
                        WritableArray searchResultsArray = Arguments.createArray();
                        for (VMSearchData data : searchData) {
                            WritableMap dataMap = Arguments.createMap();
                            dataMap.putString("name", data.getName());
                            dataMap.putString("address", data.getAddress());
                            dataMap.putString("countryCode", data.getCountyCode());
                            dataMap.putString("type", data.getType().toString());
                            dataMap.putDouble("longitude", data.getLngLat().longitude);
                            dataMap.putDouble("latitude", data.getLngLat().latitude);
                            dataMap.putString("line", data.getLine());
                            dataMap.putString("parking", data.getParking());
                            dataMap.putString("area_hl", data.getArea_hl());
                            dataMap.putDouble("distance", data.getDistance());
                            searchResultsArray.pushMap(dataMap);
                        }
                        WritableMap eventData = Arguments.createMap();
                        eventData.putArray("searchResults", searchResultsArray);
                        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onSearchResults", eventData);
                    } else {
                        Log.w("NeNativeModule", "Search success, but result is null");
                        WritableNativeMap eventData = new WritableNativeMap();
                        eventData.putString("searchResults", "null");
                        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onSearchResults", eventData);
                    }
                }

                @Override
                public void onFailure(SearchResponse error) {
                    if (error != null) {
                        Log.e("NeNativeModule", "Search error: " + error.getErrMessage());
                        WritableNativeMap eventData = new WritableNativeMap();
                        eventData.putString("searchResults", error.getErrMessage());
                        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onSearchResults", eventData);
                    } else {
                        Log.e("NeNativeModule", "Search failed with null error");
                        WritableNativeMap eventData = new WritableNativeMap();
                        eventData.putString("searchResults", "null");
                        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onSearchResults", eventData);
                    }
                    // TODO: Emit error to React Native
                }
            };

            HashMap<String, String> searchFilters = new HashMap<>();

            ReadableArray searchUnitArray = searchUnit.getArray("start_location");
            String searchUnitString = searchUnit.getString("search_str");

            Log.e("Language", settingsProps.get("language"));

            assert searchUnitArray != null;
            String query = search.getInstance().buildSearchRequest(
                    "southern-zone",
                    searchUnitString,
                    searchUnitArray.getDouble(0),
                    searchUnitArray.getDouble(1),
                    "[\"all\"]",
                    settingsProps.get("language"),
                    "[\"place_name\", \"street_name\", \"area_name\", \"district\", \"city\", \"state\", \"postcode\", \"tags\", \"cords\"]",
                    searchFilters,
                    20,
                    false);

            if (query == null || query.isEmpty()) {
                throw new IllegalArgumentException("Generated query is null or empty");
            }

            search.getInstance().getSearchAsync(query, true, searchResultCallback);
        } catch (IllegalArgumentException e) {
            Log.e("NeNativeModule", "Invalid argument in setSearchUnit: " + e.getMessage());
            // TODO: Emit error to React Native
        } catch (Exception e) {
            Log.e("NeNativeModule", "Unexpected error in setSearchUnit: " + e.getMessage());
            e.printStackTrace();
            // TODO: Emit error to React Native
        }
    }

    public List<VMSearchData> getPOIResults(SearchResponse response, double currentLatitude, double currentLongitude) {
        List<VMSearchData> vmSearchData = new ArrayList<>();
        SearchData data = response.getSearchData();
        if (data.getBboxSearch() != null && !data.getBboxSearch().isEmpty()) {
            for (PlaceName placeName : data.getBboxSearch()) {
                StringBuilder addressBuilder = new StringBuilder();
                for (String placeAddress : placeName.getAddress()) {
                    if (!placeAddress.isEmpty()) {
                        if (addressBuilder.length() > 0) {
                            addressBuilder.append(", ");
                        }
                        addressBuilder.append(placeAddress);
                    }
                }
                String address = addressBuilder.toString();

                String name = placeName.getPlaceName().isEmpty() ? ""
                        : placeName.getPlaceName().get(placeName.getPlaceName().size() - 1);
                if (name.isEmpty() && !placeName.getPlaceName().isEmpty()) {
                    name = placeName.getPlaceName().get(0);
                }

                LngLat position = new LngLat(placeName.getPos().get(0), placeName.getPos().get(1));

                name = capitalizeFirstLetter(name);
                address = capitalizeFirstLetter(address);
                double distance = -1;
                if (currentLatitude != 0.0 && currentLongitude != 0.0) {
                    distance = calculateDistance(currentLatitude, currentLongitude, position.latitude, position.longitude);
                }
                VMSearchData vmsearchData = new VMSearchData(name, address, "", AutocompleteResultType.TYPE_POI,
                        position, "", "", "");
                vmsearchData.setDistance(distance);
                vmSearchData.add(vmsearchData);
            }
        }
        return vmSearchData;
    }

    @ReactProp(name = "autoPOISearch")
    public void setAutoPOISearch(MapView mapView, ReadableMap POIData) {
        if (mapController == null || POIData == null || POIData.getInt("poiID") == 0) {
            Log.e("NeNativeModule", "mapController is null in setAutoPOISearch");
            return;
        }

        double CURRENT_LATITUDE = 24.450288;
        double CURRENT_LONGITUDE = 54.381127;

        if (POIData.getDouble("latitude") != 0 && POIData.getDouble("longitude") != 0) {
            CURRENT_LATITUDE = POIData.getDouble("latitude");
            CURRENT_LONGITUDE = POIData.getDouble("longitude");
        }

        double finalCURRENT_LATITUDE = CURRENT_LATITUDE;
        double finalCURRENT_LONGITUDE = CURRENT_LONGITUDE;
        SearchResultCallback searchResultCallback = new SearchResultCallback() {
            @Override
            public void onSuccess(SearchResponse result) {
                if (result != null) {
                    try {
                        List<VMSearchData> searchData = getPOIResults(result, finalCURRENT_LATITUDE, finalCURRENT_LONGITUDE);
                        WritableArray searchResultsArray = Arguments.createArray();
                        for (VMSearchData data : searchData) {
                            WritableMap dataMap = Arguments.createMap();
                            dataMap.putString("name", data.getName());
                            dataMap.putString("address", data.getAddress());
                            dataMap.putString("type", data.getType().toString());
                            dataMap.putDouble("longitude", data.getLngLat().longitude);
                            dataMap.putDouble("latitude", data.getLngLat().latitude);
                            searchResultsArray.pushMap(dataMap);
                        }
                        WritableMap eventData = Arguments.createMap();
                        eventData.putArray("searchPOIResults", searchResultsArray);
                        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onSearchPOIResults", eventData);
                    } catch (Exception e) {
                        Log.e("NeNativeModule", "Error processing search results: " + e.getMessage());
                        emitErrorEvent("Error processing search results");
                    }
                } else {
                    Log.w("NeNativeModule", "Search success, but result is null");
                    emitErrorEvent("Search result is null");
                }
            }

            @Override
            public void onFailure(SearchResponse error) {
                String errorMessage = (error != null) ? error.getErrMessage() : "Unknown error";
                Log.e("NeNativeModule", "Search error: " + errorMessage);
                emitErrorEvent("Search failed: " + errorMessage);
            }
        };

        try {
            search = new Search();
            HashMap<String, String> searchFilters = new HashMap<>();
            String poiFilters = getOnlinePOICategoryFilter(
                    SearchPOIConstant.getOnlinePOIFilter(POIData.getInt("poiID"))).toString();
            String query = search.getInstance().buildPOISearchRequest(
                    "southern-zone",
                    CURRENT_LATITUDE,
                    CURRENT_LONGITUDE,
                    poiFilters,
                    "en",
                    95, 5000, 15, false);

            if (query == null || query.isEmpty()) {
                throw new IllegalArgumentException("Generated query is null or empty");
            }

            search.getInstance().getSearchAsync(query, false, searchResultCallback);
        } catch (IllegalArgumentException e) {
            Log.e("NeNativeModule", "Invalid argument in setAutoPOISearch: " + e.getMessage());
            emitErrorEvent("Invalid search parameters");
        } catch (Exception e) {
            Log.e("NeNativeModule", "Unexpected error in setAutoPOISearch: " + e.getMessage());
            e.printStackTrace();
            emitErrorEvent("Unexpected error occurred");
        }
    }

    private void emitErrorEvent(String errorMessage) {
        WritableMap eventData = Arguments.createMap();
        eventData.putString("error", errorMessage);
        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSearchPOIError", eventData);
    }

    private JSONArray getOnlinePOICategoryFilter(List<String> arrayList) {
        if (arrayList != null && !arrayList.isEmpty()) {
            JSONArray jsonArray = new JSONArray();
            for (String category : arrayList) {
                jsonArray.put(category);
            }
            return jsonArray;
        }
        return null;
    }

    @ReactProp(name = "navMode")
    public void setNavMode(MapView mapView, String mode) {
        if (mapController != null) {
            navMode = mode;
        }
    }

    @ReactProp(name = "mode")
    public void setMode(MapView mapView, String mode) {
        if (mapController != null) {
            String mapStyleString = mode.equals("light") ? "DAY2" : "NIGHT2";
            MapController.MapStyle mapStyle = MapController.MapStyle.valueOf(mapStyleString);
            mapController.setMapStyle(mapStyle);
        }
    }

    @ReactProp(name = "homeLocation")
    public void setHomeLocation(MapView mapView, ReadableArray location) {
        if (mapController != null && location != null) {
            ReadableMap homeLocation = location.getMap(0);
            CameraPosition camera = mapController.getCameraPosition();
            camera.longitude = homeLocation.getDouble("lng");
            camera.latitude = homeLocation.getDouble("lat");
            camera.zoom = homeLocation.getInt("zoom");
            mapController.flyToCameraPosition(camera, 100, null);
        }

    }

    // Add this method to handle cleanup when the component unmounts

    public void onDropViewInstance(MapView view) {
        if (mapController != null) {
            // Release any resources here if needed
            mapView.onDestroy(); // For example, to clean up the MapView
            mapController = null;
            mapView = null;
            addedPolylines = new HashSet<>();
            directions.getInstance().onDestroy();
            directions = null;
            navigator = null;
            // routeInstructionsDisplay=null;
        }

    }

    @ReactProp(name = "markers")
    public synchronized void setMarkers(MapView mapView, ReadableArray markers) {
        if (mapController == null) {
            return;
        }
        if (markers == null) {
            mapController.removeAllMarkers();
            synchronized (addedMarkers) {
                addedMarkers.clear();
            }
            return;
        }
        if (markers.size() == 0) {
            mapController.removeAllMarkers();
            mapController.setCurrentLocationEnabled(true);
            synchronized (addedMarkers) {
                addedMarkers.clear();
            }
            return;
        }
        Log.d("AJIN", "ADD MARKERS CALLED");
        HashSet<Marker> currentMarkers = new HashSet<>();
        HashSet<Marker> markersToRemove = new HashSet<>(addedMarkers);
        for (int i = 0; i < markers.size(); i++) {
            ReadableMap markerData = markers.getMap(i);
            double latitude = markerData.getDouble("lat");
            double longitude = markerData.getDouble("lng");
            String markerId = markerData.getString("id");
            String markerType = markerData.getString("type");
            int markerSize = markerData.getInt("size");
            boolean isMarkerSelected = markerData.getBoolean("selected");
            boolean focus = markerData.getBoolean("focus");
            // boolean animate = markerData.getBoolean("animate");
            // int animationTime = markerData.getInt("animationTime");

            String title = markerData.getString("title");
            String snippet = markerData.getString("snippet");
            int angle = markerData.getInt("angle");
            Marker marker = findMarkerWithId(markerId);
            MarkerOptions markerOptions = new MarkerOptions()
                    .name(markerId)
                    .position(new LngLat(longitude, latitude))
                    .size(markerSize)
                    .interactive(true)
                    .rotation(0)
                    .flat(true)
                    .title(title)
                    .style(StyleType.ROTATABLE_MARKER)
                    .texture(markerType);
            if (marker == null) {
                Log.d("AJIN", "new marker call today " + markerId);
                OnMarkerCreateListener onMarkerCreateListener = new OnMarkerCreateListener() {
                    @Override
                    public synchronized void onMarkerCreated(Marker marker) {
                        if (mapController == null) {
                            Log.d("AJIN", "MAP ctrl not");
                            return;
                        }
                        Log.d("AJIN", "MARKER CREATE EMMITED " + marker.getMarkerName());
                        MarkerData userData = new MarkerData();
                        userData.setId(markerId);
                        marker.setUserData(userData);
                        Log.d("AJIN", markerId + " Set usedata");
//                        mapController.NEMarkerSetAngle(marker, angle);
                        synchronized (addedMarkers) {
                            addedMarkers.add(marker);
                        }
                        markerTextures.put(markerId, markerType);
                        if (isMarkerSelected) {
                            mapController.selectMarker(marker);
                        } else {
                            mapController.deselectMarker(marker);
                        }
                        synchronized (currentMarkers) {
                            currentMarkers.add(marker);
                        }
                    }

                    @Override
                    public void onFailed(String name) {
                        Log.d("AJIN", "Failed marker " + name);
                    }
                };
                mapController.NEMarkerAdd(markerOptions, onMarkerCreateListener);

            } else {
                LngLat oldpos = marker.getPosition();
                oldpos.longitude = longitude;
                oldpos.latitude = latitude;
                // if(animate){
                // marker.setPointEased(oldpos,animationTime, MapController.EaseType.LINEAR);
                // }else{
                marker.setPoint(new LngLat(longitude, latitude));
                // }
                if (focus) {
                    CameraPosition camera = mapController.getCameraPosition();
                    camera.longitude = longitude;
                    camera.latitude = latitude;
                    camera.zoom = 15;
                    // mapController.updateCameraPosition(CameraUpdateFactory.newCameraPosition(camera),100);
                    mapController.updateCameraPosition(
                            CameraUpdateFactory.newLngLatZoom(new LngLat(longitude, latitude), 16), 100);
                    // mapController.flyToCameraPosition(camera, 100, null);
                }
                if (isMarkerSelected) {
                    mapController.selectMarker(marker);
                } else {
                    mapController.deselectMarker(marker);
                }
                String prevString = markerTextures.get(markerId);

                if (prevString != null && !markerType.equals(markerTextures.get(markerId))) {
                    marker.setVisible(false);
                    mapController.NEMarkerSetStyle(marker, markerOptions);
                    markerTextures.put(markerId, markerType);
                    marker.setVisible(true);
                }
                if (prevString == null) {
                    marker.setVisible(false);
                    mapController.NEMarkerSetStyle(marker, markerOptions);
                    markerTextures.put(markerId, markerType);
                    marker.setVisible(true);
                }
//                mapController.NEMarkerSetAngle(marker, angle);
                markersToRemove.remove(marker);
                synchronized (currentMarkers) {
                    currentMarkers.add(marker);
                }
            }

        }
        synchronized (addedMarkers) {
            addedMarkers.clear();
            addedMarkers.addAll(currentMarkers);
        }
        for (Marker marker : markersToRemove) {
            mapController.removeMarker(marker.getMarkerId());
        }
        markersToRemove.clear();
    }

    // Helper method to find a marker by LatLng in the addedMarkers collection
    private Marker findMarkerWithLatLng(LngLat targetLatLng) {
        for (Marker marker : addedMarkers) {
            if (marker.getPosition().equals(targetLatLng)) {
                return marker;
            }
        }
        return null;
    }

    private Marker findMarkerWithId(String id) {
        for (Marker marker : addedMarkers) {
            MarkerData userData = (MarkerData) marker.getUserData();
            if (userData.getId() == id) {
                return marker;
            }
        }
        return null;
    }

    @ReactProp(name = "polylines")
    public void setPolylines(MapView mapView, ReadableArray polylines) {

        if (mapController != null) {
            // For every props update remove all previous polylines
            // Because the native code does not provide functionality to edit or delete
            // indiividual polylines
            mapController.clearLines();
            // empty already added polylines
            addedPolylines = new HashSet<>();
            if (polylines != null) {
                // Create a set to track polylines that need to be removed
                Set<Polyline> polylinesToRemove = new HashSet<>(addedPolylines);

                for (int i = 0; i < polylines.size(); i++) {
                    // Parse polyline object data from the prop
                    ReadableMap polylineData = polylines.getMap(i);

                    if (polylineData != null) {
                        ReadableArray coordinates = polylineData.getArray("coordinates");
                        String color = polylineData.getString("color");
                        int width = polylineData.getInt("width");

                        if (coordinates != null) {
                            List<LngLat> linePoints = new ArrayList<>();

                            // Iterate through coordinates to create a list of LngLat points
                            for (int j = 0; j < coordinates.size(); j++) {
                                ReadableArray coordinate = coordinates.getArray(j);

                                if (coordinate != null && coordinate.size() == 2) {
                                    double latitude = coordinate.getDouble(1);
                                    double longitude = coordinate.getDouble(0);
                                    linePoints.add(new LngLat(longitude, latitude));
                                }
                            }

                            // Create a PolylineOptions object
                            PolylineOptions polylineOptions = new PolylineOptions()
                                    .addAll(linePoints)
                                    .color(color)
                                    .width(width);
                            mapController.drawPolyLine(polylineOptions);
                        }
                    }
                }
            }
        }
    }

    @ReactProp(name = "findRoute")
    public void findRoute(MapView mapView, ReadableMap routeData) {
        if (mapView != null && routeData != null && mapController != null) {
            ReadableArray locationArray = routeData.getArray("locations");
            String type = routeData.getString("type");

            if (routeInstructionsDisplay != null && mapView != null) {
                try {
                    mapView.getMapController().removeAll();
                    directions.getInstance().clearRoute();
                    routeInstructionsDisplay = null;
                    directions.getInstance().onDestroy();
                } catch (Exception e) {
                    routeInstructionsDisplay = null;
                    directions.getInstance().onDestroy();
                    Log.e("routeLOG", "inside remove 2");
                    return;
                }
            }
            Log.e("routeLOG", "called find route");

            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putString("message", "called navigation" + reactNativeContext + ",");

            directions = new Directions();
            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
            showGetRouteProgress();
            mapController.setCurrentLocationEnabled(true);

            directions.getInstance().init(reactNativeContext, "southIndia", "southIndia", mapController.mapPointer);

            Log.e("crossareas", "crosses direction instance ");
            ArrayList<VHRoutingRequest.Location> locations = new ArrayList<>();
            for (int i = 0; i < locationArray.size(); i++) {
                ReadableMap locationObject = locationArray.getMap(i);
                if (locationObject != null) {
                    double latitude = locationObject.getDouble("lat");
                    double longitude = locationObject.getDouble("lon");
                    VHRoutingRequest.Location location = VHRoutingRequest.Location.builder()
                            .lat(latitude)
                            .lon(longitude)
                            .build();
                    locations.add(location);
                }
            }

            eventData = new WritableNativeMap();
            eventData.putString("message", "crosses initialization" + directions);

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
            eventData = new WritableNativeMap();

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("direction-init", eventData);
            Map<String, Object> autooptions = new HashMap<>();
            Map<String, Object> bicycleOptions = new HashMap<>();
            Map<String, Object> walkOptions = new HashMap<>();
            String directionsCriteria = DirectionsCriteria.KILOMETERS;

            if (settingsProps.get("distanceFormate").equals("Kilometers(km)/ Meters(m)")) {
                directionsCriteria = DirectionsCriteria.KILOMETERS;
            } else {
                directionsCriteria = DirectionsCriteria.MILES;
            }

            switch (settingsProps.get("highways")) {
                case "Prefer":
                    autooptions.put("use_highways", 1.0);
                    break;
                case "Avoid":
                    autooptions.put("use_highways", 0.0);
                    break;
                case "Slightly Prefer":
                    autooptions.put("use_highways", 0.5);
                    break;
                default:
                    break;
            }

            switch (settingsProps.get("tolls")) {
                case "Prefer":
                    autooptions.put("use_tolls", 1.0);
                    break;
                case "Avoid":
                    autooptions.put("use_tolls", 0.0);
                    break;
                case "Slightly Prefer":
                    autooptions.put("use_tolls", 0.5);
                    break;
                default:
                    break;
            }

            switch (settingsProps.get("ferry")) {
                case "Prefer":
                    autooptions.put("use_ferry", 1.0);
                    bicycleOptions.put("use_ferry", 1.0);
                    walkOptions.put("use_ferry", 1.0);
                    break;
                case "Avoid":
                    autooptions.put("use_ferry", 0.0);
                    bicycleOptions.put("use_ferry", 0.0);
                    walkOptions.put("use_ferry", 0.0);
                    break;
                case "Slightly Prefer":
                    autooptions.put("use_ferry", 0.5);
                    bicycleOptions.put("use_ferry", 0.5);
                    walkOptions.put("use_ferry", 0.5);
                    break;
                default:
                    break;
            }

            switch (settingsProps.get("livingStreet")) {
                case "Prefer":
                    autooptions.put("use_living_street", 0.4);
                    bicycleOptions.put("use_living_street", 0.6);
                    walkOptions.put("use_living_street", 1);
                    break;
                case "Avoid":
                    autooptions.put("use_living_street", 0.0);
                    bicycleOptions.put("use_living_street", 0.0);
                    walkOptions.put("use_living_street", 0.0);
                    break;
                case "Slightly Prefer":
                    autooptions.put("use_living_street", 0.2);
                    bicycleOptions.put("use_living_street", 0.4);
                    walkOptions.put("use_living_street", 0.6);
                    break;
                default:
                    break;
            }

            String profile = DirectionsCriteria.PROFILE_CAR;
            String language = settingsProps.get("language");
            String languageCode = "en-US";

            if(language.equals("en")) {
                languageCode = "en-US";
            } else {
                languageCode = "ar";
            }

            if (type.equals("bike")) {
                profile = DirectionsCriteria.PROFILE_BICYCLE;
            } else if (type.equals("train")) {
                profile = DirectionsCriteria.PROFILE_PEDESTRIAN;
            }

            VHRoutingRequest.CostingOptions costingOptions = VHRoutingRequest.CostingOptions
                    .builder()
                    .auto(autooptions)
                    .bicycle(bicycleOptions)
                    .pedestrian(walkOptions)
                    .build();
            VHRoutingRequest request = VHRoutingRequest.builder()
                    .locations(locations)
                    .costing(profile)
                    .costing_options(costingOptions)
                    .alternates(2)
                    .language(languageCode)
                    .units(directionsCriteria)
                    .build();

            double currBearingInDegrees = 0;
            directions.getInstance().getRouteAsync(reactNativeContext, request, currBearingInDegrees);

        } else {
            Log.e("routeLOG", "inside remove 1");

            if (routeInstructionsDisplay != null && mapView != null) {
                try {
                    mapView.getMapController().removeAll();
                    directions.getInstance().clearRoute();
                    routeInstructionsDisplay = null;
                } catch (Exception e) {
                    routeInstructionsDisplay = null;
                }
            }
        }

        if (routeData == null && mapController != null) {
            mapController.setCurrentLocationEnabled(true);
        }
    }

    // ProgressDialog progressDialog;
    public RouteCallback getRouteCallback() {
        return routeCallback;
    }

    private RouteCallback routeCallback = new RouteCallback() {
        @Override
        public void onSuccess(RouteResponse routeResponse) {
            Log.e("Success", "Res Success message");
            handleResponse(routeResponse);

            RouteCount routeCount = Directions.getInstance().getPrimaryRoute();
            int index = (int) routeCount.getPrimaryRouteIndex() + 1;
            if (index == routeCount.getRouteCount())
                index = 0;

            Directions.getInstance().selectRoute(index);
            routeInstructionsDisplay = Directions.getInstance().getRouteInstructions(index);
            if (routeInstructionsDisplay == null) {
                Log.e("RouteError", "Failed to get route instructions");
                return;
            }
            // Ensure we're not just getting the default toString() representation
            List<RouteElementInstructionsDisplay> routeInstructions = routeInstructionsDisplay
                    .getRouteElementInstructions();

            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putString("message", "success");
            eventData.putInt("selectedRouteIndex", index);
            eventData.putInt("totalRoutes", routeCount.getRouteCount());

            WritableNativeArray routeInstructionsArray = new WritableNativeArray();
            for (RouteElementInstructionsDisplay instruction : routeInstructions) {
                WritableMap instructionMap = new WritableNativeMap();
                instructionMap.putString("text", instruction.getInstruction());
                // Add more properties of the instruction as needed
                routeInstructionsArray.pushMap(instructionMap);
            }
            eventData.putArray("routeInstructions", routeInstructionsArray);

            // You might want to add more route information to the eventData here
            // For example:
            // eventData.putDouble("distance", route.getTotalDistance());
            // eventData.putDouble("duration", route.getTotalDuration());

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("direction-ready", eventData);
        }

        @Override
        public void onFailure(RouteResponse routeResponse) {
            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putString("message", "success");
            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("direction-ready", eventData);

        }
    };

    private void handleResponse(RouteResponse routeResponse) {
        if (routeResponse != null) {
            if (routeResponse.getRouteInstructions() != null) {
                Log.e("Success", "route instruvtion done");

                WritableNativeMap eventData = new WritableNativeMap();
                eventData.putString("message", "sucess got navigation response" + mapView);

                routeInstructionsDisplay = routeResponse.getRouteInstructions();
                Log.e("DIRECTION", "routeInstructionsDisplay" + routeResponse.getRouteInstructions());
                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("navigation", eventData);
                int routeIndex = 0;
                directions.getInstance().getRouteInstructions(routeIndex);
                RouteCount routeCount = directions.getInstance().getPrimaryRoute();
                // Log.e("NENative", "RC: " + routeCount.getRouteCount() + " sel route " +
                // routeCount.getSelectedRoute());
                int[] padding = { 50, 20, 30, 40 };
                directions.getInstance().zoomRoute(padding, 1, -1);
                mapController.setCurrentLocationEnabled(true);
                SharedDirections.updateSharedArray(routeInstructionsDisplay);
            } else {
                handleFailure("Route instructions null", "");
            }
        } else {
            handleFailure("Route response null", "");
        }
    }

    private void handleFailure(String errorMessage, String displayMessage) {
        WritableNativeMap eventData = new WritableNativeMap();
        eventData.putString("message", "err" + errorMessage);

        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("navigation", eventData);
        dismissGetRouteProgress();
    }

    @ReactProp(name = "navigation")
    public void navigationPreview(MapView mapView, boolean startNavigation) {

        if (mapView != null && startNavigation) {

            createDummyView();

            int viewIds = DUMMY_VIEW_IDS;

            // Handle success
            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putString("message", "shared Directions" + SharedDirections.getSharedArray());

            routeInstructionsDisplay = SharedDirections.getSharedArray();
            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
            int routeIndex = 0;
            directions.getInstance().getRouteInstructions(routeIndex);
            RouteCount routeCount = directions.getInstance().getPrimaryRoute();
            // Log.e("NENative", "RC: " + routeCount.getRouteCount() + " sel route " +
            // routeCount.getSelectedRoute());
            int[] padding = { 50, 20, 30, 40 };
            directions.getInstance().zoomRoute(padding, 1, -1);
            if (mapController != null)
                mapController.setCurrentLocationEnabled(true);
            NavigationMode mode = NavigationMode.SIMULATE;
            // if(navMode.equals("realtime")){
            // mode = NavigationMode.REALTIME;
            // }else{
            // mode = NavigationMode.SIMULATE;
            // }
            startNavigation(reactNativeContext.getCurrentActivity(), viewIds, mode,
                    new NavigationEndListener() {
                        @Override
                        public void onNavigationEnd() {
                            // Handle navigation end
                            WritableNativeMap eventData = new WritableNativeMap();
                            eventData.putString("message", "navigation end");
                            if (mapController != null) {
                                Log.e("NENative", "Called navigation end reset cllbacks");
                                mapController.setRouteCallback(getRouteCallback());
                            }
                            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                    .emit("navigation", eventData);
                        }
                    });

        } else if (mapController != null) {
            mapController.setCurrentLocationEnabled(true);
        } else {
            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putString("message", "err mapview is null");

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
        }

    }

    private void showGetRouteProgress() {
        System.out.println("getting gert route progress");
    }

    public void startNavigation(Activity activity, int viewIds, NavigationMode navigationMode,
            NavigationEndListener navigationEndListener) {
        WritableNativeMap eventData = new WritableNativeMap();
        eventData.putString("message", "insdie start navigation" + mapView);

        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("navigation", eventData);
        Log.e("Status", "Navigation start called");
        launchNavigation(activity, navigationMode, new NavigationEndListener() {
            @Override
            public void onNavigationEnd() {
                // Handle navigation end
                Log.e("Status", "Navigation end called");
                WritableNativeMap eventData = new WritableNativeMap();
                eventData.putString("message", "navigation end");
                if (mapController != null) {
                    Log.e("NENative", "Called navigation end reset cllbacks");
                    mapController.setRouteCallback(getRouteCallback());
                }
                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("navigationEnd", eventData);
            }
        },
                new ProgressChangeListener() {
                    @Override
                    public void onProgressChange(Location location, NavigationStatus navigationStatus) {
                        Log.e("Status", "Progress called now");
                        // Add your logic for handling progress changes here
                        WritableNativeMap eventData = new WritableNativeMap();
                        float distance = navigationStatus.getRemainingRouteDistance();
                        float duration = navigationStatus.getRemainingRouteDuration();
                        eventData.putDouble("distance", distance);
                        eventData.putDouble("duration", duration);

                        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onNavigationDistanceChange", eventData);

                    }
                }, viewIds);
    }

    @ReactMethod
    public View getDummyView() {
        return dummyView;
    }

    @ReactMethod
    public void createDummyView() {
        if (reactNativeContext.getCurrentActivity() != null) {
            // Create a FrameLayout container for the dummy view
            FrameLayout container = new FrameLayout(reactNativeContext);
            container.setId(DUMMY_VIEW_IDS); // Set a unique ID
            ViewGroup reactNativeView = (ViewGroup) mapView; // Replace 'mapView' with your actual view reference

            ViewGroup parentView = (ViewGroup) reactNativeView.getParent();
            if (parentView == null) {
                Log.e("ERROR", "Parent view is null");
                return;
            }
            int parentHeight = parentView.getHeight();

            // Calculate 100% of the parent view's height in pixels
            int desiredHeightInPixels = parentHeight;
            FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    desiredHeightInPixels // Height in pixels, set to full parent height
            );

            container.setLayoutParams(layoutParams);

            // Create the dummy view
            View dummyView = new View(reactNativeContext.getCurrentActivity());

            // Add the dummy view to the container
            container.addView(dummyView);
            SharedDirections.setCurrentActivity(reactNativeContext.getCurrentActivity());

            // Add the container as a child of your React Native component's view
            reactNativeView.addView(container);
        }
    }

    @ReactMethod
    private void moveToNextWaypoint() {
        Log.e("ERROR", "Calling");
        Navigator.getInstance().updateToNextNavLeg();
    }

    @ReactMethod
    private void endNavigation() {

        Activity currentActivity = SharedDirections.getCurrentActivity();
        if (currentActivity == null) {
            return;
        }
        currentActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (NENativeNavigationFragment.getInstance() != null) {
                    NENativeNavigationFragment.getInstance().onBackPressed(false);
                }
            }
        });
    }

    private void launchNavigation(Activity activity, NavigationMode navigationMode,
            NavigationEndListener navigationEndListener, ProgressChangeListener progressChangeListener, int viewIds) {

        ViewGroup reactNativeView = reactNativeContext.getCurrentActivity().findViewById(viewIds);
        WritableNativeMap eventData = new WritableNativeMap();
        eventData.putString("message", "insdie lunch navigation" + mapView);

        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("navigation", eventData);
        boolean enableDebugInfo = false;
        boolean enablePoorGPSSimulation = false;
        String locationProvider = "auto";
        ProviderType providerType = ProviderType.AUTO;
        if (locationProvider.equals("android")) {
            providerType = ProviderType.ANDROID;
        } else if (locationProvider.equals("ne")) {
            providerType = ProviderType.NE_FUSED;
        }
        MapController.MapStyle mapStyle = MapController.MapStyle.DAY;
        CameraPosition cameraPosition = new CameraPosition();
        // TODO : issue in updating the current location

        // TODO : issue - real time navigation, route found between two different point,
        // navigation camera zoom to user location, but is not rerouteing from current
        // location
        // TODO : in map box - it's rerouting from current location.
        LngLat origin = new LngLat(77.181608, 8.341317);
        cameraPosition.longitude = origin.longitude;
        cameraPosition.latitude = origin.latitude;
        cameraPosition.zoom = 15;
        double gpsReliability = 0.7;
        double navPrecision = 100;

        if (settingsProps != null) {

            switch (settingsProps.get("gpsReliability")) {
                case "High":
                    gpsReliability = 0.7;
                    break;
                case "Medium":
                    gpsReliability = 0.5;
                    break;
                case "Low":
                    gpsReliability = 0.3;
                    break;
            }

            switch (settingsProps.get("navAccuracy")) {
                case "High":
                    navPrecision = 100;
                    break;
                case "Medium":
                    navPrecision = 50;
                    break;
                case "Low":
                    navPrecision = 10;
                    break;
            }
        }

        eventData = new WritableNativeMap();
        eventData.putString("message", "before  start navigation" + mapView);

        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("navigation", eventData);
        String directionCriteria = DirectionsCriteria.KILOMETERS;
        NavigationLauncherOptions options = NavigationLauncherOptions.builder()
                .directionsRoute(routeInstructionsDisplay)
                // .shouldSimulateRoute(simulateRoute)
                .enable3dBuildingVisibility(false)
                .setMapStyle(mapStyle)
                .setNavigationMode(navigationMode)
                .setLanguageCode(settingsProps.get("language"))
                .initialMapCameraPosition(cameraPosition)
                .extrusionVisibility(false)
                // .enableDebugInfoView(enableDebugInfo)
                .enablePoorGPSSimulation(enablePoorGPSSimulation)
                .providerType(providerType)
                .distanceUnit(directionCriteria)
                .legIsManuallyProvided(false)
                .gpsReliability(gpsReliability)
                .navPrecision(navPrecision)
                .build();
        // Call this method with Context from within an Activity
        if (mapView != null) {
            createDummyView();

            NavigationLauncher.startNavigation(
                    activity,
                    reactNativeView,
                    mapView,
                    mapController,
                    navigationEndListener,
                    new NavigationRateListener() {
                        @Override
                        public void onSendRating(float rating) {

                        }
                    },
                    new ProgressChangeListener() {
                        @Override
                        public void onProgressChange(Location location, NavigationStatus navigationStatus) {
                            WritableNativeMap eventData = new WritableNativeMap();
                            WritableArray locationArray = Arguments.createArray();
                            locationArray
                                    .pushDouble(navigationStatus.getLocation().getCoordinate().coordinates().get(1));
                            locationArray
                                    .pushDouble(navigationStatus.getLocation().getCoordinate().coordinates().get(0));
                            float remainingDistance = navigationStatus.getRemainingRouteDistance();
                            float remainingDuration = navigationStatus.getRemainingRouteDuration();
                            float ldistance = navigationStatus.getRemainingLegDistance();
                            float lduration = navigationStatus.getRemainingRouteDuration();
                            float speed = navigationStatus.getLocation().getSpeed();
                            float legIndex = navigationStatus.getLegIndex();
                            float bearing = navigationStatus.getLocation().getBearing();
                            locationArray.pushDouble(remainingDistance);
                            locationArray.pushDouble(remainingDuration);
                            locationArray.pushDouble(speed);
                            locationArray.pushDouble(ldistance);
                            locationArray.pushDouble(lduration);
                            locationArray.pushDouble(legIndex);
                            locationArray.pushDouble(bearing);

                            eventData.putArray("location", locationArray);

                            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                    .emit("navigationLocation", eventData);

                            // Add your logic for handling progress changes here
                        }
                    }, options);
            eventData = new WritableNativeMap();
            eventData.putString("message", "err mapview is null");

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onNavigationReady", eventData);

        } else {
            eventData = new WritableNativeMap();
            eventData.putString("message", "err mapview is null");

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
        }
        // Utils.setIsNavigationVoiceCommand(false);
    }

    public List<RoutePointData> getSelectedRoutePointsList() {
        return selectedRoutePoints;
    }

    private void getSimulateCameraPosition(CameraPosition cameraPosition) {
        Coordinate coordinate = getSelectedRoutePointsList().get(0).getPlaceCoordinate();
        cameraPosition.latitude = coordinate.getLatitude();
        cameraPosition.longitude = coordinate.getLongitude();
        cameraPosition.zoom = 16;
    }

    private void dismissGetRouteProgress() {
        System.out.println("dismissing");

    }
}
