package com.virtualmaze.prcustomer.notificationSound;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.MediaPlayer;
import android.media.AudioManager;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;

public class NotificationSoundReceiver extends BroadcastReceiver {
    private static final String TAG = "NotificationSoundReceiver";
    private MediaPlayer mediaPlayer;
    private PowerManager.WakeLock wakeLock;

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Broadcast received: " + intent.getAction());
        
        // Acquire wake lock to ensure sound plays even when app is closed
        PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NotificationSoundReceiver:WakeLock");
            wakeLock.acquire(10000); // Hold for 10 seconds
            Log.d(TAG, "Wake lock acquired for sound playback");
        }
        
        if (intent.getAction() != null) {
            String action = intent.getAction();
            Log.d(TAG, "Action: " + action);
            
            // Check if it's a notification action
            if (action.equals("com.vmtrackers.NOTIFICATION_RECEIVED") || 
                action.equals("com.vmtrackers.NEW_TRIP_REQUEST")) {
                
                String title = intent.getStringExtra("title");
                String notificationTitle = intent.getStringExtra("notification_title");
                
                Log.d(TAG, "Title: " + title + ", Notification Title: " + notificationTitle);
                
                // Check if it's a "New Trip Request" notification
                if (title != null && title.equals("New Trip Request") || 
                    notificationTitle != null && notificationTitle.equals("New Trip Request")) {
                    
                    Log.d(TAG, "New Trip Request detected, playing sound...");
                    playNotificationSound(context);
                }
            }
        }
    }

    private void playNotificationSound(Context context) {
        try {
            // Stop any existing sound first
            stopNotificationSound();
            
            // Create new MediaPlayer instance
            mediaPlayer = new MediaPlayer();
            
            // Set audio stream type for alarm/notification sounds (Android 15 compatible)
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            
            // Set volume (0.0 to 1.0) - higher volume for closed app
            mediaPlayer.setVolume(1.0f, 1.0f);
            
            // Load the sound file from raw resources
            android.content.res.AssetFileDescriptor afd = context.getResources().openRawResourceFd(
                context.getResources().getIdentifier("sos", "raw", context.getPackageName())
            );
            mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();
            
            mediaPlayer.prepare();
            mediaPlayer.start();
            
            Log.d(TAG, "Notification sound played successfully (app may be closed)");
            
            // Set up completion listener to release resources
            mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mp) {
                    Log.d(TAG, "Sound playback completed");
                    releaseMediaPlayer();
                    releaseWakeLock();
                }
            });
            
            // Set up error listener
            mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                @Override
                public boolean onError(MediaPlayer mp, int what, int extra) {
                    Log.e(TAG, "MediaPlayer error: what=" + what + ", extra=" + extra);
                    releaseMediaPlayer();
                    releaseWakeLock();
                    return true;
                }
            });
            
        } catch (Exception e) {
            Log.e(TAG, "Error playing notification sound: " + e.getMessage());
            releaseMediaPlayer();
        }
    }

    private void stopNotificationSound() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
                Log.d(TAG, "Notification sound stopped and released");
            } catch (Exception e) {
                Log.e(TAG, "Error stopping notification sound: " + e.getMessage());
            }
        }
    }

    private void releaseMediaPlayer() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
                Log.d(TAG, "MediaPlayer released");
            } catch (Exception e) {
                Log.e(TAG, "Error releasing MediaPlayer: " + e.getMessage());
            }
        }
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
            Log.d(TAG, "Wake lock released");
        }
    }
}
