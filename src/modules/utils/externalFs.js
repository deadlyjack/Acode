import helpers from "../helpers";
import dialogs from "../../components/dialogs";

/**
 * 
 * @param {string} uuid
 * @param {string} [uri]
 * @returns {Promise<ExternalFs>} 
 */
function externalFs(uuid, uri) {

  if (!uuid && !uri) throw new Error("uuid or uri required");

  let rootPath = uuid ? externalStorage.get(uuid).path : uri;
  const fs = {
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

        dialogs.box('INFO', '<p>Follow below steps to allow Acode to modify sdcard data.<p><br><img src="./res/imgs/steps.jpg">', () => {}, next);

      } else {

        next();

      }



    } else {
      res(fs);
    }

    function next() {
      SDcard.open(uuid, result => {
        rootPath = result;
        externalStorage.savePath(uuid, result);
        res(fs);
      }, err => {
        rej(err);
      });
    }

  });

  function writeFile(filename, content) {
    filename = helpers.decodeURL(filename);
    return new Promise((resolve, reject) => {
      SDcard.write(rootPath, filename, content, res => resolve(res), err => reject(err));
    });
  }

  function copy(src, dest) {
    src = helpers.decodeURL(src);
    dest = helpers.decodeURL(dest);

    return new Promise((resolve, reject) => {
      SDcard.copy(rootPath, src, dest, res => resolve(res), err => reject(err));
    });
  }

  function move(src, dest) {
    src = helpers.decodeURL(src);
    dest = helpers.decodeURL(dest);

    return new Promise((resolve, reject) => {
      SDcard.move(rootPath, src, dest, res => resolve(res), err => reject(err));
    });
  }

  function deleteFile(filename) {
    filename = helpers.decodeURL(filename);

    return new Promise((resolve, reject) => {
      SDcard.delete(rootPath, filename, res => resolve(res), err => reject(err));
    });
  }

  function createFile(parent, filename) {
    parent = helpers.decodeURL(parent);
    filename = helpers.decodeURL(filename);

    return new Promise((resolve, reject) => {
      SDcard.touch(rootPath, parent, filename, res => resolve(res), err => reject(err));
    });
  }

  function createDir(parent, dirname) {
    parent = helpers.decodeURL(parent);
    dirname = helpers.decodeURL(dirname);

    return new Promise((resolve, reject) => {
      SDcard.mkdir(rootPath, parent, dirname, res => resolve(res), err => reject(err));
    });
  }

  function renameFile(src, newname) {
    src = helpers.decodeURL(src);
    newname = helpers.decodeURL(newname);

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

export default externalFs;