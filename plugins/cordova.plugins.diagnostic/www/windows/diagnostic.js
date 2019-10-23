/**
 *  Diagnostic plugin for Windows 10 Universal
 *
 *  Copyright (c) Next Wave Software, Inc.
**/
var Diagnostic = function () { };

/******
 * Core
 ******/

/**
* Switches to the Mobile Data page in the Settings app
*/
Diagnostic.prototype.switchToMobileDataSettings = function () {
    return cordova.exec(null,
		null,
		'Diagnostic',
		'switchToMobileDataSettings',
		[]);
};

/**********
 * Location
 **********/

/**
 * Checks if location is enabled.
 *
 * @param {Function} successCallback - The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic.prototype.isLocationAvailable = function (successCallback, errorCallback) {
    if(cordova.plugins.diagnostic.location){
        cordova.plugins.diagnostic.location.isLocationAvailable.apply(this, arguments);
    }else{
        throw "Diagnostic Location module is not installed";
    }
};

/**
 * Switches to the Location page in the Settings app
 */
Diagnostic.prototype.switchToLocationSettings = function () {
    if(cordova.plugins.diagnostic.location){
        cordova.plugins.diagnostic.location.switchToLocationSettings.apply(this, arguments);
    }else{
        throw "Diagnostic Location module is not installed";
    }
};

/***********
 * Bluetooth
 ***********/

/**
 * Enables/disables Bluetooth on the device.
 *
 * @param {Function} successCallback - function to call on successful setting of Bluetooth state
 * @param {Function} errorCallback - function to call on failure to set Bluetooth state.
 * This callback function is passed a single string parameter containing the error message.
 * @param {Boolean} state - Bluetooth state to set: TRUE for enabled, FALSE for disabled.
 */
Diagnostic.prototype.setBluetoothState = function (successCallback, errorCallback, state) {
    if(cordova.plugins.diagnostic.bluetooth){
        cordova.plugins.diagnostic.bluetooth.setBluetoothState.apply(this, arguments);
    }else{
        throw "Diagnostic Bluetooth module is not installed";
    }
};

/**
 * Checks if Bluetooth is enabled
 *
 * @param {Function} successCallback -  The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic.prototype.isBluetoothAvailable = function (successCallback, errorCallback) {
    if(cordova.plugins.diagnostic.bluetooth){
        cordova.plugins.diagnostic.bluetooth.isBluetoothAvailable.apply(this, arguments);
    }else{
        throw "Diagnostic Bluetooth module is not installed";
    }
};

/**
 * Switches to the Bluetooth page in the Settings app
 */
Diagnostic.prototype.switchToBluetoothSettings = function () {
    if(cordova.plugins.diagnostic.bluetooth){
        cordova.plugins.diagnostic.bluetooth.switchToBluetoothSettings.apply(this, arguments);
    }else{
        throw "Diagnostic Bluetooth module is not installed";
    }
};

/**********
 * Wifi
 **********/
/**
 * Switches to the WiFi page in the Settings app
 */
Diagnostic.prototype.switchToWifiSettings = function () {
    if(cordova.plugins.diagnostic.wifi){
        cordova.plugins.diagnostic.wifi.switchToWifiSettings.apply(this, arguments);
    }else{
        throw "Diagnostic Wifi module is not installed";
    }
};

/**
 * Enables/disables WiFi on the device.
 *
 * @param {Function} successCallback - function to call on successful setting of WiFi state
 * @param {Function} errorCallback - function to call on failure to set WiFi state.
 * This callback function is passed a single string parameter containing the error message.
 * @param {Boolean} state - WiFi state to set: TRUE for enabled, FALSE for disabled.
 */
Diagnostic.prototype.setWifiState = function (successCallback, errorCallback, state) {
    if(cordova.plugins.diagnostic.wifi){
        cordova.plugins.diagnostic.wifi.setWifiState.apply(this, arguments);
    }else{
        throw "Diagnostic Wifi module is not installed";
    }
};

/**
 * Checks if Wifi is enabled.
 *
 * @param {Function} successCallback -  The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic.prototype.isWifiAvailable = Diagnostic.isWifiEnabled = function (successCallback, errorCallback) {
    if(cordova.plugins.diagnostic.wifi){
        cordova.plugins.diagnostic.wifi.isWifiAvailable.apply(this, arguments);
    }else{
        throw "Diagnostic Wifi module is not installed";
    }
};

/***********
 * Camera
 ***********/

/**
 * Checks if camera exists.
 *
 * @param {Object} params - (optional) parameters:
 * 	- {Function} successCallback -  The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * 	- {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic.prototype.isCameraAvailable = function (params) {
    if(cordova.plugins.diagnostic.camera){
        cordova.plugins.diagnostic.camera.isCameraAvailable.apply(this, arguments);
    }else{
        throw "Diagnostic Camera module is not installed";
    }
};


module.exports = new Diagnostic();
