import Page from "../../components/page";
import dialogs from "../../components/dialogs";
import constants from "../../constants";
import tag from 'html-tag-js';
import gen from "../../components/gen";

export default function themeSettings() {
    const page = Page(strings.theme);
    const settingsList = tag('div', {
        className: 'main list'
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
            subText: values.editorTheme.split('/').slice(-1)[0].replace(/_/g, ' '),
        },
        {
            key: 'app',
            text: strings['app theme'],
            subText: values.appTheme
        }
    ];

    gen.listItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {
        const editor = editorManager.editor;
        const themeList = [];
        constants.themeList.map(theme => {
            themeList.push([theme, theme.replace(/_/g, ' ')]);
        });
        switch (this.key) {
            case 'editor':
                dialogs.select(this.text, themeList, {
                    default: values.editorTheme.split('/').slice(-1)[0]
                }).then(res => {
                    this.changeSubText(res);
                    res = `ace/theme/` + res;
                    if (editor) editor.setTheme(res);
                    appSettings.value.editorTheme = res;
                    this.changeSubText(res.editorTheme.split('/').slice(-1)[0].replace(/_/g, ' '));
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
                        if (res === 'dark' && /(free)$/.test(BuildInfo.packageName)) {
                            window.open('https://play.google.com/store/apps/details?id=com.foxdebug.acode', '_system');
                            return;
                        }
                        appSettings.value.appTheme = res;
                        appSettings.update();
                        window.restoreTheme();
                        this.changeSubText(res);
                    });
                break;

            default:
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);
}