import path from "./path";
import internalFs from "./internalFs";
import helpers from "../helpers";

/**
 * @param {string} username
 * @param {string} password
 * @param {string} hostname
 * @param {string|number} port
 * @returns {ExternalFs}
 */
function remoteFs(username, password, hostname, port) {

  port = port || 21;
  const ftp = window.cordova.plugin.ftp;
  const FILE = 0,
    DIR = 1;

  const fs = {
    listDir,
    writeFile,
    createDir,
    createFile,
    deleteFile,
    readFile,
    rename,
    copyTo,
    get origin() {
      return `ftp://${username}:${password}@${hostname}:${port}`;
    }
  };

  return fs;

  function connect(mode) {
    return new Promise((resolve, reject) => {

      if (remoteFs.busy === "write") {
        document.addEventListener('remotewriteend', next);
      } else if (remoteFs.busy === "read") {
        document.addEventListener('remotereadend', next);
      } else {
        next();
      }

      function next() {
        if (mode) remoteFs.busy = mode;
        document.removeEventListener('remotereadend', next);
        document.removeEventListener('remotewriteend', next);
        internalFs.createDir(CACHE_STORAGE, 'ftp-temp')
          .finally(() => {
            ftp.disconnect(next, next);

            function next() {
              ftp.connect(
                hostname + ':' + port,
                username,
                password,
                res => {
                  resolve(res);
                },
                err => {
                  reject("cannot connect to ftp: " + err);
                }
              );
            }
          });
      }
    });
  }

  function listDir(_path) {
    _path = new URL(_path).pathname;
    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.ls(_path, success, error);

          /**
           * 
           * @param {Array<{name: string, type: number, size: number, modifiedDate: string}>} list 
           */
          function success(list) {

            const ls = [];
            list.map(entry => {
              ls.push({
                url: fs.origin + path.join(_path, entry.name),
                isDirectory: entry.type === DIR,
                isFile: entry.type === FILE
              });
            });
            resolve(ls);

          }

          function error(err) {
            const code = getCode(err);
            if (code === 421) return connect()
              .then(res => {
                ftp.ls(_path, success, error);
              })
              .catch(err => {
                reject(err);
              });
            reject(err);
          }
        })
        .catch(reject);
    });
  }

  function writeFile(_path, data) {
    const cacheFile = CACHE_STORAGE_REMOTE + btoa(_path);
    _path = new URL(_path).pathname;
    return new Promise((resolve, reject) => {

      connect("write")
        .then(res => internalFs.writeFile(cacheFile, data, true, false))
        .then(res => {
          ftp.upload(cacheFile, _path, success, error);

          function success(res) {

            if (res === 1) {
              finish();
              resolve(res);
            }

          }

          function error(err) {
            const code = getCode(err);
            if (code === 421) return connect()
              .then(res => {
                ftp.upload(cacheFile, _path, success, error);
              })
              .catch(err => {
                finish();
                reject(err);
              });

            finish();
            reject(err);
          }
        })
        .catch(err => {
          finish();
          reject(err);
        });

    });

    function finish() {
      remoteFs.busy = false;
      document.dispatchEvent(new CustomEvent("remotewriteend"));
    }
  }

  function createFile(_path) {
    return writeFile(_path, '');
  }

  function deleteFile(_path) {
    const cacheFile = CACHE_STORAGE_REMOTE + btoa(_path);
    _path = new URL(_path).pathname;
    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          internalFs.deleteFile(cacheFile)
            .finally(() => {
              ftp.rm(_path, success, error);

              function success(res) {
                resolve(res);
              }

              function error(err) {
                const code = getCode(err);
                if (code === 421) return connect()
                  .then(res => {
                    ftp.rm(cacheFile, _path, success, error);
                  })
                  .catch(err => {
                    reject(err);
                  });
                reject(err);
              }
            });
        })
        .catch(reject);
    });
  }

  function readFile(_path) {
    const cacheFile = CACHE_STORAGE_REMOTE + btoa(_path);
    _path = new URL(_path).pathname;
    return new Promise((resolve, reject) => {
      connect("read")
        .then(res => {
          ftp.download(cacheFile, _path, success, error);

          function success(res) {

            if (res === 1) {
              finish();
              internalFs.readFile(cacheFile)
                .then(resolve)
                .catch(reject);
            }

          }

          function error(err) {
            console.log("Unable to read file", err);
            if (err === 'Error') err = 'Unkown error';
            const code = getCode(err);
            if (code === 421) return connect()
              .then(res => {
                ftp.download(cacheFile, _path, success, error);
              })
              .catch(err => {
                finish();
                reject("Connect error: " + err);
              });

            finish();
            reject("Readfile error: " + err);
          }
        })
        .catch(err => {
          finish();
          reject(err);
        });
    });

    function finish() {
      remoteFs.busy = false;
      document.dispatchEvent(new CustomEvent("remotereadend"));
    }
  }

  function rename(_path, _newpath) {
    _path = new URL(_path).pathname;
    _newpath = new URL(_newpath).pathname;

    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.rename(_path, _newpath, success, error);

          function success(res) {
            resolve(res);
          }

          function error(err) {
            const code = getCode(err);
            if (code === 421) return connect()
              .then(res => {
                ftp.rename(_path, _newpath, success, error);
              })
              .catch(err => {
                reject(err);
              });
            reject(err);
          }
        })
        .catch(reject);
    });
  }

  function createDir(_path) {
    _path = new URL(_path).pathname;
    return new Promise((resolve, reject) => {

      connect()
        .then(res => {
          ftp.mkdir(_path, success, error);

          function success(res) {
            resolve(res);
          }

          function error(err) {
            const code = getCode(err);
            if (code === 421) return connect()
              .then(res => {
                ftp.mkdir(_path, success, error);
              })
              .catch(err => {
                reject(err);
              });
            reject(err);
          }
        })
        .catch(reject);

    });
  }

  function copyTo(path, newPath) {
    return Promise.reject("Copy command is supported by FTP.");
  }

  function getCode(err) {
    if (typeof err === "string")
      try {
        const code = parseInt(/code=(\d+)\b/.exec(err)[1]);
        if (typeof code === "number") return code;
        return null;
      } catch (error) {
        return null;
      }
    return null;
  }
}

remoteFs.busy = false;

export default remoteFs;