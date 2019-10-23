import Page from "../../components/page";
import dialogs from "../../components/dialogs";
import {
    tag
} from "html-element-js";
import searchSettings from "./searchSettings";
import gen from "../../components/gen";
import themeSettings from "./themeSettings";
import aboutUs from "../aboutUs";
import editorSettings from "./editorSettings";
import constants from "../../constants";

export default function settingsMain() {
    const page = Page(strings.settings);
    const settingsList = tag('div', {
        className: 'main settings'
    });


    actionStack.push({
        id: 'settings-main',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('settings-main');
    };

    const values = appSettings.value;

    const settingsOptions = [{
            key: 'language',
            text: strings['change language'],
            subText: strings.lang,
            icon: 'translate'
        },
        {
            key: 'editor',
            text: strings['editor settings'],
            icon: 'format_align_left'
        },
        {
            key: 'theme',
            text: strings.theme,
            icon: 'color_lens'
        },
        {
            key: 'search',
            text: 'Search',
            icon: 'search'
        },
        {
            key: 'about',
            text: strings.about,
            icon: 'app-logo'
        }
    ];

    gen.settingsItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {

        switch (this.key) {
            case 'language':
                dialogs.select(this.text, [
                        ['en-us', constants.string['en-us'].lang],
                        ['hi-in', constants.string['hi-in'].lang],
                        ['id-id', constants.string['id-id'].lang]
                    ], {
                        default: values.lang
                    })
                    .then(res => {
                        if (res === values.lang) return;
                        appSettings.value.lang = res;
                        appSettings.update();
                        window.beforeClose();
                        location.reload();
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