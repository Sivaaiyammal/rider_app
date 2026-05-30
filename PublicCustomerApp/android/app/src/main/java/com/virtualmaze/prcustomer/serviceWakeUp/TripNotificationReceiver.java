package com.virtualmaze.prcustomer.serviceWakeUp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import org.json.JSONObject;

import java.util.Iterator;

/**
 * Receives trip-related push broadcasts (used as a fallback when the
 * FirebaseMessagingService is not invoked, e.g., the app process is cold-started)
 * and forwards them to the driver overlay pipeline.
 */
public class TripNotificationReceiver extends BroadcastReceiver {

    private static final String TAG = "TripNotificationReceiver";
    private static final String ACTION_C2DM_RECEIVE = "com.google.android.c2dm.intent.RECEIVE";
    private static final String ACTION_TRIP_FALLBACK = "com.virtualmaze.prcustomer.NEW_TRIP_REQUEST";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) {
            return;
        }
        String action = intent.getAction();
        if (!ACTION_C2DM_RECEIVE.equals(action) && !ACTION_TRIP_FALLBACK.equals(action)) {
            return;
        }

        Bundle extras = intent.getExtras();
        if (extras == null || extras.isEmpty()) {
            Log.w(TAG, "Received broadcast without extras for action=" + action);
            return;
        }

        String tripId = extractTripId(extras);
        if (tripId == null || tripId.trim().isEmpty()) {
            Log.w(TAG, "TripNotificationReceiver missing tripId in extras: " + extras.keySet());
            return;
        }

        JSONObject payload = bundleToJson(extras);
        String title = payload.optString("title", "");
        String normalizedTitle = title.toLowerCase().replaceAll("[^a-z0-9 ]", "").trim();
        if ("new trip request".equals(normalizedTitle)) {
            Log.i(TAG, "Broadcast trip payload for tripId=" + tripId + " -> " + payload);
            TripNotificationDispatcher.dispatch(context, tripId, payload);
        } else if ("driver assigned".equals(normalizedTitle)) {
            Log.i(TAG, "Driver assigned notification received in TripNotificationReceiver.");

            // Dispatch to acting dispatcher if this is an acting driver trip
            String isActingFlag = payload.optString("isActingDriverTrip", "");
            if ("true".equalsIgnoreCase(isActingFlag) && !tripId.trim().isEmpty()) {
                Log.i(TAG, "Acting driver assigned; dispatching TripNotificationDispatcherActing for tripId=" + tripId);
                TripNotificationDispatcherActing.dispatch(context, tripId, payload);
            }

            // Always play sound + vibrate
            try {
                com.virtualmaze.prcustomer.tripAlert.PlayTripSound.getInstance(context).playSound("driver_allocated", false);
            } catch (Exception e) {
                Log.e(TAG, "Failed to play driver_allocated sound", e);
            }
            try {
                android.os.Vibrator vibrator = (android.os.Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator != null) {
                    vibrator.vibrate(1000);
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to vibrate", e);
            }
        } else {
            Log.i(TAG, "TripNotificationReceiver ignored broadcast: title is not matched (title=" + title + ")");
        }
    }

    private String extractTripId(Bundle extras) {
        if (extras.containsKey("tripId")) {
            return String.valueOf(extras.get("tripId"));
        }
        if (extras.containsKey("trip_id")) {
            return String.valueOf(extras.get("trip_id"));
        }
        if (extras.containsKey("request_id")) {
            return String.valueOf(extras.get("request_id"));
        }
        return null;
    }

    private JSONObject bundleToJson(Bundle extras) {
        JSONObject obj = new JSONObject();
        Iterator<String> keys = extras.keySet().iterator();
        while (keys.hasNext()) {
            String key = keys.next();
            Object val = extras.get(key);
            if (val == null) continue;
            try {
                obj.put(key, String.valueOf(val));
            } catch (Exception ignored) {}
        }
        return obj;
    }
}
