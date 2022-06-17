import helpers from "../utils/helpers";
import Path from "../utils/Path";
import Url from "../utils/Url";
import internalFs from "./internalFs";

// set path not implemented

class FtpClient {
  #path = '/';
  #host;
  #username;
  #password;
  #port;
  #security;
  #mode;
  #conId;
  #stat;
  #origin;

  constructor(host, username = 'anonymous', password = '', port = 21, security = 'ftp', mode = 'passive', path = '/') {
    if (!host) {
      throw new Error('host is required');
    }
    this.#host = host;
    this.#username = username;
    this.#password = password;
    this.#port = port;
    this.#security = security;
    this.#mode = mode;
    this.#path = path;

    this.#origin = Url.formate({
      protocol: 'ftp:',
      hostname: this.#host,
      password: this.#password,
      username: this.#username,
      port: this.#port,
      query: {
        security: this.#security,
        mode: this.#mode
      }
    })
  }

  async connect() {
    await new Promise((resolve, reject) => {
      ftp.connect(this.#host, +this.#port, this.#username, this.#password, {
        securityType: this.#security,
        connectionMode: this.#mode,
        encoding: 'utf8'
      }, (conId) => {
        this.#conId = conId;
        resolve();
      }, reject);
    });
  }

  setPath(val) {
    this.#path = val;
  }

  async listDir() {
    await this.#connectIfNotConnected();
    return new Promise((resolve, reject) => {
      ftp.listDirectory(this.#conId, this.#path, (list) => {
        resolve(list.map((i) => {
          i.url = Url.join(this.#origin, i.url);
          return i;
        }));
      }, reject);
    });
  }

  async readFile() {
    await this.#connectIfNotConnected();
    return new Promise((resolve, reject) => {
      ftp.downloadFile(this.#conId, this.#path, this.#cacheFile, async () => {
        const content = await internalFs.readFile(this.#cacheFile);
        resolve(content);
      }, reject);
    });
  }

  async writeFile(content = '') {
    await this.#connectIfNotConnected();
    const localFile = this.#cacheFile;
    await internalFs.writeFile(localFile, content, true, false);

    return new Promise((resolve, reject) => {
      ftp.uploadFile(this.#conId, this.#cacheFile, this.#path, () => {
        resolve(Url.join(this.#origin, this.#path));
      }, reject);
    });
  }

  async createFile(name, content = '') {
    await this.#connectIfNotConnected();
    const localFile = this.#cacheFile;
    await internalFs.writeFile(localFile, content, true, false);

    return new Promise((resolve, reject) => {
      ftp.uploadFile(this.#conId, this.#cacheFile, Path.join(this.#path, name), () => {
        resolve(Url.join(this.#origin, this.#path, name));
      }, reject);
    });
  }

  async createDir(name) {
    await this.#connectIfNotConnected();
    return new Promise((resolve, reject) => {
      ftp.createDirectory(this.#conId, Path.join(this.#path, name), () => {
        resolve(Url.join(this.#origin, this.#path, name));
      }, reject);
    });
  }

  async delete() {
    await this.#connectIfNotConnected();
    return new Promise((resolve, reject) => {
      let deleteOperation;

      if (this.#stat.isDirectory) {
        deleteOperation = ftp.deleteDirectory;
      } else {
        deleteOperation = ftp.deleteFile;
      }

      deleteOperation(this.#conId, this.#path, () => {
        resolve(Url.join(this.#origin, this.#path));
      }, reject);
    });
  }

  async rename(newName) {
    await this.#connectIfNotConnected();
    const path = Path.dirname(this.#path);
    const newPath = Path.join(path, newName);
    return new Promise((resolve, reject) => {
      ftp.rename(this.#conId, this.#path, newPath, () => {
        this.#path = newPath;
        resolve(Url.join(this.#origin, newPath));
      }, reject);
    });
  }

  async moveTo(newPath) {
    newPath = Path.join(
      newPath,
      Path.basename(this.#path),
    );
    await this.#connectIfNotConnected();
    return new Promise((resolve, reject) => {
      ftp.rename(this.#conId, this.#path, newPath, () => {
        this.#path = newPath;
        resolve(Url.join(this.#origin, newPath));
      }, reject);
    });
  }

  async exists() {
    await this.#connectIfNotConnected();
    return new Promise((resolve, reject) => {
      ftp.exists(this.#conId, this.#path, resolve, reject);
    });
  }

  async stat() {

    if (this.#stat) return this.#stat;

    await this.#connectIfNotConnected();
    await this.#getStat();
    return this.#stat;
  }

  async copyTo(newPath) {
    throw new Error('Not supported by FTP.');
  }

  async getWorkingDirectory() {
    await this.#connectIfNotConnected();
    return new Promise((resolve, reject) => {
      ftp.getWorkingDirectory(this.#conId, resolve, reject);
    });
  }

  async #getStat() {
    return new Promise((resolve, reject) => {
      ftp.getStat(this.#conId, this.#path, (stat) => {
        this.#stat = stat;
        resolve(stat);
      }, (err) => {
        console.error('Error while getting stat', err);
        reject(err);
      });
    });
  }

  get #cacheFile() {
    return Url.join(CACHE_STORAGE, 'ftp' + Url.join(this.#origin, this.#path).hashCode());
  }

  async #isConnected() {
    if (!this.#conId) return false;
    return new Promise((resolve, reject) => {
      ftp.isConnected(this.#conId, (isConnected) => {
        resolve(isConnected);
      }, reject);
    });
  }

  async #connectIfNotConnected() {
    const isConnected = await this.#isConnected();
    if (!isConnected) {
      await this.connect();
    }
  }
}

export default function Ftp(path, host, port, username, password, security, mode) {
  return new FtpClient(path, host, port, username, password, security, mode);
}