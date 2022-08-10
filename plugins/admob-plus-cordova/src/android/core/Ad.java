package admob.plus.core;

import android.app.Activity;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.rewarded.RewardItem;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static admob.plus.core.Helper.ads;

public abstract class Ad {
    public final int id;
    public final String adUnitId;

    public Ad(int id, @NonNull String adUnitId) {
        this.id = id;
        this.adUnitId = adUnitId;
        ads.put(id, this);
    }

    public Ad(Context ctx) {
        this(Objects.requireNonNull(ctx.optId()), Objects.requireNonNull(ctx.optAdUnitID()));
    }

    public void destroy() {
        ads.remove(id);
    }

    protected abstract Helper.Adapter getAdapter();

    public Activity getActivity() {
        return getAdapter().getActivity();
    }

    @Nullable
    public ViewGroup getContentView() {
        return getActivity().findViewById(android.R.id.content);
    }

    protected void emit(String eventName) {
        this.emit(eventName, new HashMap<String, Object>());
    }

    protected void emit(String eventName, AdError error) {
        this.emit(eventName, new HashMap<String, Object>() {{
            put("code", error.getCode());
            put("message", error.getMessage());
            put("cause", error.getCause());
        }});
    }

    protected void emit(String eventName, RewardItem rewardItem) {
        this.emit(eventName, new HashMap<String, Object>() {{
            put("reward", new HashMap<String, Object>() {{
                put("amount", rewardItem.getAmount());
                put("type", rewardItem.getType());
            }});
        }});
    }

    protected void emit(String eventName, Map<String, Object> data) {
        getAdapter().emit(eventName, new HashMap<String, Object>(data) {{
            put("adId", id);
        }});
    }
}