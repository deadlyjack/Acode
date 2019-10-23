/* globals cordova, require, exports, module */

/**
 *  Diagnostic Notifications plugin for Android
 *
 *  Copyright (c) 2015 Working Edge Ltd.
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 **/
var Diagnostic_Notifications = (function(){
    /***********************
     *
     * Internal properties
     *
     *********************/
    var Diagnostic_Notifications = {};

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
     * Checks if remote notifications is available to the app.
     * Returns true if remote notifications are switched on.
     *
     * @param {Function} successCallback -  The callback which will be called when the operation is successful.
     * This callback function is passed a single boolean parameter which is TRUE if remote notifications is available.
     * @param {Function} errorCallback -  The callback which will be called when the operation encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    Diagnostic_Notifications.isRemoteNotificationsEnabled = function(successCallback, errorCallback) {
        return cordova.exec(Diagnostic._ensureBoolean(successCallback),
            errorCallback,
            'Diagnostic_Notifications',
            'isRemoteNotificationsEnabled',
            []);
    };

    return Diagnostic_Notifications;
});
module.exports = new Diagnostic_Notifications();