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

var path = require('path');
var emulator = require('./emulator');
const target = require('./target');
var PackageType = require('./PackageType');
const { events } = require('cordova-common');

/**
 * Builds a target spec from a runOptions object
 *
 * @param {{target?: string, device?: boolean, emulator?: boolean}} runOptions
 * @return {target.TargetSpec}
 */
function buildTargetSpec (runOptions) {
    const spec = {};
    if (runOptions.target) {
        spec.id = runOptions.target;
    } else if (runOptions.device) {
        spec.type = 'device';
    } else if (runOptions.emulator) {
        spec.type = 'emulator';
    }
    return spec;
}

function formatResolvedTarget ({ id, type }) {
    return `${type} ${id}`;
}

/**
 * Runs the application on a device if available. If no device is found, it will
 *   use a started emulator. If no started emulators are found it will attempt
 *   to start an avd. If no avds are found it will error out.
 *
 * @param   {Object}  runOptions  various run/build options. See Api.js build/run
 *   methods for reference.
 *
 * @return  {Promise}
 */
module.exports.run = function (runOptions) {
    runOptions = runOptions || {};

    var self = this;
    const spec = buildTargetSpec(runOptions);

    return target.resolve(spec).then(function (resolvedTarget) {
        events.emit('log', `Deploying to ${formatResolvedTarget(resolvedTarget)}`);

        return new Promise((resolve) => {
            const buildOptions = require('./build').parseBuildOptions(runOptions, null, self.root);

            // Android app bundles cannot be deployed directly to the device
            if (buildOptions.packageType === PackageType.BUNDLE) {
                const packageTypeErrorMessage = 'Package type "bundle" is not supported during cordova run.';
                events.emit('error', packageTypeErrorMessage);
                throw packageTypeErrorMessage;
            }

            resolve(self._builder.fetchBuildResults(buildOptions.buildType, buildOptions.arch));
        }).then(async function (buildResults) {
            if (resolvedTarget.type === 'emulator') {
                await emulator.wait_for_boot(resolvedTarget.id);
            }

            return target.install(resolvedTarget, buildResults);
        });
    });
};

module.exports.help = function () {
    console.log('Usage: ' + path.relative(process.cwd(), process.argv[1]) + ' [options]');
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
