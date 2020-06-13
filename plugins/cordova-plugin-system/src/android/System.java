package com.foxdebug;

import android.os.Build;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.webkit.WebView;
import android.util.Log;
import android.view.View;

import android.content.Context;
import android.app.Activity;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Method;

public class System extends CordovaPlugin {
  private Activity activity;
  private Context context;

  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.context = cordova.getContext();
    this.activity = cordova.getActivity();
  }

  public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext)
      throws JSONException {

    if (action.equals("get-webkit-info")) {
      this.getWebkitInfo(callbackContext);
      return true;
    } else if (action.equals("clear-cache")) {
      this.clearCache(callbackContext);
      return true;
    } else if (action.equals("enable-fullscreen")) {
      this.enableFullScreen(callbackContext);
      return true;
    } else if (action.equals("disable-fullscreen")) {
      this.disableFullScreen(callbackContext);
      return true;
    }
    return false;
  }

  public void getWebkitInfo(CallbackContext callbackContext) throws org.json.JSONException {
    PackageInfo info = null;
    JSONObject res = new JSONObject();

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        info = WebView.getCurrentWebViewPackage();
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        Class webViewFactory = Class.forName("android.webkit.WebViewFactory");
        Method method = webViewFactory.getMethod("getLoadedPackageInfo");
        info = (PackageInfo) method.invoke(null);
      } else {
        PackageManager packageManager = this.cordova.getActivity().getPackageManager();

        try {
          info = packageManager.getPackageInfo("com.google.android.webview", 0);
        } catch (PackageManager.NameNotFoundException e) {
          callbackContext.error("Package not found");
        }

        return;
      }

      res.put("packageName", info.packageName);
      res.put("versionName", info.versionName);
      res.put("versionCode", info.versionCode);

      callbackContext.success(res);
    } catch (Exception e) {
      callbackContext.error("Cannot determine current WebView engine. (" + e.getMessage() + ")");

      return;
    }
  }

  public void clearCache(CallbackContext callbackContext) {
    final String LOG_TAG = "CacheClear";
    final String MESSAGE_TASK = "Cordova Android CacheClear() called.";
    final String MESSAGE_ERROR = "Error while clearing webview cache.";
    final System self = this;
    final CallbackContext callback = callbackContext;

    cordova.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        try {
          self.webView.clearCache(true);
          PluginResult result = new PluginResult(PluginResult.Status.OK);
          result.setKeepCallback(false);
          callback.sendPluginResult(result);
        } catch (Exception e) {
          Log.e(LOG_TAG, MESSAGE_ERROR);
          PluginResult result = new PluginResult(PluginResult.Status.ERROR, MESSAGE_ERROR);
          result.setKeepCallback(false);
          callback.sendPluginResult(result);
        }
      }
    });
  }

  public void enableFullScreen(CallbackContext callbackContext) {
    final CallbackContext callback = callbackContext;
    cordova.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        try {
          activity.getWindow().getDecorView()
              .setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        } catch (Exception e) {
          callback.error(e.getMessage());
        }
      }
    });
  }

  public void disableFullScreen(CallbackContext callbackContext) {
    final CallbackContext callback = callbackContext;
    cordova.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        try {
          activity.getWindow().getDecorView()
              .setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        } catch (Exception e) {
          callback.error(e.getMessage());
        }
      }
    });
  }

}