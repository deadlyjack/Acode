/// <reference path="../node_modules/@types/ace/"/>
/// <reference path="../node_modules/html-element-js/dist/html.d.ts"/>

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

interface Footer {
    row1: Array<Array<string>> | Array<string>;
    row2: Array<Array<string>> | Array<string>;
}

interface Settings {
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
    linenumbers: boolean,
    beautify: boolean,
    footer: Footer
}

interface AppSettings {
    value: Settings;
    update(settings?: String): void;
    reset(): void;
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

interface fileOptons {
    name: string;
    dir: string;
}

interface newFileOptions {
    filename: string;
    contentUri?: string;
    fileUri?: string;
    location?: string;
}

interface Controls {
    start: HTMLSpanElement;
    end: HTMLSpanElement;
    menu: HTMLSpanElement;
}

interface acodeEditor extends newFileOptions {
    isUnsaved: boolean;
    id: string;
    container: HTMLDivElement;
    editor: AceAjax.Editor;
    assocTile: HTMLElement;
    updateControls: function(): void;
    controls: Controls;
    readonly: boolean;
    isUnsaved: boolean
}

interface elementContainer {
    [key: string]: HTMLElement
}

interface Manager {
    /**
     * Create new editor
     * @param filename 
     * @param options 
     */
    addNewFile(filename: string, options: newFileOptions): acodeEditor;
    getEditor(id: string): acodeEditor;
    switchEditor(id: string): void;
    activeEditor: acodeEditor;
    update(newid: string, filename: string, location: string, editor: acodeEditor): void;
    onupdate: function(): void;
    editors: acodeEditor[];
    removeEditor(id: string | acodeEditor, force: boolean): void;
    updateLocation(editor: acodeEditor, location: string): void;
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

declare var app: HTMLDivElement;
/**
 * A custom alert box to show alert notification
 * @param title 
 * @param message 
 */
declare function alert(title: string, message: string): void;