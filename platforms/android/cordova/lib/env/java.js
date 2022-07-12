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
const path = require('path');
const glob = require('fast-glob');
const { CordovaError, events } = require('cordova-common');
const utils = require('../utils');
const semver = require('semver');

/**
 * Will be set to true on successful ensureness.
 * If true, skips the expensive java checks.
 */
let javaIsEnsured = false;

const java = {
    /**
     * Gets the version from the javac executable.
     *
     * @returns {semver.SemVer}
     */
    getVersion: async () => {
        await java._ensure(process.env);

        // Java <= 8 writes version info to stderr, Java >= 9 to stdout
        let version = null;
        try {
            version = (await execa('javac', ['-version'], { all: true })).all;
        } catch (ex) {
            events.emit('verbose', ex.shortMessage);

            let msg =
            'Failed to run "javac -version", make sure that you have a JDK version 8 installed.\n' +
            'You can get it from the following location:\n' +
            'https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html';
            if (process.env.JAVA_HOME) {
                msg += '\n\n';
                msg += 'Your JAVA_HOME is invalid: ' + process.env.JAVA_HOME;
            }
            throw new CordovaError(msg);
        }

        return semver.coerce(version);
    },

    /**
     * Ensures that Java is installed. Will throw exception if not.
     * Will set JAVA_HOME and PATH environment variables.
     *
     * This function becomes a no-op if already ran previously.
     */
    _ensure: async (environment) => {
        if (javaIsEnsured) {
            return;
        }

        const javacPath = utils.forgivingWhichSync('javac');
        const hasJavaHome = !!environment.JAVA_HOME;
        if (hasJavaHome) {
            // Windows java installer doesn't add javac to PATH, nor set JAVA_HOME (ugh).
            if (!javacPath) {
                environment.PATH += path.delimiter + path.join(environment.JAVA_HOME, 'bin');
            }
        } else {
            if (javacPath) {
                // OS X has a command for finding JAVA_HOME.
                const find_java = '/usr/libexec/java_home';
                const default_java_error_msg = 'Failed to find \'JAVA_HOME\' environment variable. Try setting it manually.';
                if (fs.existsSync(find_java)) {
                    try {
                        environment.JAVA_HOME = (await execa(find_java)).stdout;
                    } catch (ex) {
                        events.emit('verbose', ex.shortMessage);
                        throw new CordovaError(default_java_error_msg);
                    }
                } else {
                    // See if we can derive it from javac's location.
                    var maybeJavaHome = path.dirname(path.dirname(javacPath));
                    if (fs.existsSync(path.join(maybeJavaHome, 'lib', 'tools.jar'))) {
                        environment.JAVA_HOME = maybeJavaHome;
                    } else {
                        throw new CordovaError(default_java_error_msg);
                    }
                }
            } else if (utils.isWindows()) {
                const baseDirs = [environment.ProgramFiles, environment['ProgramFiles(x86)']];
                const globOpts = { absolute: true, onlyDirectories: true };
                const flatMap = (arr, f) => [].concat(...arr.map(f));
                const jdkDir = flatMap(baseDirs, cwd => {
                    return glob.sync('java/jdk*', { cwd, ...globOpts });
                }
                )[0];

                if (jdkDir) {
                    environment.PATH += path.delimiter + path.join(jdkDir, 'bin');
                    environment.JAVA_HOME = path.normalize(jdkDir);
                }
            }
        }

        javaIsEnsured = true;
    }
};

module.exports = java;
