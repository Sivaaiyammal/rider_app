 package com.virtualmaze.prcustomer.notificationSound;

 import android.media.MediaPlayer;
 import android.media.AudioManager;
 import android.content.Context;
 import android.util.Log;

 import com.facebook.react.bridge.ReactApplicationContext;
 import com.facebook.react.bridge.ReactContextBaseJavaModule;
 import com.facebook.react.bridge.ReactMethod;
 import com.facebook.react.bridge.Promise;

 public class PlaySoundModule extends ReactContextBaseJavaModule {
     private static final String MODULE_NAME = "PlaySoundModule";
     private MediaPlayer mediaPlayer;
     private ReactApplicationContext reactContext;

     public PlaySoundModule(ReactApplicationContext reactContext) {
         super(reactContext);
         this.reactContext = reactContext;
     }

     @Override
     public String getName() {
         return MODULE_NAME;
     }

     @ReactMethod
     public void playAlertSound(Promise promise) {
         try {
             // Stop any existing sound first
             stopAlertSound();
            
             // Create new MediaPlayer instance
             mediaPlayer = new MediaPlayer();
            
             // Set audio stream type for alarm/notification sounds
             mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            
             // Set volume (0.0 to 1.0)
             mediaPlayer.setVolume(0.5f, 0.5f);
            
             // Load the sound file from raw resources
             android.content.res.AssetFileDescriptor afd = reactContext.getResources().openRawResourceFd(reactContext.getResources().getIdentifier("driver_allocated", "raw", reactContext.getPackageName()));
             mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
             afd.close();
            
             // Prepare the media player
             mediaPlayer.prepare();
            
             // Set completion listener to release resources when done
             mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                 @Override
                 public void onCompletion(MediaPlayer mp) {
                     releaseMediaPlayer();
                 }
             });
            
             // Set error listener
             mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                 @Override
                 public boolean onError(MediaPlayer mp, int what, int extra) {
                     Log.e("PlaySoundModule", "MediaPlayer error: " + what + ", " + extra);
                     releaseMediaPlayer();
                     return true;
                 }
             });
            
             // Start playing
             mediaPlayer.start();
            
             Log.d("PlaySoundModule", "Alert sound started playing");
             promise.resolve("Sound started playing");
            
         } catch (Exception e) {
             Log.e("PlaySoundModule", "Error playing alert sound: " + e.getMessage());
             promise.reject("SOUND_ERROR", "Failed to play sound: " + e.getMessage());
         }
     }

     @ReactMethod
     public void stopAlertSound() {
         try {
             if (mediaPlayer != null) {
                 if (mediaPlayer.isPlaying()) {
                     mediaPlayer.stop();
                 }
                 releaseMediaPlayer();
                 Log.d("PlaySoundModule", "Alert sound stopped");
             }
         } catch (Exception e) {
             Log.e("PlaySoundModule", "Error stopping alert sound: " + e.getMessage());
         }
     }

     @ReactMethod
     public void playAlertSoundWithLoop(int loopCount, Promise promise) {
         try {
             // Stop any existing sound first
             stopAlertSound();
            
             // Create new MediaPlayer instance
             mediaPlayer = new MediaPlayer();
            
             // Set audio stream type for alarm/notification sounds
             mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            
             // Set volume (0.0 to 1.0)
             mediaPlayer.setVolume(0.5f, 0.5f);
            
             // Load the sound file from raw resources
             android.content.res.AssetFileDescriptor afd = reactContext.getResources().openRawResourceFd(reactContext.getResources().getIdentifier("tripalert", "raw", reactContext.getPackageName()));
             mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
             afd.close();
            
             // Prepare the media player
             mediaPlayer.prepare();
            
             // Set looping
             if (loopCount > 0) {
                 mediaPlayer.setLooping(true);
             }
            
             // Set completion listener
             mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                 @Override
                 public void onCompletion(MediaPlayer mp) {
                     if (loopCount <= 0) {
                         releaseMediaPlayer();
                     }
                 }
             });
            
             // Set error listener
             mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                 @Override
                 public boolean onError(MediaPlayer mp, int what, int extra) {
                     Log.e("PlaySoundModule", "MediaPlayer error: " + what + ", " + extra);
                     releaseMediaPlayer();
                     return true;
                 }
             });
            
             // Start playing
             mediaPlayer.start();
            
             Log.d("PlaySoundModule", "Alert sound started playing with loop count: " + loopCount);
             promise.resolve("Sound started playing with loop");
            
         } catch (Exception e) {
             Log.e("PlaySoundModule", "Error playing alert sound with loop: " + e.getMessage());
             promise.reject("SOUND_ERROR", "Failed to play sound with loop: " + e.getMessage());
         }
     }

     @ReactMethod
     public void isPlaying(Promise promise) {
         try {
             boolean playing = mediaPlayer != null && mediaPlayer.isPlaying();
             promise.resolve(playing);
         } catch (Exception e) {
             Log.e("PlaySoundModule", "Error checking if sound is playing: " + e.getMessage());
             promise.reject("SOUND_ERROR", "Failed to check sound status: " + e.getMessage());
         }
     }

     private void releaseMediaPlayer() {
         try {
             if (mediaPlayer != null) {
                 mediaPlayer.release();
                 mediaPlayer = null;
             }
         } catch (Exception e) {
             Log.e("PlaySoundModule", "Error releasing MediaPlayer: " + e.getMessage());
         }
     }
 }
