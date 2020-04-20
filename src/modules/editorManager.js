import list from '../components/collapsableList';
import clipboardAction from './clipboard';
import tag from 'html-tag-js';
import tile from "../components/tile";
import dialogs from '../components/dialogs';
import helpers from '../modules/helpers';
import textControl from './events/selection';
import constants from '../constants';
import internalFs from './utils/internalFs';
import openFolder from './addFolder';
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
    let checkTimeout = null,
        TIMEOUT_VALUE = 300,
        ready = false,
        lastHeight = innerHeight,
        editorState = 'blur';
    const container = tag('div', {
        className: 'editor-container'
    });
    const queue = [];
    /**
     * @type {AceAjax.Editor}
     */
    const editor = ace.edit(container);
    const readOnlyContent = `<span action="copy">${strings.copy}</span><span action="select all">${strings["select all"]}<span>`;
    const fullContent = `<span action="copy">${strings.copy}</span><span action="cut">${strings.cut}</span><span action="paste">${strings.paste}</span><span action="select all">${strings["select all"]}</span>`;
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
        color: tag('span', {
            className: 'icon color',
            attr: {
                action: 'color'
            }
        }),
        fullContent,
        readOnlyContent,
        update: () => {},
        checkForColor: function () {
            const copyTxt = editor.getCopyText();
            const readOnly = editor.getReadOnly();

            if (this.color.isConnected && readOnly) {
                this.color.remove();
            } else {

                if (copyTxt) this.color.style.color = copyTxt;

                if (readOnly) this.color.classList.add('disabled');
                else this.color.classList.remove('disabled');

                if (!this.color.isConnected) controls.menu.appendChild(this.color);
            }
        }
    };
    const SESSION_PATH = cordova.file.cacheDirectory + 'session/';

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
        setSubText,
        moveOpenFileList,
        sidebar: $sidebar,
        container,
        get state() {
            return editorState;
        },
        get TIMEOUT_VALUE() {
            return TIMEOUT_VALUE;
        },
        get openFileList() {
            return $openFileList;
        }
    };

    container.classList.add(appSettings.value.editorFont);
    moveOpenFileList();
    $body.appendChild(container);
    setupEditor();
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

    window.addEventListener('resize', () => {
        if (innerHeight > lastHeight) {
            editor.blur();
            editorState = 'blur';
        }
        lastHeight = innerHeight;
        editor.renderer.scrollCursorIntoView();
    });

    editor.on('focus', () => {
        editorState = 'focus';
    });

    editor.on('change', function (e) {
        if (checkTimeout) clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkChanges, TIMEOUT_VALUE);
    });

    function checkChanges() {
        const file = SESSION_PATH + manager.activeFile.id;
        const text = manager.activeFile.session.getValue();
        const activeFile = manager.activeFile;
        if (activeFile && !activeFile.isUnsaved & activeFile.sesstionCreated) {
            internalFs.readFile(file)
                .then(res => {
                    const decoder = new TextDecoder("utf-8");
                    const old_text = decoder.decode(res.data);
                    if (old_text !== text) {
                        manager.activeFile.assocTile.classList.add('notice');
                        manager.activeFile.isUnsaved = true;
                        manager.onupdate();
                    }
                })
                .finally(() => {
                    internalFs.writeFile(file, text, true, false);
                });
        }
    }

    window.resolveLocalFileSystemURL(SESSION_PATH, () => {
        ready = true;
        emptyQueue();
    }, () => {
        internalFs.createDir(cordova.file.cacheDirectory, 'session')
            .then(() => {
                ready = true;
                emptyQueue();
            });
    });

    function emptyQueue() {
        if (!queue.length) return;
        const {
            filename,
            options
        } = queue.splice(0, 1)[0];
        if (filename) addNewFile(filename, options);
        emptyQueue();
    }

    /**
     * 
     * @param {string} filename 
     * @param {newFileOptions} options 
     */
    function addNewFile(filename, options = {}) {
        if (!ready) {
            queue.push({
                filename,
                options
            });
            return;
        }

        let doesExists = null;

        if (options.fileUri) options.fileUri = helpers.decodeURL(options.fileUri);

        if (options.id) doesExists = getFile(options.id, "id");
        else if (options.fileUri) doesExists = getFile(options.fileUri, "fileUri");
        else if (options.contentUri) doesExists = getFile(options.contentUri, "contentUri");
        else if (options.record) doesExists = getFile(options.record, options.type);

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
                className: helpers.getIconForFile(filename),
            }),
            text: filename,
            tail: removeBtn
        });
        const text = options.text || '';
        let id = options.id || helpers.uuid();

        let file = {
            id,
            sesstionCreated: false,
            controls: false,
            session: ace.createEditSession(text),
            fileUri: options.fileUri,
            contentUri: options.contentUri,
            name: filename,
            editable: true,
            type: options.type || 'regular',
            isUnsaved: options.isUnsaved,
            record: options.record,
            encoding: 'utf-8',
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
                    return this.fileUri.replace(new RegExp(this.filename + '$'), '');
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

        internalFs.writeFile(SESSION_PATH + id, text, true, false)
            .then(() => {
                file.sesstionCreated = true;
            });

        if (options.isUnsaved && !options.readOnly) {
            file.assocTile.classList.add('notice');
        }

        file.assocTile.classList.add('light');

        file.assocTile.addEventListener('click', function (e) {
            if (manager.activeFile && (e.target === removeBtn || manager.activeFile.id === file.id)) return;
            $sidebar.hide();
            switchFile(file.id);
        });

        manager.files.push(file);

        if (appSettings.value.openFileListPos === 'header') {
            $openFileList.append(file.assocTile);
        } else {
            $openFileList.$ul.append(file.assocTile);
        }

        setupSession(file);

        if (options.render) {
            switchFile(file.id);
            if (options.cursorPos) {
                editor.moveCursorToPosition(options.cursorPos);
            }

            const defaultFile = getFile(constants.DEFAULT_SESSION, "id");
            if (
                defaultFile &&
                !defaultFile.session.getValue() &&
                defaultFile.filename === constants.DEFAULT_FILE_NAME
            ) manager.removeFile(defaultFile);
        }

        setTimeout(() => {
            editor.resize(true);
        }, 0);

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
        } else if (file.location || file.contentUri) {
            text = file.location || file.contentUri;
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

    function setupEditor() {
        ace.require("ace/ext/emmet");
        const settings = appSettings.value;

        editor.setFontSize(settings.fontSize);
        editor.setHighlightSelectedWord(true);
        // editor.setKeyboardHandler("ace/keyboard/sublime");
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
            showInvisibles: settings.showSpaces,
            indentedSoftWrap: false
        });

        if (!appSettings.value.linting && appSettings.value.linenumbers) {
            editor.renderer.setMargin(0, 0, -16, 0);
        }
    }

    function setupSession(file) {
        const session = file.session;
        const filename = file.filename;
        const settings = appSettings.value;
        const mode = modelist.getModeForPath(filename).mode;
        if (file.session.$modeId !== mode) {
            session.setOptions({
                mode,
                // wrap: settings.textWrap,
                tabSize: settings.tabSize,
                useSoftTabs: settings.softTab,
                useWorker: appSettings.value.linting
            });
        }
        file.session.setOption('wrap', settings.textWrap);
    }

    function moveOpenFileList() {
        let $list;

        if ($openFileList) {
            if ($openFileList.classList.contains('collaspable')) {
                $list = [...$openFileList.$ul.children];
            } else {
                $list = [...$openFileList.children];
            }
            $openFileList.remove();
        }

        if (appSettings.value.openFileListPos === 'header') {
            $openFileList = tag('ul', {
                className: 'open-file-list',
                ontouchstart: checkForDrag,
                onmousedown: checkForDrag
            });
            if ($list) $openFileList.append(...$list);
            root.append($openFileList);
            root.classList.add('top-bar');
        } else {
            $openFileList = list(strings['active files']);
            $openFileList.ontoggle = function () {
                openFolder.updateHeight();
            };
            if ($list) $openFileList.$ul.append(...$list);
            $sidebar.insertBefore($openFileList, $sidebar.firstElementChild);
            root.classList.remove('top-bar');
        }
    }

    /**
     * @this {HTMLElement}
     * @param {MouseEvent|TouchEvent} e 
     */
    function checkForDrag(e) {
        /**@type {HTMLElement} */
        const $el = e.target;
        if (!$el.classList.contains('tile')) return;


        const $parent = this;
        const type = e.type === 'mousedown' ? 'mousemove' : 'touchmove';
        const opts = {
            passive: false
        };
        let timeout;

        if ($el.eventAdded) return;
        $el.eventAdded = true;


        timeout = setTimeout(() => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const event = e => e.touches && e.touches[0] || e;

            let startX = event(e).clientX;
            let startY = event(e).clientY;
            let prevEnd = startX;
            let position;
            let left = $el.offsetLeft;
            let $placeholder = $el.cloneNode(true);
            let classFlag = false;

            $placeholder.style.opacity = '0';
            navigator.vibrate(10);
            document.ontouchmove = document.onmousemove = null;
            document.addEventListener(type, drag, opts);
            console.log("Adding listener", e.type);

            document.ontouchend = document.onmouseup = document.ontouchcancel = document.onmouseleave = function (e) {
                $el.classList.remove('select');
                $el.style.removeProperty('transform');
                document.removeEventListener(type, drag, opts);
                console.log("Remove listener", e.type);
                document.ontouchend = document.onmouseup = null;
                if ($placeholder.isConnected) $parent.replaceChild($el, $placeholder);
                $el.eventAdded = false;
            };

            function drag(e) {
                console.log(e.type);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const end = event(e).clientX;

                position = (prevEnd - end) > 0 ? 'l' : 'r';
                prevEnd = end;
                const move = end - startX;
                const $newEl = document.elementFromPoint(end, startY);

                $el.style.transform = `translate3d(${left+move}px, 0, 0)`;
                if (!classFlag) {
                    $el.classList.add('select');
                    $parent.insertBefore($placeholder, $el);
                    classFlag = true;
                }
                if ($newEl.classList.contains('tile') && $el !== $newEl && $parent.contains($newEl)) {
                    if (position === 'r') {
                        if ($newEl.nextElementSibling) {
                            $parent.insertBefore($placeholder, $newEl.nextElementSibling);
                        } else {
                            $parent.append($placeholder);
                        }
                    } else {
                        $parent.insertBefore($placeholder, $newEl);
                    }
                }

            }

        }, 300);


        document.ontouchend = document.onmouseup = document.ontouchmove = document.onmousemove = function (e) {
            console.log("Touch end without tiggering drag");
            document.ontouchend = document.onmouseup = document.ontouchmove = document.onmousemove = null;
            if (timeout) clearTimeout(timeout);
            $el.eventAdded = false;
        };
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
        const file = typeof id === "string" ? getFile(id, "id") : id;

        if (!file || (manager.files.length === 1 && file.id === constants.DEFAULT_SESSION)) return;

        if (file.isUnsaved && !force) {
            dialogs.confirm(strings.warning.toUpperCase(), strings['unsaved file']).then(closeFile);
        } else {
            closeFile();

            if (file.type === 'git') gitRecord.remove(file.record.sha);
            else if (file.type === 'gist') gistRecord.remove(file.record);
        }

        function closeFile() {
            manager.files = manager.files.filter(editor => editor.id !== file.id);


            if (file.id !== constants.DEFAULT_SESSION || manager.activeFile.id === constants.DEFAULT_SESSION) {
                if (!manager.files.length) {
                    editor.setSession(new ace.EditSession(""));
                    $sidebar.hide();
                    addNewFile('untitled.txt', {
                        isUnsaved: false,
                        render: true,
                        id: constants.DEFAULT_SESSION
                    });
                } else {
                    if (file.id === manager.activeFile.id) {
                        switchFile(manager.files[manager.files.length - 1].id);
                    }
                }
            }

            file.assocTile.remove();
            delete file.session;
            delete file.assocTile;
            manager.onupdate();
        }
    }

    /**
     * 
     * @param {string|number|Repo|Gist} checkFor 
     * @param {"id"|"name"|"fileUri"|"contentUri"|"git"|"gist"} [type] 
     * @returns {File}
     */
    function getFile(checkFor, type = "id") {

        if (typeof type !== "string") return null;
        if (typeof checkFor === 'string' && !["id" | "name"].includes(type)) checkFor = helpers.decodeURL(checkFor);

        let result = null;
        for (let file of manager.files) {
            if (typeof type === "string") {

                if (type === "id" && file.id === checkFor) result = file;
                else if (type === "name" && file.name === checkFor) result = file;
                else if (type === "fileUri" && file.fileUri === checkFor) result = file;
                else if (type === "contentUri" && file.contentUri === checkFor) result = file;
                else if (type === "gist" && file.record && file.record.id === checkFor.id) result = file;
                else if (type === "git" && file.record && file.record.sha === checkFor.sha) result = file;

            }
            if (result) break;

        }

        return result;
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
                className: helpers.getIconForFile(name),
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