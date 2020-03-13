import Cryptojs from 'crypto-js';
import constants from '../constants';
import dialogs from '../components/dialogs';
import keyBindings from '../keyBindings';
import fs from './utils/internalFs';
import tag from 'html-tag-js';

/**
 * 
 * @param {string} fileName 
 * @returns {string}
 */
function getExt(fileName) {
    const res = /(?:\.([^.]+))?$/.exec(fileName);

    return (res[1] || '').toLowerCase();
}

/**
 * 
 * @param {number} code 
 * @returns {string}
 */
function getErrorMessage(code) {
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
}

/**
 * @param {string} ext
 */
function getLangNameFromExt(ext) {
    if (ext === 'mdb') return 'access';
    if (ext === 'any') return 'anyscript';
    if (['xl', 'xls', 'xlr', 'xlsx', 'xltx', 'xlthtml', 'sdc', 'ods', 'dex', 'cell', 'def', 'ods', 'ots', 'uos'].includes(ext)) return 'excel';
    if (ext === 'pde') return 'processinglang';
    if (['py', 'pyc', 'pyd', 'pyo', 'pyw', 'pyz', 'gyp'].includes(ext)) return 'python';
    if (ext === 'src') return 'source';
    if (['doc', 'docx', 'odt', 'rtf', 'wpd'].includes(ext)) return 'word';
    if (['txt', 'csv'].includes(ext)) return 'text';
    return ext;
}

function getLangNameFromFileName(filename) {
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
        fsharp: /\.(fsi|fs|ml|mli|fsx|fsscript)$/i,
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
        html: /\.(html|htm|xhtml|vue|we|wpy)$/i,
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
        shell: /\.(sh|bash)$|^.bashrc$/i,
        slim: /\.(slim|slim)$/i,
        smarty: /\.(smarty|tpl)$/i,
        sql: /\.sql$/i,
        stylus: /\.(styl|stylus)$/i,
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
        yaml: /\.(yaml|yml)$/i
    };
    for (let type in regex) {
        if (regex[type].test(filename)) return type;
    }

    const ext = getExt(filename);
    return getLangNameFromExt(ext);
}

/**
 * 
 * @param {FileEntry[]} list 
 * @param {object} fileBrowser settings
 * @param {boolean} [readOnly] 
 * @param {string} [origin] 
 * @param {string} [uuid] 
 */
function sortDir(list, fileBrowser, readOnly = false, origin = null, uuid = null) {
    const dir = [];
    const file = [];
    const sortByName = fileBrowser.sortByName === 'on' ? true : false;
    const showHiddenFile = fileBrowser.showHiddenFiles === 'on' ? true : false;

    list.map(item => {

        item.type = item.isFile ? getIconForFile(item.name) : 'folder';
        item.readOnly = readOnly;
        item.canWrite = !readOnly;

        if (origin) item.origin = origin;
        if (uuid) item.uuid = uuid;

        if ((item.name[0] === '.' && showHiddenFile) || item.name[0] !== '.') {
            if (item.isDirectory)
                return dir.push(item);

            if (item.isFile)
                return file.push(item);
        }

        return item;
    });

    if (sortByName) {
        dir.sort(compare);
        file.sort(compare);
    }

    function compare(a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    }

    return dir.concat(file);
}

/**
 * 
 * @param {string} filename 
 */

function getIconForFile(filename) {
    let file;
    let ext = getExt(filename);

    if (['mp4', 'm4a', 'mov', '3gp', 'wmv', 'flv', 'avi'].includes(ext)) file = 'movie';
    if (['png', 'svg', 'jpeg', 'jpg', 'gif', 'ico'].includes(ext)) file = 'image';
    if (['wav', 'mp3', 'flac'].includes(ext)) file = 'audiotrack';
    if (['zip', 'rar', 'tar', 'deb'].includes(ext)) file = 'zip';
    if (ext === 'apk') file = 'android';

    if (file) return 'icon ' + file;
    return `file file_type_${getLangNameFromFileName(filename)}`;
}

/**
 * 
 * @param {string} url 
 */
function _convertToFile(url) {
    const providerRegex = /content\:\/\/(.*)(\/external_storage\/|\/file\/storage\/emulated\/0\/|\/external_dir\/)/;
    const root = cordova.file.externalRootDirectory;

    const parsed = decodeURIComponent(url.split('/').slice(-1)[0]).split(':');
    if (parsed.length === 2) {
        const type = parsed[0];
        url = parsed[1];
        if (type === 'primary') {
            return cordova.file.externalRootDirectory + url;
        }
    }

    if (/com\.google\.android\.apps\.nbu\.files\.provider/.test(url))
        return decodeURIComponent(url.split('/').pop());

    if (providerRegex.test(url))
        return root + url.replace(providerRegex.exec(url)[0], '');

    return false;
}

/**
 * If given url is a content url then it convert its to file if possible. eg.
 * ```js
 * convertToFile("content://com.xyz.provider/file") //file:///path/file
 * ```
 * @param {string} url
 * @returns {Promise<string>} 
 */
function convertToFile(url) {
    return new Promise((resolve, reject) => {

        const converted = _convertToFile(url);
        if (converted) {

            window.resolveLocalFileSystemURL(converted, entry => {
                resolve(converted);
            }, err => {
                reject();
            });

        } else {
            reject();
        }

    });
}

/**
 * 
 * @param {string} color 
 * @returns {'hex'|'rgb'|'hsl'}
 */
function checkColorType(color) {
    const {
        HEX_COLOR,
        RGB_COLOR,
        HSL_COLOR
    } = constants;

    if (HEX_COLOR.test(color)) return 'hex';
    if (RGB_COLOR.test(color)) return 'rgb';
    if (HSL_COLOR.test(color)) return 'hsl';
    return null;

}
/**
 * 
 * @param {string} str 
 * @returns {string}
 */
function removeLineBreaks(str) {
    return str.replace(/(\r\n)+|\r+|\n+|\t+/g, '');
}

/**
 * 
 * @param {string} url 
 */
function updateFolders(url) {
    url = encodeURI(decodeURL(url));
    for (let key in addedFolder) {
        if (new RegExp(key).test(url)) {
            addedFolder[key].reload();
        }
    }
}

/**
 * @returns {number}
 */
function idGenereator() {
    return parseInt((((1 + Math.random()) * 0x10000) | 0).toString(10).substring(1));
}

const credentials = {
    key: 'xkism2wq3)(I#$MNkds0)*(73am)(*73_L:w3k[*(#WOd983jkdssap sduy*&T#W3elkiu8983hKLUYs*(&y))',

    encrypt(str) {
        return Cryptojs.AES.encrypt(str, this.key).toString();
    },

    decrypt(str) {
        return Cryptojs.AES.decrypt(str, this.key).toString(Cryptojs.enc.Utf8);
    }
};

function b64toBlob(byteCharacters, contentType, sliceSize) {
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
        type: contentType
    });
    return blob;
}

/**
 * Get path from full URI. eg.
 * ```js
    getPath("this/is/a/file.txt", "file.txt"); //'this/is/a/'
    getPath("this/is/a/file") //'this/is/a/'
 * ```
 * @param {string} fullname native url of the file
 * @param {string} [name] 
 */
function getPath(fullname, name) {
    if (name) return fullname.replace(new RegExp(name + '$'), '');
    return fullname.split('/').slice(0, -1).join('/') + '/';
}

/**
 * Checks if content is binary
 * @param {any} content 
 * @returns {boolean}
 */
function isBinary(content) {
    return /[\x00-\x08\x0E-\x1F]/.test(content);
}

/**
 * Decode any url recursively until its fully decoded
 * @param {string} url URL string
 * @returns {string}
 */
function decodeURL(url) {
    if (/%[0-9a-f]{2}/i.test(url)) {
        const newurl = decodeURI(url);
        if (url === newurl) return url;
        return decodeURL(newurl);
    }
    return url;
}

function error(e) {
    if (e.code) {
        dialogs.alert(strings.error, getErrorMessage(e.code));
    } else {
        const msg = (e && typeof e === 'string') ? e : (toString in e && e.toString());
        if (msg) dialogs.alert(strings.error, msg);
        else window.plugins.toast.showShortBottom(strings.error);
    }
}

/**
 * Subtracts the str2 from str1 if its in leading eg. 
 * ```js
  subtract("mystring", "my"); //'string'
  subtract("stringmy", "my"); //'stringmy'
 * ``` 
 *
 * @param {string} str1 string to subtract from
 * @param {string} str2 string to subtract
 */
function subtract(str1, str2) {
    return str1.replace(new RegExp("^" + str2), '');
}

/**
* Checks if child uri is originated from root uri eg.
* ```js
 isParent("file:///sdcard/", "file://sdcard/path/to/file") //true 
 isParent("file:///sdcard2/", "file://sdcard1/path/to/file") //false
* ```
* @param {string} root 
* @param {string} child 
*/
function isParent(root, child) {

    return new RegExp("^" + root).test(child);

}

/**
 * Checks if the given url has write permission.
 * @param {string} fileUri 
 * @returns {Promise<{canWrite: boolean, uuid: string, origin: string}>}
 */
function canWrite(fileUri) {
    return new Promise((resolve, reject) => {

        cordova.plugins.diagnostic.getExternalSdCardDetails(ls => {
            ls.map(card => {
                const uuid = card.path.split('/').splice(-1)[0];
                const path = card.filePath + '/';

                if (isParent(path, fileUri)) {
                    if (!card.canWrite) {
                        resolve({
                            canWrite: false,
                            uuid,
                            origin: path
                        });
                    } else {
                        resolve({
                            canWrite: true
                        });
                    }
                }

            });

            if (isParent(cordova.file.externalRootDirectory, fileUri)) {
                resolve({
                    canWrite: true
                });
            } else {
                resolve({
                    canWrite: false
                });
            }
        });

    });
}

function getFeedbackBody() {
    const buildInfo = window.BuildInfo || {};
    const device = window.device || {};
    return `
    version: ${buildInfo.version} <br>
    device: ${device.model||''} <br> 
    manufacturer: ${device.manufacturer||''} ${device.isVirtual?"(Virtual)":""} <br> 
    OS: ${device.version} <br> 
    Res: ${innerWidth}✕${innerHeight} <br>
    info:
    `;
}

function blob2text(blob) {
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
}

/**
 * Returns unique ID
 * @returns {string}
 */
function uuid() {
    return (new Date().getTime() + parseInt(Math.random() * 100000000000)).toString(36);
}

function resetKeyBindings() {
    const customKeyBindings = {};
    for (let binding in keyBindings) {
        const {
            key,
            readOnly,
            description
        } = keyBindings[binding];
        if (!readOnly) customKeyBindings[binding] = {
            description,
            key
        };
    }
    fs.writeFile(KEYBINDING_FILE, JSON.stringify(customKeyBindings, undefined, 2), true, false);
}

function loadScript(...scripts) {
    scripts.map(script => {
        const $script = tag('script', {
            src: script
        });
        document.head.append($script);
    });
}

/**
 * Resolve the path eg.
```js
resolvePath('path/to/some/dir/', '../../dir') //returns 'path/to/dir'
```
 * @param {string} path1 
 * @param {string} path2 
 */
function resolvePath(path1, path2) {
    if (path2[0] === '/') return path2;
    if (!path1) return path2;
    const path1Ar = path1.split('/');
    const path2Ar = path2.split('/');

    for (let dir of path2Ar) {
        if (dir === '..') {
            path1Ar.pop();
        } else {
            path1Ar.push(dir);
        }
    }

    return path1Ar.join('/');
}

export default {
    getExt,
    getErrorMessage,
    sortDir,
    getLangNameFromExt,
    getIconForFile,
    removeLineBreaks,
    convertToFile,
    updateFolders,
    idGenereator,
    credentials,
    getLangNameFromFileName,
    b64toBlob,
    checkColorType,
    getPath,
    isBinary,
    decodeURL,
    error,
    subtract,
    canWrite,
    isParent,
    getFeedbackBody,
    blob2text,
    uuid,
    resetKeyBindings,
    loadScript,
    resolvePath
};