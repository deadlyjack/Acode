/* globals cordova, require, exports, module */

/**
 *  Diagnostic Bluetooth plugin for Android
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
        "POWERED_OFF": "powered_off",
        "POWERED_ON": "powered_on",
        "POWERING_OFF": "powering_off",
        "POWERING_ON": "powering_on"
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
    // Placeholder listeners
    Diagnostic_Bluetooth._onBluetoothStateChange = function(){};

    /**********************
     *
     * Public API functions
     *
     **********************/

    /**
     * Checks if Bluetooth is available to the app.
     * Returns true if the device has Bluetooth capabilities and if so that Bluetooth is switched on
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if Bluetooth is available.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Bluetooth.isBluetoothAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Bluetooth',
            'isBluetoothAvailable',
            []);
    };

    /**
     * Checks if the device setting for Bluetooth is switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if Bluetooth is switched on.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Bluetooth.isBluetoothEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Bluetooth',
            'isBluetoothEnabled',
            []);
    };

    /**
     * Enables/disables Bluetooth on the device.
     *
     * @param {Function} successCallback - function to call on successful setting of Bluetooth state
     * @param {Function} errorCallback - function to call on failure to set Bluetooth state.
     * This callback function is passed a single string parameter containing the error message.
     * @param {Boolean} state - Bluetooth state to set: TRUE for enabled, FALSE for disabled.
     */
    Diagnostic_Bluetooth.setBluetoothState = function(successCallback, errorCallback, state) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Bluetooth',
            'setBluetoothState',
            [state]);
    };

    /**
     * Returns current state of Bluetooth hardware on the device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Bluetooth.getBluetoothState = function(successCallback, errorCallback) {
        return cordova.exec(successCallback,
            errorCallback,
            'Diagnostic_Bluetooth',
            'getBluetoothState',
            []);
    };

    /**
     * Registers a listener function to call when the state of Bluetooth hardware changes.
     * Pass in a falsey value to de-register the currently registered function.
     *
     * @param {Function} successCallback -  The callback which will be called when the state of Bluetooth hardware changes.
     * This callback function is passed a single string parameter defined as a constant in `cordova.plugins.diagnostic.bluetoothState`.
     */
    Diagnostic_Bluetooth.registerBluetoothStateChangeHandler = function(successCallback) {
        Diagnostic_Bluetooth._onBluetoothStateChange = successCallback || function(){};
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
    Diagnostic_Bluetooth.hasBluetoothSupport = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Bluetooth',
            'hasBluetoothSupport', []);
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
    Diagnostic_Bluetooth.hasBluetoothLESupport = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Bluetooth',
            'hasBluetoothLESupport', []);
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
    Diagnostic_Bluetooth.hasBluetoothLESupport = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Bluetooth',
            'hasBluetoothLESupport', []);
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
    Diagnostic_Bluetooth.hasBluetoothLEPeripheralSupport = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Bluetooth',
            'hasBluetoothLEPeripheralSupport', []);
    };

    /**
     * Switches to the Bluetooth page in the Settings app
     */
    Diagnostic_Bluetooth.switchToBluetoothSettings = function() {
        return cordova.exec(null,
            null,
            'Diagnostic_Bluetooth',
            'switchToBluetoothSettings',
            []);
    };

   

    return Diagnostic_Bluetooth;
});
module.exports = new Diagnostic_Bluetooth();