package com.foxdebug;

import android.app.Activity;
import android.content.pm.PackageInfo;
import android.content.Intent;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import android.view.View;
import android.webkit.WebView;
import android.net.Uri;
import android.support.v4.content.FileProvider;
import android.content.pm.PackageManager;

import org.apache.commons.io.IOUtils;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.io.File;

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
    } else if (action.equals("share-file")) {
      this.shareFile(args.getString(0), args.getString(1), callbackContext);
      return true;
    } else if (action.equals("share-via-whatsapp")) {
      this.shareViaWhatsapp(args.getString(0), args.getString(1), args.getString(2), callbackContext);
      return true;
    } else if (action.equals("send-email")) {
      this.sendEmail(args.getString(0), args.getString(1), args.getString(2), args.getString(3), callbackContext);
      return true;
    } else if (action.equals("is-powersave-mode")) {
      this.isPowerSaveMode(callbackContext);
      return true;
    }
    return false;
  }

  private void getWebkitInfo(CallbackContext callbackContext) throws org.json.JSONException {
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

  private void clearCache(CallbackContext callbackContext) {
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

  private void isPowerSaveMode(CallbackContext callbackContext) {
    PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
    boolean powerSaveMode = powerManager.isPowerSaveMode();

    callbackContext.success(powerSaveMode ? 1 : 0);
  }

  private void enableFullScreen(CallbackContext callbackContext) {
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

  private void disableFullScreen(CallbackContext callbackContext) {
    final CallbackContext callback = callbackContext;
    cordova.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        try {
          activity.getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        } catch (Exception e) {
          callback.error(e.getMessage());
        }
      }
    });
  }

  private void shareFile(final String fileURI, final String filename, final CallbackContext callbackContext) {
    final Activity activity = this.activity;
    final Context context = this.context;
    cordova.getThreadPool().execute(new Runnable() {
      public void run() {
        try {
          Uri uri = Uri.parse(fileURI);
          String Id = context.getPackageName();
          if (fileURI.matches("file:///(.*)")) {
            File file = new File(uri.getPath());
            uri = FileProvider.getUriForFile(context, Id + ".provider", file);
          }

          Intent intent = new Intent(Intent.ACTION_SEND);
          intent.putExtra(Intent.EXTRA_STREAM, uri);
          if (!filename.equals(""))
            intent.putExtra(Intent.EXTRA_TEXT, filename);
          intent.setType("application/octet-stream");
          activity.startActivity(intent);
          callbackContext.success(uri.toString());
        } catch (Exception e) {
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  private void shareViaWhatsapp(final String fileURI, final String contact, final String countryCode,
      final CallbackContext callbackContext) {
    final Activity activity = this.activity;
    final Context context = this.context;
    final PackageManager pm = context.getPackageManager();
    cordova.getThreadPool().execute(new Runnable() {
      public void run() {
        try {
          Uri uri = Uri.parse(fileURI);
          String Id = context.getPackageName();
          if (fileURI.matches("file:///(.*)")) {
            File file = new File(uri.getPath());
            uri = FileProvider.getUriForFile(context, Id + ".provider", file);
          }

          String packageName = "com.whatsapp";

          if (!isPackageInstalled(packageName, pm)) {
            packageName = "com.whatsapp.w4b";
          }

          Intent intent = new Intent("android.intent.action.MAIN");
          intent.setAction(Intent.ACTION_SEND);
          intent.putExtra(Intent.EXTRA_STREAM, uri);
          intent.putExtra("jid", countryCode + contact + "@s.whatsapp.net");
          intent.setType("application/octet-stream");
          intent.setPackage(packageName);
          intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
          context.startActivity(intent);
          callbackContext.success(contact);
        } catch (Exception e) {
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  private void sendEmail(final String email, final String subject, final String bodyText, final String bodyHTML,
      final CallbackContext callbackContext) {
    final Activity activity = this.activity;
    cordova.getThreadPool().execute(new Runnable() {
      public void run() {
        try {
          Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.fromParts("mailto", email, null));
          intent.putExtra(Intent.EXTRA_SUBJECT, subject);
          intent.putExtra(Intent.EXTRA_TEXT, bodyText);
          if (!bodyHTML.equals(""))
            intent.putExtra(Intent.EXTRA_HTML_TEXT, bodyHTML);

          activity.startActivity(Intent.createChooser(intent, "Send Email"));
          callbackContext.success("OK");
        } catch (Exception e) {
          callbackContext.error(e.getMessage());
        }
      }
    });
  }

  private boolean isPackageInstalled(String packageName, PackageManager packageManager) {
    try {
      packageManager.getPackageInfo(packageName, 0);
      return true;
    } catch (PackageManager.NameNotFoundException e) {
      return false;
    }
  }

}