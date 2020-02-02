import list from '../components/list';
import clipboardAction from './clipboard';
import tag from 'html-tag-js';
import helper from '../modules/helpers';
import tile from "../components/tile";
import fs from './utils/androidFileSystem';
import dialogs from '../components/dialogs';
import helpers from '../modules/helpers';
import textControl from './events/selection';
import constants from '../constants';

/**
 * @typedef {object} ActiveEditor
 * @property {HTMLElement} container
 * @property {object} editor ace editor object
 * @property {string} id
 * @property {string} filename
 * @property {HTMLElement} assocTile associated tab element in sidenav
 * @property {string} fileUri
 * @property {string} contentUri
 * @property {string} location
 * @property {bool} isUnsaved
 */

/**
 * 
 * @param {HTMLElement} $sidebar 
 * @param {HTMLElement} $header 
 * @param {HTMLElement} $body 
 * @returns {Manager}
 */
function EditorManager($sidebar, $header, $body) {
    /**
     * @type {import('../components/tile').Tile | HTMLElement}
     */
    let $openFileList;
    let counter = 0;
    const container = tag('div', {
        className: 'editor-container'
    });
    /**
     * @type {AceAjax.Editor}
     */
    const editor = ace.edit(container);
    const fullContent = '<span action="copy">copy</span><span action="cut">cut</span><span action="paste">paste</span><span action="select all">select all<span>';
    const controls = {
        start: tag('span', {
            className: 'cursor-control start'
        }),
        end: tag('span', {
            className: 'cursor-control end'
        }),
        menu: tag('div', {
            className: 'clipboard-contextmneu',
            innerHTML: fullContent,
        }),
        fullContent,
        update: () => {}
    };

    /**
     * @type {Manager}
     */
    const manager = {
        editor,
        addNewFile,
        getFile,
        switchFile,
        activeFile: null,
        onupdate: () => {},
        hasUnsavedFiles,
        files: [],
        removeFile,
        controls,
        state: 'blur',
        setSubText,
        moveOpenFileList,
        sidebar: $sidebar
    };

    moveOpenFileList();

    $body.appendChild(container);
    setupEditor(editor);

    textControl(editor, controls, container);
    controls.menu.ontouchend = function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const action = e.target.getAttribute('action');
        if (action) {
            clipboardAction(action);
        }
    };
    editor.on('focus', function () {
        setTimeout(() => {
            manager.state = 'focus';
        }, 0);
        window.addEventListener('native.keyboardhide', hide);

        function hide() {
            editor.blur();
            window.removeEventListener('native.keyboardhide', hide);
        }
    });
    editor.on('blur', function () {
        setTimeout(() => {
            manager.state = 'blur';
        }, 0);
    });
    editor.on('change', function (e) {
        if (e.type) console.log(e.type);
        if (manager.activeFile && !manager.activeFile.isUnsaved) {
            manager.activeFile.assocTile.classList.add('notice');
            manager.activeFile.isUnsaved = true;
            if (manager.activeFile)
                manager.onupdate();
        }
    });

    /**
     * 
     * @param {string} filename 
     * @param {newFileOptions} options 
     */
    function addNewFile(filename, options = {}) {
        const uri = options.fileUri || options.contentUri || (options.type === 'git' ? options.record.sha : undefined);
        let doesExists = getFile(uri || filename, !uri);
        if (doesExists) {
            if (manager.activeFile.id !== doesExists.id) switchFile(doesExists.id);
            return;
        }

        options.isUnsaved = options.isUnsaved === undefined ? true : options.isUnsaved;
        options.render = options.render === undefined ? true : options.render;

        const removeBtn = tag('span', {
            className: 'icon cancel',
            attr: {
                action: ''
            },
            onclick: () => {
                removeFile(file);
            }
        });
        const assocTile = tile({
            lead: tag('i', {
                className: helper.getIconForFile(filename),
            }),
            text: filename,
            tail: removeBtn
        });

        let file = {
            id: ++counter,
            controls: false,
            session: ace.createEditSession(options.text || ''),
            fileUri: options.fileUri,
            contentUri: options.contentUri,
            name: filename,
            editable: true,
            type: options.type || 'regular',
            isUnsaved: options.isUnsaved,
            readOnly: options.readOnly || options.isContentUri,
            record: options.record,
            assocTile,
            get filename() {
                if (this.type === 'git') return this.record.name;
                else return this.name;
            },
            set filename(name) {
                changeName.call(this, name);
            },
            get location() {
                if (this.fileUri)
                    return this.fileUri.replace(this.filename, '');
                return null;
            },
            set location(url) {
                if (!url) return;
                if (this.readOnly) {
                    this.readOnly = false;
                    this.contentUri = null;
                }
                this.fileUri = url + this.filename;
                setSubText(this);
                helpers.updateFolders(this.location);
                manager.onupdate();
            }
        };

        if (options.isUnsaved && !options.readOnly) {
            file.assocTile.classList.add('notice');
        }

        file.assocTile.classList.add('light');

        file.assocTile.addEventListener('click', function (e) {
            if (manager.activeFile && (e.target === removeBtn || manager.activeFile.id === file.id)) return;
            $sidebar.hide();
            switchFile(file.id);
        });

        file.assocTile.addEventListener('contextmenu', rename);
        manager.files.push(file);

        if (appSettings.value.openFileListPos === 'header') {
            $openFileList.append(file.assocTile);
        } else {
            $openFileList.addListTile(file.assocTile);
        }

        setupSession(file);

        if (options.render) {
            switchFile(file.id);
            if (options.cursorPos) {
                editor.moveCursorToPosition(options.cursorPos);
            }
        }

        function rename(e) {
            if (e.target === removeBtn) return;
            dialogs.prompt('Rename', file.filename, 'filename', {
                    match: constants.FILE_NAME_REGEX
                })
                .then(newname => {
                    if (!newname || newname === file.filename) return;
                    newname = helper.removeLineBreaks(newname);

                    if (file.fileUri) {
                        fs.renameFile(file.fileUri, newname)
                            .then(() => {
                                file.filename = newname;
                                helpers.updateFolders(file.location);
                                window.plugins.toast.showShortBottom(strings['file renamed']);
                            })
                            .catch(err => {
                                if (err.code !== 0)
                                    alert(strings['unable to remane'] + helper.getErrorMessage(err.code));
                                else
                                    console.error(err);
                            });
                    } else if (file.contentUri) {
                        alert(strings['unable to rename']);
                    } else {
                        file.filename = newname;
                        if (file.type === 'regular') window.plugins.toast.showShortBottom(strings['file renamed']);
                    }
                });
        }

        return file;
    }

    /**
     * 
     * @param {File} file 
     */
    function setSubText(file) {
        let text = 'Read Only';
        if (file.type === 'git') {
            text = 'git • ' + file.record.repo + '/' + file.record.path;
        } else if (file.type === 'gist') {
            const id = file.record.id;
            text = 'gist • ' + (id.length > 10 ? '...' + id.substring(id.length - 7) : id);
        } else if (file.location) {
            text = file.location;
            if (text.length > 30) {
                text = '...' + text.slice(text.length - 27);
            }
        } else if (!file.readOnly) {
            text = strings['new file'];
        }
        $header.subText(decodeURI(text));
    }

    function switchFile(id) {
        for (let file of manager.files) {
            if (id === file.id) {

                if (manager.activeFile) {
                    manager.activeFile.assocTile.classList.remove('active');
                }

                editor.setSession(file.session);
                if (manager.state === 'focus') editor.focus();
                setTimeout(controls.update, 100);

                $header.text(file.filename);
                setSubText(file);
                file.assocTile.classList.add('active');
                manager.activeFile = file;
                manager.onupdate();
                file.assocTile.scrollIntoView();
                return;
            }
        }

        manager.onupdate();
    }

    /**
     * 
     * @param {AceAjax.Editor} editor 
     */
    function setupEditor(editor) {
        ace.require("ace/ext/emmet");
        window.modelist = ace.require('ace/ext/modelist');
        const settings = appSettings.value;

        editor.setFontSize(settings.fontSize);
        editor.setHighlightSelectedWord(true);
        editor.setKeyboardHandler("ace/keyboard/sublime");
        editor.setOptions({
            animatedScroll: false,
            tooltipFollowsMouse: false,
            theme: settings.editorTheme,
            showGutter: settings.linenumbers,
            showLineNumbers: settings.linenumbers,
            enableEmmet: true,
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            showInvisibles: settings.showSpaces
        });

        if (!appSettings.value.linting) {
            editor.renderer.setMargin(0, 0, -16, 0);
        }
    }

    function moveOpenFileList() {
        let $list;

        if ($openFileList) {
            if ($openFileList.classList.contains('collaspable')) {
                $list = [...$openFileList.list.children];
            } else {
                $list = [...$openFileList.children];
            }
            $openFileList.remove();
        }

        if (appSettings.value.openFileListPos === 'header') {
            $openFileList = tag('ul', {
                className: 'open-file-list'
            });
            if ($list) $openFileList.append(...$list);
            root.append($openFileList);
            root.classList.add('top-bar');
        } else {
            $openFileList = list.collaspable(strings['active files']);
            if ($list) $openFileList.list.append(...$list);
            $sidebar.insertBefore($openFileList, $sidebar.firstElementChild);
            root.classList.remove('top-bar');
        }
        editor.resize(true);
    }

    function setupSession(file) {
        const session = file.session;
        const filename = file.filename;
        const settings = appSettings.value;
        const mode = modelist.getModeForPath(filename).mode;
        if (file.session.$modeId !== mode) {
            session.setOptions({
                mode,
                wrap: settings.textWrap,
                tabSize: settings.tabSize,
                useSoftTabs: settings.softTab,
                useWorker: appSettings.value.linting
            });
        }
    }

    function hasUnsavedFiles() {
        let count = 0;
        for (let editor of manager.files) {
            if (editor.isUnsaved) ++count;
        }

        return count;
    }

    function removeFile(id, force) {
        /**
         * @type {File}
         */
        const file = typeof id === "string" ? getFile(id) : id;

        if (!file) return;

        if (file.isUnsaved && !force) {
            dialogs.confirm(strings.warning.toUpperCase(), strings['unsaved file']).then(closeFile);
        } else {
            closeFile();

            if (file.type === 'git') gitRecord.remove(file.record.sha);
            else if (file.type === 'gist') gistRecord.remove(file.record);
        }

        function closeFile() {
            manager.files = manager.files.filter(editor => editor.id !== file.id);

            if (!manager.files.length) {
                editor.setSession(new ace.EditSession(""));
                $sidebar.hide();
                addNewFile('untitled', {
                    isUnsaved: false,
                    render: true
                });
            } else {
                if (file.id === manager.activeFile.id) {
                    switchFile(manager.files[manager.files.length - 1].id);
                }
            }

            file.assocTile.remove();
            delete manager.files[id];
            manager.onupdate();
        }
    }

    /**
     * 
     * @param {number | string} id 
     */
    function getFile(id, isName) {
        for (let file of manager.files) {
            if (file.type === 'git' && id === file.record.sha) return file;
            if (typeof id === 'number' && file.id === id)
                return file;
            else if (typeof id === 'string' && (file.fileUri === id || file.contentUri === id))
                return file;
            else if (isName && !file.location && file.name === id)
                return file;
        }

        return null;
    }


    async function changeName(name) {
        if (!name) return;

        if (this.type === 'git') {
            try {
                await this.record.setName(name);
                this.name = name;
                manager.onupdate();
            } catch (err) {
                return error(err);
            }
        } else if (this.type === 'gist') {
            try {
                await this.record.setName(this.name, name);
                this.name = name;
                manager.onupdate();
            } catch (err) {
                return error(err);
            }
        } else if (this.fileUri) {
            this.fileUri = this.location + name;
        }

        if (editorManager.activeFile.id === this.id) $header.text(name);

        this.assocTile.text(name);
        if (helpers.getExt(this.name) !== helpers.getExt(name)) {
            setupSession({
                session: this.session,
                filename: name
            });
            this.assocTile.lead(tag('i', {
                className: helper.getIconForFile(name),
                style: {
                    paddingRight: '5px'
                }
            }));
        }

        this.name = name;
        manager.onupdate();

        function error(err) {
            dialogs.alert(strings.error, err.toString());
            console.log(err);
        }
    }

    return manager;
}

export default EditorManager;