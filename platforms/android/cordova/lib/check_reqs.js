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
var path = require('path');
var fs = require('fs-extra');
const { forgivingWhichSync, isWindows, isDarwin } = require('./utils');
const java = require('./env/java');
var REPO_ROOT = path.join(__dirname, '..', '..', '..', '..');
var PROJECT_ROOT = path.join(__dirname, '..', '..');
const { CordovaError, ConfigParser, events } = require('cordova-common');
var android_sdk = require('./android_sdk');
const { createEditor } = require('properties-parser');
const semver = require('semver');

const EXPECTED_JAVA_VERSION = '1.8.x';

// Re-exporting these for backwards compatibility and for unit testing.
// TODO: Remove uses and use the ./utils module directly.
Object.assign(module.exports, { isWindows, isDarwin });

/**
 * @description Get valid target from framework/project.properties if run from this repo
 *              Otherwise get target from project.properties file within a generated cordova-android project
 * @returns {string} The android target in format "android-${target}"
 */
module.exports.get_target = function () {
    const projectPropertiesPaths = [
        path.join(REPO_ROOT, 'framework', 'project.properties'),
        path.join(PROJECT_ROOT, 'project.properties')
    ];

    // Get the minimum required target API from the framework.
    let target = projectPropertiesPaths.filter(filePath => fs.existsSync(filePath))
        .map(filePath => createEditor(filePath).get('target'))
        .pop();

    if (!target) {
        throw new Error(`We could not locate the target from the "project.properties" at either "${projectPropertiesPaths.join('", "')}".`);
    }

    // If the repo config.xml file exists, find the desired targetSdkVersion.
    const configFile = path.join(REPO_ROOT, 'config.xml');
    if (!fs.existsSync(configFile)) return target;

    const configParser = new ConfigParser(configFile);
    const desiredAPI = parseInt(configParser.getPreference('android-targetSdkVersion', 'android'), 10);

    if (!isNaN(desiredAPI)) {
        const minimumAPI = parseInt(target.split('-').pop(), 10);

        if (desiredAPI >= minimumAPI) {
            target = `android-${desiredAPI}`;
        } else {
            events.emit('warn', `android-targetSdkVersion should be greater than or equal to ${minimumAPI}.`);
        }
    }

    return target;
};

module.exports.get_gradle_wrapper = function () {
    var androidStudioPath;
    var i = 0;
    var foundStudio = false;
    var program_dir;
    // OK, This hack only works on Windows, not on Mac OS or Linux.  We will be deleting this eventually!
    if (module.exports.isWindows()) {
        var result = execa.sync(path.join(__dirname, 'getASPath.bat'));
        // console.log('result.stdout =' + result.stdout.toString());
        // console.log('result.stderr =' + result.stderr.toString());

        if (result.stderr.toString().length > 0) {
            var androidPath = path.join(process.env.ProgramFiles, 'Android') + '/';
            if (fs.existsSync(androidPath)) {
                program_dir = fs.readdirSync(androidPath);
                while (i < program_dir.length && !foundStudio) {
                    if (program_dir[i].startsWith('Android Studio')) {
                        foundStudio = true;
                        androidStudioPath = path.join(process.env.ProgramFiles, 'Android', program_dir[i], 'gradle');
                    } else { ++i; }
                }
            }
        } else {
            // console.log('got android studio path from registry');
            // remove the (os independent) new line char at the end of stdout
            // add gradle to match the above.
            androidStudioPath = path.join(result.stdout.toString().split('\r\n')[0], 'gradle');
        }
    }

    if (androidStudioPath !== null && fs.existsSync(androidStudioPath)) {
        var dirs = fs.readdirSync(androidStudioPath);
        if (dirs[0].split('-')[0] === 'gradle') {
            return path.join(androidStudioPath, dirs[0], 'bin', 'gradle');
        }
    } else {
        // OK, let's try to check for Gradle!
        return forgivingWhichSync('gradle');
    }
};

// Returns a promise. Called only by build and clean commands.
module.exports.check_gradle = function () {
    var sdkDir = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
    if (!sdkDir) {
        return Promise.reject(new CordovaError('Could not find gradle wrapper within Android SDK. Could not find Android SDK directory.\n' +
            'Might need to install Android SDK or set up \'ANDROID_SDK_ROOT\' env variable.'));
    }

    var gradlePath = module.exports.get_gradle_wrapper();

    if (gradlePath.length !== 0) return Promise.resolve(gradlePath);

    return Promise.reject(new CordovaError('Could not find an installed version of Gradle either in Android Studio,\n' +
                            'or on your system to install the gradle wrapper. Please include gradle \n' +
                            'in your path, or install Android Studio'));
};

/**
 * Checks for the java installation and correct version
 *
 * Despite the name, it should return the Java version value, it's used by the Cordova CLI.
 */
module.exports.check_java = async function () {
    const javaVersion = await java.getVersion();

    if (!semver.satisfies(javaVersion.version, EXPECTED_JAVA_VERSION)) {
        throw new CordovaError(
            `Requirements check failed for JDK ${EXPECTED_JAVA_VERSION}! Detected version: ${javaVersion.version}\n` +
            'Check your ANDROID_SDK_ROOT / JAVA_HOME / PATH environment variables.'
        );
    }

    return javaVersion;
};

// Returns a promise.
module.exports.check_android = function () {
    return Promise.resolve().then(function () {
        function maybeSetAndroidHome (value) {
            if (!hasAndroidHome && fs.existsSync(value)) {
                hasAndroidHome = true;
                process.env.ANDROID_SDK_ROOT = value;
            }
        }

        var androidCmdPath = forgivingWhichSync('android');
        var adbInPath = forgivingWhichSync('adb');
        var avdmanagerInPath = forgivingWhichSync('avdmanager');
        var hasAndroidHome = false;

        if (process.env.ANDROID_SDK_ROOT) {
            maybeSetAndroidHome(path.resolve(process.env.ANDROID_SDK_ROOT));
        }

        // First ensure ANDROID_HOME is set
        // If we have no hints (nothing in PATH), try a few default locations
        if (!hasAndroidHome && !androidCmdPath && !adbInPath && !avdmanagerInPath) {
            if (process.env.ANDROID_HOME) {
                // Fallback to deprecated `ANDROID_HOME` variable
                maybeSetAndroidHome(path.join(process.env.ANDROID_HOME));
            }
            if (module.exports.isWindows()) {
                // Android Studio 1.0 installer
                if (process.env.LOCALAPPDATA) {
                    maybeSetAndroidHome(path.join(process.env.LOCALAPPDATA, 'Android', 'sdk'));
                }
                if (process.env.ProgramFiles) {
                    maybeSetAndroidHome(path.join(process.env.ProgramFiles, 'Android', 'sdk'));
                }

                // Android Studio pre-1.0 installer
                if (process.env.LOCALAPPDATA) {
                    maybeSetAndroidHome(path.join(process.env.LOCALAPPDATA, 'Android', 'android-studio', 'sdk'));
                }
                if (process.env.ProgramFiles) {
                    maybeSetAndroidHome(path.join(process.env.ProgramFiles, 'Android', 'android-studio', 'sdk'));
                }

                // Stand-alone installer
                if (process.env.LOCALAPPDATA) {
                    maybeSetAndroidHome(path.join(process.env.LOCALAPPDATA, 'Android', 'android-sdk'));
                }
                if (process.env.ProgramFiles) {
                    maybeSetAndroidHome(path.join(process.env.ProgramFiles, 'Android', 'android-sdk'));
                }
            } else if (module.exports.isDarwin()) {
                // Android Studio 1.0 installer
                if (process.env.HOME) {
                    maybeSetAndroidHome(path.join(process.env.HOME, 'Library', 'Android', 'sdk'));
                }
                // Android Studio pre-1.0 installer
                maybeSetAndroidHome('/Applications/Android Studio.app/sdk');
                // Stand-alone zip file that user might think to put under /Applications
                maybeSetAndroidHome('/Applications/android-sdk-macosx');
                maybeSetAndroidHome('/Applications/android-sdk');
            }
            if (process.env.HOME) {
                // Stand-alone zip file that user might think to put under their home directory
                maybeSetAndroidHome(path.join(process.env.HOME, 'android-sdk-macosx'));
                maybeSetAndroidHome(path.join(process.env.HOME, 'android-sdk'));
            }
        }

        if (!hasAndroidHome) {
            // If we dont have ANDROID_SDK_ROOT, but we do have some tools on the PATH, try to infer from the tooling PATH.
            var parentDir, grandParentDir;
            if (androidCmdPath) {
                parentDir = path.dirname(androidCmdPath);
                grandParentDir = path.dirname(parentDir);
                if (path.basename(parentDir) === 'tools' || fs.existsSync(path.join(grandParentDir, 'tools', 'android'))) {
                    maybeSetAndroidHome(grandParentDir);
                } else {
                    throw new CordovaError('Failed to find \'ANDROID_SDK_ROOT\' environment variable. Try setting it manually.\n' +
                        'Detected \'android\' command at ' + parentDir + ' but no \'tools\' directory found near.\n' +
                        'Try reinstall Android SDK or update your PATH to include valid path to SDK' + path.sep + 'tools directory.');
                }
            }
            if (adbInPath) {
                parentDir = path.dirname(adbInPath);
                grandParentDir = path.dirname(parentDir);
                if (path.basename(parentDir) === 'platform-tools') {
                    maybeSetAndroidHome(grandParentDir);
                } else {
                    throw new CordovaError('Failed to find \'ANDROID_SDK_ROOT\' environment variable. Try setting it manually.\n' +
                        'Detected \'adb\' command at ' + parentDir + ' but no \'platform-tools\' directory found near.\n' +
                        'Try reinstall Android SDK or update your PATH to include valid path to SDK' + path.sep + 'platform-tools directory.');
                }
            }
            if (avdmanagerInPath) {
                parentDir = path.dirname(avdmanagerInPath);
                grandParentDir = path.dirname(parentDir);
                if (path.basename(parentDir) === 'bin' && path.basename(grandParentDir) === 'tools') {
                    maybeSetAndroidHome(path.dirname(grandParentDir));
                } else {
                    throw new CordovaError('Failed to find \'ANDROID_SDK_ROOT\' environment variable. Try setting it manually.\n' +
                        'Detected \'avdmanager\' command at ' + parentDir + ' but no \'tools' + path.sep + 'bin\' directory found near.\n' +
                        'Try reinstall Android SDK or update your PATH to include valid path to SDK' + path.sep + 'tools' + path.sep + 'bin directory.');
                }
            }
        }
        if (!process.env.ANDROID_SDK_ROOT) {
            throw new CordovaError('Failed to find \'ANDROID_SDK_ROOT\' environment variable. Try setting it manually.\n' +
                'Failed to find \'android\' command in your \'PATH\'. Try update your \'PATH\' to include path to valid SDK directory.');
        }
        if (!fs.existsSync(process.env.ANDROID_SDK_ROOT)) {
            throw new CordovaError('\'ANDROID_SDK_ROOT\' environment variable is set to non-existent path: ' + process.env.ANDROID_SDK_ROOT +
                '\nTry update it manually to point to valid SDK directory.');
        }
        // Next let's make sure relevant parts of the SDK tooling is in our PATH
        if (hasAndroidHome && !androidCmdPath) {
            process.env.PATH += path.delimiter + path.join(process.env.ANDROID_SDK_ROOT, 'tools');
        }
        if (hasAndroidHome && !adbInPath) {
            process.env.PATH += path.delimiter + path.join(process.env.ANDROID_SDK_ROOT, 'platform-tools');
        }
        if (hasAndroidHome && !avdmanagerInPath) {
            process.env.PATH += path.delimiter + path.join(process.env.ANDROID_SDK_ROOT, 'tools', 'bin');
        }
        return hasAndroidHome;
    });
};

// TODO: is this actually needed?
module.exports.getAbsoluteAndroidCmd = function () {
    var cmd = forgivingWhichSync('android');
    if (cmd.length === 0) {
        cmd = forgivingWhichSync('sdkmanager');
    }
    if (module.exports.isWindows()) {
        return '"' + cmd + '"';
    }
    return cmd.replace(/(\s)/g, '\\$1');
};

module.exports.check_android_target = function (originalError) {
    // valid_target can look like:
    //   android-19
    //   android-L
    //   Google Inc.:Google APIs:20
    //   Google Inc.:Glass Development Kit Preview:20
    var desired_api_level = module.exports.get_target();
    return android_sdk.list_targets().then(function (targets) {
        if (targets.indexOf(desired_api_level) >= 0) {
            return targets;
        }
        var androidCmd = module.exports.getAbsoluteAndroidCmd();
        var msg = 'Please install Android target / API level: "' + desired_api_level + '".\n\n' +
            'Hint: Open the SDK manager by running: ' + androidCmd + '\n' +
            'You will require:\n' +
            '1. "SDK Platform" for API level ' + desired_api_level + '\n' +
            '2. "Android SDK Platform-tools (latest)\n' +
            '3. "Android SDK Build-tools" (latest)';
        if (originalError) {
            msg = originalError + '\n' + msg;
        }
        throw new CordovaError(msg);
    });
};

// Returns a promise.
module.exports.run = function () {
    console.log('Checking Java JDK and Android SDK versions');
    console.log('ANDROID_SDK_ROOT=' + process.env.ANDROID_SDK_ROOT + ' (recommended setting)');
    console.log('ANDROID_HOME=' + process.env.ANDROID_HOME + ' (DEPRECATED)');

    return Promise.all([this.check_java(), this.check_android()]).then(function (values) {
        console.log('Using Android SDK: ' + process.env.ANDROID_SDK_ROOT);

        if (!values[1]) {
            throw new CordovaError('Requirements check failed for Android SDK! Android SDK was not detected.');
        }
    });
};

/**
 * Object thar represents one of requirements for current platform.
 * @param {String} id         The unique identifier for this requirements.
 * @param {String} name       The name of requirements. Human-readable field.
 * @param {String} version    The version of requirement installed. In some cases could be an array of strings
 *                            (for example, check_android_target returns an array of android targets installed)
 * @param {Boolean} installed Indicates whether the requirement is installed or not
 */
var Requirement = function (id, name, version, installed) {
    this.id = id;
    this.name = name;
    this.installed = installed || false;
    this.metadata = {
        version: version
    };
};

/**
 * Methods that runs all checks one by one and returns a result of checks
 * as an array of Requirement objects. This method intended to be used by cordova-lib check_reqs method
 *
 * @return Promise<Requirement[]> Array of requirements. Due to implementation, promise is always fulfilled.
 */
module.exports.check_all = function () {
    var requirements = [
        new Requirement('java', 'Java JDK'),
        new Requirement('androidSdk', 'Android SDK'),
        new Requirement('androidTarget', 'Android target'),
        new Requirement('gradle', 'Gradle')
    ];

    var checkFns = [
        this.check_java,
        this.check_android,
        this.check_android_target,
        this.check_gradle
    ];

    // Then execute requirement checks one-by-one
    return checkFns.reduce(function (promise, checkFn, idx) {
        // Update each requirement with results
        var requirement = requirements[idx];
        return promise.then(checkFn).then(function (version) {
            requirement.installed = true;
            requirement.metadata.version = version;
        }, function (err) {
            requirement.metadata.reason = err instanceof Error ? err.message : err;
        });
    }, Promise.resolve()).then(function () {
        // When chain is completed, return requirements array to upstream API
        return requirements;
    });
};
