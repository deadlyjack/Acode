/* globals cordova, require, exports, module */

/**
 *  Diagnostic Camera plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Camera = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Camera = {};

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

    function combineCameraStatuses(statuses){
        var cameraStatus = statuses[Diagnostic.permission.CAMERA],
            mediaStatus = statuses[Diagnostic.permission.READ_EXTERNAL_STORAGE],
            status;

        if(cameraStatus === Diagnostic.permissionStatus.DENIED_ALWAYS || mediaStatus === Diagnostic.permissionStatus.DENIED_ALWAYS){
            status = Diagnostic.permissionStatus.DENIED_ALWAYS;
        }else if(cameraStatus === Diagnostic.permissionStatus.DENIED_ONCE || mediaStatus === Diagnostic.permissionStatus.DENIED_ONCE){
            status = Diagnostic.permissionStatus.DENIED_ONCE;
        }else if(cameraStatus === Diagnostic.permissionStatus.NOT_REQUESTED || mediaStatus === Diagnostic.permissionStatus.NOT_REQUESTED){
            status = Diagnostic.permissionStatus.NOT_REQUESTED;
        }else{
            status = Diagnostic.permissionStatus.GRANTED;
        }
        return status;
    }

    function mapFromLegacyCameraApi() {
        var params;
        if (typeof arguments[0]  === "function") {
            params = (arguments.length > 2 && typeof arguments[2]  === "object") ? arguments[2] : {};
            params.successCallback = arguments[0];
            if(arguments.length > 1 && typeof arguments[1]  === "function") {
                params.errorCallback = arguments[1];
            }
            if(arguments.length > 2 && arguments[2]  === false) {
                params.externalStorage = arguments[2];
            }
        }else { // if (typeof arguments[0]  === "object")
            params = arguments[0];
        }
        return params;
    }

    function numberOfKeys(obj){
        var count = 0;
        for(var k in obj){
            count++;
        }
        return count;
    }


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
     * Checks if camera is usable: both present and authorised for use.
     *
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if camera is present and authorized for use.
     *  - {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     *  - {Boolean} externalStorage - (Android only) If true, checks permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic_Camera.isCameraAvailable = function(params) {
        params = mapFromLegacyCameraApi.apply(this, arguments);

        params.successCallback = params.successCallback || function(){};
        Diagnostic_Camera.isCameraPresent(function(isPresent){
            if(isPresent){
                Diagnostic_Camera.isCameraAuthorized(params);
            }else{
                params.successCallback(!!isPresent);
            }
        },params.errorCallback);
    };

    /**
     * Checks if camera hardware is present on device.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if camera is present
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Camera.isCameraPresent = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Camera',
            'isCameraPresent',
            []);
    };

    /**
     * Requests authorisation for runtime permissions to use the camera.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will have no effect as the permissions are already granted at installation time.
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - function to call on successful request for runtime permissions.
     * This callback function is passed a single string parameter which defines the resulting authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     *  - {Function} errorCallback - function to call on failure to request authorisation.
     *  - {Boolean} externalStorage - (Android only) If true, requests permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic_Camera.requestCameraAuthorization = function(params){
        params = mapFromLegacyCameraApi.apply(this, arguments);

        var permissions = [Diagnostic.permission.CAMERA];
        if(params.externalStorage !== false){
            permissions.push(Diagnostic.permission.READ_EXTERNAL_STORAGE);
        }

        params.successCallback = params.successCallback || function(){};
        var onSuccess = function(statuses){
            params.successCallback(numberOfKeys(statuses) > 1 ? combineCameraStatuses(statuses): statuses[Diagnostic.permission.CAMERA]);
        };
        Diagnostic.requestRuntimePermissions(onSuccess, params.errorCallback, permissions);
    };

    /**
     * Returns the authorisation status for runtime permissions to use the camera.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return GRANTED status as permissions are already granted at installation time.
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single string parameter which defines the current authorisation status as a value in cordova.plugins.diagnostic.permissionStatus.
     *  - {Function} errorCallback - function to call on failure to request authorisation status.
     *  - {Boolean} externalStorage - (Android only) If true, checks permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic_Camera.getCameraAuthorizationStatus = function(params){
        params = mapFromLegacyCameraApi.apply(this, arguments);

        var permissions = [Diagnostic.permission.CAMERA];
        if(params.externalStorage !== false){
            permissions.push(Diagnostic.permission.READ_EXTERNAL_STORAGE);
        }

        params.successCallback = params.successCallback || function(){};
        var onSuccess = function(statuses){
            params.successCallback(numberOfKeys(statuses) > 1 ? combineCameraStatuses(statuses): statuses[Diagnostic.permission.CAMERA]);
        };
        Diagnostic.getPermissionsAuthorizationStatus(onSuccess, params.errorCallback, permissions);
    };

    /**
     * Checks if the application is authorized to use the camera.
     * Note: this is intended for Android 6 / API 23 and above. Calling on Android 5 / API 22 and below will always return TRUE as permissions are already granted at installation time.
     * @param {Object} params - (optional) parameters:
     *  - {Function} successCallback - function to call on successful request for runtime permissions status.
     * This callback function is passed a single boolean parameter which is TRUE if the app currently has runtime authorisation to use location.
     *  - {Function} errorCallback - function to call on failure to request authorisation status.
     *  - {Boolean} externalStorage - (Android only) If true, checks permission for READ_EXTERNAL_STORAGE in addition to CAMERA run-time permission.
     *  cordova-plugin-camera@2.2+ requires both of these permissions. Defaults to true.
     */
    Diagnostic_Camera.isCameraAuthorized = function(params){
        params = mapFromLegacyCameraApi.apply(this, arguments);

        params.successCallback = params.successCallback || function(){};
        var onSuccess = function(status){
            params.successCallback(status === Diagnostic.permissionStatus.GRANTED);
        };

        Diagnostic_Camera.getCameraAuthorizationStatus({
            successCallback: onSuccess,
            errorCallback: params.errorCallback,
            externalStorage: params.externalStorage
        });
    };

    return Diagnostic_Camera;
});
module.exports = new Diagnostic_Camera();
