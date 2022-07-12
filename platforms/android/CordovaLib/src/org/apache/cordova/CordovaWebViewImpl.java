package org.apache.cordova;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.widget.FrameLayout;
import java.lang.reflect.Constructor;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.cordova.engine.SystemWebViewEngine;
import org.json.JSONException;
import org.json.JSONObject;

public class CordovaWebViewImpl implements CordovaWebView {

  public static final String TAG = "CordovaWebViewImpl";

  private PluginManager pluginManager;

  protected final CordovaWebViewEngine engine;
  private CordovaInterface cordova;

  private int loadUrlTimeout = 0;

  private CordovaResourceApi resourceApi;
  private CordovaPreferences preferences;
  private CoreAndroid appPlugin;
  private NativeToJsMessageQueue nativeToJsMessageQueue;
  private EngineClient engineClient = new EngineClient();
  private boolean hasPausedEver;

  String loadedUrl;

  private View mCustomView;
  private WebChromeClient.CustomViewCallback mCustomViewCallback;

  private Set<Integer> boundKeyCodes = new HashSet<Integer>();

  public static CordovaWebViewEngine createEngine(Context context, CordovaPreferences preferences) {
    String className = preferences.getString("webview", SystemWebViewEngine.class.getCanonicalName());
    try {
      Class<?> webViewClass = Class.forName(className);
      Constructor<?> constructor = webViewClass.getConstructor(Context.class, CordovaPreferences.class);
      return (CordovaWebViewEngine) constructor.newInstance(context, preferences);
    } catch (Exception e) {
      throw new RuntimeException("Failed to create webview. ", e);
    }
  }

  public CordovaWebViewImpl(CordovaWebViewEngine cordovaWebViewEngine) {
    this.engine = cordovaWebViewEngine;
  }

  public void setInputType(int type) {
    engine.setInputType(type);
  }

  public void init(CordovaInterface cordova) {
    init(cordova, new ArrayList<PluginEntry>(), new CordovaPreferences());
  }

  @SuppressLint("Assert")
  @Override
  public void init(CordovaInterface cordova, List<PluginEntry> pluginEntries, CordovaPreferences preferences) {
    if (this.cordova != null) {
      throw new IllegalStateException();
    }
    this.cordova = cordova;
    this.preferences = preferences;
    pluginManager = new PluginManager(this, this.cordova, pluginEntries);
    resourceApi = new CordovaResourceApi(engine.getView().getContext(), pluginManager);
    nativeToJsMessageQueue = new NativeToJsMessageQueue();
    nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.NoOpBridgeMode());
    nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.LoadUrlBridgeMode(engine, cordova));

    if (preferences.getBoolean("DisallowOverscroll", false)) {
      engine.getView().setOverScrollMode(View.OVER_SCROLL_NEVER);
    }
    engine.init(this, cordova, engineClient, resourceApi, pluginManager, nativeToJsMessageQueue);

    assert engine.getView() instanceof CordovaWebViewEngine.EngineView;

    pluginManager.addService(CoreAndroid.PLUGIN_NAME, "org.apache.cordova.CoreAndroid");
    pluginManager.init();
  }

  @Override
  public boolean isInitialized() {
    return cordova != null;
  }

  @Override
  public void loadUrlIntoView(final String url, boolean recreatePlugins) {
    LOG.d(TAG, ">>> loadUrl(" + url + ")");
    if (url.equals("about:blank") || url.startsWith("javascript:")) {
      engine.loadUrl(url, false);
      return;
    }

    recreatePlugins = recreatePlugins || (loadedUrl == null);

    if (recreatePlugins) {
      if (loadedUrl != null) {
        appPlugin = null;
        pluginManager.init();
      }
      loadedUrl = url;
    }

    final int currentLoadUrlTimeout = loadUrlTimeout;
    final int loadUrlTimeoutValue = preferences.getInteger("LoadUrlTimeoutValue", 20000);

    final Runnable loadError = new Runnable() {
      public void run() {
        stopLoading();
        LOG.e(TAG, "CordovaWebView: TIMEOUT ERROR!");

        JSONObject data = new JSONObject();
        try {
          data.put("errorCode", -6);
          data.put("description", "The connection to the server was unsuccessful.");
          data.put("url", url);
        } catch (JSONException e) {}
        pluginManager.postMessage("onReceivedError", data);
      }
    };

    final Runnable timeoutCheck = new Runnable() {
      public void run() {
        try {
          synchronized (this) {
            wait(loadUrlTimeoutValue);
          }
        } catch (InterruptedException e) {
          e.printStackTrace();
        }

        if (loadUrlTimeout == currentLoadUrlTimeout && cordova.getActivity() != null) {
          cordova.getActivity().runOnUiThread(loadError);
        } else if (cordova.getActivity() == null) {
          LOG.d(TAG, "Cordova activity does not exist.");
        }
      }
    };

    if (cordova.getActivity() != null) {
      final boolean _recreatePlugins = recreatePlugins;
      cordova
        .getActivity()
        .runOnUiThread(
          new Runnable() {
            public void run() {
              if (loadUrlTimeoutValue > 0) {
                cordova.getThreadPool().execute(timeoutCheck);
              }
              engine.loadUrl(url, _recreatePlugins);
            }
          }
        );
    } else {
      LOG.d(TAG, "Cordova activity does not exist.");
    }
  }

  @Override
  public void loadUrl(String url) {
    loadUrlIntoView(url, true);
  }

  @Override
  public void showWebPage(String url, boolean openExternal, boolean clearHistory, Map<String, Object> params) {
    LOG.d(TAG, "showWebPage(%s, %b, %b, HashMap)", url, openExternal, clearHistory);

    if (clearHistory) {
      engine.clearHistory();
    }

    if (!openExternal) {
      if (pluginManager.shouldAllowNavigation(url)) {
        loadUrlIntoView(url, true);
        return;
      } else {
        LOG.w(TAG, "showWebPage: Refusing to load URL into webview since it is not in the <allow-navigation> whitelist. URL=" + url);
        return;
      }
    }
    if (!pluginManager.shouldOpenExternalUrl(url)) {
      LOG.w(TAG, "showWebPage: Refusing to send intent for URL since it is not in the <allow-intent> whitelist. URL=" + url);
      return;
    }

    Intent intent = null;
    try {
      if (url.startsWith("intent://")) {
        intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
      } else {
        intent = new Intent(Intent.ACTION_VIEW);

        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        Uri uri = Uri.parse(url);

        if ("file".equals(uri.getScheme())) {
          intent.setDataAndType(uri, resourceApi.getMimeType(uri));
        } else {
          intent.setData(uri);
        }
      }
      if (cordova.getActivity() != null) {
        cordova.getActivity().startActivity(intent);
      } else {
        LOG.d(TAG, "Cordova activity does not exist.");
      }
    } catch (URISyntaxException e) {
      LOG.e(TAG, "Error parsing url " + url, e);
    } catch (ActivityNotFoundException e) {
      if (url.startsWith("intent://") && intent != null && intent.getStringExtra("browser_fallback_url") != null) {
        showWebPage(intent.getStringExtra("browser_fallback_url"), openExternal, clearHistory, params);
      } else {
        LOG.e(TAG, "Error loading url " + url, e);
      }
    }
  }

  private static class WrapperView extends FrameLayout {

    private final CordovaWebViewEngine engine;

    public WrapperView(Context context, CordovaWebViewEngine engine) {
      super(context);
      this.engine = engine;
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
      boolean ret = engine.getView().dispatchKeyEvent(event);
      if (!ret) {
        ret = super.dispatchKeyEvent(event);
      }
      return ret;
    }
  }

  @Override
  @Deprecated
  public void showCustomView(View view, WebChromeClient.CustomViewCallback callback) {
    LOG.d(TAG, "showing Custom View");

    if (mCustomView != null) {
      callback.onCustomViewHidden();
      return;
    }

    WrapperView wrapperView = new WrapperView(getContext(), engine);
    wrapperView.addView(view);

    mCustomView = wrapperView;
    mCustomViewCallback = callback;

    ViewGroup parent = (ViewGroup) engine.getView().getParent();
    parent.addView(wrapperView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, Gravity.CENTER));

    engine.getView().setVisibility(View.GONE);

    parent.setVisibility(View.VISIBLE);
    parent.bringToFront();
  }

  @Override
  @Deprecated
  public void hideCustomView() {
    if (mCustomView == null) return;
    LOG.d(TAG, "Hiding Custom View");

    mCustomView.setVisibility(View.GONE);

    ViewGroup parent = (ViewGroup) engine.getView().getParent();
    parent.removeView(mCustomView);
    mCustomView = null;
    mCustomViewCallback.onCustomViewHidden();

    engine.getView().setVisibility(View.VISIBLE);
  }

  @Override
  @Deprecated
  public boolean isCustomViewShowing() {
    return mCustomView != null;
  }

  @Override
  @Deprecated
  public void sendJavascript(String statement) {
    nativeToJsMessageQueue.addJavaScript(statement);
  }

  @Override
  public void sendPluginResult(PluginResult cr, String callbackId) {
    nativeToJsMessageQueue.addPluginResult(cr, callbackId);
  }

  @Override
  public PluginManager getPluginManager() {
    return pluginManager;
  }

  @Override
  public CordovaPreferences getPreferences() {
    return preferences;
  }

  @Override
  public ICordovaCookieManager getCookieManager() {
    return engine.getCookieManager();
  }

  @Override
  public CordovaResourceApi getResourceApi() {
    return resourceApi;
  }

  @Override
  public CordovaWebViewEngine getEngine() {
    return engine;
  }

  @Override
  public View getView() {
    return engine.getView();
  }

  @Override
  public Context getContext() {
    return engine.getView().getContext();
  }

  private void sendJavascriptEvent(String event) {
    if (appPlugin == null) {
      appPlugin = (CoreAndroid) pluginManager.getPlugin(CoreAndroid.PLUGIN_NAME);
    }

    if (appPlugin == null) {
      LOG.w(TAG, "Unable to fire event without existing plugin");
      return;
    }
    appPlugin.fireJavascriptEvent(event);
  }

  @Override
  public void setButtonPlumbedToJs(int keyCode, boolean override) {
    switch (keyCode) {
      case KeyEvent.KEYCODE_VOLUME_DOWN:
      case KeyEvent.KEYCODE_VOLUME_UP:
      case KeyEvent.KEYCODE_BACK:
      case KeyEvent.KEYCODE_MENU:
        if (override) {
          boundKeyCodes.add(keyCode);
        } else {
          boundKeyCodes.remove(keyCode);
        }
        return;
      default:
        throw new IllegalArgumentException("Unsupported keycode: " + keyCode);
    }
  }

  @Override
  public boolean isButtonPlumbedToJs(int keyCode) {
    return boundKeyCodes.contains(keyCode);
  }

  @Override
  public Object postMessage(String id, Object data) {
    return pluginManager.postMessage(id, data);
  }

  @Override
  public String getUrl() {
    return engine.getUrl();
  }

  @Override
  public void stopLoading() {
    loadUrlTimeout++;
  }

  @Override
  public boolean canGoBack() {
    return engine.canGoBack();
  }

  @Override
  public void clearCache() {
    engine.clearCache();
  }

  @Override
  @Deprecated
  public void clearCache(boolean b) {
    engine.clearCache();
  }

  @Override
  public void clearHistory() {
    engine.clearHistory();
  }

  @Override
  public boolean backHistory() {
    return engine.goBack();
  }

  @Override
  public void onNewIntent(Intent intent) {
    if (this.pluginManager != null) {
      this.pluginManager.onNewIntent(intent);
    }
  }

  @Override
  public void handlePause(boolean keepRunning) {
    if (!isInitialized()) {
      return;
    }
    hasPausedEver = true;
    pluginManager.onPause(keepRunning);
    sendJavascriptEvent("pause");

    if (!keepRunning) {
      engine.setPaused(true);
    }
  }

  @Override
  public void handleResume(boolean keepRunning) {
    if (!isInitialized()) {
      return;
    }

    engine.setPaused(false);
    this.pluginManager.onResume(keepRunning);

    if (hasPausedEver) {
      sendJavascriptEvent("resume");
    }
  }

  @Override
  public void handleStart() {
    if (!isInitialized()) {
      return;
    }
    pluginManager.onStart();
  }

  @Override
  public void handleStop() {
    if (!isInitialized()) {
      return;
    }
    pluginManager.onStop();
  }

  @Override
  public void handleDestroy() {
    if (!isInitialized()) {
      return;
    }

    loadUrlTimeout++;

    this.pluginManager.onDestroy();

    this.loadUrl("about:blank");

    engine.destroy();
    hideCustomView();
  }

  protected class EngineClient implements CordovaWebViewEngine.Client {

    @Override
    public void clearLoadTimeoutTimer() {
      loadUrlTimeout++;
    }

    @Override
    public void onPageStarted(String newUrl) {
      LOG.d(TAG, "onPageDidNavigate(" + newUrl + ")");
      boundKeyCodes.clear();
      pluginManager.onReset();
      pluginManager.postMessage("onPageStarted", newUrl);
    }

    @Override
    public void onReceivedError(int errorCode, String description, String failingUrl) {
      clearLoadTimeoutTimer();
      JSONObject data = new JSONObject();
      try {
        data.put("errorCode", errorCode);
        data.put("description", description);
        data.put("url", failingUrl);
      } catch (JSONException e) {
        e.printStackTrace();
      }
      pluginManager.postMessage("onReceivedError", data);
    }

    @Override
    public void onPageFinishedLoading(String url) {
      LOG.d(TAG, "onPageFinished(" + url + ")");

      clearLoadTimeoutTimer();

      pluginManager.postMessage("onPageFinished", url);

      if (engine.getView().getVisibility() != View.VISIBLE) {
        Thread t = new Thread(
          new Runnable() {
            public void run() {
              try {
                Thread.sleep(2000);
                if (cordova.getActivity() != null) {
                  cordova
                    .getActivity()
                    .runOnUiThread(
                      new Runnable() {
                        public void run() {
                          pluginManager.postMessage("spinner", "stop");
                        }
                      }
                    );
                } else {
                  LOG.d(TAG, "Cordova activity does not exist.");
                }
              } catch (InterruptedException e) {}
            }
          }
        );
        t.start();
      }

      if (url.equals("about:blank")) {
        pluginManager.postMessage("exit", null);
      }
    }

    @Override
    public Boolean onDispatchKeyEvent(KeyEvent event) {
      int keyCode = event.getKeyCode();
      boolean isBackButton = keyCode == KeyEvent.KEYCODE_BACK;
      if (event.getAction() == KeyEvent.ACTION_DOWN) {
        if (isBackButton && mCustomView != null) {
          return true;
        } else if (boundKeyCodes.contains(keyCode)) {
          return true;
        } else if (isBackButton) {
          return engine.canGoBack();
        }
      } else if (event.getAction() == KeyEvent.ACTION_UP) {
        if (isBackButton && mCustomView != null) {
          hideCustomView();
          return true;
        } else if (boundKeyCodes.contains(keyCode)) {
          String eventName = null;
          switch (keyCode) {
            case KeyEvent.KEYCODE_VOLUME_DOWN:
              eventName = "volumedownbutton";
              break;
            case KeyEvent.KEYCODE_VOLUME_UP:
              eventName = "volumeupbutton";
              break;
            case KeyEvent.KEYCODE_SEARCH:
              eventName = "searchbutton";
              break;
            case KeyEvent.KEYCODE_MENU:
              eventName = "menubutton";
              break;
            case KeyEvent.KEYCODE_BACK:
              eventName = "backbutton";
              break;
          }
          if (eventName != null) {
            sendJavascriptEvent(eventName);
            return true;
          }
        } else if (isBackButton) {
          return engine.goBack();
        }
      }
      return null;
    }

    @Override
    public boolean onNavigationAttempt(String url) {
      if (pluginManager.onOverrideUrlLoading(url)) {
        return true;
      } else if (pluginManager.shouldAllowNavigation(url)) {
        return false;
      } else if (pluginManager.shouldOpenExternalUrl(url)) {
        showWebPage(url, true, false, null);
        return true;
      }
      LOG.w(TAG, "Blocked (possibly sub-frame) navigation to non-allowed URL: " + url);
      return true;
    }
  }
}
