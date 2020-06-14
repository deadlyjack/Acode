import ajax from '../ajax';
import Url from '../utils/Url';
/**
 * 
 * @param {string} url 
 * @returns {Promise}
 */
function listDir(url) {
    // url = decodeURL(url);
    return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(url, success, reject);

        function success(fs) {
            const reader = fs.createReader();
            reader.readEntries(resolve, reject);
        }
    });
}

/**
 * 
 * @param {string} filename 
 * @param {any} data
 * @param {boolean} create If this property is true, and the requested file or 
 * directory doesn't exist, the user agent should create it. 
 * The default is false. The parent directory must already exist.
 * @param {boolean} exclusive If true, and the create option is also true, 
 * the file must not exist prior to issuing the call. 
 * Instead, it must be possible for it to be created newly at call time. The default is false.
 * @returns {Promise} 
 */
function writeFile(filename, data, create = false, exclusive = true) {
    // filename = decodeURL(filename);
    const name = filename.split('/').pop();
    const _path = Url.dirname(filename);
    return new Promise((resolve, reject) => {
        if (!create) {
            window.resolveLocalFileSystemURL(filename, fileEntry => {
                if (!fileEntry.isFile) reject('Expected file but got directory.');
                fileEntry.createWriter(file => {
                    file.onwriteend = () => resolve(filename);
                    file.onerror = (err) => reject(err.target.error);
                    file.write(data);
                });
            }, reject);
        } else {
            window.resolveLocalFileSystemURL(_path, fs => {
                fs.getFile(name, {
                    create,
                    exclusive: create ? exclusive : false
                }, fileEntry => {
                    fileEntry.createWriter(file => {
                        file.onwriteend = () => resolve(filename);
                        file.onerror = (err) => reject(err.target.error);
                        file.write(data);
                    });
                }, reject);
            }, reject);
        }
    });
}

/**
 * 
 * @param {string} filename
 * @returns {Promise} 
 */
function deleteFile(filename) {
    // filename = decodeURL(filename);
    return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(filename, entry => {
            if (entry.isFile) {
                entry.remove(resolve, reject);
            } else {
                entry.removeRecursively(resolve, reject);
            }
        }, reject);
    });
}

/**
 * 
 * @param {string} filename
 * @returns {Promise} 
 */
function readFile(filename) {
    // filename = decodeURL(filename);
    return new Promise((resolve, reject) => {

        if (!filename) return reject("Invalid valud of fileURL: " + filename);

        ajax({
            url: filename,
            responseType: "arraybuffer"
        }).then(res => {

            if (res)
                resolve({
                    data: res
                });
            else
                return Promise.reject();

        }).catch(() => {
            window.resolveLocalFileSystemURL(filename, fileEntry => {
                fileEntry.file(file => {
                    const fileReader = new FileReader();
                    fileReader.onloadend = function () {
                        resolve({
                            file,
                            data: this.result
                        });
                    };

                    fileReader.onerror = reject;

                    fileReader.readAsArrayBuffer(file);
                }, reject);
            }, reject);
        });
    });
}

/**
 * 
 * @param {string} url 
 * @param {string} newname
 * @returns {Promise} 
 */
function renameFile(url, newname) {
    // url = decodeURL(url);
    return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(url, fs => {
            fs.getParent(parent => {
                fs.moveTo(parent, newname, () => resolve(Url.join(parent.nativeURL, newname)), reject);
            }, reject);
        }, reject);
    });
}

/**
 * 
 * @param {string} path 
 * @param {string} dirname
 * @returns {Promise} 
 */
function createDir(path, dirname) {
    // path = decodeURL(path);
    return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(path, fs => {
            fs.getDirectory(dirname, {
                create: true
            }, () => resolve(Url.join(path, dirname)), reject);
        }, reject);
    });
}

function copy(src, dest) {
    return moveOrCopy("copyTo", src, dest);
}

function move(src, dest) {
    return moveOrCopy("moveTo", src, dest);
}

/**
 * 
 * @param {"copyTO"|"moveTo"} action 
 * @param {string} src 
 * @param {string} dest 
 */
function moveOrCopy(action, src, dest) {
    return new Promise((resolve, reject) => {
        verify(src, dest)
            .then(res => {
                const {
                    src,
                    dest
                } = res;

                src[action](dest, undefined, entry => {
                    resolve(entry.nativeURL);
                }, reject);
            })
            .catch(reject);
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


export default {
    copy,
    move,
    listDir,
    writeFile,
    deleteFile,
    readFile,
    renameFile,
    createDir
};