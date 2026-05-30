package com.virtualmaze.prcustomer.serviceWakeUp;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.virtualmaze.prcustomer.driverTracking.DriverLocationService;

import org.json.JSONObject;

/**
 * Handles dispatching acting driver trip notifications when a driver is assigned 
 * from the dashboard, ensuring the location tracking service is started.
 */
public final class TripNotificationDispatcherActing {

    private static final String TAG = "TripNotificationDispatcherActing";
    private static final long SERVICE_START_DELAY_MS = 1_500L;

    private TripNotificationDispatcherActing() {}

    public static void dispatch(Context context, String tripId, JSONObject payload) {
        if (context == null) {
            Log.w(TAG, "dispatch called with null context");
            return;
        }
        String normalizedTripId = tripId != null ? tripId.trim() : "";
        if (normalizedTripId.isEmpty()) {
            Log.w(TAG, "dispatch called without valid tripId");
            return;
        }

        JSONObject payloadCopy = null;
        if (payload != null) {
            try {
                payloadCopy = new JSONObject(payload.toString());
            } catch (Exception e) {
                payloadCopy = payload;
            }
        }

        Context appContext = context.getApplicationContext();
        DriverLocationService service = DriverLocationService.getInstanceSafe();
        if (service != null) {
            Log.i(TAG, "DriverLocationService alive; delivering acting tripId=" + normalizedTripId);
            service.onTripNotification(normalizedTripId, payloadCopy);
            return;
        }

        Log.i(TAG, "DriverLocationService inactive; starting for acting tripId=" + normalizedTripId);
        Intent svc = new Intent(appContext, DriverLocationService.class);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                appContext.startForegroundService(svc);
            } else {
                appContext.startService(svc);
            }
        } catch (Exception startError) {
            Log.e(TAG, "Failed to start DriverLocationService", startError);
            return;
        }

        Handler handler = new Handler(Looper.getMainLooper());
        JSONObject finalPayloadCopy = payloadCopy;
        handler.postDelayed(() -> {
            DriverLocationService running = DriverLocationService.getInstanceSafe();
            if (running != null) {
                Log.i(TAG, "Delivering acting tripId=" + normalizedTripId + " after service start");
                running.onTripNotification(normalizedTripId, finalPayloadCopy);
            } else {
                Log.w(TAG, "DriverLocationService still unavailable for acting tripId=" + normalizedTripId);
            }
        }, SERVICE_START_DELAY_MS);
    }
}
