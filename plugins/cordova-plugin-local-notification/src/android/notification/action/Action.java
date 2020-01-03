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

package de.appplant.cordova.plugin.notification.action;

import android.content.Context;
import android.support.v4.app.RemoteInput;

import org.json.JSONArray;
import org.json.JSONObject;

import de.appplant.cordova.plugin.notification.util.AssetUtil;

/**
 * Holds the icon and title components that would be used in a
 * NotificationCompat.Action object. Does not include the PendingIntent so
 * that it may be generated each time the notification is built. Necessary to
 * compensate for missing functionality in the support library.
 */
public final class Action {

    // Key name for bundled extras
    public static final String EXTRA_ID = "NOTIFICATION_ACTION_ID";

    // The id for the click action
    public static final String CLICK_ACTION_ID = "click";

    // The application context
    private final Context context;

    // The action spec
    private final JSONObject options;

    /**
     * Structure to encapsulate a named action that can be shown as part of
     * this notification.
     *
     * @param context The application context.
     * @param options The action options.
     */
    Action (Context context, JSONObject options) {
        this.context = context;
        this.options = options;
    }

    /**
     * Gets the ID for the action.
     */
    public String getId() {
        return options.optString("id", getTitle());
    }

    /**
     * Gets the Title for the action.
     */
    public String getTitle() {
        return options.optString("title", "unknown");
    }

    /**
     * Gets the icon for the action.
     */
    public int getIcon() {
        AssetUtil assets = AssetUtil.getInstance(context);
        String resPath   = options.optString("icon");
        int resId        = assets.getResId(resPath);

        if (resId == 0) {
            resId = android.R.drawable.screen_background_dark;
        }

        return resId;
    }

    /**
     * Gets the value of the launch flag.
     */
    public boolean isLaunchingApp() {
        return options.optBoolean("launch", false);
    }

    /**
     * Gets the type for the action.
     */
    public boolean isWithInput() {
        String type = options.optString("type");
        return type.equals("input");
    }

    /**
     * Gets the input config in case of the action is of type input.
     */
    public RemoteInput getInput() {
        return new RemoteInput.Builder(getId())
                .setLabel(options.optString("emptyText"))
                .setAllowFreeFormInput(options.optBoolean("editable", true))
                .setChoices(getChoices())
                .build();
    }

    /**
     * List of possible choices for input actions.
     */
    private String[] getChoices() {
        JSONArray opts = options.optJSONArray("choices");

        if (opts == null)
            return null;

        String[] choices = new String[opts.length()];

        for (int i = 0; i < choices.length; i++) {
            choices[i] = opts.optString(i);
        }

        return choices;
    }

}