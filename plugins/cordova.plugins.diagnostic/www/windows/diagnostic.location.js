/**
 *  Diagnostic Location plugin for Windows 10 Universal
 *
 *  Copyright (c) Next Wave Software, Inc.
**/
var Diagnostic_Location = function () { };

/**
 * Checks if location is enabled.
 *
 * @param {Function} successCallback - The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic_Location.prototype.isLocationAvailable = function (successCallback, errorCallback) {
    return cordova.exec(successCallback,
        errorCallback,
        'Diagnostic_Location',
        'isLocationAvailable',
        []);
};

/**
 * Switches to the Location page in the Settings app
 */
Diagnostic_Location.prototype.switchToLocationSettings = function () {
    return cordova.exec(null,
        null,
        'Diagnostic_Location',
        'switchToLocationSettings',
        []);
};

module.exports = new Diagnostic_Location();
