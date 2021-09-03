module.exports = {
  exec: function (command, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Sftp', 'exec', [command]);
  },
  connectUsingPassword: function (
    host,
    port,
    username,
    password,
    onSuccess,
    onFail
  ) {
    if (typeof port != 'number') {
      throw new Error('Port must be number');
    }

    port = Number.parseInt(port);
    cordova.exec(onSuccess, onFail, 'Sftp', 'connect-pass', [
      host,
      port,
      username,
      password,
    ]);
  },
  connectUsingKeyFile: function (
    host,
    port,
    username,
    keyFile,
    passphrase,
    onSuccess,
    onFail
  ) {
    if (typeof port != 'number') {
      throw new Error('Port must be number');
    }

    port = Number.parseInt(port);
    cordova.exec(onSuccess, onFail, 'Sftp', 'connect-key', [
      host,
      port,
      username,
      keyFile,
      passphrase,
    ]);
  },
  getFile: function (filename, localFilename, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Sftp', 'getfile', [
      filename,
      localFilename,
    ]);
  },
  putFile: function (filename, localFilename, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Sftp', 'putfile', [
      filename,
      localFilename,
    ]);
  },
  close: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Sftp', 'close', []);
  },
  isConnected: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Sftp', 'isconnected', []);
  },
};
