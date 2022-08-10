package admob.plus.core;

import static admob.plus.core.Helper.NOT_IMPLEMENTED;

public interface GenericAd {
    default boolean isLoaded() {
        NOT_IMPLEMENTED();
        return false;
    }

    default void load(Context ctx) {
        NOT_IMPLEMENTED();
    }

    default void show(Context ctx) {
        NOT_IMPLEMENTED();
    }

    default void hide(Context ctx) {
        NOT_IMPLEMENTED();
    }
}