//#region Imports
import {
    tag,
    toggleSwitch
} from 'html-element-js';
import Page from '../components/page';
import fs from '../modules/androidFileSystem';
import tile from '../components/tile';
import helpers from '../modules/helpers';
import contextMenu from '../components/contextMenu';
import dialogs from '../components/dialogs';
import constants from "../constants";
//#endregion
/**
 * 
 * @param {string} [type='file'] values ['file', 'dir']
 * @param {string|function(string):boolean} option 
 */
function FileBrowser(type = 'file', option = null) {
    const actionStack = window.actionStack;
    const prompt = dialogs.prompt;
    return new Promise((resolve, reject) => {
        //#region Declaration
        const menuToggler = tag('i', {
            className: 'icon more_vert'
        });
        const page = Page('File Browser', {
            tail: menuToggler
        });
        const fileList = tag('ul', {
            className: 'main dir-list',
            attr: {
                "data-empty-folder": strings['empty folder message']
            }
        });
        const actionsToDispose = [];
        const fbMenu = contextMenu({
            top: '8px',
            right: '8px',
            toggle: menuToggler,
            transformOrigin: 'top right'
        });
        const menuOptions = {
            'showHiddenFiles': toggleSwitch({
                valType: "on/off",
                size: 20,
                onchange: function () {
                    appSettings.value.fileBrowser.showHiddenFiles = this.value;
                    appSettings.update();
                    refresh();
                },
                value: appSettings.value.fileBrowser.showHiddenFiles
            }),
            'sortByName': toggleSwitch({
                valType: "on/off",
                size: 20,
                onchange: function () {
                    appSettings.value.fileBrowser.sortByName = this.value;
                    appSettings.update();
                    refresh();
                },
                value: appSettings.value.fileBrowser.sortByName
            })
        };
        const root = 'file:///storage/';
        let parent = null;
        let cachedDir = {};
        let currentDir = {
            url: root,
            name: 'File browser',
            readOnly: false
        };
        let folderOption;
        //#endregion

        actionStack.push({
            id: 'filebrowser',
            action: function () {
                reject({
                    error: 'user canceled',
                    code: 0
                });
                page.hide();
            }
        });
        fbMenu.append(...[
            tile({
                text: strings['show hidden files'],
                tail: menuOptions.showHiddenFiles
            }),
            tile({
                text: strings['sort by name'],
                tail: menuOptions.sortByName
            })
        ]);
        page.onhide = function () {
            let id = '';
            while ((id = actionsToDispose.pop())) {
                actionStack.remove(id);
            }
            actionStack.remove('filebrowser');
        };

        page.append(fileList);

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

            page.classList.add('bottom-bar');
            page.append(folderOption);

            openFolder.onclick = () => {
                page.hide();
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
                        canWrite: card.canWrite,
                        nativeURL: card.filePath + '/',
                        isDirectory: true,
                        parent: true
                    });
                });

                list.push({
                    canWrite: true,
                    nativeURL: cordova.file.externalRootDirectory,
                    name: 'Internal storage',
                    isDirectory: true,
                    parent: true
                });

                cachedDir[root] = {
                    name,
                    list
                };
                list.map(dir => plotList(dir, root));
                document.body.append(page);

                if (type === 'folder') {
                    folderOption.classList.add('disabled');
                }
            } else {
                loadDir(cordova.file.externalRootDirectory).then(() => {
                    document.body.append(page);
                });

            }
        });

        function loadDir(path = root, name = 'File Browser') {
            return new Promise((resolve) => {
                fileList.textContent = '';
                fileList.classList.remove('empty');
                currentDir.url = path;
                currentDir.name = name;
                page.scrollTop = 0;

                if (type === 'folder')
                    if (path === root) {
                        folderOption.classList.add('disabled');
                    } else {
                        folderOption.classList.remove('disabled');
                    }

                if (parent && (path === root)) {
                    parent = null;
                }

                if (path in cachedDir) {
                    const item = cachedDir[path];
                    item.list.map(item => plotList(item, path));
                    page.scrollTop = item.scroll;
                    name = item.name;
                } else {
                    fs.listDir(path)
                        .then(list => {
                            list = helpers.sortDir(list, appSettings.value.fileBrowser);
                            if (list.length === 0)
                                return fileList.classList.add('empty');

                            cachedDir[path] = {
                                name,
                                list
                            };
                            list.map(item => plotList(item, path));
                            resolve();
                        });
                }
                page.settitle(name + ((parent && parent && !parent.canWrite) ? ' (read only)' : ''));
            });
        }

        /**
         * 
         * @param {FileEntry} item 
         */
        function plotList(item, path) {
            const listItem = tile({
                text: item.name,
                lead: tag('span', {
                    className: `${item.isFile? helpers.getIconForFile(item.name) : 'icon folder'}`,
                    style: {
                        height: '40px',
                        width: '40px',
                        backgroundSize: '33px',
                        backgroundPosition: '4px center'
                    }
                })
            });

            if (item.isDirectory) {
                if (item.canWrite !== false || type === 'file') {
                    listItem.addEventListener('click', function () {
                        if (item.parent) {
                            parent = item;
                        }
                        cachedDir[path].scroll = page.scrollTop;
                        actionsToDispose.push(path);
                        actionStack.push({
                            id: path,
                            action: function () {
                                actionsToDispose.pop();
                                loadDir(path);
                            }
                        });
                        loadDir(item.nativeURL, item.name);
                    });
                } else {
                    listItem.appendText(' (read only)');
                    listItem.style.opacity = '0.5';
                    listItem.style.pointerEvents = 'none';
                }
            } else if (type === 'file') {
                listItem.addEventListener('click', function () {
                    if (typeof option === 'function' && option(item.nativeURL)) {
                        page.hide();
                        resolve({
                            url: item.nativeURL,
                            readOnly: parent && !parent.canWrite
                        });
                    }
                });
            } else {
                listItem.style.opacity = '0.5';
                listItem.style.pointerEvents = 'none';
            }

            fileList.append(listItem);
        }

        function refresh() {
            cachedDir = {};
            loadDir(currentDir.url, currentDir.name);
        }
    });
}

export default FileBrowser;