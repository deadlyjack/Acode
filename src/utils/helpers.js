import iconv from 'iconv-lite';
import ajax from '@deadlyjack/ajax';
import escapeStringRegexp from 'escape-string-regexp';
import constants from 'lib/constants';
import dialogs from 'dialogs';
import path from './Path';
import Url from './Url';
import Uri from './Uri';
import settings from 'lib/settings';

/**
 * Gets programming language name according to filename
 * @param {String} filename
 * @returns
 */
function getFileType(filename) {
  const regex = {
    babel: /\.babelrc$/i,
    jsmap: /\.js\.map$/i,
    yarn: /^yarn\.lock$/i,
    testjs: /\.test\.js$/i,
    testts: /\.test\.ts$/i,
    cssmap: /\.css\.map$/i,
    typescriptdef: /\.d\.ts$/i,
    clojurescript: /\.cljs$/i,
    cppheader: /\.(hh|hpp)$/i,
    jsconfig: /^jsconfig.json$/i,
    tsconfig: /^tsconfig.json$/i,
    jsbeautify: /^\.jsbeautifyrc$/i,
    webpack: /^webpack\.config\.js$/i,
    audio: /\.(mp3|wav|ogg|flac|aac)$/i,
    android: /\.(apk|aab|slim|smali)$/i,
    git: /(^\.gitignore$)|(^\.gitmodules$)/i,
    video: /\.(mp4|m4a|mov|3gp|wmv|flv|avi)$/i,
    image: /\.(png|jpg|jpeg|gif|bmp|ico|webp)$/i,
    npm: /(^package\.json$)|(^package\-lock\.json$)/i,
    compressed: /\.(zip|rar|7z|tar|gz|gzip|dmg|iso)$/i,
    eslint: /(^\.eslintrc(\.(json5?|ya?ml|toml))?$|eslint\.config\.(c?js|json)$)/i,
    postcssconfig: /(^\.postcssrc(\.(json5?|ya?ml|toml))?$|postcss\.config\.(c?js|json)$)/i,
    prettier: /(^\.prettierrc(\.(json5?|ya?ml|toml))?$|prettier\.config\.(c?js|json)$)/i,
  };

  const fileType = Object.keys(regex).find((type) => regex[type].test(filename));
  if (fileType) return fileType;

  return Url.extname(filename).substring(1);
}

export default {
  /**
   * Gets icon according to filename
   * @param {string} filename
   */
  getIconForFile(filename) {
    const { getModeForPath } = ace.require('ace/ext/modelist');
    const type = getFileType(filename);
    const { name } = getModeForPath(filename);

    const iconForMode = `file_type_${name}`;
    const iconForType = `file_type_${type}`;

    return `file file_type_default ${iconForMode} ${iconForType}`;
  },
  /**
   *
   * @param {FileEntry[]} list
   * @param {object} fileBrowser settings
   * @param {'both'|'file'|'folder'}
   */
  sortDir(list, fileBrowser, mode = 'both') {
    const dir = [];
    const file = [];
    const sortByName = fileBrowser.sortByName;
    const showHiddenFile = fileBrowser.showHiddenFiles;

    list.forEach((item) => {
      let hidden;

      item.name = item.name || path.basename(item.url || '');
      hidden = item.name[0] === '.';

      if (typeof item.isDirectory !== 'boolean') {
        if (this.isDir(item.type)) item.isDirectory = true;
      }
      if (!item.type) item.type = item.isDirectory ? 'dir' : 'file';
      if (!item.url) item.url = item.url || item.uri;
      if ((hidden && showHiddenFile) || !hidden) {
        if (item.isDirectory) {
          dir.push(item);
        } else if (item.isFile) {
          file.push(item);
        }
      }
      if (item.isDirectory) {
        item.icon = 'folder';
      } else {
        if (mode === 'folder') {
          item.disabled = true;
        }
        item.icon = this.getIconForFile(item.name);
      }
    });

    if (sortByName) {
      dir.sort(compare);
      file.sort(compare);
    }

    return dir.concat(file);

    function compare(a, b) {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    }
  },
  /**
   * Gets error message from error object
   * @param {Error} err
   * @param  {...string} args
   */
  errorMessage(err, ...args) {
    args.forEach((arg, i) => {
      if (/^(content|file|ftp|sftp|https?):/.test(arg)) {
        args[i] = this.getVirtualPath(arg);
      }
    });

    const extra = args.join('<br>');
    let msg;

    if (typeof err === 'string' && err) {
      msg = err;
    } else if (err instanceof Error) {
      msg = err.message;
    } else {
      msg = strings['an error occurred'];
    }

    return msg + (extra ? '<br>' + extra : '');
  },
  /**
   *
   * @param {Error} err
   * @param  {...string} args
   * @returns {PromiseLike<void>}
   */
  error(err, ...args) {
    if (err.code === 0) {
      toast(err);
      return;
    }

    let hide = null;
    const onhide = () => {
      if (hide) hide();
    };
    const promise = {
      then(fun) {
        if (typeof fun === 'function') {
          hide = fun;
        }
      },
    };

    const msg = this.errorMessage(err, ...args);
    dialogs.alert(strings.error, msg, onhide);
    return promise;
  },
  /**
   * Checks if the value is a valid color
   * @param {string} value 
   * @returns 
   */
  isValidColor(value) {
    return (
      /#[0-9a-f]{3,8}/.test(value) ||
      /rgba?\(\d{1,3},\s?\d{1,3},\s?\d{1,3}(,\s?[0-1])?\)/.test(value) ||
      /hsla?\(\d{1,3},\s?\d{1,3}%,\s?\d{1,3}%(,\s?[0-1])?\)/.test(value)
    );
  },
  /**
   * Returns unique ID
   * @returns {string}
   */
  uuid() {
    return (
      new Date().getTime() + parseInt(Math.random() * 100000000000)
    ).toString(36);
  },
  /**
   * Parses JSON string, if fails returns null
   * @param {Object|Array} string
   */
  parseJSON(string) {
    if (!string) return null;
    try {
      return JSON.parse(string);
    } catch (e) {
      return null;
    }
  },
  /**
   * Decodes arrayBuffer to String according given encoding type
   * @param {ArrayBuffer} data
   * @param {String} [encoding]
   * @returns {Promise<string>}
   */
  decodeText(data, encoding) {
    let isJson = false;

    if (encoding === 'json') {
      encoding = null;
      isJson = true;
    }

    if (!encoding) {
      encoding = settings.value.defaultFileEncoding;
    }

    const text = new TextDecoder(encoding).decode(data);

    if (isJson) {
      return this.parseJSON(text);
    }

    return text;
  },
  /**
   * Checks whether given type is directory or not
   * @param {'dir'|'directory'|'folder'} type
   * @returns {Boolean}
   */
  isDir(type) {
    return /^(dir|directory|folder)$/.test(type);
  },
  /**
   * Checks whether given type is file or not
   * @param {'file'|'link'} type
   * @returns {Boolean}
   */
  isFile(type) {
    return /^(file|link)$/.test(type);
  },
  /**
   * Replace matching part of url to alias name by which storage is added
   * @param {String} url
   * @returns {String}
   */
  getVirtualPath(url) {
    url = Url.parse(url).url;

    if (/^content:/.test(url)) {
      const primary = Uri.getPrimaryAddress(url);
      if (primary) {
        return primary;
      }
    }

    /**@type {string[]} */
    const storageList = JSON.parse(localStorage.storageList || '[]');
    const storageListLen = storageList.length;

    for (let i = 0; i < storageListLen; ++i) {
      const uuid = storageList[i];
      let storageUrl = Url.parse(uuid.uri || uuid.url || '').url;
      if (!storageUrl) continue;
      if (storageUrl.endsWith('/')) {
        storageUrl = storageUrl.slice(0, -1);
      }
      const regex = new RegExp('^' + escapeStringRegexp(storageUrl));
      if (regex.test(url)) {
        url = url.replace(regex, uuid.name);
        break;
      }
    }

    return url;
  },
  /**
   * Updates uri of all active which matches the oldUrl as location
   * of the file
   * @param {String} oldUrl
   * @param {String} newUrl
   */
  updateUriOfAllActiveFiles(oldUrl, newUrl) {
    const files = editorManager.files;
    const { url } = Url.parse(oldUrl);

    for (let file of files) {
      if (!file.uri) continue;
      const fileUrl = Url.parse(file.uri).url;
      if (new RegExp('^' + escapeStringRegexp(url)).test(fileUrl)) {
        if (newUrl) {
          file.uri = Url.join(newUrl, file.filename);
        } else {
          file.uri = null;
        }
      }
    }

    editorManager.onupdate('file-delete');
    editorManager.emit('update', 'file-delete');
  },
  /**
   * Displays ad on the current page
   */
  showAd() {
    const { ad } = window;
    if (
      IS_FREE_VERSION
      && (innerHeight * devicePixelRatio) > 600 && ad
    ) {
      const $page = tag.getAll('wc-page:not(#root)').pop();
      if ($page) {
        ad.active = true;
        ad.show();
      }
    }
  },
  /**
   * Hides the ad
   * @param {Boolean} [force=false]
   */
  hideAd(force = false) {
    const { ad } = window;
    if (IS_FREE_VERSION && ad?.active) {
      const $pages = tag.getAll('.page-replacement');
      const hide = $pages.length === 1;

      if (force || hide) {
        ad.active = false;
        ad.hide();
      }
    }
  },
  async toInternalUri(uri) {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(uri, (entry) => {
        resolve(entry.toInternalURL());
      }, reject);
    });
  },
  promisify(func, ...args) {
    return new Promise((resolve, reject) => {
      func(...args, resolve, reject);
    });
  },
  async checkAPIStatus() {
    try {
      const { status } = await ajax.get(Url.join(constants.API_BASE, 'status'));
      return status === 'ok';
    } catch (error) {
      return false;
    }
  },
  fixFilename(name) {
    if (!name) return name;
    return name.replace(/(\r\n)+|\r+|\n+|\t+/g, '').trim();
  }
};
