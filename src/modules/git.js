import fs from "./utils/androidFileSystem";
import dialogs from "../components/dialogs";
import helpers from "./helpers";
import GitHub from 'github-api';


function gitHub() {
  return new GitHub({
    username: localStorage.username ? helpers.credentials.decrypt(localStorage.username) : undefined,
    password: localStorage.password ? helpers.credentials.decrypt(localStorage.password) : undefined,
    token: localStorage.token ? helpers.credentials.decrypt(localStorage.token) : undefined
  })
}

function init() {
  return new Promise((resolve, reject) => {
    const path = cordova.file.externalDataDirectory;
    const url = path + 'git/';
    let interval;
    window.resolveLocalFileSystemURL(url, success, error);

    function success() {
      fs.readFile(gitRecordURL)
        .then(res => {
          const data = res.data;
          const decoder = new TextDecoder('utf-8');
          const gitrecord = JSON.parse(helpers.credentials.decrypt(decoder.decode(data)));
          resolve(GitRecord(gitrecord));
        })
        .catch(err => {
          if (err.code === 1) {
            const text = helpers.credentials.encrypt('{}');
            fs.writeFile(gitRecordURL, text, true, false)
              .then(() => {
                resolve(GitRecord({}));
              })
              .catch(err => {
                if (err.code) {
                  fileError(err.code);
                }
                reject(err);
              });
          }
        });
    }

    function error(err) {
      if (err.code === 1) {
        fs.createDir(path, 'git')
          .then(() => {
            if (interval) clearInterval(interval);
            init();
          })
          .catch(err => {
            interval = setInterval(error, 1000);
          });
      } else {
        if (err.code) fileError(err.code);
        reject(err);
      }
    }
  });
}

function fileError(code) {
  dialogs.alert(strings.error, helpers.getErrorMessage(code));
}

/**
 * 
 * @param {string} sha 
 * @param {string} name 
 * @param {string} data 
 * @param {object} repo 
 * @param {string} path 
 * @returns {GitFileRecord}
 */
function Record(owner, sha, name, data, repo, path) {
  if (!owner || !sha || !name || !repo) {
    throw new Error('Could not create Record because one or more paramert value is not valid');
  }
  const _record = {
    sha,
    name,
    data,
    path,
    repo,
    commitMessage: null,
    branch: 'master',
    owner
  };
  const repository = gitHub().getRepo(owner, repo);

  _record.commitMessage = `update ${_record.name}`;

  function update(data) {
    gitRecord.update(sha, _record, data);
  }

  function error(err) {
    window.plugins.toast.showShortBottom(strings.error);
    console.log(err);
  }

  function getPath(name) {
    return path ? path + '/' + name : name;
  }

  return {
    get sha() {
      return _record.sha;
    },
    get path() {
      return _record.path;
    },
    get branch() {
      return _record.branch;
    },
    get repo() {
      return _record.repo;
    },
    set branch(str) {
      _record.branch = str;
    },
    get name() {
      return _record.name
    },
    setName: str => {
      return new Promise((resolve, reject) => {
        const {
          branch,
          data
        } = _record;
        let _path = getPath(name);
        dialogs.loaderShow(name, strings.loading + '...');
        repository.deleteFile(branch, _path)
          .then(res => {
            if (res.statusText === 'OK') {
              _path = getPath(str);
              return repository.writeFile(branch, _path, data, `Rename ${name} to ${str}`, {})
            }

            return Promise.reject(res);
          })
          .then(res => {
            if (res.statusText === 'Created') {
              _record.name = str;
              _record.commitMessage = `update ${str}`;
              update();
              resolve();
            } else {
              error(res);
              reject();
            }
          })
          .catch(err => {
            error(err);
            reject();
          })
          .finally(dialogs.loaderHide);
      });
    },
    get data() {
      return _record.data;
    },
    get commitMessage() {
      return _record.commitMessage;
    },
    set commitMessage(str) {
      _record.commitMessage = str;
    },
    setData: (txt) => {
      return new Promise((resolve, reject) => {
        _record.data = txt;
        const {
          name,
          branch,
          commitMessage,
        } = _record;
        let _path = path ? path + '/' + name : name;
        dialogs.loaderShow(name, strings.saving + '...');
        repository.writeFile(branch, _path, txt, commitMessage, {})
          .then(res => {
            if (res.statusText === 'OK') {
              update(txt);
              resolve();
            } else {
              error(res);
              reject();
            }
          })
          .catch(err => {
            error(err);
            reject();
          })
          .finally(dialogs.loaderHide);
      });
    }
  };
}

/**
 * 
 * @param {GitFileRecord} obj
 * @returns {GitRecord} 
 */
function GitRecord(obj) {
  const gitRecord = obj;

  function get(sha) {
    return new Promise((resolve, reject) => {
      const record = gitRecord[sha];
      if (!record) resolve(null);
      const {
        name,
        repo,
        path,
        owner
      } = record;
      fs.readFile(cordova.file.externalDataDirectory + 'git/' + sha)
        .then(res => {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(res.data);
          let record;
          try {
            record = Record(owner, sha, name, text, repo, path)
          } catch (error) {
            remove(sha);
          }
          resolve(record);
        })
        .catch(err => {
          if (err.code) fileError(err.code);
          reject(err);
        });
    });
  }

  function add(obj) {
    if (!obj.sha) throw new Error('sha must be a string');
    const {
      name,
      sha,
      repo,
      data,
      path,
      owner
    } = obj;
    gitRecord[obj.sha] = {
      name,
      sha,
      repo,
      path,
      owner
    };
    save();
    const record = Record(owner, sha, name, data, repo, path);
    fs.writeFile(cordova.file.externalDataDirectory + 'git/' + record.sha, data, true, false)
      .catch(err => {
        if (err.code) FileError(err.code);
        console.log(err);
      })
    return record;
  }

  function remove(sha) {
    delete gitRecord[sha];
    fs.deleteFile(cordova.file.externalDataDirectory + 'git/' + sha);
    save();
  }

  function update(sha, record, data) {
    gitRecord[sha] = record;
    save(data ? strings['file saved'] : strings.success, data, record);
  }

  /**
   * 
   * @param {string} [echo] 
   * @param {string} [data] 
   * @param {GitFileRecord} [record] 
   */
  function save(echo = false, data = null, record = null) {
    let text = helpers.credentials.encrypt(JSON.stringify(gitRecord));
    let url = gitRecordURL;

    if (data) {
      if (!record) return;
      text = record.data;
      url = cordova.file.externalDataDirectory + 'git/' + record.sha;
    }

    fs.writeFile(url, text, true, false)
      .then(() => {
        if (echo) plugins.toast.showShortBottom(echo);
      })
      .catch(err => {
        if (err.code) {
          fileError(err.code);
        }
        console.log(err);
      });
  }

  return {
    get,
    add,
    remove,
    update
  };
}

export default {
  init,
  GitHub: gitHub
}