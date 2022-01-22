module.exports = {
  copy: function (srcPathname, destPathname, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'copy', [srcPathname, destPathname]);
  },
  createDir: function (pathname, dir, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'create directory', [pathname, dir]);
  },
  createFile: function (pathname, file, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'create file', [pathname, file]);
  },
  delete: function (pathname, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'delete', [pathname]);
  },
  exists: function (pathName, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'exists', [pathName]);
  },
  formatUri: function (pathName, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'format uri', [pathName]);
  },
  getPath: function (uri, filename, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'getpath', [uri, filename]);
  },
  getStorageAccessPermission: function (uuid, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'storage permission', [uuid]);
  },
  listStorages: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'list volumes', []);
  },
  listDir: function (src, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'list directory', [src]);
  },
  move: function (srcPathname, destPathname, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'move', [srcPathname, destPathname]);
  },
  openDocumentFile: function (onSuccess, onFail, mimeType) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'open document file', mimeType ? [mimeType] : []);
  },
  getImage: function (onSuccess, onFail, mimeType) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'get image', mimeType ? [mimeType] : []);
  },
  rename: function (pathname, newFilename, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'rename', [pathname, newFilename]);
  },
  write: function (filename, content, isBinary, onSuccess, onFail) {
    if (typeof isBinary === 'function') {
      onSuccess = isBinary;
      onFail = onSuccess;
      isBinary = false;
    }

    cordova.exec(onSuccess, onFail, 'SDcard', 'write', [filename, content, isBinary]);
  },
  stats: function (filename, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'SDcard', 'stats', [filename]);
  }
};