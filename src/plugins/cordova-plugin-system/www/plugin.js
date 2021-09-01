module.exports = {
  getWebviewInfo: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'get-webkit-info', []);
  },
  clearCache: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'clear-cache', []);
  },
  isPowerSaveMode: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'is-powersave-mode', []);
  },
  shareFile: function (fileUri, filename, onSuccess, onFail) {
    if (typeof filename === 'function') {
      onSuccess = filename;
      onFail = onSuccess;
      filename = '';
    }

    if (!filename) filename = '';

    cordova.exec(onSuccess, onFail, 'System', 'share-file', [
      fileUri,
      filename,
    ]);
  },
  getAppInfo: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'get-app-info', []);
  },
  addShortcut: function (shortcut, onSuccess, onFail) {
    var id, label, description, icon, data;

    id = shortcut.id;
    label = shortcut.label;
    description = shortcut.description;
    icon = shortcut.icon;
    data = shortcut.data;

    cordova.exec(onSuccess, onFail, 'System', 'add-shortcut', [
      label,
      description,
      icon,
      data,
      id,
    ]);
  },
  removeShortcut: function (id, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'remove-shortcut', [id]);
  },
  pinShortcut: function (id, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'pin-shortcut', [id]);
  },
};
