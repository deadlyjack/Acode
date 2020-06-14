# Cordova Plugin for accessing the Cordova Intent and handling onNewIntent (Android Only)

__This plugin is not longer maintained.__

This plugin allows you to add functionality for receiving content sent from other apps. To enable receiving sent content add the following XML to the MainActivity section of your AndroidManifest.xml

```xml
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <action android:name="android.intent.action.SEND_MULTIPLE" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="*/*" />
</intent-filter>
```

You can adjust the mime types your application accepts by defining them explicitly. The above example allows any mime type.

The following example limits allowed mime types to JPG-Images. 

```xml
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <action android:name="android.intent.action.SEND_MULTIPLE" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="image/jpeg" />
</intent-filter>
```

If you do not want to handle multiple files at once, you can remove the following tag:
 
```xml
<action android:name="android.intent.action.SEND_MULTIPLE" />
```

It is recommended to use a hook or the custom config plugin to ensure that the above XML will automatically added in case you want to have a fresh checkout or remove/add the platform.

A very quick and much more dirty example hook (tested on Mac OS-X, requires Ruby):

```ruby
#!/usr/bin/env ruby

replace="
            </intent-filter>
            <intent-filter>
                <action android:name='android.intent.action.SEND' />
                <action android:name='android.intent.action.SEND_MULTIPLE'/>
                <category android:name='android.intent.category.DEFAULT' />
                <data android:mimeType='*/*' />
    "

filename = "platforms/android/AndroidManifest.xml"
outdata = File.read(filename).gsub(/<category android\:name=\"android\.intent\.category\.LAUNCHER\" \/>([^<]*)<\/intent-filter>([^<]*)<\/activity>/, "<category android\:name=\"android\.intent\.category\.LAUNCHER\" \/>#{replace}<\/intent-filter><\/activity>")

File.open(filename, 'w') do |out|
    out << outdata
end
```

### Note

By default the launch mode of the MainActivity of cordova based applications is set to "singleTop". This is ok for most situations. However you may prefer having the launch mode set to "singleTask" instead. Please read this article to get an idea about the different launch modes: https://www.mobomo.com/2011/06/android-understanding-activity-launchmode/
 
Setting the launch mode to "singleTask" ensures that your app cannot run in multiple instances as it might happen if launch mode is set to "singleTop" for example if your application is already running and you try to share a webpage from the browser to it.

#### Example of MainActivity section in AndroidManifest.xml

```xml
<activity android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale" 
          android:label="@string/activity_name" 
          android:launchMode="singleTask" 
          android:name="MainActivity" 
          android:theme="@android:style/Theme.Holo.Light" 
          android:windowSoftInputMode="adjustResize">
          
    <intent-filter android:label="@string/launcher_name">
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <action android:name="android.intent.action.SEND_MULTIPLE" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="*/*" />
    </intent-filter>
    
</activity>
```

Cordova >= 6.0.0 apparently requires the launchMode to be set in ``config.xml`` as well:
```xml
<platform name="android">
    ...
    <preference name="AndroidLaunchMode" value="singleTask"/>
</platform>
```

## Installation

Add the plugin to your project using Cordova CLI:

```bash
cordova plugin add https://github.com/napolitano/cordova-plugin-intent
```

Or using PhoneGap CLI:

```bash
phonegap local plugin add https://github.com/napolitano/cordova-plugin-intent
```

## Usage

```js
window.plugins.intent.setNewIntentHandler(function (intent) {
    // Do things
});
```

```js
window.plugins.intent.getCordovaIntent(function (intent) {}, function () {});
```

```js
window.plugins.intent.getRealPathFromContentUrl(contentUrl, function (realPath) {}, function () {});
```

## Example Intent passed from plugin

```json
{
    "action": "android.intent.action.SEND_MULTIPLE",
    "clipItems": [
        {
            "uri": "file:///storage/emulated/0/Download/example-document.pdf",
            "type": "application/pdf",
            "extension": "pdf"
        },
        {
            "uri": "file:///storage/emulated/0/Download/example-archive.zip",
            "type": "application/zip",
            "extension": "zip"
        }
        {
            "uri": "content://media/external/images/media/29",
            "type": "image/jpeg",
            "extension": "jpeg"
        }

    ],
    "flags": 390070273,
    "type": "*/*",
    "component": "ComponentInfo{com.example.droid/com.example.droid.MainActivity}",
    "extras": "Bundle[mParcelledData.dataSize=596]"
}
```

While this example shows an JSON representation, you'll actually receive a ready-to-use object (of course with the attributes shown above).

## Methods

### getCordovaIntent() - Android
Get limited access to intent properties

### getRealPathFromContentUrl(contentUrl, successCallback, failureCallback) - Android
Get the real path for the contentUrl

## Events

### setNewIntentHandler(method) - Android
Method passed will be triggered on new intent. Provides limited access to the new intent. 


### Supported Platforms

- Android (>= API Level 19 / Kitkat)


### Basic example

#### Get cordova intent

```js
document.addEventListener('deviceReady', function(){
    window.plugins.intent.getCordovaIntent(function (Intent) {
        console.log(Intent);
    }, function () {
        console.log('Error');
    });
}
```

#### Get real path from content URL

```js
document.addEventListener('deviceReady', function(){
    window.plugins.intent.getRealPathFromContentUrl(
        'content://media/external/images/media/81',
        function (realPath) {
            console.log(realPath);
        }, 
        function () {
            console.log('Error');
        }
    );
}
```

#### Handle new intent

```js
document.addEventListener('deviceReady', function(){
    window.plugins.intent.setNewIntentHandler(function (Intent) {
        console.log(Intent);
    });
}
```

## Limitations

The plugin is a bare-bones implementation to help me with __my__ projects. The intent passed to JavaScript is not a complete serialized object. The code should receive some refactorings and would benefit from a better JSON library like gson or similar. Test would be nice too.

## Example App

![Screenshot](/example/screenshot/screenshot.jpg?raw=true "Screenshot of Example App")

An example app for Android (made with cordova 5.4.1) was added to the project. The app shows basic usage of the plugin. 


# iOS

On iOS the method "window.handleOpenURL" is your friend. This method will be triggered if someone uses "Open in" to share content to your app.

A basic implementation could look like:

```js
window.handleOpenURL = function (url) {
    window.resolveLocalFileSystemURI (
        url, 
        function (fileEntry) {
            fileEntry.file (
                function (file) {
                    console.log ('Successfully received file: ' + file.name);
                },
                function (error) {
                    console.log (error);
                }
            )
        }, 
        function (error) {
            console.log(error);
        }
    )
};
```

In order to get this working and make your app a "Open in"-Target on iOS, you have to add some XML to your info.plist

```xml
<plist version="1.0">
    <dict>
  
  <!-- whatever else -->
  
  
    <key>UIFileSharingEnabled</key>
    <true/>
    
    <key>CFBundleDocumentTypes</key>
        <array>
            <dict>
                <key>CFBundleTypeIconFiles</key>
                <array>
                    <string>icon-small</string>
                </array>
                <key>CFBundleTypeName</key>
                <string>${PRODUCT_NAME}</string>
                <key>CFBundleTypeRole</key>
                <string>Viewer</string>
                <key>LSHandlerRank</key>
                <string>Alternate</string>
                <key>LSItemContentTypes</key>
                <array>
                    <string>public.data</string>
                    <string>public.text</string>
                    <string>public.image</string>
                    <string>public.audio</string>
                    <string>public.audiovisual-content</string>
                    <string>public.xml</string>
                    <string>public.movie</string>
                    <string>public.font</string>
                    <string>com.adobe.postscript</string>
                    <string>com.adobe.pdf</string>
                    <string>org.gnu.gnu-zip-archve</string>
                </array>
            </dict>
        </array>
      </dict>
</plist>    
```
