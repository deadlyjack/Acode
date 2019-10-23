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

### 3.1.0 (Jun 27, 2019)

-   chore: fix repo and issue urls and license in package.json and plugin.xml ([`8edfb9e`](https://github.com/apache/cordova-plugin-inappbrowser/commit/8edfb9e))
-   chore: unknown changes because of linebreak change in binary files ([`e44ad91`](https://github.com/apache/cordova-plugin-inappbrowser/commit/e44ad91))
-   build: add `.npmignore` to remove unneeded files from npm package ([`0ec4a11`](https://github.com/apache/cordova-plugin-inappbrowser/commit/0ec4a11))
-   build: add `.gitattributes` to force LF (instead of possible CRLF on Windows) ([`2751255`](https://github.com/apache/cordova-plugin-inappbrowser/commit/2751255))
-   ci(travis): Update Travis CI configuration for new paramedic ([#478](https://github.com/apache/cordova-plugin-inappbrowser/issues/478)) ([`c2bb6c1`](https://github.com/apache/cordova-plugin-inappbrowser/commit/c2bb6c1))
-   docs: remove outdated translations ([`cc5ee00`](https://github.com/apache/cordova-plugin-inappbrowser/commit/cc5ee00))
-   fix(android): Fix beforeload for Android &lt;= 7 ([#427](https://github.com/apache/cordova-plugin-inappbrowser/issues/427)) ([`94fec84`](https://github.com/apache/cordova-plugin-inappbrowser/commit/94fec84))
-   ci(travis) Fix failing CI tests ([#460](https://github.com/apache/cordova-plugin-inappbrowser/issues/460)) ([`a162bd9`](https://github.com/apache/cordova-plugin-inappbrowser/commit/a162bd9))
-   test: Fix test spec.5 to close inappbrowser after loadstop event ([#440](https://github.com/apache/cordova-plugin-inappbrowser/issues/440)) ([`5f1afbd`](https://github.com/apache/cordova-plugin-inappbrowser/commit/5f1afbd), [`af44235`](https://github.com/apache/cordova-plugin-inappbrowser/commit/af44235))
-   fix(android): Prevent malformed callbackId from reaching app cordova view ([#436](https://github.com/apache/cordova-plugin-inappbrowser/issues/436)) ([`6861084`](https://github.com/apache/cordova-plugin-inappbrowser/commit/6861084), [`c95dbcb`](https://github.com/apache/cordova-plugin-inappbrowser/commit/c95dbcb))
-   feat: [CB-13969](https://issues.apache.org/jira/browse/CB-13969): Allow close button and navigation buttons positions to be swapped ([#262](https://github.com/apache/cordova-plugin-inappbrowser/issues/262)) ([`d01bd25`](https://github.com/apache/cordova-plugin-inappbrowser/commit/d01bd25), [`f861655`](https://github.com/apache/cordova-plugin-inappbrowser/commit/f861655), [`9c7c2f3`](https://github.com/apache/cordova-plugin-inappbrowser/commit/9c7c2f3), [`3c0a42e`](https://github.com/apache/cordova-plugin-inappbrowser/commit/3c0a42e), [`5359f6c`](https://github.com/apache/cordova-plugin-inappbrowser/commit/5359f6c), [`df84dda`](https://github.com/apache/cordova-plugin-inappbrowser/commit/df84dda), [`2bcec40`](https://github.com/apache/cordova-plugin-inappbrowser/commit/2bcec40), [`fc0c560`](https://github.com/apache/cordova-plugin-inappbrowser/commit/fc0c560), [`5ead1e6`](https://github.com/apache/cordova-plugin-inappbrowser/commit/5ead1e6), [`c7931fa`](https://github.com/apache/cordova-plugin-inappbrowser/commit/c7931fa), [`e2adf1b`](https://github.com/apache/cordova-plugin-inappbrowser/commit/e2adf1b), [`4adf4c7`](https://github.com/apache/cordova-plugin-inappbrowser/commit/4adf4c7), [`cbe3a42`](https://github.com/apache/cordova-plugin-inappbrowser/commit/cbe3a42), [`74ccef1`](https://github.com/apache/cordova-plugin-inappbrowser/commit/74ccef1), [`ec6af56`](https://github.com/apache/cordova-plugin-inappbrowser/commit/ec6af56), [`b06ad8e`](https://github.com/apache/cordova-plugin-inappbrowser/commit/b06ad8e), [`313e0ae`](https://github.com/apache/cordova-plugin-inappbrowser/commit/313e0ae), [`05e37a1`](https://github.com/apache/cordova-plugin-inappbrowser/commit/05e37a1), [`0c6189e`](https://github.com/apache/cordova-plugin-inappbrowser/commit/0c6189e), [`d940b59`](https://github.com/apache/cordova-plugin-inappbrowser/commit/d940b59), [`f3d7f72`](https://github.com/apache/cordova-plugin-inappbrowser/commit/f3d7f72))
-   docs: Add headline to window.open documentation ([#406](https://github.com/apache/cordova-plugin-inappbrowser/issues/406)) ([`92243cd`](https://github.com/apache/cordova-plugin-inappbrowser/commit/92243cd))
-   fix(ios): Fix iframes in iOS/WKWebView which were broken by [#418](https://github.com/apache/cordova-plugin-inappbrowser/issues/418) ([#425](https://github.com/apache/cordova-plugin-inappbrowser/issues/425)) ([`388e3f6`](https://github.com/apache/cordova-plugin-inappbrowser/commit/388e3f6))
-   chore(github): Add or update GitHub pull request and issue template ([`ae329bc`](https://github.com/apache/cordova-plugin-inappbrowser/commit/ae329bc))
-   fix(ios): Handle non-default target attribute values (e.g. target=on links in WKWebView implementation on iOS ([#418](https://github.com/apache/cordova-plugin-inappbrowser/issues/418)) ([`9f4b729`](https://github.com/apache/cordova-plugin-inappbrowser/commit/9f4b729))
-   fix(types): remove unused replace parameter ([#410](https://github.com/apache/cordova-plugin-inappbrowser/issues/410)) ([`6db2f2d`](https://github.com/apache/cordova-plugin-inappbrowser/commit/6db2f2d))
-   documentation: Example documentation - Fix callBack function name ([#383](https://github.com/apache/cordova-plugin-inappbrowser/issues/383)) ([`a890e60`](https://github.com/apache/cordova-plugin-inappbrowser/commit/a890e60), [`2500b08`](https://github.com/apache/cordova-plugin-inappbrowser/commit/2500b08))
-   fix: Fix beforeload to work with POST requests ([#367](https://github.com/apache/cordova-plugin-inappbrowser/issues/367)) ([`632a395`](https://github.com/apache/cordova-plugin-inappbrowser/commit/632a395))
-   feat: (iOS & Android) Add postMessage API support ([#362](https://github.com/apache/cordova-plugin-inappbrowser/issues/362)) ([`c54d100`](https://github.com/apache/cordova-plugin-inappbrowser/commit/c54d100))
-   fix(ios): Fixes loadAfterBeforeload on iOS. ([#350](https://github.com/apache/cordova-plugin-inappbrowser/issues/350)) ([`0fd43ae`](https://github.com/apache/cordova-plugin-inappbrowser/commit/0fd43ae))
-   fix(ios): Fix crashes when using WKWebView implementation on iOS 9. ([#337](https://github.com/apache/cordova-plugin-inappbrowser/issues/337)) ([`3b82c16`](https://github.com/apache/cordova-plugin-inappbrowser/commit/3b82c16))
-   fix(ios): Fix iOS CDVWKInAppBrowser evaluateJavascript method randomly gets blocked on ios 12 ([#341](https://github.com/apache/cordova-plugin-inappbrowser/issues/341)) ([`978b147`](https://github.com/apache/cordova-plugin-inappbrowser/commit/978b147))
-   docs: remove unwanted information in README table ([#308](https://github.com/apache/cordova-plugin-inappbrowser/issues/308)) ([`3eadde6`](https://github.com/apache/cordova-plugin-inappbrowser/commit/3eadde6))
-   fix(ios): This lets the default window layering do it's thing. ([#336](https://github.com/apache/cordova-plugin-inappbrowser/issues/336)) ([`c24bb46`](https://github.com/apache/cordova-plugin-inappbrowser/commit/c24bb46), [`27fe8ec`](https://github.com/apache/cordova-plugin-inappbrowser/commit/27fe8ec))
-   feat(ios): [CB-7179](https://issues.apache.org/jira/browse/CB-7179) (iOS): Add optional WKWebView support for iOS ([#271](https://github.com/apache/cordova-plugin-inappbrowser/issues/271)) ([`10a0669`](https://github.com/apache/cordova-plugin-inappbrowser/commit/10a0669), [`3927b8f`](https://github.com/apache/cordova-plugin-inappbrowser/commit/3927b8f), [`8248215`](https://github.com/apache/cordova-plugin-inappbrowser/commit/8248215), [`61014dd`](https://github.com/apache/cordova-plugin-inappbrowser/commit/61014dd), [`c41f5b5`](https://github.com/apache/cordova-plugin-inappbrowser/commit/c41f5b5), [`19c6dfe`](https://github.com/apache/cordova-plugin-inappbrowser/commit/19c6dfe), [`7f5fa2a`](https://github.com/apache/cordova-plugin-inappbrowser/commit/7f5fa2a), [`5d2df21`](https://github.com/apache/cordova-plugin-inappbrowser/commit/5d2df21), [`86cc778`](https://github.com/apache/cordova-plugin-inappbrowser/commit/86cc778), [`cbfa195`](https://github.com/apache/cordova-plugin-inappbrowser/commit/cbfa195), [`52e3534`](https://github.com/apache/cordova-plugin-inappbrowser/commit/52e3534), [`8165232`](https://github.com/apache/cordova-plugin-inappbrowser/commit/8165232), [`e2210bd`](https://github.com/apache/cordova-plugin-inappbrowser/commit/e2210bd), [`dc7fa34`](https://github.com/apache/cordova-plugin-inappbrowser/commit/dc7fa34), [`b48e02f`](https://github.com/apache/cordova-plugin-inappbrowser/commit/b48e02f), [`27e6c67`](https://github.com/apache/cordova-plugin-inappbrowser/commit/27e6c67))
-   docs: remove JIRA link ([`d9cafcd`](https://github.com/apache/cordova-plugin-inappbrowser/commit/d9cafcd))
-   chore(types): [CB-12941](https://issues.apache.org/jira/browse/CB-12941): update typings ([#267](https://github.com/apache/cordova-plugin-inappbrowser/issues/267)) ([`a0c267f`](https://github.com/apache/cordova-plugin-inappbrowser/commit/a0c267f))
-   feat: [CB-14188](https://issues.apache.org/jira/browse/CB-14188): add beforeload event, catching navigation before it happens ([#276](https://github.com/apache/cordova-plugin-inappbrowser/issues/276)) ([`228703a`](https://github.com/apache/cordova-plugin-inappbrowser/commit/228703a), [`eafaeda`](https://github.com/apache/cordova-plugin-inappbrowser/commit/eafaeda))
-   ci(travis): reenable testing on all platforms ([`0ed0bf5`](https://github.com/apache/cordova-plugin-inappbrowser/commit/0ed0bf5))
-   ci(travis): also accept terms for android sdk `android-27` ([`f8ad528`](https://github.com/apache/cordova-plugin-inappbrowser/commit/f8ad528))
-   fix(android): [CB-10795](https://issues.apache.org/jira/browse/CB-10795): Exclude current app from external intent list ([#154](https://github.com/apache/cordova-plugin-inappbrowser/issues/154)) ([`a078337`](https://github.com/apache/cordova-plugin-inappbrowser/commit/a078337))
-   fix(ios): [CB-14234](https://issues.apache.org/jira/browse/CB-14234): Don't call handleOpenURL for system URLs ([#278](https://github.com/apache/cordova-plugin-inappbrowser/issues/278)) ([`cf58b04`](https://github.com/apache/cordova-plugin-inappbrowser/commit/cf58b04))
-   fix(ios): [CB-12875](https://issues.apache.org/jira/browse/CB-12875): (iOS) Pushes the inappbrowser window to a higher ui level than the existing apps window. ([#284](https://github.com/apache/cordova-plugin-inappbrowser/issues/284)) ([`dc5329d`](https://github.com/apache/cordova-plugin-inappbrowser/commit/dc5329d))
-   ci: Quick CI fixes ([#277](https://github.com/apache/cordova-plugin-inappbrowser/issues/277))  ([`de86501`](https://github.com/apache/cordova-plugin-inappbrowser/commit/de86501), [`07d9a99`](https://github.com/apache/cordova-plugin-inappbrowser/commit/07d9a99), [`81f1437`](https://github.com/apache/cordova-plugin-inappbrowser/commit/81f1437), [`a464ea6`](https://github.com/apache/cordova-plugin-inappbrowser/commit/a464ea6), [`e75fe14`](https://github.com/apache/cordova-plugin-inappbrowser/commit/e75fe14), [`eb245ec`](https://github.com/apache/cordova-plugin-inappbrowser/commit/eb245ec))
-   fix(ios): [CB-12922](https://issues.apache.org/jira/browse/CB-12922) (ios): fix In-app browser does not cede control ([#272](https://github.com/apache/cordova-plugin-inappbrowser/issues/272)) ([`dac06aa`](https://github.com/apache/cordova-plugin-inappbrowser/commit/dac06aa), [`9cc7f69`](https://github.com/apache/cordova-plugin-inappbrowser/commit/9cc7f69))
-   fix(android): [CB-14061](https://issues.apache.org/jira/browse/CB-14061): (android) comply with RFC 3986 for custom URL scheme handling ([#269](https://github.com/apache/cordova-plugin-inappbrowser/issues/269)) ([`f57ede9`](https://github.com/apache/cordova-plugin-inappbrowser/commit/f57ede9), [`26cf6e4`](https://github.com/apache/cordova-plugin-inappbrowser/commit/26cf6e4))
-   fix(android): [CB-14048](https://issues.apache.org/jira/browse/CB-14048): (android) allowedSchemes check empty string fix ([#268](https://github.com/apache/cordova-plugin-inappbrowser/issues/268)) ([`57eda78`](https://github.com/apache/cordova-plugin-inappbrowser/commit/57eda78), [`33aff11`](https://github.com/apache/cordova-plugin-inappbrowser/commit/33aff11))


### 3.0.0 (Apr 12, 2018)
* [CB-13659](https://issues.apache.org/jira/browse/CB-13659) **iOS** Add hidespinner option
* In file `AppBrowser.java`: New code within `shouldOverrideUrlLoading()` to check for whitelisting custom schemes via a new `AllowedSchemes` preference configuration item.  Allows custom schemes like `mycoolapp://` or `wevotetwitterscheme://`
* `InAppBrowser.java`: New method `isURLWhileListed` to check for whitelisting of `AllowedSchemes` in a new preference configuration item. There is a new check in `shouldOverrideUrlLoading`, to allow whitelisted custom schemes like "mycoolapp://"
* Add customisation of the navigation buttons for **iOS**
* Fix navigation buttons on **iOS**

### 2.0.2 (Jan 24, 2018)
* [CB-13791](https://issues.apache.org/jira/browse/CB-13791) Add **Android** support for a footer close button
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) restore gitignore to default
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) restore gitignore to default
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) restore gitignore to default
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) restore gitignore to default
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) ignore idea folder
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) change hidetoolbarnavigationbuttons to hidenavigationbuttons in iso
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) **Android** works well now, all changes are now documented
* [CB-13409](https://issues.apache.org/jira/browse/CB-13409) Lets user adjust color of toolbar, hide navigation buttons and set custom text on close button
* [CB-13746](https://issues.apache.org/jira/browse/CB-13746) Add build-tools-26.0.2 to travis

### 2.0.1 (Dec 27, 2017)
* [CB-13699](https://issues.apache.org/jira/browse/CB-13699) Fix to allow 2.0.0 version install

### 2.0.0 (Dec 15, 2017)
* [CB-13662](https://issues.apache.org/jira/browse/CB-13662) remove deprecated platforms

### 1.7.2 (Nov 06, 2017)
* [CB-13473](https://issues.apache.org/jira/browse/CB-13473) (CI) Removed **Browser** builds from AppVeyor
* [CB-13472](https://issues.apache.org/jira/browse/CB-13472) (CI) Fixed Travis **Android** builds again
* [CB-13347](https://issues.apache.org/jira/browse/CB-13347) Enable thirdparty cookies on `>=Android 5.0` device
* [CB-12895](https://issues.apache.org/jira/browse/CB-12895) added `eslint` and removed `jshint`
* [CB-12975](https://issues.apache.org/jira/browse/CB-12975) (docs) Resort and reword `cordova.InAppBrowser.open` `options` lists
* [CB-12586](https://issues.apache.org/jira/browse/CB-12586) (iOS) fix method `hide` doesn't work
* [CB-12847](https://issues.apache.org/jira/browse/CB-12847) added `bugs` entry to `package.json`.

### 1.7.1 (Apr 27, 2017)
* [CB-12622](https://issues.apache.org/jira/browse/CB-12622) Added **Android 6.0** build badges to `README`
* [CB-12266](https://issues.apache.org/jira/browse/CB-12266) (browser platform) loadstop event.url is now a string instead of an object, aligning it with the other platforms.
* [CB-12685](https://issues.apache.org/jira/browse/CB-12685) added `package.json` to tests folder
* [CB-11248](https://issues.apache.org/jira/browse/CB-11248) `InAppBrowser` no focus on input text fields

### 1.7.0 (Feb 28, 2017)
* [CB-12366](https://issues.apache.org/jira/browse/CB-12366) **iOS:** Reduce `tmpWindow` level to prevent overlapping statusbar
* [CB-12364](https://issues.apache.org/jira/browse/CB-12364) **Windows:** `Inappbrowser` inject file manual tests are not working
* [CB-12353](https://issues.apache.org/jira/browse/CB-12353) Corrected merges usage in `plugin.xml`
* [CB-12369](https://issues.apache.org/jira/browse/CB-12369) Add plugin typings from `DefinitelyTyped`
* [CB-12363](https://issues.apache.org/jira/browse/CB-12363) Added build badges for **iOS 9.3** and **iOS 10.0** 
* [CB-9148](https://issues.apache.org/jira/browse/CB-9148) **Android:** Add Support for `input[type=file]` File Chooser
* [CB-11136](https://issues.apache.org/jira/browse/CB-11136) (ios) Fix `InAppBrowser` when closing with `WKWebView`
* [CB-10799](https://issues.apache.org/jira/browse/CB-10799) **iOS:** fix toolbar is shown in incorrect position when in-call status bar

### 1.6.1 (Dec 14, 2016)
* [CB-12237](https://issues.apache.org/jira/browse/CB-12237) - Update version in package.json to correct 1.6.1-dev
* [CB-12236](https://issues.apache.org/jira/browse/CB-12236) - Fixed RELEASENOTES for cordova-plugin-inappbrowser
* [CB-12230](https://issues.apache.org/jira/browse/CB-12230) Removed Windows 8.1 build badges
* [CB-12224](https://issues.apache.org/jira/browse/CB-12224) Incremented plugin version.

### 1.6.0 (Dec 07, 2016)
* [CB-12224](https://issues.apache.org/jira/browse/CB-12224) Updated version and RELEASENOTES.md for release 1.6.0
* [CB-7608](https://issues.apache.org/jira/browse/CB-7608) (android) document useWidthViewPort
* add option useWidthViewPort
* [CB-12184](https://issues.apache.org/jira/browse/CB-12184) executeScript leads to a null pointer on exception on Android.
* fix(close button): Set correct content description
* [CB-9274](https://issues.apache.org/jira/browse/CB-9274) Adds missing methods to InAppBrowser to allow compilation for Amazon FireOS.
* [CB-10973](https://issues.apache.org/jira/browse/CB-10973) inAppBrowser for Windows Platform: wrong height of webview with location=yes
* Increment plugin minor version because of new hide feature
* removed duplicate hide method in ios source and add jasmine test cases
* [CB-8467](https://issues.apache.org/jira/browse/CB-8467)
* [CB-12010](https://issues.apache.org/jira/browse/CB-12010) (android) Catch FileUriExposedException
* [CB-11955](https://issues.apache.org/jira/browse/CB-11955) Added Initial OSX platform support
* [CB-11917](https://issues.apache.org/jira/browse/CB-11917) - Remove pull request template checklist item: "iCLA has been signed and submitted to secretary@apache.org."
* [CB-11694](https://issues.apache.org/jira/browse/CB-11694) Android: Set hadwareBackButton value according option in cordova.InAppBrowser.open
* [CB-11832](https://issues.apache.org/jira/browse/CB-11832) Incremented plugin version.

### 1.5.1 (Dec 07, 2016)
* [CB-7608](https://issues.apache.org/jira/browse/CB-7608) (android) document useWidthViewPort
* add option useWidthViewPort
* [CB-12184](https://issues.apache.org/jira/browse/CB-12184) executeScript leads to a null pointer on exception on Android.
* fix(close button): Set correct content description
* [CB-9274](https://issues.apache.org/jira/browse/CB-9274) Adds missing methods to InAppBrowser to allow compilation for Amazon FireOS.
* [CB-10973](https://issues.apache.org/jira/browse/CB-10973) inAppBrowser for Windows Platform: wrong height of webview with location=yes
* Increment plugin minor version because of new hide feature
* removed duplicate hide method in ios source and add jasmine test cases
* [CB-8467](https://issues.apache.org/jira/browse/CB-8467)
* [CB-12010](https://issues.apache.org/jira/browse/CB-12010) (android) Catch FileUriExposedException
* [CB-11955](https://issues.apache.org/jira/browse/CB-11955) Added Initial OSX platform support
* [CB-11917](https://issues.apache.org/jira/browse/CB-11917) - Remove pull request template checklist item: "iCLA has been signed and submitted to secretary@apache.org."
* [CB-11694](https://issues.apache.org/jira/browse/CB-11694) Android: Set hadwareBackButton value according option in cordova.InAppBrowser.open
* [CB-11832](https://issues.apache.org/jira/browse/CB-11832) Incremented plugin version.
* [CB-11832](https://issues.apache.org/jira/browse/CB-11832) Updated version and RELEASENOTES.md for release 1.5.0
* [CB-11795](https://issues.apache.org/jira/browse/CB-11795) Add 'protective' entry to cordovaDependencies
* Closing invalid pull request: close #28
* Closing invalid pull request: close #78
* Add intent scheme to be handled by OS
* Plugin uses Android Log class and not Cordova LOG class
* Adding links to guide content and reference content at the top of the readme file Github: close #163
* [CB-10973](https://issues.apache.org/jira/browse/CB-10973) inAppBrowser for Browser Platform: wrong height of webview with location=yes
* Size and position in browser platform
* [CB-10973](https://issues.apache.org/jira/browse/CB-10973) inAppBrowser for Windows Platform: wrong height of webview with location=yes
* [CB-11013](https://issues.apache.org/jira/browse/CB-11013) IAB enabling background play of YouTube videos?
* [CB-10467](https://issues.apache.org/jira/browse/CB-10467) Hardware back button, while InAppBrowser is opened, closes the app too in addition to closing InAppBrowser
* [CB-11178](https://issues.apache.org/jira/browse/CB-11178) allow to open other apps on iOS 9
* Closing stale pull request: close #152
* fix some calls which used api level 16
* [CB-5402](https://issues.apache.org/jira/browse/CB-5402) added extra content from wiki page
* doc: do not use `with` in JS samples
* Closing stale pull request: close #90
* [CB-2063](https://issues.apache.org/jira/browse/CB-2063) (ios) Fixed presentation style
* [CB-11012](https://issues.apache.org/jira/browse/CB-11012) added some clarifications about InAppBrowser object
* [CB-3360](https://issues.apache.org/jira/browse/CB-3360) Set custom inappbrowser user agent for ios
* Add badges for paramedic builds on Jenkins
* [CB-11381](https://issues.apache.org/jira/browse/CB-11381) android: Does not pass sonarqube scan
* Add pull request template.
* [CB-10866](https://issues.apache.org/jira/browse/CB-10866) Adding engine requirements to package.json
* [CB-110003](https://issues.apache.org/jira/browse/CB-110003) Adding samples to Readme.
* [CB-10996](https://issues.apache.org/jira/browse/CB-10996) Adding front matter to README.md
* [CB-11091](https://issues.apache.org/jira/browse/CB-11091) Incremented plugin version.
*  Updated version and RELEASENOTES.md for release 1.4.0
* [CB-7679](https://issues.apache.org/jira/browse/CB-7679) add fix for iOS upload. This closes #139
* [CB-10944](https://issues.apache.org/jira/browse/CB-10944) : NoSuchMethodError in InAppBrowser plugin
* [CB-10937](https://issues.apache.org/jira/browse/CB-10937) fix stretched icons
* [CB-10760](https://issues.apache.org/jira/browse/CB-10760) Fixing README for display on Cordova website
* [CB-10636](https://issues.apache.org/jira/browse/CB-10636) Add JSHint for plugins
* Fixes [CB-10607](https://issues.apache.org/jira/browse/CB-10607)
* [CB-10557](https://issues.apache.org/jira/browse/CB-10557) Incremented plugin version.
* [CB-10557](https://issues.apache.org/jira/browse/CB-10557) Updated version and RELEASENOTES.md for release 1.3.0
* [CB-3360](https://issues.apache.org/jira/browse/CB-3360) Set custom inappbrowser user agent for android
* [CB-10538](https://issues.apache.org/jira/browse/CB-10538) cordova-plugin-inappbrowser timeout issue
* [CB-10395](https://issues.apache.org/jira/browse/CB-10395) InAppBrowser's WebView not storing cookies reliable on Android
* chore: edit package.json license to match SPDX id
* [CB-10305](https://issues.apache.org/jira/browse/CB-10305) Gray bar appears in the wrong place on iOS
* [CB-7786](https://issues.apache.org/jira/browse/CB-7786) Support mediaPlaybackRequiresUserAction on Android
* [CB-7500](https://issues.apache.org/jira/browse/CB-7500) executeScript with callback kills/blurs inAppBrowser window on Android
* [CB-10505](https://issues.apache.org/jira/browse/CB-10505) Incremented plugin version.
* [CB-10505](https://issues.apache.org/jira/browse/CB-10505) Updated version and RELEASENOTES.md for release 1.2.1
* handle app store urls in system browser
* Added missing plugin dependency for manual tests
* [CB-10451](https://issues.apache.org/jira/browse/CB-10451) InAppBrowser: loadstart event is not triggered on Windows [CB-10452](https://issues.apache.org/jira/browse/CB-10452) InAppBrowser: 'exit' event is not triggered on Windows [CB-10454](https://issues.apache.org/jira/browse/CB-10454) InAppBrowser: 'loaderror' event does not have code and message on Windows [CB-10450](https://issues.apache.org/jira/browse/CB-10450) InAppBrowser: Unable to get property 'canGoBack' of undefined on Windows
* [CB-6702](https://issues.apache.org/jira/browse/CB-6702) InAppBrowser hangs when opening more than one instance
* [CB-10456](https://issues.apache.org/jira/browse/CB-10456) InAppBrowser is not closed if I close it programmatically on Android
* [CB-10441](https://issues.apache.org/jira/browse/CB-10441) Add auto tests for InAppBrowser plugin
* [CB-10428](https://issues.apache.org/jira/browse/CB-10428) Fix syntax error when browserifying inAppBrowser plugin
* [CB-10407](https://issues.apache.org/jira/browse/CB-10407) Re-adding onPageStarted to re-add LOAD_START, even though it's in the wrong place
* [CB-10368](https://issues.apache.org/jira/browse/CB-10368) Incremented plugin version.
* [CB-10368](https://issues.apache.org/jira/browse/CB-10368) Updated version and RELEASENOTES.md for release 1.2.0
* [CB-8180](https://issues.apache.org/jira/browse/CB-8180) Changing methods of interception in WebViewClient class
* Fix lint warnings
* [CB-10009](https://issues.apache.org/jira/browse/CB-10009) Improve InAppBrowser toolbar look and feel on Windows
* Using modulemapper
* Open a new window on the browser platform
* [CB-10187](https://issues.apache.org/jira/browse/CB-10187) Incremented plugin version.
* [CB-10187](https://issues.apache.org/jira/browse/CB-10187) Updated version and RELEASENOTES.md for release 1.1.1
* [CB-9445](https://issues.apache.org/jira/browse/CB-9445) Improves executeScript callbacks on iOS
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Incremented plugin version.
* [CB-10040](https://issues.apache.org/jira/browse/CB-10040) - re-fix: backwards compatible with cordova-ios < 4.0
* [CB-8534](https://issues.apache.org/jira/browse/CB-8534) Allow plugins to respond to onReceivedHttpAuthRequest. This closes #82
* [CB-3750](https://issues.apache.org/jira/browse/CB-3750) Fixes spinner on iOS. This closes #89
* [CB-7696](https://issues.apache.org/jira/browse/CB-7696) Document target=_self behavior for Windows
* [CB-10040](https://issues.apache.org/jira/browse/CB-10040) - Compile Error in InAppBrowser Plugin for iOS - No known instance method for selector 'URLIsWhitelisted:'
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) linked issues in RELEASENOTES.md
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated version and RELEASENOTES.md for release 1.1.0
* removed r prefix from tags
* weak ref type was wrong
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated RELEASENOTES to be newest to oldest
* Close #91
* Close #85
* Invoke webview if using local file
* Fixed zIndex issue on Windows 8, 8.1 where InAppBrowser opens behind default app.
* fix async self usage
* [CB-9150](https://issues.apache.org/jira/browse/CB-9150) Fix InAppBrowser executeScript crash on Windows if no data returned
* [CB-10008](https://issues.apache.org/jira/browse/CB-10008) Fix InAppBrowser popup layout on Windows
* InAppBrowser, iOS: Setting setStatusBarStyle to -1 causes CGContextSaveGState.
* Fix crash on browser window close (https://issues.apache.org/jira/browse/CB-9167)
* Close #113
* add JIRA issue tracker link
* [CB-9799](https://issues.apache.org/jira/browse/CB-9799) Fixed javaDoc errors.. This closes #119
* Actually fixing the contribute link.
* Fixing contribute link.
* [CB-9760](https://issues.apache.org/jira/browse/CB-9760) InAppBrowser: fallback to default window.open behavior on Ripple
* Close #114
* [CB-9378](https://issues.apache.org/jira/browse/CB-9378) Fix InAppBrowser not taking whole screen on Windows
* remove travis-ci
* [CB-9158](https://issues.apache.org/jira/browse/CB-9158) - InAppBrowser zoomControls are always set to true
* [CB-9192](https://issues.apache.org/jira/browse/CB-9192) Incremented plugin version.
* [CB-9202](https://issues.apache.org/jira/browse/CB-9202) updated repo url to github mirror in package.json
* [CB-9192](https://issues.apache.org/jira/browse/CB-9192) Updated version and RELEASENOTES.md for release 1.0.1
* [CB-9128](https://issues.apache.org/jira/browse/CB-9128) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* fix npm md issue
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Incremented plugin version.
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Updated version in package.json for release 1.0.0
* Revert "CB-8858 Incremented plugin version."
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Incremented plugin version.
* [CB-8858](https://issues.apache.org/jira/browse/CB-8858) Updated version and RELEASENOTES.md for release 1.0.0
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) gave plugin major version bump
* [CB-7689](https://issues.apache.org/jira/browse/CB-7689) Adds insertCSS support for windows platform
* [CB-4930](https://issues.apache.org/jira/browse/CB-4930) - (prefix) InAppBrowser should take into account the status bar
* [CB-8635](https://issues.apache.org/jira/browse/CB-8635) Improves UX on windows platform
* [CB-8661](https://issues.apache.org/jira/browse/CB-8661) Return executed script result on Windows
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) updated wp and browser specific references of old id to new id
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) changed plugin-id to pacakge-name
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) properly updated translated docs to use new id
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) updated translated docs to use new id
* Use TRAVIS_BUILD_DIR, install paramedic by npm
* [CB-8432](https://issues.apache.org/jira/browse/CB-8432) Correct styles for browser wrapper to display it correctly on some pages
* [CB-8659](https://issues.apache.org/jira/browse/CB-8659) - Update InAppBrowser to support both cordova-ios 4.0.x and 3.x (closes #93)
* [CB-7961](https://issues.apache.org/jira/browse/CB-7961) Add cordova-plugin-inappbrowser support for browser platform
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) Updated Readme
* Update docs for Android zoom=no option
* Added option to disable/enable zoom controls
* updated docs, set hardwareback default to true
* Add a hardwareback option to allow for the hardware back button to go back.
* [CB-8570](https://issues.apache.org/jira/browse/CB-8570) Integrate TravisCI
* [CB-8438](https://issues.apache.org/jira/browse/CB-8438) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-8538](https://issues.apache.org/jira/browse/CB-8538) Added package.json file
* Keep external android pages in a single tab. (close #61)
* [CB-8444](https://issues.apache.org/jira/browse/CB-8444) Add a clobber for `cordova.InAppBrowser.open` (close #80)
* [CB-8444](https://issues.apache.org/jira/browse/CB-8444) Don't clobber `window.open` - Add new symbol/clobber to access open function (`cordova.InAppBrowser.open`) - Change existing tests to use new symbol (i.e. don't rely on plugin clobber of `window.open`) - Add tests to use `window.open` via manual replace with new symbol - Update docs to deprecate plugin clobber of `window.open`
* [CB-8429](https://issues.apache.org/jira/browse/CB-8429) Incremented plugin version.
* [CB-8429](https://issues.apache.org/jira/browse/CB-8429) Updated version and RELEASENOTES.md for release 0.6.0
* Add missing license header for src/ubuntu/InAppBrowser_escapeScript.js
* [CB-8270](https://issues.apache.org/jira/browse/CB-8270) Remove usage of `[arr JSONString]`, since it's been renamed to `cdv_JSONString`
* ubuntu: implement inject* functions
* ubuntu: port to oxide
* [CB-7897](https://issues.apache.org/jira/browse/CB-7897) Update to work with whilelist plugins in Cordova 4.x
* [CB-7897](https://issues.apache.org/jira/browse/CB-7897) Update to work with whilelist plugins in Cordova 4.x
* [CB-8110](https://issues.apache.org/jira/browse/CB-8110) Incremented plugin version.
* [CB-8110](https://issues.apache.org/jira/browse/CB-8110) Updated version and RELEASENOTES.md for release 0.5.4
* Amazon specific changes: Removed reference to closebuttoncaption according to https://git-wip-us.apache.org/repos/asf?p=cordova-plugin-inappbrowser.git;a=commit;h=50a78baf22843b0df96ccb4ca83a45bd9ef3fc39
* [CB-7784](https://issues.apache.org/jira/browse/CB-7784) Exit event is not fired after InAppBrowser closing
* [CB-7697](https://issues.apache.org/jira/browse/CB-7697) Add locationBar support to InAppBrowser windows platform version
* [CB-7690](https://issues.apache.org/jira/browse/CB-7690) InAppBrowser loadstart/loadstop events issues
* [CB-7695](https://issues.apache.org/jira/browse/CB-7695) Fix InAppBrowser injectScriptFile for Windows 8.1 / Windows Phone 8.1
* [CB-7692](https://issues.apache.org/jira/browse/CB-7692) InAppBrowser local url opening bug in 8.1
* [CB-7688](https://issues.apache.org/jira/browse/CB-7688) Alert is not supported in InAppBrowser on Windows platform
* [CB-7977](https://issues.apache.org/jira/browse/CB-7977) Mention deviceready in plugin docs
* Dropping trailing whitespace
* [CB-7876](https://issues.apache.org/jira/browse/CB-7876) change test target to avoid undesired redirects
* [CB-7712](https://issues.apache.org/jira/browse/CB-7712) remove references to closebuttoncaption
* [CB-7850](https://issues.apache.org/jira/browse/CB-7850) clarify role of whitelist
* [CB-7720](https://issues.apache.org/jira/browse/CB-7720) check if event is null since OK string from success callback was removed
* [CB-7700](https://issues.apache.org/jira/browse/CB-7700) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-7471](https://issues.apache.org/jira/browse/CB-7471) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
*  Incremented plugin version.
*  Updated version and RELEASENOTES.md for release 0.5.3
* Amazon Specific changes: Added logs and corrected indentation according to 81161ebe668a14f87e1ef4b57f2d300a609b9a8b
* Windows implementation fixes and improvements
* zIndex fixed
* renamed InAppBrowser back to inappbrowser for case sensitive operating systems
* Clean plugin.xml
* Update french translation
* Update doc to add Windows 8
* Update windows proxy to be both compatible with windows 8 and 8.1
* Rename windows81 by windows8 in src directory
* Append Windows 8.1 platform configuration in plugin.xml
* Append Windows 8.1 proxy using x-ms-webview
* [CB-7571](https://issues.apache.org/jira/browse/CB-7571) Bump version of nested plugin to match parent plugin
* [CB-7571](https://issues.apache.org/jira/browse/CB-7571) Incremented plugin version.
* [CB-7571](https://issues.apache.org/jira/browse/CB-7571) Updated version and RELEASENOTES.md for release 0.5.2
* [CB-7471](https://issues.apache.org/jira/browse/CB-7471) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-7490](https://issues.apache.org/jira/browse/CB-7490) Fixes InAppBrowser manual tests crash on windows platform
* [CB-7249](https://issues.apache.org/jira/browse/CB-7249) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-7424](https://issues.apache.org/jira/browse/CB-7424) - Wrong docs: anchor tags are not supported by the InAppBrowser
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) clarify that anchor1 doesn't exist
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) more fixup of tests on Android
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) fix up the tests for Android
* Add just a bit more logging
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) port inappbrowser to plugin-test-framework
* phonegap events supported for _blank target
* inappbrowser _blank target position is fixed
* amazon-fireos related changes.
* [CB-7244](https://issues.apache.org/jira/browse/CB-7244) Incremented plugin version.
* [CB-7244](https://issues.apache.org/jira/browse/CB-7244) Updated version and RELEASENOTES.md for release 0.5.1
* ubuntu: support qt 5.2
* CB-7249cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* update InAppBrowserProxy.js
* app needs to be privileged
* CB-6127lisa7cordova-plugin-consolecordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-6769](https://issues.apache.org/jira/browse/CB-6769) ios: Fix statusbar color reset wasn't working on iOS7+
* [CB-6877](https://issues.apache.org/jira/browse/CB-6877) Incremented plugin version.
* [CB-6877](https://issues.apache.org/jira/browse/CB-6877) Updated version and RELEASENOTES.md for release 0.5.0
* [CB-6127](https://issues.apache.org/jira/browse/CB-6127) Spanish and rench Translations added. Github close #23
* Clean up whitespace (mainly due to no newline at eof warning)
* after code review
* default parameter added
* doc updated
* console.log removed
* back/forward buttons added, iframe has no border
* not forcing the look of the inAppBrowserWrap and buttons
* Adding permission info
* [CB-6806](https://issues.apache.org/jira/browse/CB-6806) Add license
* documentation translation: cordova-plugin-inappbrowser
* Lisa testing pulling in plugins for plugin: cordova-plugin-inappbrowser
* Lisa testing pulling in plugins for plugin: cordova-plugin-inappbrowser
* [CB-6491](https://issues.apache.org/jira/browse/CB-6491) add CONTRIBUTING.md
* Add necessary capability so the plugin works on its own
* [CB-6474](https://issues.apache.org/jira/browse/CB-6474) InAppBrowser. Add data urls support to WP8
* [CB-6482](https://issues.apache.org/jira/browse/CB-6482) InAppBrowser calls incorrect callback on WP8
* Fixed use of iOS 6 deprecated methods
* [CB-6360](https://issues.apache.org/jira/browse/CB-6360) - improvement: feature detection instead of iOS version detection
* [CB-5649](https://issues.apache.org/jira/browse/CB-5649) - InAppBrowser overrides App's orientation
* [CB-6452](https://issues.apache.org/jira/browse/CB-6452) Incremented plugin version on dev branch.
* [CB-6452](https://issues.apache.org/jira/browse/CB-6452) Updated version and RELEASENOTES.md for release 0.4.0
* [CB-6460](https://issues.apache.org/jira/browse/CB-6460) Update license headers
* [CB-6360](https://issues.apache.org/jira/browse/CB-6360) Fix for crash on iOS < 6.0 (closes #37)
* [CB-3324](https://issues.apache.org/jira/browse/CB-3324) Add support for back-button inappbrowser [WP8] if there is no history -> InAppBrowser is closed
* await async calls, resolve warnings
* Make InAppBrowser work with embedded files, using system behavior
* [CB-6402](https://issues.apache.org/jira/browse/CB-6402) [WP8] pass empty string instead of null for [optional] windowFeatures string
* [CB-6422](https://issues.apache.org/jira/browse/CB-6422) [windows8] use cordova/exec/proxy
* [CB-3617](https://issues.apache.org/jira/browse/CB-3617) Document clearcache and clearsessioncache for ios
* [CB-6389](https://issues.apache.org/jira/browse/CB-6389) [CB-3617](https://issues.apache.org/jira/browse/CB-3617) Add clearcache and clearsessioncache options to iOS (like Android)
* refactoring fixed
* [CB-6396](https://issues.apache.org/jira/browse/CB-6396) [Firefox OS] Adding basic support
* Doc update: event name and example param (closes #31)
* [CB-6253](https://issues.apache.org/jira/browse/CB-6253) Add Network Capability to WMAppManifest.xml
* [CB-6212](https://issues.apache.org/jira/browse/CB-6212) iOS: fix warnings compiled under arm64 64-bit
* [CB-6218](https://issues.apache.org/jira/browse/CB-6218) Update docs for BB10
* Tweak RELEASENOTES.md (missed a bug fix in last release)
* Incremented plugin version on dev branch.
* [CB-6218](https://issues.apache.org/jira/browse/CB-6218) Update docs for BB10
* Updated version and RELEASENOTES.md for release 0.3.3
* [CB-6172](https://issues.apache.org/jira/browse/CB-6172) Fix inappbrowser install failure on case-sensitive filesystems.
* [CB-5534](https://issues.apache.org/jira/browse/CB-5534) Updating the plugin.xml with the new Dialog class
* fix for [CB-5534](https://issues.apache.org/jira/browse/CB-5534)
* Add NOTICE file
* [CB-6114](https://issues.apache.org/jira/browse/CB-6114) Incremented plugin version on dev branch.
* Add NOTICE file
* [CB-6114](https://issues.apache.org/jira/browse/CB-6114) Updated version and RELEASENOTES.md for release 0.3.2
* Validate that callbackId is correctly formed
* [CB-6035](https://issues.apache.org/jira/browse/CB-6035) - Move js-module so it is not loaded on unsupported platforms
* [CB-5980](https://issues.apache.org/jira/browse/CB-5980) Incremented plugin version on dev branch.
* [CB-5980](https://issues.apache.org/jira/browse/CB-5980) Updated version and RELEASENOTES.md for release 0.3.1
* Removed some iOS6 Deprecations
* Lisa testing pulling in plugins for plugin: cordova-plugin-inappbrowser
* Lisa testing pulling in plugins for plugin: cordova-plugin-inappbrowser
* [CB-5980](https://issues.apache.org/jira/browse/CB-5980) Updated version and RELEASENOTES.md for release 0.3.1
* Add missing import for previous commit
* [CB-5756](https://issues.apache.org/jira/browse/CB-5756) Android: Use WebView.evaluateJavascript for script injection on Android 4.4+
* Didn't test on ICS or lower, getDrawable isn't supported until Jellybean
* WTF? ubuntu got automerged twice
* add ubuntu platform
* Adding CC-A-2.5 Notice for Assets, modifying plugins to use resources
* Adding the buttons
* Adding drawables to the inAppBrowser.  This doesn't look quite right, but it's a HUGE improvement over the previous settings
* [CB-5756](https://issues.apache.org/jira/browse/CB-5756) Add missing import
* [CB-5756](https://issues.apache.org/jira/browse/CB-5756) Android: Use WebView.evaluateJavascript for script injection on Android 4.4+
* Delete stale test/ directory
* Remove _alive from InAppBrowser.js since it didn't catch the case where the browser is closed by the user.
* [CB-5733](https://issues.apache.org/jira/browse/CB-5733) Fix IAB.close() not working if called before show() animation is done
* [CB-5719](https://issues.apache.org/jira/browse/CB-5719) Incremented plugin version on dev branch.
* [CB-5719](https://issues.apache.org/jira/browse/CB-5719) Updated version and RELEASENOTES.md for release 0.3.0
* [CB-5592](https://issues.apache.org/jira/browse/CB-5592) Add a comment explaining why we set MIME only for file:
* [CB-5592](https://issues.apache.org/jira/browse/CB-5592) Android - Add MIME type to Intent when opening file:/// URLs
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Update license comment formatting of doc/index.md
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Add doc.index.md for InAppBrowser plugin
* [CB-5658](https://issues.apache.org/jira/browse/CB-5658) Delete stale snapshot of plugin docs
* [CB-5594](https://issues.apache.org/jira/browse/CB-5594) Add disallowoverscroll option.
* [CB-5595](https://issues.apache.org/jira/browse/CB-5595) Rename "toolbarbarpostion" -> "toolbarposition"
* [CB-5595](https://issues.apache.org/jira/browse/CB-5595) Fixed the positioning and autoresizing for certain rotation scenarios.
* [CB-5595](https://issues.apache.org/jira/browse/CB-5595) Add toolbarposition=top option.
* Apply [CB-5193](https://issues.apache.org/jira/browse/CB-5193) to InAppBrowser
* [CB-5593](https://issues.apache.org/jira/browse/CB-5593) iOS: Make InAppBrowser localizable
* [CB-5591](https://issues.apache.org/jira/browse/CB-5591) Change window.escape to encodeURIComponent
* [CB-5565](https://issues.apache.org/jira/browse/CB-5565) Incremented plugin version on dev branch.
* [CB-5565](https://issues.apache.org/jira/browse/CB-5565) Updated version and RELEASENOTES.md for release 0.2.5
* Remove merge conflict tag
* [CB-4724](https://issues.apache.org/jira/browse/CB-4724) fixed UriFormatException
* add ubuntu platform
* [CB-3420](https://issues.apache.org/jira/browse/CB-3420) WP feature hidden=yes implemented
* Added amazon-fireos platform. Change to use amazon-fireos as the platform if user agent string contains 'cordova-amazon-fireos'
* [CB-5188](https://issues.apache.org/jira/browse/CB-5188)
* [CB-5188](https://issues.apache.org/jira/browse/CB-5188) Updated version and RELEASENOTES.md for release 0.2.4
* [CB-5128](https://issues.apache.org/jira/browse/CB-5128) added repo + issue tag to plugin.xml for inappbrowser plugin
* [CB-4995](https://issues.apache.org/jira/browse/CB-4995) Fix crash when WebView is quickly opened then closed.
* [CB-4930](https://issues.apache.org/jira/browse/CB-4930) - iOS - InAppBrowser should take into account the status bar
* [CB-5010](https://issues.apache.org/jira/browse/CB-5010) Incremented plugin version on dev branch.
* [CB-5010](https://issues.apache.org/jira/browse/CB-5010) Updated version and RELEASENOTES.md for release 0.2.3
* [CB-4858](https://issues.apache.org/jira/browse/CB-4858) - Run IAB methods on the UI thread.
* [CB-4858](https://issues.apache.org/jira/browse/CB-4858) Convert relative URLs to absolute URLs in JS
* [CB-3747](https://issues.apache.org/jira/browse/CB-3747) Fix back button having different dismiss logic from the close button.
* [CB-5021](https://issues.apache.org/jira/browse/CB-5021) Expose closeDialog() as a public function and make it safe to call multiple times.
* [CB-5021](https://issues.apache.org/jira/browse/CB-5021) Make it safe to call close() multiple times
* [CB-5010](https://issues.apache.org/jira/browse/CB-5010) Updated version and RELEASENOTES.md for release 0.2.3
* [CB-4915](https://issues.apache.org/jira/browse/CB-4915) Incremented plugin version on dev branch.
* [CB-4926](https://issues.apache.org/jira/browse/CB-4926) Fixes inappbrowser plugin loading for windows8
* [CB-4915](https://issues.apache.org/jira/browse/CB-4915) Updated version and RELEASENOTES.md for release 0.2.2
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) bumping&resetting version
* [CB-4788](https://issues.apache.org/jira/browse/CB-4788) Modified the onJsPrompt to warn against Cordova calls
* [windows8] commandProxy was moved
* [CB-4788](https://issues.apache.org/jira/browse/CB-4788) Modified the onJsPrompt to warn against Cordova calls
* [windows8] commandProxy was moved
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming core references
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming org.apache.cordova.core.inappbrowser to org.apache.cordova.inappbrowser
* CB-4864, [CB-4865](https://issues.apache.org/jira/browse/CB-4865) Minor improvements to InAppBrowser
* Rename CHANGELOG.md -> RELEASENOTES.md
* [CB-4792](https://issues.apache.org/jira/browse/CB-4792) Added keepCallback to the show function.
* [CB-4752](https://issues.apache.org/jira/browse/CB-4752) Incremented plugin version on dev branch.
* Add empty CHANGELOG.md
* [CB-4586](https://issues.apache.org/jira/browse/CB-4586) Making loadUrl run on the UI thread for close dialog to stop the WebView error
* [Windows8] add support for Windows 8 ( limited )
* [CB-3616](https://issues.apache.org/jira/browse/CB-3616) Change option name to "clearcache" to match original proposal
* add "clearallcache" and "clearsessioncache" option to InAppbrowser
* [CB-4595](https://issues.apache.org/jira/browse/CB-4595) updated version
* [CB-4417](https://issues.apache.org/jira/browse/CB-4417) Move cordova-plugin-inappbrowser to its own Java package.
* updated Readme, namespace and name tag
* [plugin.xml] standardizing license + meta
* [license] adding apache license file
* [CB-4399](https://issues.apache.org/jira/browse/CB-4399) removed blackberry entry in plugin xml. Installation of plugin interferes with natively supported childbrowser functionality. To support additional inappbrowser features, see [CB-4467.](https://issues.apache.org/jira/browse/CB-4467.)
* updating plugin.xml with registry data
* [CB-4368](https://issues.apache.org/jira/browse/CB-4368) Explicit CoreGraphics.framework dependency should be specified for some core plugins

### 1.5.0 (Sep 08, 2016)
* [CB-11795](https://issues.apache.org/jira/browse/CB-11795) Add 'protective' entry to cordovaDependencies
* Add intent scheme to be handled by OS
* Plugin uses `Android Log class` and not `Cordova LOG class`
* Adding links to guide content and reference content at the top of the readme file Github: close #163
* [CB-10973](https://issues.apache.org/jira/browse/CB-10973) **Browser**: wrong height of webview with `location=yes`
* Size and position in browser platform
* [CB-10973](https://issues.apache.org/jira/browse/CB-10973) **Windows**: wrong height of webview with `location=yes`
* [CB-11013](https://issues.apache.org/jira/browse/CB-11013) IAB enabling background play of YouTube videos?
* [CB-10467](https://issues.apache.org/jira/browse/CB-10467) Hardware back button, while `InAppBrowser` is opened, closes the app too in addition to closing `InAppBrowser`
* [CB-11178](https://issues.apache.org/jira/browse/CB-11178) allow to open other apps on **iOS 9**
* fix some calls which used api level 16
* [CB-5402](https://issues.apache.org/jira/browse/CB-5402) added extra content from wiki page
* [CB-2063](https://issues.apache.org/jira/browse/CB-2063) (**ios**) Fixed presentation style
* [CB-11012](https://issues.apache.org/jira/browse/CB-11012) added some clarifications about `InAppBrowser` object
* [CB-3360](https://issues.apache.org/jira/browse/CB-3360) Set custom `inappbrowser` user agent for **ios**
* Add badges for paramedic builds on Jenkins
* [CB-11381](https://issues.apache.org/jira/browse/CB-11381) android: Does not pass sonarqube scan
* Add pull request template.
* [CB-10866](https://issues.apache.org/jira/browse/CB-10866) Adding engine requirements to `package.json`
* [CB-110003](https://issues.apache.org/jira/browse/CB-110003) Adding samples to Readme.
* [CB-10996](https://issues.apache.org/jira/browse/CB-10996) Adding front matter to README.md

### 1.4.0 (Apr 15, 2016)
* [CB-7679](https://issues.apache.org/jira/browse/CB-7679) add fix for **iOS** upload.
* [CB-10944](https://issues.apache.org/jira/browse/CB-10944) `NoSuchMethodError` in `InAppBrowser` plugin
* [CB-10937](https://issues.apache.org/jira/browse/CB-10937) fix stretched icons
* [CB-10760](https://issues.apache.org/jira/browse/CB-10760) Fixing README for display on Cordova website
* [CB-10636](https://issues.apache.org/jira/browse/CB-10636) Add `JSHint` for plugins

### 1.3.0 (Feb 09, 2016)
* [CB-3360](https://issues.apache.org/jira/browse/CB-3360) Set custom inappbrowser user agent for android
* [CB-10538](https://issues.apache.org/jira/browse/CB-10538) cordova-plugin-inappbrowser timeout issue
* [CB-10395](https://issues.apache.org/jira/browse/CB-10395) InAppBrowser's WebView not storing cookies reliable on Android
* Edit package.json license to match SPDX id
* [CB-10305](https://issues.apache.org/jira/browse/CB-10305) Gray bar appears in the wrong place on iOS
* [CB-7786](https://issues.apache.org/jira/browse/CB-7786) Support mediaPlaybackRequiresUserAction on Android
* [CB-7500](https://issues.apache.org/jira/browse/CB-7500) executeScript with callback kills/blurs inAppBrowser window on Android

### 1.2.1 (Feb 02, 2016)
* [CB-10407](https://issues.apache.org/jira/browse/CB-10407) InAppBrowser not firing loadstart event on android
* [CB-10428](https://issues.apache.org/jira/browse/CB-10428) Fix syntax error when browserifying inAppBrowser plugin
* handle app store urls in system browser
* [CB-6702](https://issues.apache.org/jira/browse/CB-6702) InAppBrowser hangs when opening more than one instance
* [CB-10456](https://issues.apache.org/jira/browse/CB-10456) InAppBrowser is not closed if I close it programmatically on Android
* [CB-10451](https://issues.apache.org/jira/browse/CB-10451) InAppBrowser: loadstart event is not triggered on Windows
* [CB-10452](https://issues.apache.org/jira/browse/CB-10452) InAppBrowser: 'exit' event is not triggered on Windows
* [CB-10454](https://issues.apache.org/jira/browse/CB-10454) InAppBrowser: 'loaderror' event does not have code and message on Windows
* [CB-10450](https://issues.apache.org/jira/browse/CB-10450) InAppBrowser: Unable to get property 'canGoBack' of undefined on Windows
* [CB-10441](https://issues.apache.org/jira/browse/CB-10441) Add auto tests for InAppBrowser plugin

### 1.2.0 (Jan 15, 2016)
* [CB-8180](https://issues.apache.org/jira/browse/CB-8180) Changing methods of interception in `WebViewClient` class
* [CB-10009](https://issues.apache.org/jira/browse/CB-10009) Improve `InAppBrowser` toolbar look and feel on **Windows**
* Open a new window on the **Browser** platform

### 1.1.1 (Dec 10, 2015)

* [CB-9445](https://issues.apache.org/jira/browse/CB-9445) Improves executeScript callbacks on iOS
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Incremented plugin version.
* [CB-10040](https://issues.apache.org/jira/browse/CB-10040) - re-fix: backwards compatible with cordova-ios < 4.0
* [CB-8534](https://issues.apache.org/jira/browse/CB-8534) Allow plugins to respond to onReceivedHttpAuthRequest. This closes #82
* [CB-3750](https://issues.apache.org/jira/browse/CB-3750) Fixes spinner on iOS. This closes #89
* [CB-7696](https://issues.apache.org/jira/browse/CB-7696) Document target=_self behavior for Windows
* [CB-10040](https://issues.apache.org/jira/browse/CB-10040) - Compile Error in InAppBrowser Plugin for iOS - No known instance method for selector 'URLIsWhitelisted:'

### 1.1.0 (Nov 18, 2015)
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated `RELEASENOTES` to be newest to oldest
* Invoke webview if using local file
* Fixed `zIndex` issue on **Windows 8**, **8.188 where InAppBrowser opens behind default app.
* fix `async` self usage
* [CB-9150](https://issues.apache.org/jira/browse/CB-9150) Fix InAppBrowser `executeScript` crash on **Windows** if no data returned
* [CB-10008](https://issues.apache.org/jira/browse/CB-10008) Fix InAppBrowser popup layout on **Windows**
* Setting `setStatusBarStyle` to `-1` causes `CGContextSaveGState`.
* [CB-9167](https://issues.apache.org/jira/browse/CB-9167) Fix crash on **browser** window close 
* [CB-9799](https://issues.apache.org/jira/browse/CB-9799) Fixed `javaDoc` errors.
* Fixing contribute link.
* [CB-9760](https://issues.apache.org/jira/browse/CB-9760) InAppBrowser: fallback to default `window.open` behavior on **Ripple**
* [CB-9378](https://issues.apache.org/jira/browse/CB-9378) Fix InAppBrowser not taking whole screen on **Windows**
* [CB-9158](https://issues.apache.org/jira/browse/CB-9158) - InAppBrowser `zoomControls` are always set to true

### 1.0.1 (Jun 17, 2015)
* [CB-9128](https://issues.apache.org/jira/browse/CB-9128) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* fix npm md issue

### 1.0.0 (Apr 15, 2015)
* [CB-8746](https://issues.apache.org/jira/browse/CB-8746) gave plugin major version bump
* [CB-7689](https://issues.apache.org/jira/browse/CB-7689) Adds insertCSS support for windows platform
* [CB-4930](https://issues.apache.org/jira/browse/CB-4930) - (prefix) InAppBrowser should take into account the status bar
* [CB-8635](https://issues.apache.org/jira/browse/CB-8635) Improves UX on windows platform
* [CB-8661](https://issues.apache.org/jira/browse/CB-8661) Return executed script result on Windows
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) updated wp and browser specific references of old id to new id
* [CB-8683](https://issues.apache.org/jira/browse/CB-8683) changed plugin-id to pacakge-name
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) properly updated translated docs to use new id
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) updated translated docs to use new id
* Use TRAVIS_BUILD_DIR, install paramedic by npm
* [CB-8432](https://issues.apache.org/jira/browse/CB-8432) Correct styles for browser wrapper to display it correctly on some pages
* [CB-8659](https://issues.apache.org/jira/browse/CB-8659) - Update InAppBrowser to support both cordova-ios 4.0.x and 3.x (closes #93)
* [CB-7961](https://issues.apache.org/jira/browse/CB-7961) Add cordova-plugin-inappbrowser support for browser platform
* [CB-8653](https://issues.apache.org/jira/browse/CB-8653) Updated Readme
* Update docs for Android zoom=no option
* Added option to disable/enable zoom controls
* updated docs, set hardwareback default to true
* Add a hardwareback option to allow for the hardware back button to go back.
* [CB-8570](https://issues.apache.org/jira/browse/CB-8570) Integrate TravisCI
* [CB-8438](https://issues.apache.org/jira/browse/CB-8438) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-8538](https://issues.apache.org/jira/browse/CB-8538) Added package.json file
* Keep external android pages in a single tab. (close #61)
* [CB-8444](https://issues.apache.org/jira/browse/CB-8444) Add a clobber for `cordova.InAppBrowser.open` (close #80)
* [CB-8444](https://issues.apache.org/jira/browse/CB-8444) Don't clobber `window.open` - Add new symbol/clobber to access open function (`cordova.InAppBrowser.open`) - Change existing tests to use new symbol (i.e. don't rely on plugin clobber of `window.open`) - Add tests to use `window.open` via manual replace with new symbol - Update docs to deprecate plugin clobber of `window.open`

### 0.6.0 (Feb 04, 2015)
* [CB-8270](https://issues.apache.org/jira/browse/CB-8270) ios: Remove usage of `[arr JSONString]`, since it's been renamed to `cdv_JSONString`
* ubuntu: implement `inject*` functions
* ubuntu: port to oxide
* [CB-7897](https://issues.apache.org/jira/browse/CB-7897) ios, android: Update to work with whilelist plugins in Cordova 4.x

### 0.5.4 (Dec 02, 2014)
* [CB-7784](https://issues.apache.org/jira/browse/CB-7784) Exit event is not fired after `InAppBrowser` closing
* [CB-7697](https://issues.apache.org/jira/browse/CB-7697) Add `locationBar` support to `InAppBrowser` **Windows** platform version
* [CB-7690](https://issues.apache.org/jira/browse/CB-7690) `InAppBrowser` `loadstart/loadstop` events issues
* [CB-7695](https://issues.apache.org/jira/browse/CB-7695) Fix `InAppBrowser` `injectScriptFile` for **Windows 8.1** / **Windows Phone 8.1**
* [CB-7692](https://issues.apache.org/jira/browse/CB-7692) `InAppBrowser` local url opening bug in 8.1
* [CB-7688](https://issues.apache.org/jira/browse/CB-7688) `Alert` is not supported in `InAppBrowser` on **Windows** platform
* [CB-7977](https://issues.apache.org/jira/browse/CB-7977) Mention `deviceready` in plugin docs
* [CB-7876](https://issues.apache.org/jira/browse/CB-7876) change test target to avoid undesired redirects
* [CB-7712](https://issues.apache.org/jira/browse/CB-7712) remove references to `closebuttoncaption`
* [CB-7850](https://issues.apache.org/jira/browse/CB-7850) clarify role of whitelist
* [CB-7720](https://issues.apache.org/jira/browse/CB-7720) check if event is null since OK string from success callback was removed
* [CB-7471](https://issues.apache.org/jira/browse/CB-7471) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser

### 0.5.3 (Oct 03, 2014)
* Windows implementation fixes and improvements
* zIndex fixed
* renamed InAppBrowser back to inappbrowser for case sensitive operating systems
* Update french translation
* Update doc to add Windows 8
* Update windows proxy to be both compatible with windows 8 and 8.1
* Rename windows81 by windows8 in src directory
* Append Windows 8.1 platform configuration in plugin.xml
* Append Windows 8.1 proxy using x-ms-webview

### 0.5.2 (Sep 17, 2014)
* [CB-7471](https://issues.apache.org/jira/browse/CB-7471) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-7490](https://issues.apache.org/jira/browse/CB-7490) Fixes InAppBrowser manual tests crash on windows platform
* [CB-7249](https://issues.apache.org/jira/browse/CB-7249) cordova-plugin-inappbrowser documentation translation: cordova-plugin-inappbrowser
* [CB-7424](https://issues.apache.org/jira/browse/CB-7424) Wrong docs: anchor tags are not supported by the InAppBrowser
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) clarify that anchor1 doesn't exist
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) more fixup of tests on Android
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) fix up the tests for Android
* Add just a bit more logging
* [CB-7133](https://issues.apache.org/jira/browse/CB-7133) port inappbrowser to plugin-test-framework
* phonegap events supported for \_blank target
* inappbrowser \_blank target position is fixed
* amazon-fireos related changes.

### 0.5.1 (Aug 06, 2014)
* ubuntu: support qt 5.2
* **FFOS** update InAppBrowserProxy.js
* **FFOS** app needs to be privileged
* [CB-6127](https://issues.apache.org/jira/browse/CB-6127) Updated translations for docs
* [CB-6769](https://issues.apache.org/jira/browse/CB-6769) ios: Fix statusbar color reset wasn't working on iOS7+

### 0.5.0 (Jun 05, 2014)
* [CB-6127](https://issues.apache.org/jira/browse/CB-6127) Spanish and rench Translations added. Github close #23
* Clean up whitespace (mainly due to no newline at eof warning)
* Adding permission info
* [CB-6806](https://issues.apache.org/jira/browse/CB-6806) Add license
* [CB-6491](https://issues.apache.org/jira/browse/CB-6491) add CONTRIBUTING.md
* Add necessary capability so the plugin works on its own
* [CB-6474](https://issues.apache.org/jira/browse/CB-6474) InAppBrowser. Add data urls support to WP8
* [CB-6482](https://issues.apache.org/jira/browse/CB-6482) InAppBrowser calls incorrect callback on WP8
* Fixed use of iOS 6 deprecated methods
* [CB-6360](https://issues.apache.org/jira/browse/CB-6360) - improvement: feature detection instead of iOS version detection
* [CB-5649](https://issues.apache.org/jira/browse/CB-5649) - InAppBrowser overrides App's orientation
* refactoring fixed
* [CB-6396](https://issues.apache.org/jira/browse/CB-6396) [Firefox OS] Adding basic support

### 0.4.0 (Apr 17, 2014)
* [CB-6360](https://issues.apache.org/jira/browse/CB-6360): [ios] Fix for crash on iOS < 6.0 (closes #37)
* [CB-3324](https://issues.apache.org/jira/browse/CB-3324): [WP8] Add support for back-button inappbrowser [WP8] if there is no history -> InAppBrowser is closed
* [WP] await async calls, resolve warnings
* [WP] Make InAppBrowser work with embedded files, using system behavior
* [CB-6402](https://issues.apache.org/jira/browse/CB-6402): [WP8] pass empty string instead of null for [optional] windowFeatures string
* [CB-6422](https://issues.apache.org/jira/browse/CB-6422): [windows8] use cordova/exec/proxy
* [CB-6389](https://issues.apache.org/jira/browse/CB-6389) [CB-3617](https://issues.apache.org/jira/browse/CB-3617): Add clearcache and clearsessioncache options to iOS (like Android)
* Doc update: event name and example param (closes #31)
* [CB-6253](https://issues.apache.org/jira/browse/CB-6253): [WP] Add Network Capability to WMAppManifest.xml
* [CB-6212](https://issues.apache.org/jira/browse/CB-6212): [iOS] fix warnings compiled under arm64 64-bit
* [CB-6218](https://issues.apache.org/jira/browse/CB-6218): Update docs for BB10
* [CB-6460](https://issues.apache.org/jira/browse/CB-6460): Update license headers

### 0.3.3 (Mar 5, 2014)
* [CB-5534](https://issues.apache.org/jira/browse/CB-5534) Fix video/audio does not stop playing when browser is closed
* [CB-6172](https://issues.apache.org/jira/browse/CB-6172) Fix broken install on case-sensitive file-systems

### 0.3.2 (Feb 26, 2014)
* Validate that callbackId is correctly formed
* [CB-6035](https://issues.apache.org/jira/browse/CB-6035) Move js-module so it is not loaded on unsupported platforms
* Removed some iOS6 Deprecations

### 0.3.1 (Feb 05, 2014)
* [CB-5756](https://issues.apache.org/jira/browse/CB-5756): Android: Use WebView.evaluateJavascript for script injection on Android 4.4+
* Didn't test on ICS or lower, getDrawable isn't supported until Jellybean
* add ubuntu platform
* Adding drawables to the inAppBrowser.  This doesn't look quite right, but it's a HUGE improvement over the previous settings
* [CB-5756](https://issues.apache.org/jira/browse/CB-5756): Android: Use WebView.evaluateJavascript for script injection on Android 4.4+
* Remove alive from InAppBrowser.js since it didn't catch the case where the browser is closed by the user.
* [CB-5733](https://issues.apache.org/jira/browse/CB-5733) Fix IAB.close() not working if called before show() animation is done

### 0.2.5 (Dec 4, 2013)
* Remove merge conflict tag
* [CB-4724](https://issues.apache.org/jira/browse/CB-4724) fixed UriFormatException
* add ubuntu platform
* [CB-3420](https://issues.apache.org/jira/browse/CB-3420) WP feature hidden=yes implemented
* Added amazon-fireos platform. Change to use amazon-fireos as the platform if user agent string contains 'cordova-amazon-fireos'

### 0.2.4 (Oct 28, 2013)
* [CB-5128](https://issues.apache.org/jira/browse/CB-5128): added repo + issue tag to plugin.xml for inappbrowser plugin
* [CB-4995](https://issues.apache.org/jira/browse/CB-4995) Fix crash when WebView is quickly opened then closed.
* [CB-4930](https://issues.apache.org/jira/browse/CB-4930) - iOS - InAppBrowser should take into account the status bar
* [CB-5010](https://issues.apache.org/jira/browse/CB-5010) Incremented plugin version on dev branch.
* [CB-5010](https://issues.apache.org/jira/browse/CB-5010) Updated version and RELEASENOTES.md for release 0.2.3
* [CB-4858](https://issues.apache.org/jira/browse/CB-4858) - Run IAB methods on the UI thread.
* [CB-4858](https://issues.apache.org/jira/browse/CB-4858) Convert relative URLs to absolute URLs in JS
* [CB-3747](https://issues.apache.org/jira/browse/CB-3747) Fix back button having different dismiss logic from the close button.
* [CB-5021](https://issues.apache.org/jira/browse/CB-5021) Expose closeDialog() as a public function and make it safe to call multiple times.
* [CB-5021](https://issues.apache.org/jira/browse/CB-5021) Make it safe to call close() multiple times

### 0.2.3 (Oct 9, 2013)
* [CB-4915](https://issues.apache.org/jira/browse/CB-4915) Incremented plugin version on dev branch.
* [CB-4926](https://issues.apache.org/jira/browse/CB-4926) Fixes inappbrowser plugin loading for windows8

### 0.2.2 (Sept 25, 2013)
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) bumping&resetting version
* [CB-4788](https://issues.apache.org/jira/browse/CB-4788): Modified the onJsPrompt to warn against Cordova calls
* [windows8] commandProxy was moved
* [CB-4788](https://issues.apache.org/jira/browse/CB-4788): Modified the onJsPrompt to warn against Cordova calls
* [windows8] commandProxy was moved
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming core references
* [CB-4889](https://issues.apache.org/jira/browse/CB-4889) renaming org.apache.cordova.core.inappbrowser to org.apache.cordova.inappbrowser
* [CB-4864](https://issues.apache.org/jira/browse/CB-4864), [CB-4865](https://issues.apache.org/jira/browse/CB-4865): Minor improvements to InAppBrowser
* Rename CHANGELOG.md -> RELEASENOTES.md
* [CB-4792](https://issues.apache.org/jira/browse/CB-4792) Added keepCallback to the show function.
* [CB-4752](https://issues.apache.org/jira/browse/CB-4752) Incremented plugin version on dev branch.
