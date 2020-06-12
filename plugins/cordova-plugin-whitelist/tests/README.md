---
 license: Licensed to the Apache Software Foundation (ASF) under one
         or more contributor license agreements.  See the NOTICE file
         distributed with this work for additional information
         regarding copyright ownership.  The ASF licenses this file
         to you under the Apache License, Version 2.0 (the
         "License"); you may not use this file except in compliance
         with the License.  You may obtain a copy of the License at

           http://www.apache.org/licenses/LICENSE-2.0

         Unless required by applicable law or agreed to in writing,
         software distributed under the License is distributed on an
         "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
         KIND, either express or implied.  See the License for the
         specific language governing permissions and limitations
         under the License.
---

# cordova-plugin-whitelist-tests

This are an [optional JavaScript interface](#whitelist) to the core Cordova Whitelist functionality and the test plugin that uses it to test cordova-plugin-whitelist.

## Whitelist

> The `whitelist` object provides an interface for testing whether arbitrary
> URLs are allowed by the currently active configuration, or would be allowed
> by a given set of whitelist patterns.

### Methods

- cordova.whitelist.match
- cordova.whitelist.test

#### cordova.whitelist.match

Indicates whether a given URL would be allowed by a set of Whitelist URL
patterns.

    cordova.whitelist.match(url, patterns, callback);

`callback` will be invoked with a boolean argument indicating whether the
url matches the set of patterns.

#### cordova.whitelist.test

Indicates whether a given URL would be allowed by the current application
configuration.

    cordova.whitelist.test(url, callback);

`callback` will be invoked with a boolean argument indicating whether the
url is currently whitelisted.
