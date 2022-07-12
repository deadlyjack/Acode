package org.apache.cordova;

import android.view.KeyEvent;
import android.view.View;
import android.webkit.ValueCallback;

public interface CordovaWebViewEngine {
  public void setInputType(int type);

  void init(CordovaWebView parentWebView, CordovaInterface cordova, Client client, CordovaResourceApi resourceApi, PluginManager pluginManager, NativeToJsMessageQueue nativeToJsMessageQueue);

  CordovaWebView getCordovaWebView();
  ICordovaCookieManager getCookieManager();
  View getView();

  void loadUrl(String url, boolean clearNavigationStack);

  void stopLoading();

  String getUrl();

  void clearCache();

  void clearHistory();

  boolean canGoBack();

  boolean goBack();

  void setPaused(boolean value);

  void destroy();

  void evaluateJavascript(String js, ValueCallback<String> callback);

  public interface EngineView {
    CordovaWebView getCordovaWebView();
  }

  public interface Client {
    Boolean onDispatchKeyEvent(KeyEvent event);
    void clearLoadTimeoutTimer();
    void onPageStarted(String newUrl);
    void onReceivedError(int errorCode, String description, String failingUrl);
    void onPageFinishedLoading(String url);
    boolean onNavigationAttempt(String url);
  }
}
