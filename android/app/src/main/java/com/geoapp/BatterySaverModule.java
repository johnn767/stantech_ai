package com.geoapp;

import android.content.Context;
import android.os.PowerManager;
import android.os.Build;
import android.content.Intent;
import android.provider.Settings;
import android.net.Uri;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Promise;

public class BatterySaverModule extends ReactContextBaseJavaModule {

    public BatterySaverModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BatterySaverModule";
    }

    @ReactMethod
    public void isPowerSaveMode(Promise promise) {
        try {
            PowerManager powerManager = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
            boolean isPowerSaveMode = powerManager.isPowerSaveMode();
            promise.resolve(isPowerSaveMode);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isIgnoringBatteryOptimizations(Promise promise) {
        try {
            PowerManager powerManager = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
            boolean isIgnoringBatteryOptimizations = powerManager.isIgnoringBatteryOptimizations(getReactApplicationContext().getPackageName());
            promise.resolve(isIgnoringBatteryOptimizations);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openBatteryOptimizationSettings() {
        Intent intent = new Intent();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            intent.setAction(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
        } else {
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.addCategory(Intent.CATEGORY_DEFAULT);
            intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }
}
