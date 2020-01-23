/// <reference path="../node_modules/@types/ace/"/>
/// <reference path="../node_modules/html-tag-js/dist/tag.d.ts"/>

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
    appTheme: "light" | "default" | "dark",
    textWrap: boolean;
    softTab: boolean;
    tabSize: number;
    linenumbers: boolean;
    beautify: Array<string>;
    linting: boolean;
    previewMode: 'browser' | 'in app' | 'none';
    showSpaces: boolean;
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
    update: () => void;
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
    name: string;
    data: string;
    sha: string;
    repo: string;
    branch?: string;
    path: string;
    branch: 'master' | string;
    commitMessage: string;
    setName(name: string): Promise<void>;
    setData(data: string): Promise<void>;
}

interface Gist {
    id: string;
    files: GistFiles;
    setName(name: string, newName: string): Promise<void>;
    setData(name: string, text: string): Promise<void>;
}

interface GitRecord {
    get(sha: string): Promise<Repo>;
    add(gitFileRecord: Repo): void;
    remove(sha: string): Repo;
    update(sha: string, gitFileRecord: Repo): void;
}

interface GistRecord {
    get(id: string): Gist;
    add(gist: any): void;
    remove(gist: Gist): Gist;
    update(gist: Gist): void;
    reset(): void;
}

interface Manager {
    addNewFile(filename: string, options: newFileOptions): File;
    getFile(id: string): File;
    switchFile(id: string): void;
    removeFile(id: string | File, force: boolean): void;
    editor: AceAjax.Editor;
    activeFile: File;
    onupdate: function(): void;
    files: Array<File>;
    controls: Controls;
    state: 'blur' | 'focus';
}

interface Strings {
    [key: string]: string
}

interface Folders {
    [key: string]: Folder
}

interface Folder {
    reload(): void;
    name: string;
}

interface Window {
    beforeClose: function(): void;
    getCloseMessage: function(): string;
    restoreTheme(): void;
}

interface FileClipBoard {
    method: "copy" | "cut";
    type: "file" | "dir";
    uri: string
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
declare var addedFolder: Folders;
declare var editorManager: Manager;
declare var saveInterval: Number;
declare var freeze: Boolean;
declare var app: HTMLDivElement;
declare var gitRecord: GitRecord;
declare var gistRecord: GistRecord;
declare var gitRecordURL: string;
declare var gistRecordURL: string;
/**
 * A custom alert box to show alert notification
 * @param title 
 * @param message 
 */
declare function alert(title: string, message: string): void;