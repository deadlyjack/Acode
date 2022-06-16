import Cryptojs from 'crypto-js';
import constants from '../constants';
import dialogs from '../../components/dialogs';
import keyBindings from '../keyBindings';
import tag from 'html-tag-js';
import ajax from '@deadlyjack/ajax';
import path from './Path';
import Url from './Url';
import Uri from './Uri';
import fsOperation from '../fileSystem/fsOperation';

const credentials = {
  key: 'xkism2wq3)(I#$MNkds0)*(73am)(*73_L:w3k[*(#WOd983jkdssap sduy*&T#W3elkiu8983hKLUYs*(&y))',

  encrypt(str) {
    return Cryptojs.AES.encrypt(str, this.key).toString();
  },

  decrypt(str) {
    return Cryptojs.AES.decrypt(str, this.key).toString(Cryptojs.enc.Utf8);
  },
};

export default {
  credentials,
  showTitleLoader() {
    setTimeout(() => {
      app.classList.remove('title-loading-hide');
      app.classList.add('title-loading');
    }, 0);
  },
  removeTitleLoader() {
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
   * Get programming language name for extension name
   * @param {String} ext
   * @returns
   */
  getLangNameFromExt(ext) {
    if (ext === 'mdb') return 'access';
    if (ext === 'any') return 'anyscript';
    if (
      [
        'xl',
        'xls',
        'xlr',
        'xlsx',
        'xltx',
        'xlthtml',
        'sdc',
        'ods',
        'dex',
        'cell',
        'def',
        'ods',
        'ots',
        'uos',
      ].includes(ext)
    )
      return 'excel';
    if (ext === 'pde') return 'processinglang';
    if (['py', 'pyc', 'pyd', 'pyo', 'pyw', 'pyz', 'gyp'].includes(ext))
      return 'python';
    if (ext === 'src') return 'source';
    if (['doc', 'docx', 'odt', 'rtf', 'wpd'].includes(ext)) return 'word';
    if (['txt', 'csv'].includes(ext)) return 'text';
    return ext;
  },
  /**
   * Gets programming language name according to filename
   * @param {String} filename
   * @returns
   */
  getLangNameFromFileName(filename) {
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
      groovy: /\.groovy$/i,
      haml: /\.haml$/i,
      handlebars: /\.(hbs|handlebars|tpl|mustache)$/i,
      haskell: /\.hs$/i,
      cabal: /\.cabal$/i,
      haxe: /\.hx$/i,
      hjson: /\.hjson$/i,
      html: /\.(html|htm|xhtml|we|wpy)$/i,
      ini: /\.(ini|conf|cfg|prefs)$/i,
      io: /\.io$/i,
      javascript: /\.(js|jsm|jsx)$/i,
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
    for (let type in regex) {
      if (regex[type].test(filename)) return type;
    }

    const ext = this.extname(filename);
    return this.getLangNameFromExt(ext);
  },
  /**
   * Gets icon according to filename
   * @param {string} filename
   */
  getIconForFile(filename) {
    let file;
    let ext = this.extname(filename);

    if (['mp4', 'm4a', 'mov', '3gp', 'wmv', 'flv', 'avi'].includes(ext))
      file = 'movie';
    if (['png', 'jpeg', 'jpg', 'gif', 'ico', 'webp'].includes(ext))
      file = 'image';
    if (['wav', 'mp3', 'flac'].includes(ext)) file = 'audiotrack';
    if (['zip', 'rar', 'tar', 'deb'].includes(ext)) file = 'zip';
    if (ext === 'apk') file = 'android';

    if (file) return 'icon ' + file;
    return `file file_type_${this.getLangNameFromFileName(filename)}`;
  },
  /**
   *
   * @param {FileEntry[]} list
   * @param {object} fileBrowser settings
   * @param {boolean | function(string):boolean} [readOnly]
   * @param {'both'|'file'|'folder'}
   */
  sortDir(list, fileBrowser, readOnly = false, mode = 'both') {
    const dir = [];
    const file = [];
    const sortByName = fileBrowser.sortByName;
    const showHiddenFile = fileBrowser.showHiddenFiles;
    let getEnabled = () => true;

    if (typeof readOnly === 'function') {
      getEnabled = readOnly;
      readOnly = false;
    }

    for (let item of list) {
      let hidden;

      item.name = decodeURL(item.name || path.basename(item.url || ''));
      hidden = item.name[0] === '.';

      if (typeof item.readOnly !== 'boolean') item.readOnly = readOnly;
      if (typeof item.canWrite !== 'boolean') item.canWrite = !readOnly;
      if (typeof item.isDirectory !== 'boolean') {
        if (this.isDir(item.type)) item.isDirectory = true;
      }
      if (!item.type) item.type = item.isDirectory ? 'dir' : 'file';
      if (!item.url) item.url = item.url || item.uri;
      if (item.isFile) item.disabled = !getEnabled(item.name);
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
    }

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
    args.map((arg) => {
      try {
        return Url.pathname(arg);
      } catch (error) {
        return arg;
      }
    });

    const extra = args.join('<br>');
    let msg;

    if (typeof err === 'string') {
      msg = err;
    } else if (err instanceof Error) {
      msg = err.message;
    } else if (err.code !== null) {
      msg = this.getErrorMessage(err.code);
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
    console.error(err, ...args);

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
   *
   * @param {string} str
   * @returns {string}
   */
  removeLineBreaks(str) {
    return str.replace(/(\r\n)+|\r+|\n+|\t+/g, '');
  },
  /**
   * Conversts base64 string ot Blob
   * @param {Uint8Array} byteCharacters
   * @param {String} contentType
   * @param {Number} sliceSize
   * @returns {Blob}
   */
  b64toBlob(byteCharacters, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, {
      type: contentType,
    });
    return blob;
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
      buildInfo.version +
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
   * Converts Blob object to text
   * @param {Blob} blob
   * @returns {String}
   */
  blob2text(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function () {
        resolve(reader.result);
      };

      reader.onerror = function () {
        reject(reader.error);
      };

      reader.readAsText(blob);
    });
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
    const customKeyBindings = {};
    for (let binding in keyBindings) {
      const { key, readOnly, description } = keyBindings[binding];
      if (!readOnly)
        customKeyBindings[binding] = {
          description,
          key,
        };
    }
    const fs = fsOperation(KEYBINDING_FILE);
    if (!(await fs.exists())) {
      fsOperation(DATA_STORAGE).createFile(Url.basename(KEYBINDING_FILE));
    }
    try {
      fs.writeFile(JSON.stringify(customKeyBindings, undefined, 2));
    } catch (error) {
      console.log(error);
    }
  },
  /**
   * Loads script files to app
   * @param  {...string} scripts
   * @returns {Promise<void>}
   */
  loadScripts(...scripts) {
    return new Promise((resolve) => {
      load();

      function load() {
        const script = scripts.splice(0, 1);
        ajax({
          url: script,
          responseType: 'text',
        })
          .then((res) => {
            const $script = tag('script', {
              id: script,
              textContent: res,
            });
            document.head.append($script);
          })
          .finally(() => {
            if (!scripts.length) resolve();
            else load();
          });
      }
    });
  },
  /**
   * Loads style sheet to app
   * @param  {...string} styles
   * @returns {Promise<void>}
   */
  loadStyles(...styles) {
    return new Promise((resolve) => {
      load();

      function load() {
        const style = styles.splice(0, 1);
        ajax({
          url: style,
          responseType: 'text',
        })
          .then((res) => {
            const $style = tag('style', {
              id: style,
              textContent: res,
            });
            document.head.append($style);
          })
          .finally(() => {
            if (!styles.length) resolve();
            else load();
          });
      }
    });
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
   * Gets keyboard combination pressed by user
   * @param {KeyboardEvent} e
   * @returns {string}
   */
  getCombination(e) {
    let key = e.ctrlKey ? 'Ctrl-' : '';
    key += e.shiftKey ? 'Shift-' : '';
    key += e.key;
    return key.toLowerCase();
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
   * Converts JSON object to CSS string
   * @param {String} selector
   * @param {Map<String, String>} obj
   * @returns {String}
   */
  jsonToCSS(selector, obj) {
    let cssText = `${selector}{\n`;

    for (let key in obj) {
      cssText += `${key}: ${obj[key]};\n`;
    }

    return cssText + '}';
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
      return Uri.getVirtualAddress(url);
    }

    const storageList = JSON.parse(localStorage.storageList || '[]');

    for (let uuid of storageList) {
      const storageUrl = Url.parse(uuid.uri || '').url;
      if (!storageUrl) continue;
      const regex = new RegExp('^' + storageUrl);
      if (regex.test(url)) {
        url = url.replace(
          regex,
          `${uuid.name}${url.startsWith('/') ? '' : '/'}`,
        );
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
      if (new RegExp('^' + url).test(fileUrl)) {
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
      const $page = tag.getAll('.page:not(#root)').pop();
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
      const $pages = tag.getAll('.page:not(#root)');
      if (force || $pages.length === 1) {
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
    if (typeof dir === 'string') {
      dir = dir.split('/');
    }
    dir = dir.filter(d => d);
    const cd = dir.shift();
    const newParent = Url.join(parent, cd);
    if (!(await fsOperation(newParent).exists())) {
      if (dir.length) {
        await fsOperation(parent).createDirectory(cd);
      } else {
        await fsOperation(parent).createFile(cd);
      }
    }
    if (dir.length) {
      await this.createFileRecursive(newParent, dir);
    }
  }
};
