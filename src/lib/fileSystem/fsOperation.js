import UrlParse from 'url-parse';
import helpers from '../utils/helpers';
import internalFs from './internalFs';
import externalFs from './externalFs';
import path from '../utils/Path';
import Ftp from './ftp';
import Url from '../utils/Url';
import Sftp from './sftp';

/**
 *
 * @param {string} uri
 * @returns {FileSystem}
 */
function fsOperation(uri) {
  const protocol = Url.getProtocol(uri);

  if (protocol === 'file:') {
    return internalOperation(internalFs, uri);
  } else if (protocol === 'content:') {
    return externalOperation(externalFs, uri);
  } else {
    const uuid = helpers.uuid();
    const uuidRegex = new RegExp(uuid, 'g');

    if (/#/.test(uri)) {
      uri = uri.replace(/#/g, uuid);
    }

    let { username, password, hostname, pathname, port, query } = UrlParse(
      uri,
      true,
    );

    if (username) {
      username = decodeURIComponent(username);
    }

    if (password) {
      password = decodeURIComponent(password);
    }

    if (port) {
      port = parseInt(port);
    }

    if (protocol === 'ftp:') {
      let { security, mode } = query;
      const fs = Ftp(username, password, hostname, port || 21, security, mode);
      uri = uri.replace(uuidRegex, '#');
      return ftpOperation(fs, uri);
    } else if (protocol === 'sftp:') {
      let { keyFile, passPhrase } = query;

      if (keyFile) {
        keyFile = decodeURIComponent(keyFile);
      }

      if (passPhrase) {
        passPhrase = decodeURIComponent(passPhrase);
      }

      if (pathname) {
        pathname = decodeURIComponent(pathname);
        pathname = pathname.replace(uuidRegex, '#');
      }

      const sftpCon = Sftp(hostname, port || 22, username, {
        password,
        keyFile,
        passPhrase,
      });

      return sftpOperation(sftpCon, pathname);
    } else {
      throw new Error('File system not supported yet.');
    }
  }
  /**
   *
   * @param {RemoteFs} fs
   * @param {string} url
   */
  function ftpOperation(fs, url) {
    const { origin, query } = fs.originObject;

    return {
      lsDir() {
        return fs.listDir(url);
      },
      readFile(encoding) {
        return readFile(fs, url, encoding);
      },
      writeFile(content) {
        return fs.writeFile(url, content);
      },
      createFile(name, data) {
        let pathname = Url.pathname(url);

        data = data || '';
        name = origin + path.join(pathname, name) + query;
        return fs.createFile(name, data);
      },
      createDirectory(name) {
        let pathname = Url.pathname(url);
        name = origin + path.join(pathname, name) + query;
        return fs.createDir(name);
      },
      deleteFile() {
        return fs.deleteFile(url);
      },
      deleteDir() {
        return fs.deleteDir(url);
      },
      copyTo(dest) {
        return fs.copyTo(url, dest);
      },
      moveTo(dest) {
        let pathname = Url.pathname(dest);

        const name = path.basename(url);
        dest = origin + path.join(pathname, name) + query;
        return fs.rename(url, dest);
      },
      renameTo(newname) {
        let pathname = Url.pathname(url);
        const parent = path.dirname(pathname);
        newname = origin + path.join(parent, newname) + query;
        return fs.rename(url, newname);
      },
      exists() {
        return fs.exists(url);
      },
      stats() {
        return fs.stats(url);
      },
    };
  }

  /**
   *
   * @param {RemoteFs} fs
   * @param {String} url
   */
  function sftpOperation(fs, url) {
    return {
      lsDir() {
        return fs.ls(url);
      },
      readFile(encoding) {
        return readFile(fs, url, encoding);
      },
      writeFile(content) {
        return fs.writeFile(url, content);
      },
      createFile(filename, data) {
        return fs.createFile(Url.join(url, filename), data);
      },
      createDirectory(dirname) {
        return fs.createDir(Url.join(url, dirname));
      },
      deleteFile() {
        return fs.delete(url, 'file');
      },
      deleteDir() {
        return fs.delete(url, 'dir');
      },
      copyTo(dest) {
        dest = Url.pathname(dest);
        return fs.copyTo(url, dest);
      },
      moveTo(dest) {
        dest = Url.pathname(dest);
        return fs.moveTo(url, dest);
      },
      renameTo(newname) {
        return fs.rename(url, Url.join(Url.dirname(url), newname));
      },
      async exists() {
        return !!(await fs.ls(url, true));
      },
      stats() {
        return fs.stats(url);
      },
    };
  }

  /**
   *
   * @param {InternalFs} fs
   * @param {string} url
   */
  function internalOperation(fs, url) {
    return {
      lsDir() {
        return listDir(url);
      },
      readFile(encoding) {
        return readFile(fs, url, encoding);
      },
      writeFile(content) {
        return fs.writeFile(url, content, false, false);
      },
      createFile(name, data) {
        return fs.writeFile(Url.join(url, name), data || '', true, true);
      },
      createDirectory(name) {
        return fs.createDir(url, name);
      },
      deleteFile() {
        return fs.deleteFile(url);
      },
      deleteDir() {
        return fs.deleteFile(url);
      },
      copyTo(dest) {
        return fs.moveOrCopy('copyTo', url, dest);
      },
      moveTo(dest) {
        return fs.moveOrCopy('moveTo', url, dest);
      },
      renameTo(newname) {
        return fs.renameFile(url, newname);
      },
      exists() {
        return fs.exists(url);
      },
      stats() {
        return fs.stats(url);
      },
    };
  }

  /**
   *
   * @param {ExternalFs} fs
   * @param {string} url
   */
  function externalOperation(fs, url) {
    return {
      lsDir() {
        return fs.listDir(url);
      },
      readFile(encoding) {
        return readFile(fs, url, encoding);
      },
      writeFile(content) {
        return fs.writeFile(url, content);
      },
      createFile(name, data) {
        data = data || '';
        return fs.createFile(url, name, data);
      },
      createDirectory(name) {
        return fs.createDir(url, name);
      },
      deleteFile() {
        return fs.deleteFile(url);
      },
      deleteDir() {
        return fs.deleteFile(url);
      },
      copyTo(dest) {
        return fs.copy(url, dest);
      },
      moveTo(dest) {
        return fs.move(url, dest);
      },
      renameTo(newname) {
        return fs.renameFile(url, newname);
      },
      exists() {
        return new Promise((resolve, reject) => {
          sdcard.exists(
            url,
            (res) => {
              if (res === 'TRUE') resolve(true);
              else resolve(false);
            },
            reject,
          );
        });
      },
      stats() {
        return fs.stats(url);
      },
    };
  }

  function readFile(fs, url, encoding) {
    return new Promise((resolve, reject) => {
      fs.readFile(url)
        .then((res) => {
          const data = res.data;
          if (encoding) {
            const text = helpers.decodeText(data, encoding);
            resolve(text);
          } else resolve(data);
        })
        .catch(reject);
    });
  }

  function listDir(url) {
    return new Promise((resolve, reject) => {
      const files = [];
      internalFs
        .listDir(url)
        .then((entries) => {
          entries.map((entry) => {
            files.push({
              url: decodeURL(entry.nativeURL),
              isDirectory: entry.isDirectory,
              isFile: entry.isFile,
            });
          });
          resolve(files);
        })
        .catch(reject);
    });
  }
}

export default fsOperation;
