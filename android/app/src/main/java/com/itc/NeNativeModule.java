package com.itc;

import android.graphics.PointF;
import android.graphics.Rect;
import android.location.Location;
import android.util.Log;

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
import com.dot.nenativemap.OnMarkerCreateListener;
import com.dot.nenativemap.annotations.CircleOptions;
import com.dot.nenativemap.annotations.PolylineOptions;
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
// import com.dot.nenativemap.annotations.PolylineOptions;

public class NeNativeModule extends ViewGroupManager<MapView> implements LifecycleEventListener {
    public static final String REACT_CLASS = "NeNativeModule";
    private MapView mapView;
    private MapController mapController;
    public ThemedReactContext reactNativeContext;
    private Set<Marker> addedMarkers = Collections.newSetFromMap(new ConcurrentHashMap<>());

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
                                        Log.d("AJIN","MARKERPICK");
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
                                        reactNativeContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                                .emit("onMarkerClick", eventData);

                                    }
                                }
                        );
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

    @ReactProp(name = "homeLocation")
    public void setHomeLocation(MapView mapView, ReadableArray location) {
        if (mapController != null && location != null) {

            ReadableMap homeLocation = location.getMap(0);
            CameraPosition camera = mapController.getCameraPosition();
            float cameraZoom = camera.getZoom();
            double zoom = homeLocation.getDouble("zoom");
            double maxZoom = homeLocation.hasKey("maxZoom") ? homeLocation.getDouble("maxZoom") : 0.0;
            if(maxZoom>0 && cameraZoom>16.0){
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
        HashSet <Marker> currentMarkers = new HashSet<>();
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
            if(marker==null){
                Log.d("AJIN", markerType);

                Log.d("AJIN", "new marker call");
                OnMarkerCreateListener onMarkerCreateListener = new OnMarkerCreateListener() {
                    @Override
                    public synchronized void onMarkerCreated(Marker marker) {
                        if(mapController==null) return;
                        MarkerData userData = new MarkerData();
                        userData.setId(markerId);
                        marker.setUserData(userData);
                        synchronized (addedMarkers) {
                            addedMarkers.add(marker);
                        }
                        if (isMarkerSelected) {
                            mapController.selectMarker(marker);
                        }else{
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

            }else{
                marker.setPoint(new LngLat(longitude,latitude));
                if (isMarkerSelected) {
                    mapController.selectMarker(marker);
                }else{
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
        for(Marker marker : markersToRemove){
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
        if(mapController==null){
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
            if (latitude < minLat) minLat = latitude;
            if (latitude > maxLat) maxLat = latitude;
            if (longitude < minLon) minLon = longitude;
            if (longitude > maxLon) maxLon = longitude;
        }

        if(focus){
            mapController.updateCameraPosition(
                    CameraUpdateFactory.newLngLatBounds(new LngLat(minLon, minLat), new LngLat(maxLon, maxLat),
                            new Rect(margin.getInt(0), margin.getInt(1), margin.getInt(2), margin.getInt(3))),500);
        }

        PolylineOptions polylineOptions = new PolylineOptions()
                .addAll(linePoints)
                .color(color)
                .width(width);
        mapController.drawPolyLine(polylineOptions);
    }

    public void renderCircle(ReadableMap circle){
        if(mapController==null){
            return;
        }
        double lat = circle.getDouble("lat");
        double lng = circle.getDouble("lng");
        double radius = circle.getDouble("radius");
        boolean focus = circle.getBoolean("focus");
        ReadableArray margin = circle.getArray("padding");
        String fillColor = circle.getString("fillColor");
        LngLat center = new LngLat(lng,lat );
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
            if (latitude < minLat) minLat = latitude;
            if (latitude > maxLat) maxLat = latitude;
            if (longitude < minLon) minLon = longitude;
            if (longitude > maxLon) maxLon = longitude;
        }
        if(focus){
            mapController.updateCameraPosition(
                    CameraUpdateFactory.newLngLatBounds(new LngLat(minLon, minLat), new LngLat(maxLon, maxLat),
                            new Rect(margin.getInt(0), margin.getInt(1), margin.getInt(2), margin.getInt(3))),500);
        }
        mapController.drawCircle(circleOptions);
    }

    @ReactProp(name = "geometries")
    public void setGeometries(MapView mapView, ReadableArray geometries) {
        if (mapController == null) return;
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
}
