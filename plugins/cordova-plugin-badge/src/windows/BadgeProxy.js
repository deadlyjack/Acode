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

var appData    = Windows.Storage.ApplicationData.current,
    CONFIG_KEY = 'APPBadgeConfigKey',
    BADGE_KEY  = 'cordova_badge_number';

/**
 * Clear the badge number.
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
 * Get the badge number.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.get = function (success, error) {
    var badge = appData.localSettings.values[BADGE_KEY];

    success(badge || 0);
};

/**
 * Set the badge number.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Int ]      badge   The badge number
 *
 * @return [ Void ]
 */
exports.set = function (success, error, args) {
    var notifications = Windows.UI.Notifications,
        badge         = args[0],
        type          = notifications.BadgeTemplateType.badgeNumber,
        xml           = notifications.BadgeUpdateManager.getTemplateContent(type),
        attrs         = xml.getElementsByTagName('badge'),
        notification  = new notifications.BadgeNotification(xml);

    attrs[0].setAttribute('value', badge);

    notifications.BadgeUpdateManager
        .createBadgeUpdaterForApplication()
        .update(notification);

    exports.saveBadge(badge);

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

    appData.localSettings.values[CONFIG_KEY] = json;
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
    var json   = appData.localSettings.values[CONFIG_KEY],
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
    appData.localSettings.values[BADGE_KEY] = badge;
};

cordova.commandProxy.add('Badge', exports);
