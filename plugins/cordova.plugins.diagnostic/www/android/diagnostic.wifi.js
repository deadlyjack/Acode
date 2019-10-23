/* globals cordova, require, exports, module */

/**
 *  Diagnostic Wifi plugin for Android
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
     * Checks if Wifi is enabled.
     * On Android this returns true if the WiFi setting is set to enabled.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if WiFi is enabled.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Wifi.isWifiAvailable = Diagnostic_Wifi.isWifiEnabled = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Wifi',
            'isWifiAvailable',
            []);
    };

    /**
     * Switches to the WiFi page in the Settings app
     */
    Diagnostic_Wifi.switchToWifiSettings = function() {
        return cordova.exec(null,
            null,
            'Diagnostic_Wifi',
            'switchToWifiSettings',
            []);
    };

    /**
     * Enables/disables WiFi on the device.
     *
     * @param {Function} successCallback - function to call on successful setting of WiFi state
     * @param {Function} errorCallback - function to call on failure to set WiFi state.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Boolean} state - WiFi state to set: TRUE for enabled, FALSE for disabled.
     */
    Diagnostic_Wifi.setWifiState = function(successCallback, errorCallback, state) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Wifi',
            'setWifiState',
            [state]);
    };

    return Diagnostic_Wifi;
});
module.exports = new Diagnostic_Wifi();