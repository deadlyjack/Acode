/**
 *  Diagnostic Wifi plugin for Windows 10 Universal
 *
 *  Copyright (c) Next Wave Software, Inc.
**/
var Diagnostic_Wifi = function () { };

/**
 * Switches to the WiFi page in the Settings app
 */
Diagnostic_Wifi.prototype.switchToWifiSettings = function () {
    return cordova.exec(null,
        null,
        'Diagnostic_Wifi',
        'switchToWifiSettings',
        []);
};

/**
 * Enables/disables WiFi on the device.
 *
 * @param {Function} successCallback - function to call on successful setting of WiFi state
 * @param {Function} errorCallback - function to call on failure to set WiFi state.
 * This callback function is passed a single string parameter containing the error message.
 * @param {Boolean} state - WiFi state to set: TRUE for enabled, FALSE for disabled.
 */
Diagnostic_Wifi.prototype.setWifiState = function (successCallback, errorCallback, state) {
    return cordova.exec(successCallback,
        errorCallback,
        'Diagnostic',
        'setRadioState',
        ['wifi', state]);
};

/**
 * Checks if Wifi is enabled.
 *
 * @param {Function} successCallback -  The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic_Wifi.prototype.isWifiAvailable = Diagnostic_Wifi.isWifiEnabled = function (successCallback, errorCallback) {
    return cordova.exec(successCallback,
        errorCallback,
        'Diagnostic',
        'isRadioEnabled',
        ['wifi']);
};

module.exports = new Diagnostic_Wifi();
