package com.vmroutes;

import android.graphics.PointF;
import android.util.Log;
import android.app.Activity;

import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;

import com.dot.nenativemap.TouchInput;
import com.dot.nenativemap.annotations.PolylineOptions;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
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
import com.dot.nenativemap.navigation.NavigationMode;
import com.dot.nenativemap.navigation.NavigationStatus;
import com.dot.nenativemap.navigation.Navigator;
import com.dot.nenativemap.directions.Directions;
import com.dot.nenativemap.directions.DirectionsCriteria;
import com.dot.nenativemap.directions.RouteCallback;
import com.dot.nenativemap.directions.RouteCount;
import com.dot.nenativemap.directions.RouteInstructionsDisplay;
import com.dot.nenativemap.directions.VHRoutingRequest;

import com.nenative.services.android.navigation.ui.v5.NENativeNavigationFragment;
import com.nenative.services.android.navigation.ui.v5.NavigationEndListener;
import com.nenative.services.android.navigation.ui.v5.NavigationLauncher;
import com.nenative.services.android.navigation.ui.v5.NavigationLauncherOptions;
import com.nenative.services.android.navigation.ui.v5.utils.Coordinate;
import com.nenative.services.android.navigation.ui.v5.utils.RoutePointData;
import com.virtualmaze.ne_location_management.location.ProviderType;
//import androidx.test.espresso.Espresso;
//import androidx.test.espresso.matcher.ViewMatchers;
//import androidx.test.espresso.action.ViewActions;


import com.nenative.services.android.navigation.v5.utils.LocaleUtils;
// import com.dot.nenativemap.annotations.PolylineOptions;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import android.os.Handler;
import android.location.Location;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
//import androidx.test.espresso.Espresso;
//import androidx.test.espresso.ViewInteraction;
//import androidx.test.espresso.matcher.ViewMatchers;
//import androidx.test.espresso.action.ViewActions;
public class NeNativeNavigation extends ViewGroupManager<MapView> {
    public static final String REACT_CLASS = "NeNativeNavigation";
    private int mapLoaded = 1;
    private MapView mapView;
    private MapController mapController;
    public ThemedReactContext reactNativeContext;

    private ThemedReactContext reactNavigationContext;
    private List<Marker> addedMarkers = new ArrayList<>();
    private Set<Polyline> addedPolylines = new HashSet<>();

    private Directions directions;
    private RouteInstructionsDisplay routeInstructionsDisplay;
    private Navigator navigator;
    boolean isNavMode = false;
    Handler navHandler;
    Runnable navRunnable;
    private Location currentLocation;

    private LinearLayout parentLayout;
    private FrameLayout frameLayout;

    private FrameLayout container;
    private List<RoutePointData> selectedRoutePoints;
    private android.view.View dummyView; // Us
    private static final int DUMMY_VIEW_IDS = View.generateViewId();

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
    protected MapView createViewInstance(ThemedReactContext reactContext) {

        reactNativeContext = reactContext;
//        parentLayout = new LinearLayout(reactContext);
//        parentLayout.setOrientation(LinearLayout.VERTICAL);

        frameLayout = new FrameLayout(reactContext);
        mapView = new MapView(reactContext);
//        frameLayout.addView(mapView);
        frameLayout.addView(new View(reactContext.getCurrentActivity()));
        frameLayout.setId(DUMMY_VIEW_IDS);
        // Set any necessary state information in the savedInstanceState Bundle
//        parentLayout.addView(frameLayout);
        mapView.onCreate(null);

        mapView.getMapAsync(
                new MapReadyCallback() {
                    @Override
                    public void onMapReady(MapController mapCtrler) {

                        // set map controller
                        mapController = mapCtrler;
                        // set click listener
                        mapController.getTouchInput().setTapResponder(tapResponder);

                        // Map is ready, perform any necessary operations
                        Log.e("MAP LOADING DONE", mapCtrler.toString());
                        mapCtrler.setMinimumZoomLevel(7.0f);
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
                                reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                        .emit("onMapReady", new WritableNativeMap());

                                createDummyView();

                                findRoute(mapView);
                            }
                        });
                    }

                }

        );


        return mapView;
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

    public void onDropViewInstance(MapView mapView) {
        if (mapController != null) {
            // Release any resources here if needed
            mapView.onDestroy(); // For example, to clean up the MapView
            mapController = null;
            mapView = null;
            addedMarkers = new ArrayList<>();
            addedPolylines = new HashSet<>();
        }
    }

    @ReactProp(name = "markers")
    public void setMarkers(MapView mapView, ReadableArray markers) {
        if (mapController != null) {
            // MapController mapController = mapView.getMapController();

            if (markers != null) {
                // Create a set to track markers that need to be removed
                Set<Marker> markersToRemove = new HashSet<>(addedMarkers);

                for (int i = 0; i < markers.size(); i++) {
                    ReadableMap markerData = markers.getMap(i);

                    if (markerData != null) {
                        double latitude = markerData.getDouble("lat");
                        double longitude = markerData.getDouble("lng");
                        String markerId = markerData.getString("id");

                        LngLat lnglat = new LngLat(longitude, latitude);
                        MarkerOptions markerOptions = new MarkerOptions()
                                .position(new LngLat(longitude, latitude));
                        // .resource(R.drawable.ic_map_marker_24dp);

                        // Check if this marker is already in the collection, if so, remove it from
                        // markersToRemove

                        Marker existingMarker = null;// findMarkerWithId(markerId);
                        if (existingMarker != null) {
                            markersToRemove.remove(existingMarker);
                        } else {
                            // Marker doesn't exist in the collection, so add it to the map
                            Marker marker = mapController.addMarker(markerOptions);
                            MarkerData userData = new MarkerData();
                            userData.setId(markerId);
                            marker.setUserData(userData);
                            addedMarkers.add(marker);
                        }
                    }
                }

                // Remove markers that need to be removed
                for (Marker markerToRemove : markersToRemove) {
                    mapController.removeMarker(markerToRemove);
                    addedMarkers.remove(markerToRemove);
                }
            }
        }
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




    public void findRoute(MapView mapView) {
        if (mapView!=null) {
            int viewIds = DUMMY_VIEW_IDS;

                    // Handle success
                    WritableNativeMap eventData = new WritableNativeMap();
                    eventData.putString("message", "shared Directions" + SharedDirections.getSharedArray());

                    routeInstructionsDisplay= SharedDirections.getSharedArray();
                    reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("navigation", eventData);
                    int routeIndex = 0;
                    directions.getInstance().getRouteInstructions(routeIndex);
                    RouteCount routeCount = directions.getInstance().getPrimaryRoute();
                    //  Log.e("NENative", "RC: " + routeCount.getRouteCount() + " sel route " + routeCount.getSelectedRoute());
                    int[] padding = {50, 20, 30, 40};
                    directions.getInstance().zoomRoute(padding, 1, -1);
                    mapController.setCurrentLocationEnabled(false);

                    startNavigation(reactNativeContext.getCurrentActivity(),viewIds, NavigationMode.REALTIME, new NavigationEndListener() {
                        @Override
                        public void onNavigationEnd() {
                            // Handle navigation end
                            WritableNativeMap eventData = new WritableNativeMap();
                            eventData.putString("message", "navigation end");

                            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                    .emit("navigation", eventData);
                        }
                    });



               }


    }

    //    ProgressDialog progressDialog;
    private void showGetRouteProgress() {
        System.out.println("getting gert route progress");
//        progressDialog = new ProgressDialog(reactNativeContext);
//        progressDialog.setMessage("Finding Route");
//        progressDialog.setCancelable(false);
//        progressDialog.show();
    }
    public void startNavigation(Activity activity,int viewIds, NavigationMode navigationMode, NavigationEndListener navigationEndListener) {
        WritableNativeMap eventData = new WritableNativeMap();
        eventData.putString("message", "insdie start navigation" + mapView);

        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("navigation", eventData);
        launchNavigation(activity, navigationMode, navigationEndListener,viewIds);
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
            ViewGroup reactNativeView = (ViewGroup) mapView;  // Replace 'mapView' with your actual view reference

            ViewGroup parentView = (ViewGroup) reactNativeView.getParent();
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

            // Add the container as a child of your React Native component's view
            reactNativeView.addView(container);
        }
    }
    // @ReactMethod
    // private void endNavigation() {
    //     Activity currentActivity = reactNativeContext.getCurrentActivity();

    //     if (currentActivity != null) {
    //         currentActivity.runOnUiThread(new Runnable() {
    //             @Override
    //             public void run() {
    //                 if (NENativeNavigationFragment.getInstance() != null) {
    //                     NENativeNavigationFragment.getInstance().onBackPressed();
    //                 }
    //             }
    //         });
    //     }
    // }




    private void launchNavigation(Activity activity, NavigationMode navigationMode, NavigationEndListener navigationEndListener,int viewIds) {

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
//        if (Utils.getchangeMapMode(activity)) {
//            mapStyle = MapController.MapStyle.NIGHT;
//        }

        CameraPosition cameraPosition = new CameraPosition();
        //TODO : issue in updating the current location
        //TODO : issue - real time navigation, route found between two different point, navigation camera zoom to user location, but is not rerouteing from current location
        //TODO : in map box - it's rerouting from current location.
        LngLat origin = new LngLat(77.181608, 8.341317);
        cameraPosition.longitude = origin.longitude;
        cameraPosition.latitude = origin.latitude;
        cameraPosition.zoom = 15;

//        if (navigationMode == NavigationMode.SIMULATE) {
//            getSimulateCameraPosition(cameraPosition);
//        }
//        else {
//            Location currentLocation = location.getValue();
//            if (currentLocation != null) {
//                cameraPosition.latitude = currentLocation.getLatitude();
//                cameraPosition.longitude = currentLocation.getLongitude();
//                cameraPosition.zoom = 16;
//            } else {
//                getSimulateCameraPosition(cameraPosition);
//            }
//        }

        eventData = new WritableNativeMap();
        eventData.putString("message", "before  start navigation" + mapView);

        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("navigation", eventData);
        NavigationLauncherOptions options = NavigationLauncherOptions.builder()
                .directionsRoute(routeInstructionsDisplay)
                //.shouldSimulateRoute(simulateRoute)
                .enable3dBuildingVisibility(false)
                .setMapStyle(mapStyle)
                .setNavigationMode(navigationMode)
                .setLanguageCode("IN")
                .initialMapCameraPosition(cameraPosition)
                .extrusionVisibility(false)
                .enableDebugInfoView(enableDebugInfo)
                .enablePoorGPSSimulation(enablePoorGPSSimulation)
                .providerType(providerType)
                .build();
        // Call this method with Context from within an Activity
         if (mapView!=null) {
             createDummyView();
        NavigationLauncher.startNavigation(
                activity,
                reactNativeView,
                mapView,
                mapController,
                navigationEndListener,
                options);
             eventData = new WritableNativeMap();
             eventData.putString("message", "err mapview is null");

             reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                     .emit("onNavigationReady", eventData);

         }else{
               eventData = new WritableNativeMap();
                    eventData.putString("message", "err mapview is null");

            reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("navigation", eventData);
         }
//        Utils.setIsNavigationVoiceCommand(false);
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
