window.system = {
  getWebviewInfo: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, "System", "get-webkit-info", []);
  },
  clearCache: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, "System", "clear-cache", []);
  },
  enableFullScreen: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, "System", "enable-fullscreen", []);
  },
  disableFullScreen: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, "System", "disable-fullscreen", []);
  }
};