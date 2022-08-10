package admob.plus.cordova.ads;

import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdLoader;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.nativead.NativeAd;
import com.google.android.gms.ads.nativead.NativeAdView;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import admob.plus.cordova.ExecuteContext;
import admob.plus.cordova.Generated.Events;
import admob.plus.core.Context;

import static admob.plus.core.Helper.dpToPx;

public class Native extends AdBase {
    public static final String VIEW_DEFAULT_KEY = "default";
    public static final Map<String, ViewProvider> providers = new HashMap<String, ViewProvider>();

    private final AdRequest mAdRequest;
    private final ViewProvider viewProvider;
    private AdLoader mLoader;
    private NativeAd mAd;
    private View view;

    public Native(ExecuteContext ctx) {
        super(ctx);

        mAdRequest = ctx.optAdRequest();
        String key = ctx.optString("view");
        if (key == null || "".equals(key)) {
            key = VIEW_DEFAULT_KEY;
        }
        viewProvider = providers.get(key);
        if (viewProvider == null) {
            throw new RuntimeException("cannot find viewProvider: " + key);
        }
    }

    @Override
    public void onDestroy() {
        clear();

        super.onDestroy();
    }

    @Override
    public boolean isLoaded() {
        return mLoader != null && !mLoader.isLoading();
    }

    @Override
    public void load(Context ctx) {
        clear();

        mLoader = new AdLoader.Builder(getActivity(), adUnitId)
                .forNativeAd(nativeAd -> {
                    mAd = nativeAd;
                })
                .withAdListener(new AdListener() {
                    @Override
                    public void onAdFailedToLoad(LoadAdError adError) {
                        emit(Events.AD_LOAD_FAIL, adError);
                        if (isLoaded()) {
                            ctx.reject(adError.toString());
                        }
                    }

                    public void onAdClosed() {
                        emit(Events.AD_DISMISS);
                    }

                    public void onAdOpened() {
                        emit(Events.AD_SHOW);
                    }

                    public void onAdLoaded() {
                        emit(Events.AD_LOAD);
                        if (isLoaded()) {
                            ctx.resolve();
                        }
                    }

                    public void onAdClicked() {
                        emit(Events.AD_CLICK);
                    }

                    public void onAdImpression() {
                        emit(Events.AD_IMPRESSION);
                    }
                })
                .build();
        mLoader.loadAd(mAdRequest);
    }

    @Override
    public void show(Context ctx) {
        if (view == null) {
            view = viewProvider.createView(mAd);
            Objects.requireNonNull(getContentView()).addView(view);
        }

        view.setVisibility(View.VISIBLE);
        view.setX((float) dpToPx(ctx.optDouble("x", 0.0)));
        view.setY((float) dpToPx(ctx.optDouble("y", 0.0)));
        ViewGroup.LayoutParams params = view.getLayoutParams();
        params.width = (int) dpToPx(ctx.optDouble("width", 0.0));
        params.height = (int) dpToPx(ctx.optDouble("height", 0.0));
        view.setLayoutParams(params);

        viewProvider.didShow(this);

        view.requestLayout();
        ctx.resolve(true);
    }

    @Override
    public void hide(Context ctx) {
        if (view != null) {
            view.setVisibility(View.GONE);
        }

        viewProvider.didHide(this);
        ctx.resolve();
    }

    private void clear() {
        if (mAd != null) {
            mAd.destroy();
            mAd = null;
        }
        if (view != null) {
            if (view instanceof NativeAdView) {
                NativeAdView v = (NativeAdView) view;
                v.removeAllViews();
                v.destroy();
            }
            view = null;
        }
        mLoader = null;
    }

    public interface ViewProvider {
        @NonNull
        View createView(NativeAd nativeAd);

        default void didShow(@NonNull Native ad) {
        }

        default void didHide(@NonNull Native ad) {
        }
    }
}
