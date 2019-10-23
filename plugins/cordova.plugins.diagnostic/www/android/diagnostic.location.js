/* globals cordova, require, exports, module */

/**
 *  Diagnostic Location plugin for Android
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

    Diagnostic.locationMode = Diagnostic_Location.locationMode = {
        "HIGH_ACCURACY": "high_accuracy",
        "DEVICE_ONLY": "device_only",
        "BATTERY_SAVING": "battery_saving",
        "LOCATION_OFF": "location_off"
    };


    Diagnostic.locationAuthorizationMode = Diagnostic_Location.locationAuthorizationMode = {}; // Empty object to enable easy cross-platform compatibility with iOS

    /********************
     *
     * Internal functions
     *
     ********************/

    function combineLocationStatuses(statuses){
        var coarseStatus = statuses[Diagnostic.permission.ACCESS_COARSE_LOCATION],
            fineStatus = statuses[Diagnostic.permission.ACCESS_FINE_LOCATION],
            status;

        if(coarseStatus === Diagnostic.permissionStatus.DENIED_ALWAYS || fineStatus === Diagnostic.permissionStatus.DENIED_ALWAYS){
            status = Diagnostic.permissionStatus.DENIED_ALWAYS;
        }else if(coarseStatus === Diagnostic.permissionStatus.DENIED_ONCE || fineStatus === Diagnostic.permissionStatus.DENIED_ONCE){
            status = Diagnostic.permissionStatus.DENIED_ONCE;
        }else if(coarseStatus === Diagnostic.permissionStatus.NOT_REQUESTED || fineStatus === Diagnostic.permissionStatus.NOT_REQUESTED){
            status = Diagnostic.permissionStatus.NOT_REQUESTED;
        }else{
            status = Diagnostic.permissionStatus.GRANTED;
        }
        return status;
    }

    /*****************************
     *
     * Protected member functions
     *
     ****************************/
    // Placeholder listener
    Diagnostic_Location._onLocationStateChange = function(){};

    /**********************
     *
     * Public API functions
     *
     **********************/

    /**
     * Checks if location is available for use by the app.
     * On Android, this returns true if Location Mode is enabled and any mode is selected (e.g. Battery saving, Device only, High accuracy)
     * AND if the app is authorised to use location.
     *
     * @param {Function} successCallback - The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if location is available for use.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
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
     * On Android, this returns true if Location Mode is enabled and any mode is selected (e.g. Battery saving, Device only, High accuracy)
     *
     * @param {Function} successCallback - The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if location setting is enabled.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isLocationEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isLocationEnabled',
            []);
    };

    /**
     * Checks if high-accuracy locations are available to the app from GPS hardware.
     * Returns true if Location mode is enabled and is set to "Device only" or "High accuracy"
     * AND if the app is authorised to use location.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if high-accuracy GPS-based location is available.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isGpsLocationAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isGpsLocationAvailable',
            []);
    };

    /**
     * Checks if the device location setting is set to return high-accuracy locations from GPS hardware.
     * Returns true if Location mode is enabled and is set to either:
     * Device only = GPS hardware only (high accuracy)
     * High accuracy = GPS hardware, network triangulation and Wifi network IDs (high and low accuracy)
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device setting is set to return high-accuracy GPS-based location.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isGpsLocationEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isGpsLocationEnabled',
            []);
    };

    /**
     * Checks if low-accuracy locations are available to the app from network triangulation/WiFi access points.
     * Returns true if Location mode is enabled and is set to "Battery saving" or "High accuracy"
     * AND if the app is authorised to use location.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if low-accuracy network-based location is available.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isNetworkLocationAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isNetworkLocationAvailable',
            []);
    };

    /**
     * Checks if the device location setting is set to return low-accuracy locations from network triangulation/WiFi access points.
     * Returns true if Location mode is enabled and is set to either:
     * Battery saving = network triangulation and Wifi network IDs (low accuracy)
     * High accuracy = GPS hardware, network triangulation and Wifi network IDs (high and low accuracy)
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device setting is set to return low-accuracy network-based location.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.isNetworkLocationEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Location',
            'isNetworkLocationEnabled',
            []);
    };

    /**
     * Returns the current location mode setting for the device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.locationMode`.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Location.getLocationMode = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Location',
            'getLocationMode',
            []);
    };

    /**
     * Switches to the Location page in the Settings app
     */
    Diagnostic_Location.switchToLocationSettings = function() {
        return cordova.exec(null,
            null,
            'Diagnostic_Location',
            'switchToLocationSettings',
            []);
    };

    /**
     * Requests location authorization for the application.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will have no effect as the permissions are already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permissions.
     * This callback function is passed a single string parameter which defines the resulting authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation.
     */
    Diagnostic_Location.requestLocationAuthorization = function(successCallback, errorCallback){
        function onSuccess(statuses){
            successCallback(combineLocationStatuses(statuses));
        }
        Diagnostic.requestRuntimePermissions(onSuccess, errorCallback, [
            Diagnostic.permission.ACCESS_COARSE_LOCATION,
            Diagnostic.permission.ACCESS_FINE_LOCATION
        ]);
    };

    /**
     * Returns the location authorization status for the application.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return GRANTED status as permissions are already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single string parameter which defines the current authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation status.
     */
    Diagnostic_Location.getLocationAuthorizationStatus = function(successCallback, errorCallback){
        function onSuccess(statuses){
            successCallback(combineLocationStatuses(statuses));
        }
        Diagnostic.getPermissionsAuthorizationStatus(onSuccess, errorCallback, [
            Diagnostic.permission.ACCESS_COARSE_LOCATION,
            Diagnostic.permission.ACCESS_FINE_LOCATION
        ]);
    };

    /**
     * Checks if the application is authorized to use location.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return TRUE as permissions are already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single boolean parameter which is TRUE if the app currently has runtime authorisation to use location.
     * @param {Function} errorCallback - function to call on failure to request authorisation status.
     */
    Diagnostic_Location.isLocationAuthorized = function(successCallback, errorCallback){
        function onSuccess(status){
            successCallback(status === Diagnostic.permissionStatus.GRANTED);
        }
        Diagnostic_Location.getLocationAuthorizationStatus(onSuccess, errorCallback);
    };

    /**
     * Registers a function to be called when a change in Location state occurs.
     * On Android, this occurs when the Location Mode is changed.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when the Location state changes.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.locationMode`.
     */
    Diagnostic_Location.registerLocationStateChangeHandler = function(successCallback) {
        Diagnostic_Location._onLocationStateChange = successCallback || function(){};
    };

    return Diagnostic_Location;
});
module.exports = new Diagnostic_Location();
