/**
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

var os = require('os');
var execa = require('execa');
var events = require('cordova-common').events;
var CordovaError = require('cordova-common').CordovaError;

var Adb = {};

/**
 * Lists available/connected devices and emulators
 *
 * @return  {Promise<String[]>}        list of available/connected
 *   devices/emulators
 */
Adb.devices = async function () {
    const { stdout } = await execa('adb', ['devices'], { cwd: os.tmpdir() });

    // Split into lines & drop first one (header)
    const rawDeviceLines = stdout.trim().split(/\r?\n/).slice(1);

    return rawDeviceLines
        .map(line => line.split('\t'))

        // We are only interested in fully booted devices & emulators. These
        // have a state of `device`. For a list of all the other possible states
        // see https://github.com/aosp-mirror/platform_system_core/blob/2abdb1eb5b83c8f39874644af576c869815f5c5b/adb/transport.cpp#L1129
        .filter(([, state]) => state === 'device')

        .map(([id]) => id);
};

Adb.install = function (target, packagePath, { replace = false, execOptions = {} } = {}) {
    events.emit('verbose', 'Installing apk ' + packagePath + ' on target ' + target + '...');

    var args = ['-s', target, 'install'];
    if (replace) args.push('-r');

    const opts = { cwd: os.tmpdir(), ...execOptions };

    return execa('adb', args.concat(packagePath), opts).then(({ stdout: output }) => {
        // adb does not return an error code even if installation fails. Instead it puts a specific
        // message to stdout, so we have to use RegExp matching to detect installation failure.
        if (output.match(/Failure/)) {
            if (output.match(/INSTALL_PARSE_FAILED_NO_CERTIFICATES/)) {
                output += '\n\n' + 'Sign the build using \'-- --keystore\' or \'--buildConfig\'' +
                    ' or sign and deploy the unsigned apk manually using Android tools.';
            } else if (output.match(/INSTALL_FAILED_VERSION_DOWNGRADE/)) {
                output += '\n\n' + 'You\'re trying to install apk with a lower versionCode that is already installed.' +
                    '\nEither uninstall an app or increment the versionCode.';
            }

            throw new CordovaError('Failed to install apk to target: ' + output);
        }
    });
};

Adb.uninstall = function (target, packageId) {
    events.emit('verbose', 'Uninstalling package ' + packageId + ' from target ' + target + '...');
    return execa('adb', ['-s', target, 'uninstall', packageId], { cwd: os.tmpdir() }).then(({ stdout }) => stdout);
};

Adb.shell = function (target, shellCommand) {
    events.emit('verbose', 'Running adb shell command "' + shellCommand + '" on target ' + target + '...');
    var args = ['-s', target, 'shell'];
    shellCommand = shellCommand.split(/\s+/);
    return execa('adb', args.concat(shellCommand), { cwd: os.tmpdir() })
        .then(({ stdout }) => stdout)
        .catch(error => Promise.reject(new CordovaError(`Failed to execute shell command "${shellCommand}" on device: ${error}`)));
};

Adb.start = function (target, activityName) {
    events.emit('verbose', 'Starting application "' + activityName + '" on target ' + target + '...');
    return Adb.shell(target, 'am start -W -a android.intent.action.MAIN -n' + activityName).catch((error) => {
        return Promise.reject(new CordovaError('Failed to start application "' +
            activityName + '"" on device: ' + error));
    });
};

module.exports = Adb;
