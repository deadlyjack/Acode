/* globals cordova, require, exports, module */

/**
 *  Diagnostic Calendar plugin for iOS
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
     * Checks if the application is authorized to use calendar.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if calendar is authorized for use.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Calendar.isCalendarAuthorized = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Calendar',
            'isCalendarAuthorized',
            []);
    };

    /**
     * Returns the calendar event authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Calendar.getCalendarAuthorizationStatus = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Calendar',
            'getCalendarAuthorizationStatus',
            []);
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
    Diagnostic_Calendar.requestCalendarAuthorization = function(successCallback, errorCallback) {
        return cordova.exec(function(isGranted){
                successCallback(isGranted ? Diagnostic.permissionStatus.GRANTED : Diagnostic.permissionStatus.DENIED_ALWAYS);
            },
            errorCallback,
            'Diagnostic_Calendar',
            'requestCalendarAuthorization',
            []);
    };

    return Diagnostic_Calendar;
});
module.exports = new Diagnostic_Calendar();
