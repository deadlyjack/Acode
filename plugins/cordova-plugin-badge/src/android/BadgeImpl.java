/*
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 */

package de.appplant.cordova.plugin.badge;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

import me.leolin.shortcutbadger.ShortcutBadger;

import static me.leolin.shortcutbadger.ShortcutBadger.isBadgeCounterSupported;

/**
 * Implementation of the badge interface methods.
 */
@SuppressWarnings("WeakerAccess")
public final class BadgeImpl {

    // The name for the shared preferences key
    private static final String BADGE_KEY = "badge";

    // The name for the shared preferences key
    private static final String CONFIG_KEY = "badge.config";

    // The application context
    private final Context ctx;

    // if the device does support native badges
    private final boolean isSupported;

    /**
     * Initializes the impl with the context of the app.
     *
     * @param context The app context.
     */
    public BadgeImpl (Context context) {
        if (isBadgeCounterSupported(context)) {
            ctx         = context;
            isSupported = true;
        } else {
            ctx         = context.getApplicationContext();
            isSupported = isBadgeCounterSupported(ctx);
        }

        ShortcutBadger.applyCount(ctx, getBadge());
    }

    /**
     * Clear the badge number.
     */
    public void clearBadge() {
        saveBadge(0);
        ShortcutBadger.removeCount(ctx);
    }

    /**
     * Get the badge number.
     *
     * @return The badge number
     */
    public int getBadge() {
        return getPrefs().getInt(BADGE_KEY, 0);
    }

    /**
     * Check if the device/launcher does support badges.
     */
    public boolean isSupported() {
        return isSupported;
    }

    /**
     * Set the badge number.
     *
     * @param badge The number to set as the badge number.
     */
    public void setBadge (int badge) {
        saveBadge(badge);
        ShortcutBadger.applyCount(ctx, badge);
    }

    /**
     * Get the persisted config map.
     */
    public JSONObject loadConfig() {
        String json = getPrefs().getString(CONFIG_KEY, "{}");

        try {
            return new JSONObject(json);
        } catch (JSONException e) {
            return new JSONObject();
        }
    }

    /**
     * Persist the config map so that `autoClear` has same value after restart.
     *
     * @param config The config map to persist.
     */
    public void saveConfig (JSONObject config) {
        SharedPreferences.Editor editor = getPrefs().edit();

        editor.putString(CONFIG_KEY, config.toString());
        editor.apply();
    }

    /**
     * Persist the badge of the app icon so that `getBadge` is able to return
     * the badge number back to the client.
     *
     * @param badge The badge number to persist.
     */
    private void saveBadge (int badge) {
        SharedPreferences.Editor editor = getPrefs().edit();

        editor.putInt(BADGE_KEY, badge);
        editor.apply();
    }

    /**
     * The Local storage for the application.
     */
    private SharedPreferences getPrefs() {
        return ctx.getSharedPreferences(BADGE_KEY, Context.MODE_PRIVATE);
    }

}
