package admob.plus.cordova.ads;

import android.annotation.SuppressLint;
import android.content.res.Configuration;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver.OnPreDrawListener;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;

import java.util.HashMap;

import admob.plus.cordova.ExecuteContext;
import admob.plus.cordova.Generated.Events;
import admob.plus.core.Context;

import static admob.plus.core.Helper.getParentView;
import static admob.plus.core.Helper.pxToDp;
import static admob.plus.core.Helper.removeFromParentView;

public class Banner extends AdBase {
    private static final String TAG = "AdMobPlus.Banner";
    @SuppressLint("StaticFieldLeak")
    private static ViewGroup rootLinearLayout;
    private static int screenWidth = 0;

    private final AdSize adSize;
    private final int gravity;
    private final Integer offset;
    private AdView mAdView;
    private RelativeLayout mRelativeLayout = null;
    private AdView mAdViewOld = null;

    public Banner(ExecuteContext ctx) {
        super(ctx);

        this.adSize = ctx.optAdSize();
        this.gravity = "top".equals(ctx.optPosition()) ? Gravity.TOP : Gravity.BOTTOM;
        this.offset = ctx.optOffset();
    }

    public static void destroyParentView() {
        ViewGroup vg = getParentView(rootLinearLayout);
        if (vg != null) vg.removeAllViews();
        rootLinearLayout = null;
    }

    private static void runJustBeforeBeingDrawn(final View view, final Runnable runnable) {
        final OnPreDrawListener preDrawListener = new OnPreDrawListener() {
            @Override
            public boolean onPreDraw() {
                view.getViewTreeObserver().removeOnPreDrawListener(this);
                runnable.run();
                return true;
            }
        };
        view.getViewTreeObserver().addOnPreDrawListener(preDrawListener);
    }

    @Override
    public boolean isLoaded() {
        return mAdView != null;
    }

    @Override
    public void load(Context ctx) {
        if (mAdView == null) {
            mAdView = createBannerView();
        }

        mAdView.loadAd(adRequest);
        ctx.resolve();
    }

    private AdView createBannerView() {
        AdView adView = new AdView(getActivity());
        adView.setAdUnitId(adUnitId);
        adView.setAdSize(adSize);
        adView.setAdListener(new AdListener() {
            @Override
            public void onAdClicked() {
                emit(Events.AD_CLICK);
                emit(Events.BANNER_CLICK);
            }

            @Override
            public void onAdClosed() {
                emit(Events.AD_DISMISS);
                emit(Events.BANNER_CLOSE);
            }

            @Override
            public void onAdFailedToLoad(LoadAdError error) {
                emit(Events.AD_LOAD_FAIL, error);
                emit(Events.BANNER_LOAD_FAIL, error);
            }

            @Override
            public void onAdImpression() {
                emit(Events.AD_IMPRESSION);
                emit(Events.BANNER_IMPRESSION);
            }

            @Override
            public void onAdLoaded() {
                if (mAdViewOld != null) {
                    removeBannerView(mAdViewOld);
                    mAdViewOld = null;
                }

                runJustBeforeBeingDrawn(adView, () -> emit(Events.BANNER_SIZE, computeAdSize()));

                emit(Events.AD_LOAD, computeAdSize());
                emit(Events.BANNER_LOAD);
            }

            @Override
            public void onAdOpened() {
                emit(Events.AD_SHOW);
                emit(Events.BANNER_OPEN);
            }
        });
        return adView;
    }

    @NonNull
    private HashMap<String, Object> computeAdSize() {
        int width = mAdView.getWidth();
        int height = mAdView.getHeight();

        return new HashMap<String, Object>() {{
            put("size", new HashMap<String, Object>() {{
                put("width", pxToDp(width));
                put("height", pxToDp(height));
                put("widthInPixels", width);
                put("heightInPixels", height);
            }});
        }};
    }

    @Override
    public void show(Context ctx) {
        if (mAdView.getParent() == null) {
            addBannerView();
        } else if (mAdView.getVisibility() == View.GONE) {
            mAdView.resume();
            mAdView.setVisibility(View.VISIBLE);
        } else {
            ViewGroup wvParentView = getParentView(getWebView());
            if (rootLinearLayout != wvParentView) {
                removeFromParentView(rootLinearLayout);
                addBannerView();
            }
        }

        ctx.resolve();
    }

    @Override
    public void hide(Context ctx) {
        if (mAdView != null) {
            mAdView.pause();
            mAdView.setVisibility(View.GONE);
        }
        ctx.resolve();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        int w = getActivity().getResources().getDisplayMetrics().widthPixels;
        if (w != screenWidth) {
            screenWidth = w;
            getActivity().runOnUiThread(this::reloadBannerView);
        }
    }

    private void reloadBannerView() {
        if (mAdView == null || mAdView.getVisibility() == View.GONE) return;

        pauseBannerViews();
        if (mAdViewOld != null) removeBannerView(mAdViewOld);
        mAdViewOld = mAdView;

        mAdView = createBannerView();
        mAdView.loadAd(adRequest);
        addBannerView();
    }

    @Override
    public void onPause(boolean multitasking) {
        pauseBannerViews();
        super.onPause(multitasking);
    }

    private void pauseBannerViews() {
        if (mAdView != null) mAdView.pause();
        if (mAdViewOld != null && mAdViewOld != mAdView) {
            mAdViewOld.pause();
        }
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
        resumeBannerViews();
    }

    private void resumeBannerViews() {
        if (mAdView != null) mAdView.resume();
        if (mAdViewOld != null) mAdViewOld.resume();
    }

    @Override
    public void onDestroy() {
        if (mAdView != null) {
            removeBannerView(mAdView);
            mAdView = null;
        }
        if (mAdViewOld != null) {
            removeBannerView(mAdViewOld);
            mAdViewOld = null;
        }
        if (mRelativeLayout != null) {
            removeFromParentView(mRelativeLayout);
            mRelativeLayout = null;
        }

        super.onDestroy();
    }

    private void removeBannerView(@NonNull AdView adView) {
        removeFromParentView(adView);
        adView.removeAllViews();
        adView.destroy();
    }

    private void addBannerView() {
        if (mAdView == null) return;
        if (this.offset == null) {
            if (getParentView(mAdView) == rootLinearLayout && rootLinearLayout != null) return;
            addBannerViewWithLinearLayout();
        } else {
            if (getParentView(mAdView) == mRelativeLayout && mRelativeLayout != null) return;
            addBannerViewWithRelativeLayout();
        }

        ViewGroup contentView = getContentView();
        if (contentView != null) {
            contentView.bringToFront();
            contentView.requestLayout();
            contentView.requestFocus();
        }
    }

    private void addBannerViewWithLinearLayout() {
        View webView = getWebView();
        ViewGroup wvParentView = getParentView(webView);
        if (rootLinearLayout == null) {
            rootLinearLayout = new LinearLayout(getActivity());
        }

        if (wvParentView != null && wvParentView != rootLinearLayout) {
            wvParentView.removeView(webView);
            LinearLayout content = (LinearLayout) rootLinearLayout;
            content.setOrientation(LinearLayout.VERTICAL);
            rootLinearLayout.setLayoutParams(new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    0.0F));
            webView.setLayoutParams(new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    1.0F));
            rootLinearLayout.addView(webView);

            ViewGroup view = getParentView(rootLinearLayout);
            if (view != wvParentView) {
                removeFromParentView(rootLinearLayout);
                wvParentView.addView(rootLinearLayout);
            }
        }

        removeFromParentView(mAdView);
        if (isPositionTop()) {
            rootLinearLayout.addView(mAdView, 0);
        } else {
            rootLinearLayout.addView(mAdView);
        }

        ViewGroup contentView = getContentView();
        if (contentView != null) {
            for (int i = 0; i < contentView.getChildCount(); i++) {
                View view = contentView.getChildAt(i);
                if (view instanceof RelativeLayout) {
                    view.bringToFront();
                }
            }
        }
    }

    private void addBannerViewWithRelativeLayout() {
        RelativeLayout.LayoutParams paramsContent = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT);
        paramsContent.addRule(isPositionTop() ? RelativeLayout.ALIGN_PARENT_TOP : RelativeLayout.ALIGN_PARENT_BOTTOM);

        if (mRelativeLayout == null) {
            mRelativeLayout = new RelativeLayout(getActivity());
            RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(
                    RelativeLayout.LayoutParams.MATCH_PARENT,
                    RelativeLayout.LayoutParams.MATCH_PARENT);
            if (isPositionTop()) {
                params.setMargins(0, this.offset, 0, 0);
            } else {
                params.setMargins(0, 0, 0, this.offset);
            }

            ViewGroup contentView = getContentView();
            if (contentView != null) {
                contentView.addView(mRelativeLayout, params);
            } else {
                Log.e(TAG, "Unable to find content view");
            }
        }

        removeFromParentView(mAdView);
        mRelativeLayout.addView(mAdView, paramsContent);
        mRelativeLayout.bringToFront();
    }

    private boolean isPositionTop() {
        return gravity == Gravity.TOP;
    }

    public enum AdSizeType {
        BANNER, LARGE_BANNER, MEDIUM_RECTANGLE, FULL_BANNER, LEADERBOARD, SMART_BANNER;

        @Nullable
        public static AdSize getAdSize(int adSize) {
            switch (AdSizeType.values()[adSize]) {
                case BANNER:
                    return AdSize.BANNER;
                case LARGE_BANNER:
                    return AdSize.LARGE_BANNER;
                case MEDIUM_RECTANGLE:
                    return AdSize.MEDIUM_RECTANGLE;
                case FULL_BANNER:
                    return AdSize.FULL_BANNER;
                case LEADERBOARD:
                    return AdSize.LEADERBOARD;
                case SMART_BANNER:
                    return AdSize.SMART_BANNER;
                default:
                    return null;
            }
        }
    }
}
