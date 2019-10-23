/**
 * Copyright (c) 2015 Rareloop Ltd
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package com.rareloop.cordova.appversion;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import android.util.TypedValue;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.pm.PackageManager.NameNotFoundException;
import android.content.pm.PackageManager;

import android.util.Log;

/**
 * Cordova plugin that allows for an arbitrarly sized and positioned WebView to be shown ontop of the canvas
 */
public class RareloopAppVersion extends CordovaPlugin {

    private static final String TAG = "RareloopAppVersion";

    /**
     * Executes the request and returns PluginResult
     *
     * @param  action          
     * @param  args            
     * @param  callbackContext 
     * @return boolean                
     * @throws JSONException   
     */
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        /**
         * appVersion
         */
        if (action.equals("getAppVersion")) {

            try {            
                PackageManager packageManager = this.cordova.getActivity().getPackageManager();

                JSONObject r = new JSONObject();
                r.put("version", packageManager.getPackageInfo(this.cordova.getActivity().getPackageName(), 0).versionName);
                r.put("build", packageManager.getPackageInfo(this.cordova.getActivity().getPackageName(), 0).versionCode);

                callbackContext.success(r);
            } catch (NameNotFoundException e) {
                callbackContext.error("Exception thrown");
            }

            return true;
        }

        // Default response to say the action hasn't been handled
        return false;
    }
}