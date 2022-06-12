import dialogs from '../../components/dialogs';
import internalFs from './internalFs';

export default {
  async readFile(uri) {
    uri = await this.formatUri(uri);
    return new Promise((resolve, reject) => {
      internalFs.readFile(uri).then(resolve).catch(reject)
    });
  },

  async writeFile(filename, content) {
    return new Promise(async (resolve, reject) => {
      if (content instanceof ArrayBuffer) {
        content = await toBase64(content);
        sdcard.write(
          filename,
          content,
          true,
          resolve,
          reject,
        );
        return;
      }

      sdcard.write(
        filename,
        content,
        resolve,
        reject,
      );
    });

    function toBase64(data) {
      const blob = new Blob([data]);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          resolve(data.substr(data.indexOf(',') + 1));
        };
        reader.onerror = (err) => {
          reject(err);
        };
        reader.readAsDataURL(blob);
      });
    }
  },

  async copy(src, dest) {
    return new Promise((resolve, reject) => {
      sdcard.copy(
        src,
        dest,
        resolve,
        reject,
      );
    });
  },

  async move(src, dest) {
    return new Promise((resolve, reject) => {
      sdcard.move(
        src,
        dest,
        resolve,
        reject,
      );
    });
  },

  async delete(name) {
    return new Promise((resolve, reject) => {
      sdcard.delete(
        name,
        resolve,
        reject,
      );
    });
  },

  async createFile(parent, filename, data) {
    return new Promise((resolve, reject) => {
      sdcard.createFile(
        parent,
        filename,
        (res) => {
          if (data)
            return sdcard.write(
              res,
              data,
              () => resolve(res),
              reject,
            );
          resolve(res);
        },
        reject,
      );
    });
  },

  async createDir(parent, dirname) {
    return new Promise((resolve, reject) => {
      sdcard.createDir(
        parent,
        dirname,
        resolve,
        reject,
      );
    });
  },

  async listDir(pathname) {
    return new Promise((resolve, reject) => {
      sdcard.listDir(pathname, resolve, reject);
    });
  },

  async renameFile(src, newname) {
    return new Promise((resolve, reject) => {
      sdcard.rename(
        src,
        newname,
        resolve,
        reject,
      );
    });
  },

  getStorageAccessPermission(uuid, name) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        dialogs.loader.destroy();
      }, 100);
      sdcard.getStorageAccessPermission(
        uuid,
        resolve,
        reject,
      );
    });
  },

  listStorages() {
    return new Promise((resolve, reject) => {
      sdcard.listStorages(
        resolve,
        reject,
      );
    });
  },

  getPath(uri, filename) {
    return new Promise((resolve, reject) => {
      sdcard.getPath(uri, filename, resolve, reject);
    });
  },

  async stats(uri) {
    uri = await this.formatUri(uri);
    return new Promise((resolve, reject) => {
      sdcard.stats(
        uri,
        (stats) => {
          stats.uri = uri;
          resolve(stats);
        },
        reject,
      );
    });
  },

  formatUri(uri) {
    return new Promise((resolve, reject) => {
      sdcard.formatUri(
        uri,
        resolve,
        reject,
      );
    });
  }
};
