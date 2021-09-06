module.exports = {
  getWebviewInfo: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'get-webkit-info', []);
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
    action = shortcut.action;

    cordova.exec(onSuccess, onFail, 'System', 'add-shortcut', [
      id,
      label,
      description,
      icon,
      action,
      data,
    ]);
  },
  removeShortcut: function (id, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'remove-shortcut', [id]);
  },
  pinShortcut: function (id, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'pin-shortcut', [id]);
  },
  manageAllFiles: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'manage-all-files', []);
  },
  getAndroidVersion: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'get-android-version', []);
  },
  isExternalStorageManager: function (onSuccess, onFail) {
    cordova.exec(
      onSuccess,
      onFail,
      'System',
      'is-external-storage-manager',
      []
    );
  },
  requestPermission: function (permission, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'request-permission', [
      permission,
    ]);
  },
  requestPermissions: function (permissions, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'request-permissions', [
      permissions,
    ]);
  },
  hasPermission: function (permission, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'System', 'has-permission', [permission]);
  },
};
