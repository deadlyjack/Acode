import UrlParse from 'url-parse';
import helpers from '../utils/helpers';
import internalFs from './internalFs';
import externalFs from './externalFs';
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

    if (/#/.test(uri)) {
      uri = uri.replace(/#/g, uuid);
    }

    let { username, password, hostname, pathname, port, query } = UrlParse(
      uri,
      true,
    );

    if (pathname) {
      pathname = decodeURIComponent(pathname);
      pathname = pathname.replace(new RegExp(uuid, 'g'), '#');
    }

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
      const ftp = Ftp(hostname, username, password, port || 21, security, mode);

      ftp.setPath(pathname);

      return ftpOperation(ftp);

    } else if (protocol === 'sftp:') {

      let { keyFile, passPhrase } = query;

      if (keyFile) {
        keyFile = decodeURIComponent(keyFile);
      }

      if (passPhrase) {
        passPhrase = decodeURIComponent(passPhrase);
      }

      const sftp = Sftp(hostname, port || 22, username, {
        password,
        keyFile,
        passPhrase,
      });

      sftp.setPath(pathname);

      return sftpOperation(sftp);

    } else {

      throw new Error('File system not supported yet.');

    }
  }
  /**
   *
   * @param {RemoteFs} fs
   * @param {string} url
   */
  function ftpOperation(fs) {
    return {
      lsDir() {
        return fs.listDir();
      },
      readFile(encoding) {
        return readFile(fs.readFile(), encoding);
      },
      writeFile(content) {
        return fs.writeFile(content);
      },
      createFile(name, data = '') {
        return fs.createFile(name, data);
      },
      createDirectory(name) {
        return fs.createDir(name);
      },
      delete() {
        return fs.delete();
      },
      copyTo(dest) {
        dest = Url.pathname(dest);
        return fs.copyTo(dest);
      },
      moveTo(dest) {
        dest = Url.pathname(dest);
        return fs.moveTo(dest);
      },
      renameTo(newname) {
        return fs.rename(newname);
      },
      exists() {
        return fs.exists();
      },
      stat() {
        return fs.stat();
      },
    };
  }

  /**
   *
   * @param {RemoteFs} fs
   */
  function sftpOperation(fs) {
    return {
      lsDir() {
        return fs.lsDir();
      },
      readFile(encoding) {
        return readFile(fs.readFile(), encoding);
      },
      writeFile(content) {
        return fs.writeFile(content);
      },
      createFile(name, data) {
        return fs.createFile(name, data);
      },
      createDirectory(name) {
        return fs.createDir(name);
      },
      delete() {
        return fs.delete();
      },
      copyTo(dest) {
        dest = Url.pathname(dest);
        return fs.copyTo(dest);
      },
      moveTo(dest) {
        dest = Url.pathname(dest);
        return fs.moveTo(dest);
      },
      renameTo(newname) {
        return fs.rename(newname);
      },
      async exists() {
        return fs.exists();
      },
      stat() {
        return fs.stat();
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
        return readFile(fs.readFile(url), encoding);
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
      delete() {
        return fs.delete(url);
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
      stat() {
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
        return readFile(fs.readFile(url), encoding);
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
      delete() {
        return fs.delete(url);
      },
      copyTo(dest) {
        return fs.copy(url, dest);
      },
      moveTo(dest) {
        const src = Url.dirname(url);
        if (Url.areSame(src, dest)) return Promise.resolve(url);
        return fs.move(url, dest);
      },
      renameTo(newname) {
        return fs.renameFile(url, newname);
      },
      async exists() {
        try {
          const stats = await fs.stats(url);
          return stats.exists;
        } catch (error) {
          console.error('ExternalFs Stats Error', error);
          return false;
        }
      },
      stat() {
        return fs.stats(url);
      },
    };
  }

  function readFile(file, encoding) {
    return new Promise((resolve, reject) => {
      file
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
