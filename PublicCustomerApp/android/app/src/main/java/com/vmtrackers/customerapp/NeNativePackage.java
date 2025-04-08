package com.vmtrackers.customerapp;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.ReactApplicationContext;

import java.util.ArrayList;
import java.util.List;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.uimanager.ViewManager;

public class NeNativePackage implements ReactPackage {
    private ReactApplicationContext reactContext;

    public NeNativePackage(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    // Implement the methods required by the ReactPackage interface
    // You can leave them empty if they are not needed for your use case

    @Override
        public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new NeNativeModule());
        // Add other native modules here if needed
        return modules;

//            return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> viewManagers = new ArrayList<>(); // Use ArrayList to store ViewManagers
        viewManagers.add(new NeNativeModule());
        // viewManagers.add(new NeNativeNavigation()); // Add your NeNativeNavigation ViewManager here
        return viewManagers;
    }
}