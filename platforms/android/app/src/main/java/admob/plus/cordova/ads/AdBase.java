package admob.plus.cordova.ads;

import android.app.Activity;
import android.content.res.Configuration;
import android.view.View;
import android.view.ViewGroup;

import com.google.android.gms.ads.AdRequest;

import org.apache.cordova.CordovaWebView;

import admob.plus.cordova.ExecuteContext;
import admob.plus.core.Ad;
import admob.plus.core.GenericAd;
import admob.plus.core.Helper;

public abstract class AdBase extends Ad implements GenericAd  {
    protected AdRequest adRequest;

    public AdBase(ExecuteContext ctx) {
        super(ctx);
        adRequest = ctx.optAdRequest();
    }

    public void onConfigurationChanged(Configuration newConfig) {
    }

    public void onPause(boolean multitasking) {
    }

    public void onResume(boolean multitasking) {
    }

    public void onDestroy() {
        super.destroy();
    }

    protected CordovaWebView getCordovaWebView() {
        return ExecuteContext.plugin.webView;
    }

    protected View getWebView() {
        return getCordovaWebView().getView();
    }

    protected ViewGroup getWebViewParent() {
        return (ViewGroup) getWebView().getParent();
    }

    @Override
    protected Helper.Adapter getAdapter() {
        return ExecuteContext.plugin;
    }
}
