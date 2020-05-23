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

import de.appplant.cordova.plugin.notification.Notification;
import de.appplant.cordova.plugin.notification.receiver.AbstractClearReceiver;

import static de.appplant.cordova.plugin.notification.Request.EXTRA_LAST;

/**
 * The clear intent receiver is triggered when the user clears a
 * notification manually. It un-persists the cleared notification from the
 * shared preferences.
 */
public class ClearReceiver extends AbstractClearReceiver {

    /**
     * Called when a local notification was cleared from outside of the app.
     *
     * @param notification Wrapper around the local notification.
     * @param bundle       The bundled extras.
     */
    @Override
    public void onClear (Notification notification, Bundle bundle) {
        boolean isLast = bundle.getBoolean(EXTRA_LAST, false);

        if (isLast) {
            notification.cancel();
        } else {
            notification.clear();
        }

        LocalNotification.fireEvent("clear", notification);
    }

}
