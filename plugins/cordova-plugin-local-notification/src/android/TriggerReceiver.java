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

import android.content.Context;
import android.os.Bundle;
import android.os.PowerManager;

import de.appplant.cordova.plugin.notification.Builder;
import de.appplant.cordova.plugin.notification.Manager;
import de.appplant.cordova.plugin.notification.Notification;
import de.appplant.cordova.plugin.notification.Options;
import de.appplant.cordova.plugin.notification.Request;
import de.appplant.cordova.plugin.notification.receiver.AbstractTriggerReceiver;

import static android.content.Context.POWER_SERVICE;
import static android.os.Build.VERSION.SDK_INT;
import static android.os.Build.VERSION_CODES.LOLLIPOP;

/**
 * The alarm receiver is triggered when a scheduled alarm is fired. This class
 * reads the information in the intent and displays this information in the
 * Android notification bar. The notification uses the default notification
 * sound and it vibrates the phone.
 */
public class TriggerReceiver extends AbstractTriggerReceiver {

    /**
     * Called when a local notification was triggered. Does present the local
     * notification, re-schedule the alarm if necessary and fire trigger event.
     *
     * @param notification Wrapper around the local notification.
     * @param bundle       The bundled extras.
     */
    @Override
    public void onTrigger (Notification notification, Bundle bundle) {
        boolean isUpdate = bundle.getBoolean(Notification.EXTRA_UPDATE, false);
        Context context  = notification.getContext();
        Options options  = notification.getOptions();
        Manager manager  = Manager.getInstance(context);
        int badge        = options.getBadgeNumber();

        if (badge > 0) {
            manager.setBadge(badge);
        }

        if (options.shallWakeUp()) {
            wakeUp(context);
        }

        notification.show();

        if (options.isInfiniteTrigger()) {
            manager.schedule(new Request(options), this.getClass());
        }

        if (!isUpdate) {
            LocalNotification.fireEvent("trigger", notification);
        }
    }

    /**
     * Wakeup the device.
     *
     * @param context The application context.
     */
    private void wakeUp (Context context) {
        PowerManager pm = (PowerManager) context.getSystemService(POWER_SERVICE);

        if (pm == null)
            return;

        int level =   PowerManager.SCREEN_DIM_WAKE_LOCK
                    | PowerManager.ACQUIRE_CAUSES_WAKEUP;

        PowerManager.WakeLock wakeLock = pm.newWakeLock(
                level, "LocalNotification");

        wakeLock.setReferenceCounted(false);
        wakeLock.acquire(1000);

        if (SDK_INT >= LOLLIPOP) {
            wakeLock.release(PowerManager.RELEASE_FLAG_WAIT_FOR_NO_PROXIMITY);
        } else {
            wakeLock.release();
        }
    }

    /**
     * Build notification specified by options.
     *
     * @param builder Notification builder.
     * @param bundle  The bundled extras.
     */
    @Override
    public Notification buildNotification (Builder builder, Bundle bundle) {
        return builder
                .setClickActivity(ClickReceiver.class)
                .setClearReceiver(ClearReceiver.class)
                .setExtras(bundle)
                .build();
    }

}
