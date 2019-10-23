/* globals cordova, require, exports, module */

/**
 *  Diagnostic Motion plugin for iOS
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Motion = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Motion = {};

    var Diagnostic = require("cordova.plugins.diagnostic.Diagnostic");

    /********************
     *
     * Public properties
     *
     ********************/

    /**
     * Status of motion+tracking permission
     * @type {object}
     */
    Diagnostic.motionStatus = Diagnostic_Motion.motionStatus = {
        "UNKNOWN": "unknown", // Status is not known
        "NOT_REQUESTED": "not_requested", // App has not yet requested this permission
        "DENIED_ALWAYS": "denied_always", // User denied access to this permission
        "RESTRICTED": "restricted", // Permission is unavailable and user cannot enable it.  For example, when parental controls are in effect for the current user.
        "GRANTED": "authorized", //  User granted access to this permission
        "NOT_AVAILABLE": "not_available", // Motion tracking not available on device
        "NOT_DETERMINED": "not_determined" // Motion authorization request status outcome cannot be determined on device
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


    /**********************
     *
     * Public API functions
     *
     **********************/

    /**
     * Checks if motion tracking is available on the current device.
     * Motion tracking is supported by iOS devices with an M7 co-processor (or above): that is iPhone 5s (or above), iPad Air (or above), iPad Mini 2 (or above).
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if motion tracking is available on the current device.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Motion.isMotionAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Motion',
            'isMotionAvailable',
            []);
    };

    /**
     * Checks if it's possible to determine the outcome of a motion authorization request on the current device.
     * There's no direct way to determine if authorization was granted or denied, so the Pedometer API must be used to indirectly determine this.
     * Therefore, if the device supports motion tracking but not Pedometer Event Tracking, while Motion Track permission can be requested, the outcome of the request cannot be determined.
     * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if it's possible to determine the outcome of a motion authorization request on the current device.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Motion.isMotionRequestOutcomeAvailable = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Motion',
            'isMotionRequestOutcomeAvailable',
            []);
    };

    /**
     * Requests motion tracking authorization for the application.
     * The native dialog asking user's consent can only be invoked once after the app is installed by calling this function.
     * Once the user has either allowed or denied access, calling this function again will result in an error.
     * It is not possible to re-invoke the dialog if the user denied permission in the native dialog,
     * so in this case you will have to instruct the user how to change motion authorization manually via the Settings app.
     * When calling this function, the message contained in the `NSMotionUsageDescription` .plist key is displayed to the user;
     * this plugin provides a default message, but you should override this with your specific reason for requesting access.
     * There's no direct way to determine if authorization was granted or denied, so the Pedometer API must be used to indirectly determine this:
     * therefore, if the device supports motion tracking but not Pedometer Event Tracking, the outcome of requesting motion detection cannot be determined.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating the result:
     * - `cordova.plugins.diagnostic.motionStatus.GRANTED` - user granted motion authorization.
     * - `cordova.plugins.diagnostic.motionStatus.DENIED_ALWAYS` - user denied authorization.
     * - `cordova.plugins.diagnostic.motionStatus.RESTRICTED` - user cannot grant motion authorization.
     * - `cordova.plugins.diagnostic.motionStatus.NOT_AVAILABLE` - device does not support Motion Tracking.
     * Motion tracking is supported by iOS devices with an M7 co-processor (or above): that is iPhone 5s (or above), iPad Air (or above), iPad Mini 2 (or above).
     * - `cordova.plugins.diagnostic.motionStatus.NOT_DETERMINED` - authorization outcome cannot be determined because device does not support Pedometer Event Tracking.
     * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
     * - `cordova.plugins.diagnostic.motionStatus.UNKNOWN` - motion tracking authorization is in an unknown state.
     * - {Function} errorCallback - The callback which will be called when an error occurs. This callback function is passed a single string parameter containing the error message.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Motion.requestMotionAuthorization = function(successCallback, errorCallback) {
        return cordova.exec(
            successCallback,
            errorCallback,
            'Diagnostic_Motion',
            'requestMotionAuthorization',
            []);
    };

    /**
     * Checks motion authorization status for the application.
     * There's no direct way to determine if authorization was granted or denied, so the Pedometer API is used to indirectly determine this.
     * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter indicating the result:
     * - `cordova.plugins.diagnostic.motionStatus.NOT_REQUESTED` - App has not yet requested this permission.
     * - `cordova.plugins.diagnostic.motionStatus.GRANTED` - user granted motion authorization.
     * - `cordova.plugins.diagnostic.motionStatus.DENIED_ALWAYS` - user denied authorization.
     * - `cordova.plugins.diagnostic.motionStatus.RESTRICTED` - user cannot grant motion authorization.
     * - `cordova.plugins.diagnostic.motionStatus.NOT_AVAILABLE` - device does not support Motion Tracking.
     * Motion tracking is supported by iOS devices with an M7 co-processor (or above): that is iPhone 5s (or above), iPad Air (or above), iPad Mini 2 (or above).
     * - `cordova.plugins.diagnostic.motionStatus.NOT_DETERMINED` - authorization outcome cannot be determined because device does not support Pedometer Event Tracking.
     * Pedometer Event Tracking is only available on iPhones with an M7 co-processor (or above): that is iPhone 5s (or above). No iPads yet support it.
     * - `cordova.plugins.diagnostic.motionStatus.UNKNOWN` - motion tracking authorization is in an unknown state.
     * - {Function} errorCallback - The callback which will be called when an error occurs. This callback function is passed a single string parameter containing the error message.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Motion.getMotionAuthorizationStatus = function(successCallback, errorCallback) {
        return cordova.exec(
            successCallback,
            errorCallback,
            'Diagnostic_Motion',
            'getMotionAuthorizationStatus',
            []);
    };

    return Diagnostic_Motion;
});
module.exports = new Diagnostic_Motion();
