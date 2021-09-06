/// <reference path="../node_modules/@types/ace/"/>
/// <reference path="../node_modules/html-tag-js/dist/tag.d.ts"/>


interface Acode {
    exec(command: string, value?: any): boolean;
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
    id: string;
    action(): void;
}

interface ActionStack {
    push(options: ActionStackOptions): void;
    pop(): ActionStack;
    remove(id: string): void;
    has(id: string): Boolean;
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
    name: string;
    data?: string;
    url?: string;
    fileUri?: string;
}

interface fileOptions {
    name: string;
    uri: string;
}

interface NewFileOptions {
    uri?: string;
    text?: string;
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
    fullContent: string;
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
    resize(): void;
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
    uri: string;
    /**
     * Name of the file
     */
    filename: string;
    /**
     * Unique ID of the file.
     */
    id: string;
    /**
     * If changed is changed this will be marked as true else false.
     */
    isUnsaved: boolean;
    /**
     * Path of the file.
     */
    location: string;
    /**
     * Checked if file can be edited.
     */
    readOnly: boolean;
    /**
     * Type of file.
     */
    type: 'regular' | 'git' | 'gist';
    record: Repo | Gist,
    updateControls: function(): void;
    session: AceAjax.IEditSession;
    editable: boolean;
    canWrite: boolean;
    uuid: string;
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
    name: string;
    type: string;
    uri: string;
}

interface OriginObject {
    origin: string;
    query: string;
}

interface URLObject {
    url: string;
    query: string;
}


interface fileData {
    file: FileEntry;
    data: ArrayBuffer;
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
    stats(src: string): Promise<FileStatus>;
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
    currentDirectory(): Promise<string>;
    homeDirectory(): Promise<string>;
    stats(src: string): Promise<FileStatus>;
    /**
     * Resolve with true if file exists else resolve if false. Rejects if any error is generated.
     */
    exists(): Promise<Boolean>;
    origin: string;
    originObjec: OriginObject;
}

interface InternalFs {
    copyTo(dest: string): Promise<string>;
    moveTo(dest: string): Promise<string>;
    listDir(path: string): Promise<Entry[]>;
    createDir(parent: string, dirname: string): Promise<void>;
    deleteFile(filename: string): Promise<void>;
    readFile(filename: string): Promise<fileData>;
    writeFile(filename: string, content: string, create: boolean, exclusive: boolean): Promise<void>;
    renameFile(src: string, newname: string): Promise<void>;
    stats(src: string): Promise<FileStatus>;
    exists(): Promise<Boolean>;
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
    createFile(name: string, data: string): Promise<void>,
    createDirectory(name: string): Promise<void>;
    deleteFile(): Promise<void>;
    deleteDir(): Promise<void>;
    copyTo(dest: string): Promise<void>;
    moveTo(dset: string): Promise<void>;
    renameTo(newName: string): Promise<void>;
    exists(): Promise<Boolean>;
    stats(): Promise<FileStatus>
}

interface externalStorageData {
    path: string;
    name: string;
    origin: string;
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
    addNewFile(filename: string, options: NewFileOptions): File;
    getFile(checkFor: string | number | Repo | Gist, type: "id" | "name" | "uri" | "git" | "gist"): File;
    switchFile(id: string): void;
    removeFile(id: string | File, force: boolean): void;
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
    title: string;
    id: string;
}

interface Window {
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
    id: string;
    type: "text" | "numberic" | "tel" | "search" | "email" | "url" | "checkbox" | "radio" | "group" | "button";
    match: RegExp;
    value: string;
    name: string;
    required: boolean;
    hints(options: Array<string>): void;
    placeholder: string;
    disabled: boolean;
    onclick(this: HTMLElement): void;
}

interface FTPFile {
    name: string;
    link: string;
    type: number;
    size: number;
    modifiedDate: string;
    absolutePath: string
}

interface PathObject {
    dir: string;
    root: string;
    base: string;
    name: string;
    ext: string;
}

interface PathData {
    url: string;
    name: string;
    isDirectory: Boolean;
    type: string;
    parent: Boolean;
}

interface String extends String {
    /**
     * Capitalize the string for e.g. converts "this is a string" to "This Is A String"
     */
    capitalize(): String;
    /**
     * Capitalize a character at given index for e.g.
     * ```js
     * "this is a string".capitalize(0) //"This is a string"
     * ```
     */
    capitalize(index): String;
    /**
     * Returns hashcode of the string
     */
    hashCode(): String;
    /**
     * Subtract the string passed in argument from the given string,
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
declare function decodeURL(url: string): string;

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
declare var Acode: Acode;
declare var AceMouseEvent: any;

declare var CACHE_STORAGE: string;
declare var DATA_STORAGE: string;
declare var DOES_SUPPORT_THEME: boolean;
declare var IS_FREE_VERSION: boolean;
declare var KEYBINDING_FILE: string;
declare var ANDROID_SDK_INT: Number;

declare var modelist: any;
declare var beautify: any;
declare var intent: any;

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
declare var gitRecordFile: string;
declare var gistRecordFile: string;
declare var root: HTMLDivElement;
declare var saveInterval: Number;
declare var toastQueue: Array<HTMLElement>;
declare var keyBindings: (name: String)=>String;
declare var toast: (string)=>void;