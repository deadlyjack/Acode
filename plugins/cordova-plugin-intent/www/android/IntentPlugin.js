function IntentPlugin() {
    'use strict';
}

IntentPlugin.prototype.getCordovaIntent = function(successCallback, failureCallback) {
    'use strict';

    return cordova.exec (
        successCallback,
        failureCallback,
        "IntentPlugin",
        "getCordovaIntent",
        []
    );
};

IntentPlugin.prototype.setNewIntentHandler = function(method) {
    'use strict';

    cordova.exec (
        method,
        null,
        "IntentPlugin",
        "setNewIntentHandler",
        [method]
    );
};

IntentPlugin.prototype.getRealPathFromContentUrl = function(uri, successCallback, failureCallback) {
    'use strict'

    cordova.exec (
        successCallback,
        failureCallback,
        'IntentPlugin',
        'getRealPathFromContentUrl',
        [uri]
    );

}

var intentInstance = new IntentPlugin();
module.exports = intentInstance;

// Make plugin work under window.plugins
if (!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.intent) {
    window.plugins.intent = intentInstance;
}
