import helpers from "../utils/helpers";
import dialogs from "../../components/dialogs";
import internalFs from "./internalFs";

/**
 * 
 * @param {string} uuid
 * @param {string} [uri]
 * @returns {Promise<ExternalFs>} 
 */
function externalFs(uuid, uri) {

  if (!uuid && !uri) throw new Error("uuid or uri required");

  let rootPath = uuid ? (externalStorage.get(uuid) || {}).path : uri;
  const fs = {
    readFile,
    writeFile,
    move,
    copy,
    deleteFile,
    createFile,
    createDir,
    renameFile,
    uuid
  };


  return new Promise((res, rej) => {

    if (!rootPath) {

      const version = parseInt(device.version);
      const versionAlpha = typeof device.version === 'string' ? device.version.toLocaleLowerCase() : "";
      if (version < 7 || version > 9 || ['q', 'r'].includes(versionAlpha)) {

        dialogs.box(
            'INFO',
            '<p>Follow below steps to allow Acode to modify sdcard data.<p><br>' +
            '<img src="./res/imgs/steps.jpg">'
          )
          .onhide(next);

      } else {

        next();

      }



    } else {
      res(fs);
    }

    function next() {
      setTimeout(() => {
        dialogs.loaderHide();
      }, 100);
      SDcard.open(uuid, result => {
        rootPath = result;
        externalStorage.savePath(uuid, result);
        res(fs);
      }, err => {
        rej(err);
      });
    }

  });

  function readFile(url) {
    return internalFs.readFile(url);
  }

  function writeFile(filename, content) {
    filename = decodeURL(filename);
    return new Promise((resolve, reject) => {
      SDcard.write(rootPath, filename, content, res => resolve(res), err => reject(err));
    });
  }

  function copy(src, dest) {
    src = decodeURL(src);
    dest = decodeURL(dest);

    return new Promise((resolve, reject) => {
      SDcard.copy(rootPath, src, dest, res => resolve(res), err => reject(err));
    });
  }

  function move(src, dest) {
    src = decodeURL(src);
    dest = decodeURL(dest);

    return new Promise((resolve, reject) => {
      SDcard.move(rootPath, src, dest, res => resolve(res), err => reject(err));
    });
  }

  function deleteFile(filename) {
    filename = decodeURL(filename);

    return new Promise((resolve, reject) => {
      SDcard.delete(rootPath, filename, res => resolve(res), err => reject(err));
    });
  }

  function createFile(parent, filename, data) {
    parent = decodeURL(parent);
    filename = decodeURL(filename);

    return new Promise((resolve, reject) => {
      SDcard.touch(rootPath, parent, filename, res => {
        if (data) {
          if (!parent.endsWith("/")) parent += '/';
          return SDcard.write(rootPath, parent + filename, data, res => resolve(res), err => reject(err));
        }
        resolve(res);
      }, err => reject(err));
    });
  }

  function createDir(parent, dirname) {
    parent = decodeURL(parent);
    dirname = decodeURL(dirname);

    return new Promise((resolve, reject) => {
      SDcard.mkdir(rootPath, parent, dirname, res => resolve(res), err => reject(err));
    });
  }

  function renameFile(src, newname) {
    src = decodeURL(src);
    newname = decodeURL(newname);

    return new Promise((resolve, reject) => {
      SDcard.rename(rootPath, src, newname, res => resolve(res), err => reject(err));
    });
  }
}

externalFs.listExternalStorages = function () {
  return new Promise((resolve, reject) => {
    SDcard.list(res => resolve(res), err => reject(err));
  });
};

externalFs.getPath = function (uuid) {
  return new Promise((resolve, reject) => {
    SDcard.open(uuid, resolve, reject);
  });
};

export default externalFs;