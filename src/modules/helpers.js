import Cryptojs from 'crypto-js';

function getExt(fileName) {
    const res = /(?:\.([^.]+))?$/.exec(fileName);

    return res[1] || '';
}

/**
 * 
 * @param {number} code 
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
    if (ext === 'as') return 'actionscript';
    if (ext === 'asm') return 'assembly';
    if (ext === 'any') return 'anyscript';
    if (ext === 'dart') return 'dartlang';
    if (['xl', 'xls', 'xlr', 'xlsx', 'xltx', 'xlthtml', 'sdc', 'ods'].includes(ext)) return 'excel';
    if (ext === 'fs') return 'fsharp';
    if (['mpt', 'mpf', 'nc'].includes(ext)) return 'gcode';
    if (ext === 'jl') return 'julia';
    if (ext === 'js') return 'javascript';
    if (['kt', 'kts'].includes(ext)) return 'kotlin';
    if (ext === 'pde') return 'processinglang';
    if (['py', 'pyc', 'pyd', 'pyo', 'pyw', 'pyz', 'gyp'].includes(ext)) return 'python';
    if (ext === 'rb') return 'ruby';
    if (['rs', 'rlib'].includes(ext)) return 'rust';
    if (ext === 'src') return 'source';
    if (ext === 'ts') return 'typescript';
    if (ext === 'hbs') return 'handlebars';
    if (ext === 'md') return 'markdown';
    if (ext === 'yml') return 'yaml';
    return ext;
}

function getLangNameFromFileName(filename) {
    const regex = {
        webpack: /^webpack\.config\.js$/i,
        yarn: /^yarn\.lock$/i,
        npm: /(^package\.json$)|(^package\-lock\.json$)/i,
        git: /(^\.gitignore$)|(^\.gitmodules$)/i,
        postcss: /^postcss\.config\.js$/i,
        ruby: /^rakefile$/i,
        makefile: /^makefile$/i,
        cmake: /^cmake$/i,
        license: /^license$/i,
        testjs: /\.test\.js$/i,
        testts: /\.test\.ts$/i,
        eslint: /(^\.eslintrc$)|(^\.eslintignore$)/i,
        typescriptdef: /\.d\.ts$/i,
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
 * @param {object} fileBrowser 
 */
function sortDir(list, fileBrowser, readOnly = false) {
    const dir = [];
    const file = [];
    const sortByName = fileBrowser.sortByName === 'on' ? true : false;
    const showHiddenFile = fileBrowser.showHiddenFiles === 'on' ? true : false;

    list.map(item => {

        item.type = item.isFile ? getIconForFile(item.name) : 'folder';
        item.readOnly = readOnly;

        if ((item.name[0] === '.' && showHiddenFile) || item.name[0] !== '.') {
            if (item.isDirectory)
                return dir.push(item);

            if (item.isFile)
                return file.push(item);
        }
    });

    if (sortByName) {
        dir.sort(compare);
        file.sort(compare);
    }

    function compare(a, b) {
        return a.name < b.name ? -1 : 1;
    }

    return dir.concat(file);
}

/**
 * 
 * @param {string} filename 
 */

function getIconForFile(filename) {
    let ext = (getExt(filename) || '').toLowerCase();

    if (['mp4', 'm4a', 'mov', '3gp', 'wmv', 'flv', 'avi'].includes(ext))
        return 'icon movie';
    if (['png', 'svg', 'jpeg', 'jpg', 'gif', 'ico'].includes(ext))
        return 'icon image';
    if (['wav', 'mp3', 'flac'].includes(ext))
        return 'icon audiotrack';
    if (['zip', 'rar', 'tar', 'deb'].includes(ext))
        return 'icon zip';

    switch (ext) {
        case 'apk':
            return 'icon android';
        case 'text':
        case 'txt':
        case 'log':
            return 'icon document-text';
        case 'doc':
        case 'docx':
        case 'pdf':
            return 'icon document';

        default:
            return `file file_type_${getLangNameFromFileName(filename)}`;
    }
}

/**
 * 
 * @param {string} url 
 */
function convertToFile(url) {
    const providerRegex = /content\:\/\/(.*)(\/external_storage\/|\/file\/storage\/emulated\/0\/|\/external_dir\/)/;
    const root = cordova.file.externalRootDirectory;

    const parsed = decodeURIComponent(url.split('/').slice(-1)[0]).split(':');
    if (parsed.length === 2) {
        const type = parsed[0];
        url = parsed[1];
        if (type === 'primary') {
            const name = decodeURIComponent(url.split('/').pop());
            const dir = cordova.file.externalRootDirectory + url.replace(encodeURIComponent(name), '');
            return {
                dir,
                name
            };
        }
    }

    if (/com\.google\.android\.apps\.nbu\.files\.provider/.test(url))
        return decodeURIComponent(url.split('/').pop());

    if (providerRegex.test(url))
        return root + url.replace(providerRegex.exec(url)[0], '');

    return false;
}

/**
 * 
 * @param {string} str 
 */
function removeLineBreaks(str) {
    return str.replace(/(\r\n)+|\r+|\n+|\t+/g, '');
}

/**
 * 
 * @param {string} url 
 */
function updateFolders(url) {
    for (let key in addedFolder) {
        if (new RegExp(key).test(url)) {
            url = url.replace(url.split('/').slice(-1), '');
            addedFolder[key].reload(url);
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
    getLangNameFromFileName
};