//#region Imports
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import fs from '../../modules/utils/internalFs';
import helpers from '../../modules/helpers';
import contextMenu from '../../components/contextMenu';
import dialogs from '../../components/dialogs';
import constants from "../../constants";
import filesSettings from '../settings/filesSettings';

import _template from './fileBrowser.hbs';
import _list from './list.hbs';
import './fileBrowser.scss';
import externalFs from '../../modules/utils/externalFs';
import fsOperation from '../../modules/utils/fsOperation';
import createEditorFromURI from '../../modules/createEditorFromURI';
import SearchBar from '../../components/searchbar';
//#endregion
/**
 * 
 * @param {string} [type='file'] values ['file', 'dir']
 * @param {string|function(string):boolean} option button text or function to check extension
 */
function FileBrowser(type = 'file', option = null) {
    const actionStack = window.actionStack;
    const prompt = dialogs.prompt;
    return new Promise((resolve, reject) => {
        //#region Declaration
        const $menuToggler = tag('i', {
            className: 'icon more_vert',
            attr: {
                action: 'toggle-menu'
            }
        });
        const $search = tag('i', {
            className: 'icon search',
            attr: {
                action: 'search'
            }
        });
        const $page = Page('File Browser');
        const $content = tag.parse(mustache.render(_template, {
            type
        }));
        const $navigation = $content.querySelector('.navigation');
        const actionsToDispose = [];
        const $fbMenu = contextMenu(`<li action="settings">${strings.settings}</li>`, {
            top: '8px',
            right: '8px',
            toggle: $menuToggler,
            transformOrigin: 'top right'
        });
        const root = 'file:///storage/';
        let cachedDir = {};
        let currentDir = {
            url: root,
            name: 'File browser'
        };
        let folderOption;
        //#endregion

        $content.addEventListener('click', handleClick);
        $content.addEventListener('contextmenu', handleContentMenu);
        $page.append($content);
        $page.querySelector('header').append($search, $menuToggler);
        document.body.append($page);

        actionStack.push({
            id: 'filebrowser',
            action: function () {
                reject({
                    error: 'user canceled',
                    code: 0
                });
                $page.hide();
            }
        });

        $fbMenu.onclick = function (e) {
            $fbMenu.hide();
            const action = e.target.getAttribute('action');
            if (action && action === 'settings') {
                filesSettings(refresh);
            }
        };

        $search.onclick = function () {
            const $list = $content.get("#list");
            if ($list) SearchBar($list);
        };

        $page.onhide = function () {
            let id = '';
            while ((id = actionsToDispose.pop())) {
                actionStack.remove(id);
            }
            actionStack.remove('filebrowser');
            $content.removeEventListener('click', handleClick);
            $content.removeEventListener('contextmenu', handleContentMenu);
        };

        if (type === 'folder') {
            const createFolder = tag('button', {
                textContent: strings['new folder']
            });
            const openFolder = tag('button', {
                textContent: option || strings['select folder']
            });
            folderOption = tag('footer', {
                className: 'button-container',
                children: [
                    createFolder,
                    openFolder
                ]
            });

            $page.classList.add('bottom-bar');
            $page.append(folderOption);

            openFolder.onclick = () => {
                $page.hide();
                resolve(currentDir);
            };

            createFolder.onclick = () => {
                const {
                    url,
                    name
                } = currentDir;

                prompt(strings['enter folder name'], strings['new folder'], 'filename', {
                    match: constants.FILE_NAME_REGEX,
                    required: true
                }).then(dirname => {
                    if (!dirname) return;
                    dirname = helpers.removeLineBreaks(dirname);

                    fsOperation(url)
                        .then(fs => {
                            return fs.createDirectory(dirname);
                        })
                        .then(() => {
                            updateAddedFolder(url);
                            window.plugins.toast.showLongBottom(strings.success);
                            loadDir(url, name);
                        }).catch(e => {
                            console.log(e);
                            helpers.error(e);
                        });
                });
            };
        }

        const version = parseInt(device.version);
        if (version < 7) {
            genList();
        } else {
            externalFs.listExternalStorages()
                .then(res => {
                    genList(res);
                });
        }

        function genList(res) {
            cordova.plugins.diagnostic.getExternalSdCardDetails(ls => {
                const list = [];
                if (ls.length > 0) {
                    ls.map(card => {
                        const name = card.path.split('/').splice(-1)[0];
                        const path = card.filePath + '/';
                        if (name === "files") return card;
                        list.push({
                            name: res && res[name] ? res[name] : name,
                            nativeURL: path,
                            origin: path,
                            isDirectory: true,
                            parent: true,
                            type: 'folder'
                        });
                        return card;
                    });
                }

                const path = cordova.file.externalRootDirectory;
                list.push({
                    nativeURL: path,
                    name: 'Internal storage',
                    isDirectory: true,
                    parent: true,
                    type: 'folder',
                });

                if (type === "file") {
                    list.push({
                        name: "Select document",
                        isDirectory: true,
                        type: 'folder',
                        "open-doc": true
                    });
                }

                cachedDir[root] = {
                    name,
                    list
                };

                navigate('/', root);
                render(list);

                if (type === 'folder') {
                    folderOption.classList.add('disabled');
                }
            });
        }

        function loadDir(path = root, name = 'File Browser') {

            let url = path;

            if (typeof path === 'object') {
                url = path.url;
                name = path.name;
            }

            if (url in cachedDir) {
                update();
                const item = cachedDir[url];
                render(item.list);
                const $list = tag.get('#list');
                $list.scrollTop = item.scroll;
                name = item.name;
            } else {
                fs.listDir(url)
                    .then(list => {
                        update();
                        list = helpers.sortDir(list,
                            appSettings.value.fileBrowser
                        );
                        cachedDir[url] = {
                            name,
                            list
                        };
                        render(list);
                    })
                    .catch(err => {
                        actionStack.remove(currentDir.url);
                        helpers.error(err);
                        console.log(err);
                    });
            }

            function update() {
                if (type === 'folder')
                    if (url === root) {
                        folderOption.classList.add('disabled');
                    } else {
                        folderOption.classList.remove('disabled');
                    }

                currentDir.url = url;
                currentDir.name = name;
                const $list = tag.get('#list');
                if ($list) $list.scrollTop = 0;
                navigate(name, url);
                $page.settitle(name);
            }
        }

        /**
         * 
         * @param {MouseEvent} e 
         * @param {"contextmenu"} [contextMenu] 
         */
        function handleClick(e, contextMenu) {
            /**
             * @type {HTMLElement}
             */
            const $el = e.target;
            let action = $el.getAttribute('action');
            if (!action) return;

            const url = $el.getAttribute('url');
            const name = $el.getAttribute('name');
            const opendoc = $el.getAttribute('open-doc');

            if (opendoc) action = "open-doc";

            switch (action) {
                case 'navigation':
                case 'folder':
                    folder();
                    break;
                case 'file':
                    file();
                    break;
                case "open-doc":
                    openDoc();
                    break;
            }

            function folder() {
                if (contextMenu !== 'contextmenu') {
                    const currentUrl = currentDir.url;
                    const dir = JSON.parse(JSON.stringify(currentDir));
                    cachedDir[currentUrl].scroll = tag.get('#list').scrollTop;
                    actionsToDispose.push(currentUrl);
                    actionStack.push({
                        id: currentUrl,
                        action: function () {
                            actionsToDispose.pop();
                            loadDir(dir);
                            if (action === 'folder') {
                                const $nav = $navigation.lastChild;
                                if ($nav) $nav.remove();
                            }
                        }
                    });
                    loadDir(url, name);
                } else {
                    cmhandle();
                }
            }

            function file() {
                if (contextMenu !== "contextmenu") {
                    if (typeof option === 'function' && option(name)) {
                        $page.hide();
                        resolve({
                            url
                        });
                    }
                } else {
                    cmhandle();
                }
            }

            function cmhandle() {
                navigator.vibrate(50);
                dialogs.select('', [
                        ['delete', strings.delete, 'delete']
                    ])
                    .then(res => {

                        switch (res) {
                            case 'delete':
                                remove();
                                break;
                        }

                    });
            }

            function remove() {
                fsOperation(url)
                    .then(fs => {
                        return fs.deleteFile();
                    })
                    .then(() => {
                        updateAddedFolder(url);
                        window.plugins.toast.showShortBottom(strings.success);
                        loadDir(currentDir);
                    })
                    .catch(err => {
                        console.log(err);
                        helpers.error(err);
                    });
            }

            function openDoc() {
                SDcard.openDoc(res => {
                    res.isContentUri = true;
                    res.url = res.uri;
                    resolve(res);
                    $page.hide();

                }, err => {
                    helpers.error(err);
                    console.error(err);
                });
            }
        }

        function handleContentMenu(e) {
            handleClick(e, 'contextmenu');
        }

        function refresh() {
            cachedDir = {};
            loadDir(currentDir.url, currentDir.name);
        }

        function render(list) {
            const $list = tag.parse(mustache.render(_list, {
                msg: strings['empty folder message'],
                list
            }));

            const $oldList = $content.querySelector('#list');
            if ($oldList) $oldList.remove();
            $content.append($list);
            $list.focus();
        }

        function navigate(name, url) {
            let $nav = $navigation.querySelector(`[url="${url}"]`);
            const $old = $navigation.querySelector('.active');
            if ($old) $old.classList.remove('active');
            if ($nav) return $nav.classList.add('active');

            $nav = tag('span', {
                className: 'nav active',
                attr: {
                    action: 'navigation',
                    url,
                    text: name,
                    name
                },
                tabIndex: -1
            });

            $navigation.append($nav);
            $navigation.scrollLeft = $navigation.scrollWidth;
        }

        function updateAddedFolder(url) {
            if (cachedDir[url]) delete cachedDir[url];
            if (cachedDir[currentDir.url]) delete cachedDir[currentDir.url];
            for (let key in addedFolder) {
                if (key === url) {
                    addedFolder[key].remove();
                } else if (new RegExp(key).test(currentDir.url)) {
                    addedFolder[key].reload();
                }
            }
        }
    });
}

export default FileBrowser;