import Page from "../../components/page";
import gen from "../../components/gen";
import dialogs from "../../components/dialogs";
import constants from "../../constants";
import tag from 'html-tag-js';

export default function editorSettings() {
    const page = Page(strings['editor settings']);
    const settingsList = tag('div', {
        className: 'main list'
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
            key: 'autosave',
            text: strings.autosave,
            subText: value.autosave ? value.autosave + '' : strings.no,
        },
        {
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
            subText: strings.except + ': ' + value.beautify.join(','),
        },
        {
            key: 'linting',
            text: strings.linting,
            subText: value.linting ? strings.yes : strings.no,
        },
        {
            key: 'showSpaces',
            text: strings['show spaces'],
            subText: value.showSpaces ? strings.yes : strings.no,
        },
        {
            key: 'activefiles',
            text: strings['active files'],
            subText: value.openFileListPos,
        }
    ];

    gen.listItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {
        const files = editorManager.files;
        switch (this.key) {
            case 'autosave':
                dialogs.prompt(strings.delay + ' (>1000)', value.autosave, 'number')
                    .then(res => {
                        res = parseInt(res);
                        if (isNaN(res) || res < 1000 && res !== 0) return alert(strings.info, strings['invalid value']);
                        appSettings.value.autosave = res;
                        appSettings.update();
                        this.changeSubText(res ? res + '' : strings.no);

                        if (res) {
                            if (saveInterval) clearInterval(saveInterval);
                            saveInterval = setInterval(() => {
                                editorManager.files.map(file => {
                                    if (file.isUnsaved && file.location) Acode.exec("save", false);
                                });
                            }, res);
                        } else if (saveInterval) {
                            clearInterval(saveInterval);
                        }
                    });
                break;
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
                        this.changeSubText(res ? strings.yes : strings.no);
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
                        this.changeSubText(res ? strings.yes : strings.no);
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
                        if (res) {
                            editorManager.editor.renderer.setMargin(0, 0, -16, 0);
                        } else {
                            editorManager.editor.renderer.setMargin(0, 0, 0, 0);
                        }
                        appSettings.value.linenumbers = res;
                        appSettings.update();
                        this.changeSubText(res ? strings.yes : strings.no);
                        editorManager.editor.resize(true);
                    });
                break;

            case 'beautify':
                dialogs.prompt(strings.except + ' (eg. php,py)', value.beautify.join(','))
                    .then(res => {
                        const files = res.split(',');
                        files.map((file, i) => {
                            files[i] = file.trim().toLowerCase();
                        });
                        appSettings.value.beautify = files;
                        appSettings.update();
                        this.changeSubText(strings.except + ': ' + res);
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

            case 'showSpaces':
                dialogs.select(this.text, [
                        [true, strings.yes],
                        [false, strings.no]
                    ], {
                        default: value.showSpaces
                    })
                    .then(res => {
                        if (res === value.showSpaces) return;
                        appSettings.value.showSpaces = res;
                        appSettings.update();
                        editorManager.editor.setOption('showInvisibles', res);
                        this.changeSubText(res ? strings.yes : strings.no);
                    });
                break;

            case 'activefiles':
                dialogs.select(this.text, ['sidebar', 'header'], {
                        default: value.openFileListPos
                    })
                    .then(res => {
                        if (res === value.openFileListPos) return;
                        appSettings.value.openFileListPos = res;
                        appSettings.update();
                        editorManager.moveOpenFileList();
                        this.changeSubText(res);
                    });
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);

    document.body.append(page);
}