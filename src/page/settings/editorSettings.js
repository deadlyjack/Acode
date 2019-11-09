import Page from "../../components/page";
import gen from "../../components/gen";
import dialogs from "../../components/dialogs";
import constants from "../../constants";
import tag from 'html-tag-js';

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
        }
    ];

    gen.settingsItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {
        const files = editorManager.files;
        switch (this.key) {
            case 'font size':
                dialogs.prompt(this.text, appSettings.value.fontSize, 'text', {
                    required: true,
                    match: constants.FONT_SIZE
                }).then(res => {
                    if (res === value.fontSize) return;
                    editorManager.editor.setFontSize(res);
                    appSettings.value.fontSize = res;
                    appSettings.update();
                    this.changeSubText(res);
                });
                break;

            case 'tab size':
                dialogs.prompt(this.text, appSettings.value.tabSize, 'numeric', {
                    required: true
                }).then(res => {
                    if (res === value.tabSize) return;
                    appSettings.value.tabSize = res;
                    files.map(file => {
                        file.session.setOption('tabSize', res);
                    });
                    appSettings.update();
                    this.changeSubText(res);
                });
                break;

            case 'text wrap':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: value.textWrap
                    })
                    .then(res => {
                        if (res === value.textWrap) return;
                        files.map(file => {
                            file.session.setOption('wrap', res);
                        });
                        appSettings.value.textWrap = res;
                        appSettings.update();
                        this.changeSubText(res ? strings.yes : strings.no, );
                    });
                break;

            case 'soft tab':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: value.softTab
                    })
                    .then(res => {
                        if (res === value.softTab) return;
                        files.map(file => {
                            file.session.setOption('useSoftTabs', res);
                        });
                        appSettings.value.softTab = res;
                        appSettings.update();
                        this.changeSubText(res ? strings.yes : strings.no, );
                    });
                break;

            case 'linenumbers':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: value.linenumbers
                    })
                    .then(res => {
                        if (res === value.linenumbers) return;
                        editorManager.editor.setOptions({
                            showGutter: res,
                            showLineNumbers: res
                        });
                        appSettings.value.linenumbers = res;
                        appSettings.update();
                        this.changeSubText(res ? strings.yes : strings.no, );
                    });
                break;

            case 'beautify':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: value.beautify
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
                        default: value.linting
                    })
                    .then(res => {
                        if (res === value.linting) return;
                        files.map(file => {
                            file.session.setUseWorker(res);
                        });
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