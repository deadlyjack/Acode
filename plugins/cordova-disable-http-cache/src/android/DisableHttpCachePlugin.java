package com.koenromers.cordova;

import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;

public class DisableHttpCachePlugin extends CordovaPlugin {
  private static final String TAG = "DisableHttpCachePlugin";

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    Log.i(TAG, "initialize");
    super.initialize(cordova, webView);
    WebView wv = (WebView) webView.getView();
    WebSettings ws = wv.getSettings();
    ws.setAppCacheEnabled(false);
    ws.setCacheMode(WebSettings.LOAD_NO_CACHE);
  }
}
