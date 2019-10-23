/**
 *  Diagnostic Bluetooth plugin for Windows 10 Universal
 *
 *  Copyright (c) Next Wave Software, Inc.
**/
var Diagnostic_Bluetooth = function () { };

/**
 * Switches to the Bluetooth page in the Settings app
 */
Diagnostic_Bluetooth.prototype.switchToBluetoothSettings = function () {
    return cordova.exec(null,
        null,
        'Diagnostic_Bluetooth',
        'switchToBluetoothSettings',
        []);
};

/**
 * Checks if Bluetooth is enabled
 *
 * @param {Function} successCallback -  The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic_Bluetooth.prototype.isBluetoothAvailable = function (successCallback, errorCallback) {
    return cordova.exec(successCallback,
        errorCallback,
        'Diagnostic',
        'isRadioEnabled',
        ['bluetooth']);
};

/**
 * Enables/disables Bluetooth on the device.
 *
 * @param {Function} successCallback - function to call on successful setting of Bluetooth state
 * @param {Function} errorCallback - function to call on failure to set Bluetooth state.
 * This callback function is passed a single string parameter containing the error message.
 * @param {Boolean} state - Bluetooth state to set: TRUE for enabled, FALSE for disabled.
 */
Diagnostic_Bluetooth.prototype.setBluetoothState = function (successCallback, errorCallback, state) {
    return cordova.exec(successCallback,
        errorCallback,
        'Diagnostic_Bluetooth',
        'setRadioState',
        ['bluetooth', state]);
};

module.exports = new Diagnostic_Bluetooth();
