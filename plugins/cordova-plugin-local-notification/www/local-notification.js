/*
 * Apache 2.0 License
 *
 * Copyright (c) Sebastian Katzer 2017
 *
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

/**
 * Request permission to show notifications.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.hasPermission = function (callback, scope) {
    this.core.hasPermission(callback, scope);
};

/**
 * Request permission to show notifications.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.requestPermission = function (callback, scope) {
    this.core.requestPermission(callback, scope);
};

/**
 * Schedule notifications.
 *
 * @param [ Array ]    notifications The notifications to schedule.
 * @param [ Function ] callback      The function to be exec as the callback.
 * @param [ Object ]   scope         The callback function's scope.
 * @param [ Object ]   args          Optional flags how to schedule.
 *
 * @return [ Void ]
 */
exports.schedule = function (notifications, callback, scope, args) {
    this.core.schedule(notifications, callback, scope, args);
};

/**
 * Update notifications.
 *
 * @param [ Array ]    notifications The notifications to schedule.
 * @param [ Function ] callback      The function to be exec as the callback.
 * @param [ Object ]   scope         The callback function's scope.
 * @param [ Object ]   args          Optional flags how to schedule.
 *
 * @return [ Void ]
 */
exports.update = function (notifications, callback, scope, args) {
    this.core.update(notifications, callback, scope, args);
};

/**
 * Clear the specified notifications by id.
 *
 * @param [ Array<Int> ] ids      The IDs of the notifications.
 * @param [ Function ]   callback The function to be exec as the callback.
 * @param [ Object ]     scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.clear = function (ids, callback, scope) {
    this.core.clear(ids, callback, scope);
};

/**
 * Clear all triggered notifications.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.clearAll = function (callback, scope) {
    this.core.clearAll(callback, scope);
};

/**
 * Cancel the specified notifications by id.
 *
 * @param [ Array<Int> ] ids      The IDs of the notifications.
 * @param [ Function ]   callback The function to be exec as the callback.
 * @param [ Object ]     scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.cancel = function (ids, callback, scope) {
    this.core.cancel(ids, callback, scope);
};

/**
 * Cancel all scheduled notifications.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.cancelAll = function (callback, scope) {
    this.core.cancelAll(callback, scope);
};

/**
 * Check if a notification is present.
 *
 * @param [ Int ]      id       The ID of the notification.
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.isPresent = function (id, callback, scope) {
    this.core.isPresent(id, callback, scope);
};

/**
 * Check if a notification is scheduled.
 *
 * @param [ Int ]      id       The ID of the notification.
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.isScheduled = function (id, callback, scope) {
    this.core.hasType(id, 'scheduled', callback, scope);
};

/**
 * Check if a notification was triggered.
 *
 * @param [ Int ]      id       The ID of the notification.
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.isTriggered = function (id, callback, scope) {
    this.core.hasType(id, 'triggered', callback, scope);
};

/**
 * Get the type (triggered, scheduled) for the notification.
 *
 * @param [ Int ]      id       The ID of the notification.
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.getType = function (id, callback, scope) {
    this.core.getType(id, callback, scope);
};

/**
 * List of all notification ids.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.getIds = function (callback, scope) {
    this.core.getIds(callback, scope);
};

/**
 * List of all scheduled notification IDs.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.getScheduledIds = function (callback, scope) {
    this.core.getScheduledIds(callback, scope);
};

/**
 * List of all triggered notification IDs.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.getTriggeredIds = function (callback, scope) {
    this.core.getTriggeredIds(callback, scope);
};

/**
 * List of local notifications specified by id.
 * If called without IDs, all notification will be returned.
 *
 * @param [ Array<Int> ] ids      The IDs of the notifications.
 * @param [ Function ]   callback The function to be exec as the callback.
 * @param [ Object ]     scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.get = function (ids, callback, scope) {
    this.core.get(ids, callback, scope);
};

/**
 * List for all notifications.
 *
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.getAll = function (callback, scope) {
    this.core.getAll(callback, scope);
};

/**
 * List of all scheduled notifications.
 *
 * @param [ Function ]   callback The function to be exec as the callback.
 * @param [ Object ]     scope    The callback function's scope.
 */
exports.getScheduled = function (callback, scope) {
    this.core.getScheduled(callback, scope);
};

/**
 * List of all triggered notifications.
 *
 * @param [ Function ]   callback The function to be exec as the callback.
 * @param [ Object ]     scope    The callback function's scope.
 */
exports.getTriggered = function (callback, scope) {
    this.core.getTriggered(callback, scope);
};

/**
 * Register an group of actions by id.
 *
 * @param [ String ]   id       The Id of the group.
 * @param [ Array]     actions  The action config settings.
 * @param [ Function ] callback The function to be exec as the callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.addActionGroup = function (id, actions, callback, scope) {
    this.core.addActionGroup(id, actions, callback, scope);
};

/**
 * The (platform specific) default settings.
 *
 * @return [ Object ]
 */
exports.getDefaults = function () {
    return this.core.getDefaults();
};

/**
 * Overwrite default settings.
 *
 * @param [ Object ] newDefaults New default values.
 *
 * @return [ Void ]
 */
exports.setDefaults = function (defaults) {
    this.core.setDefaults(defaults);
};

/**
 * Register callback for given event.
 *
 * @param [ String ]   event    The name of the event.
 * @param [ Function ] callback The function to be exec as callback.
 * @param [ Object ]   scope    The callback function's scope.
 *
 * @return [ Void ]
 */
exports.on = function (event, callback, scope) {
    this.core.on(event, callback, scope);
};

/**
 * Unregister callback for given event.
 *
 * @param [ String ]   event    The name of the event.
 * @param [ Function ] callback The function to be exec as callback.
 *
 * @return [ Void ]
 */
exports.un = function (event, callback) {
    this.core.un(event, callback);
};
