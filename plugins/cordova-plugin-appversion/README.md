# Cordova App Version Plugin

Cordova/PhoneGap plugin for accessing the native app's version and build number within JavaScript. The values are bootstrapped at app load and can be used synchronously.

## Supported Platforms

- iOS
- Android

## Installation

The plugin can be installed with the Cordova CLI:

```shell
cordova plugin add cordova-plugin-appversion
```

The plugin is hosted on NPM so requires Cordova CLI `5.0.0` as a minimum. If you have any issues installing, make sure you have the most upto date version of Cordova from NPM:

```shell
npm install -g cordova
```

## Usage

After `deviceReady` has fired you'll be able to access a new object in the global scope that contains both the app version and build number.

```javascript
console.log(AppVersion.version); // e.g. "1.2.3"
console.log(AppVersion.build); // e.g. 1234
```
