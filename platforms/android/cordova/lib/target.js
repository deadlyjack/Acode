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

const path = require('path');
const { inspect } = require('util');
const Adb = require('./Adb');
const build = require('./build');
const emulator = require('./emulator');
const AndroidManifest = require('./AndroidManifest');
const { compareBy } = require('./utils');
const { retryPromise } = require('./retry');
const { events, CordovaError } = require('cordova-common');

const INSTALL_COMMAND_TIMEOUT = 5 * 60 * 1000;
const NUM_INSTALL_RETRIES = 3;
const EXEC_KILL_SIGNAL = 'SIGKILL';

/**
 * @typedef { 'device' | 'emulator' } TargetType
 * @typedef { { id: string, type: TargetType } } Target
 * @typedef { { id?: string, type?: TargetType } } TargetSpec
 */

/**
 * Returns a list of available targets (connected devices & started emulators)
 *
 * @return {Promise<Target[]>}
 */
exports.list = async () => {
    return (await Adb.devices())
        .map(id => ({
            id,
            type: id.startsWith('emulator-') ? 'emulator' : 'device'
        }));
};

/**
 * @param {TargetSpec?} spec
 * @return {Promise<Target>}
 */
async function resolveToOnlineTarget (spec = {}) {
    const targetList = await exports.list();
    if (targetList.length === 0) return null;

    // Sort by type: devices first, then emulators.
    targetList.sort(compareBy(t => t.type));

    // Find first matching target for spec. {} matches any target.
    return targetList.find(target =>
        Object.keys(spec).every(k => spec[k] === target[k])
    ) || null;
}

async function isEmulatorName (name) {
    const emus = await emulator.list_images();
    return emus.some(avd => avd.name === name);
}

/**
 * @param {TargetSpec?} spec
 * @return {Promise<Target>}
 */
async function resolveToOfflineEmulator (spec = {}) {
    if (spec.type === 'device') return null;
    if (spec.id && !(await isEmulatorName(spec.id))) return null;

    // try to start an emulator with name spec.id
    // if spec.id is undefined, picks best match regarding target API
    const emulatorId = await emulator.start(spec.id);

    return { id: emulatorId, type: 'emulator' };
}

/**
 * @param {TargetSpec?} spec
 * @return {Promise<Target & {arch: string}>}
 */
exports.resolve = async (spec = {}) => {
    events.emit('verbose', `Trying to find target matching ${inspect(spec)}`);

    const resolvedTarget =
        (await resolveToOnlineTarget(spec)) ||
        (await resolveToOfflineEmulator(spec));

    if (!resolvedTarget) {
        throw new CordovaError(`Could not find target matching ${inspect(spec)}`);
    }

    return {
        ...resolvedTarget,
        arch: await build.detectArchitecture(resolvedTarget.id)
    };
};

exports.install = async function ({ id: target, arch, type }, buildResults) {
    const apk_path = build.findBestApkForArchitecture(buildResults, arch);
    const manifest = new AndroidManifest(path.join(__dirname, '../../app/src/main/AndroidManifest.xml'));
    const pkgName = manifest.getPackageId();
    const launchName = pkgName + '/.' + manifest.getActivity().getName();

    events.emit('log', 'Using apk: ' + apk_path);
    events.emit('log', 'Package name: ' + pkgName);
    events.emit('verbose', `Installing app on target ${target}`);

    async function doInstall (execOptions = {}) {
        try {
            await Adb.install(target, apk_path, { replace: true, execOptions });
        } catch (error) {
            // CB-9557 CB-10157 only uninstall and reinstall app if the one that
            // is already installed on device was signed w/different certificate
            if (!/INSTALL_PARSE_FAILED_INCONSISTENT_CERTIFICATES/.test(error.toString())) throw error;

            events.emit('warn', 'Uninstalling app from device and reinstalling it again because the ' +
                'installed app already signed with different key');

            // This promise is always resolved, even if 'adb uninstall' fails to uninstall app
            // or the app doesn't installed at all, so no error catching needed.
            await Adb.uninstall(target, pkgName);
            await Adb.install(target, apk_path, { replace: true });
        }
    }

    if (type === 'emulator') {
        // Work around sporadic emulator hangs: http://issues.apache.org/jira/browse/CB-9119
        await retryPromise(NUM_INSTALL_RETRIES, () => doInstall({
            timeout: INSTALL_COMMAND_TIMEOUT,
            killSignal: EXEC_KILL_SIGNAL
        }));
    } else {
        await doInstall();
    }
    events.emit('log', 'INSTALL SUCCESS');

    events.emit('verbose', 'Unlocking screen...');
    await Adb.shell(target, 'input keyevent 82');

    await Adb.start(target, launchName);
    events.emit('log', 'LAUNCH SUCCESS');
};
