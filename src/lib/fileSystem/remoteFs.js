import path from "../path";
import internalFs from "./internalFs";
import helpers from "../helpers";
import ftpCodes from "../ftpCodes";

/**
 * @param {string} username
 * @param {string} password
 * @param {string} hostname
 * @param {string|number} port
 * @param {"ftp"|"ftps"} [security]
 * @param {"active"|"passive"} [mode]
 * @returns {ExternalFs}
 */
function remoteFs(username, password, hostname, port, security, mode) {

  port = port || 21;
  const ftp = window.cordova.plugin.ftp;
  const FILE = 0,
    DIR = 1,
    LINK = 2;

  const fs = {
    listDir,
    writeFile,
    createDir,
    createFile,
    deleteFile,
    deleteDir,
    readFile,
    rename,
    copyTo,
    get origin() {
      if (username && password)
        return `ftp://${username}:${password}@${hostname}:${port}`;
      else if (username)
        return `ftp://${username}@${hostname}:${port}`;
      else
        return `ftp://${hostname}:${port}`;
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
                security,
                mode,
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
    if (_path !== fs.origin) _path = new URL(_path).pathname;
    else _path = '';
    return new Promise((resolve, reject) => {
      connect()
        .then(() => {
          ftp.ls(_path, success, error);

          /**
           * 
           * @param {Array<FTPFile>} list 
           */
          function success(list) {

            const ls = [];
            list.map(entry => {

              let {
                link,
                type,
                absolutePath
              } = entry;

              link = link === "null" ? null : link;

              const url = link ? link : absolutePath;

              ls.push({
                url: fs.origin + url,
                isDirectory: type === DIR,
                isFile: type === FILE,
                isLink: type === LINK
              });
            });
            resolve(ls);

          }

          function error(err) {
            const code = getCode(err);
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
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
            finish();
            const code = getCode(err);
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
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

  function createFile(_path, data) {
    data = data || '';
    return writeFile(_path, data);
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
                if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
                else reject(err);
              }
            });
        })
        .catch(reject);
    });
  }

  function deleteDir(_path) {
    _path = new URL(_path).pathname;
    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.rmdir(_path, success, error);

          function success(res) {
            resolve(res);
          }

          function error(err) {
            const code = getCode(err);
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
          }
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
            finish();
            if (err === 'Error') err = 'Unkown error';
            const code = getCode(err);
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
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
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
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
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
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