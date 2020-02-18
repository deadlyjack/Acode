import tag from 'html-tag-js';
import list from "../components/list";
import fs from "./utils/internalFs";
import dialogs from "../components/dialogs";
import helpers from "./helpers";
import tile from "../components/tile";
import constants from "../constants";
import createEditorFromURI from "./createEditorFromURI";
import recents from './recents';
import fsOperation from './utils/fsOperation';

export default addFolder;

/**
 * 
 * @param {any} folder 
 * @param {HTMLElement} sidebar 
 * @param {Number} index 
 */
function addFolder(folder, sidebar, index) {
    return new Promise(resolve => {

        if (folder.url in addedFolder) resolve();

        const rootUrl = typeof folder === 'string' ? folder : folder.url;
        let name = folder.name === 'File Browser' ? 'Home' : folder.name;

        if (!name) {
            name = decodeURI(rootUrl.slice(0, -1)).split('/').pop();
        }

        const closeFolder = tag('span', {
            className: 'icon cancel',
            attr: {
                action: 'close'
            }
        });
        const uniqueId = () => (new Date().getTime() * Math.random()).toString(16);
        const state = {};
        let rootNode = list.collaspable(name, false, 'folder', {
            tail: closeFolder,
            allCaps: true
        });
        let title = rootNode.titleEl;

        title.setAttribute('name', name);
        title.setAttribute('type', 'root');
        title.setAttribute('url', rootUrl);
        rootNode.addEventListener('click', handleClick);
        rootNode.addEventListener('contextmenu', handleContextMenu);

        plotFolder(rootUrl, rootNode);
        sidebar.append(rootNode);
        addedFolder[rootUrl] = {
            reload: () => plotFolder(rootUrl, rootNode),
            name,
            remove
        };
        recents.addFolder(rootUrl);

        function plotFolder(url, rootNode) {
            rootNode.clearList();
            fs.listDir(url).then(dirList => {
                dirList = helpers.sortDir(dirList, appSettings.value.fileBrowser);
                dirList.map(item => {
                    if (item.isDirectory) {
                        createFolderTile(rootNode, item);
                    } else {
                        createFileTile(rootNode, item);
                    }
                    return item;
                });
                resolve(index);
            }).catch(() => {
                rootNode.remove();
                delete addedFolder[rootUrl];
                resolve(index);
            });
            return rootNode;
        }

        function createFileTile(rootNode, item) {
            const listItem = tile({
                lead: tag('span', {
                    className: helpers.getIconForFile(item.name),
                    style: {
                        paddingRight: '5px'
                    }
                }),
                text: item.name
            });

            listItem.id = uniqueId();
            listItem.setAttribute('action', 'open');
            listItem.setAttribute('type', 'file');
            listItem.setAttribute('name', item.name);
            if (rootNode) rootNode.addListTile(listItem);
            else return listItem;
        }

        function createFolderTile(rootNode, item, isNew) {
            const name = item.name;
            const nurl = decodeURI(item.nativeURL);
            const hidden = state[nurl] === undefined ? true : state[nurl];
            const $node = list.collaspable(name, hidden, 'folder');

            $node.textConten = '';

            const title = $node.titleEl;
            title.id = uniqueId();
            title.setAttribute('type', 'dir');
            title.setAttribute('url', nurl);
            title.setAttribute('name', name);

            $node.ontoggle = function (val) {
                state[nurl] = val;
            };

            const $folder = isNew ? $node : plotFolder(nurl, $node);
            if (rootNode) rootNode.addListTile($folder);
            else return $folder;
        }

        /**
         * 
         * @param {string} selectedOption 
         * @param {'file'|'dir'} type 
         * @param {HTMLElement} $node 
         * @param {string} [nativeURL] 
         */
        function exec(selectedOption, type, $node, nativeURL) {
            const currentName = $node.getAttribute('name');
            switch (selectedOption) {

                case 'delete':
                    remove();
                    break;

                case 'rename':
                    rename();
                    break;

                case 'copy':
                    copy();
                    break;

                case 'cut':
                    cut();
                    break;

                case 'paste':
                    paste();
                    break;

                case 'new file':
                case 'new folder':
                    create();
                    break;

                default:
                    break;
            }

            function remove() {
                if (!nativeURL) return;

                const msg = strings['delete {name}'].replace('{name}', currentName);
                dialogs.confirm(strings.warning.toUpperCase(), msg)
                    .then(() => {
                        fsOperation(nativeURL)
                            .then(fs => {
                                return fs.deleteFile();
                            }).then(() => {

                                if (type === 'dir') {

                                    removeFolder($node, nativeURL);

                                } else {

                                    const file = editorManager.getFile(nativeURL, "fileUri");
                                    if (file)
                                        editorManager.removeFile(file, true);

                                    $node.remove();
                                }

                                window.plugins.toast.showShortBottom(strings["file deleted"]);

                            }).catch(err => {

                                helpers.error(err);
                                console.error(err);

                            });

                    });
            }

            function rename() {

                dialogs.prompt(type === 'file' ? strings['enter file name'] : strings['enter folder name'], currentName, 'filename', {
                    required: true,
                    match: constants.FILE_NAME_REGEX
                }).then(newname => {

                    const checkId = (type === 'dir' ? nativeURL.slice(0, -1) : nativeURL).split('/').slice(0, -1).join('/') + '/' + newname;
                    window.resolveLocalFileSystemURL(checkId, exists, error);

                    function exists(entry) {
                        if (entry) alert(strings.error, helpers.getErrorMessage(12));
                    }

                    function error(err) {
                        if (err.code !== 1)
                            return alert(strings.error, helpers.getErrorMessage(err.code));

                        fsOperation(nativeURL)
                            .then(fs => {
                                return fs.renameTo(newname);
                            }).then((parent) => {
                                success();

                                let newid = decodeURI(parent.nativeURL) + newname;

                                if (type === 'file') {

                                    const editor = editorManager.getFile(nativeURL, "fileUrl");
                                    if (editor) editor.filename = newname;

                                    $node.replaceChild(tag('i', {
                                        className: helpers.getIconForFile(newname)
                                    }), $node.firstChild);

                                } else if (type === 'dir') {

                                    newid += '/';

                                    const files = editorManager.files;

                                    files.map(file => {
                                        if (file.location === nativeURL)
                                            editorManager.updateLocation(file, newid);
                                        return file;
                                    });

                                    $node.setAttribute('url', newid);

                                }

                                $node.setAttribute('name', newname);
                                $node.querySelector('.text').textContent = newname;
                            })
                            .catch(err => {
                                helpers.error(err);
                                console.error(err);
                            });
                    }

                });
            }

            function create() {
                const ask = selectedOption === 'new file' ? strings['enter file name'] : strings['enter folder name'];
                dialogs.prompt(ask, strings[selectedOption], 'filename', {
                    match: constants.FILE_NAME_REGEX,
                    required: true
                }).then(filename => {
                    const $ul = $node.nextElementSibling;
                    window.resolveLocalFileSystemURL(nativeURL, entry => {
                        if (selectedOption === 'new folder') {
                            fsOperation(nativeURL)
                                .then(fs => {
                                    return fs.createDirectory(filename);
                                })
                                .then(() => {
                                    window.resolveLocalFileSystemURL(nativeURL + filename, dirEntry => {
                                        successDir(dirEntry);
                                    }, err => {
                                        helpers.error(err);
                                        console.error(err);
                                    });
                                })
                                .catch(err => {
                                    helpers.error(err);
                                    console.error(err);
                                });

                        } else {
                            fsOperation(nativeURL)
                                .then(fs => {
                                    return fs.createFile(filename);
                                })
                                .then(res => {
                                    window.resolveLocalFileSystemURL(nativeURL + filename, fileEntry => {
                                        successFile(fileEntry);
                                    }, err => {
                                        console.error(err);
                                        helpers.error(err);
                                    });
                                })
                                .catch(err => {
                                    console.error(err);
                                    helpers.error(err);
                                });
                        }

                        function successDir(dirEntry) {
                            const $folder = createFolderTile(null, dirEntry, true);
                            appendFolder($node, $folder);
                            success();
                        }

                        function successFile(fileEntry) {
                            const $file = createFileTile(null, fileEntry);
                            $ul.appendChild($file);
                            success();
                        }
                    });
                });
            }

            function copy() {
                updateCut();
                fileClipBoard = {};
                fileClipBoard.type = $node.getAttribute('type');
                fileClipBoard.method = 'copy';
                fileClipBoard.nodeId = $node.id;
            }

            function cut() {
                updateCut();
                fileClipBoard = {};
                fileClipBoard.type = $node.getAttribute('type');
                fileClipBoard.method = 'cut';
                fileClipBoard.nodeId = $node.id;
                $node.classList.add('cut');
            }

            function paste() {
                if (!fileClipBoard) return;

                const $clipBoardNode = document.getElementById(fileClipBoard.nodeId);
                if (!$clipBoardNode) return;

                let src;
                let dest = nativeURL;
                let name = $clipBoardNode.getAttribute("name");
                if (fileClipBoard.type === 'dir') {
                    src = $clipBoardNode.getAttribute('url');
                } else {
                    const location = $clipBoardNode.parentElement.previousElementSibling.getAttribute('url');
                    const name = $clipBoardNode.getAttribute('name');
                    src = location + name;
                }

                fsOperation(src)
                    .then(fs => {
                        if (fileClipBoard.method === 'copy') {
                            return fs.copyTo(dest);
                        } else {
                            return fs.moveTo(dest);
                        }
                    })
                    .then(() => {

                        window.resolveLocalFileSystemURL(dest + name, res => {

                            if (res.isFile) {
                                if (fileClipBoard.method === "cut") {
                                    let editor = editorManager.getFile(src, "fileUri");
                                    if (editor) editorManager.removeFile(editor, true);
                                    $clipBoardNode.remove();
                                }
                                const $file = createFileTile(null, res);
                                $node.nextElementSibling.appendChild($file);
                                success();
                            } else {
                                if (fileClipBoard.method === "cut") $clipBoardNode.parentElement.remove();
                                const $folder = createFolderTile(null, res);
                                appendFolder($node, $folder);
                                success();
                            }

                        }, err => {
                            helpers.error(err);
                            console.error(err);
                        });

                    })
                    .catch(err => {
                        helpers.error(err);
                        console.error(err);
                    });

            }

            function success() {
                window.plugins.toast.showShortBottom(strings.success);
            }

            function updateCut() {
                if (fileClipBoard) {
                    let el = document.getElementById(fileClipBoard.uri);
                    if (el) el.classList.remove('cut');
                }
            }

            /**
             * 
             * @param {HTMLElement} $node 
             * @param {HTMLElement} $folder 
             */
            function appendFolder($node, $folder) {
                const $ul = $node.nextElementSibling;
                const $firstFile = $ul.querySelector(':scope>[type=file]');

                if ($firstFile) $ul.insertBefore($folder, $firstFile);
                else $ul.appendChild($folder);
            }

            /**
             * 
             * @param {HTMLDivElement} $node 
             * @param {string} nativeURL 
             */
            function removeFolder($node, nativeURL) {

                const children = [...$node.nextElementSibling.children];

                children.map($child => {
                    const isDir = $child.classList.contains('list');

                    if (isDir) {

                        const $folder = $child.firstElementChild;
                        const url = $folder.getAttribute('url');
                        removeFolder($folder, url);

                    } else {

                        const name = $child.getAttribute('name');
                        const uri = nativeURL + name;

                        const file = editorManager.getFile(uri, "fileUri");
                        if (file) editorManager.removeFile(file);

                    }

                });

                $node.parentElement.remove();
            }
        }

        /**
         * 
         * @param {MouseEvent} e
         * @this HTMLElement 
         */
        function handleClick(e) {

            /**
             * @type {HTMLElement}
             */
            const $node = e.target;
            const action = $node.getAttribute('action');

            if (action === 'open') {

                const type = $node.getAttribute('type');

                if (type === 'file') {
                    const name = $node.getAttribute('name');
                    const url = $node.parentElement.previousElementSibling.getAttribute('url');
                    const nativeURL = url + name;

                    if (appSettings.defaultSettings.filesNotAllowed.includes(helpers.getExt(name))) {
                        return alert(strings.notice, `'${helpers.getExt(name)}' ${strings['file is not supported']}`);
                    }
                    createEditorFromURI(nativeURL).then(() => {
                        sidebar.hide();
                    });
                }

            } else if (action === 'close') {

                remove();

            }
        }

        /**
         * 
         * @param {MouseEvent} e
         * @this HTMLElement 
         */
        function handleContextMenu(e) {

            if (e.cancelable)
                e.preventDefault();

            const $node = e.target;
            const type = $node.getAttribute('type');
            const name = $node.getAttribute('name');
            const clipBoardEnabled = fileClipBoard && document.getElementById(fileClipBoard.nodeId);

            const COPY = ['copy', strings.copy, 'copy'],
                CUT = ['cut', strings.cut, 'cut'],
                REMOVE = ['delete', strings.delete, 'delete'],
                RENAME = ['rename', strings.rename, 'edit'],
                PASTE = ['paste', strings.paste, 'paste', !!clipBoardEnabled],
                NEW_FILE = ['new file', strings['new file'], 'document-add'],
                NEW_FOLDER = ['new folder', strings['new folder'], 'folder-add'],
                RELOAD = ['reload', strings.reload, 'refresh'];

            navigator.vibrate(50);

            if (type === 'file') {

                const url = $node.parentElement.previousElementSibling.getAttribute('url');
                const nativeURL = url + name;

                dialogs.select(name, [
                    COPY,
                    CUT,
                    RENAME,
                    REMOVE
                ]).then(res => {

                    exec(res, 'file', $node, nativeURL);

                });

            } else if (type === 'dir') {

                const url = $node.getAttribute('url');

                dialogs.select(name, [
                    COPY,
                    CUT,
                    NEW_FOLDER,
                    NEW_FILE,
                    PASTE,
                    RENAME,
                    REMOVE
                ]).then(res => {

                    exec(res, 'dir', $node, url);

                });
            } else if (type === 'root') {

                dialogs.select(name, [
                    NEW_FOLDER,
                    NEW_FILE,
                    PASTE,
                    RELOAD
                ]).then(res => {
                    if (res === 'reload') {
                        plotFolder(rootUrl, rootNode);
                        return;
                    }
                    exec(res, 'dir', $node, rootUrl);
                });
            }
        }

        function remove() {
            if (rootNode.parentElement) {
                sidebar.removeChild(rootNode);
                rootNode = null;
            }
            const tmpFolders = {};
            for (let url in addedFolder) {
                if (url !== rootUrl) tmpFolders[url] = addedFolder[url];
            }
            addedFolder = tmpFolders;
        }

    });
}