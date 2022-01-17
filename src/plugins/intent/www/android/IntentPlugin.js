function IntentPlugin() {
  'use strict';
}

IntentPlugin.prototype.getCordovaIntent = function (
  successCallback,
  failureCallback
) {
  'use strict';

  return cordova.exec(
    successCallback,
    failureCallback,
    'IntentPlugin',
    'getCordovaIntent',
    []
  );
};

IntentPlugin.prototype.setNewIntentHandler = function (method) {
  'use strict';

  cordova.exec(method, null, 'IntentPlugin', 'setNewIntentHandler', [method]);
};

IntentPlugin.prototype.getRealPathFromContentUrl = function (
  uri,
  successCallback,
  failureCallback
) {
  'use strict';

  cordova.exec(
    successCallback,
    failureCallback,
    'IntentPlugin',
    'getRealPathFromContentUrl',
    [uri]
  );
};

var intentInstance = new IntentPlugin();
module.exports = intentInstance;
