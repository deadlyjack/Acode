import list from '../components/list';
import clipboardAction from '../modules/clipboard';
import tag from 'html-tag-js';
import helper from '../modules/helpers';
import tile from "../components/tile";
import fs from '../modules/androidFileSystem';
import dialogs from '../components/dialogs';
import helpers from '../modules/helpers';
import textControl from '../modules/oncontextmenu';

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
    /**
     * @type {File[]}
     */
    let counter = 0;
    const thisObj = {
        addNewFile,
        getEditor,
        switchEditor,
        activeEditor: null,
        onupdate: () => {},
        hasUnsavedEditor,
        /**
         * @type {Array<File>}
         */
        editors: [],
        removeEditor
    };

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

        let doesExists = getEditor(options.fileUri || options.contentUri);
        if (doesExists) {
            if (thisObj.activeEditor.id !== doesExists.id) switchEditor(doesExists.id);
            return;
        }

        options.isUnsaved = options.isUnsaved === undefined ? true : options.isUnsaved;
        options.render = options.render === undefined ? true : options.render;

        const id = ++counter;
        const container = tag('div', {
            className: 'editor-container'
        });
        /**
         * @type {AceAjax.Editor}
         */
        const editor = ace.edit(container);
        const removeBtn = tag('span', {
            className: 'icon cancel'
        });
        const assocTile = tile({
            lead: tag('i', {
                className: helper.getIconForFile(filename),
            }),
            text: filename,
            tail: removeBtn
        });
        let thisEditor = {
            id,
            container,
            editor,
            fileUri: options.fileUri,
            contentUri: options.contentUri,
            assocTile,
            name: filename,
            isUnsaved: options.isUnsaved,
            readOnly: options.readOnly || options.isContentUri,
            updateControls: null,
            get ace() {
                return this.editor
            },
            get filename() {
                return this.name;
            },
            set filename(name) {
                if (!name) return;
                header.text(name);
                this.assocTile.text(name);
                if (helpers.getExt(this.name) !== helpers.getExt(name)) {
                    setLanguage(this.editor, name);
                    this.assocTile.lead(tag('i', {
                        className: helper.getIconForFile(name)
                    }));
                }

                if (this.fileUri) this.fileUri = this.location + name;
                this.name = name;
                thisObj.onupdate();
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
                setSubText(this.editor);
                helpers.updateFolders(this.location);
                thisObj.onupdate();
            },
            controls: {
                start: tag('span', {
                    className: 'cursor-control start'
                }),
                end: tag('span', {
                    className: 'cursor-control end'
                }),
                menu: tag('div', {
                    className: 'clipboard-contextmneu',
                    innerHTML: '<span action="copy">copy</span><span action="cut">cut</span><span action="paste">paste</span><span action="select all">select all<span>',
                })
            }
        };

        thisEditor.controls.menu.ontouchend = function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const action = e.target.getAttribute('action');
            if (action) {
                clipboardAction(action, thisEditor);
            }
        };

        if (options.text) {
            editor.setValue(options.text, -1);
            editor.getSession().setUndoManager(new ace.UndoManager());
        }

        if (options.isUnsaved) {
            assocTile.classList.add('notice');
        }

        editor.on('change', function () {
            if (!thisEditor.isUnsaved) {
                thisEditor.assocTile.classList.add('notice');
                thisEditor.isUnsaved = true;
                if (thisObj.activeEditor)
                    thisObj.onupdate();
            }
        });

        assocTile.classList.add('light');

        setMode(editor, filename);

        assocTile.addEventListener('click', function (e) {
            if (thisObj.activeEditor && (e.target === removeBtn || thisObj.activeEditor.id === thisEditor.id)) return;
            sidebar.hide();
            switchEditor(thisEditor.id);
        });

        assocTile.addEventListener('contextmenu', function (e) {
            if (e.target === removeBtn) return;
            dialogs.prompt('Rename', thisEditor.filename)
                .then(newname => {
                    if (!newname || newname === thisEditor.filename) return;
                    newname = helper.removeLineBreaks(newname);

                    if (thisEditor.fileUri) {
                        fs.renameFile(thisEditor.fileUri, newname)
                            .then(() => {
                                thisEditor.filename = newname;
                                helpers.updateFolders(thisEditor.location);
                                window.plugins.toast.showShortBottom(strings['file renamed']);
                            })
                            .catch(err => {
                                if (err.code !== 0)
                                    alert(strings['unable to remane'] + helper.getErrorMessage(err.code));
                                else
                                    console.error(err);
                            });
                    } else if (thisEditor.contentUri) {
                        alert(strings['unable to rename']);
                    } else {
                        thisEditor.filename = newname;
                        window.plugins.toast.showShortBottom(strings['file renamed']);
                    }
                });
        });

        textControl(thisEditor);

        removeBtn.addEventListener('click', () => removeEditor(thisEditor));
        thisObj.editors.push(thisEditor);
        openFileList.addListTile(assocTile);

        if (options.render) {
            switchEditor(thisEditor.id);
            setTimeout(() => {
                if (options.cursorPos) {
                    editor.moveCursorToPosition(options.cursorPos);
                }
            }, 100);
        }

        return thisEditor;
    }

    /**
     * 
     * @param {File} editor 
     */
    function setSubText(editor) {
        let text = 'Read Only';
        if (editor.location) {
            text = editor.location;
            if (text.length > 30) {
                text = '...' + text.slice(text.length - 27);
            }
        } else if (!editor.readOnly) {
            text = 'New File';
        }
        header.subText(decodeURI(text));
    }

    function switchEditor(id) {
        for (let editor of thisObj.editors) {
            if (id === editor.id) {

                if (thisObj.activeEditor) {
                    thisObj.activeEditor.assocTile.classList.remove('active');
                    body.removeChild(thisObj.activeEditor.container);
                }

                body.append(editor.container);
                header.text(editor.filename);
                setSubText(editor);
                editor.assocTile.classList.add('active');
                thisObj.activeEditor = editor;
                thisObj.onupdate();
                return;
            }
        }

        thisObj.onupdate();
    }

    /**
     * 
     * @param {AceAjax.Editor} editor 
     * @param {string} filename 
     */
    function setMode(editor, filename) {
        const settings = appSettings.value;
        setLanguage(editor, filename);
        editor.getSession().setUseWorker(!!settings.linting);
        editor.setFontSize(settings.fontSize);
        editor.setHighlightSelectedWord(true);
        editor.setKeyboardHandler("ace/keyboard/sublime");
        editor.setOptions({
            animatedScroll: false,
            tooltipFollowsMouse: false,
            wrap: settings.textWrap,
            theme: settings.editorTheme,
            tabSize: settings.tabSize,
            useSoftTabs: settings.softTab,
            showGutter: settings.linenumbers,
            showLineNumbers: settings.linenumbers
        });
    }

    function setLanguage(editor, filename) {
        let modelist = window.modelist;
        if (!modelist) {
            modelist = ace.require('ace/ext/modelist');
            window.modelist = modelist;
        }
        const mode = modelist.getModeForPath(filename).mode;
        editor.session.setMode(mode);
        if (['html', 'haml', 'jade', 'slim', 'jsx', 'xml', 'xsl', 'css', 'scss', 'sass', 'less', 'stylus'].includes(helper.getExt(filename))) {
            let emmet = window.emmet;
            if (!emmet) {
                emmet = ace.require("ace/ext/emmet");
                window.emmet = emmet;
            }
            editor.setOption("enableEmmet", true);
        }
    }

    function hasUnsavedEditor() {
        let count = 0;
        for (let editor of thisObj.editors) {
            if (editor.isUnsaved) ++count;
        }

        return count;
    }

    function removeEditor(id, force) {
        /**
         * @type {File}
         */
        const thisEditor = typeof id === "string" ? getEditor(id) : id;

        if (!thisEditor) return;

        if (thisEditor.isUnsaved && !force) {
            dialogs.confirm(strings.warning.toUpperCase(), strings['unsaved file']).then(closeEditor);
        } else {
            closeEditor();
        }

        function closeEditor() {
            thisObj.editors = thisObj.editors.filter(editor => editor.id !== thisEditor.id);

            if (!thisObj.editors.length) {
                thisEditor.editor.blur();
                thisEditor.container.remove();
                header.text('Acode');
                header.subText(null);
                thisObj.activeEditor = null;
            } else {
                if (thisEditor.id === thisObj.activeEditor.id) {
                    switchEditor(thisObj.editors[thisObj.editors.length - 1].id);
                }
            }

            thisEditor.assocTile.remove();
            thisEditor.editor.destroy();
            thisObj.onupdate();
        }
    }

    /**
     * 
     * @param {number | string} id 
     */
    function getEditor(id) {
        for (let editor of thisObj.editors) {
            if (typeof id === 'number' && editor.id === id)
                return editor;
            else if (typeof id === 'string' && (editor.fileUri === id || editor.contentUri === id))
                return editor;
        }

        return null;
    }

    return thisObj;
}

export default EditorManager;