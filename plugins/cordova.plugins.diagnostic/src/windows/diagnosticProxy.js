/**
 *  Diagnostic plugin for Windows 10 Universal
 *
 *  Copyright (c) 2015 Next Wave Software, Inc.
**/
cordova.commandProxy.add("Diagnostic", {


    /**
     * Display the mobile data settings page.
     */
    // exec(null, null, 'Diagnostic', 'switchToMobileDataSettings', []);
    switchToMobileDataSettings: function () {

        var uri = new Windows.Foundation.Uri("ms-settings:datausage");
        Windows.System.Launcher.launchUriAsync(uri);
    },

    /**
     * Checks if bluetooth/wifi is enabled.
     *
     * @param {Function} successCallback - The callback which will be called when diagnostic is successful.
     * This callback function is passed a single boolean parameter with the diagnostic result.
     * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     * @param {String} radioToCheck - "bluetooth" or "wifi".
     */
    // exec(win, fail, 'Diagnostic', 'isRadioEnabled', [bluetooth/wifi]);
    isRadioEnabled: function (successCallback, errorCallback, radioToCheck) {

        Windows.Devices.Radios.Radio.getRadiosAsync().done(
            function (radioList) {
                var radioKind = (radioToCheck == "bluetooth") ? Windows.Devices.Radios.RadioKind.bluetooth : Windows.Devices.Radios.RadioKind.wiFi;
                var isEnabled = false;
                for (var i = 0; i < radioList.length; i++) {
                    if ((radioList[i].kind == radioKind)
                        && (radioList[i].state == Windows.Devices.Radios.RadioState.on)) {
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
    },

    /**
     * Enables/disables WiFi or Bluetooth on the device.
     *
     * @param {Function} successCallback - function to call on successful setting of radio state
     * @param {Function} errorCallback - function to call on failure to set radio state.
     * This callback function is passed a single string parameter containing the error message.
     * @param {String} radioToSet - "bluetooth" or "wifi".
     * @param {Boolean} state - WiFi state to set: TRUE for enabled, FALSE for disabled.
     */
    // exec(win, fil, 'Diagnostic', 'setRadioState', [bluetooth/wifi, true/false]);
    setRadioState: function (successCallback, errorCallback, args) {

        var radioToSet = args[0];
        var state = args[1];

        // Check the return code from Radio.requestAccessAsync() and Radio.setStateAsync() 
        // calls below, return "Ok" if successful, error message if not.
        function checkRadioAccessError(accessStatus) {
            var msgOut = "";
            switch (accessStatus) {
                case Windows.Devices.Radios.RadioAccessStatus.allowed:
                    msgOut = "Ok";
                    break;
                case Windows.Devices.Radios.RadioAccessStatus.deniedByUser:
                    msgOut = "Access denied by user";
                    break;
                case Windows.Devices.Radios.RadioAccessStatus.deniedBySystem:
                    msgOut = "Access denied by system";
                    break;
                case Windows.Devices.Radios.RadioAccessStatus.unspecified:
                default:
                    msgOut = "Access denied, unspecified reason";
                    break;
            }
            return (msgOut);
        }

        // Get the requested radio
        var radioKind = (radioToSet == "bluetooth") ? Windows.Devices.Radios.RadioKind.bluetooth : Windows.Devices.Radios.RadioKind.wiFi;
        Windows.Devices.Radios.Radio.getRadiosAsync().done(
            function (radioList) {
                var radio = null;
                for (var i = 0; i < radioList.length; i++) {
                    if (radioList[i].kind == radioKind) {
                        radio = radioList[i];
                        break;
                    }
                }
                if (radio == null) {
                    errorCallback("Device not found");
                    return;
                }

                // Get access to the radio
                Windows.Devices.Radios.Radio.requestAccessAsync().done(
                    function (accessStatus) {
                        var resultMsg = checkRadioAccessError(accessStatus);
                        if (resultMsg != "Ok") {
                            errorCallback(resultMsg);
                            return;
                        }

                        // Set the state of the radio
                        var radioState = (state) ? Windows.Devices.Radios.RadioState.on : Windows.Devices.Radios.RadioState.off;
                        radio.setStateAsync(radioState).done(
                            function (accessStatus) {
                                var resultMsg = checkRadioAccessError(accessStatus);
                                if (resultMsg == "Ok")
                                    successCallback();
                                else
                                    errorCallback(resultMsg);
                            },
                            function (error) {
                                errorCallback(error);
                            }
                        );
                    },
                    function (error) {
                        errorCallback(error);
                    }
                );
            },
            function (error) {
                errorCallback(error);
            }
        );
    }
});
