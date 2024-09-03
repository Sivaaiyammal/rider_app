package com.vmroutes.customer;

import android.app.Activity;

import com.dot.nenativemap.MapView;
import com.dot.nenativemap.directions.RouteInstructionsDisplay;
import com.facebook.react.bridge.ReadableArray;

public class SharedDirections {
    public static RouteInstructionsDisplay routeDetails;
    public static MapView mapView;

    public static Activity currentActivity;


    public static Activity getCurrentActivity() {
        return currentActivity;
    }

    public static void setCurrentActivity(Activity newActivity) {
        currentActivity = newActivity;
    }
    public static RouteInstructionsDisplay getSharedArray() {
        return routeDetails;
    }
    public static MapView getSharedMapView() {
        return mapView;
    }

    public static void setSharedMapView(MapView newMapView) {
        mapView = newMapView;
    }

    // Function to update the shared array
    public static void updateSharedArray(RouteInstructionsDisplay newArray) {
        routeDetails = newArray;
    }

}
