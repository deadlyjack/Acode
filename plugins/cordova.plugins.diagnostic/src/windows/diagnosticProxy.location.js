/**
 *  Diagnostic Location plugin for Windows 10 Universal
 *
 *  Copyright (c) 2015 Next Wave Software, Inc.
**/
cordova.commandProxy.add("Diagnostic_Location", {

    /**
     * Checks if location is enabled.
     *
     * @param {Function} successCallback - The callback which will be called when diagnostic is successful. 
     * This callback function is passed a single boolean parameter with the diagnostic result.
     * @param {Function} errorCallback -  The callback which will be called when diagnostic encounters an error.
     *  This callback function is passed a single string parameter containing the error message.
     */
    // exec(win, fail, 'Diagnostic', 'isLocationAvailable', []);
    isLocationAvailable: function (successCallback, errorCallback) {

        Windows.Devices.Geolocation.Geolocator.requestAccessAsync().done(
            function (accessStatus) {
                var isEnabled = false;
                var isError = false;
                switch (accessStatus) {
                    case Windows.Devices.Geolocation.GeolocationAccessStatus.allowed:
                        isEnabled = true;
                        break;
                    case Windows.Devices.Geolocation.GeolocationAccessStatus.denied:
                        isEnabled = false;
                        break;
                    case Windows.Devices.Geolocation.GeolocationAccessStatus.unspecified:
                        isError = true;
                        break;
                }
                if (!isError)
                    successCallback(isEnabled);
                else
                    errorCallback("Unspecified error");
            },
            function (error) {
                errorCallback(error);
            }
        );
    },

    /**
     * Display the location services settings page.
     */
    // exec(null, null, 'Diagnostic', 'switchToLocationSettings', []);
    switchToLocationSettings: function () {

        var uri = new Windows.Foundation.Uri("ms-settings:privacy-location");
        Windows.System.Launcher.launchUriAsync(uri);
    }
});
