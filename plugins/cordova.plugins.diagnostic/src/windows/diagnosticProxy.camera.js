/**
 *  Diagnostic Camera plugin for Windows 10 Universal
 *
 *  Copyright (c) 2015 Next Wave Software, Inc.
**/
cordova.commandProxy.add("Diagnostic_Camera", {

    /**
     * Checks if camera is enabled.
     *
     * @param {Function} successCallback - The callback which will be called when diagnostic is successful.
     * This callback function is passed a single boolean parameter with the diagnostic result.
     * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    // exec(win, fail, 'Diagnostic_Camera', 'isCameraAvailable', []);
    isCameraAvailable: function (successCallback, errorCallback) {

        Windows.Devices.Enumeration.DeviceInformation.findAllAsync(Windows.Devices.Enumeration.DeviceClass.videoCapture).then(
            function (deviceList) {
                var isEnabled = false;
                for (var i = 0; i < deviceList.length; i++) {
                    if ((deviceList[i].enclosureLocation != null) && (deviceList[i].enclosureLocation.panel === Windows.Devices.Enumeration.Panel.back)) {
                        isEnabled = true;
                        break;
                    }
                }
                successCallback(isEnabled);
            },
            function (error) {
                errorCallback(error);
            }
        );
    }
});
