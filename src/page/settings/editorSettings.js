import Page from "../../components/page";
import gen from "../../components/gen";
import dialogs from "../../components/dialogs";
import constants from "../../constants";
import {
    tag
} from "html-element-js";

export default function editorSettings() {
    const page = Page(strings['editor settings']);
    const settingsList = tag('div', {
        className: 'main settings'
    });

    actionStack.push({
        id: 'settings-editor',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('settings-editor');
    };


    const values = appSettings.value;

    const settingsOptions = [{
            key: 'font size',
            text: strings['font size'],
            subText: values.fontSize,
        },
        {
            key: 'text wrap',
            text: strings['text wrap'],
            subText: values.textWrap ? strings.yes : strings.no,
        },
        {
            key: 'soft tab',
            text: strings['soft tab'],
            subText: values.softTab ? strings.yes : strings.no,
        },
        {
            key: 'tab size',
            text: strings['tab size'],
            subText: values.tabSize,
        },
        {
            key: 'linenumbers',
            text: strings['show line numbers'],
            subText: values.linenumbers ? strings.yes : strings.no,
        },
        {
            key: 'beautify',
            text: strings['beautify on save'],
            subText: values.beautify ? strings.yes : strings.no,
        },
        {
            key: 'linting',
            text: strings['linting'],
            subText: values.linting ? strings.yes : strings.no,
        }

    ];

    gen.settingsItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {

        switch (this.key) {
            case 'font size':
                dialogs.prompt(this.text, appSettings.value.fontSize, 'text', {
                    required: true,
                    match: constants.FONT_SIZE
                }).then(res => {
                    if (res === values.fontSize) return;
                    appSettings.value.fontSize = res;
                    appSettings.update();
                    window.beforeClose();
                    location.reload();
                });
                break;

            case 'tab size':
                dialogs.prompt(this.text, appSettings.value.tabSize, 'numeric', {
                    required: true
                }).then(res => {
                    if (res === values.tabSize) return;
                    appSettings.value.tabSize = res;
                    appSettings.update();
                    window.beforeClose();
                    location.reload();
                });
                break;

            case 'text wrap':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: values.textWrap ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === values.textWrap) return;
                        appSettings.value.textWrap = res;
                        appSettings.update();
                        window.beforeClose();
                        location.reload();
                    });
                break;

            case 'soft tab':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: values.softTab ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === values.softTab) return;
                        appSettings.value.softTab = res;
                        appSettings.update();
                        window.beforeClose();
                        location.reload();
                    });
                break;

            case 'linenumbers':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: values.linenumbers ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === values.linenumbers) return;
                        appSettings.value.linenumbers = res;
                        appSettings.update();
                        window.beforeClose();
                        location.reload();
                    });
                break;

            case 'beautify':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: values.beautify ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === values.beautify) return;
                        appSettings.value.beautify = res;
                        appSettings.update();
                        this.changeSubText(res ? strings.yes : strings.no);
                    });
                break;

            case 'linting':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: values.linting ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === values.linting) return;
                        appSettings.value.linting = res;
                        appSettings.update();
                        this.changeSubText(res ? strings.yes : strings.no);
                    });
                break;

            default:
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);

    document.body.append(page);
}