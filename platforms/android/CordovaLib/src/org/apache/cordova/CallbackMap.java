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

import android.util.Pair;
import android.util.SparseArray;

/**
 * Provides a collection that maps unique request codes to CordovaPlugins and Integers.
 * Used to ensure that when plugins make requests for runtime permissions, those requests do not
 * collide with requests from other plugins that use the same request code value.
 */
public class CallbackMap {
    private int currentCallbackId = 0;
    private SparseArray<Pair<CordovaPlugin, Integer>> callbacks;

    public CallbackMap() {
        this.callbacks = new SparseArray<Pair<CordovaPlugin, Integer>>();
    }

    /**
     * Stores a CordovaPlugin and request code and returns a new unique request code to use
     * in a permission request.
     *
     * @param receiver      The plugin that is making the request
     * @param requestCode   The original request code used by the plugin
     * @return              A unique request code that can be used to retrieve this callback
     *                      with getAndRemoveCallback()
     */
    public synchronized int registerCallback(CordovaPlugin receiver, int requestCode) {
        int mappedId = this.currentCallbackId++;
        callbacks.put(mappedId, new Pair<CordovaPlugin, Integer>(receiver, requestCode));
        return mappedId;
    }

    /**
     * Retrieves and removes a callback stored in the map using the mapped request code
     * obtained from registerCallback()
     *
     * @param mappedId      The request code obtained from registerCallback()
     * @return              The CordovaPlugin and orignal request code that correspond to the
     *                      given mappedCode
     */
    public synchronized Pair<CordovaPlugin, Integer> getAndRemoveCallback(int mappedId) {
        Pair<CordovaPlugin, Integer> callback = callbacks.get(mappedId);
        callbacks.remove(mappedId);
        return callback;
    }
}
