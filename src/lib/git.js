import fs from './fileSystem/internalFs';
import dialogs from '../components/dialogs';
import helpers from './utils/helpers';
import GitHub from './GitHubAPI/GitHub';
import path from './utils/Path';
import Url from './utils/Url';
import fsOperation from './fileSystem/fsOperation';

//Creates new github object
function gitHub() {
  return new GitHub({
    username: localStorage.username
      ? helpers.credentials.decrypt(localStorage.username)
      : undefined,
    password: localStorage.password
      ? helpers.credentials.decrypt(localStorage.password)
      : undefined,
    token: localStorage.token
      ? helpers.credentials.decrypt(localStorage.token)
      : undefined,
  });
}

/**
 *Initialize github object if directory named git exists
 *then it checks for all git repositories record file
 **/
async function init() {
  const url = Url.join(DATA_STORAGE, 'git/');
  const fs = fsOperation(url);

  if (!(await fs.exists())) {
    const dataFs = fsOperation(DATA_STORAGE);
    await dataFs.createDirectory('git');
  }

  const gitFileFs = fsOperation(gitRecordFile);
  const gistFileFs = fsOperation(gistRecordFile);
  let gitRecord = {};
  let gistRecord = {};
  if (await gitFileFs.exists()) {
    const content = await gitFileFs.readFile('utf-8');
    gitRecord = helpers.parseJSON(helpers.credentials.decrypt(content));
  }
  window.gitRecord = GitRecord(gitRecord);

  if (await gistFileFs.exists()) {
    const content = await gistFileFs.readFile('utf-8');
    gistRecord = helpers.parseJSON(helpers.credentials.decrypt(content));
  }
  window.gistRecord = GistRecord(gistRecord);
}

function fileError(code) {
  dialogs.alert(strings.error, helpers.getErrorMessage(code));
}

function error(err) {
  if (err.response && err.response.status === 409)
    dialogs.alert(strings.error, strings['conflict error']);
  else if (err) dialogs.alert(strings.error, err.toString());
  throw err;
}

/**
 * Creats a git repository record object
 * @param {string} sha
 * @param {string} name
 * @param {string} data
 * @param {object} repo
 * @param {string} path
 * @returns {Repo}
 */
function Record(owner, sha, name, data, repo, path, branch) {
  if (!owner || !sha || !name || !repo) {
    throw new Error(
      'Could not create Record because one or more paramert value is not valid'
    );
  }
  const _record = {
    sha,
    name,
    data,
    path,
    repo,
    commitMessage: null,
    branch,
    owner,
  };
  const repository = gitHub().getRepo(owner, repo);

  _record.commitMessage = `update ${_record.name}`;

  function update(data) {
    gitRecord.update(sha, _record, data);
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
    get owner() {
      return _record.owner;
    },
    set branch(str) {
      _record.branch = str;
    },
    get name() {
      return _record.name;
    },
    setName: (str) => {
      return new Promise((resolve, reject) => {
        const { branch, data } = _record;
        let _path = getPath(name);
        dialogs.loader.create(name, strings.loading + '...');
        repository
          .deleteFile(branch, _path)
          .then((res) => {
            if (res.status === 200) {
              _path = getPath(str);
              return repository.writeFile(
                branch,
                _path,
                data,
                `Rename ${name} to ${str}`,
                {}
              );
            }

            return Promise.reject(res);
          })
          .then((res) => {
            if (res.status === 201) {
              _record.name = str;
              _record.commitMessage = `update ${str}`;
              update();
              resolve();
            } else {
              error(res);
              reject();
            }
          })
          .catch((err) => {
            error(err);
            reject();
          })
          .finally(dialogs.loader.destroy);
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
    get repository() {
      return repository;
    },
    setData: (txt) => {
      return new Promise((resolve, reject) => {
        _record.data = txt;
        const { name, branch, commitMessage } = _record;
        let _path = path ? path + '/' + name : name;
        dialogs.loader.create(name, strings.saving + '...');
        repository
          .writeFile(branch, _path, txt, commitMessage, {})
          .then((res) => {
            if (res.status === 200) {
              update(txt);
              resolve();
            } else {
              error(res);
              reject();
            }
          })
          .catch((err) => {
            error(err);
            reject();
          })
          .finally(dialogs.loader.destroy);
      });
    },
  };
}

/**
 *
 * @param {Repo} obj
 * @returns {GitRecord}
 */
function GitRecord(obj) {
  const gitRecord = obj;

  function get(sha) {
    return new Promise((resolve, reject) => {
      const record = gitRecord[sha];
      if (!record) resolve(null);
      const { name, repo, path, owner, branch } = record;
      fs.readFile(DATA_STORAGE + 'git/' + sha)
        .then((res) => {
          const text = helpers.decodeText(res.data);
          let record;
          try {
            record = Record(owner, sha, name, text, repo, path, branch);
          } catch (error) {
            remove(sha);
          }
          resolve(record);
        })
        .catch((err) => {
          if (err.code) fileError(err.code);
          reject(err);
        });
    });
  }

  function add(obj) {
    if (!obj.sha) throw new Error('sha must be a string');
    const { name, sha, repo, data, path, owner, branch } = obj;
    gitRecord[obj.sha] = {
      name,
      sha,
      repo,
      path,
      owner,
      branch,
    };
    save();
    const record = Record(owner, sha, name, data, repo, path, branch);
    fs.writeFile(DATA_STORAGE + 'git/' + record.sha, data, true, false).catch(
      (err) => {
        if (err.code) FileError(err.code);
        console.error(err);
      }
    );
    return record;
  }

  function remove(sha) {
    delete gitRecord[sha];
    fs.deleteFile(DATA_STORAGE + 'git/' + sha);
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
   * @param {Repo} [record]
   */
  function save(echo = false, data = null, record = null) {
    let text = helpers.credentials.encrypt(JSON.stringify(gitRecord));
    let url = gitRecordFile;

    if (data) {
      if (!record) return;
      text = record.data;
      url = DATA_STORAGE + 'git/' + record.sha;
    }

    fs.writeFile(url, text, true, false)
      .then(() => {
        if (echo) toast(echo);
      })
      .catch((err) => {
        if (err.code) {
          fileError(err.code);
        }
        console.error(err);
      });
  }

  return {
    get,
    add,
    remove,
    update,
  };
}

/**
 * Creats a gist object to manage gist file in editor
 * @param {string} id
 * @param {GistFiles} [files]
 * @param {boolean} [isNew]
 * @param {boolean} [_public]
 * @returns {Gist}
 */
function Gist(id, files, isNew, _public) {
  const gist = gitHub().getGist(id);
  const _this = {
    id,
    files,
    isNew,
    public: _public,
  };

  /**
   *
   * @param {string} name
   * @returns {File}
   */
  function getFile(name) {
    for (let f of editorManager.files) {
      if (f.type === 'gist' && f.record.id === _this.id && f.name === name)
        return f;
    }
  }

  function setData(name, text, isDelete = false) {
    return new Promise((resolve, reject) => {
      _this.files[name].content = text;
      const update = {
        files: {},
      };
      update.files[name] = _this.files[name];

      dialogs.loader.create(name, strings.saving + '...');
      if (_this.isNew) {
        update.public = _this.public;
        gist
          .create(update)
          .then((res) => {
            if (res.status === 201) {
              _this.id = res.data.id;
              gistRecord.update(_this);
              _this.isNew = false;
              editorManager.setSubText(getFile(name));
              resolve();
            }
          })
          .catch((err) => {
            error(err);
            reject();
          })
          .finally(dialogs.loader.destroy);

        return;
      }

      gist
        .update(update)
        .then((res) => {
          if (!res) return Promise.reject('No response');
          if (res.status === 200) {
            if (isDelete) {
              delete _this.files[name];
              editorManager.removeFile(getFile(name), true);
            }

            gistRecord.update(_this);
            resolve();
          } else {
            console.error(res);
            reject(res);
          }
        })
        .catch((err) => {
          error(err);
          reject();
        })
        .finally(dialogs.loader.destroy);
    });
  }

  function setName(name, newName) {
    if (!newName) return new Error('newName cannot be empty');

    return new Promise((resolve, reject) => {
      if (_this.isNew) {
        changeName();
        return resolve();
      }

      const update = {
        files: {},
      };
      update.files[name] = {};
      update.files[name].filename = newName;
      dialogs.loader.create(name, strings.loading + '...');
      gist
        .update(update)
        .then((res) => {
          if (res.status === 200) {
            resolve();
          } else {
            console.error(res);
            reject(res);
          }
        })
        .catch((err) => {
          error(err);
          reject();
        })
        .finally(dialogs.loader.destroy);
    });

    function changeName() {
      const file = _this.files[name];
      delete _this.files[name];
      _this.files[newName] = file;
      gistRecord.update(_this);
    }
  }

  function addFile(name) {
    _this.files[name] = {
      filename: name,
    };
    gistRecord.update(_this);
  }

  function removeFile(name) {
    return setData(name, '', true);
  }

  return {
    get id() {
      return _this.id;
    },
    get isNew() {
      return _this.isNew;
    },
    files: _this.files,
    setName,
    setData,
    addFile,
    removeFile,
  };
}

/**
 *
 * @param {object} obj
 * @returns {GistRecord}
 */
function GistRecord(obj) {
  let gistRecord = obj;

  /**
   *
   * @param {object} obj
   * @param {boolean} isNew
   * @returns {Gist}
   */
  function add(obj, isNew = false) {
    const id = obj.id;
    const _files = obj.files;
    const files = {};

    for (let filename in _files) {
      const file = _files[filename];
      files[filename] = {
        filename: file.filename,
        content: file.content,
      };
    }
    gistRecord[obj.id] = {
      id,
      files,
    };
    save();
    return Gist(id, files, isNew, !!obj.public);
  }

  /**
   * gets the gist with file content
   * @param {string} id
   * @param {boolean} wasNew
   * @returns {Gist}
   */
  function get(id, wasNew = false) {
    if (id in gistRecord) {
      const { files } = gistRecord[id];
      return Gist(id, files, wasNew);
    } else {
      return null;
    }
  }

  /**
   *
   * @param {Gist} gist
   */
  function update(gist) {
    add(gist);
  }

  /**
   *
   * @param {Gist} gist
   * @returns {Gist}
   */
  function remove(gist) {
    const _gist = gistRecord[gist.id];
    delete gistRecord[gist.id];

    return _gist;
  }

  function save(echo = null) {
    let text = helpers.credentials.encrypt(JSON.stringify(gistRecord));
    let url = gistRecordFile;
    fs.writeFile(url, text, true, false)
      .then(() => {
        if (echo) toast(echo);
      })
      .catch((err) => {
        console.error(err);
        if (err.code) fileError(err.code);
      });
  }

  function reset() {
    gistRecord = {};
    save();
  }

  return {
    add,
    get,
    update,
    remove,
    reset,
  };
}

/**
 *
 * @param {Repo} record
 * @param {string} _path
 */
function getGitFile(record, _path) {
  const { repo, owner, branch, path: p } = record;

  const repository = gitHub().getRepo(owner, repo);
  return new Promise((resolve, reject) => {
    repository
      .getSha(branch, path.resolve(p, _path).slice(1))
      .then((res) => {
        resolve(atob(res.data.content));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export default {
  init,
  GitHub: gitHub,
  getGitFile,
};
