import helpers from "../helpers";
import internalFs from "./internalFs";
import externalFs from "./externalFs";
import path from "./path";
import remoteFs from "./remoteFs";

/**
 * 
 * @param {string} fileUri 
 * @returns {Promise<FileSystem>}
 */
function fsOperation(fileUri) {

  return new Promise((resolve, reject) => {

    const url = new URL(fileUri);
    const protocol = url.protocol;
    if (protocol === 'file:' || protocol === 'content:') {

      if (path.isParent(cordova.file.applicationDirectory, fileUri))
        return createInternalFsOperation(internalFs, fileUri, resolve);


      helpers.canWrite(fileUri)
        .then(res => {
          if (res.canWrite) {
            createInternalFsOperation(internalFs, fileUri, resolve);
          } else if (res.uuid) {
            externalStorage.saveOrigin(res.uuid, res.origin);
            const _path = path.subtract(fileUri, res.origin);
            externalFs(res.uuid)
              .then(fs => {
                createExternalFsOperation(fs, _path, resolve, fileUri);
              })
              .catch(reject);
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
                      createExternalFsOperation(fs, path, resolve, fileUri);
                    })
                    .catch(reject);
                  return;
                }

                externalFs(undefined, fileUri)
                  .then(fs => {
                    createExternalFsOperation(fs, undefined, resolve, fileUri);
                  })
                  .catch(reject);
              });
          }
        });
    } else if (protocol === 'ftp:') {

      const {
        username,
        password,
        hostname,
        port
      } = url;

      const fs = remoteFs(username, password, hostname, port);
      createRemoteFsOperation(fs, fileUri, resolve);

    }

  });

  /**
   * 
   * @param {RemoteFs} fs 
   * @param {string} url 
   * @param {CallableFunction} resolve 
   */
  function createRemoteFsOperation(fs, url, resolve) {

    resolve({
      lsDir: () => {
        return fs.listDir(url);
      },
      readFile: encoding => {
        return readFile(fs, url, encoding);
      },
      writeFile: content => {
        return fs.writeFile(url, content);
      },
      createFile: (name, data) => {
        const pathname = new URL(url).pathname;
        data = data || '';
        name = fs.origin + path.join(pathname, name);
        return fs.createFile(name, data);
      },
      createDirectory: name => {
        const pathname = new URL(url).pathname;
        name = fs.origin + path.join(pathname, name);
        return fs.createDir(name);
      },
      deleteFile: () => {
        return fs.deleteFile(url);
      },
      deleteDir: () => {
        return fs.deleteDir(url);
      },
      copyTo: dest => {
        return fs.copyTo(url, dest);
      },
      moveTo: dest => {
        const name = path.name(url);
        const pathname = new URL(dest).pathname;
        dest = fs.origin + path.join(pathname, name);
        return fs.rename(url, dest);
      },
      renameTo: newname => {
        const pathname = new URL(url).pathname;
        const parent = path.parent(pathname);
        newname = fs.origin + path.join(parent, newname);
        return fs.rename(url, newname);
      }
    });

  }

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

      lsDir: () => {
        return listDir(url);
      },
      readFile: encoding => {
        return readFile(fs, url, encoding);
      },
      writeFile: content => {
        return fs.writeFile(url, content, false, false);
      },
      createFile: (name, data) => {
        data = data || '';
        return fs.writeFile(url + name, data, true, true);
      },
      createDirectory: name => {
        return fs.createDir(url, name);
      },
      deleteFile: () => {
        return fs.deleteFile(url);
      },
      deleteDir: () => {
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
   * @param {string} fullPath
   */
  function createExternalFsOperation(fs, url, resolve, fullPath) {

    function moveOrCopy(action, dest) {
      const origin = externalStorage.get(fs.uuid).origin;
      return new Promise((resolve, reject) => {
        verify(origin + url, dest)
          .then(() => {

            if (origin && !path.isParent(origin, dest))
              return Promise.reject("Copying file/directory to different drive is not supported yet.");
            dest = path.subtract(dest, origin);
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

      lsDir: () => {
        return listDir(fullPath);
      },
      readFile: encoding => {
        return readFile(fs, fullPath, encoding);
      },
      writeFile: content => {
        return fs.writeFile(url, content);
      },
      createFile: (name, data) => {
        data = data || '';
        return fs.createFile(url, name, data);
      },
      createDirectory: name => {
        return fs.createDir(url, name);
      },
      deleteFile: () => {
        return fs.deleteFile(url);
      },
      deleteDir: () => {
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

  function readFile(fs, url, encoding) {
    return new Promise((resolve, reject) => {

      fs.readFile(url)
        .then(res => {
          const data = res.data;
          if (encoding) {
            const decoder = new TextDecoder(encoding);
            resolve(decoder.decode(data));
          } else {
            resolve(data);
          }
        })
        .catch(reject);

    });
  }

  function listDir(url) {
    return new Promise((resolve, reject) => {
      const files = [];
      internalFs.listDir(url)
        .then(entries => {
          entries.map(entry => {
            files.push({
              url: entry.nativeURL,
              isDirectory: entry.isDirectory,
              isFile: entry.isFile
            });
          });
          resolve(files);
        })
        .catch(reject);
    });
  }

}

export default fsOperation;