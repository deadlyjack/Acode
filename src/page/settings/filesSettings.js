import Page from "../../components/page";
import dialogs from "../../components/dialogs";
import tag from 'html-tag-js';
import gen from "../../components/gen";

export default function filesSettings(callback) {
    const page = Page(strings.settings);
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
            key: 'sort',
            text: strings['sort by name'],
            subText: values.fileBrowser.sortByName === 'on' ? strings.yes : strings.no
        },
        {
            key: 'show',
            text: strings['show hidden files'],
            subText: values.fileBrowser.showHiddenFiles === 'on' ? strings.yes : strings.no
        }
    ];

    gen.settingsItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {
        switch (this.key) {
            case 'sort':
                dialogs.select(strings['sort by name'], [
                    ['on', strings.yes],
                    ['off', strings.no]
                ], {
                    default: values.fileBrowser.sortByName
                }).then(res => {
                    appSettings.value.fileBrowser.sortByName = res;
                    appSettings.update();
                    this.changeSubText(values.fileBrowser.sortByName === 'on' ? strings.yes : strings.no)
                    if (callback) callback();
                });
                break;

            case 'show':
                dialogs.select(strings['show hidden files'], [
                    ['on', strings.yes],
                    ['off', strings.no]
                ], {
                    default: values.fileBrowser.showHiddenFiles
                }).then(res => {
                    appSettings.value.fileBrowser.showHiddenFiles = res;
                    appSettings.update();
                    this.changeSubText(values.fileBrowser.showHiddenFiles === 'on' ? strings.yes : strings.no);
                    if (callback) callback();
                });
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);
}