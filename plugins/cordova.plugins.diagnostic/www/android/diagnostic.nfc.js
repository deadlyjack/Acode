/* globals cordova, require, exports, module */

/**
 *  Diagnostic NFC plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_NFC = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_NFC = {};

    var Diagnostic = require("cordova.plugins.diagnostic.Diagnostic");

    /********************
     *
     * Public properties
     *
     ********************/

    Diagnostic.NFCState = Diagnostic_NFC.NFCState = {
        "UNKNOWN": "unknown",
        "POWERED_OFF": "powered_off",
        "POWERING_ON": "powering_on",
        "POWERED_ON": "powered_on",
        "POWERING_OFF": "powering_off"
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
    // Placeholder listener
    Diagnostic_NFC._onNFCStateChange = function(){};

    /**********************
     *
     * Public API functions
     *
     **********************/

    /**
     * Checks if NFC hardware is present on device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if NFC is present
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_NFC.isNFCPresent = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_NFC',
            'isNFCPresent',
            []);
    };

    /**
     * Checks if the device setting for NFC is switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if NFC is switched on.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_NFC.isNFCEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_NFC',
            'isNFCEnabled',
            []);
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
    Diagnostic_NFC.isNFCAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_NFC',
            'isNFCAvailable',
            []);
    };

    /**
     * Registers a function to be called when a change in NFC state occurs.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when the NFC state changes.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.NFCState`.
     */
    Diagnostic_NFC.registerNFCStateChangeHandler = function(successCallback) {
        Diagnostic_NFC._onNFCStateChange = successCallback || function(){};
    };

    /**
     * Switches to the nfc settings page in the Settings app
     */
    Diagnostic_NFC.switchToNFCSettings = function() {
        return cordova.exec(null,
            null,
            'Diagnostic_NFC',
            'switchToNFCSettings',
            []);
    };

    return Diagnostic_NFC;
});
module.exports = new Diagnostic_NFC();