cordova.define("com.napolitano.cordova.plugin.intent.IntentPlugin", function(require, exports, module) { function IntentPlugin() {
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

var intentInstance = new IntentPlugin();
module.exports = intentInstance;

// Make plugin work under window.plugins
if (!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.intent) {
    window.plugins.intent = intentInstance;
}
});
