import helpers from "../utils/helpers";
import internalFs from "./internalFs";
import externalFs from "./externalFs";
import path from "../utils/Path";
import remoteFs from "./remoteFs";
import Url from "../utils/Url";
import dialogs from "../../components/dialogs";
import constants from "../constants";

/**
 * 
 * @param {string} uri 
 * @returns {Promise<FileSystem>}
 */
function fsOperation(uri) {

  return new Promise((resolve, reject) => {
    const protocol = Url.getProtocol(uri);
    if (protocol === 'file:') {
      const match = constants.EXTERNAL_STORAGE.exec(uri);
      if (!IS_ANDROID_VERSION_5 && match && match[1] !== "emulated") {
        convertToContentUri(uri)
          .then(res => createExternalFsOperation(externalFs, res, resolve));
      } else {
        createInternalFsOperation(internalFs, uri, resolve);
      }

    } else if (protocol === "content:") {

      createExternalFsOperation(externalFs, uri, resolve);

    } else if (protocol === 'ftp:') {

      const {
        username,
        password,
        hostname,
        port,
        search
      } = new URL(uri);

      let security, mode;

      if (search) {
        const parsedQuery = helpers.parseQuery(search);
        security = parsedQuery.security;
        mode = parsedQuery.mode;
      }

      const fs = remoteFs(decodeURIComponent(username), decodeURIComponent(password), decodeURIComponent(hostname), port, security, mode);
      createRemoteFsOperation(fs, uri, resolve);

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
      exists: () => fs.exists(url),
      stats: () => fs.stats(url)
    });

  }

  /**
   * 
   * @param {InternalFs} fs 
   * @param {string} url 
   * @param {CallableFunction} resolve 
   */
  function createInternalFsOperation(fs, url, resolve) {
    resolve({
      lsDir: () => listDir(url),
      readFile: encoding => readFile(fs, url, encoding),
      writeFile: content => fs.writeFile(url, content, false, false),
      createFile: (name, data) => fs.writeFile(Url.join(url, name), data || "", true, true),
      createDirectory: name => fs.createDir(url, name),
      deleteFile: () => fs.deleteFile(url),
      deleteDir: () => fs.deleteFile(url),
      copyTo: dest => fs.moveOrCopy("copyTo", url, dest),
      moveTo: dest => fs.moveOrCopy("moveTo", url, dest),
      renameTo: newname => fs.renameFile(url, newname),
      exists: () => fs.exists(url),
      stats: () => fs.stats(url)
    });

  }

  /**
   * 
   * @param {ExternalFs} fs 
   * @param {string} url 
   * @param {CallableFunction} resolve
   */
  function createExternalFsOperation(fs, url, resolve) {

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
        return fs.copy(url, dest);
      },
      moveTo: dest => {
        return fs.move(url, dest);
      },
      renameTo: newname => {
        return fs.renameFile(url, newname);
      },
      exists: () => {
        return new Promise((resolve, reject) => {
          sdcard.exists(url, res => {
            if (res === "TRUE") resolve(true);
            else resolve(false);
          }, reject);
        });
      },
      stats: () => fs.stats(url)
    });

  }

  function readFile(fs, url, encoding) {
    return new Promise((resolve, reject) => {

      fs.readFile(url)
        .then(res => {
          const data = res.data;
          if (encoding)
            resolve(helpers.decodeText(data));
          else
            resolve(data);
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

}

/**
 * 
 * @param {String} uri 
 */
async function convertToContentUri(uri) {
  const uuid = constants.EXTERNAL_STORAGE.exec(uri)[1];
  const filePath = Url.join(
    `content://com.android.externalstorage.documents/tree/${uuid}%3A`,
    uri.replace(constants.EXTERNAL_STORAGE, "")
  );

  const canWrite = await (() => new Promise((resolve, reject) => {
    sdcard.stats(filePath, res => resolve(res.canWrite), reject);
  }))();

  if (!canWrite) {
    try {
      await (() => new Promise((resolve, reject) => {
        dialogs.confirm(strings.info.toUpperCase(), strings["allow storage"])
          .then(() => sdcard.getStorageAccessPermission(uuid, resolve, reject))
          .catch(() => reject(strings["permission denied"]));
      }))();
    } catch (error) {
      if (typeof error === "string") {
        dialogs.alert(strings.info.toUpperCase(), error);
        throw new Error(error);
      } else {
        dialogs.alert(strings.info.toUpperCase(), error.message);
        throw error;
      }
    }
  }

  return filePath;

}

export default fsOperation;