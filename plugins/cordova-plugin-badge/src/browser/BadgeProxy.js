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

// Instance of the Favico.js libary
exports.favico = new cordova.plugins.notification.badge.Favico({
    animation: 'none'
});

// Holds the current badge number
var BADGE_KEY  = 'cordova_badge_number';
// Holds the saved badge config
var CONFIG_KEY = 'APPBadgeConfigKey';

/**
 * Clears the badge of the app icon.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.clear = function (success, error) {
    exports.set(success, error, [0]);
};

/**
 * Gets the badge of the app icon.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.get = function (success, error) {
    var badge = localStorage[BADGE_KEY];

    success(badge || 0);
};

/**
 * Sets the badge of the app icon.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Int ]      badge   The badge number
 *
 * @return [ Void ]
 */
exports.set = function (success, error, args) {
    var badge = args[0];

    exports.saveBadge(badge);
    exports.favico.badge(badge);

    success(badge);
};

/**
 * Save the badge config.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Int ]      config  The config map
 *
 * @return [ Void ]
 */
exports.save = function (success, error, args) {
    var config = args[0] || null,
        json   = JSON.stringify(config);

    localStorage[CONFIG_KEY] = json;
};

/**
 * Load the badge config.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.load = function (success, error) {
    var json   = localStorage[CONFIG_KEY],
        config = JSON.parse(json || null);

    success(config);
};

/**
 * Persist the badge of the app icon so that `getBadge` is able to return the
 * badge number back to the client.
 *
 * @param [ Int ] badge The badge number
 *
 * @return [ Void ]
 */
exports.saveBadge = function (badge) {
    localStorage[BADGE_KEY] = badge;
};

cordova.commandProxy.add('Badge', exports);
