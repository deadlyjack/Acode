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


    const value = appSettings.value;

    const settingsOptions = [{
            key: 'font size',
            text: strings['font size'],
            subText: value.fontSize,
        },
        {
            key: 'text wrap',
            text: strings['text wrap'],
            subText: value.textWrap ? strings.yes : strings.no,
        },
        {
            key: 'soft tab',
            text: strings['soft tab'],
            subText: value.softTab ? strings.yes : strings.no,
        },
        {
            key: 'tab size',
            text: strings['tab size'],
            subText: value.tabSize,
        },
        {
            key: 'linenumbers',
            text: strings['show line numbers'],
            subText: value.linenumbers ? strings.yes : strings.no,
        },
        {
            key: 'beautify',
            text: strings['beautify on save'],
            subText: value.beautify ? strings.yes : strings.no,
        },
        {
            key: 'linting',
            text: strings['linting'],
            subText: value.linting ? strings.yes : strings.no,
        },
        {
            key: 'previewMode',
            text: strings['preview mode'],
            subText: value.previewMode
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
                    if (res === value.fontSize) return;
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
                    if (res === value.tabSize) return;
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
                        default: value.textWrap ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === value.textWrap) return;
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
                        default: value.softTab ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === value.softTab) return;
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
                        default: value.linenumbers ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === value.linenumbers) return;
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
                        default: value.beautify ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === value.beautify) return;
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
                        default: value.linting ? strings.yes : strings.no,
                    })
                    .then(res => {
                        if (res === value.linting) return;
                        appSettings.value.linting = res;
                        appSettings.update();
                        this.changeSubText(res ? strings.yes : strings.no);
                    });
                break;

            case 'previewMode':
                dialogs.select(this.text, [
                        'none',
                        'mobile',
                        'desktop'
                    ], {
                        default: value.previewMode
                    })
                    .then(res => {
                        if (res === value.previewMode) return;
                        appSettings.value.previewMode = res;
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

    document.body.append(page);
}