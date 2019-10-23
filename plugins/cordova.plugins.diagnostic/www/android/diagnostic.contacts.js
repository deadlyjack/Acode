/* globals cordova, require, exports, module */

/**
 *  Diagnostic Contacts plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Contacts = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Contacts = {};

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
     *Checks if the application is authorized to use contacts (address book).
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if access to microphone is authorized.
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Contacts.isContactsAuthorized = function(successCallback, errorCallback) {
        function onSuccess(status){
            successCallback(status === Diagnostic.permissionStatus.GRANTED);
        }
        Diagnostic_Contacts.getContactsAuthorizationStatus(onSuccess, errorCallback);
    };

    /**
     * Returns the contacts (address book) authorization status for the application.
     *
     * @param {Function} successCallback - The callback which will be called when operation is successful.
     * This callback function is passed a single string parameter which indicates the authorization status.
     * Possible values are:
     * `cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ONCE`
     * `cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS`
     * `cordova.plugins.diagnostic.permissionStatus.GRANTED`
     * @param {Function} errorCallback -  The callback which will be called when operation encounters an error.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Contacts.getContactsAuthorizationStatus = function(successCallback, errorCallback) {
        Diagnostic.getPermissionAuthorizationStatus(successCallback, errorCallback, Diagnostic.permission.READ_CONTACTS);
    };

    /**
     *  Requests contacts (address book) authorization for the application.
     *  Should only be called if authorization status is NOT_REQUESTED. Calling it when in any other state will have no effect.
     *
     * @param {Function} successCallback - The callback which will be called when authorization request is successful.
     * @param {Function} errorCallback - The callback which will be called when an error occurs.
     * This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Contacts.requestContactsAuthorization = function(successCallback, errorCallback) {
        Diagnostic.requestRuntimePermission(successCallback, errorCallback, Diagnostic.permission.READ_CONTACTS);
    };


    return Diagnostic_Contacts;
});
module.exports = new Diagnostic_Contacts();
