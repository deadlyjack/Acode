/**
 *  Diagnostic Wifi plugin for Windows 10 Universal
 *
 *  Copyright (c) 2015 Next Wave Software, Inc.
**/
cordova.commandProxy.add("Diagnostic_Wifi", {

    /**
     * Display the wifi settings page.
     */
    // exec(null, null, 'Diagnostic', 'switchToWifiSettings', []);
    switchToWifiSettings: function () {

        var uri = new Windows.Foundation.Uri("ms-settings-wifi:");
        Windows.System.Launcher.launchUriAsync(uri);
    }

});
