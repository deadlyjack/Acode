/// <reference path="../node_modules/@types/ace/"/>
/// <reference path="../node_modules/html-tag-js/dist/tag.d.ts"/>


interface Acode {
    exec(command: string, value?: any): boolean;
}

interface fileBrowserSettings {
    showHiddenFiles: "on" | "off";
    sortByName: "on" | "off";
}

interface searchSettings {
    wrap: boolean;
    caseSensitive: boolean;
    regExp: boolean;
    wholeWord: boolean;
}

interface Settings {
    autosave: number;
    fileBrowser: fileBrowserSettings;
    maxFileSize: number;
    filesNotAllowed: string[];
    search: searchSettings;
    lang: string;
    fontSize: string;
    editorTheme: string;
    appTheme: string,
    textWrap: boolean;
    softTab: boolean;
    tabSize: number;
    linenumbers: boolean;
    beautify: Array<string>;
    linting: boolean;
    previewMode: 'browser' | 'in app' | 'none';
    showSpaces: boolean;
    openFileListPos: 'sidebar' | 'header';
    quickTools: Boolean;
    editorFont: "fira code" | "default";
}

interface AppSettings {
    value: Settings;
    update(settings?: String): void;
    defaultSettings: Settings;
    reset(): void;
    onload: () => void;
    onsave: () => void;
    loaded: boolean;
}

interface ActionStackOptions {
    id: string;
    action(): void;
}

interface ActionStack {
    push(options: ActionStackOptions): void;
    pop(): ActionStack;
    remove(id: string): void;
    has(id: string): Boolean;
    length: Number;
}

interface storedFiles {
    name: string;
    data?: string;
    url?: string;
}

interface fileOptions {
    name: string;
    dir: string;
}

interface newFileOptions {
    contentUri?: string;
    filename: string;
    fileUri?: string;
    location?: string;
    text?: string;
    render?: boolean;
    readonly?: boolean;
    cursorPos?: AceAjax.Position;
    type: 'regular' | 'git' | 'gist';
    record: Repo | Gist;
}

interface Controls {
    start: HTMLSpanElement;
    end: HTMLSpanElement;
    menu: HTMLSpanElement;
    fullContent: string;
    update: () => void;
    color: HTMLSpanElement;
    checkForColor(): void;
}

interface File {
    assocTile: HTMLElement;
    contentUri: string;
    fileUri: string;
    filename: string;
    id: string;
    isUnsaved: boolean;
    location: string;
    readOnly: boolean;
    type: 'regular' | 'git' | 'gist';
    record: Repo | Gist,
    updateControls: function(): void;
    session: AceAjax.IEditSession;
    editable: boolean;
    canWrite: boolean;
    origin: string;
    uuid: string;
}

interface ExternalFs {
    readFile(): Promise<fileData>;
    createFile(parent: string, filename: string, data: string): Promise<'SUCCESS'>;
    createDir(parent: string, path: string): Promise<'SUCCESS'>;
    deleteFile(filename: string): Promise<'SUCCESS'>;
    writeFile(filename: string, content: string): Promise<'SUCCESS'>;
    renameFile(src: string, newname: string): Promise<'SUCCESS'>;
    copy(src: string, dest: string): Promise<'SUCCESS'>;
    move(src: string, dest: string): Promise<'SUCCESS'>;
    uuid: string;
}

interface RemoteFs {
    listDir(path: string): Promise<Array<FsEntry>>
    readFile(path: string): Promise<ArrayBuffer | string>
    createFile(filename: string, data: string): Promise;
    createDir(path: string): Promise;
    deleteFile(filename: string): Promise;
    deleteDir(path: string): Promise;
    writeFile(filename: string, content: string): Promise;
    rename(src: string, newname: string): Promise;
    copyTo(src: string, dest: string): Promise;
    origin: string;
}

interface fileData {
    file: FileEntry;
    data: ArrayBuffer;
}

interface InternalFs {
    listDir(path: string): Promise<Entry[]>;
    createDir(parent: string, dirname: string): Promise<void>;
    deleteFile(filename: string): Promise<void>;
    readFile(filename: string): Promise<fileData>;
    writeFile(filename: string, content: string, create: boolean, exclusive: boolean): Promise<void>;
    renameFile(src: string, newname: string): Promise<void>;
}

interface FsEntry {
    url: string;
    isDirectory: boolean;
    isFile: boolean;
}

interface FileSystem {
    lsDir(): Promise<Array<FsEntry>>
    readFile(): Promise<ArrayBuffer>;
    readFile(encoding: string): Promise<string>;
    writeFile(content: string): Promise<void>;
    createFile(name: string): Promise<void>,
    createDirectory(name: string): Promise<void>;
    deleteFile(): Promise<void>;
    deleteDir(): Promise<void>;
    copyTo(dest: string): Promise<void>;
    moveTo(dset: string): Promise<void>;
    renameTo(newName: string): Promise<void>;
}

interface externalStorageData {
    path: string;
    name: string;
    origin: string;
}

interface externalStorage {
    get(uuid: string): externalStorageData;
    savePath(uuid: string, path: string): void;
    saveOrigin(uuid: string, origin: string): void;
    saveName(uuid: string, name: string): void;
}

interface elementContainer {
    [key: string]: HTMLElement
}

interface GistFile {
    filename: string;
    content: string;
}

interface GistFiles {
    [filename: string]: GistFile;
}

interface Repo {
    readonly sha: string;
    name: string;
    data: string;
    repo: string;
    branch?: string;
    path: string;
    branch: 'master' | string;
    commitMessage: string;
    setName(name: string): Promise<void>;
    setData(data: string): Promise<void>;
}

interface Gist {
    readonly id: string;
    readonly isNew: boolean;
    files: GistFiles;
    setName(name: string, newName: string): Promise<void>;
    setData(name: string, text: string): Promise<void>;
    addFile(name: string): void;
    removeFile(name: string): Promise<void>;
}

interface GitRecord {
    get(sha: string): Promise<Repo>;
    add(gitFileRecord: Repo): void;
    remove(sha: string): Repo;
    update(sha: string, gitFileRecord: Repo): void;
}

interface GistRecord {
    get(id: string): Gist;
    add(gist: any, isNew?: boolean): void;
    remove(gist: Gist): Gist;
    update(gist: Gist): void;
    reset(): void;
}

interface Manager {
    addNewFile(filename: string, options: newFileOptions): File;
    getFile(checkFor: string | number | Repo | Gist, type: "id" | "name" | "fileUri" | "contentUri" | "git" | "gist"): File;
    switchFile(id: string): void;
    removeFile(id: string | File, force: boolean): void;
    editor: AceAjax.Editor;
    activeFile: File;
    onupdate: function(): void;
    files: Array<File>;
    controls: Controls;
    state: 'blur' | 'focus';
    setSubText(file: File): void;
    moveOpenFileList(): void;
    sidebar: HTMLDivElement;
    container: HTMLDivElement;
    readonly TIMEOUT_VALUE: number;
    readonly openFileList: HTMLElement;
}

interface Strings {
    [key: string]: string
}

interface Collaspable {
    $title: HTMLElement;
    $ul: HTMLElement;
    ontoggle(): void;
    collapse(): void;
    uncollapse(): void;
    collapsed: boolean
}

interface Folder {
    reload(): void;
    url: string;
    $node: Collaspable & HTMLElement;
    remove(): void;
    reloadOnResume: boolean;
    saveState: boolean;
}

interface Window {
    beforeClose: function(): void;
    getCloseMessage: function(): string;
    restoreTheme(): void;
}

interface FileClipBoard {
    method: "copy" | "cut";
    type: "file" | "dir";
    nodeId: string
}

interface ThemeData {
    name: string;
    type: "light" | "dark";
    isFree: boolean;
    darken: string;
    primary: string;
}

interface AppThemeList {
    [theme: string]: ThemeData
}

/**
 * App settings
 */
declare var appSettings: AppSettings;
/**
 * language of the app
 */
declare var lang: string;
/**
 * Predefined strings for language support
 */
declare var strings: Strings;
/**
 * Handles back button click
 */
declare var actionStack: ActionStack;
declare var ace: AceAjax;
declare var fileClipBoard: FileClipBoard;
declare var addedFolder: Array<Folder>;
declare var editorManager: Manager;
declare var saveInterval: Number;
declare var freeze: Boolean;
declare var app: HTMLBodyElement;
declare var root: HTMLDivElement;
declare var gitRecord: GitRecord;
declare var gistRecord: GistRecord;
declare var gitRecordURL: string;
declare var gistRecordURL: string;
declare var Acode: Acode;
declare var DATA_STORAGE: string;
declare var CACHE_STORAGE: string;
declare var CACHE_STORAGE_REMOTE: string;
declare var KEYBINDING_FILE: string;
declare var IS_FREE_VERSION: boolean;
declare var DOES_SUPPORT_THEME: boolean;
declare var externalStorage: externalStorage;
declare var AceMouseEvent: any;
/**
 * A custom alert box to show alert notification
 * @param title 
 * @param message 
 */
declare function alert(title: string, message: string): void;