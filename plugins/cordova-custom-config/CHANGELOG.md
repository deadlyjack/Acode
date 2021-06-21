# CHANGELOG

**v5.1.0**
* Replace requireCordovaModule() with require() due to breaking changes in cordova@9.0.0. Resolves [#152](https://github.com/dpa99c/cordova-custom-config/issues/152).

**v5.0.3**
* Switch to using latest `plist` release. Resolves [#151](https://github.com/dpa99c/cordova-custom-config/issues/151).
* Update version of `lodash` dependency.
* Add support for #include statements in `xcconfig` files on iOS.

**v5.0.2**
* Improve handling of errors caused by missing dependencies or during script running.

**v5.0.1**
* Update `plist` and `xcode` dependencies to resolve issues caused by PR [#119](https://github.com/dpa99c/cordova-custom-config/issues/119). Resolves [#136](https://github.com/dpa99c/cordova-custom-config/issues/136).

**v5.0.0** Major update for `cordova-android@7`
* Support the new Android project structure introduced with the [release of cordova@7.0.0](http://cordova.apache.org/announcements/2017/12/04/cordova-android-7.0.0.html) . Resolves [#135](https://github.com/dpa99c/cordova-custom-config/issues/135).
* Expect custom config elements to be prefixed with `<custom-` to avoid build issues now `cordova-android@7` attempts to parse `<config-file>` blocks, but continue to support unprefixed elements by default for `cordova-android@6`.

**v4.0.2**
* Fix iOS bug where a `<config-file>` block with `mode=delete` causes an error if the plist doesn't contain the specified parent key.

**v4.0.0**
* Remove manual dependency resolution logic and require cordova-fetch for installation.

**v3.3.0**
* Enable deleting of existing iOS plist entries.

**v3.2.0**
* Add support for iOS asset catalogs as image resources. 

**v3.1.4**
* Add missing before_prepare and before_compile plugin hooks. Fixes [#110](https://github.com/dpa99c/cordova-custom-config/issues/110).

**v3.1.3**
* Wait for async processing of project.pbxproj to finish before resolving exported promise. Addresses [#108](https://github.com/dpa99c/cordova-custom-config/issues/108).
* Initial documentation regarding precompile headers
* Support for precompile headers (*-Prefix.pch) on iOS

**v3.1.2**
* Fix relative paths in xcode-func preferences

**v3.1.1**
* Remove engines restriction of npm version to see if it affects [#94](https://github.com/dpa99c/cordova-custom-config/issues/94).

**v3.1.0**
* Add cordova-fetch as preferred install method
* Add support for mode attribute on config-file blocks
* Dump out datastructures if --dump CLI arg is specified
* Update Phonegap Build issue for no hooks support
* Fix merging of plist array values.
* Prevent insertion of multiple duplicate elements from config-file blocks if no top-level attributes.
* When removing preferences, if element is not found under parent element, search from root as well.
* Update jshint rules to allow ES6 syntax
* Fix missing ; for jshint
* Specify npm@>=3.0.0 via engines in package.json. Resolves [#76](https://github.com/dpa99c/cordova-custom-config/issues/76) while hopefully not breaking [#79](https://github.com/dpa99c/cordova-custom-config/issues/79) and [#80](https://github.com/dpa99c/cordova-custom-config/issues/80) again.
* Merge plist arrays instead of overriding them
* If loading dependencies fails, try to resolve them again. Addresses [#89](https://github.com/dpa99c/cordova-custom-config/issues/89).
* Prevent problem with NSMainNibFile. Change as suggested in [#90](https://github.com/dpa99c/cordova-custom-config/issues/90).
* Declare globals in example project build trigger script to prevent issues with typescript compilers. Fixes [#88](https://github.com/dpa99c/cordova-custom-config/issues/88).
* Add documentation for xcodefunc blocks
* ios preference to apply node-xcode functions to modify project.pbxproj
* Added logic for updating Entitlements-Release.plist and Entitlements-Debug.plist files that were added with cordova-ios 4.3
* Note the addition for support of <edit-config> in config.xml in cordova@6.4.0. Resolves [#81](https://github.com/dpa99c/cordova-custom-config/issues/81).

**v3.0.14**
* Remove npm version check due to quoting problems between Windows vs OSX. Fixes [#80](https://github.com/dpa99c/cordova-custom-config/issues/80) (and [#79](https://github.com/dpa99c/cordova-custom-config/issues/79)).

**v3.0.13**
* Use double quotes (instead of single quotes) around version in preinstall version check to avoid problems in Windows env. Fixes [#79](https://github.com/dpa99c/cordova-custom-config/issues/79).

**v3.0.12**
* Add preinstall hook to check npm version is >= 3 and fail installation if not.
* Clarify npm requirements
* Add Travis config and hook script to trigger build of example project on commit
* Add build, version and downloads badges
* Add note regarding npm version requirements. Fixes [#76](https://github.com/dpa99c/cordova-custom-config/issues/76).

**v3.0.11**
* Locally implement _.keyBy to avoid issues where local version of lodash < 2.0.0

**v3.0.10**
* Add backward compatibility for lodash < 4.0.0

**v3.0.9**
* Eliminate race condition when resolving npm dependencies

**v3.0.8**
* Add jshint validation

**v3.0.7**
* Only attempt to remove an element from AndroidManifest.xml if it actually exists
* Dump error details when exception is raised applying custom config

**v3.0.6**
* Revise the plugin installation process to make it more robust

**v3.0.5**
* Add relative copy

**v3.0.1 to v3.0.4**
* Various bug fixes

**v3.0.0**
* Change dependency resolution to rely on cordova-fetch (cordova@6.2.0+).
* Require latest xcode@0.8.9 to resolve security issue. Fixes [#74](https://github.com/dpa99c/cordova-custom-config/issues/74)
* Fix jshint errors
* When <preference delete="true">, ensure the child is deleted rather than the parent node. Fixes [#65](https://github.com/dpa99c/cordova-custom-config/issues/65).
* Add attribute for config-file
* Multiple meta-data inside application
* android: create parent path if not exist

**v2.0.3**
* Remove useless platform parameter.
* Rationalise and fix the handling of multiple sibling homogeneous elements in Android manifest. Fixes [#64](https://github.com/dpa99c/cordova-custom-config/issues/64).
* Add debug tools to logger
* Rename logger.debug() to logger.verbose()

**v2.0.2**
* Fix bug introduced by pull request [#59](https://github.com/dpa99c/cordova-custom-config/issues/59). Resolves [#61](https://github.com/dpa99c/cordova-custom-config/issues/61).

**v2.0.1**
* Add shelljs as dependency
* adding ability to remove nodes from AndroidManifest.xml
* Only apply config to hook context platforms
* fix: instead of going through all the prepared platforms use hook context to find out which config update to apply
* Update docs to relect non-support of Phonegap Build / Intel XDK
* Update Android examples to use actual existing default theme
* Add a preference to allow control of which hook the plugin uses to apply custom config
* Added ability for multiple intent-filter blocks 
    * Previously intent-filter blocks where duplicated in the AndroidManifest when added to a config.xml config-block. Now checks for intent-filter by label. 
    * Fixed indexOf syntax error in updateAndroidManifest()
* Patched weird behaviour: "shell" is undefined if android platform has been removed and added with a new package id but ios stayed the same. Patched by checking if shell is defined and using logger.error if it isn't

**v2.0.0**
* Remove deprecated pre-defined preferences for Android.
* Make auto-restore OFF by default - resolves [#42](https://github.com/dpa99c/cordova-custom-config/issues/42).
* Merge pull request [#41](https://github.com/dpa99c/cordova-custom-config/issues/41) from hilkeheremans/master. Fix for iOS issue with some types of keys.

**v1.2.6**
* Fix typo causing item value to always be quoted in XC build config blocks. Fixes [#40](https://github.com/dpa99c/cordova-custom-config/issues/40)

**v1.2.5**
* During backup/restore and apply custom config, only attempt to resolve dependencies if an error occurs while trying to load them.
* Add MIT license.
* Support for all root-level tags that can appear multiple times. Fixes [#34](https://github.com/dpa99c/cordova-custom-config/issues/34).

**v1.2.4**
* Remove lodash compatibility hack now version numbers is package.json dependencies are respected.
* Fix non-resolution of promise if config is set to skip auto-backup/restore. Fixes [#32](https://github.com/dpa99c/cordova-custom-config/issues/32).

**v1.2.3**
* fix removal of project-level package.json during prepare operation due to concurrency in dependency resolution script by ensuring synchronisation of restoreBackups.js and applyCustomConfig.js using deferred promises

**v1.2.2**
* properly fix dependency resolution using promises to defer async progression of hook scripts. Fixes [#23](https://github.com/dpa99c/cordova-custom-config/issues/23) and fixes [#29](https://github.com/dpa99c/cordova-custom-config/issues/29).

**v1.2.1**
* Rework dependency resolution to eliminate race conditions.

**v1.2.0**
* Enable preference quote attribute to control quoting in project.pbxproj
* Don't quote keys and values in .xcconfig files
* Only replace settings in xcconfig files that are of the same build type as specified in config.
    * Add special case handling of Debug CODE_SIGNING_IDENTITY for which Cordova defaults reside in build.xcconfig (not build-debug.xcconfig).
    * Enable forced addition of settings (if they don't already exist) to relevant xcconfig file using xcconfigEnforce attribute.

**v1.1.11**
* Run dependency resolution script on 'after_platform_add` hook to avoid issues if plugin is added to a project with no platforms then platforms are subsequently added.

**v1.1.10**
* Document necessity of android namespace attribute in config.xml. Fixes [#24](https://github.com/dpa99c/cordova-custom-config/issues/24).
* wp8 config-file append mode
* Added quote attribute for iOS prefs
* Update to fix indexBy() which is renamed keyBy() in lodash@4.0.0. Fixes [#20](https://github.com/dpa99c/cordova-custom-config/issues/20) and [#21](https://github.com/dpa99c/cordova-custom-config/issues/21)

**v1.1.8**
* Update with details of XPath preferences
* Add support for xpath-style Android manifest preferences
* Add warning message regarding deprecation of pre-defined preferences
* Change verbosity of log messages when successfully resolved dependencies to debug so it only show up with --verbose
* Add colours to log messages

**v1.1.7**
* Overwrite build settings if they are present in Cordova's xcconfig files. Fixes [#6](https://github.com/dpa99c/cordova-custom-config/issues/6).
* Don't try to resolve dependencies when plugin is being removed
* Rework dependency resolution to eliminate race conditions. Fixes [#15](https://github.com/dpa99c/cordova-custom-config/issues/15). Fixes [#11](https://github.com/dpa99c/cordova-custom-config/issues/11).
    * Also rework and homogenise hook scripts.

**v1.1.6**
* If error occurs while processing a platform, log the error and proceed with other platforms/cordova operations by default unless cordova-custom-config-stoponerror preference is set. Fixes [#12](https://github.com/dpa99c/cordova-custom-config/issues/12).
* Remove read-package-json from list of modules to install. Fixes [#10](https://github.com/dpa99c/cordova-custom-config/issues/10).

**v1.1.5**
* Document preference to prevent auto-restoring of backups
* Add support for preference to disable auto-restore of config file backups
* escape values from preferences (closes [#4](https://github.com/dpa99c/cordova-custom-config/issues/4))

**v1.1.4**
* Add missing license field. Fixes [#3](https://github.com/dpa99c/cordova-custom-config/issues/3).
* Replace 'after_plugin_add' and 'before_plugin_rm' hooks with 'after_plugin_install' and 'before_plugin_uninstall'. Fixes [#2](https://github.com/dpa99c/cordova-custom-config/issues/2).

**v1.1.2**
* Replace the hard-coded old manifest name in windowSoftInputMode parent. Fixes [#1](https://github.com/dpa99c/cordova-custom-config/issues/1)

**v1.1.1**
* Add support for new Cordova activity name on Android
