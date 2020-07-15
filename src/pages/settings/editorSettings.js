import Page from "../../components/page";
import gen from "../../components/gen";
import dialogs from "../../components/dialogs";
import constants from "../../lib/constants";
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


    const values = appSettings.value;

    const settingsOptions = [{
            key: 'animation',
            text: strings.animation.capitalize(),
            checkbox: values.animation,
        }, {
            key: 'autosave',
            text: strings.autosave.capitalize(),
            subText: values.autosave ? values.autosave + '' : strings.no,
        },
        {
            key: 'font size',
            text: strings['font size'],
            subText: values.fontSize,
        },
        {
            key: 'text wrap',
            text: strings['text wrap'],
            checkbox: values.textWrap,
        },
        {
            key: 'soft tab',
            text: strings['soft tab'],
            checkbox: values.softTab,
        },
        {
            key: 'tab size',
            text: strings['tab size'],
            subText: values.tabSize,
        },
        {
            key: 'linenumbers',
            text: strings['show line numbers'],
            checkbox: values.linenumbers,
        },
        {
            key: 'beautify',
            text: strings['beautify on save'],
            subText: strings.except + ': ' + values.beautify.join(','),
        },
        {
            key: 'linting',
            text: strings.linting,
            checkbox: values.linting,
        },
        {
            key: 'showSpaces',
            text: strings['show spaces'],
            checkbox: values.showSpaces,
        },
        {
            key: 'activefiles',
            text: strings['active files'],
            subText: values.openFileListPos,
        },
        {
            key: 'editorFont',
            text: strings['editor font'],
            subText: values.editorFont,
        },
        {
            key: 'vibrateOnTap',
            text: strings['vibrate on tap'],
            checkbox: values.vibrateOnTap,
        },
        {
            key: 'disableFloatingButton',
            text: strings["disable floating button"],
            checkbox: values.disableFloatingButton
        },
        {
            key: 'quickTools',
            text: strings['quick tools'],
            checkbox: values.quickTools
        },
        {
            key: 'fullscreen',
            text: strings.fullscreen.capitalize(),
            checkbox: values.fullscreen
        },
        {
            key: 'liveAutoCompletion',
            text: strings["live autocompletion"].capitalize(),
            checkbox: values.liveAutoCompletion
        }
    ];

    gen.listItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {
        const files = editorManager.files;
        switch (this.key) {
            case 'autosave':
                dialogs.prompt(strings.delay + ' (>1000)', values.autosave, 'number')
                    .then(res => {
                        res = parseInt(res);
                        if (isNaN(res) || res < 1000 && res !== 0) return alert(strings.info, strings['invalid value']);
                        values.autosave = res;
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
                dialogs.prompt(this.text, values.fontSize, 'text', {
                    required: true,
                    match: constants.FONT_SIZE
                }).then(res => {
                    if (res === values.fontSize) return;
                    editorManager.editor.setFontSize(res);
                    values.fontSize = res;
                    appSettings.update();
                    this.changeSubText(res);
                });
                break;

            case 'tab size':
                dialogs.prompt(this.text, appSettings.value.tabSize, 'number', {
                    required: true
                }).then(res => {
                    if (res === values.tabSize) return;
                    values.tabSize = res;
                    files.map(file => {
                        file.session.setOption('tabSize', res);
                    });
                    appSettings.update();
                    this.changeSubText(res);
                });
                break;

            case 'text wrap':
                values.textWrap = !values.textWrap;
                files.map(file => {
                    file.session.setOption('wrap', values.textWrap);
                    return file;
                });
                values.textWrap = values.textWrap;
                appSettings.update();
                this.value = values.textWrap;
                break;

            case 'soft tab':
                values.softTab = !values.softTab;
                files.map(file => {
                    file.session.setOption('useSoftTabs', values.softTab);
                });
                appSettings.update();
                this.value = values.softTab;
                break;

            case 'linenumbers':
                values.linenumbers = !values.linenumbers;
                editorManager.editor.setOptions({
                    showGutter: values.linenumbers,
                    showLineNumbers: values.linenumbers
                });
                if (values.linenumbers)
                    editorManager.editor.renderer.setMargin(0, 0, -16, 0);
                else
                    editorManager.editor.renderer.setMargin(0, 0, 0, 0);
                appSettings.update();
                editorManager.editor.resize(true);
                this.value = values.linenumbers;
                break;

            case 'beautify':
                dialogs.prompt(strings.except + ' (eg. php,py)', values.beautify.join(','))
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
                values.linting = !values.linting;
                files.map(file => {
                    file.session.setUseWorker(values.linting);
                });
                if (values.linting)
                    editorManager.editor.renderer.setMargin(0, 0, 0, 0);
                else
                    editorManager.editor.renderer.setMargin(0, 0, -16, 0);
                appSettings.update();
                this.value = values.linting;
                break;

            case 'showSpaces':
                values.showSpaces = !values.showSpaces;
                appSettings.update();
                editorManager.editor.setOption('showInvisibles', values.showSpaces);
                this.value = values.showSpaces;
                break;

            case 'activefiles':
                dialogs.select(this.text, ['sidebar', 'header'], {
                        default: values.openFileListPos
                    })
                    .then(res => {
                        if (res === values.openFileListPos) return;
                        values.openFileListPos = res;
                        appSettings.update();
                        editorManager.moveOpenFileList();
                        this.changeSubText(res);
                    });
                break;

            case 'editorFont':
                dialogs.select(this.text, ['fira-code', 'default'], {
                        default: values.editorFont
                    })
                    .then(res => {
                        if (res === values.editorFont) return;
                        editorManager.container.classList.remove(values.editorFont);
                        editorManager.container.classList.add(res);
                        values.editorFont = res;
                        appSettings.update();
                        this.changeSubText(res);
                    });
                break;

            case 'vibrateOnTap':
                values.vibrateOnTap = !values.vibrateOnTap;
                appSettings.update();
                this.value = values.vibrateOnTap;
                break;

            case 'quickTools':
                Acode.exec("toggle-quick-tools");
                this.value = values.quickTools;
                break;

            case 'fullscreen':
                values.fullscreen = !values.fullscreen;
                const id = constants.notification.EXIT_FULL_SCREEN;

                if (values.fullscreen)
                    Acode.exec("enable-fullscreen");
                else
                    Acode.exec("disable-fullscreen");

                appSettings.update();
                this.value = values.fullscreen;
                break;

            case 'animation':
                values.animation = !values.animation;
                app.classList.toggle("no-animation");
                appSettings.update();
                this.value = values.animation;
                break;

            case 'disableFloatingButton':
                values.disableFloatingButton = !values.disableFloatingButton;
                root.classList.toggle("disable-floating-button");
                appSettings.update();
                this.value = values.disableFloatingButton;
                break;

            case 'liveAutoCompletion':
                values.liveAutoCompletion = !values.liveAutoCompletion;
                editorManager.editor.setOption("enableLiveAutocompletion", values.liveAutoCompletion);
                appSettings.update();
                this.value = values.liveAutoCompletion;
                break;
        }
    }

    page.appendChild(settingsList);
    document.body.append(page);

    document.body.append(page);
}