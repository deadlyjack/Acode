/* globals cordova, require, exports, module */

/**
 *  Diagnostic Location plugin for iOS
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Location = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Location = {};

    var Diagnostic = require("cordova.plugins.diagnostic.Diagnostic");

    /********************
     *
     * Public properties
     *
     ********************/

    Diagnostic.locationAuthorizationMode = Diagnostic_Location.locationAuthorizationMode = {
        "ALWAYS": "always",
        "WHEN_IN_USE": "when_in_use"
    };

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
    Diagnostic_Location._onLocationStateChange = function(){};


    /**********************
     *
     * Public API functions
     *
     **********************/

    /**
     * Checks if location is available for use by the app.
     * On iOS this returns true if both the device setting for Location Services is ON AND the application is authorized to use location.
     * When location is enabled, the locations returned are by a mixture GPS hardware, network triangulation and Wifi network IDs.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if location is available for use.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isLocationAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isLocationAvailable',
            []);
    };

    /**
     * Checks if the device location setting is enabled.
     * Returns true if Location Services is enabled.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if Location Services is enabled.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isLocationEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isLocationEnabled',
            []);
    };


    /**
     * Checks if the application is authorized to use location.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if application is authorized to use location either "when in use" (only in foreground) OR "always" (foreground and background).
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isLocationAuthorized = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isLocationAuthorized',
            []);
    };

    /**
     * Returns the location authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the location authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * Possible values are:
     * `cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE`
     * Note that `GRANTED` indicates the app is always granted permission (even when in background).
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.getLocationAuthorizationStatus = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Location',
            'getLocationAuthorizationStatus',
            []);
    };

    /**
     * Requests location authorization for the application.
     * Authorization can be requested to use location either "when in use" (only in foreground) or "always" (foreground and background).
     * Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - Invoked in response to the user's choice in the permission dialog.
     * It is passed a single string parameter which defines the resulting authorisation status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * Possible values are:
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     * @param {String} mode - (optional) location authorization mode as a constant in `cordova.plugins.diagnostic.locationAuthorizationMode`.
     * If not specified, defaults to `cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE`.
     */
    Diagnostic_Location.requestLocationAuthorization = function(successCallback, errorCallback, mode) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Location',
            'requestLocationAuthorization',
            [mode && mode === Diagnostic_Location.locationAuthorizationMode.ALWAYS]);
    };

    /**
     * Registers a function to be called when a change in Location state occurs.
     * On iOS, this occurs when location authorization status is changed.
     * This can be triggered either by the user's response to a location permission authorization dialog,
     * by the user turning on/off Location Services,
     * or by the user changing the Location authorization state specifically for your app.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when the Location state changes.
     * This callback function is passed a single string parameter indicating the new location authorisation status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     */
    Diagnostic_Location.registerLocationStateChangeHandler = function(successCallback) {
        Diagnostic_Location._onLocationStateChange = successCallback || function(){};
    };

    return Diagnostic_Location;
});
module.exports = new Diagnostic_Location();
