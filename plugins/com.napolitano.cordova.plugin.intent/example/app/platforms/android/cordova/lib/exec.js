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

var child_process = require("child_process");
var Q             = require("q");

// constants
var DEFAULT_MAX_BUFFER = 1024000;

// Takes a command and optional current working directory.
// Returns a promise that either resolves with the stdout, or
// rejects with an error message and the stderr.
//
// WARNING:
//         opt_cwd is an artifact of an old design, and must
//         be removed in the future; the correct solution is
//         to pass the options object the same way that
//         child_process.exec expects
//
// NOTE:
//      exec documented here - https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
module.exports = function(cmd, opt_cwd, options) {

    var d = Q.defer();

    if (typeof options === "undefined") {
        options = {};
    }

    // override cwd to preserve old opt_cwd behavior
    options.cwd = opt_cwd;

    // set maxBuffer
    if (typeof options.maxBuffer === "undefined") {
        options.maxBuffer = DEFAULT_MAX_BUFFER;
    }

    try {
        child_process.exec(cmd, options, function(err, stdout, stderr) {
            if (err) d.reject("Error executing \"" + cmd + "\": " + stderr);
            else d.resolve(stdout);
        });
    } catch(e) {
        console.error("error caught: " + e);
        d.reject(e);
    }

    return d.promise;
};

