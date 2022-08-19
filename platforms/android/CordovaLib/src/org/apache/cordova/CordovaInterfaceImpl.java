/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/

package org.apache.cordova;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Pair;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Default implementation of CordovaInterface.
 */
public class CordovaInterfaceImpl implements CordovaInterface {
    private static final String TAG = "CordovaInterfaceImpl";
    protected AppCompatActivity activity;
    protected ExecutorService threadPool;
    protected PluginManager pluginManager;

    protected ActivityResultHolder savedResult;
    protected CallbackMap permissionResultCallbacks;
    protected CordovaPlugin activityResultCallback;
    protected String initCallbackService;
    protected int activityResultRequestCode;
    protected boolean activityWasDestroyed = false;
    protected Bundle savedPluginState;

    public CordovaInterfaceImpl(AppCompatActivity activity) {
        this(activity, Executors.newCachedThreadPool());
    }

    public CordovaInterfaceImpl(AppCompatActivity activity, ExecutorService threadPool) {
        this.activity = activity;
        this.threadPool = threadPool;
        this.permissionResultCallbacks = new CallbackMap();
    }

    @Override
    public void startActivityForResult(CordovaPlugin command, Intent intent, int requestCode) {
        setActivityResultCallback(command);
        try {
            activity.startActivityForResult(intent, requestCode);
        } catch (RuntimeException e) { // E.g.: ActivityNotFoundException
            activityResultCallback = null;
            throw e;
        }
    }

    @Override
    public void setActivityResultCallback(CordovaPlugin plugin) {
        // Cancel any previously pending activity.
        if (activityResultCallback != null) {
            activityResultCallback.onActivityResult(activityResultRequestCode, AppCompatActivity.RESULT_CANCELED, null);
        }
        activityResultCallback = plugin;
    }

    @Override
    public AppCompatActivity getActivity() {
        return activity;
    }

    @Override
    public Context getContext() {
        return activity;
    }

    @Override
    public Object onMessage(String id, Object data) {
        if ("exit".equals(id)) {
            activity.finish();
        }
        return null;
    }

    @Override
    public ExecutorService getThreadPool() {
        return threadPool;
    }

    /**
     * Dispatches any pending onActivityResult callbacks and sends the resume event if the
     * Activity was destroyed by the OS.
     */
    public void onCordovaInit(PluginManager pluginManager) {
        this.pluginManager = pluginManager;
        if (savedResult != null) {
            onActivityResult(savedResult.requestCode, savedResult.resultCode, savedResult.intent);
        } else if(activityWasDestroyed) {
            // If there was no Activity result, we still need to send out the resume event if the
            // Activity was destroyed by the OS
            activityWasDestroyed = false;
            if(pluginManager != null)
            {
                CoreAndroid appPlugin = (CoreAndroid) pluginManager.getPlugin(CoreAndroid.PLUGIN_NAME);
                if(appPlugin != null) {
                    JSONObject obj = new JSONObject();
                    try {
                        obj.put("action", "resume");
                    } catch (JSONException e) {
                        LOG.e(TAG, "Failed to create event message", e);
                    }
                    appPlugin.sendResumeEvent(new PluginResult(PluginResult.Status.OK, obj));
                }
            }

        }
    }

    /**
     * Routes the result to the awaiting plugin. Returns false if no plugin was waiting.
     */
    public boolean onActivityResult(int requestCode, int resultCode, Intent intent) {
        CordovaPlugin callback = activityResultCallback;
        if(callback == null && initCallbackService != null) {
            // The application was restarted, but had defined an initial callback
            // before being shut down.
            savedResult = new ActivityResultHolder(requestCode, resultCode, intent);
            if (pluginManager != null) {
                callback = pluginManager.getPlugin(initCallbackService);
                if(callback != null) {
                    callback.onRestoreStateForActivityResult(savedPluginState.getBundle(callback.getServiceName()),
                            new ResumeCallback(callback.getServiceName(), pluginManager));
                }
            }
        }
        activityResultCallback = null;

        if (callback != null) {
            LOG.d(TAG, "Sending activity result to plugin");
            initCallbackService = null;
            savedResult = null;
            callback.onActivityResult(requestCode, resultCode, intent);
            return true;
        }
        LOG.w(TAG, "Got an activity result, but no plugin was registered to receive it" + (savedResult != null ? " yet!" : "."));
        return false;
    }

    /**
     * Call this from your startActivityForResult() overload. This is required to catch the case
     * where plugins use Activity.startActivityForResult() + CordovaInterface.setActivityResultCallback()
     * rather than CordovaInterface.startActivityForResult().
     */
    public void setActivityResultRequestCode(int requestCode) {
        activityResultRequestCode = requestCode;
    }

    /**
     * Saves parameters for startActivityForResult().
     */
    public void onSaveInstanceState(Bundle outState) {
        if (activityResultCallback != null) {
            String serviceName = activityResultCallback.getServiceName();
            outState.putString("callbackService", serviceName);
        }
        if(pluginManager != null){
            outState.putBundle("plugin", pluginManager.onSaveInstanceState());
        }

    }

    /**
     * Call this from onCreate() so that any saved startActivityForResult parameters will be restored.
     */
    public void restoreInstanceState(Bundle savedInstanceState) {
        initCallbackService = savedInstanceState.getString("callbackService");
        savedPluginState = savedInstanceState.getBundle("plugin");
        activityWasDestroyed = true;
    }

    private static class ActivityResultHolder {
        private int requestCode;
        private int resultCode;
        private Intent intent;

        public ActivityResultHolder(int requestCode, int resultCode, Intent intent) {
            this.requestCode = requestCode;
            this.resultCode = resultCode;
            this.intent = intent;
        }
    }

    /**
     * Called by the system when the user grants permissions
     *
     * @param requestCode
     * @param permissions
     * @param grantResults
     */
    public void onRequestPermissionResult(int requestCode, String[] permissions,
                                          int[] grantResults) throws JSONException {
        Pair<CordovaPlugin, Integer> callback = permissionResultCallbacks.getAndRemoveCallback(requestCode);
        if(callback != null) {
            callback.first.onRequestPermissionResult(callback.second, permissions, grantResults);
        }
    }

    public void requestPermission(CordovaPlugin plugin, int requestCode, String permission) {
        String[] permissions = new String [1];
        permissions[0] = permission;
        requestPermissions(plugin, requestCode, permissions);
    }

        @SuppressLint("NewApi")
    public void requestPermissions(CordovaPlugin plugin, int requestCode, String [] permissions) {
        int mappedRequestCode = permissionResultCallbacks.registerCallback(plugin, requestCode);
        getActivity().requestPermissions(permissions, mappedRequestCode);
    }

    public boolean hasPermission(String permission)
    {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
        {
            int result = activity.checkSelfPermission(permission);
            return PackageManager.PERMISSION_GRANTED == result;
        }
        else
        {
            return true;
        }
    }
}
