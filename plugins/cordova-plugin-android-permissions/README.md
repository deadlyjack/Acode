Android permission Cordova plugin
========

This plugin is designed for supporting Android new permissions checking mechanism.

Since Android 6.0, the Android permissions checking mechanism has been changed. In the past, the permissions were granted by users when they decide to install the app. Now, the permissions should be granted by a user when he/she is using the app.

For old Android plugins you (developers) are using may not support this new mechanism or already stop updating. So either to find a new plugin to solving this problem, nor trying to add the mechanism in the old plugin. If you don't want to do those, you can try this plugin.

As a convenience we support browser and iOS platforms as well. But this plugin will simple reply that any permission checked of requested was granted.

Installation
--------

```bash
cordova plugin add cordova-plugin-android-permissions
```

※ Support Android SDK >= 14

Usage
--------

### API

```javascript
var permissions = cordova.plugins.permissions;
permissions.checkPermission(permission, successCallback, errorCallback);
permissions.requestPermission(permission, successCallback, errorCallback);
permissions.requestPermissions(permissions, successCallback, errorCallback);
```

#### Deprecated API - still work now, will not support in the future.
```javascript
permissions.hasPermission(permission, successCallback, errorCallback);
permissions.hasPermission(successCallback, errorCallback, permission);
permissions.requestPermission(successCallback, errorCallback, permission);
```

### Permission Name

Following the Android design. See [Manifest.permission](http://developer.android.com/intl/zh-tw/reference/android/Manifest.permission.html).
```javascript
// Example
permissions.ACCESS_COARSE_LOCATION
permissions.CAMERA
permissions.GET_ACCOUNTS
permissions.READ_CONTACTS
permissions.READ_CALENDAR
...
```

## Examples
```js
var permissions = cordova.plugins.permissions;
```

#### Quick check
```js

permissions.hasPermission(permissions.CAMERA, function( status ){
  if ( status.hasPermission ) {
    console.log("Yes :D ");
  }
  else {
    console.warn("No :( ");
  }
});
```
#### Quick request
```js
permissions.requestPermission(permissions.CAMERA, success, error);

function error() {
  console.warn('Camera permission is not turned on');
}

function success( status ) {
  if( !status.hasPermission ) error();
}
```
#### Example multiple permissions
```js
var list = [
  permissions.CAMERA,
  permissions.GET_ACCOUNTS
];

permissions.hasPermission(list, callback, null);

function error() {
  console.warn('Camera or Accounts permission is not turned on');
}

function success( status ) {
  if( !status.hasPermission ) {
  
    permissions.requestPermissions(
      list,
      function(status) {
        if( !status.hasPermission ) error();
      },
      error);
  }
}
```

License
--------

    Copyright (C) 2016 Jason Yang

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
