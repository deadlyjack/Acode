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

var exec    = require('cordova/exec'),
    channel = require('cordova/channel');

// Default values
exports._defaults = {
    actionGroupId : null,
    actions       : [],
    attachments   : [],
    autoClear     : true,
    badge         : null,
    channel       : null,
    color         : null,
    data          : null,
    defaults      : 0,
    foreground    : false,
    group         : null,
    groupSummary  : false,
    icon          : null,
    id            : 0,
    launch        : true,
    led           : true,
    lockscreen    : true,
    mediaSession  : null,
    number        : 0,
    priority      : 0,
    progressBar   : false,
    showWhen      : true,
    silent        : false,
    smallIcon     : 'res://icon',
    sound         : true,
    sticky        : false,
    summary       : null,
    text          : '',
    title         : '',
    trigger       : { type : 'calendar' },
    vibrate       : false,
    wakeup        : true
};

// Listener
exports._listener = {};

/**
 * Merge custom properties with the default values.
 *
 * @param [ Object ] options Set of custom values.
 *
 * @retrun [ Object ]
 */
exports.mergeWithDefaults = function (options) {
    var values = this.getDefaults();

    if (values.hasOwnProperty('sticky')) {
        options.sticky = this.getValueFor(options, 'sticky', 'ongoing');
    }

    if (options.sticky && options.autoClear !== true) {
        options.autoClear = false;
    }

    Object.assign(values, options);

    for (var key in values) {
        if (values[key] !== null) {
            options[key] = values[key];
        } else {
            delete options[key];
        }

        if (!this._defaults.hasOwnProperty(key)) {
            console.warn('Unknown property: ' + key);
        }
    }

    options.meta = {
        plugin:  'cordova-plugin-local-notification',
        version: '0.9-beta.2'
    };

    return options;
};

/**
 * Convert the passed values to their required type.
 *
 * @param [ Object ] options Properties to convert for.
 *
 * @return [ Object ] The converted property list
 */
exports.convertProperties = function (options) {
    var parseToInt = function (prop, options) {
        if (isNaN(options[prop])) {
            console.warn(prop + ' is not a number: ' + options[prop]);
            return this._defaults[prop];
        } else {
            return Number(options[prop]);
        }
    };

    if (options.id) {
        options.id = parseToInt('id', options);
    }

    if (options.title) {
        options.title = options.title.toString();
    }

    if (options.badge) {
        options.badge = parseToInt('badge', options);
    }

    if (options.priority) {
        options.priority = parseToInt('priority', options);
    }

    if (options.foreground === true) {
        options.priority = Math.max(options.priority, 1);
    }

    if (options.foreground === false) {
        options.priority = Math.min(options.priority, 0);
    }

    if (options.defaults) {
        options.defaults = parseToInt('defaults', options);
    }

    if (options.smallIcon && !options.smallIcon.match(/^res:/)) {
        console.warn('Property "smallIcon" must be of kind res://...');
    }

    options.data = JSON.stringify(options.data);

    this.convertTrigger(options);
    this.convertActions(options);
    this.convertProgressBar(options);

    return options;
};

/**
 * Convert the passed values to their required type, modifying them
 * directly for Android and passing the converted list back for iOS.
 *
 * @param [ Map ] options Set of custom values.
 *
 * @return [ Map ] Interaction object with category & actions.
 */
exports.convertActions = function (options) {
    var actions = [];

    if (!options.actions)
        return null;

    for (var i = 0, len = options.actions.length; i < len; i++) {
        var action = options.actions[i];

        if (!action.id) {
            console.warn('Action with title ' + action.title + ' ' +
                         'has no id and will not be added.');
            continue;
        }

        action.id = action.id.toString();

        actions.push(action);
    }

    options.actions = actions;

    return options;
};

/**
 * Convert the passed values for the trigger to their required type.
 *
 * @param [ Map ] options Set of custom values.
 *
 * @return [ Map ] Interaction object with trigger spec.
 */
exports.convertTrigger = function (options) {
    var trigger  = options.trigger || {},
        date     = this.getValueFor(trigger, 'at', 'firstAt', 'date');

    var dateToNum = function (date) {
        var num = typeof date == 'object' ? date.getTime() : date;
        return Math.round(num);
    };

    if (!options.trigger)
        return;

    if (!trigger.type) {
        trigger.type = trigger.center ? 'location' : 'calendar';
    }

    var isCal = trigger.type == 'calendar';

    if (isCal && !date) {
        date = this.getValueFor(options, 'at', 'firstAt', 'date');
    }

    if (isCal && !trigger.every && options.every) {
        trigger.every = options.every;
    }

    if (isCal && (trigger.in || trigger.every)) {
        date = null;
    }

    if (isCal && date) {
        trigger.at = dateToNum(date);
    }

    if (isCal && trigger.firstAt) {
        trigger.firstAt = dateToNum(trigger.firstAt);
    }

    if (isCal && trigger.before) {
        trigger.before = dateToNum(trigger.before);
    }

    if (isCal && trigger.after) {
        trigger.after = dateToNum(trigger.after);
    }

    if (!trigger.count && device.platform == 'windows') {
        trigger.count = trigger.every ? 5 : 1;
    }

    if (trigger.count && device.platform == 'iOS') {
        console.warn('trigger: { count: } is not supported on iOS.');
    }

    if (!isCal) {
        trigger.notifyOnEntry = !!trigger.notifyOnEntry;
        trigger.notifyOnExit  = trigger.notifyOnExit === true;
        trigger.radius        = trigger.radius || 5;
        trigger.single        = !!trigger.single;
    }

    if (!isCal || trigger.at) {
        delete trigger.every;
    }

    delete options.every;
    delete options.at;
    delete options.firstAt;
    delete options.date;

    options.trigger = trigger;

    return options;
};

/**
 * Convert the passed values for the progressBar to their required type.
 *
 * @param [ Map ] options Set of custom values.
 *
 * @return [ Map ] Interaction object with trigger spec.
 */
exports.convertProgressBar = function (options) {
    var isAndroid = device.platform == 'Android',
        cfg       = options.progressBar;

    if (cfg === undefined)
        return;

    if (typeof cfg === 'boolean') {
        cfg = options.progressBar = { enabled: cfg };
    }

    if (typeof cfg.enabled !== 'boolean') {
        cfg.enabled = !!(cfg.value || cfg.maxValue || cfg.indeterminate !== null);
    }

    cfg.value = cfg.value || 0;

    if (isAndroid) {
        cfg.maxValue      = cfg.maxValue || 100;
        cfg.indeterminate = !!cfg.indeterminate;
    }

    cfg.enabled = !!cfg.enabled;

    return options;
};

/**
 * Create a callback function to get executed within a specific scope.
 *
 * @param [ Function ] fn    The function to be exec as the callback.
 * @param [ Object ]   scope The callback function's scope.
 *
 * @return [ Function ]
 */
exports.createCallbackFn = function (fn, scope) {

    if (typeof fn != 'function')
        return;

    return function () {
        fn.apply(scope || this, arguments);
    };
};

/**
 * Convert the IDs to numbers.
 *
 * @param [ Array ] ids
 *
 * @return [ Array<Number> ]
 */
exports.convertIds = function (ids) {
    var convertedIds = [];

    for (var i = 0, len = ids.length; i < len; i++) {
        convertedIds.push(Number(ids[i]));
    }

    return convertedIds;
};

/**
 * First found value for the given keys.
 *
 * @param [ Object ]         options Object with key-value properties.
 * @param [ *Array<String> ] keys    List of keys.
 *
 * @return [ Object ]
 */
exports.getValueFor = function (options) {
    var keys = Array.apply(null, arguments).slice(1);

    for (var i = 0, key = keys[i], len = keys.length; i < len; key = keys[++i]) {
        if (options.hasOwnProperty(key)) {
            return options[key];
        }
    }

    return null;
};

/**
 * Convert a value to an array.
 *
 * @param [ Object ] obj Any kind of object.
 *
 * @return [ Array ] An array with the object as first item.
 */
exports.toArray = function (obj) {
    return Array.isArray(obj) ? Array.from(obj) : [obj];
};

/**
 * Fire the event with given arguments.
 *
 * @param [ String ] event The event's name.
 * @param [ *Array]  args  The callback's arguments.
 *
 * @return [ Void]
 */
exports.fireEvent = function (event) {
    var args     = Array.apply(null, arguments).slice(1),
        listener = this._listener[event];

    if (!listener)
        return;

    if (args[0] && typeof args[0].data === 'string') {
        args[0].data = JSON.parse(args[0].data);
    }

    for (var i = 0; i < listener.length; i++) {
        var fn    = listener[i][0],
            scope = listener[i][1];

        fn.apply(scope, args);
    }
};

/**
 * Execute the native counterpart.
 *
 * @param [ String ]  action   The name of the action.
 * @param [ Array ]   args     Array of arguments.
 * @param [ Function] callback The callback function.
 * @param [ Object ] scope     The scope for the function.
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

    exec(fn, null, 'LocalNotification', action, params);
};

exports.setLaunchDetails = function () {
    exports.exec('launch', null, function (details) {
        if (details) {
            cordova.plugins.notification.local.launchDetails = details;
        }
    });
};

// Called after 'deviceready' event
channel.deviceready.subscribe(function () {
    if (['Android', 'windows', 'iOS'].indexOf(device.platform) > -1) {
        exports.exec('ready');
    }
});

// Called before 'deviceready' event
channel.onCordovaReady.subscribe(function () {
    channel.onCordovaInfoReady.subscribe(function () {
        if (['Android', 'windows', 'iOS'].indexOf(device.platform) > -1) {
            exports.setLaunchDetails();
        }
    });
});

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

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}
