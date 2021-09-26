import mimeType from 'mime-types';
import Url from '../utils/Url';
import internalFs from './internalFs';

if (!Array.isArray(window.__sftpTaskQueue)) {
  window.__sftpTaskQueue = [];
}

if (!('__sftpBusy' in window)) {
  Object.defineProperty(window, '__sftpBusy', {
    get() {
      return !!this.__sftp_busy_;
    },
    set(val) {
      this.__sftp_busy_ = val;
      if (!val) {
        const action = this.__sftpTaskQueue.splice(0, 1)[0];
        if (typeof action === 'function') action();
      }
    },
  });
}

class SFTP {
  #hostname;
  #port;
  #username;
  #authenticationType;
  #password;
  #keyFile;
  #passPhrase;
  #base;
  #connectionID;

  /**
   *
   * @param {String} hostname
   * @param {Number} port
   * @param {String} username
   * @param {{password?: String, passPhrase?: String, keyFile?: String}} authentication
   */
  constructor(hostname, port, username, authentication) {
    this.#hostname = hostname;
    this.#port = port;
    this.#username = username;
    this.#authenticationType = !!authentication.keyFile ? 'key' : 'password';
    this.#keyFile = authentication.keyFile;
    this.#passPhrase = authentication.passPhrase;
    this.#password = authentication.password;
    this.#base = Url.formate({
      protocol: 'sftp:',
      hostname: this.#hostname,
      port: this.#port,
      username: this.#username,
      password: this.#password,
      query: {
        passPhrase: this.#passPhrase,
        keyFile: this.#keyFile,
      },
    });

    this.#connectionID = `${this.#username}@${this.#hostname}`;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.#authenticationType === 'key') {
        sftp.connectUsingKeyFile(
          this.#hostname,
          this.#port,
          this.#username,
          this.#keyFile,
          this.#passPhrase,
          resolve,
          reject,
        );
        return;
      }

      sftp.connectUsingPassword(
        this.#hostname,
        this.#port,
        this.#username,
        this.#password,
        resolve,
        reject,
      );
    });
  }

  /**
   * List directory or get file info
   * @param {String} dirname
   * @param {boolean} isFile
   */
  ls(dirname, isFile) {
    return new Promise((resolve, reject) => {
      sftp.isConnected(async (connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }

          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.ls(dirname, isFile).then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;
          sftp.exec(
            `ls -gaAG --full-time "${this.#safeName(
              dirname,
            )}" | awk '{$2=\"\"; print $0}'`,
            (res) => {
              window.__sftpBusy = false;
              if (res.code <= 0) {
                if (isFile) {
                  resolve(this.#parseFile(res.result, Url.dirname(dirname)));
                  return;
                }
                resolve(this.#parseDir(dirname, res.result));
                return;
              }
              reject(this.#errorCodes(res.code));
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  /**
   *
   * @param {String} filename
   * @param {String} content
   */
  createFile(filename, content) {
    const fullFilename = Url.join(this.#base, filename);
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }
          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.createFile(filename, content).then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;

          const cmd = `[[ -f "${this.#safeName(
            filename,
          )}" ]] && echo "Already exists" || touch "${filename}"`;
          sftp.exec(
            cmd,
            (res) => {
              window.__sftpBusy = false;
              if (res.code <= 0) {
                if (content) {
                  this.writeFile(filename, content)
                    .then(() => resolve(fullFilename))
                    .catch(reject);
                  return;
                }

                resolve(fullFilename);
                return;
              }
              reject(this.#errorCodes(res.code));
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      });
    });
  }

  /**
   *
   * @param {String} dirname
   */
  createDir(dirname) {
    const fullDirname = Url.join(this.#base, dirname);
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }

          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.createDir(dirname).then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;
          sftp.exec(
            `mkdir "${this.#safeName(dirname)}"`,
            (res) => {
              window.__sftpBusy = false;
              if (res.code <= 0) {
                resolve(fullDirname);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      });
    });
  }

  /**
   * Write to a file on server
   * @param {String} filename
   * @param {String} content
   */
  writeFile(filename, content) {
    const localFilename = this.#getLocalname(filename);
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          try {
            if (this.#notConnected(connectionID)) {
              await this.connect();
            }
            if (window.__sftpBusy) {
              window.__sftpTaskQueue.push(() => {
                this.writeFile(filename, content).then(resolve).catch(reject);
              });
              return;
            }
            window.__sftpBusy = true;
            await internalFs.writeFile(localFilename, content, true, false);
            sftp.putFile(
              this.#safeName(filename),
              localFilename,
              (res) => {
                window.__sftpBusy = false;
                resolve(res);
              },
              (err) => {
                window.__sftpBusy = false;
                reject(err);
              },
            );
          } catch (err) {
            reject(err);
          }
        })();
      }, reject);
    });
  }

  /**
   * Read the file from server
   * @param {String} filename
   */
  readFile(filename) {
    const localFilename = this.#getLocalname(filename);
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }

          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.readFile(filename).then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;
          sftp.getFile(
            this.#safeName(filename),
            localFilename,
            async () => {
              window.__sftpBusy = false;
              try {
                resolve(await internalFs.readFile(localFilename));
              } catch (error) {
                reject(error);
              }
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      });
    });
  }

  copyTo(filename, dest) {
    const fullDest = Url.join(this.#base, dest, Url.basename(filename));
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }

          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.copyTo(filename, dest).then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;
          const cmd = `cp -r "${this.#safeName(filename)}" "${this.#safeName(
            dest,
          )}"`;
          sftp.exec(
            cmd,
            (res) => {
              window.__sftpBusy = false;
              if (res.code <= 0) {
                resolve(fullDest);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  moveTo(filename, dest) {
    return this.rename(filename, dest, true);
  }

  /**
   * Renames file and directory, it can also be use to move directory or file
   * @param {String} filename
   * @param {String} newname
   * @param {Boolean} move
   */
  rename(filename, newname, move) {
    const fullNewname = Url.join(this.#base, newname);
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }

          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.rename(filename, newname, move).then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;
          const cmd = `mv "${this.#safeName(filename)}" "${this.#safeName(
            newname,
          )}"`;
          sftp.exec(
            cmd,
            (res) => {
              window.__sftpBusy = false;
              if (res.code <= 0) {
                resolve(
                  move
                    ? Url.join(fullNewname, Url.basename(filename))
                    : fullNewname,
                );
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  /**
   * Delete file or directory
   * @param {String} filename
   * @param {'file' | 'dir'} type
   */
  delete(filename, type) {
    const fullFilename = Url.join(this.#base, filename);
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }

          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.delete(filename, type).then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;
          const cmd = `rm ${type === 'dir' ? '-rf' : ''} "${this.#safeName(
            filename,
          )}"`;
          sftp.exec(
            cmd,
            (res) => {
              window.__sftpBusy = false;
              if (res.code <= 0) {
                resolve(fullFilename);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  pwd() {
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          if (this.#notConnected(connectionID)) {
            try {
              await this.connect();
            } catch (error) {
              reject(error);
              return;
            }
          }

          if (window.__sftpBusy) {
            window.__sftpTaskQueue.push(() => {
              this.pwd().then(resolve).catch(reject);
            });
            return;
          }
          window.__sftpBusy = true;
          sftp.exec(
            'pwd',
            (res) => {
              window.__sftpBusy = false;
              if (res.code <= 0) {
                resolve(res.result);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              window.__sftpBusy = false;
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  async stats(filename) {
    filename = this.#safeName(filename);
    const file = await this.ls(filename, true);

    return {
      name: file.name,
      exists: true,
      length: file.size,
      isFile: file.isFile,
      isDirectory: file.isDirectory,
      isVirtual: file.isLink,
      canWrite: file.canWrite,
      canRead: file.canRead,
      lastModified: file.modifiedDate,
      type: mimeType.lookup(filename),
      uri: file.url,
    };
  }

  /**
   *
   * @param {String} dirname
   * @param {String} res
   */
  #parseDir(dirname, res) {
    if (!res) return [];

    const list = res.split('\n');

    if (/total/.test(list[0])) list.splice(0, 1);

    const fileList = list.map((i) => this.#parseFile(i, dirname));
    return fileList.filter((i) => !!i);
  }

  #parseFile(item, dirname) {
    if (!item) return null;
    const PERMISSIONS = 0;
    const SIZE = 2;
    const MODIFIED_DATE = 3;
    const MODIFIED_TIME = 4;
    const MODIFIED_TIME_ZONE = 5;
    const NAME = 6;
    const DIR_TYPE = (ch) => {
      switch (ch) {
        case 'd':
          return 'directory';
        case 'l':
          return 'link';
        default:
          return 'file';
      }
    };

    const itemData = item.split(' ');
    const GET = (len, join = true) => {
      const str = itemData.splice(len);
      return join ? str.join(' ') : str;
    };

    let name = GET(NAME, false);
    const modTimeZone = GET(MODIFIED_TIME_ZONE);
    const modTime = GET(MODIFIED_TIME);
    const modDate = GET(MODIFIED_DATE);
    const size = parseInt(GET(SIZE)) || 0;
    const permissions = GET(PERMISSIONS);
    const date = new Date(`${modDate} ${modTime} ${modTimeZone}`);
    const canrw = permissions.substr(1, 2);
    const type = DIR_TYPE(permissions[0]);

    if (type === 'link') {
      name.splice(name.indexOf('->'));
    }
    name = Url.basename(name.join(' '));
    if (['..', '.', '`'].includes(name)) return null;

    return {
      name,
      size,
      canRead: /r/.test(canrw),
      canWrite: /w/.test(canrw),
      isDirectory: type === 'directory',
      isLink: type === 'link',
      isFile: type === 'file',
      modifiedDate: date,
      type,
      url: Url.join(this.#base, dirname || '', name),
    };
  }

  /**
   *
   * @param {String} name
   */
  #safeName(name) {
    const escapeCh = (str) => str.replace(/\\([\s\S])|([`"])/g, '\\$1$2');
    const ar = name.split('/');
    return ar.map((dirname) => escapeCh(dirname)).join('/');
  }

  #errorCodes(code, dlft = strings['an error occurred']) {
    switch (code) {
      case 0:
        return strings['success'];
      case 1:
        return strings['operation not permitted'];
      case 2:
        return strings['no such file or directory'];
      case 5:
        return strings['input/output error'];
      case 13:
        return strings['permission denied'];
      case 14:
        return strings['bad address'];
      case 17:
        return strings['file exists'];
      case 20:
        return strings['not a directory'];
      case 21:
        return strings['is a directory'];
      case 22:
        return strings['invalid argument'];
      case 23:
        return strings['too many open files in system'];
      case 24:
        return strings['too many open files'];
      case 26:
        return strings['text file busy'];
      case 27:
        return strings['file too large'];
      case 28:
        return strings['no space left on device'];
      case 30:
        return strings['read-only file system'];
      case 37:
        return strings['too many users'];
      case 110:
        return strings['connection timed out'];
      case 111:
        return strings['connection refused'];
      case 130:
        return strings['owner died'];

      default:
        return dlft;
    }
  }

  /**
   *
   * @param {String} connectionID
   * @returns {Boolean}
   */
  #notConnected(connectionID) {
    return !connectionID || connectionID !== this.#connectionID;
  }

  /**
   *
   * @param {String} filename
   * @returns {String}
   */
  #getLocalname(filename) {
    return Url.join(
      CACHE_STORAGE,
      'sftp' + Url.join(this.#base, filename).hashCode(),
    );
  }
}

/**
 *
 * @param {String} host
 * @param {Number} port
 * @param {String} username
 * @param {{password?: String, passPhrase?: String, keyFile?: String}} authentication
 */
function Sftp(host, port, username, authentication) {
  return new SFTP(host, port, username, authentication);
}

export default Sftp;
