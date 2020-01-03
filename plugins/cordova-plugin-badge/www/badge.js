/*
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 */

var exec      = require('cordova/exec'),
    channel   = require('cordova/channel'),
    ua        = navigator.userAgent.toLowerCase(),
    isIOS     = ua.indexOf('ipad') > -1 || ua.indexOf('iphone') > -1,
    isMac     = ua.indexOf('macintosh') > -1,
    isWin     = window.Windows !== undefined,
    isAndroid = !isWin && ua.indexOf('android') > -1,
    isWinPC   = isWin && Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily.includes('Desktop'),
    isDesktop = isMac || isWinPC;

// Default settings
exports._config = { indicator: 'badge', autoClear: false };

/**
 * Clears the badge number.
 *
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.clear = function (callback, scope) {
    this.exec('clear', null, callback, scope);
};

/**
 * Sets the badge number.
 *
 * @param [ Int ]      badge    The new badge number.
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.set = function (badge, callback, scope) {
    var args = [parseInt(badge) || 0];

    this.requestPermission(function (granted) {
        if (granted) {
            this.exec('set', args, callback, scope);
        }
    }, this);
};

/**
 * Gets the badge of the app icon.
 *
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.get = function (callback, scope) {
    this.exec('get', null, callback, scope);
};

/**
 * Increases the badge number.
 *
 * @param [ Int ]      count    Number to add to the badge number.
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.increase = function (count, callback, scope) {
    this.get(function (badge) {
        this.set(badge + (count || 1), callback, scope);
    }, this);
};

/**
 * Decreases the badge number.
 *
 * @param [ Int ]      count    Number to substract to the badge number.
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.decrease = function (count, callback, scope) {
    this.get(function (badge) {
        this.set(Math.max(0, badge - (count || 1)), callback, scope);
    }, this);
};

/**
 * Check support to show badges.
 *
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.isSupported = function (callback, scope) {
    if (isAndroid) {
        this.exec('check', null, callback, scope);
    } else {
        this.createCallbackFn(callback, scope)(true);
    }
};

/**
 * Check permission to show badges.
 *
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.hasPermission = function (callback, scope) {
    if (isIOS) {
        this.exec('check', null, callback, scope);
    } else {
        this.createCallbackFn(callback, scope)(true);
    }
};

/**
 * Request permission to show badges.
 *
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.requestPermission = function (callback, scope) {
    if (isIOS) {
        this.exec('request', null, callback, scope);
    } else {
        this.createCallbackFn(callback, scope)(true);
    }
};

/**
 * Configures the plugin's platform options.
 *
 * @param [ Hash ] object Optional config settings.
 *
 * @return [ Hash ] The merged config settings.
 */
exports.configure = function (config) {
    this.mergeConfig(config);
    this.exec('save', this._config);

    return this._config;
};

/**
 * Merge the config values with the current ones.
 *
 * @param [ Hash ] object Optional config settings.
 *
 * @return [ Hash ] The merged config settings.
 */
exports.mergeConfig = function (config) {
    return Object.assign(this._config, config);
};

/**
 * Create callback, which will be executed within a specific scope.
 *
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Function ] The new callback function
 */
exports.createCallbackFn = function (callbackFn, scope) {
    if (typeof callbackFn != 'function')
        return;

    return function () {
        callbackFn.apply(scope || this, arguments);
    };
};

/**
 * Clear the badge if autoClear is on and the indicator type is badge.
 *
 * @return [ Void ]
 */
exports.clearIf = function () {
    if (this._config.autoClear && this._config.indicator == 'badge') {
        this.clear();
    }
};

/**
 * Execute the native counterpart.
 *
 * @param [ String ] action     The name of the action to execute.
 * @param [ Array ]  args       Array of arguments to pass with.
 * @param [ Function ] callback The callback function to be execute later.
 * @param [ Function ] scope    Optional scope for the callback function.
 *
 * @return [ Void ]
 */
exports.exec = function (action, args, callback, scope) {
    var fn     = this.createCallbackFn(callback, scope),
        params = [];

    if (Array.isArray(args)) {
        params = args;
    } else if (args) {
        params.push(args);
    }

    exec(fn, null, 'Badge', action, params);
};

// Clear badge on app start if autoClear is set to true
channel.onCordovaReady.subscribe(function () {
    exports.exec('load', null, function (config) {
        this.mergeConfig(config);
        this.clearIf();
    }, exports);
});

// Clear badge on app resume if autoClear is set to true
channel.onResume.subscribe(function () {
    exports.clearIf();
});

// Clear badge on app resume if autoClear is set to true
channel.onActivated.subscribe(function () {
    exports.clearIf();
});

if (isDesktop) {
    // Clear badge on app resume if autoClear is set to true
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { exports.clearIf(); }
    }, false);

    // Clear badge on app resume if autoClear is set to true
    window.addEventListener('focus', function () {
        exports.clearIf();
    }, false);
}

// Polyfill for Object.assign
if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}
