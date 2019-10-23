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
        /**
         * @type {settingsValue}
         */
        this.defaultSettings = {
            fileBrowser: {
                showHiddenFiles: 'off',
                sortByName: 'off'
            },
            maxFileSize: 5,
            filesNotAllowed: ['zip', 'apk', 'doc', 'docx', 'mp3', 'mp4', 'avi', 'flac', 'mov', 'png', 'jpg', 'jpeg', 'rar', 'pdf', 'gif'],
            search: {
                caseSensitive: false,
                regExp: false,
                wholeWord: false,
                backwards: true
            },
            lang,
            fontSize: "14px",
            editorTheme: "ace/theme/textmate",
            appTheme: "default",
            textWrap: false,
            softTab: true,
            tabSize: 4,
            linenumbers: true,
            beautify: false,
            compileSCSS: false,
            linting: false
        };

        if ('globalSettings' in localStorage) {
            try {
                const savedSettings = JSON.parse(localStorage.getItem('globalSettings'));
                this.value = savedSettings;
            } catch (error) {
                this.reset();
            }
        } else {
            this.value = this.defaultSettings;
            localStorage.setItem('globalSettings', JSON.stringify(this.value));
        }
    }
    update(settings = null) {
        if (settings) {
            this.value = settings;
        }

        localStorage.setItem('globalSettings', JSON.stringify(this.value));
    }

    reset() {
        this.value = this.defaultSettings;
        this.update();
    }
}

export default Settings;