//#region Imports
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import fs from '../../modules/utils/androidFileSystem';
import helpers from '../../modules/helpers';
import contextMenu from '../../components/contextMenu';
import dialogs from '../../components/dialogs';
import constants from "../../constants";
import filesSettings from '../settings/filesSettings';

import _template from './fileBrowser.hbs';
import _list from './list.hbs';
import './fileBrowser.scss';
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
            className: 'icon more_vert'
        });
        const $search = tag('i', {
            className: 'icon search hidden'
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
            name: 'File browser',
            readOnly: false
        };
        let folderOption;
        //#endregion

        $content.addEventListener('click', handleClick);
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

        $page.onhide = function () {
            let id = '';
            while ((id = actionsToDispose.pop())) {
                actionStack.remove(id);
            }
            actionStack.remove('filebrowser');
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
                prompt(strings['enter folder name'], strings['new folder'], 'filename', {
                        match: constants.FILE_NAME_REGEX,
                        required: true
                    }).then(dirname => {
                        if (!dirname) return;
                        dirname = helpers.removeLineBreaks(dirname);
                        const {
                            url,
                            name
                        } = currentDir;
                        fs.createDir(url, dirname).then(() => {
                            if (cachedDir[url]) delete cachedDir[url];
                            for (let key in addedFolder) {
                                if (new RegExp(key).test(currentDir.url)) {
                                    addedFolder[key].reload();
                                }
                            }
                            loadDir(url, name);
                        }).catch(err => {
                            if (err.code) {
                                alert(strings.error.toUpperCase(), `${strings['create folder error']} ` + helpers.getErrorMessage(err.code));
                            } else {
                                alert(strings.error.toUpperCase(), strings['create folder error']);
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            };
        }

        cordova.plugins.diagnostic.getExternalSdCardDetails(ls => {
            if (ls.length > 0) {
                const list = [];
                ls.map(card => {
                    const name = card.path.match('com.foxdebug.acode/files') ? 'Aplication Storage' : card.path.split('/').splice(-1)[0];
                    list.push({
                        name,
                        readOnly: !card.canWrite,
                        nativeURL: card.filePath + '/',
                        isDirectory: true,
                        parent: true,
                        type: 'folder'
                    });
                });

                list.push({
                    readOnly: false,
                    nativeURL: cordova.file.externalRootDirectory,
                    name: 'Internal storage',
                    isDirectory: true,
                    parent: true,
                    type: 'folder'
                });

                cachedDir[root] = {
                    name,
                    list
                };

                navigate('/', root);
                render(list);

                if (type === 'folder') {
                    folderOption.classList.add('disabled');
                }
            } else {
                loadDir(cordova.file.externalRootDirectory);
            }
        });

        function loadDir(path = root, name = 'File Browser', readOnly = false) {
            if (path in cachedDir) {
                update();
                const item = cachedDir[path];
                render(item.list);
                const $list = tag.get('#list');
                $list.scrollTop = item.scroll;
                name = item.name;
            } else {
                fs.listDir(path)
                    .then(list => {
                        update();
                        list = helpers.sortDir(list, appSettings.value.fileBrowser, readOnly);
                        cachedDir[path] = {
                            name,
                            list
                        };
                        render(list);
                    })
                    .catch(err => {
                        actionStack.remove(currentDir.url);
                        if (err.code) console.log(helpers.getErrorMessage(err.code));
                    });
            }

            function update() {
                if (type === 'folder')
                    if (path === root) {
                        folderOption.classList.add('disabled');
                    } else {
                        folderOption.classList.remove('disabled');
                    }

                currentDir.url = path;
                currentDir.name = name;
                const $list = tag.get('#list');
                if ($list) $list.scrollTop = 0;
                navigate(name, path);
                $page.settitle(name + (readOnly ? ' (read only)' : ''));
            }
        }

        /**
         * 
         * @param {MouseEvent} e 
         */
        function handleClick(e) {
            /**
             * @type {HTMLElement}
             */
            const $el = e.target;
            const action = $el.getAttribute('action');
            if (!action) return;

            const url = $el.getAttribute('url');
            const readOnly = !!$el.getAttribute('read-only');
            const name = $el.getAttribute('name');
            switch (action) {
                case 'navigation':
                case 'folder':
                    folder();
                    break;
                case 'file':
                    file();
                    break;
            }

            function folder() {
                const currentUrl = currentDir.url;
                cachedDir[currentUrl].scroll = tag.get('#list').scrollTop;
                actionsToDispose.push(currentUrl);
                actionStack.push({
                    id: currentUrl,
                    action: function () {
                        actionsToDispose.pop();
                        loadDir(currentUrl, currentDir.name);
                        if (action === 'folder') {
                            const $nav = $navigation.lastChild;
                            if ($nav) $nav.remove();
                        }
                    }
                });
                loadDir(url, name, readOnly);
            }

            function file() {
                if (typeof option === 'function' && option(name)) {
                    $page.hide();
                    resolve({
                        url,
                        readOnly
                    });
                }
            }
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
    });
}

export default FileBrowser;