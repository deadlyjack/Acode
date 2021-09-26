import internalFs from './internalFs';
import Url from '../utils/Url';
import mimeType from 'mime-types';

/**
 * @param {string} username
 * @param {string} password
 * @param {string} hostname
 * @param {string|number} port
 * @param {"ftp"|"ftps"} [security]
 * @param {"active"|"passive"} [mode]
 * @returns {RemoteFs}
 */
function Ftp(username, password, hostname, port, security, mode) {
  port = port || 21;
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
    stats,
    get origin() {
      return Url.formate({
        protocol: 'ftp:',
        hostname,
        password,
        username,
        port,
        query: {
          security,
          mode,
        },
      });
    },
    get originObject() {
      const [origin, query = ''] = this.origin.split(/(?=\?)/);
      return {
        origin,
        query,
      };
    },
  };

  return fs;

  function getLocalFilename(pathname) {
    return Url.join(CACHE_STORAGE, 'ftp' + pathname.hashCode());
  }

  function connect(mode) {
    return new Promise((resolve, reject) => {
      if (Ftp.busy === 'write') {
        document.addEventListener('remotewriteend', next);
      } else if (Ftp.busy === 'read') {
        document.addEventListener('remotereadend', next);
      } else {
        next();
      }

      function next() {
        if (mode) Ftp.busy = mode;
        document.removeEventListener('remotereadend', next);
        document.removeEventListener('remotewriteend', next);
        ftp.connect(
          hostname + ':' + port,
          username || 'anonymous',
          password || 'anonymous',
          security,
          mode,
          (res) => resolve(res),
          (err) => {
            ftp.disconnect();
            reject('cannot connect to ftp: ' + err);
          },
        );
      }
    });
  }

  function listDir(pathname) {
    return new Promise((resolve, reject) => {
      if (pathname !== fs.origin) pathname = Url.pathname(pathname);
      else pathname = '';
      connect()
        .then(() => {
          ftp.ls(pathname, success, error);

          /**
           * @param {Array<FTPFile>} list
           */
          function success(list) {
            const ls = [];
            list.map((entry) => {
              let { link, type, absolutePath, name, size } = entry;

              if (name === '.' || name === '..') return entry;

              link = link === 'null' ? null : link;

              const url = link ? link : absolutePath;
              const { origin, query } = fs.originObject;

              ls.push({
                size,
                name,
                modifiedDate: new Date(entry.modifiedDate).getTime(),
                url: origin + url + query,
                isDirectory: type === DIR,
                isFile: type === FILE,
                isLink: type === LINK,
              });
            });
            resolve(ls);
          }

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(ftpCodes(code) || err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function writeFile(pathname, data) {
    return new Promise((resolve, reject) => {
      const cacheFile = getLocalFilename(pathname);
      const originalPathname = pathname;
      pathname = Url.pathname(pathname);

      connect('write')
        .then((res) => internalFs.writeFile(cacheFile, data, true, false))
        .then((res) => {
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
            if (code) reject(ftpCodes(code) || err);
            else reject(err);
          }
        })
        .catch((err) => {
          finish();
          reject(err);
        });
    });

    function finish() {
      Ftp.busy = false;
      document.dispatchEvent(new CustomEvent('remotewriteend'));
    }
  }

  function createFile(pathname, data) {
    data = data || '';
    return writeFile(pathname, data);
  }

  function deleteFile(pathname) {
    return new Promise((resolve, reject) => {
      const cacheFile = getLocalFilename(pathname);
      pathname = Url.pathname(pathname);
      connect()
        .then((res) => {
          internalFs.deleteFile(cacheFile).finally(() => {
            ftp.rm(pathname, success, error);

            function success(res) {
              resolve(res);
            }

            function error(err) {
              ftp.disconnect();
              const code = getCode(err);
              if (code) reject(ftpCodes(code) || err);
              else reject(err);
            }
          });
        })
        .catch(reject);
    });
  }

  function deleteDir(pathname) {
    return new Promise((resolve, reject) => {
      pathname = Url.pathname(pathname);
      connect()
        .then((res) => {
          ftp.rmdir(pathname, success, error);

          function success(res) {
            resolve(res);
          }

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(ftpCodes(code) || err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function readFile(pathname) {
    return new Promise((resolve, reject) => {
      const cacheFile = getLocalFilename(pathname);
      pathname = Url.pathname(pathname);
      connect('read')
        .then((res) => {
          ftp.download(cacheFile, pathname, success, error);

          function success(res) {
            if (res === 1) {
              finish();
              internalFs.readFile(cacheFile).then(resolve).catch(reject);
            }
          }

          function error(err) {
            finish();
            ftp.disconnect();
            if (err === 'Error') err = 'Unkown error';
            const code = getCode(err);
            if (code) reject(ftpCodes(code) || err);
            else reject(err);
          }
        })
        .catch((err) => {
          finish();
          reject(err);
        });
    });

    function finish() {
      Ftp.busy = false;
      document.dispatchEvent(new CustomEvent('remotereadend'));
    }
  }

  function rename(pathname, newPathname) {
    return new Promise((resolve, reject) => {
      const originalNewPathName = newPathname;
      pathname = Url.pathname(pathname);
      newPathname = Url.pathname(newPathname);
      connect()
        .then((res) => {
          ftp.rename(pathname, newPathname, success, error);

          function success(res) {
            resolve(originalNewPathName);
          }

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(ftpCodes(code) || err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function createDir(pathname) {
    return new Promise((resolve, reject) => {
      const originalPathname = pathname;
      pathname = Url.pathname(pathname);
      connect()
        .then((res) => {
          ftp.mkdir(pathname, success, error);

          function success(res) {
            resolve(originalPathname);
          }

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(ftpCodes(code) || err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function copyTo(path, newPath) {
    return Promise.reject(strings['copy command is not supported by ftp']);
  }

  function exists(pathname) {
    return new Promise((resolve, reject) => {
      pathname = Url.pathname(pathname);
      connect()
        .then((res) => {
          ftp.exists(pathname, resolve, error);

          function error(err) {
            ftp.disconnect();
            const code = getCode(err);
            if (code) reject(ftpCodes(code) || err);
            else reject(err);
          }
        })
        .catch(reject);
    });
  }

  function getCode(err) {
    if (typeof err === 'string')
      try {
        const code = parseInt(/code=(\d+)\b/.exec(err)[1]);
        if (typeof code === 'number') return code;
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
          return ftp.currentDirectory(resolve, (err) => {
            throw new Error(err);
          });
        })
        .catch((err) => {
          ftp.disconnect();
          const code = getCode(err);
          if (code) reject(ftpCodes(code) || err);
          else reject(err);
        });
    });
  }

  function homeDirectory() {
    return new Promise((resolve, reject) => {
      connect()
        .then(() => {
          return ftp.homeDirectory(resolve, (err) => {
            throw new Error(err);
          });
        })
        .catch((err) => {
          ftp.disconnect();
          const code = getCode(err);
          if (code) reject(ftpCodes(code) || err);
          else reject(err);
        });
    });
  }

  function stats(pathname) {
    return new Promise((resolve, reject) => {
      const parent = Url.dirname(pathname);
      const filename = Url.basename(pathname);
      if (!filename) return reject('Cannot get stats for given path.');

      listDir(parent)
        .then((res) => {
          let file = null;
          for (let f of res) {
            if (f.name === filename) {
              file = f;
              break;
            }
          }

          if (!file) return reject('Cannot get stats for given path');
          resolve({
            name: file.name,
            exists: true,
            length: file.size,
            isFile: file.isFile,
            isDirectory: file.isDirectory,
            isVirtual: file.isLink,
            canWrite: true,
            canRead: true,
            lastModified: file.modifiedDate,
            type: mimeType.lookup(filename),
            uri: pathname,
          });
        })
        .catch(reject);
    });
  }

  function ftpCodes(code) {
    switch (code) {
      case 421:
        return 'Service not available, closing control connection. This may be a reply to any command if the service knows it must shut down.';
      case 425:
        return "Can't open data connection.";
      case 426:
        return 'Connection closed; transfer aborted.';
      case 430:
        return 'Invalid username or password.';
      case 434:
        return 'Requested host unavailable.';
      case 450:
        return 'Requested file action not taken.';
      case 451:
        return 'Requested action aborted. Local error in processing.';
      case 452:
        return 'Requested action not taken. Insufficient storage space in system.File unavailable (e.g., file busy).';
      case 501:
        return 'Syntax error in parameters or arguments.';
      case 502:
        return 'Command not implemented.';
      case 503:
        return 'Bad sequence of commands.';
      case 504:
        return 'Command not implemented for that parameter.';
      case 530:
        return 'Not logged in.';
      case 532:
        return 'Need account for storing files.';
      case 534:
        return 'Could Not Connect to Server - Policy Requires SSL';
      case 550:
        return 'Requested action not taken. File unavailable (e.g. file not found, no access).';
      case 551:
        return 'Requested action aborted. Page type unknown.';
      case 552:
        return 'Requested file action aborted. Exceeded storage allocation (for current directory or dataset).';
      case 553:
        return 'Requested action not taken. File name not allowed.';
      case 10054:
        return 'Connection reset by peer. The connection was forcibly closed by the remote host.';
      case 10060:
        return 'Cannot connect to remote server.';
      case 10061:
        return 'Cannot connect to remote server. The connection is actively refused by the server.';
      case 10066:
        return 'Directory not empty.';
      case 10068:
        return 'Too many users, server is full.';
    }
  }
}

Ftp.busy = false;

export default Ftp;
