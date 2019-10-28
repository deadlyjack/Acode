import list from '../components/list';
import clipboardAction from './clipboard';
import {
    tag
} from 'html-element-js';
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
    /**
     * @type {acodeEditor[]}
     */
    let counter = 0;
    const thisObj = {
        addNewFile,
        getEditor,
        switchEditor,
        activeEditor: null,
        update,
        onupdate: () => {},
        hasUnsavedEditor,
        editors: [],
        removeEditor,
        updateLocation
    };

    sidebar.append(openFileList);

    /**
     * 
     * @param {string} id 
     */
    function getEditor(id) {
        for (let editor of thisObj.editors) {
            if (editor.id === id)
                return editor;
        }

        return null;
    }

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
     * @returns {acodeEditor}
     */
    function addNewFile(filename, options = {}) {

        let tmpID = options.fileUri || options.contentUri;
        if (getEditor(tmpID)) {
            if (thisObj.activeEditor.id !== tmpID) switchEditor(tmpID);
            return;
        }

        options.isUnsaved = options.isUnsaved === undefined ? true : options.isUnsaved;
        options.render = options.render === undefined ? true : options.render;

        const id = tmpID || ++counter;
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
            filename,
            assocTile,
            fileUri: options.fileUri,
            contentUri: options.contentUri,
            location: options.location,
            isUnsaved: options.isUnsaved,
            readOnly: options.readOnly,
            updateControls: null,
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
            if (thisEditor.isContentUri) return alert('Cannot rename this file. Please open this file from the this app to rename.');
            dialogs.prompt('Rename', thisEditor.filename)
                .then(newname => {
                    if (!newname || newname === thisEditor.filename) return;
                    newname = helper.removeLineBreaks(newname);
                    if (thisEditor.fileUri) {
                        fs.renameFile(thisEditor.fileUri, newname)
                            .then(() => {
                                for (let key in addedFolder) {
                                    if (new RegExp(key).test(thisEditor.id)) {
                                        addedFolder[key].reload();
                                    }
                                }
                                thisObj.onupdate();
                                const id = thisEditor.location ? thisEditor.location + encodeURI(newname) : thisEditor;
                                update(id, newname);
                                window.plugins.toast.showShortBottom(strings['file renamed']);
                            });
                    } else {
                        update(thisEditor.location + encodeURI(newname), newname);
                    }
                })
                .catch(err => {
                    if (err.code !== 0) {
                        alert('Unable to remane file. Error: ' + helper.getErrorMessage(err.code));
                    } else if (typeof err === 'string') {
                        alert("Error: " + err);
                    }
                    console.error(err);
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

    function setSubText(editor) {
        if (editor.location) {
            let text = editor.location;
            if (text.length > 30) {
                text = '...' + text.slice(text.length - 27);
            }
            header.subText(decodeURI(text));
        }
    }

    function switchEditor(id) {
        if (thisObj.activeEditor) {
            thisObj.activeEditor.assocTile.classList.remove('active');
            body.removeChild(thisObj.activeEditor.container);
        }
        for (let editor of thisObj.editors) {
            if (id === editor.id) {
                body.append(editor.container);
                if (editor.readOnly) {
                    header.text(editor.filename + ' (read only)');
                } else {
                    header.text(editor.filename);
                }
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
        setLanguage(editor, filename);
        editor.getSession().setUseWorker(!!appSettings.value.linting);
        editor.setFontSize(appSettings.value.fontSize);
        editor.setHighlightSelectedWord(true);
        editor.setKeyboardHandler("ace/keyboard/sublime");
        editor.setOptions({
            animatedScroll: false,
            tooltipFollowsMouse: false,
            wrap: appSettings.value.textWrap,
            theme: appSettings.value.editorTheme,
            tabSize: appSettings.value.tabSize,
            useSoftTabs: appSettings.value.softTab,
            showGutter: appSettings.value.linenumbers,
            showLineNumbers: appSettings.value.linenumbers
        });
    }

    function setLanguage(editor, filename) {
        const modelist = ace.require('ace/ext/modelist');
        const mode = modelist.getModeForPath(filename).mode;
        editor.session.setMode(mode);
        if (['html', 'haml', 'jade', 'slim', 'jsx', 'xml', 'xsl', 'css', 'scss', 'sass', 'less', 'stylus'].includes(helper.getExt(filename))) {
            ace.require("ace/ext/emmet");
            editor.setOption("enableEmmet", true);
        }
    }

    /**
     * 
     * @param {string} newid 
     * @param {string} filename 
     * @param {string} location
     */
    function update(newid, filename, location, editor) {
        /**
         * @type {acodeEditor}
         */
        const activeEditor = editor || thisObj.activeEditor;

        activeEditor.isUnsaved = false;
        activeEditor.id = newid;
        activeEditor.readOnly = false;
        if (filename) {
            if (helpers.getExt(activeEditor.filename) !== helpers.getExt(filename)) {
                setMode(activeEditor.editor, filename);
                activeEditor.assocTile.lead(tag('i', {
                    className: helper.getIconForFile(filename)
                }));
            }
            activeEditor.filename = filename;
            header.text(filename);
            if (activeEditor.location) activeEditor.fileUri = activeEditor.location + encodeURI(filename);
            activeEditor.assocTile.text(filename);
            activeEditor.assocTile.lead(tag('i', {
                className: helper.getIconForFile(filename)
            }));
        }
        if (location) {
            updateLocation(activeEditor, location, filename);
        }
        window.plugins.toast.showShortBottom('file saved');
        thisObj.onupdate();
    }

    function updateLocation(editor, location, filename = '') {
        editor.fileUri = editor.id = location + encodeURI((filename || editor.filename));
        editor.location = location;
        setSubText(editor);
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
         * @type {acodeEditor}
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

    return thisObj;
}

export default EditorManager;