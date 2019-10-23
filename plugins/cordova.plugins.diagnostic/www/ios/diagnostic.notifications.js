/* globals cordova, require, exports, module */

/**
 *  Diagnostic Notifications plugin for iOS
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Notifications = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Notifications = {};

    var Diagnostic = require("cordova.plugins.diagnostic.Diagnostic");

    /********************
     *
     * Public properties
     *
     ********************/

    Diagnostic.remoteNotificationType = Diagnostic_Notifications.remoteNotificationType = {
        ALERT: "alert",
        SOUND: "sound",
        BADGE: "badge"
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


    /**********************
     *
     * Public API functions
     *
     **********************/

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
    Diagnostic_Notifications.isRemoteNotificationsEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Notifications',
            'isRemoteNotificationsEnabled',
            []);
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
    Diagnostic_Notifications.getRemoteNotificationTypes = function(successCallback, errorCallback) {
        return cordova.exec(function(sTypes){
                var oTypes = JSON.parse(sTypes);
                for(var type in oTypes){
                    oTypes[type] = parseInt(oTypes[type]) === 1 ;
                }
                successCallback(oTypes);
            },
            errorCallback,
            'Diagnostic_Notifications',
            'getRemoteNotificationTypes',
            []);
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
    Diagnostic_Notifications.isRegisteredForRemoteNotifications = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Notifications',
            'isRegisteredForRemoteNotifications',
            []);
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
    Diagnostic_Notifications.getRemoteNotificationsAuthorizationStatus = function() {
        var params;
        if (typeof arguments[0]  === "function") {
            params = {};
            params.successCallback = arguments[0];
            if(typeof arguments[1]  === "function") {
                params.errorCallback = arguments[1];
            }
        }else{
            params = arguments[0];
        }

        return cordova.exec(
            params.successCallback,
            params.errorCallback,
            'Diagnostic_Notifications',
            'getRemoteNotificationsAuthorizationStatus',
            []);
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
    Diagnostic_Notifications.requestRemoteNotificationsAuthorization = function() {
        var params;
        if (typeof arguments[0]  === "function") {
            params = {};
            params.successCallback = arguments[0];
            if(typeof arguments[1]  === "function") {
                params.errorCallback = arguments[1];
            }
            if(typeof arguments[2]  !== "undefined") {
                params.types = arguments[2];
            }
            if(typeof arguments[3]  !== "undefined") {
                params.omitRegistration = arguments[3];
            }
        }else{
            params = arguments[0];
        }

        params.types = params.types && params.types.length ? JSON.stringify(params.types) : JSON.stringify({});

        return cordova.exec(
            params.successCallback,
            params.errorCallback,
            'Diagnostic_Notifications',
            'requestRemoteNotificationsAuthorization',
            [params.types, params.omitRegistration ? 1 : 0]);
    };


    return Diagnostic_Notifications;
});
module.exports = new Diagnostic_Notifications();
