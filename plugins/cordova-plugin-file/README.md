---
title: File
description: Read/write files on the device.
---
<!--
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

# cordova-plugin-file

[![Android Testsuite](https://github.com/apache/cordova-plugin-file/actions/workflows/android.yml/badge.svg)](https://github.com/apache/cordova-plugin-file/actions/workflows/android.yml) [![Chrome Testsuite](https://github.com/apache/cordova-plugin-file/actions/workflows/chrome.yml/badge.svg)](https://github.com/apache/cordova-plugin-file/actions/workflows/chrome.yml) [![iOS Testsuite](https://github.com/apache/cordova-plugin-file/actions/workflows/ios.yml/badge.svg)](https://github.com/apache/cordova-plugin-file/actions/workflows/ios.yml) [![Lint Test](https://github.com/apache/cordova-plugin-file/actions/workflows/lint.yml/badge.svg)](https://github.com/apache/cordova-plugin-file/actions/workflows/lint.yml)

This plugin implements a File API allowing read/write access to files residing on the device.

This plugin is based on several specs, including :
The HTML5 File API
[http://www.w3.org/TR/FileAPI/](http://www.w3.org/TR/FileAPI/)

The Directories and System extensions
Latest:
[http://www.w3.org/TR/2012/WD-file-system-api-20120417/](http://www.w3.org/TR/2012/WD-file-system-api-20120417/)
Although most of the plugin code was written when an earlier spec was current:
[http://www.w3.org/TR/2011/WD-file-system-api-20110419/](http://www.w3.org/TR/2011/WD-file-system-api-20110419/)

It also implements the FileWriter spec :
[http://dev.w3.org/2009/dap/file-system/file-writer.html](http://dev.w3.org/2009/dap/file-system/file-writer.html)

>*Note* While the W3C FileSystem spec is deprecated for web browsers, the FileSystem APIs are supported in Cordova applications with this plugin for the platforms listed in the _Supported Platforms_ list, with the exception of the Browser platform.

To get a few ideas how to use the plugin, check out the [sample](#sample) at the bottom of this page. For additional examples (browser focused), see the HTML5 Rocks' [FileSystem article.](http://www.html5rocks.com/en/tutorials/file/filesystem/)

For an overview of other storage options, refer to Cordova's
[storage guide](http://cordova.apache.org/docs/en/latest/cordova/storage/storage.html).

This plugin defines a global `cordova.file` object.

Although the object is in the global scope, it is not available to applications until after the `deviceready` event fires.

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(cordova.file);
    }

## Installation

    cordova plugin add cordova-plugin-file

## Supported Platforms

- Android
- iOS
- OS X
- Windows*
- Browser

\* _These platforms do not support `FileReader.readAsArrayBuffer` nor `FileWriter.write(blob)`._

## Where to Store Files

As of v1.2.0, URLs to important file-system directories are provided.
Each URL is in the form _file:///path/to/spot/_, and can be converted to a
`DirectoryEntry` using `window.resolveLocalFileSystemURL()`.

* `cordova.file.applicationDirectory` - Read-only directory where the application
  is installed. (_iOS_, _Android_, _BlackBerry 10_, _OSX_, _windows_)

* `cordova.file.applicationStorageDirectory` - Root directory of the application's
  sandbox; on iOS & windows this location is read-only (but specific subdirectories [like
  `/Documents` on iOS or `/localState` on windows] are read-write). All data contained within
  is private to the app. (_iOS_, _Android_, _BlackBerry 10_, _OSX_)

* `cordova.file.dataDirectory` - Persistent and private data storage within the
  application's sandbox using internal memory (on Android, if you need to use
  external memory, use `.externalDataDirectory`). On iOS, this directory is not
  synced with iCloud (use `.syncedDataDirectory`). (_iOS_, _Android_, _BlackBerry 10_, _windows_)

* `cordova.file.cacheDirectory` -  Directory for cached data files or any files
  that your app can re-create easily. The OS may delete these files when the device
  runs low on storage, nevertheless, apps should not rely on the OS to delete files
  in here. (_iOS_, _Android_, _BlackBerry 10_, _OSX_, _windows_)

* `cordova.file.externalApplicationStorageDirectory` - Application space on
  external storage. (_Android_)

* `cordova.file.externalDataDirectory` - Where to put app-specific data files on
  external storage. (_Android_)

* `cordova.file.externalCacheDirectory` - Application cache on external storage.
  (_Android_)

* `cordova.file.externalRootDirectory` - External storage (SD card) root. (_Android_, _BlackBerry 10_)

* `cordova.file.tempDirectory` - Temp directory that the OS can clear at will. Do not
  rely on the OS to clear this directory; your app should always remove files as
  applicable. (_iOS_, _OSX_, _windows_)

* `cordova.file.syncedDataDirectory` - Holds app-specific files that should be synced
  (e.g. to iCloud). (_iOS_, _windows_)

* `cordova.file.documentsDirectory` - Files private to the app, but that are meaningful
  to other application (e.g. Office files). Note that for _OSX_ this is the user's `~/Documents` directory. (_iOS_, _OSX_)

* `cordova.file.sharedDirectory` - Files globally available to all applications (_BlackBerry 10_)

## File System Layouts

Although technically an implementation detail, it can be very useful to know how
the `cordova.file.*` properties map to physical paths on a real device.

### iOS File System Layout

| Device Path                                    | `cordova.file.*`            | `iosExtraFileSystems` | r/w? | persistent? | OS clears | sync | private |
|:-----------------------------------------------|:----------------------------|:----------------------|:----:|:-----------:|:---------:|:----:|:-------:|
| `/var/mobile/Applications/<UUID>/`             | applicationStorageDirectory | -                     | r    |     N/A     |     N/A   | N/A  |   Yes   |
| &nbsp;&nbsp;&nbsp;`appname.app/`               | applicationDirectory        | bundle                | r    |     N/A     |     N/A   | N/A  |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`www/`     | -                           | -                     | r    |     N/A     |     N/A   | N/A  |   Yes   |
| &nbsp;&nbsp;&nbsp;`Documents/`                 | documentsDirectory          | documents             | r/w  |     Yes     |     No    | Yes  |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`NoCloud/` | -                           | documents-nosync      | r/w  |     Yes     |     No    | No   |   Yes   |
| &nbsp;&nbsp;&nbsp;`Library`                    | -                           | library               | r/w  |     Yes     |     No    | Yes? |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`NoCloud/` | dataDirectory               | library-nosync        | r/w  |     Yes     |     No    | No   |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Cloud/`   | syncedDataDirectory         | -                     | r/w  |     Yes     |     No    | Yes  |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Caches/`  | cacheDirectory              | cache                 | r/w  |     Yes*    |  Yes\*\*\*| No   |   Yes   |
| &nbsp;&nbsp;&nbsp;`tmp/`                       | tempDirectory               | -                     | r/w  |     No\*\*  |  Yes\*\*\*| No   |   Yes   |


  \* Files persist across app restarts and upgrades, but this directory can
     be cleared whenever the OS desires. Your app should be able to recreate any
     content that might be deleted.

\*\* Files may persist across app restarts, but do not rely on this behavior. Files
     are not guaranteed to persist across updates. Your app should remove files from
     this directory when it is applicable, as the OS does not guarantee when (or even
     if) these files are removed.

\*\*\* The OS may clear the contents of this directory whenever it feels it is
     necessary, but do not rely on this. You should clear this directory as
     appropriate for your application.

### Android File System Layout

| Device Path                                     | `cordova.file.*`            | `AndroidExtraFileSystems` | r/w? | persistent? | OS clears | private |
|:------------------------------------------------|:----------------------------|:--------------------------|:----:|:-----------:|:---------:|:-------:|
| `file:///android_asset/`                        | applicationDirectory        | assets                    | r    |     N/A     |     N/A   |   Yes   |
| `/data/data/<app-id>/`                          | applicationStorageDirectory | -                         | r/w  |     N/A     |     N/A   |   Yes   |
| &nbsp;&nbsp;&nbsp;`cache`                       | cacheDirectory              | cache                     | r/w  |     Yes     |     Yes\* |   Yes   |
| &nbsp;&nbsp;&nbsp;`files`                       | dataDirectory               | files                     | r/w  |     Yes     |     No    |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Documents` |                             | documents                 | r/w  |     Yes     |     No    |   Yes   |
| `<sdcard>/`                                     | externalRootDirectory       | sdcard                    | r/w\*\*\*  |     Yes     |     No    |   No    |
| &nbsp;&nbsp;&nbsp;`Android/data/<app-id>/`      | externalApplicationStorageDirectory | -                 | r/w  |     Yes     |     No    |   No    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`cache`     | externalCacheDirectory       | cache-external            | r/w  |     Yes     |     No\*\*|   No    |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`files`     | externalDataDirectory       | files-external            | r/w  |     Yes     |     No    |   No    |

\* The OS may periodically clear this directory, but do not rely on this behavior. Clear
   the contents of this directory as appropriate for your application. Should a user
   purge the cache manually, the contents of this directory are removed.

\*\* The OS does not clear this directory automatically; you are responsible for managing
     the contents yourself. Should the user purge the cache manually, the contents of the
     directory are removed.

\*\*\* As of API 30, these directories are no longer writable.

**Note**: If external storage can't be mounted, the `cordova.file.external*`
properties are `null`.

### OS X File System Layout

| Device Path                                      | `cordova.file.*`            | `iosExtraFileSystems` | r/w? |  OS clears | private |
|:-------------------------------------------------|:----------------------------|:----------------------|:----:|:---------:|:-------:|
| `/Applications/<appname>.app/`                   | -                           | bundle                | r    |     N/A   |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;`Content/Resources/`     | applicationDirectory        | -                     | r    |     N/A   |   Yes   |
| `~/Library/Application Support/<bundle-id>/`     | applicationStorageDirectory | -                     | r/w  |     No    |   Yes   |
| &nbsp;&nbsp;&nbsp;&nbsp;`files/`                 | dataDirectory               | -                     | r/w  |     No    |   Yes   |
| `~/Documents/`                                   | documentsDirectory          | documents             | r/w  |     No    |    No   |
| `~/Library/Caches/<bundle-id>/`                  | cacheDirectory              | cache                 | r/w  |     No    |   Yes   |
| `/tmp/`                                          | tempDirectory               | -                     | r/w  |    Yes\*  |   Yes   |
| `/`                                              | rootDirectory               | root                  | r/w  |    No\*\* |    No   |

**Note**: This is the layout for non sandboxed applications. I you enable sandboxing, the `applicationStorageDirectory` will be below ` ~/Library/Containers/<bundle-id>/Data/Library/Application Support`.

\* Files persist across app restarts and upgrades, but this directory can
     be cleared whenever the OS desires. Your app should be able to recreate any
     content that might be deleted. You should clear this directory as
     appropriate for your application.

\*\* Allows access to the entire file system. This is only available for non sandboxed apps.

### Windows File System Layout

| Device Path                                           | `cordova.file.*`            | r/w? | persistent? | OS clears | private |
|:------------------------------------------------------|:----------------------------|:----:|:-----------:|:---------:|:-------:|
| `ms-appdata:///`                                      | applicationDirectory        | r    |     N/A     |     N/A   |   Yes   |
| &nbsp;&nbsp;&nbsp;`local/`                            | dataDirectory               | r/w  |     Yes     |     No    |   Yes   |
| &nbsp;&nbsp;&nbsp;`temp/`                             | cacheDirectory              | r/w  |     No      |     Yes\* |   Yes   |
| &nbsp;&nbsp;&nbsp;`temp/`                             | tempDirectory               | r/w  |     No      |     Yes\* |   Yes   |
| &nbsp;&nbsp;&nbsp;`roaming/`                          | syncedDataDirectory         | r/w  |     Yes     |     No    |   Yes   |

\* The OS may periodically clear this directory


## Android Quirks

### Android Persistent storage location

There are multiple valid locations to store persistent files on an Android
device. See [this page](http://developer.android.com/guide/topics/data/data-storage.html)
for an extensive discussion of the various possibilities.

Previous versions of the plugin would choose the location of the temporary and
persistent files on startup, based on whether the device claimed that the SD
Card (or equivalent storage partition) was mounted. If the SD Card was mounted,
or if a large internal storage partition was available (such as on Nexus
devices,) then the persistent files would be stored in the root of that space.
This meant that all Cordova apps could see all of the files available on the
card.

If the SD card was not available, then previous versions would store data under
`/data/data/<packageId>`, which isolates apps from each other, but may still
cause data to be shared between users.

It is now possible to choose whether to store files in the internal file
storage location, or using the previous logic, with a preference in your
application's `config.xml` file. To do this, add one of these two lines to
`config.xml`:

    <preference name="AndroidPersistentFileLocation" value="Internal" />

    <preference name="AndroidPersistentFileLocation" value="Compatibility" />

Without this line, the File plugin will use `Internal` as the default. If
a preference tag is present, and is not one of these values, the application
will not start.

If your application has previously been shipped to users, using an older (pre-
3.0.0) version of this plugin, and has stored files in the persistent filesystem,
then you should set the preference to `Compatibility` if your config.xml does not specify a location for the persistent filesystem. Switching the location to
"Internal" would mean that existing users who upgrade their application may be
unable to access their previously-stored files, depending on their device.

If your application is new, or has never previously stored files in the
persistent filesystem, then the `Internal` setting is generally recommended.

### Slow recursive operations for /android_asset

Listing asset directories is really slow on Android. You can speed it up though, by
adding `src/android/build-extras.gradle` to the root of your android project (also
requires cordova-android@4.0.0 or greater).

### Permisson to write to external storage when it's not mounted on Marshmallow

Marshmallow requires the apps to ask for permissions when reading/writing to external locations. By
[default](http://developer.android.com/guide/topics/data/data-storage.html#filesExternal), your app has permission to write to
`cordova.file.applicationStorageDirectory` and `cordova.file.externalApplicationStorageDirectory`, and the plugin doesn't request permission
for these two directories unless external storage is not mounted. However due to a limitation, when external storage is not mounted, it would ask for
permission to write to `cordova.file.externalApplicationStorageDirectory`.

## iOS Quirks

- `cordova.file.applicationStorageDirectory` is read-only; attempting to store
  files within the root directory will fail. Use one of the other `cordova.file.*`
  properties defined for iOS (only `applicationDirectory` and `applicationStorageDirectory` are
  read-only).
- `FileReader.readAsText(blob, encoding)`
  - The `encoding` parameter is not supported, and UTF-8 encoding is always in effect.

### iOS Persistent storage location

There are two valid locations to store persistent files on an iOS device: the
Documents directory and the Library directory. Previous versions of the plugin
only ever stored persistent files in the Documents directory. This had the
side-effect of making all of an application's files visible in iTunes, which
was often unintended, especially for applications which handle lots of small
files, rather than producing complete documents for export, which is the
intended purpose of the directory.

It is now possible to choose whether to store files in the documents or library
directory, with a preference in your application's `config.xml` file. To do this,
add one of these two lines to `config.xml`:

    <preference name="iosPersistentFileLocation" value="Library" />

    <preference name="iosPersistentFileLocation" value="Compatibility" />

Without this line, the File plugin will use `Compatibility` as the default. If
a preference tag is present, and is not one of these values, the application
will not start.

If your application has previously been shipped to users, using an older (pre-
1.0) version of this plugin, and has stored files in the persistent filesystem,
then you should set the preference to `Compatibility`. Switching the location to
`Library` would mean that existing users who upgrade their application would be
unable to access their previously-stored files.

If your application is new, or has never previously stored files in the
persistent filesystem, then the `Library` setting is generally recommended.

## Browser Quirks

### Common quirks and remarks
- Each browser uses its own sandboxed filesystem. IE and Firefox use IndexedDB as a base.
All browsers use forward slash as directory separator in a path.
- Directory entries have to be created successively.
For example, the call `fs.root.getDirectory('dir1/dir2', {create:true}, successCallback, errorCallback)`
will fail if dir1 did not exist.
- The plugin requests user permission to use persistent storage at the application first start.
- Plugin supports `cdvfile://localhost` (local resources) only. I.e. external resources are not supported via `cdvfile`.
- The plugin does not follow ["File System API 8.3 Naming restrictions"](http://www.w3.org/TR/2011/WD-file-system-api-20110419/#naming-restrictions).
- Blob and File' `close` function is not supported.
- `FileSaver` and `BlobBuilder` are not supported by this plugin and don't have stubs.
- The plugin does not support `requestAllFileSystems`. This function is also missing in the specifications.
- Entries in directory will not be removed if you use `create: true` flag for existing directory.
- Files created via constructor are not supported. You should use entry.file method instead.
- Each browser uses its own form for blob URL references.
- `readAsDataURL` function is supported, but the mediatype in Chrome depends on entry name extension,
mediatype in IE is always empty (which is the same as `text-plain` according the specification),
the mediatype in Firefox is always `application/octet-stream`.
For example, if the content is `abcdefg` then Firefox returns `data:application/octet-stream;base64,YWJjZGVmZw==`,
IE returns `data:;base64,YWJjZGVmZw==`, Chrome returns `data:<mediatype depending on extension of entry name>;base64,YWJjZGVmZw==`.
- `toInternalURL` returns the path in the form `file:///persistent/path/to/entry` (Firefox, IE).
Chrome returns the path in the form `cdvfile://localhost/persistent/file`.

### Chrome quirks
- Chrome filesystem is not immediately ready after device ready event. As a workaround you can subscribe to `filePluginIsReady` event.
Example:
```javascript
window.addEventListener('filePluginIsReady', function(){ console.log('File plugin is ready');}, false);
```
You can use `window.isFilePluginReadyRaised` function to check whether event was already raised.
- window.requestFileSystem TEMPORARY and PERSISTENT filesystem quotas are not limited in Chrome.
- To increase persistent storage in Chrome you need to call `window.initPersistentFileSystem` method. Persistent storage quota is 5 MB by default.
- Chrome requires `--allow-file-access-from-files` run argument to support API via `file:///` protocol.
- `File` object will be not changed if you use flag `{create:true}` when getting an existing `Entry`.
- events `cancelable` property is set to true in Chrome. This is contrary to the [specification](http://dev.w3.org/2009/dap/file-system/file-writer.html).
- `toURL` function in Chrome returns `filesystem:`-prefixed path depending on application host.
For example, `filesystem:file:///persistent/somefile.txt`, `filesystem:http://localhost:8080/persistent/somefile.txt`.
- `toURL` function result does not contain trailing slash in case of directory entry.
Chrome resolves directories with slash-trailed urls correctly though.
- `resolveLocalFileSystemURL` method requires the inbound `url` to have `filesystem` prefix. For example, `url` parameter for `resolveLocalFileSystemURL`
should be in the form `filesystem:file:///persistent/somefile.txt` as opposed to the form `file:///persistent/somefile.txt` in Android.
- Deprecated `toNativeURL` function is not supported and does not have a stub.
- `setMetadata` function is not stated in the specifications and not supported.
- INVALID_MODIFICATION_ERR (code: 9) is thrown instead of SYNTAX_ERR(code: 8) on requesting of a non-existant filesystem.
- INVALID_MODIFICATION_ERR (code: 9) is thrown instead of PATH_EXISTS_ERR(code: 12) on trying to exclusively create a file or directory, which already exists.
- INVALID_MODIFICATION_ERR (code: 9) is thrown instead of  NO_MODIFICATION_ALLOWED_ERR(code: 6) on trying to call removeRecursively on the root file system.
- INVALID_MODIFICATION_ERR (code: 9) is thrown instead of NOT_FOUND_ERR(code: 1) on trying to moveTo directory that does not exist.

### IndexedDB-based impl quirks (Firefox and IE)
- `.` and `..` are not supported.
- IE does not support `file:///`-mode; only hosted mode is supported (http://localhost:xxxx).
- Firefox filesystem size is not limited but each 50MB extension will request a user permission.
IE10 allows up to 10mb of combined AppCache and IndexedDB used in implementation of filesystem without prompting,
once you hit that level you will be asked if you want to allow it to be increased up to a max of 250mb per site.
So `size` parameter for `requestFileSystem` function does not affect filesystem in Firefox and IE.
- `readAsBinaryString` function is not stated in the Specs and not supported in IE and does not have a stub.
- `file.type` is always null.
- You should not create entry using DirectoryEntry instance callback result which was deleted.
Otherwise, you will get a 'hanging entry'.
- Before you can read a file, which was just written you need to get a new instance of this file.
- `setMetadata` function, which is not stated in the Specs supports `modificationTime` field change only.
- `copyTo` and `moveTo` functions do not support directories.
- Directories metadata is not supported.
- Both Entry.remove and directoryEntry.removeRecursively don't fail when removing
non-empty directories - directories being removed are cleaned along with contents instead.
- `abort` and `truncate` functions are not supported.
- progress events are not fired. For example, this handler will be not executed:
```javascript
writer.onprogress = function() { /*commands*/ };
```

## Upgrading Notes

In v1.0.0 of this plugin, the `FileEntry` and `DirectoryEntry` structures have changed,
to be more in line with the published specification.

Previous (pre-1.0.0) versions of the plugin stored the device-absolute-file-location
in the `fullPath` property of `Entry` objects. These paths would typically look like

    /var/mobile/Applications/<application UUID>/Documents/path/to/file  (iOS)
    /storage/emulated/0/path/to/file                                    (Android)

These paths were also returned by the `toURL()` method of the `Entry` objects.

With v1.0.0, the `fullPath` attribute is the path to the file, _relative to the root of
the HTML filesystem_. So, the above paths would now both be represented by a `FileEntry`
object with a `fullPath` of

    /path/to/file

If your application works with device-absolute-paths, and you previously retrieved those
paths through the `fullPath` property of `Entry` objects, then you should update your code
to use `entry.toURL()` instead.

For backwards compatibility, the `resolveLocalFileSystemURL()` method will accept a
device-absolute-path, and will return an `Entry` object corresponding to it, as long as that
file exists within either the `TEMPORARY` or `PERSISTENT` filesystems.

This has particularly been an issue with the File-Transfer plugin, which previously used
device-absolute-paths (and can still accept them). It has been updated to work correctly
with FileSystem URLs, so replacing `entry.fullPath` with `entry.toURL()` should resolve any
issues getting that plugin to work with files on the device.

In v1.1.0 the return value of `toURL()` was changed (see [CB-6394](https://issues.apache.org/jira/browse/CB-6394))
to return an absolute 'file://' URL. wherever possible. To ensure a 'cdvfile:'-URL you can use `toInternalURL()` now.
This method will now return filesystem URLs of the form

    cdvfile://localhost/persistent/path/to/file

which can be used to identify the file uniquely.

In v7.0.0 the return value of `toURL()` for Android was updated to return the absolute `file://` URL when app content is served from the `file://` scheme.

If app content is served from the `http(s)://` scheme, a `cdvfile` formatted URL will be returned instead. The `cdvfile` formatted URL is created from the internal method `toInternalURL()`.

An example `toInternalURL()` return filesystem URL:

    https://localhost/persistent/path/to/file

[![toURL flow](https://sketchviz.com/@erisu/7b05499842275be93a0581e8e3576798/6dc71d8302cafd05b443d874a592d10fa415b8e3.sketchy.png)](//sketchviz.com/@erisu/7b05499842275be93a0581e8e3576798)

It is recommended to always use the `toURL()` to ensure that the correct URL is returned.

## cdvfile protocol

- Not Supported on Android

**Purpose**

`cdvfile://localhost/persistent|temporary|another-fs-root*/path/to/file` can be used for platform-independent file paths.
cdvfile paths are supported by core plugins - for example you can download an mp3 file to cdvfile-path via `cordova-plugin-file-transfer` and play it via `cordova-plugin-media`.

__*Note__: See [Where to Store Files](#where-to-store-files), [File System Layouts](#file-system-layouts) and [Configuring the Plugin](#configuring-the-plugin-optional) for more details about available fs roots.

To use `cdvfile` as a tag' `src` you can convert it to native path via `toURL()` method of the resolved fileEntry, which you can get via `resolveLocalFileSystemURL` - see examples below.

You can also use `cdvfile://` paths directly in the DOM, for example:
```HTML
<img src="cdvfile://localhost/persistent/img/logo.png" />
```

__Note__: This method requires following Content Security rules updates:
* Add `cdvfile:` scheme to `Content-Security-Policy` meta tag of the index page, e.g.:
  - `<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: `**cdvfile:**` https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">`
* Add `<access origin="cdvfile://*" />` to `config.xml`.

**Converting cdvfile:// to native path**

```javascript
resolveLocalFileSystemURL('cdvfile://localhost/temporary/path/to/file.mp4', function(entry) {
    var nativePath = entry.toURL();
    console.log('Native URI: ' + nativePath);
    document.getElementById('video').src = nativePath;
```

**Converting native path to cdvfile://**

```javascript
resolveLocalFileSystemURL(nativePath, function(entry) {
    console.log('cdvfile URI: ' + entry.toInternalURL());
```

**Using cdvfile in core plugins**

```javascript
fileTransfer.download(uri, 'cdvfile://localhost/temporary/path/to/file.mp3', function (entry) { ...
```
```javascript
var my_media = new Media('cdvfile://localhost/temporary/path/to/file.mp3', ...);
my_media.play();
```

#### cdvfile quirks
- Using `cdvfile://` paths in the DOM is not supported on Windows platform (a path can be converted to native instead).


## List of Error Codes and Meanings
When an error is thrown, one of the following codes will be used.

| Code | Constant                      |
|-----:|:------------------------------|
|    1 | `NOT_FOUND_ERR`               |
|    2 | `SECURITY_ERR`                |
|    3 | `ABORT_ERR`                   |
|    4 | `NOT_READABLE_ERR`            |
|    5 | `ENCODING_ERR`                |
|    6 | `NO_MODIFICATION_ALLOWED_ERR` |
|    7 | `INVALID_STATE_ERR`           |
|    8 | `SYNTAX_ERR`                  |
|    9 | `INVALID_MODIFICATION_ERR`    |
|   10 | `QUOTA_EXCEEDED_ERR`          |
|   11 | `TYPE_MISMATCH_ERR`           |
|   12 | `PATH_EXISTS_ERR`             |

## Configuring the Plugin (Optional)

The set of available filesystems can be configured per-platform. Both iOS and
Android recognize a <preference> tag in `config.xml` which names the
filesystems to be installed. By default, all file-system roots are enabled.

    <preference name="iosExtraFilesystems" value="library,library-nosync,documents,documents-nosync,cache,bundle,root" />
    <preference name="AndroidExtraFilesystems" value="files,files-external,documents,sdcard,cache,cache-external,assets,root" />

### Android

* `files`: The application's internal file storage directory
* `files-external`: The application's external file storage directory
* `sdcard`: The global external file storage directory (this is the root of the SD card, if one is installed). You must have the `android.permission.WRITE_EXTERNAL_STORAGE` permission to use this.
* `cache`: The application's internal cache directory
* `cache-external`: The application's external cache directory
* `assets`: The application's bundle (read-only)
* `root`: The entire device filesystem
* `applicationDirectory`: ReadOnly with restricted access. Copying files in this directory is possible, but reading it directly results in 'file not found'.
Android also supports a special filesystem named "documents", which represents a "/Documents/" subdirectory within the "files" filesystem.

### iOS

* `library`: The application's Library directory
* `documents`: The application's Documents directory
* `cache`: The application's Cache directory
* `bundle`: The application's bundle; the location of the app itself on disk (read-only)
* `root`: The entire device filesystem

By default, the library and documents directories can be synced to iCloud. You can also request two additional filesystems, `library-nosync` and `documents-nosync`, which represent a special non-synced directory within the `/Library` or `/Documents` filesystem.

## Sample: Create Files and Directories, Write, Read, and Append files <a name="sample"></a>

The File plugin allows you to do things like store files in a temporary or persistent storage location for your app (sandboxed storage) and to store files in other platform-dependent locations. The code snippets in this section demonstrate different tasks including:
* [Accessing the file system](#persistent)
* Using cross-platform Cordova file URLs to [store your files](#appendFile) (see _Where to Store Files_ for more info)
* Creating [files](#persistent) and [directories](#createDir)
* [Writing to files](#writeFile)
* [Reading files](#readFile)
* [Appending files](#appendFile)
* [Display an image file](#displayImage)

## Create a persistent file <a name="persistent"></a>

Before you use the File plugin APIs, you can get access to the file system using `requestFileSystem`. When you do this, you can request either persistent or temporary storage. Persistent storage will not be removed unless permission is granted by the user.

When you get file system access using `requestFileSystem`, access is granted for the sandboxed file system only (the sandbox limits access to the app itself), not for general access to any file system location on the device. (To access file system locations outside the sandboxed storage, use other methods such as window.resolveLocalFileSystemURL, which support platform-specific locations. For one example of this, see _Append a File_.)

Here is a request for persistent storage.

>*Note* When targeting WebView clients (instead of a browser) or native apps (Windows), you dont need to use `requestQuota` before using persistent storage.

```js
window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

    console.log('file system open: ' + fs.name);
    fs.root.getFile("newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry) {

        console.log("fileEntry is file?" + fileEntry.isFile.toString());
        // fileEntry.name == 'someFile.txt'
        // fileEntry.fullPath == '/someFile.txt'
        writeFile(fileEntry, null);

    }, onErrorCreateFile);

}, onErrorLoadFs);
```

The success callback receives FileSystem object (fs). Use `fs.root` to return a DirectoryEntry object, which you can use to create or get a file (by calling `getFile`). In this example, `fs.root` is a DirectoryEntry object that represents the persistent storage in the sandboxed file system.

The success callback for `getFile` receives a FileEntry object. You can use this to perform file write and file read operations.

## Create a temporary file

Here is an example of a request for temporary storage. Temporary storage may be deleted by the operating system if the device runs low on memory.

```js
window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

    console.log('file system open: ' + fs.name);
    createFile(fs.root, "newTempFile.txt", false);

}, onErrorLoadFs);
```
When you are using temporary storage, you can create or get the file by calling `getFile`. As in the persistent storage example, this will give you a FileEntry object that you can use for read or write operations.

```js
function createFile(dirEntry, fileName, isAppend) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {

        writeFile(fileEntry, null, isAppend);

    }, onErrorCreateFile);

}
```

## Write to a file <a name="writeFile"></a>

Once you have a FileEntry object, you can write to the file by calling `createWriter`, which returns a FileWriter object in the success callback. Call the `write` method of FileWriter to write to the file.

```js
function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}
```

## Read a file <a name="readFile"></a>

You also need a FileEntry object to read an existing file. Use the file property of FileEntry to get the file reference, and then create a new FileReader object. You can use methods like `readAsText` to start the read operation. When the read operation is complete, `this.result` stores the result of the read operation.

```js
function readFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            displayFileData(fileEntry.fullPath + ": " + this.result);
        };

        reader.readAsText(file);

    }, onErrorReadFile);
}
```

## Append a file using alternative methods <a name="appendFile"></a>

Of course, you will often want to append existing files instead of creating new ones. Here is an example of that. This example shows another way that you can access the file system using window.resolveLocalFileSystemURL. In this example, pass the cross-platform Cordova file URL, cordova.file.dataDirectory, to the function. The success callback receives a DirectoryEntry object, which you can use to do things like create a file.

```js
window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
    console.log('file system open: ' + dirEntry.name);
    var isAppend = true;
    createFile(dirEntry, "fileToAppend.txt", isAppend);
}, onErrorLoadFs);
```

In addition to this usage, you can use `resolveLocalFileSystemURL` to get access to some file system locations that are not part of the sandboxed storage system. See _Where to store Files_ for more information; many of these storage locations are platform-specific. You can also pass cross-platform file system locations to `resolveLocalFileSystemURL` using the _cdvfile protocol_.

For the append operation, there is nothing new in the `createFile` function that is called in the preceding code (see the preceding examples for the actual code). `createFile` calls `writeFile`. In `writeFile`, you check whether an append operation is requested.

Once you have a FileWriter object, call the `seek` method, and pass in the index value for the position where you want to write. In this example, you also test whether the file exists. After calling seek, then call the write method of FileWriter.

```js
function writeFile(fileEntry, dataObj, isAppend) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file read...");
            readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file read: " + e.toString());
        };

        // If we are appending data to file, go to the end of the file.
        if (isAppend) {
            try {
                fileWriter.seek(fileWriter.length);
            }
            catch (e) {
                console.log("file doesn't exist!");
            }
        }
        fileWriter.write(dataObj);
    });
}
```

## Store an existing binary file <a name="binaryFile"></a>

We already showed how to write to a file that you just created in the sandboxed file system. What if you need to get access to an existing file and convert that to something you can store on your device? In this example, you obtain a file using an xhr request, and then save it to the cache in the sandboxed file system.

Before you get the file, get a FileSystem reference using `requestFileSystem`. By passing window.TEMPORARY in the method call (same as before), the returned FileSystem object (fs) represents the cache in the sandboxed file system. Use `fs.root` to get the DirectoryEntry object that you need.

```js
window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

    console.log('file system open: ' + fs.name);
    getSampleFile(fs.root);

}, onErrorLoadFs);
```

For completeness, here is the xhr request to get a Blob image. There is nothing Cordova-specific in this code, except that you forward the DirectoryEntry reference that you already obtained as an argument to the saveFile function. You will save the blob image and display it later after reading the file (to validate the operation).

```js
function getSampleFile(dirEntry) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://cordova.apache.org/static/img/cordova_bot.png', true);
    xhr.responseType = 'blob';

    xhr.onload = function() {
        if (this.status == 200) {

            var blob = new Blob([this.response], { type: 'image/png' });
            saveFile(dirEntry, blob, "downloadedImage.png");
        }
    };
    xhr.send();
}
```
>*Note* For Cordova 5 security, the preceding code requires that you add the domain name, http://cordova.apache.org, to the Content-Security-Policy <meta> element in index.html.

After getting the file, copy the contents to a new file. The current DirectoryEntry object is already associated with the app cache.

```js
function saveFile(dirEntry, fileData, fileName) {

    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {

        writeFile(fileEntry, fileData);

    }, onErrorCreateFile);
}
```

In writeFile, you pass in the Blob object as the dataObj and you will save that in the new file.

```js
function writeFile(fileEntry, dataObj, isAppend) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            if (dataObj.type == "image/png") {
                readBinaryFile(fileEntry);
            }
            else {
                readFile(fileEntry);
            }
        };

        fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
        };

        fileWriter.write(dataObj);
    });
}
```

After writing to the file, read it and display it. You saved the image as binary data, so you can read it using FileReader.readAsArrayBuffer.

```js
function readBinaryFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {

            console.log("Successful file write: " + this.result);
            displayFileData(fileEntry.fullPath + ": " + this.result);

            var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
            displayImage(blob);
        };

        reader.readAsArrayBuffer(file);

    }, onErrorReadFile);
}
```

After reading the data, you can display the image using code like this. Use window.URL.createObjectURL to get a DOM string for the Blob image.

```js
function displayImage(blob) {

    // Displays image if result is a valid DOM string for an image.
    var elem = document.getElementById('imageFile');
    // Note: Use window.URL.revokeObjectURL when finished with image.
    elem.src = window.URL.createObjectURL(blob);
}
```

## Display an image file <a name="displayImage"></a>

To display an image using a FileEntry, you can call the `toURL` method.

```js
function displayImageByFileURL(fileEntry) {
    var elem = document.getElementById('imageFile');
    elem.src = fileEntry.toURL();
}
```

If you are using some platform-specific URIs instead of a FileEntry and you want to display an image, you may need to include the main part of the URI in the Content-Security-Policy <meta> element in index.html. For example, on Windows 10, you can include `ms-appdata:` in your <meta> element. Here is an example.

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: ms-appdata: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
```

## Create Directories <a name="createDir"></a>

In the code here, you create directories in the root of the app storage location. You could use this code with any writable storage location (that is, any DirectoryEntry). Here, you write to the application cache (assuming that you used window.TEMPORARY to get your FileSystem object) by passing fs.root into this function.

This code creates the /NewDirInRoot/images folder in the application cache. For platform-specific values, look at _File System Layouts_.

```js
function createDirectory(rootDirEntry) {
    rootDirEntry.getDirectory('NewDirInRoot', { create: true }, function (dirEntry) {
        dirEntry.getDirectory('images', { create: true }, function (subDirEntry) {

            createFile(subDirEntry, "fileInNewSubDir.txt");

        }, onErrorGetDir);
    }, onErrorGetDir);
}
```

When creating subfolders, you need to create each folder separately as shown in the preceding code.
