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

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.util.Pair;
import android.view.View;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

import de.appplant.cordova.plugin.notification.Manager;
import de.appplant.cordova.plugin.notification.Notification;
import de.appplant.cordova.plugin.notification.Options;
import de.appplant.cordova.plugin.notification.Request;
import de.appplant.cordova.plugin.notification.action.ActionGroup;

import static de.appplant.cordova.plugin.notification.Notification.Type.SCHEDULED;
import static de.appplant.cordova.plugin.notification.Notification.Type.TRIGGERED;

/**
 * This plugin utilizes the Android AlarmManager in combination with local
 * notifications. When a local notification is scheduled the alarm manager takes
 * care of firing the event. When the event is processed, a notification is put
 * in the Android notification center and status bar.
 */
@SuppressWarnings({"Convert2Diamond", "Convert2Lambda"})
public class LocalNotification extends CordovaPlugin {

    // Reference to the web view for static access
    private static WeakReference<CordovaWebView> webView = null;

    // Indicates if the device is ready (to receive events)
    private static Boolean deviceready = false;

    // Queues all events before deviceready
    private static ArrayList<String> eventQueue = new ArrayList<String>();

    // Launch details
    private static Pair<Integer, String> launchDetails;

    /**
     * Called after plugin construction and fields have been initialized.
     * Prefer to use pluginInitialize instead since there is no value in
     * having parameters on the initialize() function.
     */
    @Override
    public void initialize (CordovaInterface cordova, CordovaWebView webView) {
        LocalNotification.webView = new WeakReference<CordovaWebView>(webView);
    }

    /**
     * Called when the activity will start interacting with the user.
     *
     * @param multitasking Flag indicating if multitasking is turned on for app.
     */
    @Override
    public void onResume (boolean multitasking) {
        super.onResume(multitasking);
        deviceready();
    }

    /**
     * The final call you receive before your activity is destroyed.
     */
    @Override
    public void onDestroy() {
        deviceready = false;
    }

    /**
     * Executes the request.
     *
     * This method is called from the WebView thread. To do a non-trivial
     * amount of work, use:
     *      cordova.getThreadPool().execute(runnable);
     *
     * To run on the UI thread, use:
     *     cordova.getActivity().runOnUiThread(runnable);
     *
     * @param action  The action to execute.
     * @param args    The exec() arguments in JSON form.
     * @param command The callback context used when calling back into
     *                JavaScript.
     *
     * @return Whether the action was valid.
     */
    @Override
    public boolean execute (final String action, final JSONArray args,
                            final CallbackContext command) throws JSONException {

        if (action.equals("launch")) {
            launch(command);
            return true;
        }

        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                if (action.equals("ready")) {
                    deviceready();
                } else
                if (action.equalsIgnoreCase("check")) {
                    check(command);
                } else
                if (action.equalsIgnoreCase("request")) {
                    request(command);
                } else
                if (action.equalsIgnoreCase("actions")) {
                    actions(args.optJSONObject(0));
                    command.success();
                } else
                if (action.equalsIgnoreCase("schedule")) {
                    schedule(args);
                    check(command);
                } else
                if (action.equals("update")) {
                    update(args);
                    check(command);
                } else
                if (action.equals("cancel")) {
                    cancel(args);
                    command.success();
                } else
                if (action.equals("cancelAll")) {
                    cancelAll();
                    command.success();
                } else
                if (action.equals("clear")) {
                    clear(args);
                    command.success();
                } else
                if (action.equals("clearAll")) {
                    clearAll();
                    command.success();
                } else
                if (action.equals("type")) {
                    type(args.optInt(0), command);
                } else
                if (action.equals("ids")) {
                    ids(command);
                } else
                if (action.equals("scheduledIds")) {
                    scheduledIds(command);
                } else
                if (action.equals("triggeredIds")) {
                    triggeredIds(command);
                } else
                if (action.equals("notification")) {
                    notification(args.optInt(0), command);
                } else
                if (action.equals("notifications")) {
                    notifications(args, command);
                } else
                if (action.equals("scheduledNotifications")) {
                    scheduledNotifications(command);
                } else
                if (action.equals("triggeredNotifications")) {
                    triggeredNotifications(command);
                }
            }
        });

        return true;
    }

    /**
     * Set launchDetails object.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    @SuppressLint("DefaultLocale")
    private void launch(CallbackContext command) {
        if (launchDetails == null)
            return;

        JSONObject details = new JSONObject();

        try {
            details.put("id", launchDetails.first);
            details.put("action", launchDetails.second);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        command.success(details);

        launchDetails = null;
    }

    /**
     * Ask if user has enabled permission for local notifications.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void check (CallbackContext command) {
        boolean allowed     = getNotMgr().hasPermission();
        PluginResult result = new PluginResult(PluginResult.Status.OK, allowed);

        command.sendPluginResult(result);
    }

    /**
     * Request permission for local notifications.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void request (CallbackContext command) {
        check(command);
    }

    /**
     * Register action group.
     *
     * @param args The action group spec.
     */
    private void actions (JSONObject args) {
        ActionGroup group = ActionGroup.parse(cordova.getActivity(), args);

        if (group != null) {
            ActionGroup.register(group);
        }
    }

    /**
     * Schedule multiple local notifications.
     *
     * @param notifications The notifications to schedule.
     */
    private void schedule (JSONArray notifications) {
        Manager mgr = getNotMgr();

        for (int i = 0; i < notifications.length(); i++) {
            JSONObject dict = notifications.optJSONObject(i);
            Options options = new Options(dict);
            Request request = new Request(options);

            Notification notification =
                    mgr.schedule(request, TriggerReceiver.class);

            if (notification != null) {
                fireEvent("add", notification);
            }
        }
    }

    /**
     * Update multiple local notifications.
     *
     * @param updates Notification properties including their IDs
     */
    private void update (JSONArray updates) {
        for (int i = 0; i < updates.length(); i++) {
            JSONObject update = updates.optJSONObject(i);
            int id            = update.optInt("id", 0);

            Notification notification =
                    getNotMgr().update(id, update, TriggerReceiver.class);

            if (notification == null)
                continue;

            fireEvent("update", notification);
        }
    }

    /**
     * Cancel multiple local notifications.
     *
     * @param ids Set of local notification IDs
     */
    private void cancel (JSONArray ids) {
        for (int i = 0; i < ids.length(); i++) {
            int id = ids.optInt(i, 0);

            Notification notification =
                    getNotMgr().cancel(id);

            if (notification == null)
                continue;

            fireEvent("cancel", notification);
        }
    }

    /**
     * Cancel all scheduled notifications.
     */
    private void cancelAll() {
        getNotMgr().cancelAll();
        fireEvent("cancelall");
    }

    /**
     * Clear multiple local notifications without canceling them.
     *
     * @param ids Set of local notification IDs
     */
    private void clear(JSONArray ids){
        for (int i = 0; i < ids.length(); i++) {
            int id = ids.optInt(i, 0);

            Notification notification =
                    getNotMgr().clear(id);

            if (notification == null)
                continue;

            fireEvent("clear", notification);
        }
    }

    /**
     * Clear all triggered notifications without canceling them.
     */
    private void clearAll() {
        getNotMgr().clearAll();
        fireEvent("clearall");
    }

    /**
     * Get the type of the notification (unknown, scheduled, triggered).
     *
     * @param id      The ID of the notification to check.
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void type (int id, CallbackContext command) {
        Notification toast = getNotMgr().get(id);

        if (toast == null) {
            command.success("unknown");
            return;
        }

        switch (toast.getType()) {
            case SCHEDULED:
                command.success("scheduled");
                break;
            case TRIGGERED:
                command.success("triggered");
                break;
            default:
                command.success("unknown");
                break;
        }
    }

    /**
     * Set of IDs from all existent notifications.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void ids (CallbackContext command) {
        List<Integer> ids = getNotMgr().getIds();
        command.success(new JSONArray(ids));
    }

    /**
     * Set of IDs from all scheduled notifications.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void scheduledIds (CallbackContext command) {
        List<Integer> ids = getNotMgr().getIdsByType(SCHEDULED);
        command.success(new JSONArray(ids));
    }

    /**
     * Set of IDs from all triggered notifications.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void triggeredIds (CallbackContext command) {
        List<Integer> ids = getNotMgr().getIdsByType(TRIGGERED);
        command.success(new JSONArray(ids));
    }

    /**
     * Options from local notification.
     *
     * @param id      The ID of the notification.
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void notification (int id, CallbackContext command) {
        Options options = getNotMgr().getOptions(id);

        if (options != null) {
            command.success(options.getDict());
        } else {
            command.success();
        }
    }

    /**
     * Set of options from local notification.
     *
     * @param ids     Set of local notification IDs.
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void notifications (JSONArray ids, CallbackContext command) {
        List<JSONObject> options;

        if (ids.length() == 0) {
            options = getNotMgr().getOptions();
        } else {
            options = getNotMgr().getOptionsById(toList(ids));
        }

        command.success(new JSONArray(options));
    }

    /**
     * Set of options from scheduled notifications.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void scheduledNotifications (CallbackContext command) {
        List<JSONObject> options = getNotMgr().getOptionsByType(SCHEDULED);
        command.success(new JSONArray(options));
    }

    /**
     * Set of options from triggered notifications.
     *
     * @param command The callback context used when calling back into
     *                JavaScript.
     */
    private void triggeredNotifications (CallbackContext command) {
        List<JSONObject> options = getNotMgr().getOptionsByType(TRIGGERED);
        command.success(new JSONArray(options));
    }

    /**
     * Call all pending callbacks after the deviceready event has been fired.
     */
    private static synchronized void deviceready () {
        deviceready = true;

        for (String js : eventQueue) {
            sendJavascript(js);
        }

        eventQueue.clear();
    }

    /**
     * Fire given event on JS side. Does inform all event listeners.
     *
     * @param event The event name.
     */
    private void fireEvent (String event) {
        fireEvent(event, null, new JSONObject());
    }

    /**
     * Fire given event on JS side. Does inform all event listeners.
     *
     * @param event        The event name.
     * @param notification Optional notification to pass with.
     */
    static void fireEvent (String event, Notification notification) {
        fireEvent(event, notification, new JSONObject());
    }

    /**
     * Fire given event on JS side. Does inform all event listeners.
     *
     * @param event The event name.
     * @param toast Optional notification to pass with.
     * @param data  Event object with additional data.
     */
    static void fireEvent (String event, Notification toast, JSONObject data) {
        String params, js;

        try {
            data.put("event", event);
            data.put("foreground", isInForeground());
            data.put("queued", !deviceready);

            if (toast != null) {
                data.put("notification", toast.getId());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        if (toast != null) {
            params = toast.toString() + "," + data.toString();
        } else {
            params = data.toString();
        }

        js = "cordova.plugins.notification.local.core.fireEvent(" +
                "\"" + event + "\"," + params + ")";

        if (launchDetails == null && !deviceready && toast != null) {
            launchDetails = new Pair<Integer, String>(toast.getId(), event);
        }

        sendJavascript(js);
    }

    /**
     * Use this instead of deprecated sendJavascript
     *
     * @param js JS code snippet as string.
     */
    private static synchronized void sendJavascript(final String js) {

        if (!deviceready || webView == null) {
            eventQueue.add(js);
            return;
        }

        final CordovaWebView view = webView.get();

        ((Activity)(view.getContext())).runOnUiThread(new Runnable() {
            public void run() {
                view.loadUrl("javascript:" + js);
            }
        });
    }

    /**
     * If the app is running in foreground.
     */
    private static boolean isInForeground() {

        if (!deviceready || webView == null)
            return false;

        CordovaWebView view = webView.get();

        KeyguardManager km = (KeyguardManager) view.getContext()
                .getSystemService(Context.KEYGUARD_SERVICE);

        //noinspection SimplifiableIfStatement
        if (km != null && km.isKeyguardLocked())
            return false;

        return view.getView().getWindowVisibility() == View.VISIBLE;
    }

    /**
     * Convert JSON array of integers to List.
     *
     * @param ary Array of integers.
     */
    private List<Integer> toList (JSONArray ary) {
        List<Integer> list = new ArrayList<Integer>();

        for (int i = 0; i < ary.length(); i++) {
            list.add(ary.optInt(i));
        }

        return list;
    }

    /**
     * Notification manager instance.
     */
    private Manager getNotMgr() {
        return Manager.getInstance(cordova.getActivity());
    }

}
