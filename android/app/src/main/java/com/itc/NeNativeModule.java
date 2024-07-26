package com.itc;

import android.graphics.PointF;
import android.graphics.Rect;
import android.location.Location;
import android.util.Log;
import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import com.dot.nenativemap.CameraUpdateFactory;
import com.dot.nenativemap.MarkerPickListener;
import com.dot.nenativemap.MarkerPickResult;
import com.dot.nenativemap.TouchInput;
import com.facebook.react.bridge.WritableArray;
import com.dot.nenativemap.OnMarkerCreateListener;
import com.dot.nenativemap.annotations.CircleOptions;
import com.dot.nenativemap.annotations.PolylineOptions;
import com.facebook.react.bridge.Arguments;
// import com.dot.nenativemap.search.SearchResultCallback;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.LifecycleEventListener;
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
import com.dot.nenativemap.directions.Directions;
import com.dot.nenativemap.directions.RouteInstructionsDisplay;
import com.dot.nenativemap.directions.VHRoutingRequest;
import com.dot.nenativemap.directions.DirectionsCriteria;
import java.util.HashMap;
import java.util.Map;
import com.dot.nenativemap.directions.RouteResponse;
import com.dot.nenativemap.directions.RouteCount;
import com.dot.nenativemap.directions.RouteCallback;
import com.dot.nenativemap.navigation.NavigationMode;
import com.dot.nenativemap.navigation.NavigationStatus;
import com.dot.nenativemap.navigation.Navigator;

import com.nenative.services.android.navigation.ui.v5.NENativeNavigationFragment;
import com.nenative.services.android.navigation.ui.v5.NavigationEndListener;
import com.nenative.services.android.navigation.ui.v5.NavigationRateListener;
import com.nenative.services.android.navigation.ui.v5.NavigationLauncher;
import com.nenative.services.android.navigation.ui.v5.NavigationLauncherOptions;
import com.nenative.services.android.navigation.ui.v5.utils.Coordinate;
import com.nenative.services.android.navigation.ui.v5.utils.RoutePointData;
import com.nenative.services.android.navigation.v5.routeprogress.ProgressChangeListener;
import com.virtualmaze.ne_location_management.location.ProviderType;
import com.dot.nenativemap.CameraUpdate;
import com.dot.nenativemap.CameraUpdateFactory;
import com.nenative.services.android.navigation.v5.utils.LocaleUtils;
import com.dot.nenativemap.OnMarkerCreateListener;
import com.dot.nenativemap.annotations.StyleType;
// import com.dot.nenativemap.annotations.PolylineOptions;
// import com.dot.nenativemap.search.Search;
// import com.dot.nenativemap.search.SearchResponse;
// import com.dot.nenativemap.search.SearchPOIConstant;
// import com.nenative.geocoding.GeocoderCriteria;
// import com.nenative.geocoding.offline_core.model.BoundingBox;

public class NeNativeModule extends ViewGroupManager<MapView> implements LifecycleEventListener {
    public static final String REACT_CLASS = "NeNativeModule";
    private MapView mapView;
    private MapController mapController;
    public ThemedReactContext reactNativeContext;

    private ThemedReactContext reactNavigationContext;
    private Set<Polyline> addedPolylines = new HashSet<>();
    private Directions directions;
    private RouteInstructionsDisplay routeInstructionsDisplay;
    private Navigator navigator;
    boolean isNavMode = false;
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

    private final TouchInput.DoubleTapResponder doubleTapResponder = new TouchInput.DoubleTapResponder() {
        @Override
        public boolean onDoubleTap(float v, float v1) {
            mapController.pickMarker(v, v1);
            LngLat tappedPoint = mapController.screenPositionToLngLat(new PointF(v, v1));
            double longitude = tappedPoint.longitude;
            double latitude = tappedPoint.latitude;
            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putDouble("longitude", longitude);
            eventData.putDouble("latitude", latitude);

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onMapDblclick", eventData);
            return false;
        }
    };

    private final TouchInput.TapResponder tapResponder = new TouchInput.TapResponder() {
        @Override
        public boolean onSingleTapUp(float x, float y) {
            return false;
        }

        // on mapclick get the coordinates and emit event to react-native layer
        @Override
        public boolean onSingleTapConfirmed(float x, float y) {
            Log.d("AJIN", "onSingleTapConfirmed " + x + " " + y);
            mapController.pickMarker(x, y);
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
        // Handle resume event, e.g.,
        if (mapView != null) {
            mapView.onResume();
            Log.d("TEST", "onHostResume");
        }

    }

    @ReactMethod
    public void pauseMap() {
        if (mapView != null) {
            mapView.onPause();
            Log.d("TEST", "pauseMap");
        }
    }

    @ReactMethod
    public void resumeMap() {
        if (mapView != null) {
            mapView.onResume();
            Log.d("TEST", "resumeMap");
        }
    }

    @Override
    public void onHostPause() {
        if (mapView != null) {
            mapView.onPause();
            Log.d("TEST", "onHostPause");
        }

    }

    @Override
    public void onHostDestroy() {
        // Handle destroy event, e.g., mapView.onDestroy();
        if (mapView != null) {
            mapView.onDestroy();
            mapView = null;
            mapController = null;
            addedMarkers = Collections.newSetFromMap(new ConcurrentHashMap<>());
            Log.d("TEST", "onHostDestroy");
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
                        mapController.getTouchInput().setDoubleTapResponder(doubleTapResponder);
                        mapController.setAllowConcurrentMultipleOpenInfoWindows(true);

                        // Map is ready, perform any necessary operations
                        mapCtrler.setMinimumZoomLevel(1.0f);
                        mapCtrler.setMaximumZoomLevel(22.0f);
                        mapCtrler.setMapMode(MapController.MapMode.ONLINE);
                        // mapCtrler.setCurrentLocationEnabled(true);
                        LngLat origin = new LngLat(77.181608, 8.341317);
                        CameraPosition camera = mapCtrler.getCameraPosition();
                        camera.longitude = origin.longitude;
                        camera.latitude = origin.latitude;
                        camera.zoom = 12;
                        mapCtrler.flyToCameraPosition(camera, 2000, null);

                        // mapCtrler.requestRender();
                        mapCtrler.setSceneLoadListener(new MapController.SceneLoadListener() {
                            @Override
                            public void onSceneReady(int sceneId, SceneError sceneError) {
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onMapReady", new WritableNativeMap());
                            }
                        });
                        MapController.MapStyle mapStyle = MapController.MapStyle.DAY2;
                        mapCtrler.setMapStyle(mapStyle);

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

                        mapCtrler.setMarkerPickListener(
                                new MarkerPickListener() {
                                    @Override
                                    public void onMarkerPick(MarkerPickResult markerPickResult, float v, float v1) {
                                        Log.d("AJIN", "MARKERPICK");
                                        if (markerPickResult == null || markerPickResult.getMarker() == null)
                                            return;
                                        Marker marker = markerPickResult.getMarker();
                                        if (marker == null) {
                                            return;
                                        }
                                        MarkerData userData = (MarkerData) marker.getUserData();
                                        String markerId = userData.getId();
                                        WritableNativeMap eventData = new WritableNativeMap();
                                        eventData.putString("id", markerId);
                                        Log.d("AJIN", "Marker PICK DONE EMMITED");
                                        reactNativeContext
                                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                                .emit("onMarkerClick", eventData);

                                    }
                                });
                    }

                }

        );
        return mapView;
    }

    @ReactProp(name = "mode")
    public void setMode(MapView mapView, String mode) {
        if (mapController != null) {
            String mapStyleString = mode.equals("light") ? "DAY2" : "NIGHT2";
            MapController.MapStyle mapStyle = MapController.MapStyle.valueOf(mapStyleString);
            Log.d("AJIN", "mapStyle " + mapStyle);
            mapController.setMapStyle(mapStyle);
        }
    }

    // @ReactProp(name = "SearchResultCallback")
    // public void setSearchCall(MapView mapView, String searchText) {
    // Log.d("AJIN", "searchResult " + searchText);

    // Context mContext = reactNativeContext.getApplicationContext();
    // int poiCategoryID = -1; // Assuming default category, adjust if needed
    // BoundingBox boundingBox = null; // Assuming no bounding box, adjust if needed

    // callAutocomplete(mContext, searchText, poiCategoryID, boundingBox);
    // }

    // private void callAutocomplete(Context mContext, String searchString, int
    // poiCategoryID, BoundingBox boundingBox) {
    // String language = "en";

    // double CURRENT_LATITUDE = 24.450288;
    // double CURRENT_LONGITUDE = 54.381127;

    // if(Utils.getMapCenterPoint() != null) {
    // CURRENT_LATITUDE = Utils.getMapCenterPoint().latitude;
    // CURRENT_LONGITUDE = Utils.getMapCenterPoint().longitude;
    // }

    // // cancelAutoComplete();

    // String SearchType = "";
    // int limit = 15;
    // if(poiCategoryID != -1) {
    // SearchType = GeocoderCriteria.TYPE_POI;
    // limit = 20;
    // } else {
    // SearchType = GeocoderCriteria.TYPE_AUTOCOMPLETE;
    // limit = 50;
    // }
    // com.dot.nenativemap.search.SearchResultCallback searchResultCallback = new
    // com.dot.nenativemap.search.SearchResultCallback() {
    // @Override
    // public void onSuccess(SearchResponse result) {
    // List<VMSearchData> searchData = getResults(result);
    // listener.onSuccess(searchData, loadType);
    // Log.e("Search result", result.getStatus());

    // WritableNativeMap searchResult = new WritableNativeMap();
    // searchResult.putString("searchText", searchString);
    // searchResult.putString("status", result.getStatus());
    // // Add more data to searchResult as needed

    // reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
    // .emit("onSearchResult", searchResult);
    // }

    // @Override
    // public void onFailure(SearchResponse error) {
    // if (error != null) {
    // listener.onFailed(error.getDisplayMessage());
    // Log.e("Search error", error.getErrMessage());

    // WritableNativeMap searchResult = new WritableNativeMap();
    // searchResult.putString("searchText", searchString);
    // searchResult.putString("error", error.getDisplayMessage());

    // reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
    // .emit("onSearchResult", searchResult);
    // } else {
    // listener.onFailed("");
    // }
    // }
    // };
    // HashMap<String, String> searchFilters = new HashMap<>();
    // String poiFilters =
    // getOnlinePOICategoryFilter(SearchPOIConstant.getOnlinePOIFilter(poiCategoryID)).toString();
    // Log.d("NESearch", poiFilters);
    // String query = Search.getInstance().buildPOISearchRequest("southern-zone",
    // CURRENT_LATITUDE, CURRENT_LONGITUDE, poiFilters, language, 95, 5000, limit,
    // false);
    // Search.getInstance().getSearchAsync(query, false, searchResultCallback);

    // sendFireBaseAnalytics(AnalyticsConstants.EVENT_SERVER_CALL,
    // AnalyticsConstants.getAnalyticsBundle("POI Search(POIS)",
    // "POIS Called(C)", "POIS_C - mode : " + GeocoderCriteria.MODE_HYBRID));
    // }

    @ReactProp(name = "homeLocation")
    public void setHomeLocation(MapView mapView, ReadableArray location) {
        if (mapController != null && location != null) {

            ReadableMap homeLocation = location.getMap(0);
            CameraPosition camera = mapController.getCameraPosition();
            float cameraZoom = camera.getZoom();
            double zoom = homeLocation.getDouble("zoom");
            double maxZoom = homeLocation.hasKey("maxZoom") ? homeLocation.getDouble("maxZoom") : 0.0;
            if (maxZoom > 0 && cameraZoom > 16.0) {
                zoom = (double) cameraZoom;
            }
            camera.longitude = homeLocation.getDouble("lng");
            camera.latitude = homeLocation.getDouble("lat");
            camera.zoom = (float) zoom;
            mapController.flyToCameraPosition(camera, 500, null);
        }

    }

    public void onDropViewInstance(MapView view) {
        if (mapController != null) {
            mapView.onDestroy(); // For example, to clean up the MapView
            mapController = null;
            mapView = null;

        }

    }

    @ReactProp(name = "markers")
    public synchronized void setMarkers(MapView mapView, ReadableArray markers) {
        Log.d("AJIN", "setMarkers ");
        if (mapController == null) {
            return;
        }
        if (markers == null) {
            Log.d("AJIN", "Markers null");
            mapController.removeAllMarkers();
            synchronized (addedMarkers) {
                addedMarkers.clear();
            }
            return;
        }
        if (markers.size() == 0) {
            mapController.removeAllMarkers();
            synchronized (addedMarkers) {
                addedMarkers.clear();
            }
            return;
        }
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
            String title = markerData.getString("title");
            String snippet = markerData.getString("snippet");
            int angle = markerData.getInt("angle");
            Marker marker = findMarkerWithId(markerId);
            MarkerOptions markerOptions = new MarkerOptions()
                    .name(markerId)
                    .position(new LngLat(longitude, latitude))
                    .size(markerSize)
                    .interactive(true)
                    .rotation(angle)
                    .flat(true)
                    .title(title)
                    .texture(markerType);
            if (marker == null) {
                Log.d("AJIN", markerType);

                Log.d("AJIN", "new marker call");
                OnMarkerCreateListener onMarkerCreateListener = new OnMarkerCreateListener() {
                    @Override
                    public synchronized void onMarkerCreated(Marker marker) {
                        if (mapController == null)
                            return;
                        MarkerData userData = new MarkerData();
                        userData.setId(markerId);
                        marker.setUserData(userData);
                        synchronized (addedMarkers) {
                            addedMarkers.add(marker);
                        }
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
                marker.setPoint(new LngLat(longitude, latitude));
                if (isMarkerSelected) {
                    mapController.selectMarker(marker);
                } else {
                    mapController.deselectMarker(marker);
                }
                mapController.NEMarkerSetStyle(marker, markerOptions);
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

    private synchronized Marker findMarkerWithId(String id) {
        synchronized (addedMarkers) {
            for (Marker marker : addedMarkers) {
                MarkerData userData = (MarkerData) marker.getUserData();
                if (userData.getId().equals(id)) {
                    return marker;
                }
            }
        }
        return null;
    }

    public void renderPolyline(ReadableMap polyline) {
        if (mapController == null) {
            return;
        }

        ReadableArray coordinates = polyline.getArray("coordinates");
        String color = polyline.getString("color");
        int width = polyline.getInt("width");
        boolean focus = polyline.getBoolean("focus");
        ReadableArray margin = polyline.getArray("padding");

        List<LngLat> linePoints = new ArrayList<>();
        double minLat = Double.MAX_VALUE;
        double maxLat = Double.MIN_VALUE;
        double minLon = Double.MAX_VALUE;
        double maxLon = Double.MIN_VALUE;
        for (int j = 0; j < coordinates.size(); j++) {
            ReadableArray coordinate = coordinates.getArray(j);
            double latitude = coordinate.getDouble(1);
            double longitude = coordinate.getDouble(0);
            linePoints.add(new LngLat(longitude, latitude));
            if (latitude < minLat)
                minLat = latitude;
            if (latitude > maxLat)
                maxLat = latitude;
            if (longitude < minLon)
                minLon = longitude;
            if (longitude > maxLon)
                maxLon = longitude;
        }

        if (focus) {
            mapController.updateCameraPosition(
                    CameraUpdateFactory.newLngLatBounds(new LngLat(minLon, minLat), new LngLat(maxLon, maxLat),
                            new Rect(margin.getInt(0), margin.getInt(1), margin.getInt(2), margin.getInt(3))),
                    500);
        }

        PolylineOptions polylineOptions = new PolylineOptions()
                .addAll(linePoints)
                .color(color)
                .width(width);
        mapController.drawPolyLine(polylineOptions);
    }

    public void renderCircle(ReadableMap circle) {
        if (mapController == null) {
            return;
        }
        double lat = circle.getDouble("lat");
        double lng = circle.getDouble("lng");
        double radius = circle.getDouble("radius");
        boolean focus = circle.getBoolean("focus");
        ReadableArray margin = circle.getArray("padding");
        String fillColor = circle.getString("fillColor");
        LngLat center = new LngLat(lng, lat);
        CircleOptions circleOptions = new CircleOptions();

        circleOptions
                .radius(radius)
                .center(center)
                .fillColor(fillColor);
        List<LngLat> points = circleOptions.getPoints();
        double minLat = Double.MAX_VALUE;
        double maxLat = Double.MIN_VALUE;
        double minLon = Double.MAX_VALUE;
        double maxLon = Double.MIN_VALUE;
        for (int j = 0; j < points.size(); j++) {
            LngLat coordinate = points.get(j);
            double latitude = coordinate.latitude;
            double longitude = coordinate.longitude;
            if (latitude < minLat)
                minLat = latitude;
            if (latitude > maxLat)
                maxLat = latitude;
            if (longitude < minLon)
                minLon = longitude;
            if (longitude > maxLon)
                maxLon = longitude;
        }
        if (focus) {
            mapController.updateCameraPosition(
                    CameraUpdateFactory.newLngLatBounds(new LngLat(minLon, minLat), new LngLat(maxLon, maxLat),
                            new Rect(margin.getInt(0), margin.getInt(1), margin.getInt(2), margin.getInt(3))),
                    500);
        }
        mapController.drawCircle(circleOptions);
    }

    @ReactProp(name = "geometries")
    public void setGeometries(MapView mapView, ReadableArray geometries) {
        if (mapController == null)
            return;
        if (geometries == null) {
            mapController.clearLines();
            return;
        }
        mapController.clearLines();
        for (int i = 0; i < geometries.size(); i++) {
            // Parse polyline object data from the prop
            ReadableMap geometry = geometries.getMap(i);
            String type = geometry.getString("type");
            Log.d("AJIN", type);
            if (type.equals("polyline")) {
                renderPolyline(geometry);
            } else if (type.equals("circle")) {
                renderCircle(geometry);
            }
        }
    }

    @ReactProp(name = "findRoute")
    public void findRoute(MapView mapView, ReadableArray locationArray) {
        if (mapView != null && locationArray != null && mapController != null) {

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
            eventData.putString("message", "caled navigation" + reactNativeContext + ",");

            directions = new Directions();
//            navigator = new Navigator();
            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
            showGetRouteProgress();
            mapController.setCurrentLocationEnabled(true);

            directions.getInstance().init(reactNativeContext, "southIndia", "southIndia", mapController.mapPointer);

            Log.e("crossaeas", "crosses direction instance ");
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
            Map<String, Object> directionsOptions = new HashMap<>();
            directionsOptions.put("units", "miles");
            eventData = new WritableNativeMap();

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("direction-init", eventData);
            Map<String, Object> autooptions = new HashMap<>();
            autooptions.put("use_highways", 0.5);
            autooptions.put("use_tolls", 0.5);
            autooptions.put("use_ferry", 0.5);
            autooptions.put("use_living_street", 0.1);
            VHRoutingRequest.CostingOptions costingOptions = VHRoutingRequest.CostingOptions
                    .builder()
                    .auto(autooptions)
                    .bicycle(autooptions)
                    .pedestrian(autooptions)
                    .build();
            VHRoutingRequest request = VHRoutingRequest.builder()
                    .locations(locations)
                    .costing(DirectionsCriteria.PROFILE_CAR)
                    .costing_options(costingOptions)
                    .alternates(2)
                    .language("en-US")
                    .units(DirectionsCriteria.KILOMETERS)
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

        if(locationArray == null && mapController!=null){
            mapController.setCurrentLocationEnabled(true);
        }
    }

    private void handleResponse(RouteResponse routeResponse) {
        if (routeResponse != null) {
            if (routeResponse.getRouteInstructions() != null) {
                Log.e("Success", "route instruvtion done");

                WritableNativeMap eventData = new WritableNativeMap();
                eventData.putString("message", "sucess got navigation response" + mapView);

                routeInstructionsDisplay = routeResponse.getRouteInstructions();
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

    public RouteCallback getRouteCallback() {
        return routeCallback;
    }

    private RouteCallback routeCallback = new RouteCallback() {
        @Override
        public void onSuccess(RouteResponse routeResponse) {
            handleResponse(routeResponse);
        }

        @Override
        public void onFailure(RouteResponse routeResponse) {
            return;
        }
    };

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

            // Calculate 90% of the parent view's height in pixels
            int desiredHeightInPixels = (int) (0.865 * parentHeight);
            FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    desiredHeightInPixels // Height in pixels, adjust as needed
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
                .setLanguageCode("en")
                .initialMapCameraPosition(cameraPosition)
                .extrusionVisibility(false)
                // .enableDebugInfoView(enableDebugInfo)
                .enablePoorGPSSimulation(enablePoorGPSSimulation)
                .providerType(providerType)
                .distanceUnit(directionCriteria)
                .legIsManuallyProvided(false)
//                .gpsReliability(0.7)
//                .navPrecision(100)
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
