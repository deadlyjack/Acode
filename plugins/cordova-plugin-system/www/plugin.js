window.system = {
  getWebviewInfo: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, "System", "get-webkit-info", []);
  },
  clearCache: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, "System", "clear-cache", []);
  }
};