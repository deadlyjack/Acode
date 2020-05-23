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

package de.appplant.cordova.plugin.localnotification;

import android.os.Bundle;
import android.support.v4.app.RemoteInput;

import org.json.JSONException;
import org.json.JSONObject;

import de.appplant.cordova.plugin.notification.Notification;
import de.appplant.cordova.plugin.notification.receiver.AbstractClickReceiver;

import static de.appplant.cordova.plugin.notification.Options.EXTRA_LAUNCH;
import static de.appplant.cordova.plugin.notification.Request.EXTRA_LAST;

/**
 * The receiver activity is triggered when a notification is clicked by a user.
 * The activity calls the background callback and brings the launch intent
 * up to foreground.
 */
public class ClickReceiver extends AbstractClickReceiver {

    /**
     * Called when local notification was clicked by the user.
     *
     * @param notification Wrapper around the local notification.
     * @param bundle       The bundled extras.
     */
    @Override
    public void onClick(Notification notification, Bundle bundle) {
        String action   = getAction();
        JSONObject data = new JSONObject();

        setTextInput(action, data);
        launchAppIf();

        LocalNotification.fireEvent(action, notification, data);

        if (notification.getOptions().isSticky())
            return;

        if (isLast()) {
            notification.cancel();
        } else {
            notification.clear();
        }
    }

    /**
     * Set the text if any remote input is given.
     *
     * @param action The action where to look for.
     * @param data   The object to extend.
     */
    private void setTextInput(String action, JSONObject data) {
        Bundle input = RemoteInput.getResultsFromIntent(getIntent());

        if (input == null)
            return;

        try {
            data.put("text", input.getString(action));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * Launch app if requested by user.
     */
    private void launchAppIf() {
        boolean doLaunch = getIntent().getBooleanExtra(EXTRA_LAUNCH, true);

        if (!doLaunch)
            return;

        launchApp();
    }

    /**
     * If the notification was the last scheduled one by request.
     */
    private boolean isLast() {
        return getIntent().getBooleanExtra(EXTRA_LAST, false);
    }

}
