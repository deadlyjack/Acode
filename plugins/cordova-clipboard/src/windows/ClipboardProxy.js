/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/*jslint sloppy:true */
/*global Windows:true, require, document, window, module */

var cordova = require('cordova');

module.exports = {

    copy: function (successCallback, errorCallback, args) {
        try {
            var text = args[0];

            var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
            dataPackage.setText(text);
            Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
            successCallback(text);
        } catch (e) {
            errorCallback(e);;
        }
    },
    paste: function (successCallback, errorCallback, args) {
        try {
            var text = "";

            var dataPackageView = Windows.ApplicationModel.DataTransfer.Clipboard.getContent();
            if (dataPackageView.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
                dataPackageView.getTextAsync().then(function (value) {
                    text = value;
                    successCallback(text);
                });
            }
        } catch (e) {
            errorCallback(e);;
        }
    },
    clear: function (successCallback, errorCallback, args) {
        try {
            if(Windows.ApplicationModel.DataTransfer.Clipboard.getContent()){
                successCallback(true);
            }
        } catch (e) {
            errorCallback(e);;
        }
    }
}; // exports

require("cordova/exec/proxy").add("Clipboard", module.exports);