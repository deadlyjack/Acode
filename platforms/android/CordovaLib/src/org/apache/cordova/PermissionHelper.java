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

import java.util.Arrays;

import org.json.JSONException;

import android.content.pm.PackageManager;

/**
 * This class provides reflective methods for permission requesting and checking so that plugins
 * written for cordova-android 5.0.0+ can still compile with earlier cordova-android versions.
 */
public class PermissionHelper {
    private static final String LOG_TAG = "CordovaPermissionHelper";

    /**
     * Requests a "dangerous" permission for the application at runtime. This is a helper method
     * alternative to cordovaInterface.requestPermission() that does not require the project to be
     * built with cordova-android 5.0.0+
     *
     * @param plugin        The plugin the permission is being requested for
     * @param requestCode   A requestCode to be passed to the plugin's onRequestPermissionResult()
     *                      along with the result of the permission request
     * @param permission    The permission to be requested
     */
    public static void requestPermission(CordovaPlugin plugin, int requestCode, String permission) {
        PermissionHelper.requestPermissions(plugin, requestCode, new String[] {permission});
    }

    /**
     * Requests "dangerous" permissions for the application at runtime. This is a helper method
     * alternative to cordovaInterface.requestPermissions() that does not require the project to be
     * built with cordova-android 5.0.0+
     *
     * @param plugin        The plugin the permissions are being requested for
     * @param requestCode   A requestCode to be passed to the plugin's onRequestPermissionResult()
     *                      along with the result of the permissions request
     * @param permissions   The permissions to be requested
     */
    public static void requestPermissions(CordovaPlugin plugin, int requestCode, String[] permissions) {
        plugin.cordova.requestPermissions(plugin, requestCode, permissions);
    }

    /**
     * Checks at runtime to see if the application has been granted a permission. This is a helper
     * method alternative to cordovaInterface.hasPermission() that does not require the project to
     * be built with cordova-android 5.0.0+
     *
     * @param plugin        The plugin the permission is being checked against
     * @param permission    The permission to be checked
     *
     * @return              True if the permission has already been granted and false otherwise
     */
    public static boolean hasPermission(CordovaPlugin plugin, String permission) {
        return plugin.cordova.hasPermission(permission);
    }

    private static void deliverPermissionResult(CordovaPlugin plugin, int requestCode, String[] permissions) {
        // Generate the request results
        int[] requestResults = new int[permissions.length];
        Arrays.fill(requestResults, PackageManager.PERMISSION_GRANTED);

        try {
            plugin.onRequestPermissionResult(requestCode, permissions, requestResults);
        } catch (JSONException e) {
            LOG.e(LOG_TAG, "JSONException when delivering permissions results", e);
        }
    }
}