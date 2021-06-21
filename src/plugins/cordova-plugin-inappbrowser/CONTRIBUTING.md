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

# Contributing to Apache Cordova

Anyone can contribute to Cordova. And we need your contributions.

There are multiple ways to contribute: report bugs, improve the docs, and
contribute code.

For instructions on this, start with the
[contribution overview](http://cordova.apache.org/contribute/).

The details are explained there, but the important items are:
 - Sign and submit an Apache ICLA (Contributor License Agreement).
 - Have a Jira issue open that corresponds to your contribution.
 - Run the tests so your patch doesn't break existing functionality.

We look forward to your contributions!

The notes on [Commit Workflow](https://github.com/apache/cordova-coho/blob/master/docs/committer-workflow.md#commit-workflow) can be helpful even if you are not a committer.

## Running plugin tests

* clone and install [cordova-plugin-test-framework](https://github.com/apache/cordova-plugin-test-framework)
```
git clone git@github.com:apache/cordova-plugin-test-framework.git
```
* edit ```cordova-plugin-test-framework/www/assets/index.html``` and add the following line
```
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com http://cordova.apache.org http://google.co.uk https://google.co.uk 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
```
* create test project
```
cordova create plugintest
cd plugintest
cordova platform add android
cordova plugin add ../cordova-plugin-inappbrowser
cordova plugin add ../cordova-plugin-inappbrowser/tests
cordova plugin add ../cordova-plugin-test-framework
```
* edit ```config.xml``` and replace ```<content src="index.html" />``` with ```<content src="cdvtests/index.html" />```
* run application
```
cordova run
```
