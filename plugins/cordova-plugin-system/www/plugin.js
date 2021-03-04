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
  isPowerSaveMode: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, "System", "is-powersave-mode", []);
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
  shareViaWhatsapp: function (fileUri, contact, countryCode, onSuccess, onFail) {
    if (!fileUri || !contact || !countryCode) throw new Error("Missing required parameters!");
    cordova.exec(onSuccess, onFail, "System", "share-via-whatsapp", [fileUri, contact, countryCode]);
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