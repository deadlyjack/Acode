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
            maxFileSize: 12,
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
            showConsole: true,
            customThemeMode: 'dark',
            customTheme: {
                '--primary-color': 'rgb(153,153,255)',
                '--secondary-color': 'rgb(255,255,255)',
                '--accent-color': 'rgb(51,153,255)',
                '--text-color': 'rgb(37,37,37)',
                '--text-main-color': 'rgb(255,255,255)',
                '--a-color': 'rgb(97,94,253)',
                '--border-color': 'rgba(122, 122, 122, 0.227)',
                '--error-text-color': 'rgb(255,185,92)',
                '--active-icon-color': 'rgba(0, 0, 0, 0.2)',
                '--popup-border-color': 'rgba(0, 0, 0, 0)',
                '--box-shadow-color': 'rgba(0, 0, 0, 0.2)',
                '--button-background-color': 'rgb(51,153,255)',
                '--button-active-color': 'rgb(44,142,240)',
                '--button-text-color': 'rgb(255,255,255)',
                '--scrollbar-color': 'rgba(0, 0, 0, 0.33)',
                '--menu-background-color': 'rgb(255,255,255)',
                '--menu-text-color': 'rgb(37,37,37)',
                '--menu-icon-color': 'rgb(153,153,255)',
                '--dialogbox-background-color': 'rgb(255,255,255)',
                '--dialogbox-text-color': 'rgb(37,37,37)',
                '--dialogbox-selected-option-color': 'rgb(169,0,0)',
                '--command-palette-background-color': 'rgb(153,153,255)',
                '--command-palette-text-color': 'rgb(255,255,255)',
                '--command-palette-border': 'none',
            }
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
    async update(settings = null, showToast = true) {
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

        await fs.writeFile(
                this.settingsFile, 
                JSON.stringify(this.value, undefined, 4), 
                true, 
                false
            );

        if (this.onsave) this.onsave();
        if (showToast)
            toast(strings['settings saved']);

        for (let callback of onupdate) callback(this.value);
    }

    reset(setting) {
        if(setting){
            if(setting in this.defaultSettings) {
                this.value[setting] = this.defaultSettings[setting];
                this.update();
            }else{
                return false;
            }
        }else{
            this.value = this.defaultSettings;
            this.update(false);
        }
        
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