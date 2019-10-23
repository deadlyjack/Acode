/* globals cordova, require, exports, module */

/**
 *  Diagnostic Wifi plugin for iOS
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Wifi = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Wifi = {};

    var Diagnostic = require("cordova.plugins.diagnostic.Diagnostic");

    /********************
     *
     * Public properties
     *
     ********************/
    
    /********************
     *
     * Internal functions
     *
     ********************/

    /*****************************
     *
     * Protected member functions
     *
     ****************************/


    /**********************
     *
     * Public API functions
     *
     **********************/

    /**
     * Checks if Wi-Fi is connected.
     * On iOS this returns true if the WiFi setting is set to enabled AND the device is connected to a network by WiFi.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device is connected by WiFi.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Wifi.isWifiAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Wifi',
            'isWifiAvailable',
            []);
    };

    /**
     * Checks if Wifi is enabled.
     * On iOS this returns true if the WiFi setting is set to enabled (regardless of whether it's connected to a network).
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if WiFi is enabled.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Wifi.isWifiEnabled = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Wifi',
            'isWifiEnabled',
            []);
    };

    return Diagnostic_Wifi;
});
module.exports = new Diagnostic_Wifi();