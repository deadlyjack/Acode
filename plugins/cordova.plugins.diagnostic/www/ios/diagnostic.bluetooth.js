/* globals cordova, require, exports, module */

/**
 *  Diagnostic Bluetooth plugin for iOS
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Bluetooth = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Bluetooth = {};

    var Diagnostic = require("cordova.plugins.diagnostic.Diagnostic");

    /********************
     *
     * Public properties
     *
     ********************/

    Diagnostic.bluetoothState = Diagnostic_Bluetooth.bluetoothState = {
        "UNKNOWN": "unknown",
        "RESETTING": "resetting",
        "UNSUPPORTED": "unsupported",
        "UNAUTHORIZED": "unauthorized",
        "POWERED_OFF": "powered_off",
        "POWERED_ON": "powered_on"
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
    Diagnostic_Bluetooth._onBluetoothStateChange = function(){};


    /**********************
     *
     * Public API functions
     *
     **********************/

    /**
     * Checks if the device has Bluetooth LE capabilities and if so that Bluetooth is switched on
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if device has Bluetooth LE and Bluetooth is switched on.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Bluetooth.isBluetoothAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Bluetooth',
            'isBluetoothAvailable',
            []);
    };

    /**
     * Returns the state of Bluetooth LE on the device.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the Bluetooth state as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Bluetooth.getBluetoothState = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Bluetooth',
            'getBluetoothState',
            []);
    };


    /**
     * Registers a function to be called when a change in Bluetooth state occurs.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback - function call when a change in Bluetooth state occurs.
     * This callback function is passed a single string parameter which indicates the Bluetooth state as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     */
    Diagnostic_Bluetooth.registerBluetoothStateChangeHandler = function(successCallback){
        Diagnostic_Bluetooth._onBluetoothStateChange = successCallback || function(){};
        return cordova.exec(successCallback,
            null,
            'Diagnostic_Bluetooth',
            'ensureBluetoothManager',
            []);
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
    Diagnostic_Bluetooth.requestBluetoothAuthorization = function(successCallback, errorCallback) {
        return cordova.exec(
            successCallback,
            errorCallback,
            'Diagnostic_Bluetooth',
            'requestBluetoothAuthorization',
            []);
    };



    return Diagnostic_Bluetooth;
});
module.exports = new Diagnostic_Bluetooth();