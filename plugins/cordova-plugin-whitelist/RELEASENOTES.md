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

### 1.3.5 (Jun 26, 2021)
-   fix: lock next patch release to `cordova-android` <10 (#62)
-   breaking: deprecate plugin (#59)
-   ci: add node-14.x to workflow (#58)
-   chore: clean up `package.json` (#56)
-   ci(travis): update osx xcode image (#55)
-   ci(travis): updates **Android*- API level (#54)
-   chore(asf): update git notification settings
-   Update CONTRIBUTING.md
-   ci: updates Node.js version (#52)
-   chore(npm): improve ignore list (#51)
-   docs: apply syntax highlighting to code samples (#48)
-   ci: upgrade to node 8

### 1.3.4 (Jun 19, 2019)

-   chore: manually fix lines breaks to LF ([`d804ef2`](https://github.com/apache/cordova-plugin-whitelist/commit/d804ef2))
-   build: add `.gitattributes` to force LF (instead of possible CRLF on Windows) ([`ed0206b`](https://github.com/apache/cordova-plugin-whitelist/commit/ed0206b))
-   build: add `.npmignore` to remove unneeded files from npm package ([`bf8fea5`](https://github.com/apache/cordova-plugin-whitelist/commit/bf8fea5))
-   test,ci(travis): Tests (extracted from cordova-mobile-spec) ([#38](https://github.com/apache/cordova-plugin-whitelist/issues/38)) ([`e4f17b0`](https://github.com/apache/cordova-plugin-whitelist/commit/e4f17b0))
-   docs: Added information on allow-navigation preceding allow-intent ([#41](https://github.com/apache/cordova-plugin-whitelist/issues/41)) ([`7725fed`](https://github.com/apache/cordova-plugin-whitelist/commit/7725fed))
-   chore(github): Add or update GitHub pull request and issue template ([`86b3ee1`](https://github.com/apache/cordova-plugin-whitelist/commit/86b3ee1))
-   fix: Remove information about cordova-android ([#27](https://github.com/apache/cordova-plugin-whitelist/issues/27)) ([`34ed9d0`](https://github.com/apache/cordova-plugin-whitelist/commit/34ed9d0))
-   docs: remove JIRA link ([`fa78675`](https://github.com/apache/cordova-plugin-whitelist/commit/fa78675))
-   docs: Clarify unconfigured Intent Whitelist behaviour ([#26](https://github.com/apache/cordova-plugin-whitelist/issues/26)) ([`8d3f86b`](https://github.com/apache/cordova-plugin-whitelist/commit/8d3f86b))

### 1.3.3 (Nov 06, 2017)
* [CB-12847](https://issues.apache.org/jira/browse/CB-12847) added `bugs` entry to `package.json`.

### 1.3.2 (Feb 28, 2017)
* [CB-12236](https://issues.apache.org/jira/browse/CB-12236) Fixed `RELEASENOTES` for `cordova-plugin-whitelist`

### 1.3.1 (Dec 07, 2016)
* [CB-12224](https://issues.apache.org/jira/browse/CB-12224) Updated version and RELEASENOTES.md for release 1.3.1
* [CB-11917](https://issues.apache.org/jira/browse/CB-11917) - Remove pull request template checklist item: "iCLA has been submitted…"
* Edit package.json license to match SPDX id
* [CB-11832](https://issues.apache.org/jira/browse/CB-11832) Incremented plugin version.

### 1.3.0 (Sep 08, 2016)
* [CB-11795](https://issues.apache.org/jira/browse/CB-11795) Add 'protective' entry to cordovaDependencies
* Updated installation section
* Plugin uses `Android Log class` and not `Cordova LOG class`
* Add pull request template.
* [CB-10866](https://issues.apache.org/jira/browse/CB-10866) Adding engine info to `package.json`
* [CB-10996](https://issues.apache.org/jira/browse/CB-10996) Adding front matter to README.md

### 1.2.2 (Apr 15, 2016)
* add note about redirects
* [CB-10624](https://issues.apache.org/jira/browse/CB-10624) remove error message from `whitelist.js`, which leaves it empty

### 1.2.1 (Jan 15, 2016)
* [CB-10194](https://issues.apache.org/jira/browse/CB-10194) info tag prints for ios when not applicable

### 1.2.0 (Nov 18, 2015)
* removed **iOS** engine check from `plugin.xml`
* [CB-10035](https://issues.apache.org/jira/browse/CB-10035) Updated `RELEASENOTES` to be newest to oldest
* [CB-9972](https://issues.apache.org/jira/browse/CB-9972) - Remove **iOS** whitelist
* Updated the text, it should read 4.0.x and greater, since this plugin will be required for `cordova-android 5.0`
* Fixing contribute link.
* Updated `plugin.xml <info>` tag to remove warning about not needing this plugin if you are using the **iOS 9 SDK**
* [CB-9738](https://issues.apache.org/jira/browse/CB-9738) - Disable whitelist use when runtime environment is **iOS 9**
* [CB-9740](https://issues.apache.org/jira/browse/CB-9740) - Add `<info>` tag describing whitelist plugin not needed on `cordova-ios` and cordova-android 3.x`
* [CB-9568](https://issues.apache.org/jira/browse/CB-9568) - Update whitelist plugin to allow all network access by default
* [CB-9337](https://issues.apache.org/jira/browse/CB-9337) - enable use of `<access>` tags for native code network requests

### 1.1.0 (Jun 17, 2015)
* [CB-9128](https://issues.apache.org/jira/browse/CB-9128) cordova-plugin-whitelist documentation translation: cordova-plugin-whitelist
* fix npm md issue
* Usage of CDVURLRequestFilter protocol.
* [CB-9089](https://issues.apache.org/jira/browse/CB-9089) - iOS whitelist plugin does not compile
* [CB-9090](https://issues.apache.org/jira/browse/CB-9090) - Enable whitelist plugin for cordova-ios 4.0.0
* Fixed error in Content-Security-Policy example

### 1.0.0 (Mar 25, 2015)
* [CB-8739](https://issues.apache.org/jira/browse/CB-8739) added missing license headers
* Add @Override to CustomConfigXmlParser methods
* Change ID to cordova-plugin-whitelist rather than reverse-DNS-style
* Tweak CSP examples in README
* [CB-8660](https://issues.apache.org/jira/browse/CB-8660) remove extra commas from package.json
