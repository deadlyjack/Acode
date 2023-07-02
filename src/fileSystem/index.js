import internalFs from './internalFs';
import externalFs from './externalFs';
import Url from '../utils/Url';
import Sftp from './sftp';
import Ftp from './ftp';
import ajax from '@deadlyjack/ajax';
import helpers from '../utils/helpers';

const fsList = [];

/**
 * @typedef {Object} Stat
 * @property {string} name
 * @property {string} url
 * @property {string} uri - deprecated
 * @property {boolean} isFile
 * @property {boolean} isDirectory
 * @property {boolean} isLink
 * @property {number} size
 * @property {number} modifiedDate
 * @property {boolean} canRead
 * @property {boolean} canWrite
 */

/**
 * @typedef {Object} File
 * @property {string} name
 * @property {string} url
 * @property {boolean} isFile
 * @property {boolean} isDirectory
 * @property {boolean} isLink
 */

/**
 * @typedef {string|Blob|ArrayBuffer} FileContent
 * @typedef {Object} FileSystem
 * @property {() => Promise<File[]>} lsDir List directory
 * @property {() => Promise<void>} delete Delete file or directory
 * @property {() => Promise<boolean>} exists Check if file or directory exists
 * @property {() => Promise<Stat>} stat Get file or directory stat
 * @property {(encoding:string) => Promise<FileContent>} readFile Read file
 * @property {(data:FileContent) => Promise<void>} writeFile Write file content
 * @property {(name:string, data:FileContent) => Promise<string>} createFile Create file and return url of the created file
 * @property {(name:string) => Promise<string>} createDirectory Create directory and return url of the created directory
 * @property {(dest:string) => Promise<string>} copyTo Copy file or directory to destination
 * @property {(dest:string) => Promise<string>} moveTo Move file or directory to destination
 * @property {(newname:string) => Promise<string>} renameTo Rename file or directory
 */

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
 * Initialize file system
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
    async renameTo(newname) {
      const name = Url.basename(url).toLowerCase();

      if (name === newname.toLowerCase()) {
        const uuid = helpers.uuid();
        let newUrl = await this.renameTo(uuid);
        newUrl = await fsOperation(newUrl).renameTo(newname);
        return newUrl;
      }

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
 * Initialize external file system
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

/**
 * List directory
 * @param {string} url 
 * @returns {Promise<File[]>}
 */
async function listDir(url) {
  const files = [];
  const entries = await internalFs.listDir(url);

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

  return files;
}

fsOperation.extend = (test, fs) => {
  fsList.push({ test, fs });
};

fsOperation.remove = (test) => {
  const index = fsList.findIndex((fs) => fs.test === test);
  if (index !== -1) {
    fsList.splice(index, 1);
  }
};

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
  };
});

export default fsOperation;
