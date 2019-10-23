/**
 *  Diagnostic plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic = (function(){

    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic = {};

    // Indicates if a runtime permissions request is in progress
    var requestInProgress = false;

    /********************
     *
     * Public properties
     *
     ********************/

    /**
     * "Dangerous" permissions that need to be requested at run-time (Android 6.0/API 23 and above)
     * See http://developer.android.com/guide/topics/security/permissions.html#perm-groups
     * @type {Object}
     */
    Diagnostic.runtimePermission = // deprecated
        Diagnostic.permission = {
            "READ_CALENDAR": "READ_CALENDAR",
            "WRITE_CALENDAR": "WRITE_CALENDAR",
            "CAMERA": "CAMERA",
            "READ_CONTACTS": "READ_CONTACTS",
            "WRITE_CONTACTS": "WRITE_CONTACTS",
            "GET_ACCOUNTS": "GET_ACCOUNTS",
            "ACCESS_FINE_LOCATION": "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION": "ACCESS_COARSE_LOCATION",
            "RECORD_AUDIO": "RECORD_AUDIO",
            "READ_PHONE_STATE": "READ_PHONE_STATE",
            "CALL_PHONE": "CALL_PHONE",
            "ADD_VOICEMAIL": "ADD_VOICEMAIL",
            "USE_SIP": "USE_SIP",
            "PROCESS_OUTGOING_CALLS": "PROCESS_OUTGOING_CALLS",
            "READ_CALL_LOG": "READ_CALL_LOG",
            "WRITE_CALL_LOG": "WRITE_CALL_LOG",
            "SEND_SMS": "SEND_SMS",
            "RECEIVE_SMS": "RECEIVE_SMS",
            "READ_SMS": "READ_SMS",
            "RECEIVE_WAP_PUSH": "RECEIVE_WAP_PUSH",
            "RECEIVE_MMS": "RECEIVE_MMS",
            "WRITE_EXTERNAL_STORAGE": "WRITE_EXTERNAL_STORAGE",
            "READ_EXTERNAL_STORAGE": "READ_EXTERNAL_STORAGE",
            "BODY_SENSORS": "BODY_SENSORS"
        };

    /**
     * Permission groups indicate which associated permissions will also be requested if a given permission is requested.
     * See http://developer.android.com/guide/topics/security/permissions.html#perm-groups
     * @type {Object}
     */
    Diagnostic.runtimePermissionGroups = // deprecated
        Diagnostic.permissionGroups = {
            "CALENDAR": ["READ_CALENDAR", "WRITE_CALENDAR"],
            "CAMERA": ["CAMERA"],
            "CONTACTS": ["READ_CONTACTS", "WRITE_CONTACTS", "GET_ACCOUNTS"],
            "LOCATION": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
            "MICROPHONE": ["RECORD_AUDIO"],
            "PHONE": ["READ_PHONE_STATE", "CALL_PHONE", "ADD_VOICEMAIL", "USE_SIP", "PROCESS_OUTGOING_CALLS", "READ_CALL_LOG", "WRITE_CALL_LOG"],
            "SENSORS": ["BODY_SENSORS"],
            "SMS": ["SEND_SMS", "RECEIVE_SMS", "READ_SMS", "RECEIVE_WAP_PUSH", "RECEIVE_MMS"],
            "STORAGE": ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
        };

    Diagnostic.runtimePermissionStatus = // deprecated
        Diagnostic.permissionStatus = {
            "GRANTED": "GRANTED", //  User granted access to this permission, the device is running Android 5.x or below, or the app is built with API 22 or below.
            "DENIED_ONCE": "DENIED_ONCE", // User denied access to this permission
            "NOT_REQUESTED": "NOT_REQUESTED", // App has not yet requested access to this permission.
            "DENIED_ALWAYS": "DENIED_ALWAYS" // User denied access to this permission and checked "Never Ask Again" box.
        };



    Diagnostic.cpuArchitecture = {
        UNKNOWN: "unknown",
        ARMv6: "ARMv6",
        ARMv7: "ARMv7",
        ARMv8: "ARMv8",
        X86: "X86",
        X86_64: "X86_64",
        MIPS: "MIPS",
        MIPS_64: "MIPS_64"
    };

    /*****************************
     *
     * Protected member functions
     *
     ****************************/
    // Placeholder listeners
    Diagnostic._onNFCStateChange =
        Diagnostic._onPermissionRequestComplete = function(){};

    /********************
     *
     * Internal functions
     *
     ********************/

    function checkForInvalidPermissions(permissions, errorCallback){
        if(typeof(permissions) !== "object") permissions = [permissions];
        var valid = true, invalidPermissions = [];
        permissions.forEach(function(permission){
            if(!Diagnostic.permission[permission]){
                invalidPermissions.push(permission);
            }
        });
        if(invalidPermissions.length > 0){
            errorCallback("Invalid permissions specified: "+invalidPermissions.join(", "));
            valid = false;
        }
        return valid;
    }



    /*****************************
     *
     * Protected member functions
     *
     ****************************/

    Diagnostic._ensureBoolean = function (callback){
        return function(result){
            callback(!!result);
        }
    };

    /**********************
     *
     * Public API functions
     *
     **********************/


    /***********
     * General
     ***********/

    /**
     * Enables debug mode, which logs native debug messages to the native and JS consoles.
     * Debug mode is initially disabled on plugin initialisation.
     *
     * @param {Function} successCallback - The callback which will be called when enabling debug is successful.
     */
    Diagnostic.enableDebug = function(successCallback) {
        return cordova.exec(successCallback,
            null,
            'Diagnostic',
            'enableDebug',
            []);
    };

    /**
     * Opens settings page for this app.
     *
     * @param {Function} successCallback - The callback which will be called when switch to settings is successful.
     * @param {Function} errorCallback - The callback which will be called when switch to settings encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.switchToSettings = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic',
            'switchToSettings',
            []);
    };

    /**
     * Returns the current authorisation status for a given permission.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return GRANTED status as permissions are already granted at installation time.
     *
     * @param {Function} successCallback - function to call on successful retrieval of status.
     * This callback function is passed a single string parameter which defines the current authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to retrieve authorisation status.
     * This callback function is passed a single string parameter containing the error message.
     * @param {String} permission - permission to request authorisation status for, defined as a value in cordova.plugins.diagnostic.permission
     */
    Diagnostic.getPermissionAuthorizationStatus = function(successCallback, errorCallback, permission){
        if(!checkForInvalidPermissions(permission, errorCallback)) return;

        return cordova.exec(
            successCallback,
            errorCallback,
            'Diagnostic',
            'getPermissionAuthorizationStatus',
            [permission]);
    };

    /**
     * Returns the current authorisation status for multiple permissions.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return GRANTED status as permissions are already granted at installation time.
     *
     * @param {Function} successCallback - function to call on successful retrieval of status.
     * This callback function is passed a single object parameter which defines a key/value map, where the key is the requested permission defined as a value in cordova.plugins.diagnostic.permission, and the value is the current authorisation status of that permission as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to retrieve authorisation statuses.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Array} permissions - list of permissions to request authorisation statuses for, defined as values in cordova.plugins.diagnostic.permission
     */
    Diagnostic.getPermissionsAuthorizationStatus = function(successCallback, errorCallback, permissions){
        if(!checkForInvalidPermissions(permissions, errorCallback)) return;

        return cordova.exec(
            successCallback,
            errorCallback,
            'Diagnostic',
            'getPermissionsAuthorizationStatus',
            [permissions]);
    };


    /**
     * Requests app to be granted authorisation for a runtime permission.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will have no effect as the permissions are already granted at installation time.
     *
     * @param {Function} successCallback - function to call on successful request for runtime permission.
     * This callback function is passed a single string parameter which defines the resulting authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation.
     * This callback function is passed a single string parameter containing the error message.
     * @param {String} permission - permission to request authorisation for, defined as a value in cordova.plugins.diagnostic.permission
     */
    Diagnostic.requestRuntimePermission = function(successCallback, errorCallback, permission) {
        if(!checkForInvalidPermissions(permission, errorCallback)) return;

        if(requestInProgress){
            return onError("A runtime permissions request is already in progress");
        }

        function onSuccess(statuses){
            requestInProgress = false;
            successCallback(statuses[permission]);
            Diagnostic._onPermissionRequestComplete(statuses);
        }

        function onError(error){
            requestInProgress = false;
            errorCallback(error);
        }

        requestInProgress = true;
        return cordova.exec(
            onSuccess,
            onError,
            'Diagnostic',
            'requestRuntimePermission',
            [permission]);
    };

    /**
     * Requests app to be granted authorisation for multiple runtime permissions.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will have no effect as the permissions are already granted at installation time.
     *
     * @param {Function} successCallback - function to call on successful request for runtime permissions.
     * This callback function is passed a single object parameter which defines a key/value map, where the key is the permission to request defined as a value in cordova.plugins.diagnostic.permission, and the value is the resulting authorisation status of that permission as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Array} permissions - permissions to request authorisation for, defined as values in cordova.plugins.diagnostic.permission
     */
    Diagnostic.requestRuntimePermissions = function(successCallback, errorCallback, permissions){
        if(!checkForInvalidPermissions(permissions, errorCallback)) return;

        if(requestInProgress){
            return onError("A runtime permissions request is already in progress");
        }

        function onSuccess(statuses){
            requestInProgress = false;
            successCallback(statuses);
            Diagnostic._onPermissionRequestComplete(statuses);
        }

        function onError(error){
            requestInProgress = false;
            errorCallback(error);
        }

        requestInProgress = true;
        return cordova.exec(
            onSuccess,
            onError,
            'Diagnostic',
            'requestRuntimePermissions',
            [permissions]);

    };

    /**
     * Indicates if the plugin is currently requesting a runtime permission via the native API.
     * Note that only one request can be made concurrently because the native API cannot handle concurrent requests,
     * so the plugin will invoke the error callback if attempting to make more than one simultaneous request.
     * Multiple permission requests should be grouped into a single call since the native API is setup to handle batch requests of multiple permission groups.
     *
     * @return {boolean} true if a permission request is currently in progress.
     */
    Diagnostic.isRequestingPermission = function(){
        return requestInProgress;
    };

    /**
     * Registers a function to be called when a runtime permission request has completed.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when a runtime permission request has completed.
     * This callback function is passed a single object parameter which defines a key/value map, where the key is the permission requested (defined as a value in cordova.plugins.diagnostic.permission) and the value is the resulting authorisation status of that permission as a value in cordova.plugins.diagnostic.permissionStatus.
     */
    Diagnostic.registerPermissionRequestCompleteHandler = function(successCallback) {
        Diagnostic._onPermissionRequestComplete = successCallback || function(){};
    };


    /**
     * Switches to the wireless settings page in the Settings app.
     * Allows configuration of wireless controls such as Wi-Fi, Bluetooth and Mobile networks.
     */
    Diagnostic.switchToWirelessSettings = function() {
        return cordova.exec(null,
            null,
            'Diagnostic',
            'switchToWirelessSettings',
            []);
    };


    /**
     * Switches to the Mobile Data page in the Settings app
     */
    Diagnostic.switchToMobileDataSettings = function() {
        return cordova.exec(null,
            null,
            'Diagnostic',
            'switchToMobileDataSettings',
            []);
    };

    /**
     * Checks if ADB mode(debug mode) is switched on.
     * Returns true if ADB mode is switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if ADB mode(debug mode) is switched on.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isADBModeEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic',
            'isADBModeEnabled',
            []);
    };

    /**
     * Checks if the device is rooted.
     * Returns true if the device is rooted.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if the device is rooted.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isDeviceRooted = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic',
            'isDeviceRooted',
            []);
    };

    /**
     * Restarts the application.
     * By default, a "warm" restart will be performed in which the main Cordova activity is immediately restarted, causing the Webview instance to be recreated.
     * However, if the `cold` parameter is set to true, then the application will be "cold" restarted, meaning a system exit will be performed, causing the entire application to be restarted.
     * This is useful if you want to fully reset the native application state but will cause the application to briefly disappear and re-appear.
     *
     * Note: There is no successCallback() since if the operation is successful, the application will restart immediately before any success callback can be applied.
     *
     * @param {Function} errorCallback - function to call on failure to retrieve authorisation status.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Boolean} cold - if true the application will be cold restarted. Defaults to false.
     */
    Diagnostic.restart = function(errorCallback, cold){
        return cordova.exec(
            null,
            errorCallback,
            'Diagnostic',
            'restart',
            [cold]);
    };

    /**
     * Returns CPU architecture of the current device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.cpuArchitecture`.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getArchitecture = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic',
            'getArchitecture',
            []);
    };

    /**
     * Checks if the device data roaming setting is enabled.
     * Returns true if data roaming is enabled.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if data roaming is enabled.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isDataRoamingEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic',
            'isDataRoamingEnabled',
            []);
    };

    /************
     * Location *
     ************/

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
    Diagnostic.isLocationAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isLocationAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.isLocationEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isLocationEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.isGpsLocationAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isGpsLocationAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.isGpsLocationEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isGpsLocationEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.isNetworkLocationAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isNetworkLocationAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.isNetworkLocationEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isNetworkLocationEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /**
     * Returns the current location mode setting for the device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.locationMode`.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getLocationMode = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.getLocationMode.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /**
     * Switches to the Location page in the Settings app
     */
    Diagnostic.switchToLocationSettings = function() {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.switchToLocationSettings.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /**
     * Requests location authorization for the application.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will have no effect as the permissions are already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permissions.
     * This callback function is passed a single string parameter which defines the resulting authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation.
     */
    Diagnostic.requestLocationAuthorization = function(successCallback, errorCallback){
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.requestLocationAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /**
     * Returns the location authorization status for the application.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return GRANTED status as permissions are already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single string parameter which defines the current authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation status.
     */
    Diagnostic.getLocationAuthorizationStatus = function(successCallback, errorCallback){
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.getLocationAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /**
     * Checks if the application is authorized to use location.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return TRUE as permissions are already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single boolean parameter which is TRUE if the app currently has runtime authorisation to use location.
     * @param {Function} errorCallback - function to call on failure to request authorisation status.
     */
    Diagnostic.isLocationAuthorized = function(successCallback, errorCallback){
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isLocationAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /**
     * Registers a function to be called when a change in Location state occurs.
     * On Android, this occurs when the Location Mode is changed.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when the Location state changes.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.locationMode`.
     */
    Diagnostic.registerLocationStateChangeHandler = function(successCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.registerLocationStateChangeHandler.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /************
     * WiFi     *
     ************/

    /**
     * Checks if Wifi is enabled.
     * On Android this returns true if the WiFi setting is set to enabled.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if WiFi is enabled.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isWifiAvailable = Diagnostic.isWifiEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.wifi){
            cordova.plugins.diagnostic.wifi.isWifiAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Wifi module is not installed";
        }
    };

    /**
     * Switches to the WiFi page in the Settings app
     */
    Diagnostic.switchToWifiSettings = function() {
        if(cordova.plugins.diagnostic.wifi){
            cordova.plugins.diagnostic.wifi.switchToWifiSettings.apply(this, arguments);
        }else{
            throw "Diagnostic Wifi module is not installed";
        }
    };

    /**
     * Enables/disables WiFi on the device.
     *
     * @param {Function} successCallback - function to call on successful setting of WiFi state
     * @param {Function} errorCallback - function to call on failure to set WiFi state.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Boolean} state - WiFi state to set: TRUE for enabled, FALSE for disabled.
     */
    Diagnostic.setWifiState = function(successCallback, errorCallback, state) {
        if(cordova.plugins.diagnostic.wifi){
            cordova.plugins.diagnostic.wifi.setWifiState.apply(this, arguments);
        }else{
            throw "Diagnostic Wifi module is not installed";
        }
    };

    /************
     * Camera   *
     ************/

    /**
     * Checks if camera is usable: both present and authorised for use.
     *
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if camera is present and authorized for use.
     *  - {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     *  - {Boolean} externalStorage - (Android only) If true, checks permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic.isCameraAvailable = function(params) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.isCameraAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Checks if camera hardware is present on device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if camera is present
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isCameraPresent = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.isCameraPresent.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Requests authorisation for runtime permissions to use the camera.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will have no effect as the permissions are already granted at installation time.
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - function to call on successful request for runtime permissions.
     * This callback function is passed a single string parameter which defines the resulting authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     *  - {Function} errorCallback - function to call on failure to request authorisation.
     *  - {Boolean} externalStorage - (Android only) If true, requests permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic.requestCameraAuthorization = function(params){
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.requestCameraAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Returns the authorisation status for runtime permissions to use the camera.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return GRANTED status as permissions are already granted at installation time.
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single string parameter which defines the current authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     *  - {Function} errorCallback - function to call on failure to request authorisation status.
     *  - {Boolean} externalStorage - (Android only) If true, checks permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic.getCameraAuthorizationStatus = function(params){
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.getCameraAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Checks if the application is authorized to use the camera.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return TRUE as permissions are already granted at installation time.
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single boolean parameter which is TRUE if the app currently has runtime authorisation to use location.
     *  - {Function} errorCallback - function to call on failure to request authorisation status.
     *  - {Boolean} externalStorage - (Android only) If true, checks permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic.isCameraAuthorized = function(params){
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.isCameraAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**********************
     * External storage   *
     **********************/
    /**
     * Requests authorisation for runtime permission to use the external storage.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will have no effect as the permission is already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permission.
     * This callback function is passed a single string parameter which defines the resulting authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation.
     */
    Diagnostic.requestExternalStorageAuthorization = function(successCallback, errorCallback){
        if(cordova.plugins.diagnostic.external_storage){
            cordova.plugins.diagnostic.external_storage.requestExternalStorageAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic External Storage module is not installed";
        }
    };

    /**
     * Returns the authorisation status for runtime permission to use the external storage.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return GRANTED status as permission is already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permission status.
     * This callback function is passed a single string parameter which defines the current authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     * @param {Function} errorCallback - function to call on failure to request authorisation status.
     */
    Diagnostic.getExternalStorageAuthorizationStatus = function(successCallback, errorCallback){
        if(cordova.plugins.diagnostic.external_storage){
            cordova.plugins.diagnostic.external_storage.getExternalStorageAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic External Storage module is not installed";
        }
    };

    /**
     * Checks if the application is authorized to use external storage.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return TRUE as permissions are already granted at installation time.
     * @param {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single boolean parameter which is TRUE if the app currently has runtime authorisation to external storage.
     * @param {Function} errorCallback - function to call on failure to request authorisation status.
     */
    Diagnostic.isExternalStorageAuthorized = function(successCallback, errorCallback){
        if(cordova.plugins.diagnostic.external_storage){
            cordova.plugins.diagnostic.external_storage.isExternalStorageAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic External Storage module is not installed";
        }
    };

    /**
     * Returns details of external SD card(s): absolute path, is writable, free space
     * @param {Function} successCallback - function to call on successful request for external SD card details.
     * This callback function is passed a single argument which is an array consisting of an entry for each external storage location found.
     * Each array entry is an object with the following keys:
     * - {String} path - absolute path to the storage location
     * - {String} filePath - absolute path prefixed with file protocol for use with cordova-plugin-file
     * - {Boolean} canWrite - true if the location is writable
     * - {Integer} freeSpace - number of bytes of free space on the device on which the storage locaiton is mounted.
     * - {String} type - indicates the type of storage location: either "application" if the path is an Android application sandbox path or "root" if the path is the device root.
     * @param {Function} errorCallback - function to call on failure to request authorisation status.
     */
    Diagnostic.getExternalSdCardDetails = function(successCallback, errorCallback){
        if(cordova.plugins.diagnostic.external_storage){
            cordova.plugins.diagnostic.external_storage.getExternalSdCardDetails.apply(this, arguments);
        }else{
            throw "Diagnostic External Storage module is not installed";
        }
    };


    /***************
     * Bluetooth   *
     ***************/

    /**
     * Checks if Bluetooth is available to the app.
     * Returns true if the device has Bluetooth capabilities and if so that Bluetooth is switched on
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if Bluetooth is available.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isBluetoothAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.isBluetoothAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Checks if the device setting for Bluetooth is switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if Bluetooth is switched on.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isBluetoothEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.isBluetoothEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Enables/disables Bluetooth on the device.
     *
     * @param {Function} successCallback - function to call on successful setting of Bluetooth state
     * @param {Function} errorCallback - function to call on failure to set Bluetooth state.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Boolean} state - Bluetooth state to set: TRUE for enabled, FALSE for disabled.
     */
    Diagnostic.setBluetoothState = function(successCallback, errorCallback, state) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.setBluetoothState.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Returns current state of Bluetooth hardware on the device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getBluetoothState = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.getBluetoothState.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Registers a listener function to call when the state of Bluetooth hardware changes.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when the state of Bluetooth hardware changes.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     */
    Diagnostic.registerBluetoothStateChangeHandler = function(successCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.registerBluetoothStateChangeHandler.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };


    /**
     * Checks if the device has Bluetooth capabilities.
     * See http://developer.android.com/guide/topics/connectivity/bluetooth.html.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device has Bluetooth capabilities.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.hasBluetoothSupport = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.hasBluetoothSupport.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Checks if the device has Bluetooth Low Energy (LE) capabilities.
     * See http://developer.android.com/guide/topics/connectivity/bluetooth-le.html.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device has Bluetooth LE capabilities.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.hasBluetoothLESupport = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.hasBluetoothLESupport.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Checks if the device has Bluetooth Low Energy (LE) capabilities.
     * See http://developer.android.com/guide/topics/connectivity/bluetooth-le.html.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device has Bluetooth LE capabilities.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.hasBluetoothLESupport = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.hasBluetoothLESupport.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Checks if the device has Bluetooth Low Energy (LE) peripheral capabilities.
     * See http://developer.android.com/guide/topics/connectivity/bluetooth-le.html#roles.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device has Bluetooth LE peripheral capabilities.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.hasBluetoothLEPeripheralSupport = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.hasBluetoothLEPeripheralSupport.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Switches to the Bluetooth page in the Settings app
     */
    Diagnostic.switchToBluetoothSettings = function() {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.switchToBluetoothSettings.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**********************
     * Remote Notifications
     **********************/

    /**
     * Checks if remote notifications is available to the app.
     * Returns true if remote notifications are switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if remote notifications is available.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isRemoteNotificationsEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.notifications){
            cordova.plugins.diagnostic.notifications.isRemoteNotificationsEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Notifications module is not installed";
        }
    };


    /***************************
     * Microphone / Record Audio
     ***************************/

    /**
     * Checks if the application is authorized to use the microphone for recording audio.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if access to microphone is authorized.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isMicrophoneAuthorized = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.microphone){
            cordova.plugins.diagnostic.microphone.isMicrophoneAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Microphone module is not installed";
        }
    };

    /**
     * Returns the authorization status for the application to use the microphone for recording audio.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status.
     * Possible values are:
     * `cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getMicrophoneAuthorizationStatus = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.microphone){
            cordova.plugins.diagnostic.microphone.getMicrophoneAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Microphone module is not installed";
        }
    };

    /**
     * Requests access to microphone if authorization was never granted nor denied, will only return access status otherwise.
     *
     * @param {Function} successCallback - The callback which will be called when authorization request is successful.
     * @param {Function} errorCallback - The callback which will be called when an error occurs.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestMicrophoneAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.microphone){
            cordova.plugins.diagnostic.microphone.requestMicrophoneAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Microphone module is not installed";
        }
    };

    /*************
     * Contacts
     *************/

    /**
     *Checks if the application is authorized to use contacts (address book).
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if access to microphone is authorized.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isContactsAuthorized = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.contacts){
            cordova.plugins.diagnostic.contacts.isContactsAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Contacts module is not installed";
        }
    };

    /**
     * Returns the contacts (address book) authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status.
     * Possible values are:
     * `cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getContactsAuthorizationStatus = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.contacts){
            cordova.plugins.diagnostic.contacts.getContactsAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Contacts module is not installed";
        }
    };

    /**
     *  Requests contacts (address book) authorization for the application.
     *  Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when authorization request is successful.
     * @param {Function} errorCallback - The callback which will be called when an error occurs.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestContactsAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.contacts){
            cordova.plugins.diagnostic.contacts.requestContactsAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Contacts module is not installed";
        }
    };

    /*************
     * Calendar
     *************/

    /**
     *Checks if the application is authorized to use calendar.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if access to microphone is authorized.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isCalendarAuthorized = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.calendar){
            cordova.plugins.diagnostic.calendar.isCalendarAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Calendar module is not installed";
        }
    };

    /**
     * Returns the calendar authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status.
     * Possible values are:
     * `cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getCalendarAuthorizationStatus = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.calendar){
            cordova.plugins.diagnostic.calendar.getCalendarAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Calendar module is not installed";
        }
    };

    /**
     *  Requests calendar authorization for the application.
     *  Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when authorization request is successful.
     * @param {Function} errorCallback - The callback which will be called when an error occurs.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestCalendarAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.calendar){
            cordova.plugins.diagnostic.calendar.requestCalendarAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Calendar module is not installed";
        }
    };

    /*************
     * NFC
     *************/

    /**
     * Checks if NFC hardware is present on device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if NFC is present
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isNFCPresent = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.nfc){
            cordova.plugins.diagnostic.nfc.isNFCPresent.apply(this, arguments);
        }else{
            throw "Diagnostic NFC module is not installed";
        }
    };

    /**
     * Checks if the device setting for NFC is switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if NFC is switched on.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isNFCEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.nfc){
            cordova.plugins.diagnostic.nfc.isNFCEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic NFC module is not installed";
        }
    };

    /**
     * Checks if NFC is available to the app.
     * Returns true if the device has NFC capabilities and if so that NFC is switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if NFC is available.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isNFCAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.nfc){
            cordova.plugins.diagnostic.nfc.isNFCAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic NFC module is not installed";
        }
    };

    /**
     * Registers a function to be called when a change in NFC state occurs.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when the NFC state changes.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.NFCState`.
     */
    Diagnostic.registerNFCStateChangeHandler = function(successCallback) {
        if(cordova.plugins.diagnostic.nfc){
            cordova.plugins.diagnostic.nfc.registerNFCStateChangeHandler.apply(this, arguments);
        }else{
            throw "Diagnostic NFC module is not installed";
        }
    };


    /**
     * Switches to the nfc settings page in the Settings app
     */
    Diagnostic.switchToNFCSettings = function() {
        if(cordova.plugins.diagnostic.nfc){
            cordova.plugins.diagnostic.nfc.switchToNFCSettings.apply(this, arguments);
        }else{
            throw "Diagnostic NFC module is not installed";
        }
    };

    return Diagnostic;
});
module.exports = new Diagnostic();
