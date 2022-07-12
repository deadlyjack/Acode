package org.apache.cordova.engine;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.webkit.WebView;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import org.apache.cordova.CordovaBridge;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;
import org.apache.cordova.ICordovaCookieManager;
import org.apache.cordova.LOG;
import org.apache.cordova.NativeToJsMessageQueue;
import org.apache.cordova.PluginManager;

public class SystemWebViewEngine implements CordovaWebViewEngine {

  public static final String TAG = "SystemWebViewEngine";

  protected final SystemWebView webView;
  protected final SystemCookieManager cookieManager;
  protected CordovaPreferences preferences;
  protected CordovaBridge bridge;
  protected CordovaWebViewEngine.Client client;
  protected CordovaWebView parentWebView;
  protected CordovaInterface cordova;
  protected PluginManager pluginManager;
  protected CordovaResourceApi resourceApi;
  protected NativeToJsMessageQueue nativeToJsMessageQueue;
  private BroadcastReceiver receiver;

  public SystemWebViewEngine(Context context, CordovaPreferences preferences) {
    this(new SystemWebView(context), preferences);
  }

  public SystemWebViewEngine(SystemWebView webView) {
    this(webView, null);
  }

  public SystemWebViewEngine(SystemWebView webView, CordovaPreferences preferences) {
    this.preferences = preferences;
    this.webView = webView;
    cookieManager = new SystemCookieManager(webView);
  }

  public void setInputType(int type) {
    webView.setInputType(type);
  }

  @Override
  public void init(CordovaWebView parentWebView, CordovaInterface cordova, CordovaWebViewEngine.Client client, CordovaResourceApi resourceApi, PluginManager pluginManager, NativeToJsMessageQueue nativeToJsMessageQueue) {
    if (this.cordova != null) {
      throw new IllegalStateException();
    }

    if (preferences == null) {
      preferences = parentWebView.getPreferences();
    }
    this.parentWebView = parentWebView;
    this.cordova = cordova;
    this.client = client;
    this.resourceApi = resourceApi;
    this.pluginManager = pluginManager;
    this.nativeToJsMessageQueue = nativeToJsMessageQueue;
    webView.init(this, cordova);

    initWebViewSettings();

    nativeToJsMessageQueue.addBridgeMode(
      new NativeToJsMessageQueue.OnlineEventsBridgeMode(
        new NativeToJsMessageQueue.OnlineEventsBridgeMode.OnlineEventsBridgeModeDelegate() {
          @Override
          public void setNetworkAvailable(boolean value) {
            if (webView != null) {
              webView.setNetworkAvailable(value);
            }
          }

          @Override
          public void runOnUiThread(Runnable r) {
            SystemWebViewEngine.this.cordova.getActivity().runOnUiThread(r);
          }
        }
      )
    );
    nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.EvalBridgeMode(this, cordova));
    bridge = new CordovaBridge(pluginManager, nativeToJsMessageQueue);
    exposeJsInterface(webView, bridge);
  }

  @Override
  public CordovaWebView getCordovaWebView() {
    return parentWebView;
  }

  @Override
  public ICordovaCookieManager getCookieManager() {
    return cookieManager;
  }

  @Override
  public View getView() {
    return webView;
  }

  @SuppressLint({ "NewApi", "SetJavaScriptEnabled" })
  @SuppressWarnings("deprecation")
  private void initWebViewSettings() {
    webView.setInitialScale(0);
    webView.setVerticalScrollBarEnabled(false);

    final WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setJavaScriptCanOpenWindowsAutomatically(true);
    settings.setLayoutAlgorithm(LayoutAlgorithm.NORMAL);

    settings.setAllowFileAccess(true);

    String manufacturer = android.os.Build.MANUFACTURER;
    LOG.d(TAG, "CordovaWebView is running on device made by: " + manufacturer);

    settings.setSaveFormData(false);
    settings.setSavePassword(false);

    settings.setAllowUniversalAccessFromFileURLs(true);
    settings.setMediaPlaybackRequiresUserGesture(false);

    String databasePath = webView.getContext().getApplicationContext().getDir("database", Context.MODE_PRIVATE).getPath();
    settings.setDatabaseEnabled(true);
    settings.setDatabasePath(databasePath);

    ApplicationInfo appInfo = webView.getContext().getApplicationContext().getApplicationInfo();
    if ((appInfo.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
      enableRemoteDebugging();
    }

    settings.setGeolocationDatabasePath(databasePath);

    settings.setDomStorageEnabled(true);

    settings.setGeolocationEnabled(true);

    settings.setAppCacheMaxSize(5 * 1048576);
    settings.setAppCachePath(databasePath);
    settings.setAppCacheEnabled(true);

    String defaultUserAgent = settings.getUserAgentString();

    String overrideUserAgent = preferences.getString("OverrideUserAgent", null);
    if (overrideUserAgent != null) {
      settings.setUserAgentString(overrideUserAgent);
    } else {
      String appendUserAgent = preferences.getString("AppendUserAgent", null);
      if (appendUserAgent != null) {
        settings.setUserAgentString(defaultUserAgent + " " + appendUserAgent);
      }
    }

    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction(Intent.ACTION_CONFIGURATION_CHANGED);
    if (this.receiver == null) {
      this.receiver =
        new BroadcastReceiver() {
          @Override
          public void onReceive(Context context, Intent intent) {
            settings.getUserAgentString();
          }
        };
      webView.getContext().registerReceiver(this.receiver, intentFilter);
    }
  }

  private void enableRemoteDebugging() {
    try {
      WebView.setWebContentsDebuggingEnabled(true);
    } catch (IllegalArgumentException e) {
      LOG.d(TAG, "You have one job! To turn on Remote Web Debugging! YOU HAVE FAILED! ");
      e.printStackTrace();
    }
  }

  @SuppressLint("AddJavascriptInterface")
  private static void exposeJsInterface(WebView webView, CordovaBridge bridge) {
    SystemExposedJsApi exposedJsApi = new SystemExposedJsApi(bridge);
    webView.addJavascriptInterface(exposedJsApi, "_cordovaNative");
  }

  @Override
  public void loadUrl(final String url, boolean clearNavigationStack) {
    webView.loadUrl(url);
  }

  @Override
  public String getUrl() {
    return webView.getUrl();
  }

  @Override
  public void stopLoading() {
    webView.stopLoading();
  }

  @Override
  public void clearCache() {
    webView.clearCache(true);
  }

  @Override
  public void clearHistory() {
    webView.clearHistory();
  }

  @Override
  public boolean canGoBack() {
    return webView.canGoBack();
  }

  @Override
  public boolean goBack() {
    if (webView.canGoBack()) {
      webView.goBack();
      return true;
    }
    return false;
  }

  @Override
  public void setPaused(boolean value) {
    if (value) {
      webView.onPause();
      webView.pauseTimers();
    } else {
      webView.onResume();
      webView.resumeTimers();
    }
  }

  @Override
  public void destroy() {
    webView.chromeClient.destroyLastDialog();
    webView.destroy();

    if (receiver != null) {
      try {
        webView.getContext().unregisterReceiver(receiver);
      } catch (Exception e) {
        LOG.e(TAG, "Error unregistering configuration receiver: " + e.getMessage(), e);
      }
    }
  }

  @Override
  public void evaluateJavascript(String js, ValueCallback<String> callback) {
    webView.evaluateJavascript(js, callback);
  }
}
