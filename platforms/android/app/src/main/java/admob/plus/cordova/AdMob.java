package admob.plus.cordova;

import android.app.Activity;
import android.content.res.Configuration;
import android.util.Log;

import com.google.android.gms.ads.MobileAds;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import admob.plus.cordova.Generated.Actions;
import admob.plus.cordova.ads.AdBase;
import admob.plus.cordova.ads.AppOpen;
import admob.plus.cordova.ads.Banner;
import admob.plus.cordova.ads.Interstitial;
import admob.plus.cordova.ads.Native;
import admob.plus.cordova.ads.Rewarded;
import admob.plus.cordova.ads.RewardedInterstitial;
import admob.plus.core.GenericAd;
import admob.plus.core.Helper;

import static admob.plus.core.Helper.ads;


public class AdMob extends CordovaPlugin implements Helper.Adapter {
    public static final String NATIVE_VIEW_DEFAULT = Native.VIEW_DEFAULT_KEY;
    private static final String TAG = "AdMobPlus";
    private final ArrayList<PluginResult> eventQueue = new ArrayList<PluginResult>();
    public Helper helper;
    private CallbackContext readyCallbackContext = null;

    public static void registerNativeAdViewProviders(Map<String, Native.ViewProvider> providers) {
        Native.providers.putAll(providers);
    }

    @Override
    protected void pluginInitialize() {
        super.pluginInitialize();
        Log.i(TAG, "Initialize plugin");

        helper = new Helper(this);
        ExecuteContext.plugin = this;
    }

    @Override
    public boolean execute(String actionKey, JSONArray args, CallbackContext callbackContext) {
        Log.d(TAG, String.format("Execute %s", actionKey));
        ExecuteContext ctx = new ExecuteContext(actionKey, args, callbackContext);

        switch (actionKey) {
            case Actions.READY:
                return executeReady(callbackContext);
            case Actions.START:
                MobileAds.initialize(cordova.getActivity(), status -> {
                    helper.configForTestLab();
                    callbackContext.success(new JSONObject(new HashMap<String, Object>() {{
                        put("version", MobileAds.getVersionString());
                    }}));
                });
                break;
            case Actions.CONFIGURE:
            case Actions.CONFIG_REQUEST:
                ctx.configure(helper);
                break;
            case Actions.AD_CREATE:
                String adClass = ctx.optString("cls");
                if (adClass == null) {
                    ctx.reject("ad cls is missing");
                } else {
                    GenericAd ad = null;
                    switch (adClass) {
                        case "AppOpenAd":
                            ad = new AppOpen(ctx);
                            break;
                        case "BannerAd":
                            ad = new Banner(ctx);
                            break;
                        case "InterstitialAd":
                            ad = new Interstitial(ctx);
                            break;
                        case "NativeAd":
                            ad = new Native(ctx);
                            break;
                        case "RewardedAd":
                            ad = new Rewarded(ctx);
                            break;
                        case "RewardedInterstitialAd":
                            ad = new RewardedInterstitial(ctx);
                            break;
                    }
                    if (ad != null) {
                        ctx.resolve();
                    } else {
                        ctx.reject("ad cls is not supported");
                    }
                }
                break;
            case Actions.AD_IS_LOADED:
                return executeAdIsLoaded_(ctx);
            case Actions.AD_LOAD:
                return executeAdLoad(ctx);
            case Actions.AD_SHOW:
                return executeAdShow(ctx);
            case Actions.AD_HIDE:
                return executeAdHide(ctx);
            case Actions.SET_APP_MUTED: {
                boolean value = args.optBoolean(0);
                MobileAds.setAppMuted(value);
                callbackContext.success();
                break;
            }
            case Actions.SET_APP_VOLUME: {
                float value = BigDecimal.valueOf(args.optDouble(0)).floatValue();
                MobileAds.setAppVolume(value);
                callbackContext.success();
                break;
            }
            default:
                return false;
        }

        return true;
    }

    private boolean executeReady(CallbackContext callbackContext) {
        if (readyCallbackContext == null) {
            for (PluginResult result : eventQueue) {
                callbackContext.sendPluginResult(result);
            }
            eventQueue.clear();
        } else {
            Log.e(TAG, "Ready action should only be called once.");
        }
        readyCallbackContext = callbackContext;
        emit(Generated.Events.READY, new HashMap<String, Object>() {{
            put("isRunningInTestLab", helper.isRunningInTestLab());
        }});
        return true;
    }

    private boolean executeAdIsLoaded_(ExecuteContext ctx) {
        cordova.getActivity().runOnUiThread(() -> {
            GenericAd ad = (GenericAd) ctx.optAdOrError();
            if (ad != null) {
                ctx.resolve(ad.isLoaded());
            }
        });
        return true;
    }

    private boolean executeAdLoad(ExecuteContext ctx) {
        cordova.getActivity().runOnUiThread(() -> {
            GenericAd ad = (GenericAd) ctx.optAdOrError();
            if (ad != null) {
                ad.load(ctx);
            }
        });
        return true;
    }

    private boolean executeAdShow(ExecuteContext ctx) {
        cordova.getActivity().runOnUiThread(() -> {
            GenericAd ad = (GenericAd) ctx.optAdOrError();
            if (ad != null) {
                if (ad.isLoaded()) {
                    ad.show(ctx);
                } else {
                    ctx.resolve(false);
                }
            }
        });
        return true;
    }

    private boolean executeAdHide(ExecuteContext ctx) {
        cordova.getActivity().runOnUiThread(() -> {
            GenericAd ad = (GenericAd) ctx.optAdOrError();
            if (ad != null) {
                ad.hide(ctx);
            }
        });
        return true;
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        for (int i = 0; i < ads.size(); i++) {
            AdBase ad = (AdBase) ads.valueAt(i);
            ad.onConfigurationChanged(newConfig);
        }
    }

    @Override
    public void onPause(boolean multitasking) {
        for (int i = 0; i < ads.size(); i++) {
            AdBase ad = (AdBase) ads.valueAt(i);
            ad.onPause(multitasking);
        }
        super.onPause(multitasking);
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
        for (int i = 0; i < ads.size(); i++) {
            AdBase ad = (AdBase) ads.valueAt(i);
            ad.onResume(multitasking);
        }
    }

    @Override
    public void onDestroy() {
        readyCallbackContext = null;

        for (int i = 0; i < ads.size(); i++) {
            AdBase ad = (AdBase) ads.valueAt(i);
            ad.onDestroy();
        }

        Banner.destroyParentView();

        super.onDestroy();
    }

    @Override
    public Activity getActivity() {
        return cordova.getActivity();
    }

    @Override
    public void emit(String eventName, Map<String, Object> data) {
        JSONObject event = new JSONObject(new HashMap<String, Object>() {{
            put("type", eventName);
            put("data", data);
        }});

        PluginResult result = new PluginResult(PluginResult.Status.OK, event);
        result.setKeepCallback(true);
        if (readyCallbackContext == null) {
            eventQueue.add(result);
        } else {
            readyCallbackContext.sendPluginResult(result);
        }
    }
}
