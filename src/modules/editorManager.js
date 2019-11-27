import list from '../components/list';
import clipboardAction from './clipboard';
import tag from 'html-tag-js';
import helper from '../modules/helpers';
import tile from "../components/tile";
import fs from './androidFileSystem';
import dialogs from '../components/dialogs';
import helpers from '../modules/helpers';
import textControl from './oncontextmenu';

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
 * @param {HTMLElement} sidebar 
 * @param {HTMLElement} header 
 * @param {HTMLElement} body 
 * @returns {Manager}
 */
function EditorManager(sidebar, header, body) {
    const openFileList = list.collaspable(strings['active files']);
    let counter = 0;
    const container = tag('div', {
        className: 'editor-container'
    });
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
    }

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
        controls
    };

    body.appendChild(container);
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
    }
    editor.on('change', function () {
        if (manager.activeFile && !manager.activeFile.isUnsaved) {
            manager.activeFile.assocTile.classList.add('notice');
            manager.activeFile.isUnsaved = true;
            if (manager.activeFile)
                manager.onupdate();
        }
    });

    sidebar.append(openFileList);

    /**
     * 
     * @param {string} filename 
     * @param {object} [options]
     * @param {string} [options.text]
     * @param {string} [options.fileUri]
     * @param {string} [options.contentUri]
     * @param {boolean} [options.isContentUri]
     * @param {boolean} [options.isUnsaved]
     * @param {string} [options.location]
     * @param {boolean} [options.render]
     * @param {boolean} [options.readOnly]
     * @param {Object} [options.cursorPos]
     * @returns {File}
     */
    function addNewFile(filename, options = {}) {
        const uri = options.fileUri || options.contentUri;
        let doesExists = getFile(uri || filename, !uri);
        if (doesExists) {
            if (manager.activeFile.id !== doesExists.id) switchFile(doesExists.id);
            return;
        }

        options.isUnsaved = options.isUnsaved === undefined ? true : options.isUnsaved;
        options.render = options.render === undefined ? true : options.render;

        const removeBtn = tag('span', {
            className: 'icon cancel'
        });
        let file = {
            id: ++counter,
            session: ace.createEditSession(options.text || ''),
            fileUri: options.fileUri,
            contentUri: options.contentUri,
            name: filename,
            isUnsaved: options.isUnsaved,
            readOnly: options.readOnly || options.isContentUri,
            assocTile: tile({
                lead: tag('i', {
                    className: helper.getIconForFile(filename),
                }),
                text: filename,
                tail: removeBtn
            }),
            get filename() {
                return this.name;
            },
            set filename(name) {
                if (!name) return;
                header.text(name);
                this.assocTile.text(name);
                if (helpers.getExt(this.name) !== helpers.getExt(name)) {
                    setupSession({
                        session: this.session,
                        filename: name
                    });
                    this.assocTile.lead(tag('i', {
                        className: helper.getIconForFile(name)
                    }));
                }

                if (this.fileUri) this.fileUri = this.location + name;
                this.name = name;
                manager.onupdate();
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
                this.fileUri = url + this.filename
                setSubText(this);
                helpers.updateFolders(this.location);
                manager.onupdate();
            }
        };

        if (options.isUnsaved) {
            file.assocTile.classList.add('notice');
        }

        file.assocTile.classList.add('light');

        file.assocTile.addEventListener('click', function (e) {
            if (manager.activeFile && (e.target === removeBtn || manager.activeFile.id === file.id)) return;
            sidebar.hide();
            switchFile(file.id);
        });

        file.assocTile.addEventListener('contextmenu', function (e) {
            if (e.target === removeBtn) return;
            dialogs.prompt('Rename', file.filename)
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
                        window.plugins.toast.showShortBottom(strings['file renamed']);
                    }
                });
        });

        removeBtn.addEventListener('click', () => removeFile(file));
        manager.files.push(file);
        openFileList.addListTile(file.assocTile);

        setupSession(file);

        if (options.render) {
            switchFile(file.id);
            if (options.cursorPos) {
                editor.moveCursorToPosition(options.cursorPos);
            }
        }

        return file;
    }

    /**
     * 
     * @param {File} file 
     */
    function setSubText(file) {
        let text = 'Read Only';
        if (file.location) {
            text = file.location;
            if (text.length > 30) {
                text = '...' + text.slice(text.length - 27);
            }
        } else if (!file.readOnly) {
            text = 'New File';
        }
        header.subText(decodeURI(text));
    }

    function switchFile(id) {
        for (let file of manager.files) {
            if (id === file.id) {

                if (manager.activeFile) {
                    manager.activeFile.assocTile.classList.remove('active');
                }
                manager.controls.update();

                editor.setSession(file.session);
                editor.focus();
                setTimeout(controls.update, 100);

                header.text(file.filename);
                setSubText(file);
                file.assocTile.classList.add('active');
                manager.activeFile = file;
                manager.onupdate();
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
            enableEmmet: true
        });
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
        }

        function closeFile() {
            manager.files = manager.files.filter(editor => editor.id !== file.id);

            if (!manager.files.length) {
                editor.setSession(new ace.EditSession(""));
                sidebar.hide();
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
            if (typeof id === 'number' && file.id === id)
                return file;
            else if (typeof id === 'string' && (file.fileUri === id || file.contentUri === id))
                return file;
            else if (isName && !file.location && file.name === id)
                return file;
        }

        return null;
    }

    return manager;
}

export default EditorManager;