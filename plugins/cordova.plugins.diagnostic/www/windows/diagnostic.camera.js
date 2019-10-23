/**
 *  Diagnostic Camera plugin for Windows 10 Universal
 *
 *  Copyright (c) Next Wave Software, Inc.
**/
var Diagnostic_Camera = function () { };

function mapFromLegacyCameraApi() {
    var params;
    if (typeof arguments[0]  === "function") {
        params = (arguments.length > 2 && typeof arguments[2]  === "object") ? arguments[2] : {};
        params.successCallback = arguments[0];
        if(arguments.length > 1 && typeof arguments[1]  === "function") {
            params.errorCallback = arguments[1];
        }
    }else { // if (typeof arguments[0]  === "object")
        params = arguments[0];
    }
    return params;
}

/**
 * Checks if camera exists.
 *
 * @param {Object} params - (optional) parameters:
 * 	- {Function} successCallback -  The callback which will be called when diagnostic is successful.
 * This callback function is passed a single boolean parameter with the diagnostic result.
 * 	- {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
 *  This callback function is passed a single string parameter containing the error message.
 */
Diagnostic_Camera.prototype.isCameraAvailable = function (params) {
    params = mapFromLegacyCameraApi.apply(this, arguments);

    return cordova.exec(params.successCallback,
        params.errorCallback,
        'Diagnostic_Camera',
        'isCameraAvailable',
        []);
};

module.exports = new Diagnostic_Camera();
