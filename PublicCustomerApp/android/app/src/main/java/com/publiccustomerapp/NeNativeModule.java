package com.publiccustomerapp;

import android.content.Context;
import android.content.DialogInterface;
import android.graphics.PointF;
import android.location.Location;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;
import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;
import com.facebook.react.bridge.Promise;

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
import com.virtualmaze.bundle_downloader.NENativeMap;
import com.virtualmaze.bundle_downloader.listener.NENativeDownloadListener;
import com.virtualmaze.bundle_downloader.utils.ProgressType;
import androidx.appcompat.app.AlertDialog;
import com.facebook.react.bridge.ReadableType;
import com.dot.nenativemap.search.SearchResultCallback;
import com.dot.nenativemap.search.SearchResponse;

// import com.dot.nenativemap.search.Search;
// import com.dot.nenativemap.search.SearchResultCallback;
// import com.dot.nenativemap.search.SearchResponse;
// import com.dot.nenativemap.search.SearchData;
// import com.dot.nenativemap.search.PlaceName;
// import com.dot.nenativemap.search.AreaName;
// import com.dot.nenativemap.search.Coordinates;
// import com.dot.nenativemap.search.Postcode;
// import com.dot.nenativemap.search.StreetName;
// import com.dot.nenativemap.search.SearchPOIConstant;

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

import com.dot.nenativemap.search.SearchResultCallback;
import com.dot.nenativemap.search.Search;
import com.dot.nenativemap.search.SearchData;
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
            Log.e("onMapClick", "message" + eventData);
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

        if (settingsProps != null) {
            boolean enable3D = Boolean.parseBoolean(settingsProps.get("enable3D"));
            MapController.enable3dBuildingsVisibility(enable3D);

            boolean enableExtrusions = Boolean.parseBoolean(settingsProps.get("enableExtrusions"));
            MapController.enableExtrusionsVisibility(enableExtrusions);
        }

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


                        if(settingsProps != null) {
                            String language = settingsProps.get("language");
                            if(language != null) {
                                mapController.setMapLangCode(language);
                            }
                            String mapStyleString = Boolean.parseBoolean(settingsProps.get("enableDarkTheme")) ? "NIGHT2" : "DAY2";
                            MapController.MapStyle mapStyle = MapController.MapStyle.valueOf(mapStyleString);
                            mapController.setMapStyle(mapStyle);
                        }

                        mapController.setMapChangeListener(new MapChangeListener() {
                            @Override
                            public void onViewComplete() {

                            }

                            @Override
                            public void onRegionWillChange(boolean b) {

                            }

                            @Override
                            public void onRegionIsChanging() {

                                float rotation = (float) Math.toDegrees(mapController.getCameraPosition().getRotation());

                                WritableMap eventData = Arguments.createMap();
                                eventData.putDouble("rotation", rotation);
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onMapRotationChanged", eventData);

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

    @ReactProp(name = "settingsProps")
    public void setSettingsProps(MapView mapView, ReadableMap settingsProps) {
        Log.e("SettingsProps", " " + settingsProps);
        if (settingsProps != null) {
            ReadableMapKeySetIterator iterator = settingsProps.keySetIterator();
            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();
                if (settingsProps.getType(key) == ReadableType.Boolean) {
                    boolean value = settingsProps.getBoolean(key);
                    this.settingsProps.put(key, String.valueOf(value));
                } else if (settingsProps.getType(key) == ReadableType.String) {
                    String value = settingsProps.getString(key);
                    this.settingsProps.put(key, value);
                }
            }
            // if(mapController != null)
            // mapController.setMapLangCode(this.settingsProps.get("language"));
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
            
            search.getInstance().init(
                mapController, pathPrefix, searchFilePaths);
        } else {
            Log.e("Search", "Error in initSearch: search or mapController is null");
        }
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


    private void emitErrorEvent(String errorMessage) {
        WritableMap eventData = Arguments.createMap();
        eventData.putString("error", errorMessage);
        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSearchPOIError", eventData);
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
            Log.e("homeLocation", "location: " + location);
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
//                    .flat(true)
                    .title(title)
                    .style(StyleType.MARKER)
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
                        // mapController.NEMarkerSetAngle(marker, angle);
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
                // mapController.NEMarkerSetAngle(marker, angle);
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

            directions.getInstance().init(reactNativeContext, "ITC", "ITC", mapController.mapPointer);

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

            if (language.equals("en")) {
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
        if (mapView == null) {
            Log.e("ERROR", "MapView is null");
            return;
        }

        if (startNavigation) {
            createDummyView();

            int viewIds = DUMMY_VIEW_IDS;

            Log.e("DummyView", "Dummy view created with ID: " + viewIds);

            // Handle success
            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putString("message", "shared Directions" + SharedDirections.getSharedArray());

            routeInstructionsDisplay = SharedDirections.getSharedArray();
            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
            int routeIndex = 0;
            directions.getInstance().getRouteInstructions(routeIndex);
            RouteCount routeCount = directions.getInstance().getPrimaryRoute();
            int[] padding = { 50, 20, 30, 40 };
            directions.getInstance().zoomRoute(padding, 1, -1);
            if (mapController != null) {
                mapController.setCurrentLocationEnabled(true);
            }
            NavigationMode mode = NavigationMode.SIMULATE;

            startNavigation(reactNativeContext.getCurrentActivity(), viewIds, mode,
                    new NavigationEndListener() {
                        @Override
                        public void onNavigationEnd() {
                            // Handle navigation end
                            WritableNativeMap eventData = new WritableNativeMap();
                            eventData.putString("message", "navigation end");
                            if (mapController != null) {
                                Log.e("NENative", "Called navigation end reset callbacks");
                                mapController.setRouteCallback(getRouteCallback());
                                mapController.getTouchInput().setTapResponder(tapResponder);
                            }
                            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                    .emit("navigation", eventData);
                        }
                    });
        } else if (mapController != null) {
            mapController.setCurrentLocationEnabled(true);
        } else {
            WritableNativeMap eventData = new WritableNativeMap();
            eventData.putString("message", "err mapController is null");
            if(mapController != null) {
                mapController.getTouchInput().setTapResponder(tapResponder);
            }
            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("navigation", eventData);
        }
    }

    private void showGetRouteProgress() {
        System.out.println("getting gert route progress");
    }

    public void startNavigation(Activity activity, int viewIds, NavigationMode navigationMode,
            NavigationEndListener navigationEndListener) {
        if (activity == null) {
            Log.e("ERROR", "Activity is null");
            return;
        }

        WritableNativeMap eventData = new WritableNativeMap();
        eventData.putString("message", "inside start navigation" + mapView);

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
                    Log.e("NENative", "Called navigation end reset callbacks");
                    mapController.setRouteCallback(getRouteCallback());
                }
                if(mapController != null) {
                    mapController.getTouchInput().setTapResponder(tapResponder);
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
        Activity currentActivity = reactNativeContext.getCurrentActivity();
        if (currentActivity == null) {
            Log.e("ERROR", "Current activity is null");
            return;
        }

        currentActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    // Create a custom FrameLayout that handles React Native's layout requests
                    FrameLayout container = new FrameLayout(reactNativeContext) {
                        @Override
                        public void requestLayout() {
                            super.requestLayout();
                            post(measureAndLayout);
                        }

                        private final Runnable measureAndLayout = new Runnable() {
                            @Override
                            public void run() {
                                measure(
                                        MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                                        MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
                                layout(getLeft(), getTop(), getRight(), getBottom());
                            }
                        };
                    };
                    container.setId(DUMMY_VIEW_IDS); // Set a unique ID

                    // Check initialization of mapView
                    if (mapView == null) {
                        Log.e("ERROR", "mapView is null. Cannot create dummy view.");
                        return;
                    }

                    ViewGroup reactNativeView = (ViewGroup) mapView;

                    // Ensure that mapView has a parent
                    ViewGroup parentView = (ViewGroup) reactNativeView.getParent();
                    if (parentView == null) {
                        Log.e("ERROR", "Parent view is null. Cannot add container.");
                        return;
                    }
                    View dummyView = new View(currentActivity);
                    FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT);
                    dummyView.setLayoutParams(layoutParams);
                    container.addView(dummyView);
                    reactNativeView.addView(container);
                    SharedDirections.setCurrentActivity(currentActivity);
                } catch (Exception e) {
                    Log.e("ERROR", "Error in createDummyView: " + e.getMessage());
                }
            }
        });
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
//        if(settingsProps != null) {
//            String mapStyleString = Boolean.parseBoolean(settingsProps.get("enableDarkTheme")) ? "NIGHT2" : "DAY2";
//            mapStyle = MapController.MapStyle.valueOf(mapStyleString);
//        }

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

    public static boolean isInternetAvailable(ThemedReactContext currentContext) {
        ConnectivityManager conectivityManager = (ConnectivityManager) currentContext
                .getSystemService(Context.CONNECTIVITY_SERVICE);// as ConnectivityManager
        NetworkInfo networkInfo = conectivityManager.getActiveNetworkInfo();
        if (networkInfo != null) {
            if (networkInfo.getType() == ConnectivityManager.TYPE_WIFI) {
                return networkInfo.isAvailable();
            } else if (networkInfo.getType() == ConnectivityManager.TYPE_MOBILE) {
                return networkInfo.isAvailable();
            }
        }
        return false;
    }
    @ReactProp(name = "offlineMap")
    public void startDownloadOfflineMap(MapView mapView, boolean offlineMap) {
        if (offlineMap) {
            if (!isInternetAvailable(reactNativeContext)) {
                WritableNativeMap eventData = new WritableNativeMap();
                eventData.putString("message", "No internet connection");
                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onDownloadFailed", eventData);
                return;
            }
            try {
                NENativeMap.getInstance().initializeOfflineFilesDownload(reactNativeContext,
                        NENativeMap.OfflineType.ALL, true, new NENativeDownloadListener() {
                            @Override
                            public void onDownloading(int progressValue, ProgressType progressType,
                                    String progressData) {
                                WritableNativeMap eventData = new WritableNativeMap();
                                eventData.putInt("progressValue", progressValue);
                                eventData.putString("progressType", progressType.toString());
                                eventData.putString("progressData", progressData);
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onDownloading", eventData);
                            }

                            @Override
                            public void onDownloadFailed(String message) {
                                Log.e("Download failed", "offline file download failed " + message);
                                WritableNativeMap eventData = new WritableNativeMap();
                                eventData.putString("message", "Download failed" + "\n\n" + message);
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onDownloadFailed", eventData);
                            }

                            @Override
                            public void onDownloadFinished() {
                                WritableNativeMap eventData = new WritableNativeMap();
                                eventData.putString("message", "Download finished");
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onDownloadFinished", eventData);
                            }
                        });
            } catch (Exception e) {
                Log.e("Download failed", e.toString());
            }
        }
    }
    @ReactMethod
    public void search(
            double CURRENT_LATITUDE,
            double CURRENT_LONGITUDE,
            String searchString,
            String mapUnitName,
            com.facebook.react.bridge.ReadableMap stateVectorForMatches,
            int resultCount,
            String lang_code,
            boolean debug,
            boolean onlineOnly,
            boolean makeFullSearch,
            boolean isPoiSearch,
            double radius,
            String category,
            Promise promise
    ) {
        Log.d("AJIN","SEARCH CALL MADE");
        Log.d("AJIN", "CURRENT_LATITUDE: " + CURRENT_LATITUDE);
        Log.d("AJIN", "CURRENT_LONGITUDE: " + CURRENT_LONGITUDE);
        Log.d("AJIN", "searchString: " + searchString);
        Log.d("AJIN", "mapUnitName: " + mapUnitName);
        Log.d("AJIN", "resultCount: " + resultCount);
        Log.d("AJIN", "lang_code: " + lang_code);
        Log.d("AJIN", "debug: " + debug);
        Log.d("AJIN", "onlineOnly: " + onlineOnly);
        Log.d("AJIN", "makeFullSearch: " + makeFullSearch);
        Log.d("AJIN", "isPoiSearch: " + isPoiSearch);
        Log.d("AJIN", "radius: " + radius);
        Log.d("AJIN", "category: " + category);

        SearchResultCallback searchResultCallback = new SearchResultCallback() {
            @Override
            public void onSuccess(SearchResponse result) {
                Log.d("AJIN", "result come");
                WritableMap map = Arguments.createMap();
                SearchData searchData = result.getSearchData();
                map.putMap("searchData", SearchDataConverter.toReadableMap(searchData));
                map.putString("mapUnitName", mapUnitName);
                map.putString("searchString", searchString);
                Log.d("AJIN", "Search result map: " + map.toString());
                promise.resolve(map);

            }

            @Override
            public void onFailure(SearchResponse error) {
                Log.d("AJIN", "result failed"+ error);
//                promise.reject("Search failed", (WritableMap) error);

            }

            @Override
            public void onCancelled(SearchResponse searchResponse) {
                Log.d("AJIN", "result onCancelled"+ searchResponse);
            }
        };

        // Check if stateVectorForMatches is null
        Map<String, List<Object>> sv = new HashMap<>();
        if (stateVectorForMatches != null) {
            ReadableMapKeySetIterator iterator = stateVectorForMatches.keySetIterator();

            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();
                ReadableArray array = stateVectorForMatches.getArray(key);
                List<Object> values = new ArrayList<>();
                for (int i = 0; i < array.size(); i++) {
                    switch (array.getType(i)) {
                        case String:
                            values.add(array.getString(i));
                            break;
                        case Number:
                            values.add(array.getDouble(i));
                            break;
                        case Boolean:
                            values.add(array.getBoolean(i));
                            break;
                    }
                }
                sv.put(key, values);
            }
        } else {
            Log.d("AJIN", "stateVectorForMatches is null");
        }

        Search.getInstance().handleSearchRequest(
                mapUnitName,
            searchString, 
            sv,
            resultCount, 
            lang_code,
            CURRENT_LATITUDE, 
            CURRENT_LONGITUDE, 
            debug,
            onlineOnly,
            makeFullSearch,
            isPoiSearch,
            radius,
            category,
            searchResultCallback);
    }

    @ReactMethod
    public void removeStateVector(String key, int index) {
        Search.getInstance().removeStateVector(key, (long)index);
    }


    @ReactMethod
    public void clearStateVector() {
        Search.getInstance().clearStateVector();
    }

}
