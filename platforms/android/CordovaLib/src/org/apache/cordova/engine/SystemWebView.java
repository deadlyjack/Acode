package org.apache.cordova.engine;

import android.content.Context;
import android.text.InputType;
import android.util.AttributeSet;
import android.view.KeyEvent;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaWebViewEngine;

public class SystemWebView extends WebView implements CordovaWebViewEngine.EngineView {

  private SystemWebViewClient viewClient;
  private int type = -1;
  private int NO_SUGGESTIONS = 0;
  private int NO_SUGGESTIONS_AGGRESSIVE = 1;
  SystemWebChromeClient chromeClient;
  private SystemWebViewEngine parentEngine;
  private CordovaInterface cordova;

  public SystemWebView(Context context) {
    this(context, null);
  }

  public SystemWebView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  public void setInputType(int type) {
    this.type = type;
  }

  @Override
  public InputConnection onCreateInputConnection(EditorInfo outAttrs) {
    InputConnection ic = super.onCreateInputConnection(outAttrs);
    if (type == NO_SUGGESTIONS) {
      outAttrs.inputType |= InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS;
    } else if (type == NO_SUGGESTIONS_AGGRESSIVE) {
      outAttrs.inputType = InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS | InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD;
    } else {
      outAttrs.inputType |= InputType.TYPE_NULL;
    }
    return ic;
  }

  void init(SystemWebViewEngine parentEngine, CordovaInterface cordova) {
    this.cordova = cordova;
    this.parentEngine = parentEngine;
    if (this.viewClient == null) {
      setWebViewClient(new SystemWebViewClient(parentEngine));
    }

    if (this.chromeClient == null) {
      setWebChromeClient(new SystemWebChromeClient(parentEngine));
    }
  }

  @Override
  public CordovaWebView getCordovaWebView() {
    return parentEngine != null ? parentEngine.getCordovaWebView() : null;
  }

  @Override
  public void setWebViewClient(WebViewClient client) {
    viewClient = (SystemWebViewClient) client;
    super.setWebViewClient(client);
  }

  @Override
  public void setWebChromeClient(WebChromeClient client) {
    chromeClient = (SystemWebChromeClient) client;
    super.setWebChromeClient(client);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent event) {
    Boolean ret = parentEngine.client.onDispatchKeyEvent(event);
    if (ret != null) {
      return ret.booleanValue();
    }
    return super.dispatchKeyEvent(event);
  }
}
