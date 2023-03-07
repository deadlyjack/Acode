import escapeStringRegexp from 'escape-string-regexp';
import URLParse from 'url-parse';
import constants from '../lib/constants';
import dialogs from '../components/dialogs';
import keyBindings from '../lib/keyBindings';
import tag from 'html-tag-js';
import ajax from '@deadlyjack/ajax';
import path from './Path';
import Url from './Url';
import Uri from './Uri';
import fsOperation from '../fileSystem';
import appSettings from '../lib/settings';

let loaderIsImmortal = false;

export default {
  showTitleLoader(immortal = false) {
    if (typeof immortal === 'boolean') {
      loaderIsImmortal = immortal;
    }

    setTimeout(() => {
      app.classList.remove('title-loading-hide');
      app.classList.add('title-loading');
    }, 0);
  },
  removeTitleLoader(immortal = undefined) {
    if (typeof immortal === 'boolean') {
      loaderIsImmortal = immortal;
    }

    if (loaderIsImmortal) return;
    setTimeout(() => {
      app.classList.add('title-loading-hide');
    }, 0);
  },
  /**
   * Get extension name
   * @param {String} pathname
   * @returns
   */
  extname(pathname) {
    const res = path.extname(pathname);
    if (res) return res.slice(1).toLowerCase();
    return res;
  },
  /**
   * Get error message for file error code
   * @param {number} code
   * @returns {string}
   */
  getErrorMessage(code) {
    switch (code) {
      case 1:
        return 'Path not found';
      case 2:
        return 'Security error';
      case 3:
        return 'Action aborted';
      case 4:
        return 'File not readable';
      case 5:
        return 'File encoding error';
      case 6:
        return 'Modification not allowed';
      case 7:
        return 'Invalid state';
      case 8:
        return 'Syntax error';
      case 9:
        return 'Invalid modification';
      case 10:
        return 'Quota exceeded';
      case 11:
        return 'Type mismatch';
      case 12:
        return 'Path already exists';
      default:
        return 'Uncaught error';
    }
  },
  /**
   * Gets programming language name according to filename
   * @param {String} filename
   * @returns
   */
  getFileType(filename) {
    const regex = {
      postcssconfig: /^postcss\.config\.js$/i,
      typescriptdef: /\.d\.ts$/i,
      webpack: /^webpack\.config\.js$/i,
      yarn: /^yarn\.lock$/i,
      npm: /(^package\.json$)|(^package\-lock\.json$)/i,
      testjs: /\.test\.js$/i,
      testts: /\.test\.ts$/i,
      eslint: /(^\.eslintrc$)|(^\.eslintignore$)/i,
      git: /(^\.gitignore$)|(^\.gitmodules$)/i,
      jsmap: /\.map\.js$/i,
      jsconfig: /^jsconfig.json$/i,
      jsbeautify: /^jsbeautifyrc$/i,
      actionscript: /\.as$/i,
      ada: /\.(ada|adb)$/i,
      apache: /\.?(htaccess|htgroups|conf|htaccess|htpasswd)$/i,
      asciidoc: /\.(asciidoc|adoc)$/i,
      assembly: /\.(a|asm)$/i,
      autohotkey: /\.ahk$/i,
      apex: /\.(apex|cls|trigger|tgr)$/i,
      babel: /\.babelrc$/i,
      crystal: /\.cr$/i,
      cpp: /\.(cpp|cc|cxx|ino)$/i,
      cppheader: /\.(hh|hpp)$/i,
      clojure: /\.clj$/i,
      clojurescript: /\.cljs$/i,
      cobol: /\.(cbl|cob)$/i,
      csharp: /\.cs$/i,
      coffeescript: /(\.(coffee|cf|cson))$|(^cakefile)$/i,
      cmake: /^cmake$/i,
      dartlang: /\.dart$/i,
      diff: /\.diff$/i,
      dlang: /\.(d|di)$/i,
      docker: /^dockerfile$/i,
      drools: /\.drl$/i,
      ejs: /\.ejs$/i,
      elixir: /\.(ex|exs)$/i,
      elm: /\.elm$/i,
      erlang: /\.(erl|hrl)$/i,
      fortran: /\.(f|f90)$/i,
      fsharp: /\.(fsi|fs|fsx|fsscript)$/i,
      gcode: /\.gcode$/i,
      glsl: /\.(glsl|frag|vert)$/i,
      graphql: /\.gql$/i,
      groovy: /\.(groovy|gradle)$/i,
      haml: /\.haml$/i,
      handlebars: /\.(hbs|handlebars|tpl|mustache)$/i,
      haskell: /\.hs$/i,
      cabal: /\.cabal$/i,
      haxe: /\.hx$/i,
      hjson: /\.hjson$/i,
      html: /\.(html|htm|xhtml|we|wpy)$/i,
      ini: /\.(ini|conf|cfg|prefs)$/i,
      io: /\.io$/i,
      javascript: /\.(js|jsm|jsx|mjs|cjs)$/i,
      jsp: /\.jsp$/i,
      julia: /\.jl$/i,
      kotlin: /\.(kt|kts)$/i,
      license: /^license$/i,
      less: /\.less$/i,
      liquid: /\.liquid$/i,
      lisp: /\.lisp$/i,
      livescript: /\.ls$/i,
      lsl: /\.lsl$/i,
      lua: /\.(lua|lp)$/i,
      makefile: /^makefile$|^GNUmakefile$|^OCamlMakefile$|\.?make$/i,
      markdown: /\.(md|markdown)$/i,
      matlab: /\.matlab$/i,
      mysql: /\.mysql$/i,
      nginx: /\.(nginx|conf)$/i,
      nim: /\.nim$/i,
      objectivec: /\.m$/i,
      objectivecpp: /\.mm$/i,
      ocaml: /\.(ml|mli)$/i,
      perl: /\.(pl|pm|p6|pl6|pm6)$/i,
      pgsql: /\.pgsql$/i,
      php: /\.(php|inc|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module)$/i,
      puppet: /\.(epp|pp)$/i,
      powershell: /\.ps1$/i,
      prolog: /\.(plg|prolog)$/i,
      protobug: /\.proto$/i,
      razor: /\.(cshtml|asp)$/i,
      red: /\.(red|reds)$/i,
      ruby: /^rakefile$|^guardfile$|^rakefile$|^gemfile$|\.(rb|ru|gemspec|rake)$/i,
      rust: /\.rs$/i,
      sass: /\.sass$/i,
      scss: /\.scss$/i,
      scala: /\.(scala|sbt)$/i,
      shell: /\.(sh|bash)$|^..*rc$/i,
      android: /\.slim$/i,
      smali: /\.(smali)$/i,
      smarty: /\.(smarty|tpl)$/i,
      sql: /\.sql$/i,
      stylus: /\.(styl|stylus)$/i,
      svelte: /\.svelte$/i,
      svg: /\.svg$/i,
      swift: /\.swift$/i,
      tcl: /\.tcl$/i,
      terraform: /\.(tf|tfvars|terragrunt)$/i,
      tex: /\.tex$/i,
      textile: /\.textile$/i,
      toml: /\.toml$/i,
      typescript: /\.(ts|typescript|str|tsx)$/i,
      vala: /\.vala$/i,
      vb: /\.(vb|vbs)$/i,
      velocity: /\.vm$/i,
      verilog: /\.(v|vh|sv|svh)$/i,
      vhdl: /\.(vhd|vhdl)$/i,
      xml: /\.(xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml)$/i,
      xquery: /\.xq$/i,
      yaml: /\.(yaml|yml)$/i,
    };

    const fileType = Object.keys(regex).find((type) => regex[type].test(filename));
    if (fileType) return fileType;

    const EXCEL = ['xl', 'xls', 'xlr', 'xlsx', 'xltx', 'sdc', 'ods', 'dex', 'cell', 'def', 'ods', 'ots', 'uos'];
    const PYTHON = ['py', 'pyc', 'pyd', 'pyo', 'pyw', 'pyz', 'gyp'];
    const WORD = ['doc', 'docx', 'odt', 'rtf', 'wpd'];
    const TEXT = ['txt', 'csv'];
    const ext = this.extname(filename);

    if (ext === 'mdb') return 'access';
    if (ext === 'any') return 'anyscript';
    if (ext === 'pde') return 'processinglang';
    if (ext === 'src') return 'source';
    if (TEXT.includes(ext)) return 'text';
    if (WORD.includes(ext)) return 'word';
    if (PYTHON.includes(ext)) return 'python';
    if (EXCEL.includes(ext)) return 'excel';
    return ext;
  },
  /**
   * Gets icon according to filename
   * @param {string} filename
   */
  getIconForFile(filename) {
    let ext = this.extname(filename);

    const MOVIE = ['mp4', 'm4a', 'mov', '3gp', 'wmv', 'flv', 'avi'];
    const IMAGE = ['png', 'jpeg', 'jpg', 'gif', 'ico', 'webp'];
    const SONG = ['wav', 'mp3', 'flac'];
    const ZIP = ['zip', 'rar', 'tar', 'deb'];

    if (ext === 'apk') return 'icon android';
    if (SONG.includes(ext)) return 'icon audiotrack';
    if (ZIP.includes(ext)) return 'icon zip';
    if (IMAGE.includes(ext)) return 'icon image';
    if (MOVIE.includes(ext)) return 'icon movie';

    return `file file_type_${this.getFileType(filename)}`;
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
    } else if (err.code !== null) {
      msg = this.getErrorMessage(err.code);
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
      this.toast(err);
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
   *
   * @param {Error} err
   * @param  {...string} args
   */
  toast(err, ...args) {
    window.toast(this.errorMessage(err, ...args));
  },
  /**
   *
   * @param {string} color
   * @returns {'hex'|'rgb'|'hsl'}
   */
  checkColorType(color) {
    const { HEX_COLOR, RGB_COLOR, HSL_COLOR } = constants;

    if (HEX_COLOR.test(color)) return 'hex';
    if (RGB_COLOR.test(color)) return 'rgb';
    if (HSL_COLOR.test(color)) return 'hsl';
    return null;
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
    )
  },
  /**
   *
   * @param {string} str
   * @returns {string}
   */
  removeLineBreaks(str) {
    return str.replace(/(\r\n)+|\r+|\n+|\t+/g, '');
  },
  /**
   * Gets body for feedback email
   * @param {String} eol
   * @returns
   */
  getFeedbackBody(eol) {
    const buildInfo = window.BuildInfo || {};
    const device = window.device || {};
    return (
      'Version: ' +
      `${buildInfo.version} (${buildInfo.versionCode})` +
      eol +
      'Device: ' +
      (device.model || '') +
      eol +
      'Manufacturer: ' +
      (device.manufacturer || '') +
      eol +
      'Android version: ' +
      device.version +
      eol +
      'Info: '
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
   * Resets key binding
   */
  async resetKeyBindings() {
    try {
      const fs = fsOperation(KEYBINDING_FILE);
      const fileName = Url.basename(KEYBINDING_FILE);
      const content = JSON.stringify(keyBindings, undefined, 2);
      if (!(await fs.exists())) {
        await fsOperation(DATA_STORAGE)
          .createFile(fileName, content);
        return;
      }
      await fs.writeFile(content);
    } catch (error) {
      console.error(error);
    }
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
   * @param {ArrayBuffer} arrayBuffer
   * @param {String} [encoding='utf-8']
   */
  decodeText(arrayBuffer, encoding = 'utf-8') {

    const isJson = encoding === 'json';
    if (isJson) encoding = 'utf-8';

    const uint8Array = new Uint8Array(arrayBuffer);
    const result = new TextDecoder(encoding).decode(uint8Array);
    if (isJson) {
      return this.parseJSON(result);
    }
    return result;
  },
  /**
   * Checks if content is binary
   * @param {any} content
   * @returns {boolean}
   */
  isBinary(content) {
    return /[\x00-\x08\x0E-\x1F]/.test(content);
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
   * Checks whether given objects are equal or not
   * @param {Object} obj1
   * @param {Object} obj2
   * @returns
   */
  areEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (obj1.constructor !== obj2.constructor) return false;

    for (let key in obj1) {
      if (!obj2.hasOwnProperty(key)) return false;
      if (obj1[key] === obj2[key]) continue;
      if (typeof obj1[key] !== 'object') return false;
      if (!this.isObjectEqual(obj1[key], obj2[key])) return false;
    }

    return true;
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
        ad.show();
        ad.shown = true;
      }
    }
  },
  /**
   * Hides the ad
   * @param {Boolean} [force=false]
   */
  hideAd(force = false) {
    const { ad } = window;
    if (IS_FREE_VERSION && ad?.shown) {
      const $pages = tag.getAll('.page-replacement');
      const hide = $pages.length === 1;

      if (force || hide) {
        ad.hide();
        ad.shown = false;
      }
    }
  },
  /**
  * Create directory recursively 
  * @param {string} parent 
  * @param {Array<string> | string} dir 
  */
  async createFileRecursive(parent, dir) {
    let isDir = false;
    if (typeof dir === 'string') {
      if (dir.endsWith('/')) {
        isDir = true;
        dir = dir.slice(0, -1);
      }
      dir = dir.split('/');
    }
    dir = dir.filter(d => d);
    const cd = dir.shift();
    const newParent = Url.join(parent, cd);
    if (!(await fsOperation(newParent).exists())) {
      if (dir.length || isDir) {
        await fsOperation(parent).createDirectory(cd);
      } else {
        await fsOperation(parent).createFile(cd);
      }
    }
    if (dir.length) {
      await this.createFileRecursive(newParent, dir);
    }
  },
  /**
   * 
   * @param {AceAjax.Editor} editor 
   * @returns 
   */
  getEditorHeight(editor) {
    const { renderer, session } = editor;
    const offset = (renderer.$size.scrollerHeight + renderer.lineHeight) * 0.5;
    const editorHeight = session.getScreenLength() * renderer.lineHeight - offset;
    return editorHeight;
  },
  getEditorWidth(editor) {
    const { renderer, session } = editor;
    const offset = renderer.$size.scrollerWidth - renderer.characterWidth;
    const editorWidth = session.getScreenWidth() * renderer.characterWidth - offset;
    if (appSettings.value.textWrap) {
      return editorWidth;
    } else {
      return editorWidth + appSettings.value.leftMargin;
    }
  },
  async toInternalUri(uri) {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(uri, (entry) => {
        resolve(entry.toInternalURL());
      }, reject);
    });
  },
  decodeUrl(url) {
    const uuid = this.uuid();

    if (/#/.test(url)) {
      url = url.replace(/#/g, uuid);
    }

    let { username, password, hostname, pathname, port, query } = URLParse(
      url,
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

    let { keyFile, passPhrase } = query;

    if (keyFile) {
      query.keyFile = decodeURIComponent(keyFile);
    }

    if (passPhrase) {
      query.passPhrase = decodeURIComponent(passPhrase);
    }

    return { username, password, hostname, pathname, port, query };
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
    name = name.trim();
    return this.removeLineBreaks(name);
  }
};
