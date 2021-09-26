/// <reference path="../node_modules/@types/ace/"/>
/// <reference path="../node_modules/html-tag-js/dist/tag.d.ts"/>


interface Acode {
    exec(command: String, value?: any): boolean;
    readonly exitAppMessage: String;
    $menuToggler: HTMLElement;
    $editMenuToggler: HTMLElement;
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
    animation: Boolean;
    autosave: number;
    fileBrowser: fileBrowserSettings;
    maxFileSize: number;
    filesNotAllowed: String[];
    search: searchSettings;
    lang: String;
    fontSize: String;
    editorTheme: String;
    appTheme: String,
    textWrap: boolean;
    softTab: boolean;
    tabSize: number;
    linenumbers: boolean;
    beautify: Array<String>;
    linting: boolean;
    previewMode: "browser" | "in app" | "none";
    showSpaces: boolean;
    openFileListPos: 'sidebar' | 'header';
    quickTools: Boolean;
    editorFont: "fira code" | "default";
    vibrateOnTap: boolean;
    fullscreen: boolean;
    smartCompletion: boolean;
    floatingButtonActivation: "click" | "long tap";
    floatingButton: boolean;
    liveAutoCompletion: boolean;
    showPrintMargin: boolean;
    cursorControllerSize: "none" | "small" | "large",
    scrollbarSize: number;
    confirmOnExit: boolean;
    showConsole: boolean;
    customTheme: Map<String, String>;
    customThemeMode: 'light' | 'dark';
    lineHeight: Number;
}

interface AppSettings {
    value: Settings;
    update(settings?: Settings, showToast?: Boolean): Promise<void>;
    update(showToast?: Boolean): Promise<void>;
    defaultSettings: Settings;
    reset(): void;
    onload: () => void;
    onsave: () => void;
    loaded: boolean;
    isFileAllowed(ext: String): Boolean;
    on(eventName: 'reset' | 'update', callback: (this: Settings, settings: Settings | String) => void): void;
    off(eventName: 'reset' | 'update', callback: (this: Settings, settings: Settings | String) => void): void;
}

interface ActionStackOptions {
    id: String;
    action(): void;
}

interface ActionStack {
    push(options: ActionStackOptions): void;
    pop(): ActionStack;
    remove(id: String): void;
    has(id: String): Boolean;
    length: Number;
    /**
     * Sets a mark to recently pushed action
     */
    setMark(): void;
    /**
     * Remove all actions that are pushed after marked positions (using `setMark()`)
     */
    clearFromMark(): void;
    /**
     * Callback function when app is to close
     */
    onCloseApp: ()=> void;
}

interface storedFiles {
    name: String;
    data?: String;
    url?: String;
    fileUri?: String;
}

interface fileOptions {
    name: String;
    uri: String;
}

interface NewFileOptions {
    uri?: String;
    text?: String;
    render?: boolean;
    readonly?: boolean;
    cursorPos?: AceAjax.Position;
    type: 'regular' | 'git' | 'gist';
    record: Repo | Gist;
    onsave(): void;
    isUnsaved: Boolean;
    mode: 'single'|'tree';
}

interface Controls {
    start: HTMLSpanElement;
    end: HTMLSpanElement;
    menu: HTMLSpanElement;
    fullContent: String;
    update: () => void;
    color: HTMLSpanElement;
    checkForColor(): void;
    hScrollbar: Scrollbar;
    vScrollbar: Scrollbar;
}

interface Scrollbar extends HTMLElement {
    size: number;
    value: number;
    /**Destroys the scrollbar by removing it from DOM and memory. */
    destroy(): void;
    /**Displays the scrollbar and hides after 3 seconds of inactivity. */
    render(): void;
    /**Resize the scrollbar dimension value. */
    resize(render: Boolean): void;
    /**Callback function called when scrollbar is rendered. */
    onhide(): void;
    /**Callback function called when scrollbar is removed. */
    onshow(): void;
    /**Renders the scrollbar. */
    show(): void;
    /**Hides the scroller. */
    hide(): void;
}

interface File {
    assocTile: HTMLElement;
    /**
     * Location of the file on the current device or on remote server/device.
     */
    uri: String;
    /**
     * Name of the file
     */
    filename: String;
    /**
     * Unique ID of the file.
     */
    id: String;
    /**
     * If changed is changed this will be marked as true else false.
     */
    isUnsaved: Boolean;
    /**
     * Path of the file.
     */
    location: String;
    /**
     * Checked if file can be edited.
     */
    readOnly: Boolean;
    /**
     * Type of file.
     */
    type: 'regular' | 'git' | 'gist';
    record: Repo & Gist,
    updateControls: function(): void;
    session: AceAjax.IEditSession;
    editable: Boolean;
    canWrite: Boolean;
    uuid: String;
    onsave(this: File): void;
    mode: 'single'|'tree';
    /**
     * Write file data to cache
     */
    writeToCache(): Promise<void>;
    /**
     * Checks if file is changed or not
     */
    isChanged(): Promise<Boolean>;
}

interface FileStatus {
    canRead: boolean;
    canWrite: boolean;
    exists: boolean; //indicates if file can be found on device storage
    isDirectory: boolean;
    isFile: boolean;
    isVirtual: boolean;
    lastModified: number;
    length: number;
    name: String;
    type: String;
    uri: String;
}

interface OriginObject {
    origin: String;
    query: String;
}

interface URLObject {
    url: String;
    query: String;
}


interface fileData {
    file: FileEntry;
    data: ArrayBuffer;
}

interface ExternalFs {
    readFile(): Promise<fileData>;
    createFile(parent: String, filename: String, data: String): Promise<'SUCCESS'>;
    createDir(parent: String, path: String): Promise<'SUCCESS'>;
    deleteFile(filename: String): Promise<'SUCCESS'>;
    writeFile(filename: String, content: String): Promise<'SUCCESS'>;
    renameFile(src: String, newname: String): Promise<'SUCCESS'>;
    copy(src: String, dest: String): Promise<'SUCCESS'>;
    move(src: String, dest: String): Promise<'SUCCESS'>;
    stats(src: String): Promise<FileStatus>;
    uuid: String;
}

interface RemoteFs {
    listDir(path: String): Promise<Array<FsEntry>>
    readFile(path: String): Promise<ArrayBuffer | String>
    createFile(filename: String, data: String): Promise;
    createDir(path: String): Promise;
    deleteFile(filename: String): Promise;
    deleteDir(path: String): Promise;
    writeFile(filename: String, content: String): Promise;
    rename(src: String, newname: String): Promise;
    copyTo(src: String, dest: String): Promise;
    currentDirectory(): Promise<String>;
    homeDirectory(): Promise<String>;
    stats(src: String): Promise<FileStatus>;
    /**
     * Resolve with true if file exists else resolve if false. Rejects if any error is generated.
     */
    exists(): Promise<Boolean>;
    origin: String;
    originObjec: OriginObject;
}

interface InternalFs {
    copyTo(dest: String): Promise<String>;
    moveTo(dest: String): Promise<String>;
    listDir(path: String): Promise<Entry[]>;
    createDir(parent: String, dirname: String): Promise<void>;
    deleteFile(filename: String): Promise<void>;
    readFile(filename: String): Promise<fileData>;
    writeFile(filename: String, content: String, create: boolean, exclusive: boolean): Promise<void>;
    renameFile(src: String, newname: String): Promise<void>;
    stats(src: String): Promise<FileStatus>;
    exists(): Promise<Boolean>;
}

interface FsEntry {
    url: String;
    isDirectory: boolean;
    isFile: boolean;
}

interface FileSystem {
    lsDir(): Promise<Array<FsEntry>>
    readFile(): Promise<ArrayBuffer>;
    readFile(encoding: String): Promise<String>;
    writeFile(content: String): Promise<void>;
    createFile(name: String, data: String): Promise<void>,
    createDirectory(name: String): Promise<void>;
    deleteFile(): Promise<void>;
    deleteDir(): Promise<void>;
    copyTo(dest: String): Promise<String>;
    moveTo(dset: String): Promise<String>;
    renameTo(newName: String): Promise<void>;
    exists(): Promise<Boolean>;
    stats(): Promise<FileStatus>
}

interface externalStorageData {
    path: String;
    name: String;
    origin: String;
}

interface elementContainer {
    [key: String]: HTMLElement
}

interface GistFile {
    filename: String;
    content: String;
}

interface GistFiles {
    [filename: String]: GistFile;
}

interface Repo {
    readonly sha: String;
    name: String;
    data: String;
    repo: String;
    path: String;
    branch: 'master' | 'main' | String;
    commitMessage: String;
    setName(name: String): Promise<void>;
    setData(data: String): Promise<void>;
    repository: Repository;
}

interface Gist {
    readonly id: String;
    readonly isNew: boolean;
    files: GistFiles;
    setName(name: String, newName: String): Promise<void>;
    setData(name: String, text: String): Promise<void>;
    addFile(name: String): void;
    removeFile(name: String): Promise<void>;
}

interface GitRecord {
    get(sha: String): Promise<Repo>;
    add(gitFileRecord: Repo): void;
    remove(sha: String): Repo;
    update(sha: String, gitFileRecord: Repo): void;
}

interface GistRecord {
    get(id: String): Gist;
    add(gist: any, isNew?: boolean): void;
    remove(gist: Gist): Gist;
    update(gist: Gist): void;
    reset(): void;
}

interface EditorScroll{
    readonly $vScrollbar: Scrollbar;
    readonly $hScrollbar: Scrollbar;
}

interface Manager {
    addNewFile(filename: String, options: NewFileOptions): File;
    getFile(checkFor: String | number | Repo | Gist, type: "id" | "name" | "uri" | "git" | "gist"): File;
    switchFile(id: String): void;
    removeFile(id: String | File, force: boolean): void;
    editor: AceAjax.Editor;
    activeFile: File;
    onupdate(operation: String, ...args: any): void;
    files: Array<File>;
    controls: Controls;
    state: 'blur' | 'focus';
    setSubText(file: File): void;
    moveOpenFileList(): void;
    sidebar: HTMLDivElement;
    container: HTMLDivElement;
    readonly scroll: EditorScroll;
    readonly TIMEOUT_VALUE: number;
    readonly openFileList: HTMLElement;
}

interface Strings {
    [key: String]: String
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
    url: String;
    $node: Collaspable & HTMLElement;
    remove(): void;
    reloadOnResume: boolean;
    saveState: boolean;
    title: String;
    id: String;
}

interface Window {
    restoreTheme(): void;
}

interface FileClipBoard {
    method: "copy" | "cut";
    type: "file" | "dir";
    nodeId: String
}

interface ThemeData {
    name: String;
    type: "light" | "dark";
    isFree: boolean;
    darken: String;
    primary: String;
}

interface AppThemeList {
    [theme: String]: ThemeData
}

interface Prompt{
    /**
     * Body of the prompt
     */
    $body: HTMLElement;
    /**
     * Hides the prompt
     */
    hide(): void;
}

interface Input {
    id: String;
    type: "text" | "numberic" | "tel" | "search" | "email" | "url" | "checkbox" | "radio" | "group" | "button";
    match: RegExp;
    value: String;
    name: String;
    required: boolean;
    hints(options: Array<String>): void;
    placeholder: String;
    disabled: boolean;
    onclick(this: HTMLElement): void;
}

interface FTPFile {
    name: String;
    link: String;
    type: number;
    size: number;
    modifiedDate: String;
    absolutePath: String
}

interface PathObject {
    dir: String;
    root: String;
    base: String;
    name: String;
    ext: String;
}

interface PathData {
    url: String;
    name: String;
    isDirectory: Boolean;
    type: String;
    parent: Boolean;
}

interface String extends String {
    /**
     * Capitalize the String for e.g. converts "this is a String" to "This Is A String"
     */
    capitalize(): String;
    /**
     * Capitalize a character at given index for e.g.
     * ```js
     * "this is a String".capitalize(0) //"This is a String"
     * ```
     */
    capitalize(index): String;
    /**
     * Returns hashcode of the String
     */
    hashCode(): String;
    /**
     * Subtract the String passed in argument from the given String,
     * For e.g. ```"myname".subtract("my") //"name"```
     */
    subtract(str: String): String;
}

interface RecentPathData {
    type: "file" | "dir";
    val: RecentPathDataValue;
}

interface RecentPathDataValue {
    opts: Object;
    url: String;
}

interface KeyBinding{
    description: String;
    key: String;
    readOnly: Boolean;
    action: String;
}

interface Promotion{
    image: String;
    title: String;
    description: String;
}

/**
 * Returns fully decoded url
 * @param url 
 */
declare function decodeURL(url: String): String;

/**
 * App settings
 */
declare var appSettings: AppSettings;
/**
 * language of the app
 */
declare var lang: String;
/**
 * Predefined strings for language support
 */
declare var strings: Strings;
/**
 * Handles back button click
 */
declare var Acode: Acode;
declare var AceMouseEvent: any;

declare var ASSETS_DIRECTORY: String;
declare var CACHE_STORAGE: String;
declare var DATA_STORAGE: String;
declare var DOES_SUPPORT_THEME: boolean;
declare var IS_FREE_VERSION: boolean;
declare var KEYBINDING_FILE: String;
declare var ANDROID_SDK_INT: Number;

declare var modelist: any;
declare var beautify: any;
declare var intent: any;

declare var $placeholder: HTMLElement;
declare var pageCount: Number;
declare var saveTimeout: Number;
declare var promotion: Promotion;
declare var appStarted: Boolean;
declare var defaultKeyBindings: Map<String, KeyBinding>;
declare var customKeyBindings: Map<String, KeyBinding>;
declare var ace: AceAjax;
declare var actionStack: ActionStack;
declare var addedFolder: Array<Folder>;
declare var app: HTMLBodyElement;
declare var editorManager: Manager;
declare var fileClipBoard: FileClipBoard;
declare var freeze: Boolean;
declare var gitRecord: GitRecord;
declare var gistRecord: GistRecord;
declare var gitRecordFile: String;
declare var gistRecordFile: String;
declare var root: HTMLDivElement;
declare var saveInterval: Number;
declare var toastQueue: Array<HTMLElement>;
declare var __sftpBusy: Boolean;
declare var __sftpTaskQueue: Array<()=>void>;
declare var keyBindings: (name: String)=>String;
declare var toast: (String)=>void;