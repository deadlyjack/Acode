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

const execa = require('execa');
const fs = require('fs-extra');
var android_versions = require('android-versions');
var path = require('path');
var Adb = require('./Adb');
var events = require('cordova-common').events;
var CordovaError = require('cordova-common').CordovaError;
var android_sdk = require('./android_sdk');
var check_reqs = require('./check_reqs');
var which = require('which');

// constants
const ONE_SECOND = 1000; // in milliseconds
const CHECK_BOOTED_INTERVAL = 3 * ONE_SECOND; // in milliseconds

function forgivingWhichSync (cmd) {
    const whichResult = which.sync(cmd, { nothrow: true });

    // On null, returns empty string to maintain backwards compatibility
    // realpathSync follows symlinks
    return whichResult === null ? '' : fs.realpathSync(whichResult);
}

module.exports.list_images_using_avdmanager = function () {
    return execa('avdmanager', ['list', 'avd']).then(({ stdout: output }) => {
        var response = output.split('\n');
        var emulator_list = [];
        for (var i = 1; i < response.length; i++) {
            // To return more detailed information use img_obj
            var img_obj = {};
            if (response[i].match(/Name:\s/)) {
                img_obj.name = response[i].split('Name: ')[1].replace('\r', '');
                if (response[i + 1].match(/Device:\s/)) {
                    i++;
                    img_obj.device = response[i].split('Device: ')[1].replace('\r', '');
                }
                if (response[i + 1].match(/Path:\s/)) {
                    i++;
                    img_obj.path = response[i].split('Path: ')[1].replace('\r', '');
                }
                if (response[i + 1].match(/Target:\s/)) {
                    i++;
                    if (response[i + 1].match(/ABI:\s/)) {
                        img_obj.abi = response[i + 1].split('ABI: ')[1].replace('\r', '');
                    }
                    // This next conditional just aims to match the old output of `android list avd`
                    // We do so so that we don't have to change the logic when parsing for the
                    // best emulator target to spawn (see below in `best_image`)
                    // This allows us to transitionally support both `android` and `avdmanager` binaries,
                    // depending on what SDK version the user has
                    if (response[i + 1].match(/Based\son:\s/)) {
                        img_obj.target = response[i + 1].split('Based on:')[1];
                        if (img_obj.target.match(/Tag\/ABI:\s/)) {
                            img_obj.target = img_obj.target.split('Tag/ABI:')[0].replace('\r', '').trim();
                            if (img_obj.target.indexOf('(') > -1) {
                                img_obj.target = img_obj.target.substr(0, img_obj.target.indexOf('(') - 1).trim();
                            }
                        }
                        var version_string = img_obj.target.replace(/Android\s+/, '');

                        var api_level = android_sdk.version_string_to_api_level[version_string];
                        if (api_level) {
                            img_obj.target += ' (API level ' + api_level + ')';
                        }
                    }
                }
                if (response[i + 1].match(/Skin:\s/)) {
                    i++;
                    img_obj.skin = response[i].split('Skin: ')[1].replace('\r', '');
                }

                emulator_list.push(img_obj);
            }
            /* To just return a list of names use this
            if (response[i].match(/Name:\s/)) {
                emulator_list.push(response[i].split('Name: ')[1].replace('\r', '');
            } */
        }
        return emulator_list;
    });
};

module.exports.list_images_using_android = function () {
    return execa('android', ['list', 'avd']).then(({ stdout: output }) => {
        var response = output.split('\n');
        var emulator_list = [];
        for (var i = 1; i < response.length; i++) {
            // To return more detailed information use img_obj
            var img_obj = {};
            if (response[i].match(/Name:\s/)) {
                img_obj.name = response[i].split('Name: ')[1].replace('\r', '');
                if (response[i + 1].match(/Device:\s/)) {
                    i++;
                    img_obj.device = response[i].split('Device: ')[1].replace('\r', '');
                }
                if (response[i + 1].match(/Path:\s/)) {
                    i++;
                    img_obj.path = response[i].split('Path: ')[1].replace('\r', '');
                }
                if (response[i + 1].match(/\(API\slevel\s/) || (response[i + 2] && response[i + 2].match(/\(API\slevel\s/))) {
                    i++;
                    var secondLine = response[i + 1].match(/\(API\slevel\s/) ? response[i + 1] : '';
                    img_obj.target = (response[i] + secondLine).split('Target: ')[1].replace('\r', '');
                }
                if (response[i + 1].match(/ABI:\s/)) {
                    i++;
                    img_obj.abi = response[i].split('ABI: ')[1].replace('\r', '');
                }
                if (response[i + 1].match(/Skin:\s/)) {
                    i++;
                    img_obj.skin = response[i].split('Skin: ')[1].replace('\r', '');
                }

                emulator_list.push(img_obj);
            }
            /* To just return a list of names use this
            if (response[i].match(/Name:\s/)) {
                emulator_list.push(response[i].split('Name: ')[1].replace('\r', '');
            } */
        }
        return emulator_list;
    });
};

/**
 * Returns a Promise for a list of emulator images in the form of objects
 * {
       name   : <emulator_name>,
       device : <device>,
       path   : <path_to_emulator_image>,
       target : <api_target>,
       abi    : <cpu>,
       skin   : <skin>
   }
 */
module.exports.list_images = function () {
    return Promise.resolve().then(function () {
        if (forgivingWhichSync('avdmanager')) {
            return module.exports.list_images_using_avdmanager();
        } else if (forgivingWhichSync('android')) {
            return module.exports.list_images_using_android();
        } else {
            return Promise.reject(new CordovaError('Could not find either `android` or `avdmanager` on your $PATH! Are you sure the Android SDK is installed and available?'));
        }
    }).then(function (avds) {
        // In case we're missing the Android OS version string from the target description, add it.
        return avds.map(function (avd) {
            if (avd.target && avd.target.indexOf('Android API') > -1 && avd.target.indexOf('API level') < 0) {
                var api_level = avd.target.match(/\d+/);
                if (api_level) {
                    var level = android_versions.get(api_level);
                    if (level) {
                        avd.target = 'Android ' + level.semver + ' (API level ' + api_level + ')';
                    }
                }
            }
            return avd;
        });
    });
};

/**
 * Will return the closest avd to the projects target
 * or undefined if no avds exist.
 * Returns a promise.
 */
module.exports.best_image = function () {
    return this.list_images().then(function (images) {
        // Just return undefined if there is no images
        if (images.length === 0) return;

        var closest = 9999;
        var best = images[0];
        var project_target = parseInt(check_reqs.get_target().replace('android-', ''));
        for (var i in images) {
            var target = images[i].target;
            if (target && target.indexOf('API level') > -1) {
                var num = parseInt(target.split('(API level ')[1].replace(')', ''));
                if (num === project_target) {
                    return images[i];
                } else if (project_target - num < closest && project_target > num) {
                    closest = project_target - num;
                    best = images[i];
                }
            }
        }
        return best;
    });
};

exports.list_started = async () => {
    return (await Adb.devices())
        .filter(id => id.startsWith('emulator-'));
};

/*
 * Gets unused port for android emulator, between 5554 and 5584
 * Returns a promise.
 */
module.exports.get_available_port = function () {
    var self = this;

    return self.list_started().then(function (emulators) {
        for (var p = 5584; p >= 5554; p -= 2) {
            if (emulators.indexOf('emulator-' + p) === -1) {
                events.emit('verbose', 'Found available port: ' + p);
                return p;
            }
        }
        throw new CordovaError('Could not find an available avd port');
    });
};

/*
 * Starts an emulator with the given ID,
 * and returns the started ID of that emulator.
 * If no ID is given it will use the first image available,
 * if no image is available it will error out (maybe create one?).
 * If no boot timeout is given or the value is negative it will wait forever for
 * the emulator to boot
 *
 * Returns a promise.
 */
module.exports.start = function (emulator_ID, boot_timeout) {
    var self = this;

    return Promise.resolve().then(function () {
        if (emulator_ID) return Promise.resolve(emulator_ID);

        return self.best_image().then(function (best) {
            if (best && best.name) {
                events.emit('warn', 'No emulator specified, defaulting to ' + best.name);
                return best.name;
            }

            var androidCmd = check_reqs.getAbsoluteAndroidCmd();
            return Promise.reject(new CordovaError('No emulator images (avds) found.\n' +
                '1. Download desired System Image by running: ' + androidCmd + ' sdk\n' +
                '2. Create an AVD by running: ' + androidCmd + ' avd\n' +
                'HINT: For a faster emulator, use an Intel System Image and install the HAXM device driver\n'));
        });
    }).then(function (emulatorId) {
        return self.get_available_port().then(function (port) {
            // Figure out the directory the emulator binary runs in, and set the cwd to that directory.
            // Workaround for https://code.google.com/p/android/issues/detail?id=235461
            var emulator_dir = path.dirname(which.sync('emulator'));
            var args = ['-avd', emulatorId, '-port', port];
            // Don't wait for it to finish, since the emulator will probably keep running for a long time.
            execa('emulator', args, { stdio: 'inherit', detached: true, cwd: emulator_dir })
                .unref();

            // wait for emulator to start
            events.emit('log', 'Waiting for emulator to start...');
            return self.wait_for_emulator(port);
        });
    }).then(function (emulatorId) {
        if (!emulatorId) { return Promise.reject(new CordovaError('Failed to start emulator')); }

        // wait for emulator to boot up
        process.stdout.write('Waiting for emulator to boot (this may take a while)...');
        return self.wait_for_boot(emulatorId, boot_timeout).then(function (success) {
            if (success) {
                events.emit('log', 'BOOT COMPLETE');
                // unlock screen
                return Adb.shell(emulatorId, 'input keyevent 82').then(function () {
                    // return the new emulator id for the started emulators
                    return emulatorId;
                });
            } else {
                // We timed out waiting for the boot to happen
                return null;
            }
        });
    });
};

/*
 * Waits for an emulator to boot on a given port.
 * Returns this emulator's ID in a promise.
 */
module.exports.wait_for_emulator = function (port) {
    var self = this;
    return Promise.resolve().then(function () {
        var emulator_id = 'emulator-' + port;
        return Adb.shell(emulator_id, 'getprop dev.bootcomplete').then(function (output) {
            if (output.indexOf('1') >= 0) {
                return emulator_id;
            }
            return self.wait_for_emulator(port);
        }, function (error) {
            if ((error && error.message &&
            (error.message.indexOf('not found') > -1)) ||
            (error.message.indexOf('device offline') > -1) ||
            (error.message.indexOf('device still connecting') > -1) ||
            (error.message.indexOf('device still authorizing') > -1)) {
                // emulator not yet started, continue waiting
                return self.wait_for_emulator(port);
            } else {
                // something unexpected has happened
                throw error;
            }
        });
    });
};

/*
 * Waits for the core android process of the emulator to start. Returns a
 * promise that resolves to a boolean indicating success. Not specifying a
 * time_remaining or passing a negative value will cause it to wait forever
 */
module.exports.wait_for_boot = function (emulator_id, time_remaining) {
    var self = this;
    return Adb.shell(emulator_id, 'getprop sys.boot_completed').then(function (output) {
        if (output.match(/1/)) {
            return true;
        } else if (time_remaining === 0) {
            return false;
        } else {
            process.stdout.write('.');

            return new Promise(resolve => {
                const delay = time_remaining < CHECK_BOOTED_INTERVAL ? time_remaining : CHECK_BOOTED_INTERVAL;

                setTimeout(() => {
                    const updated_time = time_remaining >= 0 ? Math.max(time_remaining - CHECK_BOOTED_INTERVAL, 0) : time_remaining;
                    resolve(self.wait_for_boot(emulator_id, updated_time));
                }, delay);
            });
        }
    });
};
