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
  },
  shareFile: function (fileUri, filename, onSuccess, onFail) {
    if (typeof filename === "function") {
      onSuccess = filename;
      onFail = onSuccess;
      filename = "";
    }

    if (!filename) filename = "";

    cordova.exec(onSuccess, onFail, "System", "share-file", [fileUri, filename]);
  },
  sendEmail: function (email, subject, bodyText, bodyHTML, onSuccess, onFail) {
    if (typeof bodyHTML === "function") {
      onSuccess = bodyHTML;
      onFail = onSuccess;
      bodyHTML = "";
    }

    if (!bodyHTML) bodyHTML = "";

    cordova.exec(onSuccess, onFail, "System", "send-email", [email, subject, bodyText, bodyHTML]);
  }
};