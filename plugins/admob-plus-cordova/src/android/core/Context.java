package admob.plus.core;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.ads.mediation.admob.AdMobAdapter;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.rewarded.ServerSideVerificationOptions;

import org.json.JSONObject;

import java.util.List;
import java.util.Objects;

public interface Context {
    @Nullable
    static Integer intFromBool(Context ctx, String name, int vNull, int vTrue, int vFalse) {
        if (!ctx.has(name)) return null;
        final Boolean v = ctx.optBoolean(name);
        if (v == null) return vNull;
        return v ? vTrue : vFalse;
    }

    boolean has(@NonNull String name);

    @Nullable
    Object opt(@NonNull String name);

    @Nullable
    Boolean optBoolean(@NonNull String name);

    @Nullable
    Double optDouble(@NonNull String name);

    default double optDouble(@NonNull String name, double defaultValue) {
        final Double v = optDouble(name);
        if (v == null) return defaultValue;
        return v;
    }

    @Nullable
    default Float optFloat(@NonNull String name) {
        final Double v = optDouble(name);
        if (v == null) return null;
        return v.floatValue();
    }

    @Nullable
    Integer optInt(@NonNull String name);

    @Nullable
    String optString(@NonNull String name);

    @NonNull
    List<String> optStringList(@NonNull String name);

    @Nullable
    JSONObject optObject(@NonNull String name);

    void resolve();

    void resolve(boolean data);

    void reject(String msg);

    default void reject() {
        reject("unknown error");
    }

    default void reject(@NonNull LoadAdError loadAdError) {
        reject(loadAdError.getMessage());
    }

    @Nullable
    default Integer optId() {
        return this.optInt("id");
    }

    @Nullable
    default Ad optAd() {
        return Helper.getAd(optId());
    }

    @Nullable
    default Ad optAdOrError() {
        Ad ad = optAd();
        if (ad == null) {
            this.reject("Ad not found");
        }
        return ad;
    }

    @Nullable
    default String optAdUnitID() {
        return this.optString("adUnitId");
    }

    @Nullable
    default Boolean optAppMuted() {
        return this.optBoolean("appMuted");
    }

    @Nullable
    default Float optAppVolume() {
        return this.optFloat("appVolume");
    }

    @Nullable
    default String optPosition() {
        return this.optString("position");
    }

    @NonNull
    default AdRequest optAdRequest() {
        AdRequest.Builder builder = new AdRequest.Builder();
        if (this.has("contentUrl")) {
            builder.setContentUrl(Objects.requireNonNull(this.optString("contentUrl")));
        }
        Bundle extras = new Bundle();
        if (this.has("npa")) {
            extras.putString("npa", this.optString("npa"));
        }
        return builder.addNetworkExtrasBundle(AdMobAdapter.class, extras).build();
    }

    @NonNull
    default RequestConfiguration optRequestConfiguration() {
        final RequestConfiguration.Builder builder = new RequestConfiguration.Builder();
        if (this.has("maxAdContentRating")) {
            builder.setMaxAdContentRating(this.optString("maxAdContentRating"));
        }
        final Integer tagForChildDirectedTreatment = intFromBool(this, "tagForChildDirectedTreatment",
                RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_UNSPECIFIED,
                RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE,
                RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_FALSE);
        if (tagForChildDirectedTreatment != null) {
            builder.setTagForChildDirectedTreatment(tagForChildDirectedTreatment);
        }
        final Integer tagForUnderAgeOfConsent = intFromBool(this, "tagForUnderAgeOfConsent",
                RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_UNSPECIFIED,
                RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE,
                RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_FALSE);
        if (tagForUnderAgeOfConsent != null) {
            builder.setTagForUnderAgeOfConsent(tagForUnderAgeOfConsent);
        }
        if (this.has("testDeviceIds")) {
            builder.setTestDeviceIds(this.optStringList("testDeviceIds"));
        }
        return builder.build();
    }

    @Nullable
    default ServerSideVerificationOptions optServerSideVerificationOptions() {
        final String param = "serverSideVerification";
        JSONObject serverSideVerification = this.optObject(param);
        if (serverSideVerification == null) return null;

        ServerSideVerificationOptions.Builder builder = new ServerSideVerificationOptions.Builder();
        if (serverSideVerification.has("customData")) {
            builder.setCustomData(serverSideVerification.optString("customData"));
        }
        if (serverSideVerification.has("userId")) {
            builder.setUserId(serverSideVerification.optString("userId"));
        }
        return builder.build();
    }

    default void configure(Helper helper) {
        Boolean appMuted = optAppMuted();
        if (appMuted != null) {
            MobileAds.setAppMuted(appMuted);
        }
        Float appVolume = optAppVolume();
        if (appVolume != null) {
            MobileAds.setAppVolume(appVolume);
        }
        MobileAds.setRequestConfiguration(optRequestConfiguration());
        helper.configForTestLab();
        resolve();
    }
}
