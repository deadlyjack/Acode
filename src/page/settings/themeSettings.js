import Page from "../../components/page";
import dialogs from "../../components/dialogs";
import constants from "../../constants";
import tag from 'html-tag-js';
import gen from "../../components/gen";

export default function themeSettings() {
    const page = Page(strings.theme);
    const settingsList = tag('div', {
        className: 'main settings'
    });

    actionStack.push({
        id: 'settings-theme',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('settings-theme');
    };

    const values = appSettings.value;

    const settingsOptions = [{
            key: 'editor',
            text: strings['editor theme'],
            subText: values.editorTheme.split('/').slice(-1)[0],
        },
        {
            key: 'app',
            text: strings['app theme'],
            subText: values.appTheme
        }
    ];

    gen.settingsItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {
        const editor = editorManager.editor;

        switch (this.key) {
            case 'editor':
                dialogs.select(this.text, constants.themeList, {
                    default: values.editorTheme.split('/').slice(-1)[0]
                }).then(res => {
                    res = `ace/theme/` + res;
                    editor.setTheme(res);
                    appSettings.value.editorTheme = res;
                    appSettings.update();
                });
                break;

            case 'app':
                dialogs.select(this.text, [
                        'default', 'light', 'dark'
                    ], {
                        default: appSettings.value.appTheme
                    })
                    .then(res => {
                        appSettings.value.appTheme = res;
                        appSettings.update();
                        window.restoreTheme();
                    });
                break;

            default:
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);
}