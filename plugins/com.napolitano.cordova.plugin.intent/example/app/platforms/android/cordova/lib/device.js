#!/usr/bin/env node

/*
       Licensed to the Apache Software Foundation (ASF) under one
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
*/

var exec  = require('./exec'),
    Q     = require('q'),
    os    = require('os'),
    build = require('./build'),
    appinfo = require('./appinfo');

/**
 * Returns a promise for the list of the device ID's found
 * @param lookHarder When true, try restarting adb if no devices are found.
 */
module.exports.list = function(lookHarder) {
    function helper() {
        return exec('adb devices', os.tmpdir())
        .then(function(output) {
            var response = output.split('\n');
            var device_list = [];
            for (var i = 1; i < response.length; i++) {
                if (response[i].match(/\w+\tdevice/) && !response[i].match(/emulator/)) {
                    device_list.push(response[i].replace(/\tdevice/, '').replace('\r', ''));
                }
            }
            return device_list;
        });
    }
    return helper()
    .then(function(list) {
        if (list.length === 0 && lookHarder) {
            // adb kill-server doesn't seem to do the trick.
            // Could probably find a x-platform version of killall, but I'm not actually
            // sure that this scenario even happens on non-OSX machines.
            return exec('killall adb')
            .then(function() {
                console.log('Restarting adb to see if more devices are detected.');
                return helper();
            }, function() {
                // For non-killall OS's.
                return list;
            });
        }
        return list;
    });
};

module.exports.resolveTarget = function(target) {
    return this.list(true)
    .then(function(device_list) {
        if (!device_list || !device_list.length) {
            return Q.reject('ERROR: Failed to deploy to device, no devices found.');
        }
        // default device
        target = target || device_list[0];

        if (device_list.indexOf(target) < 0) {
            return Q.reject('ERROR: Unable to find target \'' + target + '\'.');
        }

        return build.detectArchitecture(target)
        .then(function(arch) {
            return { target: target, arch: arch, isEmulator: false };
        });
    });
};

/*
 * Installs a previously built application on the device
 * and launches it.
 * Returns a promise.
 */
module.exports.install = function(target, buildResults) {
    return Q().then(function() {
        if (target && typeof target == 'object') {
            return target;
        }
        return module.exports.resolveTarget(target);
    }).then(function(resolvedTarget) {
        var apk_path = build.findBestApkForArchitecture(buildResults, resolvedTarget.arch);
        var launchName = appinfo.getActivityName();
        console.log('Using apk: ' + apk_path);
        console.log('Installing app on device...');
        var cmd = 'adb -s ' + resolvedTarget.target + ' install -r "' + apk_path + '"';
        return exec(cmd, os.tmpdir())
        .then(function(output) {
            if (output.match(/Failure/)) return Q.reject('ERROR: Failed to install apk to device: ' + output);

            //unlock screen
            var cmd = 'adb -s ' + resolvedTarget.target + ' shell input keyevent 82';
            return exec(cmd, os.tmpdir());
        }, function(err) { return Q.reject('ERROR: Failed to install apk to device: ' + err); })
        .then(function() {
            // launch the application
            console.log('Launching application...');
            var cmd = 'adb -s ' + resolvedTarget.target + ' shell am start -W -a android.intent.action.MAIN -n ' + launchName;
            return exec(cmd, os.tmpdir());
        }).then(function() {
            console.log('LAUNCH SUCCESS');
        }, function(err) {
            return Q.reject('ERROR: Failed to launch application on device: ' + err);
        });
    });
};
