/* globals cordova, require, exports, module */

/**
 *  Diagnostic Calendar plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Calendar = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Calendar = {};

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
     *Checks if the application is authorized to use calendar.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if access to microphone is authorized.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Calendar.isCalendarAuthorized = function(successCallback, errorCallback) {
        function onSuccess(status){
            successCallback(status === Diagnostic.permissionStatus.GRANTED);
        }
        Diagnostic_Calendar.getCalendarAuthorizationStatus(onSuccess, errorCallback);
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
    Diagnostic_Calendar.getCalendarAuthorizationStatus = function(successCallback, errorCallback) {
        Diagnostic.getPermissionAuthorizationStatus(successCallback, errorCallback, Diagnostic.permission.READ_CALENDAR);
    };

    /**
     *  Requests calendar authorization for the application.
     *  Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when authorization request is successful.
     * @param {Function} errorCallback - The callback which will be called when an error occurs.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Calendar.requestCalendarAuthorization = function(successCallback, errorCallback) {
        Diagnostic.requestRuntimePermission(successCallback, errorCallback, Diagnostic.permission.READ_CALENDAR);
    };

    return Diagnostic_Calendar;
});
module.exports = new Diagnostic_Calendar();
