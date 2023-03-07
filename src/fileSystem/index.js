import internalFs from './internalFs';
import externalFs from './externalFs';
import Url from '../utils/Url';
import Sftp from './sftp';
import Ftp from './ftp';
import ajax from '@deadlyjack/ajax';
import helpers from '../utils/helpers';

const fsList = [];

/**
 *
 * @param {...string} url
 * @returns {FileSystem}
 */
function fsOperation(...url) {
  if (url.length > 1) {
    url = Url.join(...url);
  } else {
    url = url[0];
  }
  return fsList.find((fs) => fs.test(url))?.fs(url);
}

/**
 *
 * @param {InternalFs} internalFs
 * @param {string} url
 */
function internalFsOperation(url) {
  return {
    lsDir() {
      return listDir(url);
    },
    async readFile(encoding) {
      const { data } = await internalFs.readFile(url, encoding);
      return data;
    },
    writeFile(content) {
      return internalFs.writeFile(url, content, false, false);
    },
    createFile(name, data) {
      return internalFs.writeFile(Url.join(url, name), data || '', true, true);
    },
    createDirectory(name) {
      return internalFs.createDir(url, name);
    },
    delete() {
      return internalFs.delete(url);
    },
    copyTo(dest) {
      return internalFs.moveOrCopy('copyTo', url, dest);
    },
    moveTo(dest) {
      return internalFs.moveOrCopy('moveTo', url, dest);
    },
    renameTo(newname) {
      return internalFs.renameFile(url, newname);
    },
    exists() {
      return internalFs.exists(url);
    },
    stat() {
      return internalFs.stats(url);
    },
  };
}

/**
 *
 * @param {ExternalFs} externalFs
 * @param {string} url
 */
function externalFsOperation(url) {
  return {
    lsDir() {
      return externalFs.listDir(url);
    },
    async readFile(encoding) {
      const { data } = await externalFs.readFile(url, encoding);
      return data;
    },
    writeFile(content) {
      return externalFs.writeFile(url, content);
    },
    createFile(name, data) {
      data = data || '';
      return externalFs.createFile(url, name, data);
    },
    createDirectory(name) {
      return externalFs.createDir(url, name);
    },
    delete() {
      return externalFs.delete(url);
    },
    copyTo(dest) {
      return externalFs.copy(url, dest);
    },
    moveTo(dest) {
      const src = Url.dirname(url);
      if (Url.areSame(src, dest)) return Promise.resolve(url);
      return externalFs.move(url, dest);
    },
    renameTo(newname) {
      return externalFs.renameFile(url, newname);
    },
    async exists() {
      try {
        const stats = await externalFs.stats(url);
        return stats.exists;
      } catch (error) {
        return false;
      }
    },
    stat() {
      return externalFs.stats(url);
    },
  };
}

function listDir(url) {
  return new Promise((resolve, reject) => {
    const files = [];
    internalFs
      .listDir(url)
      .then((entries) => {
        entries.map((entry) => {
          const url = decodeURIComponent(entry.nativeURL);
          const name = Url.basename(url);
          files.push({
            name,
            url,
            isDirectory: entry.isDirectory,
            isFile: entry.isFile,
          });
        });
        resolve(files);
      })
      .catch(reject);
  });
}

fsOperation.extend = (test, fs) => {
  fsList.push({ test, fs });
}

fsOperation.remove = (test) => {
  const index = fsList.findIndex((fs) => fs.test === test);
  if (index !== -1) {
    fsList.splice(index, 1);
  }
}

fsOperation.extend(Sftp.test, Sftp.fromUrl);
fsOperation.extend(Ftp.test, Ftp.fromUrl);
fsOperation.extend((url) => /^file:/.test(url), (url) => internalFsOperation(url));
fsOperation.extend((url) => /^content:/.test(url), (url) => externalFsOperation(url));
fsOperation.extend((url) => /^https?:/.test(url), (url) => {
  return {
    async readFile(encoding, progress) {
      const data = await ajax.get(url, {
        responseType: 'arraybuffer',
        contentType: 'application/x-www-form-urlencoded',
        onprogress: progress,
      });

      if (encoding) {
        return helpers.decodeText(data, encoding);
      }
      return data;
    },
    async writeFile(content, progress) {
      return ajax.post(url, {
        data: content,
        contentType: 'application/x-www-form-urlencoded',
        onprogress: progress,
      });
    }
  }
});

export default fsOperation;
