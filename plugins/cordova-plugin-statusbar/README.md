---
title: Statusbar
description: Control the device status bar.
---
<!---
# license: Licensed to the Apache Software Foundation (ASF) under one
#         or more contributor license agreements.  See the NOTICE file
#         distributed with this work for additional information
#         regarding copyright ownership.  The ASF licenses this file
#         to you under the Apache License, Version 2.0 (the
#         "License"); you may not use this file except in compliance
#         with the License.  You may obtain a copy of the License at
#
#           http://www.apache.org/licenses/LICENSE-2.0
#
#         Unless required by applicable law or agreed to in writing,
#         software distributed under the License is distributed on an
#         "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#         KIND, either express or implied.  See the License for the
#         specific language governing permissions and limitations
#         under the License.
-->

|AppVeyor|Travis CI|
|:-:|:-:|
|[![Build status](https://ci.appveyor.com/api/projects/status/github/apache/cordova-plugin-statusbar?branch=master)](https://ci.appveyor.com/project/ApacheSoftwareFoundation/cordova-plugin-statusbar)|[![Build Status](https://travis-ci.org/apache/cordova-plugin-statusbar.svg?branch=master)](https://travis-ci.org/apache/cordova-plugin-statusbar)|

# cordova-plugin-statusbar

> The `StatusBar` object provides some functions to customize the iOS and Android StatusBar.

## Installation

This installation method requires cordova 5.0+

    cordova plugin add cordova-plugin-statusbar
Older versions of cordova can still install via the __deprecated__ id

    cordova plugin add org.apache.cordova.statusbar
It is also possible to install via repo url directly ( unstable )

    cordova plugin add https://github.com/apache/cordova-plugin-statusbar.git


Preferences
-----------

#### config.xml

-  __StatusBarOverlaysWebView__ (boolean, defaults to true). Make the statusbar overlay or not overlay the WebView at startup.

        <preference name="StatusBarOverlaysWebView" value="true" />

    ##### Android Quirks
    
    Only supported on Android 5 or later. Earlier versions will ignore this preference.

- __StatusBarBackgroundColor__ (color hex string, no default value). Set the background color of the statusbar by a hex string (#RRGGBB) at startup. If this value is not set, the background color will be transparent.

        <preference name="StatusBarBackgroundColor" value="#000000" />

- __StatusBarStyle__ (status bar style, defaults to lightcontent). Set the status bar style. Available options default, lightcontent, blacktranslucent, blackopaque.

        <preference name="StatusBarStyle" value="lightcontent" />

- __StatusBarDefaultScrollToTop__ (boolean, defaults to false). On iOS, allows the Cordova WebView to use default scroll-to-top behavior. Defaults to false so you can listen to the "statusTap" event (described below) and customize the behavior instead.

        <preference name="StatusBarDefaultScrollToTop" value="false" />

### Android Quirks
The Android 5+ guidelines specify using a different color for the statusbar than your main app color (unlike the uniform statusbar color of many iOS apps), so you may want to set the statusbar color at runtime instead via `StatusBar.backgroundColorByHexString` or `StatusBar.backgroundColorByName`. One way to do that would be:
```js
if (cordova.platformId == 'android') {
    StatusBar.backgroundColorByHexString("#333");
}
```

It is also possible to make the status bar semi-transparent. Android uses hexadecimal ARGB values, which are formatted as #AARRGGBB. That first pair of letters, the AA, represent the alpha channel. You must convert your decimal opacity values to a hexadecimal value. You can read more about it [here](https://stackoverflow.com/questions/5445085/understanding-colors-on-android-six-characters/11019879#11019879).

For example, a black status bar with 20% opacity:
```js
if (cordova.platformId == 'android') {
    StatusBar.overlaysWebView(true);
    StatusBar.backgroundColorByHexString('#33000000');
}
```

Hiding at startup
-----------

During runtime you can use the StatusBar.hide function below, but if you want the StatusBar to be hidden at app startup on iOS, you must modify your app's Info.plist file.

Add/edit these two attributes if not present. Set **"Status bar is initially hidden"** to **"YES"** and set **"View controller-based status bar appearance"** to **"NO"**. If you edit it manually without Xcode, the keys and values are:


	<key>UIStatusBarHidden</key>
	<true/>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<false/>


Methods
-------
This plugin defines global `StatusBar` object.

Although in the global scope, it is not available until after the `deviceready` event.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(StatusBar);
    }

- StatusBar.overlaysWebView
- StatusBar.styleDefault
- StatusBar.styleLightContent
- StatusBar.styleBlackTranslucent
- StatusBar.styleBlackOpaque
- StatusBar.backgroundColorByName
- StatusBar.backgroundColorByHexString
- StatusBar.hide
- StatusBar.show

Properties
--------

- StatusBar.isVisible

Events
------

- statusTap

StatusBar.overlaysWebView
=================

Make the statusbar overlay or not overlay the WebView.

    StatusBar.overlaysWebView(true);

Description
-----------

Set to true to make the statusbar overlay on top of your app. Ensure that you adjust your styling accordingly so that your app's title bar or content is not covered. Set to false to make the statusbar solid and not overlay your app. You can then set the style and background color to suit using the other functions.


Supported Platforms
-------------------

- iOS 7+
- Android 5+

Quick Example
-------------

    StatusBar.overlaysWebView(true);
    StatusBar.overlaysWebView(false);

StatusBar.styleDefault
=================

Use the default statusbar (dark text, for light backgrounds).

    StatusBar.styleDefault();


Supported Platforms
-------------------

- iOS
- Android 6+
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1

StatusBar.styleLightContent
=================

Use the lightContent statusbar (light text, for dark backgrounds).

    StatusBar.styleLightContent();


Supported Platforms
-------------------

- iOS
- Android 6+
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1

StatusBar.styleBlackTranslucent
=================

Use the blackTranslucent statusbar (light text, for dark backgrounds).

    StatusBar.styleBlackTranslucent();


Supported Platforms
-------------------

- iOS
- Android 6+
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1

StatusBar.styleBlackOpaque
=================

Use the blackOpaque statusbar (light text, for dark backgrounds).

    StatusBar.styleBlackOpaque();


Supported Platforms
-------------------

- iOS
- Android 6+
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1


StatusBar.backgroundColorByName
=================

On iOS, when you set StatusBar.overlaysWebView to false, you can set the background color of the statusbar by color name.

    StatusBar.backgroundColorByName("red");

Supported color names are:

    black, darkGray, lightGray, white, gray, red, green, blue, cyan, yellow, magenta, orange, purple, brown


Supported Platforms
-------------------

- iOS
- Android 5+
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1

StatusBar.backgroundColorByHexString
=================

Sets the background color of the statusbar by a hex string.

    StatusBar.backgroundColorByHexString("#C0C0C0");

CSS shorthand properties are also supported.

    StatusBar.backgroundColorByHexString("#333"); // => #333333
    StatusBar.backgroundColorByHexString("#FAB"); // => #FFAABB

On iOS, when you set StatusBar.overlaysWebView to false, you can set the background color of the statusbar by a hex string (#RRGGBB).

On Android, when StatusBar.overlaysWebView is true, and on WP7&8, you can also specify values as #AARRGGBB, where AA is an alpha value.

Supported Platforms
-------------------

- iOS
- Android 5+
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1

StatusBar.hide
=================

Hide the statusbar.

    StatusBar.hide();


Supported Platforms
-------------------

- iOS
- Android
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1

StatusBar.show
=================

Shows the statusbar.

    StatusBar.show();


Supported Platforms
-------------------

- iOS
- Android
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1


StatusBar.isVisible
=================

Read this property to see if the statusbar is visible or not.

    if (StatusBar.isVisible) {
    	// do something
    }


Supported Platforms
-------------------

- iOS
- Android
- Windows Phone 7
- Windows Phone 8
- Windows Phone 8.1


statusTap
=========

Listen for this event to know if the statusbar was tapped.

    window.addEventListener('statusTap', function() {
        // scroll-up with document.body.scrollTop = 0; or do whatever you want
    });


Supported Platforms
-------------------

- iOS
