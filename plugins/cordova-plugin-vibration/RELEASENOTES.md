<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
# Release Notes

### 3.1.1 (May 16, 2019)
* Update CI configuration and README ([#80](https://github.com/apache/cordova-plugin-vibration/pull/80), [#77](https://github.com/apache/cordova-plugin-vibration/pull/77), [#69](https://github.com/apache/cordova-plugin-vibration/pull/69), [#68](https://github.com/apache/cordova-plugin-vibration/pull/68))
* fix(typescript): update types ([#75](https://github.com/apache/cordova-plugin-vibration/pull/75), [#78](https://github.com/apache/cordova-plugin-vibration/pull/78))
* Add or update GitHub pull request and issue template

### 3.1.0 (Apr 12, 2018)
* [CB-14022](https://issues.apache.org/jira/browse/CB-14022) documented **Android** quirk with vibration
* [CB-13892](https://issues.apache.org/jira/browse/CB-13892) (all) Remove `navigator.notification`

### 3.0.1 (Dec 27, 2017)
* [CB-13711](https://issues.apache.org/jira/browse/CB-13711) Fix to allow 3.0.0 version install (#63)

### 3.0.0 (Dec 15, 2017)
* [CB-13666](https://issues.apache.org/jira/browse/CB-13666) : Removed deprecated platforms
* Removed deprecated components and bumped version
* [CB-13045](https://issues.apache.org/jira/browse/CB-13045) Removed **Android** implementation and Updated `README`

### 2.1.6 (Nov 06, 2017)
* [CB-12895](https://issues.apache.org/jira/browse/CB-12895) added `eslint` and removed `jshint`
* [CB-12847](https://issues.apache.org/jira/browse/CB-12847) added `bugs` entry to `package.json`.

### 2.1.5 (Apr 27, 2017)
* [CB-12622](https://issues.apache.org/jira/browse/CB-12622) Added **Android 6.0** build badge to `README`
* [CB-12685](https://issues.apache.org/jira/browse/CB-12685) added `package.json` to tests folder

### 2.1.4 (Feb 28, 2017)
* fix `vibrateWithPattern`, function doesn't update the pattern variable reference
* [CB-12369](https://issues.apache.org/jira/browse/CB-12369) Add plugin typings from `DefinitelyTyped` 
* [CB-12363](https://issues.apache.org/jira/browse/CB-12363) Added build badges for **iOS 9.3** and **iOS 10.0** 
* [CB-12230](https://issues.apache.org/jira/browse/CB-12230) Removed **Windows 8.1** build badges

### 2.1.3 (Dec 07, 2016)
* [CB-12224](https://issues.apache.org/jira/browse/CB-12224) Updated version and RELEASENOTES.md for release 2.1.3
* [CB-11917](https://issues.apache.org/jira/browse/CB-11917) - Remove pull request template checklist item: "iCLA has been submitted…"
* [CB-11832](https://issues.apache.org/jira/browse/CB-11832) Incremented plugin version.

### 2.1.2 (Sep 08, 2016)
* [CB-11795](https://issues.apache.org/jira/browse/CB-11795) Add 'protective' entry to cordovaDependencies
* add JIRA issue tracker link
* Add badges for paramedic builds on Jenkins
* Add pull request template.
* [CB-10996](https://issues.apache.org/jira/browse/CB-10996) Adding front matter to README.md

### 2.1.1 (Apr 15, 2016)
* [CB-10636](https://issues.apache.org/jira/browse/CB-10636) Add `JSHint` for plugins

### 2.1.0 (Jan 15, 2016)
* [CB-9365](https://issues.apache.org/jira/browse/CB-9365) Add support for 'vibrateWithPattern' to **Windows Phone 8.1 / Windows 10**

### 2.0.0 (Nov 18, 2015)
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated `RELEASENOTES` to be newest to oldest
* Fixing contribute link.
* Fixed **browser** platform to pass tests and combined tests
* Removed call to add `proxy` and renamed **browser** file
* [CB-7966](https://issues.apache.org/jira/browse/CB-7966) Add cordova-plugin-vibration support for **browser** platform
* [CB-9166](https://issues.apache.org/jira/browse/CB-9166): Changed `plugin.xml` framework reference condition to be valid XML.

### 1.2.0 (Jun 17, 2015)
* Adding .ratignore file.
* [CB-9128](https://issues.apache.org/jira/browse/CB-9128) cordova-plugin-vibration documentation translation: cordova-plugin-vibration
* fix npm md issue
* used min/max statics in vibrate with pattern. Use callbackId in callbacks, catch json format exceptions
* static-ized MIN_DURATION and MAX_DURATION
* [CB-7216](https://issues.apache.org/jira/browse/CB-7216) changed cancelWasCalled boolean
* [CB-7218](https://issues.apache.org/jira/browse/CB-7218) truncate vibration to 5 secs for WP8
* [CB-6916](https://issues.apache.org/jira/browse/CB-6916) added vibrateWithPattern for wp8
* [CB-6914](https://issues.apache.org/jira/browse/CB-6914) added cancelVibration for wp8
* android: respect silent audio setting

### 1.1.0 (May 06, 2015)
* [CB-8930](https://issues.apache.org/jira/browse/CB-8930): Vibration on **Windows** fails without a helpful error message when vibration functionality is missing from the platform.  This detects such a case and instead fails gracefully that the feature isn't available.  Also supports the **Windows 10** vibration mechanism.

### 1.0.0 (Apr 15, 2015)
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) gave plugin major version bump
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) changed plugin-id to pacakge-name
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) properly updated translated docs to use new id
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) updated translated docs to use new id
* [CB-7970](https://issues.apache.org/jira/browse/CB-7970) Reference proxy project instead of compiled winmd
* [CB-7970](https://issues.apache.org/jira/browse/CB-7970) Add cordova-plugin-vibration support for Windows Phone 8.1
* Use TRAVIS_BUILD_DIR, install paramedic by npm
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) Updated Readme
* [CB-8576](https://issues.apache.org/jira/browse/CB-8576) Integrate TravisCI
* [CB-8438](https://issues.apache.org/jira/browse/CB-8438) cordova-plugin-vibration documentation translation: cordova-plugin-vibration
* [CB-8538](https://issues.apache.org/jira/browse/CB-8538) Added package.json file

### 0.3.13 (Feb 04, 2015)
* [CB-8243](https://issues.apache.org/jira/browse/CB-8243) cordova-plugin-vibration documentation translation: cordova-plugin-vibration

### 0.3.12 (Dec 02, 2014)
* [CB-8018](https://issues.apache.org/jira/browse/CB-8018) Add `vibrate(pattern)` fallback on vibrate for **Windows Phone 8**
* [CB-7977](https://issues.apache.org/jira/browse/CB-7977) Mention `deviceready` in plugin docs
* [CB-7700](https://issues.apache.org/jira/browse/CB-7700) cordova-plugin-vibration documentation translation: cordova-plugin-vibration
* [CB-7571](https://issues.apache.org/jira/browse/CB-7571) Bump version of nested plugin to match parent plugin

### 0.3.11 (Sep 17, 2014)
* [CB-7249](https://issues.apache.org/jira/browse/CB-7249) cordova-plugin-vibration documentation translation
* [CB-6724](https://issues.apache.org/jira/browse/CB-6724) documented Windows support for vibrate with pattern and cancel vibrate in manual test doc and moved tests to tests dir
* add longer pattern sequence for testing, change expected result for old vibrate with pattern test
* added more test cases, changed vibrate with pattern durations, changed where vibrateOn is set to true
* clear settimeout when user cancels vibration
* add setTimeout function to update vibrateOn var if user doesn't cancel vibrate, add note about iOS
* on/off button for cancel tests, add results box and msgs
* added tests for old vibrateWithPattern and cancelVibration calls
* added 'Android only' to buttons for specific tests, changed where console.log is executed for user to see earlier
* added tests to ensure compliance with w3c spec
* [CB-6963](https://issues.apache.org/jira/browse/CB-6963) ported vibration automated & manual tests
* [CB-6966](https://issues.apache.org/jira/browse/CB-6966) renamed folder to tests + added nested plugin.xml
* [CB-6966](https://issues.apache.org/jira/browse/CB-6966) Ported Vibration automated & manual tests
* removed duplicate messaging
* [CB-5459](https://issues.apache.org/jira/browse/CB-5459) slight change to the vibration documentation for pattern due to merge issue
* changes to how 0 is getting added to array in order to align with w3c spec
* changes to vibration.java to align with w3c, changes to vibration.js for backwards compatibility
* changes made to align with w3c spec
* Updated doc with Windows support for vibrate with pattern
* Added note to doc about w3c alignment and min time for Windows
* update doc with another way to cancel vibration
* update doc to show vibrate([num]) is a standard vibrate
* vibrate([num]) is treated as a vibrate not vibrate with pattern
* added new example to documentation
* updated doc for w3c alignment
* changes to how 0 is getting added to array in order to align with w3c spec
* changes to vibration.java to align with w3c, changes to vibration.js for backwards compatibility
* changes made to align with w3c spec

### 0.3.10 (Aug 06, 2014)
* ubuntu: Implemented vibrateWithPattern/cancelVibration
* **FFOS** update VibrationProxy.js
* [CB-6127](https://issues.apache.org/jira/browse/CB-6127) Updated translations for docs

### 0.3.9 (Jun 05, 2014)
* updated notice file
* Github close #11
* Extended vibrateWithPattern to allow for pattern repetition, implemented a complementary cancelVibration function and adapted documentation.
* Implemented vibrateWithPattern (for android) and adapted documentation.
* [CB-6811](https://issues.apache.org/jira/browse/CB-6811) Add license to CONTRIBUTING.md
* [CB-6491](https://issues.apache.org/jira/browse/CB-6491) add CONTRIBUTING.md

### 0.3.8 (Apr 17, 2014)
* [CB-6465](https://issues.apache.org/jira/browse/CB-6465): Add license headers to Tizen code
* [CB-6460](https://issues.apache.org/jira/browse/CB-6460): Update license headers
* Add NOTICE file

### 0.3.7 (Feb 05, 2014)
* Add support for Tizen.
* [CB-3206](https://issues.apache.org/jira/browse/CB-3206) - Supported platforms updated

### 0.3.6 (Jan 02, 2014)
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Add doc/index.md for Vibration plugin

### 0.3.5 (Dec 4, 2013)
* add ubuntu platform
* Added amazon-fireos platform. Change to include amazon-fireos as a platform if the user agent string contains 'cordova-amazon-fireos'
* [CB-4747](https://issues.apache.org/jira/browse/CB-4747) Fixed Blackberry background vibrate

### 0.3.4 (Oct 28, 2013)
* add repo + issue tag to plugin.xml for vibration plugin
* corrected plugin.xml to write properly to config.xml for ffos
* [CB-5010](https://issues.apache.org/jira/browse/CB-5010) Incremented plugin version on dev branch.

### 0.3.3 (Oct 9, 2013)
* add missing android namespace
* [CB-4915](https://issues.apache.org/jira/browse/CB-4915) Incremented plugin version on dev branch.

### 0.3.2 (Sept 25, 2013)
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) bumping&resetting version
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming org.apache.cordova.core.vibration to org.apache.cordova.vibration
* Rename CHANGELOG.md -> RELEASENOTES.md
* updated to work with ffos commandProxy
* fixed plugin.xml for vibration
* [CB-4593](https://issues.apache.org/jira/browse/CB-4593) [Blackberry10] Added vibration support for bb10
* updated plugin to work with ffos
* [CB-4752](https://issues.apache.org/jira/browse/CB-4752) Incremented plugin version on dev branch.

### 0.3.0 (Sept 5, 2013)
* Initial FirefoxOS support
* [CB-4661](https://issues.apache.org/jira/browse/CB-4661) VIBRATE permission for Android
