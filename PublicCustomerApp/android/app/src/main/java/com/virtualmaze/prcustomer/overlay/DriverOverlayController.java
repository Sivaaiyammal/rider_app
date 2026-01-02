package com.virtualmaze.prcustomer.overlay;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.app.ActivityManager;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.LinearInterpolator;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.virtualmaze.prcustomer.AsyncStorageReader;
import com.virtualmaze.prcustomer.driverTracking.BGLocationServiceModule;
import com.virtualmaze.prcustomer.BuildConfig;
import com.virtualmaze.prcustomer.driverTracking.DriverLocationService;
import com.virtualmaze.prcustomer.tripAlert.PlayTripSoundModule;
import com.virtualmaze.prcustomer.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.net.URI;
import java.util.Locale;

import io.socket.client.IO;
import io.socket.client.Socket;

/**
 * Handles driver alert overlay logic (Socket.IO lifecycle + banner rendering) so the
 * location service stays lean. Requires SYSTEM_ALERT_WINDOW permission to show UI.
 */
public class DriverOverlayController {

    private static final String TAG = "DriverOverlayController";
    private static final long SOCKET_RETRY_DELAY_MS = 10_000L;
    private static final long SOCKET_HEALTH_INTERVAL_MS = 60_000L;
    private static final String ADDRESS_FALLBACK = "Address not available";
    private static final String EVENT_TRIP_OVERLAY_VISIBILITY = "driverTripOverlayVisibility";
    private static final String EVENT_TRIP_OVERLAY_RESPONSE = "driverTripOverlayResponse";

    private final Context context;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Runnable socketRetryRunnable = this::initDriverSocket;
    private final Runnable socketHealthCheckRunnable = this::runSocketHealthCheck;
    private static Typeface lexendBold;
    private Runnable overlayDismissRunnable;
    private ValueAnimator progressAnimator;

    private WindowManager windowManager;
    private View overlayView;
    private Socket driverSocket;
    private String cachedDriverId;
    private boolean hasStarted;

    public DriverOverlayController(Context context) {
        this.context = context.getApplicationContext();
    }

    public synchronized void start() {
        if (hasStarted) {
            scheduleSocketHealthCheck();
            mainHandler.post(this::initDriverSocket);
            return;
        }
        hasStarted = true;
        scheduleSocketHealthCheck();
        mainHandler.post(this::initDriverSocket);
    }

    public synchronized void stop() {
        if (!hasStarted && driverSocket == null && overlayView == null) {
            return;
        }
        hasStarted = false;
        mainHandler.removeCallbacks(socketRetryRunnable);
        mainHandler.removeCallbacks(socketHealthCheckRunnable);
        cancelOverlayAutoDismiss();
        removeOverlay();
        try {
            if (driverSocket != null) {
                driverSocket.off();
                driverSocket.disconnect();
            }
        } catch (Exception ignored) {}
        driverSocket = null;
    }

    private void initDriverSocket() {
        if (!hasStarted) {
            return;
        }
        mainHandler.removeCallbacks(socketRetryRunnable);

        try {
            if (driverSocket != null) {
                if (driverSocket.connected()) {
                    Log.d(TAG, "Driver socket already active; skipping re-init");
                    return;
                }
                try {
                    driverSocket.off();
                    driverSocket.disconnect();
                } catch (Exception ignored) {}
                driverSocket = null;
            }
        } catch (Exception resetError) {
            Log.e(TAG, "Error resetting driver socket", resetError);
        }

        try {
            final String driverId = ensureDriverId();
            if (driverId == null || driverId.isEmpty()) {
                Log.w(TAG, "Driver id missing; scheduling socket retry");
                scheduleSocketRetry();
                return;
            }

            URI uri = URI.create(BuildConfig.DRIVER_SOCKET_URL);
            String protocolAndHost = uri.getScheme() + "://" + uri.getHost();
            if (uri.getPort() != -1) {
                protocolAndHost += ":" + uri.getPort();
            }

            String path = uri.getPath();
            if (path == null || path.isEmpty()) {
                path = "/";
            }

            IO.Options options = new IO.Options();
            options.reconnection = true;
            options.reconnectionAttempts = Integer.MAX_VALUE;
            options.reconnectionDelay = 5_000;
            options.reconnectionDelayMax = 20_000;
            options.randomizationFactor = 0.5;
            options.timeout = 10_000;
            options.path = "/".equals(path) ? "/socket.io" : path + "/socket.io";
            options.query = "driver_id=" + driverId;

            driverSocket = IO.socket(protocolAndHost, options);

            driverSocket.on(Socket.EVENT_CONNECT, args -> {
                Log.i(TAG, "Driver socket connected as " + driverId);
                scheduleSocketHealthCheck();
            });
            driverSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
                Throwable err = (args != null && args.length > 0 && args[0] instanceof Throwable)
                        ? (Throwable) args[0]
                        : new Exception(args != null && args.length > 0 ? args[0].toString() : "unknown error");
                Log.e(TAG, "Driver socket connect error for " + driverId, err);
                scheduleSocketRetry();
            });
            driverSocket.on(Socket.EVENT_DISCONNECT, args -> {
                Log.w(TAG, "Driver socket disconnected for " + driverId);
                scheduleSocketRetry();
            });

            driverSocket.on("trip_request", args -> {
                if (args != null && args.length > 0) {
                    Object payload = args[0];
                    if (payload instanceof JSONObject) {
                        JSONObject obj = (JSONObject) payload;
                        Log.i(TAG, "Received trip_request for driver=" + driverId + " payload=" + obj);
                        stopAlertAudio();
                        mainHandler.post(() -> showOverlay(obj));
                    } else {
                        Log.w(TAG, "Unexpected trip_request payload type: " +
                                (payload != null ? payload.getClass() : "null"));
                    }
                }
            });

            driverSocket.connect();
        } catch (Exception e) {
            Log.e(TAG, "initDriverSocket error", e);
            scheduleSocketRetry();
        }
    }

    private void scheduleSocketRetry() {
        if (!hasStarted) {
            return;
        }
        mainHandler.removeCallbacks(socketRetryRunnable);
        mainHandler.postDelayed(socketRetryRunnable, SOCKET_RETRY_DELAY_MS);
    }

    private void scheduleSocketHealthCheck() {
        if (!hasStarted) {
            return;
        }
        mainHandler.removeCallbacks(socketHealthCheckRunnable);
        mainHandler.postDelayed(socketHealthCheckRunnable, SOCKET_HEALTH_INTERVAL_MS);
    }

    private void runSocketHealthCheck() {
        if (!hasStarted) {
            return;
        }
        boolean connected = driverSocket != null && driverSocket.connected();
        if (!connected) {
            Log.w(TAG, "Socket health check triggered reconnect");
            initDriverSocket();
        }
        scheduleSocketHealthCheck();
    }

    private void showOverlay(JSONObject data) {
        if (windowManager == null) {
            windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        }
        removeOverlay();

        if (isAppInForeground()) {
            Log.i(TAG, "App in foreground; skipping overlay banner");
            stopAlertAudio();
            DriverLocationService service = DriverLocationService.getInstanceSafe();
            if (service != null) {
                service.setOverlayActive(false);
            }
            emitOverlayVisibility(false);
            return;
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
                Log.w(TAG, "Overlay permission missing; cannot display trip banner");
                stopAlertAudio();
                cancelOverlayAutoDismiss();
                emitOverlayVisibility(false);
                return;
            }

            LayoutInflater inflater = LayoutInflater.from(context);
                overlayView = inflater.inflate(R.layout.driver_overlay_banner, null);

                DriverLocationService service = DriverLocationService.getInstanceSafe();
                if (service != null) {
                    service.setOverlayActive(true);
                    service.playAlertSoundWithLoop(1);
                }

            int paramsType;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                paramsType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
            } else {
                //noinspection deprecation
                paramsType = WindowManager.LayoutParams.TYPE_PHONE;
            }

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    paramsType,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                            | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT
            );
            params.gravity = Gravity.TOP;

            ImageView appIcon = overlayView.findViewById(R.id.overlay_app_icon);
            if (appIcon != null) {
                appIcon.setImageResource(R.mipmap.ic_launcher_round);
            }

            TextView title = overlayView.findViewById(R.id.overlay_title);
            ProgressBar timerProgress = overlayView.findViewById(R.id.overlay_timer_progress);
            Button btnAccept = overlayView.findViewById(R.id.overlay_accept_btn);
            Button btnReject = overlayView.findViewById(R.id.overlay_reject_btn);
            TextView bonusText = overlayView.findViewById(R.id.overlay_bonus_text);
            TextView distanceText = overlayView.findViewById(R.id.overlay_distance_text);

            applyOverlayTypography(title, btnAccept, btnReject);
            initTimerUI(timerProgress);

            title.setText("New Trip Request");

            JSONObject inner = data.optJSONObject("data");
            int timeoutSeconds = 0;
            if (inner != null) {
                timeoutSeconds = inner.optInt("timeout_seconds", 0);
            }
            // Show bonus and distance information if available
            applyBonusAndDistanceUI(bonusText, distanceText, inner);
            bindTripDetails(overlayView, inner);
            scheduleOverlayAutoDismiss(timerProgress, timeoutSeconds);

            btnAccept.setOnClickListener(v -> {
                emitDriverResponse(data, true);
                clearNotificationTray();
                removeOverlay();
                openApp();
                emitOverlayResponse(true, data);
            });

            btnReject.setOnClickListener(v -> {
                emitDriverResponse(data, false);
                clearNotificationTray();
                removeOverlay();
                emitOverlayResponse(false, data);
            });

            if (windowManager != null) {
                windowManager.addView(overlayView, params);
                emitOverlayVisibility(true);
            } else {
                emitOverlayVisibility(false);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to add overlay view", e);
            emitOverlayVisibility(false);
        }
    }

    private void removeOverlay() {
        if (overlayView != null) {
            try {
                if (windowManager != null) {
                    windowManager.removeView(overlayView);
                }
            } catch (Exception ignored) {}
            overlayView = null;
        }
        cancelOverlayAutoDismiss();
        stopAlertAudio();
        DriverLocationService service = DriverLocationService.getInstanceSafe();
        if (service != null) {
            service.setOverlayActive(false);
        }
        emitOverlayVisibility(false);
    }

    private void openApp() {
        try {
            if (isAppInForeground()) {
                Log.i(TAG, "App already in foreground; skipping launch after acceptance");
                return;
            }
            Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (launchIntent == null) {
                Log.w(TAG, "Launch intent unavailable; cannot open app");
                return;
            }
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            context.startActivity(launchIntent);
            Log.i(TAG, "Launched app after trip acceptance");
        } catch (Exception e) {
            Log.e(TAG, "Failed to open app after acceptance", e);
        }
    }

    private void emitDriverResponse(JSONObject data, boolean accept) {
        try {
            JSONObject tripData = data.optJSONObject("data");
            if (tripData == null) return;

            String tripIdValue = tripData.optString("trip_id");
            String requestId = tripData.optString("request_id");
            String driverId = tripData.optString("driver_id");
            if (driverId == null || driverId.isEmpty()) {
                driverId = ensureDriverId();
            }
            if (driverId == null || driverId.isEmpty()) {
                Log.w(TAG, "Cannot emit driver response without driver id");
                return;
            }

            JSONObject responsePayload = new JSONObject();
            responsePayload.put("driver_id", driverId);
            responsePayload.put("trip_id", tripIdValue);
            responsePayload.put("response", accept ? "accept" : "reject");
            responsePayload.put("request_id", requestId);

            if (driverSocket != null) {
                driverSocket.emit("driver_trip_response", responsePayload);
            }
            stopAlertAudio();
            Log.i(TAG, "Emitted driver_trip_response: " + responsePayload);
        } catch (Exception e) {
            Log.e(TAG, "emitDriverResponse error", e);
        }
    }

    private void clearNotificationTray() {
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.cancelAll();
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to clear notification tray", e);
        }
    }

    private boolean isAppInForeground() {
        ActivityManager.RunningAppProcessInfo info = new ActivityManager.RunningAppProcessInfo();
        ActivityManager.getMyMemoryState(info);
        int importance = info.importance;
        return importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
                || importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_VISIBLE;
    }

    private void stopAlertAudio() {
        try {
            DriverLocationService service = DriverLocationService.getInstanceSafe();
            if (service != null) {
                service.stopAlertSound();
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop DriverLocationService alert audio", e);
        }
        try {
            PlayTripSoundModule.stopSoundIfActive();
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop PlayTripSoundModule audio", e);
        }
    }

    private String ensureDriverId() {
        if (cachedDriverId != null && !cachedDriverId.isEmpty()) {
            return cachedDriverId;
        }
        try {
            String rawUserInfo = normalizeUserInfo(AsyncStorageReader.readValueFromAsyncStorage(context, "userInfo"));
            Log.d(TAG, "Loaded userInfo from storage: " + rawUserInfo);
            if (rawUserInfo == null) {
                return null;
            }
            JSONObject info = parseJsonObject(rawUserInfo);
            JSONObject user = info.optJSONObject("user");
            if (user != null) {
                cachedDriverId = user.optString("_id", null);
                Log.d(TAG, "Resolved driverId=" + cachedDriverId);
                return cachedDriverId;
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to load driver id", e);
        }
        return null;
    }

    private static String normalizeUserInfo(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty() || "null".equalsIgnoreCase(trimmed)) {
            return null;
        }
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() > 1) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static JSONObject parseJsonObject(String raw) throws JSONException {
        try {
            return new JSONObject(raw);
        } catch (JSONException primary) {
            String decoded = decodeEscapedJson(raw);
            if (decoded != null && !decoded.equals(raw)) {
                Log.d(TAG, "Retrying JSON parse after unescaping storage payload");
                return new JSONObject(decoded);
            }
            throw primary;
        }
    }

    private static String decodeEscapedJson(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            Object candidate = new JSONTokener("\"" + raw + "\"").nextValue();
            if (candidate instanceof String) {
                return (String) candidate;
            }
        } catch (JSONException ignored) {}
        return raw;
    }

    private void applyOverlayTypography(TextView title, Button accept, Button reject) {
        Typeface bold = getLexendBold();
        if (bold != null) {
            if (title != null) {
                title.setTypeface(bold);
            }
            if (accept != null) {
                accept.setTypeface(bold);
            }
            if (reject != null) {
                reject.setTypeface(bold);
            }
        }
    }

    private Typeface getLexendBold() {
        if (lexendBold == null) {
            try {
                lexendBold = Typeface.createFromAsset(context.getAssets(), "fonts/Lexend-Bold.ttf");
            } catch (Exception e) {
                Log.e(TAG, "Failed loading Lexend-Bold font", e);
            }
        }
        return lexendBold;
    }

    private void scheduleOverlayAutoDismiss(ProgressBar progressBar, int timeoutSeconds) {
        cancelOverlayAutoDismiss();
        if (timeoutSeconds <= 0) {
            return;
        }
        long totalDurationMs = timeoutSeconds * 1000L;

        overlayDismissRunnable = this::removeOverlay;
        mainHandler.postDelayed(overlayDismissRunnable, totalDurationMs);

        if (progressBar != null) {
            final int startValue = Math.max(progressBar.getMax(), 1);
            progressAnimator = ValueAnimator.ofInt(startValue, 0);
            progressAnimator.setDuration(totalDurationMs);
            progressAnimator.setInterpolator(new LinearInterpolator());
            progressAnimator.addUpdateListener(animation -> {
                if (progressBar.getParent() == null) {
                    return;
                }
                int animatedProgress = (int) animation.getAnimatedValue();
                progressBar.setProgress(animatedProgress);
            });
            progressAnimator.addListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    if (progressBar.getParent() != null) {
                        progressBar.setProgress(0);
                    }
                }
            });
            progressAnimator.start();
        }
    }

    private void cancelOverlayAutoDismiss() {
        if (overlayDismissRunnable != null) {
            mainHandler.removeCallbacks(overlayDismissRunnable);
            overlayDismissRunnable = null;
        }
        if (progressAnimator != null) {
            progressAnimator.cancel();
            progressAnimator.removeAllUpdateListeners();
            progressAnimator.removeAllListeners();
            progressAnimator = null;
        }
    }

    private void initTimerUI(ProgressBar progressBar) {
        if (progressBar != null) {
            progressBar.setIndeterminate(false);
            progressBar.setMax(1000);
            progressBar.setProgress(1000);
        }
    }

    public void hideOverlay() {
        mainHandler.post(this::removeOverlay);
    }

    private void bindTripDetails(View root, JSONObject tripData) {
        LinearLayout container = root.findViewById(R.id.overlay_trip_container);
        TextView header = root.findViewById(R.id.overlay_trip_header);
        if (container == null) {
            if (header != null) {
                header.setVisibility(View.GONE);
            }
            return;
        }

        container.removeAllViews();
        boolean hasAny = false;

        if (tripData != null) {
            LayoutInflater inflater = LayoutInflater.from(context);
            JSONArray stops = tripData.optJSONArray("stops");
            if (stops != null && stops.length() > 0) {
                for (int i = 0; i < stops.length(); i++) {
                    JSONObject stop = stops.optJSONObject(i);
                    if (stop == null) {
                        continue;
                    }
                    String rawName = cleanDisplay(stop.optString("name", ""));
                    String address = cleanDisplay(stop.optString("address", ""));
                    if (address.isEmpty()) {
                        address = formatLocation(stop.optJSONArray("location"));
                    }
                    if (address.isEmpty()) {
                        address = ADDRESS_FALLBACK;
                    }

                    int iconRes = iconForIndex(i, stops.length());
                    String label = labelForIndex(i, stops.length(), rawName);
                    addTripPointRow(inflater, container, iconRes, label, address);
                    hasAny = true;
                }
            } else {
                hasAny |= addFallbackPoint(inflater, container, tripData, true);
                hasAny |= addFallbackPoint(inflater, container, tripData, false);
            }
        }

        if (header != null) {
            header.setVisibility(hasAny ? View.VISIBLE : View.GONE);
        }
        container.setVisibility(hasAny ? View.VISIBLE : View.GONE);
    }

    private void emitOverlayVisibility(boolean visible) {
        ReactApplicationContext reactContext = BGLocationServiceModule.getReactContext();
        if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
            return;
        }

        WritableMap payload = Arguments.createMap();
        payload.putBoolean("visible", visible);

        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(EVENT_TRIP_OVERLAY_VISIBILITY, payload);
        } catch (Exception e) {
            Log.e(TAG, "Failed to emit overlay visibility", e);
        }
    }

    private void emitOverlayResponse(boolean accepted, JSONObject rawPayload) {
        ReactApplicationContext reactContext = BGLocationServiceModule.getReactContext();
        if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
            return;
        }

        WritableMap payload = Arguments.createMap();
        payload.putBoolean("accepted", accepted);
        payload.putBoolean("rejected", !accepted);
        try {
            if (rawPayload != null) {
                payload.putString("raw", rawPayload.toString());
            }
        } catch (Exception e) {
            Log.w(TAG, "Unable to serialize overlay response payload", e);
        }

        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(EVENT_TRIP_OVERLAY_RESPONSE, payload);
        } catch (Exception e) {
            Log.e(TAG, "Failed to emit overlay response", e);
        }
    }

    private boolean addFallbackPoint(LayoutInflater inflater, LinearLayout container, JSONObject tripData, boolean isStart) {
        String nameKey = isStart ? "pickup_name" : "dropoff_name";
        String addressKey = isStart ? "pickup_address" : "dropoff_address";
        String locationKey = isStart ? "pickup_location" : "dropoff_location";

        String rawName = cleanDisplay(tripData.optString(nameKey, ""));
        String address = cleanDisplay(tripData.optString(addressKey, ""));
        if (address.isEmpty()) {
            address = formatLocation(tripData.optJSONArray(locationKey));
        }
        if (rawName.isEmpty() && address.isEmpty()) {
            return false;
        }
        if (address.isEmpty()) {
            address = ADDRESS_FALLBACK;
        }

        int iconRes = isStart ? R.drawable.start_marker : R.drawable.end_marker;
        String label = isStart
                ? (rawName.isEmpty() ? "Start" : "Start: " + rawName)
                : (rawName.isEmpty() ? "Destination" : "Destination: " + rawName);

        addTripPointRow(inflater, container, iconRes, label, address);
        return true;
    }

    private void addTripPointRow(LayoutInflater inflater, LinearLayout container, int iconRes, String label, String address) {
        if (inflater == null || container == null) {
            return;
        }
        View row = inflater.inflate(R.layout.driver_overlay_trip_point, container, false);
        if (row == null) {
            return;
        }
        ImageView icon = row.findViewById(R.id.overlay_point_icon);
        TextView nameView = row.findViewById(R.id.overlay_point_name);
        TextView addressView = row.findViewById(R.id.overlay_point_address);

        if (icon != null) icon.setImageResource(iconRes);
        if (nameView != null) nameView.setText(label != null ? label : "");
        if (addressView != null) addressView.setText(address != null ? address : "");

        container.addView(row);
    }

    private String labelForIndex(int index, int total, String rawName) {
        String cleanName = cleanDisplay(rawName);
        if (index == 0) {
            return cleanName.isEmpty() ? "Start" : "Start: " + cleanName;
        }
        if (index == total - 1) {
            return cleanName.isEmpty() ? "Destination" : "Destination: " + cleanName;
        }
        String base = "Stop " + index;
        return cleanName.isEmpty() ? base : base + ": " + cleanName;
    }

    private int iconForIndex(int index, int total) {
        if (index == 0) {
            return R.drawable.start_marker;
        }
        if (index == total - 1) {
            return R.drawable.end_marker;
        }
        return R.drawable.marker_stop_blue;
    }

    private String formatLocation(JSONArray coords) {
        if (coords == null || coords.length() < 2) {
            return "";
        }
        double lon = coords.optDouble(0, Double.NaN);
        double lat = coords.optDouble(1, Double.NaN);
        if (Double.isNaN(lat) || Double.isNaN(lon)) {
            return "";
        }
        return String.format(Locale.US, "%.5f, %.5f", lat, lon);
    }

    private String cleanDisplay(String raw) {
        if (raw == null) {
            return "";
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty() || "null".equalsIgnoreCase(trimmed)) {
            return "";
        }
        return trimmed;
    }

    private void applyBonusAndDistanceUI(TextView bonusText, TextView distanceText, JSONObject tripData) {
        if (tripData == null) {
            if (bonusText != null) bonusText.setVisibility(View.GONE);
            if (distanceText != null) distanceText.setVisibility(View.GONE);
            return;
        }

        // Bonus banner: show when escalation_bonus > 0 or in debug for testing
        try {
            JSONObject esc = tripData.optJSONObject("escalation_details");
            double bonusVal = esc != null ? esc.optDouble("escalation_bonus", 0) : 0;
            if (bonusText != null) {
                // || BuildConfig.DEBUG
                if (bonusVal > 0 ) {
                    bonusText.setText("\uD83C\uDF81 Special bonus added for this trip");
                    bonusText.setVisibility(View.VISIBLE);
                } else {
                    bonusText.setVisibility(View.GONE);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to apply bonus UI", e);
            if (bonusText != null) bonusText.setVisibility(View.GONE);
        }

        // Distance: compute and show if valid
        try {
            double km = computeTripDistanceKm(tripData);
            if (distanceText != null) {
                if (km >= 0) {
                    String text = String.format(Locale.US, "\uD83D\uDCCF Distance: %.1f km", km);
                    distanceText.setText(text);
                    distanceText.setVisibility(View.VISIBLE);
                } else {
                    distanceText.setVisibility(View.GONE);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to apply distance UI", e);
            if (distanceText != null) distanceText.setVisibility(View.GONE);
        }
    }

    private double computeTripDistanceKm(JSONObject tripData) {
        if (tripData == null) return -1;
        // Prefer using stops if both first and last are available
        JSONArray stops = tripData.optJSONArray("stops");
        if (stops != null && stops.length() >= 2) {
            JSONObject first = stops.optJSONObject(0);
            JSONObject last = stops.optJSONObject(stops.length() - 1);
            if (first != null && last != null) {
                JSONArray a = first.optJSONArray("location");
                JSONArray b = last.optJSONArray("location");
                double[] A = parseLatLon(a);
                double[] B = parseLatLon(b);
                if (A != null && B != null) {
                    return haversineKm(A[0], A[1], B[0], B[1]);
                }
            }
        }
        // Fallback to pickup/dropoff
        double[] A = parseLatLon(tripData.optJSONArray("pickup_location"));
        double[] B = parseLatLon(tripData.optJSONArray("dropoff_location"));
        if (A != null && B != null) {
            return haversineKm(A[0], A[1], B[0], B[1]);
        }
        return -1;
    }

    private static double[] parseLatLon(JSONArray coords) {
        if (coords == null || coords.length() < 2) return null;
        double lon = coords.optDouble(0, Double.NaN);
        double lat = coords.optDouble(1, Double.NaN);
        if (Double.isNaN(lat) || Double.isNaN(lon)) return null;
        return new double[] { lat, lon };
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0088; // mean Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
