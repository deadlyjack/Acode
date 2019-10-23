/**
 * Copyright (c) 2015 Rareloop Ltd
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var exec = require('cordova/exec');
var channel = require('cordova/channel');
var utils = require('cordova/utils');

channel.createSticky('onCordovaAppVersionReady');
// Wait on the onCordovaAppVersionReady event
channel.waitForInitialization('onCordovaAppVersionReady');

/**
 * Object representing the app's native version and build number
 * @constructor
 */
var RareloopAppVersion = function () {
    this.version = null;
    this.build = null;
    this.available = false;

    var _this = this;

    channel.onCordovaReady.subscribe(function() {
        _this.getInfo(function(info) {
            _this.available = true;

            _this.version = info.version;
            _this.build = parseInt(info.build, 10);

            channel.onCordovaAppVersionReady.fire();
        },function(e) {
            _this.available = false;
            utils.alert("[ERROR] Error initializing Version Plugin: " + e);
        });
    });
};

/**
 * Get the app version
 *
 * @param {Function} successCallback The function to call when the heading data is available
 * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
 */
RareloopAppVersion.prototype.getInfo = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "RareloopAppVersion", "getAppVersion", []);
};

// Export the module
module.exports = new RareloopAppVersion();
