package com.vmtrackers.customerapp;

import android.app.Application;
import android.content.Context;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactInstanceManager.ReactInstanceEventListener;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.soloader.SoLoader;
import com.vmtrackers.customerapp.newarchitecture.MainApplicationReactNativeHost;

// Add missing imports
import com.vmtrackers.customerapp.smslistener.SmsListenerModule;
import com.vmtrackers.customerapp.NeNativePackage;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import com.facebook.react.bridge.ReactApplicationContext;
import com.dot.nenativemap.security.NENative;
import com.virtualmaze.services_core.utils.NEApiServices;

import com.facebook.react.modules.i18nmanager.I18nUtil;
import com.facebook.react.bridge.ReactContext;

public class MainApplication extends Application implements ReactApplication {

  private ReactApplicationContext mReactApplicationContext;

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      // Add custom packages
      packages.add(new com.vmtrackers.customerapp.smslistener.SmsListenerPackage());
      packages.add(new com.vmtrackers.customerapp.NeNativePackage());
      return packages;
    }


    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  private final ReactNativeHost mNewArchitectureNativeHost = new MainApplicationReactNativeHost(this);

  @Override
  public ReactNativeHost getReactNativeHost() {
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      return mNewArchitectureNativeHost;
    } else {
      return mReactNativeHost;
    }
  }

  @Override
  public void onCreate() {
    super.onCreate();

    // Initialize SoLoader
    SoLoader.init(this, /* native exopackage */ false);

    // Initialize other services that don't require ReactContext
    NEApiServices.initialize(getApplicationContext());
    NENative.getInstance(getApplicationContext(), NEApiServices.getAccessToken());

    // If you opted-in for the New Architecture, we enable the TurboModule system
    ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;

    // Initialize Flipper for debugging
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());

    // Add a listener to ensure ReactContext is properly initialized
    getReactNativeHost().getReactInstanceManager().addReactInstanceEventListener(new ReactInstanceEventListener() {
        @Override
        public void onReactContextInitialized(ReactContext context) {
            // Use the properly initialized ReactContext here
            mReactApplicationContext = (ReactApplicationContext) context;

            // Initialize any components that require the ReactApplicationContext
            I18nUtil sharedI18nUtilInstance = I18nUtil.getInstance();
            sharedI18nUtilInstance.allowRTL(mReactApplicationContext, true);
        }
    });

    // Trigger the initialization of the React context
    getReactNativeHost().getReactInstanceManager().createReactContextInBackground();
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method
   * with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         * We use reflection here to pick up the class that initializes Flipper,
         * since Flipper library is not available in release mode
         */
        Class<?> aClass = Class.forName("com.vmtrackers.customerapp.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
