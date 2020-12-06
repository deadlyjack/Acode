import fs from './fileSystem/internalFs';
import helpers from './utils/helpers';
/**
 * @typedef {object} fileBrowserSettings
 * @property {string} showHiddenFiles
 * @property {string} sortByName
 */

/**
 * @typedef {object} searchAndFindSettings
 * @property {boolean} wrap
 * @property {boolean} caseSensitive
 * @property {boolean} regExp
 */

/**
 * @typedef {object} settingsValue
 * @property {fileBrowserSettings} fileBrowser
 * @property {number} maxFileSize
 * @property {string[]} filesNotAllowed
 * @property {searchAndFindSettings} search
 * @property {string} lang
 */

class Settings {
    constructor(lang) {
        lang = lang || "en-us";

        this.methods = {
            update: [],
            reset: []
        };

        /**
         * @type {settingsValue}
         */
        this.defaultSettings = {
            animation: true,
            autosave: 0,
            fileBrowser: {
                showHiddenFiles: false,
                sortByName: true
            },
            maxFileSize: 10,
            filesNotAllowed: ['zip', 'apk', 'doc', 'docx', 'mp3', 'mp4', 'avi', 'flac', 'mov', 'rar', 'pdf', 'gif', 'flv'],
            search: {
                caseSensitive: false,
                regExp: false,
                wholeWord: false,
                backwards: true
            },
            lang,
            fontSize: "12px",
            editorTheme: /free/.test(BuildInfo.packageName) ? "ace/theme/nord_dark" : "ace/theme/dracula",
            appTheme: /free/.test(BuildInfo.packageName) ? "default" : "ocean",
            textWrap: true,
            softTab: true,
            tabSize: 2,
            linenumbers: true,
            beautify: ['*'],
            linting: false,
            autoCorrect: true,
            previewMode: 'none',
            showSpaces: false,
            openFileListPos: 'header',
            quickTools: true,
            editorFont: "default",
            vibrateOnTap: true,
            fullscreen: false,
            floatingButtonActivation: "click",
            floatingButton: true,
            liveAutoCompletion: true,
            showPrintMargin: false,
            scrollbarSize: 20,
            cursorControllerSize: 'small',
            confirmOnExit: true,
            showConsole: true
        };
        this.settingsFile = DATA_STORAGE + 'settings.json';
        this.loaded = false;
        this.onload = null;
        this.onsave = null;
        let interval;
        const save = () => {
            interval = setInterval(() => {
                fs.writeFile(this.settingsFile, JSON.stringify(this.value, undefined, 4), true, false)
                    .then(() => {
                        this.value = this.defaultSettings;
                        this.loaded = true;
                        if (interval) clearInterval(interval);
                        if (this.onload) this.onload();
                    })
                    .catch(() => {
                        save();
                    });
            }, 1000);
        };

        fs.readFile(this.settingsFile)
            .then((res) => {
                const settings = JSON.parse(helpers.decodeText(res.data));
                if (!Array.isArray(settings.beautify)) savedSettings.beautify = ['*'];
                for (let setting in this.defaultSettings)
                    if (!(setting in settings)) settings[setting] = this.defaultSettings[setting];
                this.value = settings;
                this.loaded = true;
                if (this.onload) this.onload();
            }).catch(save);
    }
    update(settings = null, showToast = true) {

        if (typeof settings === "boolean") {
            showToast = settings;
            settings = null;
        }

        const onupdate = [...this.methods.update];

        for (let key in settings) {
            if (key in this.value)
                this.value[key] = settings[key];
            if (Array.isArray(this.methods[`update:${key}`]))
                for (let cb of this.methods[`update:${key}`])
                    onupdate.push(cb.bind(this.value, this.value[key]));
        }

        fs.writeFile(this.settingsFile, JSON.stringify(this.value, undefined, 4), true, false)
            .then(() => {
                if (this.onsave) this.onsave();
                if (showToast)
                    plugins.toast.showShortBottom(strings['settings saved']);

                for (let callback of onupdate) callback(this.value);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    reset() {
        this.value = this.defaultSettings;
        this.update(false);
        for (let onreset of this.methods.reset) onreset(this.value);
    }

    /**
     * 
     * @param {'update' | 'reset'} event 
     * @param {function():void} callback 
     */
    on(event, callback) {
        if (!this.methods[event]) this.methods[event] = [];
        this.methods[event].push(callback);
    }

    /**
     * 
     * @param {'update' | 'reset'} event 
     * @param {function():void} callback 
     */
    off(event, callback) {
        if (!this.methods[event]) this.methods[event] = [];
        this.methods[event].splice(this.methods[event].indexOf(callback), 1);
    }
}

export default Settings;