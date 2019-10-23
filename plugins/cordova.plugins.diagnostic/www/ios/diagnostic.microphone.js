/* globals cordova, require, exports, module */

/**
 *  Diagnostic Microphone plugin for iOS
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
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Microphone',
            'isMicrophoneAuthorized',
            []);
    };

    /**
     * Returns the authorization status for the application to use the microphone for recording audio.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status as a constant in `cordova.plugins.diagnostic.permissionStatus`.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Microphone.getMicrophoneAuthorizationStatus = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Microphone',
            'getMicrophoneAuthorizationStatus',
            []);
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
    Diagnostic_Microphone.requestMicrophoneAuthorization = function(successCallback, errorCallback) {
        return cordova.exec(function(isGranted){
                successCallback(isGranted ? Diagnostic.permissionStatus.GRANTED : Diagnostic.permissionStatus.DENIED_ALWAYS);
            },
            errorCallback,
            'Diagnostic_Microphone',
            'requestMicrophoneAuthorization',
            []);
    };



    return Diagnostic_Microphone;
});
module.exports = new Diagnostic_Microphone();
