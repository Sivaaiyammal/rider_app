package com.virtualmaze.prcustomer.serviceWakeUp;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.virtualmaze.prcustomer.driverTracking.DriverLocationService;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class FcmServiceWakeUp extends FirebaseMessagingService {

  private static final String TAG = "FcmServiceWakeUp";
  private static final String TITLE_WAKEUP = "WAKEUP_BG_SERVICE";
  private static final String TITLE_TRIP_NOTIFICATION = "New Trip Request";

  @Override
  public void onMessageReceived(RemoteMessage msg) {
    Log.d(TAG, "onMessageReceived: " + msg);
    Map<String, String> data = msg.getData();
    if (data != null && !data.isEmpty()) {
      Log.d(TAG, "FCM data payload: " + data);
    } else {
      Log.d(TAG, "FCM data payload empty");
    }
    if (msg.getNotification() != null) {
      Log.d(TAG, "FCM notification payload: title=" + msg.getNotification().getTitle()
              + " body=" + msg.getNotification().getBody());
    }
    String title = data != null ? data.get("title") : null;
    if (title == null && msg.getNotification() != null) {
        title = msg.getNotification().getTitle();
    }
    String normalizedTitle = title != null ? title.toLowerCase().replaceAll("[^a-z0-9 ]", "").trim() : "";

    if ("wakeupbgservice".equals(normalizedTitle)) {
      handleWakeupMessage();
      return;
    }

    if ("new trip request".equals(normalizedTitle)) {
      String tripId = data != null ? data.get("tripId") : null;
      if (tripId != null && !tripId.trim().isEmpty()) {
        Log.d(TAG, "Dispatching trip notification for tripId=" + tripId);
        handleTripNotification(tripId, data);
        return;
      }
    }

    if ("driver assigned".equals(normalizedTitle)) {
      Log.d(TAG, "Driver assigned notification received in FcmServiceWakeUp.");

      // Check if this is an acting driver trip
      String isActingDriverTrip = data != null ? data.get("isActingDriverTrip") : null;
      String tripId = data != null ? data.get("tripId") : null;
      boolean isActing = "true".equalsIgnoreCase(isActingDriverTrip);

      if (isActing && tripId != null && !tripId.trim().isEmpty()) {
        Log.i(TAG, "Acting driver assigned, dispatching TripNotificationDispatcherActing for tripId=" + tripId);
        JSONObject payload = new JSONObject();
        if (data != null) {
          for (Map.Entry<String, String> entry : data.entrySet()) {
            try { payload.put(entry.getKey(), entry.getValue()); } catch (JSONException ignored) {}
          }
        }
        TripNotificationDispatcherActing.dispatch(getApplicationContext(), tripId, payload);
      }

      // Always play sound + vibrate for driver assigned
      try {
        com.virtualmaze.prcustomer.tripAlert.PlayTripSound.getInstance(getApplicationContext()).playSound("driver_allocated", false);
      } catch (Exception e) {
        Log.e(TAG, "Failed to play driver_allocated sound", e);
      }
      try {
        android.os.Vibrator vibrator = (android.os.Vibrator) getApplicationContext().getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null) {
          vibrator.vibrate(1000);
        }
      } catch (Exception e) {
        Log.e(TAG, "Failed to vibrate", e);
      }
      return;
    }
    Log.d(TAG, "FCM message did not match known handlers");
  }

  private void handleWakeupMessage() {
    Context ctx = getApplicationContext();
    Intent svc = new Intent(ctx, DriverLocationService.class);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      ctx.startForegroundService(svc);
    } else {
      ctx.startService(svc);
    }

    PendingIntent pi = PendingIntent.getService(
        ctx, 1001, svc, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
    if (am != null) {
      long triggerAtMillis = System.currentTimeMillis() + 1500;
      am.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
    }
  }

  private void handleTripNotification(String tripId, Map<String, String> data) {
    if (tripId == null) {
      Log.w(TAG, "Trip notification missing tripId");
      return;
    }
    String normalizedTripId = tripId.trim();
    if (normalizedTripId.isEmpty()) {
      Log.w(TAG, "Trip notification received with empty tripId");
      return;
    }
    JSONObject payload = new JSONObject();
    if (data != null) {
      for (Map.Entry<String, String> entry : data.entrySet()) {
        try {
          payload.put(entry.getKey(), entry.getValue());
        } catch (JSONException e) {
          Log.w(TAG, "Failed to copy FCM data key=" + entry.getKey(), e);
        }
      }
    }

    TripNotificationDispatcher.dispatch(getApplicationContext(), normalizedTripId, payload);
  }
}
