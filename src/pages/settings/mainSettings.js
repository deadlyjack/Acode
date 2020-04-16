import Page from "../../components/page";
import dialogs from "../../components/dialogs";
import tag from 'html-tag-js';
import searchSettings from "./searchSettings";
import gen from "../../components/gen";
import themeSettings from "./themeSettings";
import About from "../about/about";
import editorSettings from "./editorSettings";
import constants from "../../constants";
import helpers from "../../modules/helpers";
import createEditorFromURI from "../../modules/createEditorFromURI";
import internalFs from "../../modules/utils/internalFs";

export default function settingsMain(demo) {
    const $page = Page(strings.settings);
    const settingsList = tag('div', {
        className: 'main list',
        style: {
            textTransform: "capitalize"
        }
    });

    actionStack.push({
        id: 'settings-main',
        action: $page.hide
    });
    $page.onhide = function () {
        actionStack.remove('settings-main');
    };

    const value = appSettings.value;

    const settingsOptions = [{
        key: 'language',
        text: strings['change language'],
        subText: strings.lang,
        icon: 'translate'
    }];

    if (!demo) {
        settingsOptions.push({
            key: 'editor',
            text: strings['editor settings'],
            icon: 'text_format'
        }, {
            key: 'previewMode',
            text: strings['preview mode'],
            icon: 'play_arrow',
            subText: value.previewMode === 'none' ? strings['not set'] : value.previewMode
        }, {
            key: 'theme',
            text: strings.theme,
            icon: 'color_lenspalette'
        }, {
            key: 'search',
            text: strings.search,
            icon: 'search'
        }, {
            key: 'about',
            text: strings.about,
            icon: 'app-logo'
        }, {
            key: 'keybindings',
            text: strings['key bindings'],
            icon: 'keyboard_hide'
        });
    }

    gen.listItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {
        const lanuguages = [];
        const langList = constants.langList;
        for (let lang in langList) {
            lanuguages.push([lang, langList[lang]]);
        }
        switch (this.key) {
            case 'language':
                dialogs.select(this.text, lanuguages, {
                        default: value.lang
                    })
                    .then(res => {
                        if (res === value.lang) return;
                        appSettings.value.lang = res;
                        appSettings.update();
                        internalFs.readFile(`${cordova.file.applicationDirectory}www/lang/${res}.json`)
                            .then(res => {
                                const decoder = new TextDecoder('utf-8');
                                const text = decoder.decode(res.data);
                                window.strings = JSON.parse(text);
                                if (actionStack.has("settings-main")) actionStack.pop();
                            });
                    });
                break;

            case 'editor':
                editorSettings();
                break;

            case 'search':
                searchSettings();
                break;

            case 'theme':
                themeSettings();
                break;

            case 'about':
                About();
                break;

            case 'keybindings':
                dialogs.select(strings['key bindings'], [
                        ['edit', strings.edit],
                        ['reset', strings.reset]
                    ])
                    .then(res => {
                        if (res === 'edit') {
                            $page.hide();
                            createEditorFromURI(KEYBINDING_FILE);
                        } else {
                            helpers.resetKeyBindings();
                        }
                    });
                break;

            case 'previewMode':
                dialogs.select(this.text, ['browser', 'in app', ['none', strings['not set']]], {
                        default: value.previewMode
                    })
                    .then(res => {
                        if (res === value.previewMode) return;
                        appSettings.value.previewMode = res;
                        appSettings.update();
                        this.changeSubText(res === 'none' ? strings['not set'] : res);
                    });
                break;

            default:
                break;
        }
    }

    $page.appendChild(settingsList);
    document.body.append($page);
}