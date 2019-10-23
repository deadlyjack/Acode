/* globals cordova, require, exports, module */

/**
 *  Diagnostic Microphone plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Microphone = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Microphone = {};

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
     * Checks if the application is authorized to use the microphone for recording audio.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if access to microphone is authorized.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Microphone.isMicrophoneAuthorized = function(successCallback, errorCallback) {
        function onSuccess(status){
            successCallback(status === Diagnostic.permissionStatus.GRANTED);
        }
        Diagnostic_Microphone.getMicrophoneAuthorizationStatus(onSuccess, errorCallback);
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
    Diagnostic_Microphone.getMicrophoneAuthorizationStatus = function(successCallback, errorCallback) {
        Diagnostic.getPermissionAuthorizationStatus(successCallback, errorCallback, Diagnostic.permission.RECORD_AUDIO);
    };

    /**
     * Requests access to microphone if authorization was never granted nor denied, will only return access status otherwise.
     *
     * @param {Function} successCallback - The callback which will be called when authorization request is successful.
     * @param {Function} errorCallback - The callback which will be called when an error occurs.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Microphone.requestMicrophoneAuthorization = function(successCallback, errorCallback) {
        Diagnostic.requestRuntimePermission(successCallback, errorCallback, Diagnostic.permission.RECORD_AUDIO);
    };

    return Diagnostic_Microphone;
});
module.exports = new Diagnostic_Microphone();
