# PhoneGap Toast plugin

for Android, iOS, WP8, Windows and BlackBerry by [Eddy Verbruggen](http://www.x-services.nl/phonegap-toast-plugin/796)

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=eddyverbruggen%40gmail%2ecom&lc=US&item_name=cordova%2dplugin%2dtoast&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)
If you like this plugin and want to say thanks please send a PR or donation. Both are equally appreciated!


<table width="100%">
    <tr>
        <td width="100"><a href="http://plugins.telerik.com/plugin/toast"><img src="http://www.x-services.nl/github-images/telerik-verified-plugins-marketplace.png" width="97px" height="71px" alt="Marketplace logo"/></a></td>
        <td>For a quick demo app and easy code samples, check out the plugin page at the Verified Plugins Marketplace: http://plugins.telerik.com/plugin/toast</td>
    </tr>
</table>

## 0. Index

1. [Description](#1-description)
2. [Screenshots](#2-screenshots)
3. [Installation](#3-installation)
  3. [Automatically (CLI / Plugman)](#automatically-cli--plugman)
  3. [Manually](#manually)
  3. [PhoneGap Build](#phonegap-build)
4. [Usage](#4-usage)
  4. [Styling](#styling)
5. [Credits](#5-credits)
6. [Changelog](#6-changelog)

## 1. Description

This plugin allows you to show a native Toast (a little text popup) on iOS, Android and WP8.
It's great for showing a non intrusive native notification which is guaranteed always in the viewport of the browser.
* You can choose where to show the Toast: at the top, center or bottom of the screen.
* You can choose two durations: short (approx. 2 seconds), or long (approx. 5 seconds), after which the Toast automatically disappears.

Example usages:
* "There were validation errors"
* "Account created successfully"
* "The record was deleted"
* "Login successful"
* "You are now logged out"
* "Connection failure, please try again later"
* "Created Order #00287

## 2. Screenshots

iOS

![ScreenShot](screenshots/screenshot-ios-toast.png)

A few styling options

![ScreenShot](screenshots/styling-green.png)

![ScreenShot](screenshots/styling-red.png)


Android

![ScreenShot](screenshots/screenshot-android-toast.png)


Windows Phone 8

![ScreenShot](screenshots/screenshot-wp8.jpg)

## 3. Installation

### Automatically (CLI / Plugman)
Toast is compatible with [Cordova Plugman](https://github.com/apache/cordova-plugman), compatible with [PhoneGap 3.0 CLI](http://docs.phonegap.com/en/3.0.0/guide_cli_index.md.html#The%20Command-line%20Interface_add_features), here's how it works with the CLI (backup your project first!):

Using the Cordova CLI and the [Cordova Plugin Registry](http://plugins.cordova.io)
```
$ cordova plugin add cordova-plugin-x-toast
$ cordova prepare
```

Or using the phonegap CLI
```
$ phonegap local plugin add cordova-plugin-x-toast
```

Toast.js is brought in automatically. There is no need to change or add anything in your html.

### Manually
You'd better use the CLI, but here goes:

1\. Add the following xml to your `config.xml` in the root directory of your `www` folder:
```xml
<!-- for iOS -->
<feature name="Toast">
  <param name="ios-package" value="Toast" />
</feature>
```
```xml
<!-- for Android -->
<feature name="Toast">
  <param name="android-package" value="nl.xservices.plugins.Toast" />
</feature>
```
```xml
<!-- for WP8 -->
<feature name="Toast">
  <param name="wp-package" value="Toast"/>
</feature>
```

For iOS, you'll need to add the `QuartzCore.framework` to your project (it's for automatically removing the Toast after a few seconds).
Click your project, Build Phases, Link Binary With Libraries, search for and add `QuartzCore.framework`.

2\. Grab a copy of Toast.js, add it to your project and reference it in `index.html`:
```html
<script type="text/javascript" src="js/Toast.js"></script>
```

3\. Download the source files and copy them to your project.

iOS: Copy the two `.h` and two `.m` files to `platforms/ios/<ProjectName>/Plugins`

Android: Copy `Toast.java` to `platforms/android/src/nl/xservices/plugins` (create the folders)

WP8: Copy `Toast.cs` to `platforms/wp8/Plugins/nl.x-services.plugins.toast` (create the folders)

### PhoneGap Build

Toast works with PhoneGap build too, but only with PhoneGap 3.0 and up.

Just add the following xml to your `config.xml` to always use the latest version of this plugin:
```xml
<gap:plugin name="cordova-plugin-x-toast" source="npm" />
```

Toast.js is brought in automatically. There is no need to change or add anything in your html.

## 4. Usage

### Showing a Toast
You have two choices to make when showing a Toast: where to show it and for how long.
* show(message, duration, position)
* duration: 'short', 'long', '3000', 900 (the latter are milliseconds)
* position: 'top', 'center', 'bottom'

You can also use any of these convenience methods:
* showShortTop(message)
* showShortCenter(message)
* showShortBottom(message)
* showLongTop(message)
* showLongCenter(message)
* showLongBottom(message)

You can copy-paste these lines of code for a quick test:
```html
<button onclick="window.plugins.toast.showShortTop('Hello there!', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)})">Toast showShortTop</button>
<button onclick="window.plugins.toast.showLongBottom('Hello there!', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)})">Toast showLongBottom</button>
<button onclick="window.plugins.toast.show('Hello there!', 'long', 'center', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)})">Toast show long center</button>
```

#### Tweaking the vertical position
Since 2.1.0 you can add pixels to move the toast up or down.
Note that `showWithOptions` can be used instead of the functions above, but it's not useful unless you want to pass `addPixelsY`.
```js
function showBottom() {
  window.plugins.toast.showWithOptions(
    {
      message: "hey there",
      duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
      position: "bottom",
      addPixelsY: -40  // added a negative value to move it up a bit (default 0)
    },
    onSuccess, // optional
    onError    // optional
  );
}
```

### Hiding a Toast
In case you want to hide a Toast manually, call this:
```js
function hide() {
  // this function takes an optional success callback, but you can do without just as well
  window.plugins.toast.hide();
}
```

When the toast gets hidden, your success callback will be called (in case you have defined one) with the `event` property equals to `hide` (more details about the callback in the next section).
```js

  window.plugins.toast.showWithOptions({
      message: 'My message',
      // More config here...
  },
      //Success callback
      function(args) {
          console.log(args.event);
          //This will print 'hide'
      }, 
      function(error) {
          console.error('toast error: ', error);
      }
  );
```

### Receiving a callback when a Toast is tapped
On iOS and Android the success handler of your `show` function will be notified (again) when the toast was tapped.

So the first time the success handler fires is when the toast is shown, and in case the user taps the toast it will be
called again. You can distinguish between those events of course:

```js
  window.plugins.toast.showWithOptions(
    {
      message: "hey there",
      duration: 1500, // ms
      position: "bottom",
      addPixelsY: -40,  // (optional) added a negative value to move it up a bit (default 0)
      data: {'foo':'bar'} // (optional) pass in a JSON object here (it will be sent back in the success callback below)
    },
    // implement the success callback
    function(result) {
      if (result && result.event) {
        console.log("The toast was tapped or got hidden, see the value of result.event");
        console.log("Event: " + result.event); // "touch" when the toast was touched by the user or "hide" when the toast geot hidden
        console.log("Message: " + result.message); // will be equal to the message you passed in
        console.log("data.foo: " + result.data.foo); // .. retrieve passed in data here
        
        if (result.event === 'hide') {
          console.log("The toast has been shown");
        }
      }
    }
  );
```

The success callback is useful when your toast is binded to a notification id in your backend and you have to mark it as `read` when the toast is done, or to update the notifications counter for iOS. The usage of this will be defined by your application logic. Use the `result.data` object to support your specific logic.

### Styling
Since version 2.4.0 you can pass an optional `styling` object to the plugin.
The defaults make sure the Toast looks the same as when you would not pass in the `styling` object at all.

Note that on WP this object is currently ignored.

```js
  window.plugins.toast.showWithOptions({
    message: "hey there",
    duration: "short", // 2000 ms
    position: "bottom",
    styling: {
      opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
      backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
      textColor: '#FFFF00', // Ditto. Default #FFFFFF
      textSize: 20.5, // Default is approx. 13.
      cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
      horizontalPadding: 20, // iOS default 16, Android default 50
      verticalPadding: 16 // iOS default 12, Android default 30
    }
  });
```

Tip: if you need to pass different values for iOS and Android you can use fi. the device plugin
to determine the platform and pass `opacity: isAndroid() ? 0.7 : 0.9`.

### WP8 quirks
The WP8 implementation needs a little more work, but it's perfectly useable when you keep this in mind:
* You can't show two Toasts simultaneously.
* Wait until the first Toast is hidden before the second is shown, otherwise the second one will be hidden quickly.
* The positioning of the bottom-aligned Toast is not perfect, but keep it down to 1 or 2 lines of text and you're fine.


## 5. CREDITS

This plugin was enhanced for Plugman / PhoneGap Build by [Eddy Verbruggen](http://www.x-services.nl).
The Android code was entirely created by me.
For iOS most credits go to this excellent [Toast for iOS project by Charles Scalesse] (https://github.com/scalessec/Toast).

## 6. CHANGELOG
- 2.7.2: Even better Android compatibility, but you're limited to short and long durations now, on Android.
- 2.7.0: [Android P compatibility.](https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin/issues/116)
- 2.6.2: [iOS view hierarchy fix.](https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin/pull/112)
- 2.6.0: Windows support!
- 2.5.2: Multi-line wrapping Toasts are now center aligned.
- 2.5.1: You can now specify the `textSize` used in the font for iOS and Android.
- 2.5.0: By popular demand: Specify the duration of the Toast on iOS and Android. Pass in `short` (2000ms), `long` (4000ms), or any nr of milliseconds: `900`.
- 2.4.2: You can now also set the Toast `opacity` for iOS.
- 2.4.1: As an addition to 2.4.0, [Sino](https://github.com/SinoBoeckmann) added the option to change the text color!
- 2.4.0: You can now style the Toast with a number of properties. See
- 2.3.2: The click event introduced with 2.3.0 did not work with Android 5+.
- 2.3.0: The plugin will now report back to JS if Toasts were tapped by the user.
- 2.0.1: iOS messages are hidden when another one is shown. [Thanks Richie Min!](https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin/pull/13)
- 2.0: WP8 support
- 1.0: initial version supporting Android and iOS
