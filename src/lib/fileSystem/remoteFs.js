import internalFs from "./internalFs";
import ftpCodes from "../ftpCodes";
import Url from "../utils/Url";
import path from "../utils/path";

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
    exists,
    currentDirectory,
    homeDirectory,
    get origin() {
      return Url.formate({
        protocol: "ftp:",
        hostname,
        password,
        username,
        port,
        query: {
          security,
          mode
        }
      });
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

  function listDir(pathname) {
    if (pathname !== fs.origin) pathname = Url.pathname(pathname);
    else pathname = '';
    return new Promise((resolve, reject) => {
      connect()
        .then(() => {
          ftp.ls(pathname, success, error);

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
                absolutePath,
                name,
                size
              } = entry;

              link = link === "null" ? null : link;

              const url = link ? link : absolutePath;
              const {
                origin,
                query
              } = fs.originObject;

              ls.push({
                size,
                name,
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

  function writeFile(pathname, data) {
    const cacheFile = CACHE_STORAGE_REMOTE + pathname.hashCode();
    const originalPathname = pathname;
    pathname = Url.pathname(pathname);
    return new Promise((resolve, reject) => {

      connect("write")
        .then(res => internalFs.writeFile(cacheFile, data, true, false))
        .then(res => {
          ftp.upload(cacheFile, pathname, success, error);

          function success(res) {

            if (res === 1) {
              finish();
              resolve(originalPathname);
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

  function createFile(pathname, data) {
    data = data || '';
    return writeFile(pathname, data);
  }

  function deleteFile(pathname) {
    const cacheFile = CACHE_STORAGE_REMOTE + pathname.hashCode();
    pathname = Url.pathname(pathname);
    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          internalFs.deleteFile(cacheFile)
            .finally(() => {
              ftp.rm(pathname, success, error);

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

  function deleteDir(pathname) {
    pathname = Url.pathname(pathname);
    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.rmdir(pathname, success, error);

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

  function readFile(pathname) {
    const cacheFile = CACHE_STORAGE_REMOTE + pathname.hashCode();
    pathname = Url.pathname(pathname);
    return new Promise((resolve, reject) => {
      connect("read")
        .then(res => {
          ftp.download(cacheFile, pathname, success, error);

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

  function rename(pathname, newPathname) {
    const originalNewPathName = newPathname;
    pathname = Url.pathname(pathname);
    newPathname = Url.pathname(newPathname);

    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.rename(pathname, newPathname, success, error);

          function success(res) {
            resolve(originalNewPathName);
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

  function createDir(pathname) {
    const originalPathname = pathname;
    pathname = Url.pathname(pathname);
    return new Promise((resolve, reject) => {

      connect()
        .then(res => {
          ftp.mkdir(pathname, success, error);

          function success(res) {
            resolve(originalPathname);
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
    return Promise.reject(strings["copy command is not supported by ftp"]);
  }

  function exists(pathname) {
    pathname = Url.pathname(pathname);
    return new Promise((resolve, reject) => {
      connect()
        .then(res => {
          ftp.exists(pathname, resolve, error);

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