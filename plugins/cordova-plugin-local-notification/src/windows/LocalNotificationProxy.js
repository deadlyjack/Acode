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

var LocalNotification = LocalNotificationProxy.LocalNotification,
       ActivationKind = Windows.ApplicationModel.Activation.ActivationKind;

var impl  = new LocalNotificationProxy.LocalNotificationProxy(),
    queue = [],
    ready = false;

/**
 * Set launchDetails object.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.launch = function (success, error, args) {
    var plugin = cordova.plugins.notification.local;

    if (args.length === 0 || plugin.launchDetails) return;

    plugin.launchDetails = { id: args[0], action: args[1] };
};

/**
 * To execute all queued events.
 *
 * @return [ Void ]
 */
exports.ready = function () {
    ready = true;

    for (var item of queue) {
        exports.fireEvent.apply(exports, item);
    }

    queue = [];
};

/**
 * Check permission to show notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.check = function (success, error) {
    var granted = impl.hasPermission();

    success(granted);
};

/**
 * Request permission to show notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.request = function (success, error) {
    exports.check(success, error);
};

/**
 * Schedule notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.schedule = function (success, error, args) {
    var options = [];

    for (var props of args) {
        opts  = exports.parseOptions(props);
        options.push(opts);
    }

    impl.schedule(options);

    for (var toast of options) {
        exports.fireEvent('add', toast);
    }

    exports.check(success, error);
};

/**
 * Update notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.update = function (success, error, args) {
    var options = [];

    for (var props of args) {
        opts  = exports.parseOptions(props);
        options.push(opts);
    }

    impl.update(options);

    for (var toast of options) {
        exports.fireEvent('update', toast);
    }

    exports.check(success, error);
};

/**
 * Clear the notifications specified by id.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.clear = function (success, error, args) {
    var toasts = impl.clear(args) || [];

    for (var toast of toasts) {
        exports.fireEvent('clear', toast);
    }

    success();
};

/**
 * Clear all notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.clearAll = function (success, error) {
    impl.clearAll();
    exports.fireEvent('clearall');
    success();
};

/**
 * Cancel the notifications specified by id.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.cancel = function (success, error, args) {
    var toasts = impl.cancel(args) || [];

    for (var toast of toasts) {
        exports.fireEvent('cancel', toast);
    }

    success();
};

/**
 * Cancel all notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.cancelAll = function (success, error) {
    impl.cancelAll();
    exports.fireEvent('cancelall');
    success();
};

/**
 * Get the type of notification.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.type = function (success, error, args) {
    var type = impl.type(args[0]);

    success(type);
};

/**
 * List of all notification ids.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.ids = function (success, error) {
    var ids = impl.ids() || [];

    success(Array.from(ids));
};

/**
 * List of all scheduled notification ids.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.scheduledIds = function (success, error) {
    var ids = impl.scheduledIds() || [];

    success(Array.from(ids));
};

/**
 * List of all triggered notification ids.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.triggeredIds = function (success, error) {
    var ids = impl.triggeredIds() || [];

    success(Array.from(ids));
};

/**
 * Get a single notification by id.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.notification = function (success, error, args) {
    var obj = impl.notification(args[0]);

    success(exports.clone(obj));
};

/**
 * List of (all) notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 * @param [ Array ]    args    Interface arguments
 *
 * @return [ Void ]
 */
exports.notifications = function (success, error, args) {
    var objs = impl.notifications(args) || [];

    success(exports.cloneAll(objs));
};

/**
 * List of all scheduled notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.scheduledNotifications = function (success, error) {
    var objs = impl.scheduledNotifications() || [];

    success(exports.cloneAll(objs));
};

/**
 * List of all triggered notifications.
 *
 * @param [ Function ] success Success callback
 * @param [ Function ] error   Error callback
 *
 * @return [ Void ]
 */
exports.triggeredNotifications = function (success, error) {
    var objs = impl.triggeredNotifications() || [];

    success(exports.cloneAll(objs));
};

/**
 * Inform the user through the click event that a notification was clicked.
 *
 * @param [ String ] xml The launch identifier.
 *
 * @return [ Void ]
 */
exports.clicked = function (xml, input) {
    var toast = LocalNotification.Options.parse(xml),
        event = toast.action || 'click',
        meta  = Object.assign({}, input);

    if (input && input.size > 0) {
        meta.text = input.first().current.value;
    }

    if (!ready) {
        exports.launch(null, null, [toast.id, event]);
    }

    exports.fireEvent(event, toast, meta);
};

/**
 * Invoke listeners for the given event.
 *
 * @param [ String ] event The name of the event.
 * @param [ Object ] toast Optional notification object.
 * @param [ Object ] data  Optional meta data about the event.
 *
 * @return [ Void ]
 */
exports.fireEvent = function (event, toast, data) {
    var meta   = Object.assign({ event: event }, data),
        plugin = cordova.plugins.notification.local.core;

    if (!ready) {
        queue.push(arguments);
        return;
    }

    if (toast) {
        plugin.fireEvent(event, exports.clone(toast), meta);
    } else {
        plugin.fireEvent(event, meta);
    }
};

/**
 * Clone the objects and delete internal properties.
 *
 * @param [ Array<Object> ] objs The objects to clone for.
 *
 * @return [ Array<Object> ]
 */
exports.cloneAll = function (objs) {
    var clones = [];

    for (var obj of objs) {
        clones.push(exports.clone(obj));
    }

    return clones;
};

/**
 * Clone the object and delete internal properties.
 *
 * @param [ Object ] obj The object to clone for.
 *
 * @return [ Object ]
 */
exports.clone = function (obj) {
    var ignore = ['action'],
        dclone = ['trigger'],
        clone  = {};

    if (obj === null) return null;

    for (var prop in obj) {
        if (ignore.includes(prop) || typeof obj[prop] === 'function')
            continue;

        try {
            clone[prop] = dclone.includes(prop) ? exports.clone(obj[prop]) : obj[prop];
        } catch (e) {
            clone[prop] = null;
        }
    }

    return clone;
};

/**
 * Parse notification spec into an instance of prefered type.
 *
 * @param [ Object ] obj The notification options map.
 *
 * @return [ LocalNotification.Options ]
 */
exports.parseOptions = function (obj) {
    var opts   = new LocalNotification.Options(),
        ignore = ['progressBar', 'actions', 'trigger'];

    for (var prop in opts) {
        if (!ignore.includes(prop) && obj[prop]) {
            opts[prop] = obj[prop];
        }
    }

    var progressBar  = exports.parseProgressBar(obj);
    opts.progressBar = progressBar;

    var trigger  = exports.parseTrigger(obj);
    opts.trigger = trigger;

    var actions  = exports.parseActions(obj);
    opts.actions = actions;

    return opts;
};

/**
 * Parse trigger spec into instance of prefered type.
 *
 * @param [ Object ] obj The notification options map.
 *
 * @return [ LocalNotification.Trigger ]
 */
exports.parseTrigger = function (obj) {
    var trigger = new LocalNotification.Toast.Trigger(),
        spec    = obj.trigger, val;

    if (!spec) return trigger;

    for (var prop in trigger) {
        val = spec[prop];
        if (!val) continue;
        trigger[prop] = prop == 'every' ? exports.parseEvery(val) : val;
    }

    return trigger;
};

/**
 * Parse trigger.every spec into instance of prefered type.
 *
 * @param [ Object ] spec The trigger.every object.
 *
 * @return [ LocalNotification.Every|String ]
 */
exports.parseEvery = function (spec) {
    var every = new LocalNotification.Toast.Every();

    if (typeof spec !== 'object') return spec;

    for (var prop in every) {
        if (spec.hasOwnProperty(prop)) every[prop] = parseInt(spec[prop]);
    }

    return every;
};

/**
 * Parse action specs into instances of prefered types.
 *
 * @param [ Object ] obj The notification options map.
 *
 * @return [ Array<LocalNotification.Action> ]
 */
exports.parseActions = function (obj) {
    var actions = [], btn;

    if (!obj.actions) return actions;

    for (var action of obj.actions) {
        if (!action.type || action.type == 'button') {
            btn = new LocalNotification.Toast.Button();
        } else
        if (action.type == 'input') {
            btn = new LocalNotification.Toast.Input();
        }

        for (var prop in btn) {
            if (action[prop]) btn[prop] = action[prop];
        }

        actions.push(btn);
    }

    return actions;
};

/**
 * Parse progressBar specs into instances of prefered types.
 *
 * @param [ Object ] obj The notification options map.
 *
 * @return [ LocalNotification.ProgressBar ]
 */
exports.parseProgressBar = function (obj) {
    var bar  = new LocalNotification.Toast.ProgressBar(),
        spec = obj.progressBar;

    if (!spec) return bar;

    for (var prop in bar) {
        if (spec[prop]) bar[prop] = spec[prop];
    }

    return bar;
};

// Handle onclick event
document.addEventListener('activated', function (e) {
    if (e.kind == ActivationKind.toastNotification) {
        exports.clicked(e.raw.argument, e.raw.userInput);
    }
}, false);

cordova.commandProxy.add('LocalNotification', exports);
