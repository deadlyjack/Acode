import helpers from "../utils/helpers";
import internalFs from "./internalFs";
import externalFs from "./externalFs";
import path from "../utils/path";
import remoteFs from "./remoteFs";
import Url from "../utils/Url";

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
            const _path = fileUri.subtract(res.origin);
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

      let security, mode;

      if (url.search) {
        const parsedQuery = helpers.parseQuery(url.search);
        security = parsedQuery.security;
        mode = parsedQuery.mode;
      }

      const fs = remoteFs(decodeURIComponent(username), decodeURIComponent(password), decodeURIComponent(hostname), port, security, mode);
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

    const {
      origin,
      query
    } = fs.originObject;

    resolve({
      lsDir: () => fs.listDir(url),
      readFile: encoding => readFile(fs, url, encoding),
      writeFile: content => fs.writeFile(url, content),
      createFile: (name, data) => {
        let pathname = Url.pathname(url);

        data = data || '';
        name = origin + path.join(pathname, name) + query;
        return fs.createFile(name, data);
      },
      createDirectory: name => {
        let pathname = Url.pathname(url);
        name = origin + path.join(pathname, name) + query;
        return fs.createDir(name);
      },
      deleteFile: () => fs.deleteFile(url),
      deleteDir: () => fs.deleteDir(url),
      copyTo: dest => fs.copyTo(url, dest),
      moveTo: dest => {
        let pathname = Url.pathname(dest);

        const name = path.basename(url);
        dest = origin + path.join(pathname, name) + query;
        return fs.rename(url, dest);
      },
      renameTo: newname => {
        let pathname = Url.pathname(url);
        const parent = path.dirname(pathname);
        newname = origin + path.join(parent, newname) + query;
        return fs.rename(url, newname);
      },
      exists: () => fs.exists(url)
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
      lsDir: () => listDir(url),
      readFile: encoding => readFile(fs, url, encoding),
      writeFile: content => fs.writeFile(url, content, false, false),
      createFile: (name, data) => fs.writeFile(url + name, data || "", true, true),
      createDirectory: name => fs.createDir(url, name),
      deleteFile: () => fs.deleteFile(url),
      deleteDir: () => fs.deleteFile(url),
      copyTo: dest => moveOrCopy("copyTo", dest),
      moveTo: dest => moveOrCopy("moveTo", dest),
      renameTo: newname => fs.renameFile(url, newname),
      exists: () => pathExist(url)
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
            dest = dest.subtract(origin);
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
      },
      exists: () => pathExist(url)

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
              url: decodeURL(entry.nativeURL),
              isDirectory: entry.isDirectory,
              isFile: entry.isFile
            });
          });
          resolve(files);
        })
        .catch(reject);
    });
  }

  /**
   * 
   * @param {Promise<Boolean>} url 
   */
  function pathExist(url) {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(url, entry => {
        resolve(true);
      }, err => {
        if (err.code === 1) resolve(false);
        reject(err);
      });
    });
  }

}

export default fsOperation;