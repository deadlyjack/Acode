import Page from "../../components/page";
import dialogs from "../../components/dialogs";
import constants from "../../constants";
import {
    tag
} from "html-element-js";
import gen from "../../components/gen";

export default function searchSettings() {
    const page = Page('Search in editor');
    const settingsList = tag('div', {
        className: 'main settings'
    });

    actionStack.push({
        id: 'settings-search',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('settings-search');
    };

    const values = appSettings.value;

    const settingsOptions = [{
            key: 'case sensitive',
            text: 'Case sensitive',
            subText: values.search.caseSensitive + ''
        },
        {
            key: 'regexp',
            text: 'RegExp',
            subText: values.search.regExp + ''
        },
        {
            key: 'wholeWord',
            text: 'Whole word',
            subText: values.search.wholeWord + ''
        }
    ];

    gen.settingsItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {

        switch (this.key) {
            case 'case sensitive':
                dialogs.select(this.text, [
                        'true', 'false'
                    ], {
                        default: values.search.caseSensitive + ''
                    })
                    .then(res => {
                        if (res === 'false') appSettings.value.search.caseSensitive = false;
                        else appSettings.value.search.caseSensitive = true;
                        appSettings.update();
                        this.changeSubText(res);
                    });
                break;

            case 'regexp':
                dialogs.select(this.text, [
                        'true', 'false'
                    ], {
                        default: values.search.regExp + ''
                    })
                    .then(res => {
                        if (res === 'false') appSettings.value.search.regExp = false;
                        else appSettings.value.search.regExp = true;
                        appSettings.update();
                        this.changeSubText(res);
                    });
                break;

            case 'wholeWord':
                dialogs.select(this.text, [
                        'true', 'false'
                    ], {
                        default: values.search.wholeWord + ''
                    })
                    .then(res => {
                        if (res === 'false') appSettings.value.search.wholeWord = false;
                        else appSettings.value.search.wholeWord = true;
                        appSettings.update();
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