import Page from "../../components/page";
import dialogs from "../../components/dialogs";
import tag from 'html-tag-js';
import searchSettings from "./searchSettings";
import gen from "../../components/gen";
import themeSettings from "./themeSettings";
import aboutUs from "../about/about";
import editorSettings from "./editorSettings";
import constants from "../../constants";

export default function settingsMain(demo) {
    const page = Page(strings.settings);
    const settingsList = tag('div', {
        className: 'main list'
    });

    actionStack.push({
        id: 'settings-main',
        action: page.hide
    });
    page.onhide = function () {
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
        })
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
                        appSettings.onsave = function () {
                            window.beforeClose();
                            location.reload();
                        };
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
                aboutUs();
                break;

            default:
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);
}