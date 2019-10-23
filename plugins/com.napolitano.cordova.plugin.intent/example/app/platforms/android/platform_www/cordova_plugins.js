cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
    {
        "file": "plugins/com.napolitano.cordova.plugin.intent/www/android/IntentPlugin.js",
        "id": "com.napolitano.cordova.plugin.intent.IntentPlugin",
        "pluginId": "com.napolitano.cordova.plugin.intent",
        "clobbers": [
            "IntentPlugin"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.0",
    "com.napolitano.cordova.plugin.intent": "0.1.2"
}
// BOTTOM OF METADATA
});