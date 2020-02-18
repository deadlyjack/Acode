import helpers from "../helpers";
import internalFs from "./internalFs";
import externalFs from "./externalFs";

/**
 * 
 * @param {string} fileUri 
 * @returns {Promise<FileSystem>}
 */
function fsOperation(fileUri) {

  return new Promise((resolve, reject) => {

    helpers.canWrite(fileUri)
      .then(res => {
        if (res.canWrite) {
          createInternalFsOperation(internalFs, fileUri, resolve);
        } else if (res.uuid) {
          externalStorage.saveOrigin(res.uuid, res.origin);
          const path = helpers.subtract(fileUri, res.origin);
          externalFs(res.uuid)
            .then(fs => {
              createExternalFsOperation(fs, path, resolve);
            });
        } else {

          externalFs.listExternalStorages()
            .then(res => {
              let origin, path, uuid;
              for (let key in res) {
                const regex = new RegExp("mnt/media_rw/" + key);
                if (regex.test(fileUri)) {
                  [origin, path] = fileUri.split(regex);
                  uuid = key;
                  break;
                }
              }

              if (origin && path) {
                externalStorage.saveOrigin(uuid, origin);
                externalFs(uuid)
                  .then(fs => {
                    createExternalFsOperation(fs, path, resolve);
                  });
                return;
              }

              externalFs(undefined, fileUri)
                .then(fs => {
                  createExternalFsOperation(fs, undefined, resolve);
                });
            });

        }
      });

  });

  /**
   * 
   * @param {InternalFs} fs 
   * @param {string} url 
   * @param {CallableFunction} resolve 
   */
  function createInternalFsOperation(fs, url, resolve) {

    function moveOrCopy(action, dest) {
      return new Promise((resolve, reject) => {
        verify(url, dest)
          .then(res => {
            const {
              src,
              dest
            } = res;

            src[action](dest, undefined, resolve, reject);
          })
          .catch(reject);
      });
    }

    resolve({

      writeFile: content => {
        return fs.writeFile(url, content, false, false);
      },
      createFile: name => {
        return fs.writeFile(url + name, '', true, true);
      },
      createDirectory: name => {
        return fs.createDir(url, name);
      },
      deleteFile: () => {
        return fs.deleteFile(url);
      },
      copyTo: dest => {
        return moveOrCopy("copyTo", dest);
      },
      moveTo: dest => {
        return moveOrCopy("moveTo", dest);
      },
      renameTo: newname => {
        return fs.renameFile(url, newname);
      }

    });

  }
  /**
   * 
   * @param {ExternalFs} fs 
   * @param {string} url 
   * @param {CallableFunction} resolve 
   */
  function createExternalFsOperation(fs, url, resolve) {

    function moveOrCopy(action, dest) {
      const origin = externalStorage.get(fs.uuid).origin;
      return new Promise((resolve, reject) => {
        verify(origin + url, dest)
          .then(() => {

            if (origin && !helpers.isParent(origin, dest))
              return Promise.reject("Copying file/directory to different drive is not supported yet.");
            dest = helpers.subtract(dest, origin);
            const res = fs[action](url, dest);

            if (res) {
              res.then(resolve)
                .catch(reject);
            } else {
              reject();
            }

          })
          .catch(reject);
      });
    }

    resolve({

      writeFile: content => {
        return fs.writeFile(url, content);
      },
      createFile: name => {
        return fs.createFile(url, name);
      },
      createDirectory: name => {
        return fs.createDir(url, name);
      },
      deleteFile: () => {
        return fs.deleteFile(url);
      },
      copyTo: dest => {
        return moveOrCopy("copy", dest);
      },
      moveTo: dest => {
        return moveOrCopy("move", dest);
      },
      renameTo: newname => {
        return fs.renameFile(url, newname);
      }

    });

  }

  /**
   * 
   * @param {string} src 
   * @param {string} dest 
   * @returns {Promise<{src:Entry, dest:Entry}>}
   */
  function verify(src, dest) {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(src, srcEntry => {
        window.resolveLocalFileSystemURL(dest, destEntry => {
          window.resolveLocalFileSystemURL(decodeURI(destEntry.nativeURL) + srcEntry.name, res => {

            reject({
              code: 12
            });

          }, err => {
            if (err.code === 1) {
              resolve({
                src: srcEntry,
                dest: destEntry
              });
            } else {
              reject(err);
            }

          });

        }, reject);
      }, reject);
    });
  }

}

export default fsOperation;