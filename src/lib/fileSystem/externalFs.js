import dialogs from '../../components/dialogs';
import internalFs from './internalFs';

export default {
  readFile(url) {
    return new Promise((resolve, reject) => {
      sdcard.formatUri(
        url,
        (uri) => {
          internalFs.readFile(uri).then(resolve).catch(reject);
        },
        reject
      );
    });
  },

  writeFile(filename, content) {
    return new Promise(async (resolve, reject) => {
      if (content instanceof ArrayBuffer) {
        content = await toBase64(content);
        sdcard.write(
          filename,
          content,
          true,
          (res) => resolve(res),
          (err) => reject(err)
        );
        return;
      }

      sdcard.write(
        filename,
        content,
        (res) => resolve(res),
        (err) => reject(err)
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

  copy(src, dest) {
    return new Promise((resolve, reject) => {
      sdcard.copy(
        src,
        dest,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  move(src, dest) {
    return new Promise((resolve, reject) => {
      sdcard.move(
        src,
        dest,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  deleteFile(filename) {
    return new Promise((resolve, reject) => {
      sdcard.delete(
        filename,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  createFile(parent, filename, data) {
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
              (err) => reject(err)
            );
          resolve(res);
        },
        (err) => reject(err)
      );
    });
  },

  createDir(parent, dirname) {
    return new Promise((resolve, reject) => {
      sdcard.createDir(
        parent,
        dirname,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  listDir(pathname) {
    return new Promise((resolve, reject) => {
      sdcard.listDir(pathname, resolve, reject);
    });
  },

  renameFile(src, newname) {
    return new Promise((resolve, reject) => {
      sdcard.rename(
        src,
        newname,
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  getStorageAccessPermission(uuid, name) {
    return new Promise((resolve, reject) => {
      const version = parseInt(device.version);
      const versionAlpha =
        typeof device.version === 'string'
          ? device.version.toLocaleLowerCase()
          : '';
      if (version < 7 || version > 9 || ['q', 'r'].includes(versionAlpha)) {
        dialogs.loader.destroy();
        dialogs
          .box(
            'INFO',
            `<p>Follow below steps to allow Acode to modify <strong>${
              name || 'SD card'
            }</strong>.<p><br>` + '<img src="./res/imgs/steps.jpg">'
          )
          .onhide(next);
      } else {
        next();
      }

      function next() {
        setTimeout(() => {
          dialogs.loader.destroy();
        }, 100);
        sdcard.getStorageAccessPermission(
          uuid,
          (result) => {
            resolve(result);
          },
          (err) => {
            reject(err);
          }
        );
      }
    });
  },

  listStorages() {
    return new Promise((resolve, reject) => {
      sdcard.listStorages(
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  },

  getPath(uri, filename) {
    return new Promise((resolve, reject) => {
      sdcard.getPath(uri, filename, resolve, reject);
    });
  },

  stats(uri) {
    return new Promise((resolve, reject) => {
      sdcard.formatUri(
        uri,
        (res) => {
          sdcard.stats(
            uri,
            (stats) => {
              stats.uri = res;
              resolve(stats);
            },
            reject
          );
        },
        reject
      );
    });
  },
};
