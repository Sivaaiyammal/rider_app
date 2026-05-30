package com.virtualmaze.prcustomer

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // Important for react-native-screens to avoid fragment restoration after process death
    super.onCreate(null)
    handleIntent(intent)
  }

  override fun onNewIntent(intent: android.content.Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleIntent(intent)
  }

  private fun handleIntent(intent: android.content.Intent?) {
    if (intent == null) return
    val extras = intent.extras ?: return

    for (key in extras.keySet()) {
      android.util.Log.d("MainActivity", "Intent extra: $key = ${extras.get(key)}")
    }

    val tripId = extras.getString("tripId") ?: extras.getString("trip_id") ?: extras.getString("request_id")
    if (tripId != null && tripId.trim().isNotEmpty()) {
      val isActingDriver = extras.getString("isActingDriverTrip")?.toBoolean()
          ?: extras.getBoolean("isActingDriverTrip", false)
          || (extras.getString("title")?.lowercase()?.contains("acting") ?: false)
          || (extras.getString("body")?.lowercase()?.contains("acting") ?: false)

      if (isActingDriver) {
        android.util.Log.d("MainActivity", "Acting driver notification tapped for tripId=$tripId, notifying JS...")
        notifyActingDriverTripAssigned(tripId.trim())
      }
    }
  }

  /**
   * Emits 'onActingDriverTripAssigned' to the React JS layer so Home.js can call
   * checkOnGoingRideAndLog and navigate the customer to their RideStatus screen.
   * If React context isn't ready yet (cold start), the JS side will handle navigation
   * via its own mount-time checkOnGoingRideAndLog() call.
   */
  private fun notifyActingDriverTripAssigned(tripId: String) {
    val reactApp = application as? ReactApplication ?: return
    val reactContext = try {
      reactApp.reactNativeHost?.reactInstanceManager?.currentReactContext
    } catch (e: Throwable) { null }

    if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onActingDriverTripAssigned", tripId)
      android.util.Log.d("MainActivity", "Emitted onActingDriverTripAssigned for tripId=$tripId")
    } else {
      // Cold start: Home.js mounts and calls checkOnGoingRideAndLog() automatically
      android.util.Log.d("MainActivity", "React not ready; cold-start will handle tripId=$tripId via mount")
    }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    val app = application as? ReactApplication
    val isReady = try {
      app?.reactNativeHost?.reactInstanceManager?.currentReactContext != null
    } catch (_: Throwable) {
      false
    }
    if (isReady) {
      super.onWindowFocusChanged(hasFocus)
    }
    // Ignore focus changes until RN context exists to avoid soft exceptions in ReactHostImpl
  }

  override fun getMainComponentName(): String = "CustomerApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return MainActivityDelegate(this, mainComponentName)
  }

  class MainActivityDelegate(activity: ReactActivity, mainComponentName: String) :
    ReactActivityDelegate(activity, mainComponentName) {
    override fun createRootView(): ReactRootView {
      val reactRootView = ReactRootView(context)
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED)
      return reactRootView
    }
  }
}


