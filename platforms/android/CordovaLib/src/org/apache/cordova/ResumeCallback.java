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


import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ResumeCallback extends CallbackContext {
    private final String TAG = "CordovaResumeCallback";
    private String serviceName;
    private PluginManager pluginManager;

    public ResumeCallback(String serviceName, PluginManager pluginManager) {
        super("resumecallback", null);
        this.serviceName = serviceName;
        this.pluginManager = pluginManager;
    }

    @Override
    public void sendPluginResult(PluginResult pluginResult) {
        synchronized (this) {
            if (finished) {
                LOG.w(TAG, serviceName + " attempted to send a second callback to ResumeCallback\nResult was: " + pluginResult.getMessage());
                return;
            } else {
                finished = true;
            }
        }

        JSONObject event = new JSONObject();
        JSONObject pluginResultObject = new JSONObject();

        try {
            pluginResultObject.put("pluginServiceName", this.serviceName);
            pluginResultObject.put("pluginStatus", PluginResult.StatusMessages[pluginResult.getStatus()]);

            event.put("action", "resume");
            event.put("pendingResult", pluginResultObject);
        } catch (JSONException e) {
            LOG.e(TAG, "Unable to create resume object for Activity Result");
        }

        PluginResult eventResult = new PluginResult(PluginResult.Status.OK, event);

        // We send a list of results to the js so that we don't have to decode
        // the PluginResult passed to this CallbackContext into JSON twice.
        // The results are combined into an event payload before the event is
        // fired on the js side of things (see platform.js)
        List<PluginResult> result = new ArrayList<PluginResult>();
        result.add(eventResult);
        result.add(pluginResult);

        CoreAndroid appPlugin = (CoreAndroid) pluginManager.getPlugin(CoreAndroid.PLUGIN_NAME);
        appPlugin.sendResumeEvent(new PluginResult(PluginResult.Status.OK, result));
    }
}
