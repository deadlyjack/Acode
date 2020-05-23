/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
 *
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

package de.appplant.cordova.plugin.notification;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationCompat.MessagingStyle.Message;
import android.support.v4.media.session.MediaSessionCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import de.appplant.cordova.plugin.notification.action.Action;
import de.appplant.cordova.plugin.notification.action.ActionGroup;
import de.appplant.cordova.plugin.notification.util.AssetUtil;

import static android.support.v4.app.NotificationCompat.DEFAULT_LIGHTS;
import static android.support.v4.app.NotificationCompat.DEFAULT_SOUND;
import static android.support.v4.app.NotificationCompat.DEFAULT_VIBRATE;
import static android.support.v4.app.NotificationCompat.PRIORITY_MAX;
import static android.support.v4.app.NotificationCompat.PRIORITY_MIN;
import static android.support.v4.app.NotificationCompat.VISIBILITY_PUBLIC;
import static android.support.v4.app.NotificationCompat.VISIBILITY_SECRET;

/**
 * Wrapper around the JSON object passed through JS which contains all
 * possible option values. Class provides simple readers and more advanced
 * methods to convert independent values into platform specific values.
 */
public final class Options {

    // Key name for bundled sound extra
    static final String EXTRA_SOUND = "NOTIFICATION_SOUND";

    // Key name for bundled launch extra
    public static final String EXTRA_LAUNCH = "NOTIFICATION_LAUNCH";

    // Default icon path
    private static final String DEFAULT_ICON = "res://icon";

    // The original JSON object
    private final JSONObject options;

    // The application context
    private final Context context;

    // Asset util instance
    private final AssetUtil assets;

    /**
     * When creating without a context, various methods might not work well.
     *
     * @param options The options dict map.
     */
    public Options(JSONObject options) {
        this.options = options;
        this.context = null;
        this.assets  = null;
    }

    /**
     * Constructor
     *
     * @param context The application context.
     * @param options The options dict map.
     */
    Options(Context context, JSONObject options) {
        this.context = context;
        this.options = options;
        this.assets  = AssetUtil.getInstance(context);
    }

    /**
     * Application context.
     */
    public Context getContext () {
        return context;
    }

    /**
     * Wrapped JSON object.
     */
    public JSONObject getDict() {
        return options;
    }

    /**
     * JSON object as string.
     */
    public String toString() {
        return options.toString();
    }

    /**
     * Gets the ID for the local notification.
     *
     * @return 0 if the user did not specify.
     */
    public Integer getId() {
        return options.optInt("id", 0);
    }

    /**
     * The identifier for the local notification.
     *
     * @return The notification ID as the string
     */
    String getIdentifier() {
        return getId().toString();
    }

    /**
     * Badge number for the local notification.
     */
    public int getBadgeNumber() {
        return options.optInt("badge", 0);
    }

    /**
     * Number for the local notification.
     */
    public int getNumber() {
        return options.optInt("number", 0);
    }

    /**
     * ongoing flag for local notifications.
     */
    public Boolean isSticky() {
        return options.optBoolean("sticky", false);
    }

    /**
     * autoClear flag for local notifications.
     */
    Boolean isAutoClear() {
        return options.optBoolean("autoClear", false);
    }

    /**
     * Gets the raw trigger spec as provided by the user.
     */
    public JSONObject getTrigger() {
        return options.optJSONObject("trigger");
    }

    /**
     * Gets the value of the silent flag.
     */
    boolean isSilent() {
        return options.optBoolean("silent", false);
    }

    /**
     * The group for that notification.
     */
    String getGroup() {
        return options.optString("group", null);
    }

    /**
     * launch flag for the notification.
     */
    boolean isLaunchingApp() {
        return options.optBoolean("launch", true);
    }

    /**
     * wakeup flag for the notification.
     */
    public boolean shallWakeUp() {
        return options.optBoolean("wakeup", true);
    }

    /**
     * The channel id of that notification.
     */
    String getChannel() {
        return options.optString("channel", Manager.CHANNEL_ID);
    }

    /**
     * If the group shall show a summary.
     */
    boolean getGroupSummary() {
        return options.optBoolean("groupSummary", false);
    }

    /**
     * Text for the local notification.
     */
    public String getText() {
        Object text = options.opt("text");
        return text instanceof String ? (String) text : "";
    }

    /**
     * Title for the local notification.
     */
    public String getTitle() {
        String title = options.optString("title", "");

        if (title.isEmpty()) {
            title = context.getApplicationInfo().loadLabel(
                    context.getPackageManager()).toString();
        }

        return title;
    }

    /**
     * The notification color for LED.
     */
    int getLedColor() {
        Object cfg = options.opt("led");
        String hex = null;

        if (cfg instanceof String) {
            hex = options.optString("led");
        } else
        if (cfg instanceof JSONArray) {
            hex = options.optJSONArray("led").optString(0);
        } else
        if (cfg instanceof JSONObject) {
            hex = options.optJSONObject("led").optString("color");
        }

        if (hex == null)
            return 0;

        try {
            hex      = stripHex(hex);
            int aRGB = Integer.parseInt(hex, 16);

            return aRGB + 0xFF000000;
        } catch (NumberFormatException e) {
            e.printStackTrace();
        }

        return 0;
    }

    /**
     * The notification color for LED.
     */
    int getLedOn() {
        Object cfg = options.opt("led");
        int defVal = 1000;

        if (cfg instanceof JSONArray)
            return options.optJSONArray("led").optInt(1, defVal);

        if (cfg instanceof JSONObject)
            return options.optJSONObject("led").optInt("on", defVal);

        return defVal;
    }

    /**
     * The notification color for LED.
     */
    int getLedOff() {
        Object cfg = options.opt("led");
        int defVal = 1000;

        if (cfg instanceof JSONArray)
            return options.optJSONArray("led").optInt(2, defVal);

        if (cfg instanceof JSONObject)
            return options.optJSONObject("led").optInt("off", defVal);

        return defVal;
    }

    /**
     * The notification background color for the small icon.
     *
     * @return null, if no color is given.
     */
    public int getColor() {
        String hex = options.optString("color", null);

        if (hex == null)
            return NotificationCompat.COLOR_DEFAULT;

        try {
            hex = stripHex(hex);

            if (hex.matches("[^0-9]*")) {
                return Color.class
                        .getDeclaredField(hex.toUpperCase())
                        .getInt(null);
            }

            int aRGB = Integer.parseInt(hex, 16);
            return aRGB + 0xFF000000;
        } catch (NumberFormatException e) {
            e.printStackTrace();
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

        return NotificationCompat.COLOR_DEFAULT;
    }

    /**
     * Sound file path for the local notification.
     */
    Uri getSound() {
        return assets.parse(options.optString("sound", null));
    }

    /**
     * Icon resource ID for the local notification.
     */
    boolean hasLargeIcon() {
        String icon = options.optString("icon", null);
        return icon != null;
    }

    /**
     * Icon bitmap for the local notification.
     */
    Bitmap getLargeIcon() {
        String icon = options.optString("icon", null);
        Uri uri     = assets.parse(icon);
        Bitmap bmp  = null;

        try {
            bmp = assets.getIconFromUri(uri);
        } catch (Exception e){
            e.printStackTrace();
        }

        return bmp;
    }

    /**
     * Small icon resource ID for the local notification.
     */
    int getSmallIcon() {
        String icon = options.optString("smallIcon", DEFAULT_ICON);
        int resId   = assets.getResId(icon);

        if (resId == 0) {
            resId = assets.getResId(DEFAULT_ICON);
        }

        if (resId == 0) {
            resId = context.getApplicationInfo().icon;
        }

        if (resId == 0) {
            resId = android.R.drawable.ic_popup_reminder;
        }

        return resId;
    }

    /**
     * If the phone should vibrate.
     */
    private boolean isWithVibration() {
        return options.optBoolean("vibrate", true);
    }

    /**
     * If the phone should play no sound.
     */
    private boolean isWithoutSound() {
        Object value = options.opt("sound");
        return value == null || value.equals(false);
    }

    /**
     * If the phone should play the default sound.
     */
    private boolean isWithDefaultSound() {
        Object value = options.opt("sound");
        return value != null && value.equals(true);
    }

    /**
     * If the phone should show no LED light.
     */
    private boolean isWithoutLights() {
        Object value = options.opt("led");
        return value == null || value.equals(false);
    }

    /**
     * If the phone should show the default LED lights.
     */
    private boolean isWithDefaultLights() {
        Object value = options.opt("led");
        return value != null && value.equals(true);
    }

    /**
     * Set the default notification options that will be used.
     * The value should be one or more of the following fields combined with
     * bitwise-or: DEFAULT_SOUND, DEFAULT_VIBRATE, DEFAULT_LIGHTS.
     */
    int getDefaults() {
        int defaults = options.optInt("defaults", 0);

        if (isWithVibration()) {
            defaults |= DEFAULT_VIBRATE;
        } else {
            defaults &= DEFAULT_VIBRATE;
        }

        if (isWithDefaultSound()) {
            defaults |= DEFAULT_SOUND;
        } else
        if (isWithoutSound()) {
            defaults &= DEFAULT_SOUND;
        }

        if (isWithDefaultLights()) {
            defaults |= DEFAULT_LIGHTS;
        } else
        if (isWithoutLights()) {
            defaults &= DEFAULT_LIGHTS;
        }

        return defaults;
    }

    /**
     * Gets the visibility for the notification.
     *
     * @return VISIBILITY_PUBLIC or VISIBILITY_SECRET
     */
    int getVisibility() {
        if (options.optBoolean("lockscreen", true)) {
            return VISIBILITY_PUBLIC;
        } else {
            return VISIBILITY_SECRET;
        }
    }

    /**
     * Gets the notifications priority.
     */
    int getPriority() {
        int prio = options.optInt("priority");

        return Math.min(Math.max(prio, PRIORITY_MIN), PRIORITY_MAX);
    }

    /**
     * If the notification shall show the when date.
     */
    boolean getShowWhen() {
        return options.optBoolean("showWhen", true);
    }

    /**
     * If the notification shall display a progress bar.
     */
    boolean isWithProgressBar() {
        return options
                .optJSONObject("progressBar")
                .optBoolean("enabled", false);
    }

    /**
     * Gets the progress value.
     *
     * @return 0 by default.
     */
    int getProgressValue() {
        return options
                .optJSONObject("progressBar")
                .optInt("value", 0);
    }

    /**
     * Gets the progress value.
     *
     * @return 100 by default.
     */
    int getProgressMaxValue() {
        return options
                .optJSONObject("progressBar")
                .optInt("maxValue", 100);
    }

    /**
     * Gets the progress indeterminate value.
     *
     * @return false by default.
     */
    boolean isIndeterminateProgress() {
        return options
                .optJSONObject("progressBar")
                .optBoolean("indeterminate", false);
    }

    /**
     * If the trigger shall be infinite.
     */
    public boolean isInfiniteTrigger() {
        JSONObject trigger = options.optJSONObject("trigger");

        return trigger.has("every") && trigger.optInt("count", -1) < 0;
    }

    /**
     * The summary for inbox style notifications.
     */
    String getSummary() {
        return options.optString("summary", null);
    }

    /**
     * Image attachments for image style notifications.
     *
     * @return For now it only returns the first item as Android does not
     *         support multiple attachments like iOS.
     */
    List<Bitmap> getAttachments() {
        JSONArray paths   = options.optJSONArray("attachments");
        List<Bitmap> pics = new ArrayList<Bitmap>();

        if (paths == null)
            return pics;

        for (int i = 0; i < paths.length(); i++) {
            Uri uri = assets.parse(paths.optString(i));

            if (uri == Uri.EMPTY)
                continue;

            try {
                Bitmap pic = assets.getIconFromUri(uri);
                pics.add(pic);
                break;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return pics;
    }

    /**
     * Gets the list of actions to display.
     */
    Action[] getActions() {
        String groupId    = options.optString("actionGroupId", null);
        JSONArray actions = options.optJSONArray("actions");
        ActionGroup group = null;

        if (actions != null && actions.length() > 0) {
            group = ActionGroup.parse(context, options);
        }

        if (group == null && groupId != null) {
            group = ActionGroup.lookup(groupId);
        }

        if (group != null) {
            ActionGroup.register(group);
            return group.getActions();
        }

        return null;
    }

    /**
     * Gets the list of messages to display.
     *
     * @return null if there are no messages.
     */
    Message[] getMessages() {
        Object text = options.opt("text");

        if (text == null || text instanceof String)
            return null;

        JSONArray list = (JSONArray) text;

        if (list.length() == 0)
            return null;

        Message[] messages = new Message[list.length()];
        long now           = new Date().getTime();

        for (int i = 0; i < messages.length; i++) {
            JSONObject msg = list.optJSONObject(i);
            String message = msg.optString("message");
            long timestamp = msg.optLong("date", now);
            String person  = msg.optString("person", null);

            messages[i] = new Message(message, timestamp, person);
        }

        return messages;
    }

    /**
     * Gets the token for the specified media session.
     *
     * @return null if there no session.
     */
    MediaSessionCompat.Token getMediaSessionToken() {
        String tag = options.optString("mediaSession", null);

        if (tag == null)
            return null;

        MediaSessionCompat session = new MediaSessionCompat(context, tag);

        return session.getSessionToken();
    }

    /**
     * Strips the hex code #FF00FF => FF00FF
     *
     * @param hex The hex code to strip.
     *
     * @return The stripped hex code without a leading #
     */
    private String stripHex(String hex) {
        return (hex.charAt(0) == '#') ? hex.substring(1) : hex;
    }

}
