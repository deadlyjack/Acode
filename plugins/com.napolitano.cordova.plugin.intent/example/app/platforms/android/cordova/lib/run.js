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

/* jshint loopfunc:true */

var path  = require('path'),
    build = require('./build'),
    emulator = require('./emulator'),
    device   = require('./device'),
    shell = require('shelljs'),
    Q = require('q');

/*
 * Runs the application on a device if available.
 * If no device is found, it will use a started emulator.
 * If no started emulators are found it will attempt to start an avd.
 * If no avds are found it will error out.
 * Returns a promise.
 */
 module.exports.run = function(args) {
    var buildFlags = [];
    var install_target;
    var list = false;

    for (var i=2; i<args.length; i++) {
        if (build.isBuildFlag(args[i])) {
            buildFlags.push(args[i]);
        } else if (args[i] == '--device') {
            install_target = '--device';
        } else if (args[i] == '--emulator') {
            install_target = '--emulator';
        } else if (/^--target=/.exec(args[i])) {
            install_target = args[i].substring(9, args[i].length);
        } else if (args[i] == '--list') {
            list = true;
        } else {
            console.warn('Option \'' + args[i] + '\' not recognized (ignoring).');
        }
    }

    if (list) {
        var output = '';
        var temp = '';
        if (!install_target) {
            output += 'Available Android Devices:\n';
            temp = shell.exec(path.join(__dirname, 'list-devices'), {silent:true}).output;
            temp = temp.replace(/^(?=[^\s])/gm, '\t');
            output += temp;
            output += 'Available Android Virtual Devices:\n';
            temp = shell.exec(path.join(__dirname, 'list-emulator-images'), {silent:true}).output;
            temp = temp.replace(/^(?=[^\s])/gm, '\t');
            output += temp;
        } else if (install_target == '--emulator') {
            output += 'Available Android Virtual Devices:\n';
            temp = shell.exec(path.join(__dirname, 'list-emulator-images'), {silent:true}).output;
            temp = temp.replace(/^(?=[^\s])/gm, '\t');
            output += temp;
        } else if (install_target == '--device') {
            output += 'Available Android Devices:\n';
            temp = shell.exec(path.join(__dirname, 'list-devices'), {silent:true}).output;
            temp = temp.replace(/^(?=[^\s])/gm, '\t');
            output += temp;
        }
        console.log(output);
        return;
    }

    return Q()
    .then(function() {
        if (!install_target) {
            // no target given, deploy to device if available, otherwise use the emulator.
            return device.list()
            .then(function(device_list) {
                if (device_list.length > 0) {
                    console.log('WARNING : No target specified, deploying to device \'' + device_list[0] + '\'.');
                    install_target = device_list[0];
                } else {
                    console.log('WARNING : No target specified, deploying to emulator');
                    install_target = '--emulator';
                }
            });
        }
    }).then(function() {
        if (install_target == '--device') {
            return device.resolveTarget(null);
        } else if (install_target == '--emulator') {
            // Give preference to any already started emulators. Else, start one.
            return emulator.list_started()
            .then(function(started) {
                return started && started.length > 0 ? started[0] : emulator.start();
            }).then(function(emulatorId) {
                return emulator.resolveTarget(emulatorId);
            });
        }
        // They specified a specific device/emulator ID.
        return device.list()
        .then(function(devices) {
            if (devices.indexOf(install_target) > -1) {
                return device.resolveTarget(install_target);
            }
            return emulator.list_started()
            .then(function(started_emulators) {
                if (started_emulators.indexOf(install_target) > -1) {
                    return emulator.resolveTarget(install_target);
                }
                return emulator.list_images()
                .then(function(avds) {
                    // if target emulator isn't started, then start it.
                    for (var avd in avds) {
                        if (avds[avd].name == install_target) {
                            return emulator.start(install_target)
                            .then(function(emulatorId) {
                                return emulator.resolveTarget(emulatorId);
                            });
                        }
                    }
                    return Q.reject('Target \'' + install_target + '\' not found, unable to run project');
                });
            });
        });
    }).then(function(resolvedTarget) {
        return build.run(buildFlags, resolvedTarget).then(function(buildResults) {
            if (resolvedTarget.isEmulator) {
                return emulator.install(resolvedTarget, buildResults);
            }
            return device.install(resolvedTarget, buildResults);
        });
    });
};

module.exports.help = function(args) {
    console.log('Usage: ' + path.relative(process.cwd(), args[1]) + ' [options]');
    console.log('Build options :');
    console.log('    --debug : Builds project in debug mode');
    console.log('    --release : Builds project in release mode');
    console.log('    --nobuild : Runs the currently built project without recompiling');
    console.log('Deploy options :');
    console.log('    --device : Will deploy the built project to a device');
    console.log('    --emulator : Will deploy the built project to an emulator if one exists');
    console.log('    --target=<target_id> : Installs to the target with the specified id.');
    process.exit(0);
};
