import internalFs from "./internalFs";
import ftpCodes from "../ftpCodes";
import Url from "../utils/Url";

/**
 * @param {string} username
 * @param {string} password
 * @param {string} hostname
 * @param {string|number} port
 * @param {"ftp"|"ftps"} [security]
 * @param {"active"|"passive"} [mode]
 * @returns {RemoteFs}
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
    currentDirectory,
    homeDirectory,
    get origin() {
      let url;

      if (username && password)
        url = `ftp://${username}:${password}@${hostname}:${port}`;
      else if (username)
        url = `ftp://${username}@${hostname}:${port}`;
      else
        url = `ftp://${hostname}:${port}`;

      if (security && mode)
        url += `?security=${security}&mode=${mode}`;
      else if (security)
        url += `?security=${security}`;

      return url;

    },
    get originObject() {
      const [origin, query = ""] = this.origin.split(/(?=\?)/);
      return {
        origin,
        query
      };
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
            ftp.connect(
              hostname + ':' + port,
              username || 'anonymous',
              password || 'anonymous',
              security,
              mode,
              res => resolve(res),
              err => {
                ftp.disconnect();
                reject("cannot connect to ftp: " + err);
              }
            );
          });
      }
    });
  }

  function listDir(_path) {
    if (_path !== fs.origin) _path = Url.pathname(_path);
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
              const {
                origin,
                query
              } = fs.originObject;

              ls.push({
                url: origin + url + query,
                isDirectory: type === DIR,
                isFile: type === FILE,
                isLink: type === LINK
              });
            });
            resolve(ls);

          }

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function writeFile(_path, data) {
    const cacheFile = CACHE_STORAGE_REMOTE + _path.hashCode();
    _path = Url.pathname(_path);
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
            ftp.disconnect();
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
    const cacheFile = CACHE_STORAGE_REMOTE + _path.hashCode();
    _path = Url.pathname(_path);
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
                ftp.disconnect();
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
    _path = Url.pathname(_path);
    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.rmdir(_path, success, error);

          function success(res) {
            resolve(res);
          }

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function readFile(_path) {
    const cacheFile = CACHE_STORAGE_REMOTE + _path.hashCode();
    _path = Url.pathname(_path);
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
            ftp.disconnect();
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
    _path = Url.pathname(_path);
    _newpath = Url.pathname(_newpath);

    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.rename(_path, _newpath, success, error);

          function success(res) {
            resolve(res);
          }

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function createDir(_path) {
    _path = Url.pathname(_path);
    return new Promise((resolve, reject) => {

      connect()
        .then(res => {
          ftp.mkdir(_path, success, error);

          function success(res) {
            resolve(res);
          }

          function error(err) {
            ftp.disconnect();
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

  function currentDirectory() {
    return new Promise((resolve, reject) => {
      connect()
        .then(() => {
          return ftp.currentDirectory(resolve, err => {
            throw new Error(err);
          });
        })
        .catch(err => {
          ftp.disconnect();
          const code = getCode(err);
          if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
          else reject(err);
        });
    });
  }

  function homeDirectory() {
    return new Promise((resolve, reject) => {
      connect()
        .then(() => {
          return ftp.homeDirectory(resolve, err => {
            throw new Error(err);
          });
        })
        .catch(err => {
          ftp.disconnect();
          const code = getCode(err);
          if (code) reject(code in ftpCodes ? ftpCodes[code] : err);
          else reject(err);
        });
    });
  }
}

remoteFs.busy = false;

export default remoteFs;