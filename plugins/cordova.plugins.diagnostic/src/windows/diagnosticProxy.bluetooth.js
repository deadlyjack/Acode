/**
 *  Diagnostic Bluetooth plugin for Windows 10 Universal
 *
 *  Copyright (c) 2015 Next Wave Software, Inc.
**/
cordova.commandProxy.add("Diagnostic_Bluetooth", {

    /**
     * Display the bluetooth settings page.
     */
    // exec(null, null, 'Diagnostic', 'switchToBluetoothSettings', []);
    switchToBluetoothSettings: function () {

        // Mike says: According to the docs, "ms-settings-bluetooth:" is the correct URI to use
        // to take the user directly to the Bluetooth page in the mobile settings app, but as of 10/9/2015
        // it does not work (we just get back "false" in the success callback). So,
        // using the desktop settings URI until this gets fixed, which takes the user to the
        // "which of these settings are you interested in?" page.
        var uri = new Windows.Foundation.Uri("ms-settings:bluetooth");
        Windows.System.Launcher.launchUriAsync(uri);
    }

});
