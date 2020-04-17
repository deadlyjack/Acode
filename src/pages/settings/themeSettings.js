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
        const appThemeList = constants.appThemeList;
        const themeList = [];
        const pushDark = theme => themeList.push([theme, theme.replace(/_/g, ' '), 'color dark']);
        const pushLight = theme => themeList.push([theme, theme.replace(/_/g, ' '), 'color light']);
        switch (this.key) {
            case 'editor':
                constants.themeList.dark.forEach(pushDark);
                constants.themeList.light.forEach(pushLight);
                dialogs.select(this.text, themeList, {
                    default: values.editorTheme.split('/').slice(-1)[0]
                }).then(res => {
                    const theme = `ace/theme/` + res;
                    if (editor) editor.setTheme(theme);
                    appSettings.value.editorTheme = theme;
                    appSettings.update();
                    this.changeSubText(res.replace(/_/g, ' '));
                });
                break;

            case 'app':
                if (DOES_SUPPORT_THEME) {
                    for (let theme in appThemeList) {
                        const themeData = appThemeList[theme];
                        let extra = '';
                        if (!themeData.isFree && IS_FREE_VERSION) extra = ` (paid)`;

                        themeList.push([
                            themeData,
                            theme + extra,
                            'color ' + themeData.type
                        ]);
                    }

                    dialogs.select(this.text, themeList, {
                            default: appSettings.value.appTheme
                        })
                        .then(res => {
                            if (!res.isFree && IS_FREE_VERSION) {
                                window.open('https://play.google.com/store/apps/details?id=com.foxdebug.acode', '_system');
                                return;
                            }
                            appSettings.value.appTheme = res.name;
                            appSettings.update();
                            window.restoreTheme();
                            this.changeSubText(res.name);
                        });
                } else {
                    dialogs.alert(strings.info, strings["unsupported device"]);
                }
                break;

            default:
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);
}