import mimeType from 'mime-types';
import helpers from '../utils/helpers';
import Path from '../utils/Path';
import Url from '../utils/Url';
import internalFs from './internalFs';
import appSettings from '../lib/settings';

class SftpClient {
  #MAX_TRY = 3;
  #hostname;
  #port;
  #username;
  #authenticationType;
  #password;
  #keyFile;
  #passPhrase;
  #base;
  #connectionID;
  #path;
  #stat;
  #retry = 0;

  /**
   *
   * @param {String} hostname
   * @param {Number} port
   * @param {String} username
   * @param {{password?: String, passPhrase?: String, keyFile?: String}} authentication
   */
  constructor(hostname, port = 22, username, authentication) {
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

  setPath(path) {
    this.#path = path;
  }

  /**
   * List directory or get file info
   * @param {boolean} stat
   */
  lsDir(stat) {
    if (!this.#path) {
      throw new Error('Path is not set');
    }
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

          const path = this.#safeName(this.#path);
          let options = '-gaAG';
          if (stat) options += 'd';

          sftp.exec(
            `ls ${options} --full-time "${path}" | awk '{$2=\"\"; print $0}'`,
            (res) => {
              if (res.code <= 0) {
                if (stat) {
                  resolve(this.#parseFile(res.result, Url.dirname(this.#path)));
                  return;
                }
                resolve(this.#parseDir(this.#path, res.result));
                return;
              }
              reject(this.#errorCodes(res.code));
            },
            (err) => {
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
    filename = Path.join(this.#path, filename);
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

          const file = this.#safeName(filename);
          const cmd = `[[ -f "${file}" ]] && echo "Already exists" || touch "${filename}"`;
          sftp.exec(
            cmd,
            (res) => {
              if (res.code <= 0) {
                if (content) {
                  this.writeFile(content, filename)
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
    dirname = Path.join(this.#path, dirname);
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

          sftp.exec(
            `mkdir "${this.#safeName(dirname)}"`,
            (res) => {
              if (res.code <= 0) {
                resolve(fullDirname);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              reject(err);
            },
          );
        })();
      });
    });
  }

  /**
   * Write to a file on server
   * @param {String} content
   */
  writeFile(content, remotefile) {
    const filename = remotefile || this.#path;
    const localFilename = this.#getLocalname(filename);
    return new Promise((resolve, reject) => {
      sftp.isConnected((connectionID) => {
        (async () => {
          try {
            if (this.#notConnected(connectionID)) {
              await this.connect();
            }

            await internalFs.writeFile(localFilename, content, true, false);
            const remoteFile = this.#safeName(filename);
            sftp.putFile(remoteFile, localFilename, resolve, reject);
          } catch (err) {
            reject(err);
          }
        })();
      }, reject);
    });
  }

  /**
   * Read the file from server
   */
  readFile(encoding) {
    const filename = this.#path;
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

          sftp.getFile(
            this.#safeName(filename),
            localFilename,
            async () => {
              try {
                const data = await internalFs.readFile(localFilename, encoding);
                resolve(data);
              } catch (error) {
                reject(error);
              }
            },
            (err) => {
              reject(err);
            },
          );
        })();
      });
    });
  }

  copyTo(dest) {
    const src = this.#path;
    const fullDest = Url.join(this.#base, dest, Url.basename(src));
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

          const cmd = `cp -r "${this.#safeName(src)}" "${this.#safeName(dest)}"`;
          sftp.exec(
            cmd,
            (res) => {
              if (res.code <= 0) {
                resolve(fullDest);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  moveTo(dest) {
    return this.rename(dest, true);
  }

  /**
   * Renames file and directory, it can also be use to move directory or file
   * @param {String} newname
   * @param {Boolean} move
   */
  rename(newname, move) {
    const src = this.#path;
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

          newname = move ? newname : Path.join(Path.dirname(src), newname);
          const cmd = `mv "${this.#safeName(src)}" "${this.#safeName(newname)}"`;
          sftp.exec(
            cmd,
            (res) => {
              if (res.code <= 0) {
                resolve(
                  move
                    ? Url.join(fullNewname, Url.basename(src))
                    : fullNewname,
                );
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  /**
   * Delete file or directory
   */
  delete() {
    const filename = this.#path;
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
          await this.#setStat();
          const cmd = `rm ${this.#stat.isDirectory ? '-r' : ''} "${this.#safeName(filename)}"`;
          sftp.exec(
            cmd,
            (res) => {
              if (res.code <= 0) {
                resolve(fullFilename);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
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

          sftp.exec(
            'pwd',
            (res) => {
              if (res.code <= 0) {
                resolve(res.result);
                return;
              }

              reject(this.#errorCodes(res.code));
            },
            (err) => {
              reject(err);
            },
          );
        })();
      }, reject);
    });
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const retry = (err) => {
        if (appSettings.value.retryRemoteFsAfterFail) {
          if (++this.#retry > this.#MAX_TRY) {
            this.#retry = 0;
            reject(err);
          } else {
            this.connect()
              .then(resolve)
              .catch(reject);
          }
        } else {
          reject(err);
        }
      };

      if (this.#authenticationType === 'key') {
        sftp.connectUsingKeyFile(
          this.#hostname,
          this.#port,
          this.#username,
          this.#keyFile,
          this.#passPhrase,
          resolve,
          retry,
        );
        return;
      }

      sftp.connectUsingPassword(
        this.#hostname,
        this.#port,
        this.#username,
        this.#password,
        resolve,
        retry,
      );
    });
  }

  async exists() {
    return (await this.stat()).exists;
  }

  async stat() {
    if (this.#stat) return this.#stat;

    const filename = this.#safeName(this.#path);
    const file = await this.lsDir(filename, true);
    if (!file) return null;

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

  get localName() {
    return this.#getLocalname(this.#path);
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


  async #setStat() {
    if (!this.#stat) {
      this.#stat = await this.stat();
    }
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
  return new SftpClient(host, port, username, authentication);
}

Sftp.fromUrl = (url) => {
  const { username, password, hostname, pathname, port, query } = helpers.decodeUrl(url);
  const { keyFile, passPhrase } = query;

  const sftp = new SftpClient(hostname, port || 22, username, {
    password,
    keyFile,
    passPhrase,
  });

  sftp.setPath(pathname);
  return createFs(sftp);
}

Sftp.test = (url) => /^sftp:/.test(url);

function createFs(sftp) {
  return {
    lsDir() {
      return sftp.lsDir();
    },
    async readFile(encoding) {
      const { data } = await sftp.readFile(encoding);
      return data;
    },
    writeFile(content) {
      return sftp.writeFile(content);
    },
    createFile(name, data) {
      return sftp.createFile(name, data);
    },
    createDirectory(name) {
      return sftp.createDir(name);
    },
    delete() {
      return sftp.delete();
    },
    copyTo(dest) {
      dest = Url.pathname(dest);
      return sftp.copyTo(dest);
    },
    moveTo(dest) {
      dest = Url.pathname(dest);
      return sftp.moveTo(dest);
    },
    renameTo(newname) {
      return sftp.rename(newname);
    },
    exists() {
      return sftp.exists();
    },
    stat() {
      return sftp.stat();
    },
    get localName() {
      return sftp.localName;
    }
  };
}

export default Sftp;
