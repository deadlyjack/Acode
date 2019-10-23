/**
 *  Diagnostic plugin for iOS
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic = (function(){

    /********************
     * Internal functions
     ********************/


    /********************
     * Public properties
     ********************/
    var Diagnostic = {};

    /**
     * Permission states
     * @type {object}
     */
    Diagnostic.permissionStatus = {
        "NOT_REQUESTED": "not_determined", // App has not yet requested this permission
        "DENIED_ALWAYS": "denied_always", // User denied access to this permission
        "RESTRICTED": "restricted", // Permission is unavailable and user cannot enable it.  For example, when parental controls are in effect for the current user.
        "GRANTED": "authorized", //  User granted access to this permission
        "GRANTED_WHEN_IN_USE": "authorized_when_in_use" //  User granted access use location permission only when app is in use
    };

    Diagnostic.cpuArchitecture = {
        UNKNOWN: "unknown",
        ARMv6: "ARMv6",
        ARMv7: "ARMv7",
        ARMv8: "ARMv8",
        X86: "X86",
        X86_64: "X86_64"
    };

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
     * Core
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
     * Switch to settings app. Opens settings page for this app.
     *
     * @param {Function} successCallback - The callback which will be called when switch to settings is successful.
     * @param {Function} errorCallback - The callback which will be called when switch to settings encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     * This works only on iOS 8+. iOS 7 and below will invoke the errorCallback.
     */
    Diagnostic.switchToSettings = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic',
            'switchToSettings',
            []);
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
     * Returns the background refresh authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getBackgroundRefreshStatus = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic',
            'getBackgroundRefreshStatus',
            []);
    };

    /**
     * Checks if the application is authorized for background refresh.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if background refresh is authorized for use.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isBackgroundRefreshAuthorized = function(successCallback, errorCallback) {
        Diagnostic.getBackgroundRefreshStatus(function(status){
            successCallback(status === Diagnostic.permissionStatus.GRANTED);
        }, errorCallback);
    };

    /************
     * Location *
     ************/

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
    Diagnostic.isLocationAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isLocationAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.isLocationEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isLocationEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };


    /**
     * Checks if the application is authorized to use location.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if application is authorized to use location either "when in use" (only in foreground) OR "always" (foreground and background).
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isLocationAuthorized = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.isLocationAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.getLocationAuthorizationStatus = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.getLocationAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.requestLocationAuthorization = function(successCallback, errorCallback, mode) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.requestLocationAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
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
    Diagnostic.registerLocationStateChangeHandler = function(successCallback) {
        if(cordova.plugins.diagnostic.location){
            cordova.plugins.diagnostic.location.registerLocationStateChangeHandler.apply(this, arguments);
        }else{
            throw "Diagnostic Location module is not installed";
        }
    };

    /************
     * Camera   *
     ************/

    /**
     * Checks if camera is enabled for use.
     * On iOS this returns true if both the device has a camera AND the application is authorized to use it.
     *
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if camera is present and authorized for use.
     *  - {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
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
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if camera is present
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isCameraPresent = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.isCameraPresent.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };


    /**
     * Checks if the application is authorized to use the camera.
     *
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if camera is authorized for use.
     *   - {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isCameraAuthorized = function(params) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.isCameraAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Returns the camera authorization status for the application.
     *
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     *  - {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getCameraAuthorizationStatus = function(params) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.getCameraAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Requests camera authorization for the application.
     * Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Object} params - (optional) parameters:
     * - {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating whether access to the camera was granted or denied:
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED` or `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * - {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestCameraAuthorization = function(params){
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.requestCameraAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Checks if the application is authorized to use the Camera Roll in Photos app.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if access to Camera Roll is authorized.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isCameraRollAuthorized = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.isCameraRollAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Returns the authorization status for the application to use the Camera Roll in Photos app.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getCameraRollAuthorizationStatus = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.getCameraRollAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /**
     * Requests camera roll authorization for the application.
     * Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating the new authorization status:
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED` or `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestCameraRollAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.camera){
            cordova.plugins.diagnostic.camera.requestCameraRollAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Camera module is not installed";
        }
    };

    /************
     * WiFi     *
     ************/

    /**
     * Checks if Wi-Fi is connected.
     * On iOS this returns true if the WiFi setting is set to enabled AND the device is connected to a network by WiFi.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device is connected by WiFi.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isWifiAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.wifi){
            cordova.plugins.diagnostic.wifi.isWifiAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Wifi module is not installed";
        }
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
    Diagnostic.isWifiEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.wifi){
            cordova.plugins.diagnostic.wifi.isWifiEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Wifi module is not installed";
        }
    };

    /***************
     * Bluetooth   *
     ***************/

    /**
     * Checks if the device has Bluetooth LE capabilities and if so that Bluetooth is switched on
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device has Bluetooth LE and Bluetooth is switched on.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isBluetoothAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.isBluetoothAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Returns the state of Bluetooth LE on the device.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the Bluetooth state as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getBluetoothState = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.getBluetoothState.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };


    /**
     * Registers a function to be called when a change in Bluetooth state occurs.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback - function call when a change in Bluetooth state occurs.
     * This callback function is passed a single string parameter which indicates the Bluetooth state as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     */
    Diagnostic.registerBluetoothStateChangeHandler = function(successCallback){
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.registerBluetoothStateChangeHandler.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /**
     * Requests Bluetooth authorization for the application.
     * The outcome of the authorization request can be determined by registering a handler using `registerBluetoothStateChangeHandler()`.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is not passed any parameters.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestBluetoothAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.bluetooth){
            cordova.plugins.diagnostic.bluetooth.requestBluetoothAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Bluetooth module is not installed";
        }
    };

    /***********************
     * Remote Notifications
     ***********************/

    /**
     * Checks if remote (push) notifications are enabled.
     * On iOS 8+, returns true if app is registered for remote notifications AND "Allow Notifications" switch is ON AND alert style is not set to "None" (i.e. "Banners" or "Alerts").
     * On iOS <=7, returns true if app is registered for remote notifications AND alert style is not set to "None" (i.e. "Banners" or "Alerts") - same as isRegisteredForRemoteNotifications().
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if remote (push) notifications are enabled.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isRemoteNotificationsEnabled = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.notifications){
            cordova.plugins.diagnostic.notifications.isRemoteNotificationsEnabled.apply(this, arguments);
        }else{
            throw "Diagnostic Notifications module is not installed";
        }
    };

    /**
     * Indicates the current setting of notification types for the app in the Settings app.
     * Note: on iOS 8+, if "Allow Notifications" switch is OFF, all types will be returned as disabled.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single object parameter where the key is the notification type as a constant in `cordova.plugins.diagnostic.remoteNotificationType` and the value is a boolean indicating whether it's enabled:
     * cordova.plugins.diagnostic.remoteNotificationType.ALERT => alert style is not set to "None" (i.e. "Banners" or "Alerts").
     * cordova.plugins.diagnostic.remoteNotificationType.BADGE => "Badge App Icon" switch is ON.
     * cordova.plugins.diagnostic.remoteNotificationType.SOUND => "Sounds"/"Alert Sound" switch is ON.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getRemoteNotificationTypes = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.notifications){
            cordova.plugins.diagnostic.notifications.getRemoteNotificationTypes.apply(this, arguments);
        }else{
            throw "Diagnostic Notifications module is not installed";
        }
    };

    /**
     * Indicates if the app is registered for remote notifications on the device.
     * On iOS 8+, returns true if the app is registered for remote notifications and received its device token,
     * or false if registration has not occurred, has failed, or has been denied by the user.
     * Note that user preferences for notifications in the Settings app will not affect this.
     * On iOS <=7, returns true if app is registered for remote notifications AND alert style is not set to "None" (i.e. "Banners" or "Alerts") - same as isRemoteNotificationsEnabled().
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if the device is registered for remote (push) notifications.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isRegisteredForRemoteNotifications = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.notifications){
            cordova.plugins.diagnostic.notifications.isRegisteredForRemoteNotifications.apply(this, arguments);
        }else{
            throw "Diagnostic Notifications module is not installed";
        }
    };

    /**
     * Returns the remote notifications authorization status for the application.
     * Works on iOS 10+ (iOS 9 and below will invoke the error callback).
     *
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * Possible values are:
     * `cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED`
     *  - {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getRemoteNotificationsAuthorizationStatus = function() {
        if(cordova.plugins.diagnostic.notifications){
            cordova.plugins.diagnostic.notifications.getRemoteNotificationsAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Notifications module is not installed";
        }
    };

    /**
     * Requests remote notifications authorization for the application.
     * Works on iOS 8+ (iOS 8 and below will invoke the error callback).
     *
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - The callback which will be called when operation is successful.
     *  - {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Array} types - list of notifications to register for as constants in `cordova.plugins.diagnostic.remoteNotificationType`.
     * If not specified, defaults to all notification types.
     * @param {Boolean} omitRegistration - If true, registration for remote notifications will not be carried out once remote notifications authorization is granted.
     * Defaults to false (registration will automatically take place once authorization is granted).
     * iOS 10+ only: on iOS 8 & 9 authorization and registration are implicitly inseparable so both will be carried out.
     */
    Diagnostic.requestRemoteNotificationsAuthorization = function() {
        if(cordova.plugins.diagnostic.notifications){
            cordova.plugins.diagnostic.notifications.requestRemoteNotificationsAuthorization.apply(this, arguments);
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
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
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
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating whether access to the microphone was granted or denied:
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED` or `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * @param {Function} errorCallback - The callback which will be called when an error occurs.
     * This callback function is passed a single string parameter containing the error message.
     * This works only on iOS 7+.
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
     * Checks if the application is authorized to use contacts (address book).
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if contacts is authorized for use.
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
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
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
     * Requests contacts (address book) authorization for the application.
     * Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating whether access to contacts was granted or denied:
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED` or `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestContactsAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.contacts){
            cordova.plugins.diagnostic.contacts.requestContactsAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Contacts module is not installed";
        }
    };

    /*****************
     * Calendar events
     *****************/

    /**
     * Checks if the application is authorized to use calendar.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if calendar is authorized for use.
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
     * Returns the calendar event authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
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
     * Requests calendar event authorization for the application.
     * Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating whether access to calendar was granted or denied:
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED` or `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestCalendarAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.calendar){
            cordova.plugins.diagnostic.calendar.requestCalendarAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Calendar module is not installed";
        }
    };

    /*********************
     * Calendar reminders
     *********************/

    /**
     * Checks if the application is authorized to use calendar reminders.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if reminders is authorized for use.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isRemindersAuthorized = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.reminders){
            cordova.plugins.diagnostic.reminders.isRemindersAuthorized.apply(this, arguments);
        }else{
            throw "Diagnostic Reminders module is not installed";
        }
    };

    /**
     * Returns the calendar event authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getRemindersAuthorizationStatus = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.reminders){
            cordova.plugins.diagnostic.reminders.getRemindersAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Reminders module is not installed";
        }
    };

    /**
     * Requests calendar reminders authorization for the application.
     * Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating whether access to reminders was granted or denied:
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED` or `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestRemindersAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.reminders){
            cordova.plugins.diagnostic.reminders.requestRemindersAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Reminders module is not installed";
        }
    };


    /*************
     * Motion
     *************/

    /**
     * Checks if motion tracking is available on the current device.
     * Motion tracking is supported by iOS devices with an M7 co-processor (or above): that is iPhone 5s (or above), iPad Air (or above), iPad Mini 2 (or above).
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if motion tracking is available on the current device.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isMotionAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.motion){
            cordova.plugins.diagnostic.motion.isMotionAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Motion module is not installed";
        }
    };

    /**
     * Checks if it's possible to determine the outcome of a motion authorization request on the current device.
     * There's no direct way to determine if authorization was granted or denied, so the Pedometer API must be used to indirectly determine this.
     * Therefore, if the device supports motion tracking but not Pedometer Event Tracking, while Motion Track permission can be requested, the outcome of the request cannot be determined.
     * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if it's possible to determine the outcome of a motion authorization request on the current device.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.isMotionRequestOutcomeAvailable = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.motion){
            cordova.plugins.diagnostic.motion.isMotionRequestOutcomeAvailable.apply(this, arguments);
        }else{
            throw "Diagnostic Motion module is not installed";
        }
    };

    /**
     * Requests motion tracking authorization for the application.
     * The native dialog asking user's consent can only be invoked once after the app is installed by calling this function.
     * Once the user has either allowed or denied access, calling this function again will result in an error.
     * It is not possible to re-invoke the dialog if the user denied permission in the native dialog,
     * so in this case you will have to instruct the user how to change motion authorization manually via the Settings app.
     * When calling this function, the message contained in the `NSMotionUsageDescription` .plist key is displayed to the user;
     * this plugin provides a default message, but you should override this with your specific reason for requesting access.
     * There's no direct way to determine if authorization was granted or denied, so the Pedometer API must be used to indirectly determine this:
     * therefore, if the device supports motion tracking but not Pedometer Event Tracking, the outcome of requesting motion detection cannot be determined.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating the result:
     * - `cordova.plugins.diagnostic.motionStatus.GRANTED` - user granted motion authorization.
     * - `cordova.plugins.diagnostic.motionStatus.DENIED_ALWAYS` - user denied authorization.
     * - `cordova.plugins.diagnostic.motionStatus.RESTRICTED` - user cannot grant motion authorization.
     * - `cordova.plugins.diagnostic.motionStatus.NOT_AVAILABLE` - device does not support Motion Tracking.
     * Motion tracking is supported by iOS devices with an M7 co-processor (or above): that is iPhone 5s (or above), iPad Air (or above), iPad Mini 2 (or above).
     * - `cordova.plugins.diagnostic.motionStatus.NOT_DETERMINED` - authorization outcome cannot be determined because device does not support Pedometer Event Tracking.
     * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
     * - `cordova.plugins.diagnostic.motionStatus.UNKNOWN` - motion tracking authorization is in an unknown state.
     * - {Function} errorCallback - The callback which will be called when an error occurs. This callback function is passed a single string parameter containing the error message.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.requestMotionAuthorization = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.motion){
            cordova.plugins.diagnostic.motion.requestMotionAuthorization.apply(this, arguments);
        }else{
            throw "Diagnostic Motion module is not installed";
        }
    };
    
   /**
     * Checks motion authorization status for the application.
     * There's no direct way to determine if authorization was granted or denied, so the Pedometer API is used to indirectly determine this.
     * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating the result:
    * - `cordova.plugins.diagnostic.motionStatus.NOT_REQUESTED` - App has not yet requested this permission.
    * - `cordova.plugins.diagnostic.motionStatus.GRANTED` - user granted motion authorization.
    * - `cordova.plugins.diagnostic.motionStatus.DENIED_ALWAYS` - user denied authorization.
    * - `cordova.plugins.diagnostic.motionStatus.RESTRICTED` - user cannot grant motion authorization.
    * - `cordova.plugins.diagnostic.motionStatus.NOT_AVAILABLE` - device does not support Motion Tracking.
    * Motion tracking is supported by iOS devices with an M7 co-processor (or above): that is iPhone 5s (or above), iPad Air (or above), iPad Mini 2 (or above).
    * - `cordova.plugins.diagnostic.motionStatus.NOT_DETERMINED` - authorization outcome cannot be determined because device does not support Pedometer Event Tracking.
    * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
    * - `cordova.plugins.diagnostic.motionStatus.UNKNOWN` - motion tracking authorization is in an unknown state.
     * - {Function} errorCallback - The callback which will be called when an error occurs. This callback function is passed a single string parameter containing the error message.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic.getMotionAuthorizationStatus = function(successCallback, errorCallback) {
        if(cordova.plugins.diagnostic.motion){
            cordova.plugins.diagnostic.motion.getMotionAuthorizationStatus.apply(this, arguments);
        }else{
            throw "Diagnostic Motion module is not installed";
        }
    };

    return Diagnostic;
})();
module.exports = Diagnostic;
