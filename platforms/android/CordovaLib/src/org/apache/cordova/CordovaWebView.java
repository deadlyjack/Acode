package org.apache.cordova;

import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.webkit.WebChromeClient.CustomViewCallback;
import java.util.List;
import java.util.Map;

public interface CordovaWebView {
  public void setInputType(int type);

  public static final String CORDOVA_VERSION = "9.1.0";

  void init(CordovaInterface cordova, List<PluginEntry> pluginEntries, CordovaPreferences preferences);

  boolean isInitialized();

  View getView();

  void loadUrlIntoView(String url, boolean recreatePlugins);

  void stopLoading();

  boolean canGoBack();

  void clearCache();

  @Deprecated
  void clearCache(boolean b);

  void clearHistory();

  boolean backHistory();

  void handlePause(boolean keepRunning);

  void onNewIntent(Intent intent);

  void handleResume(boolean keepRunning);

  void handleStart();

  void handleStop();

  void handleDestroy();

  @Deprecated
  void sendJavascript(String statememt);

  void showWebPage(String url, boolean openExternal, boolean clearHistory, Map<String, Object> params);

  @Deprecated
  boolean isCustomViewShowing();

  @Deprecated
  void showCustomView(View view, CustomViewCallback callback);

  @Deprecated
  void hideCustomView();

  CordovaResourceApi getResourceApi();

  void setButtonPlumbedToJs(int keyCode, boolean override);
  boolean isButtonPlumbedToJs(int keyCode);

  void sendPluginResult(PluginResult cr, String callbackId);

  PluginManager getPluginManager();
  CordovaWebViewEngine getEngine();
  CordovaPreferences getPreferences();
  ICordovaCookieManager getCookieManager();

  String getUrl();

  Context getContext();
  void loadUrl(String url);
  Object postMessage(String id, Object data);
}
