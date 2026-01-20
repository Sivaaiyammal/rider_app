package com.virtualmaze.prcustomer.serviceWakeUp;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class FcmServiceWakeUp extends FirebaseMessagingService {

  @Override
  public void onMessageReceived(RemoteMessage msg) {
    String title = msg.getData() != null ? msg.getData().get("title") : null;
    if (!"WAKEUP_BG_SERVICE".equals(title)) return;

    Context ctx = getApplicationContext();
    Intent svc = new Intent(ctx, com.virtualmaze.prcustomer.driverTracking.DriverLocationService.class);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      ctx.startForegroundService(svc);
    } else {
      ctx.startService(svc);
    }

    // Use inexact alarm for all versions (no special permission required)
    PendingIntent pi = PendingIntent.getService(
        ctx, 1001, svc, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
    if (am != null) {
      long triggerAtMillis = System.currentTimeMillis() + 1500;
      am.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
    }
  }
}
