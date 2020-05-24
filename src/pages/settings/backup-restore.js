import Page from "../../components/page";
import tag from 'html-tag-js';
import gen from "../../components/gen";
import internalFs from "../../lib/fileSystem/internalFs";
import helpers from "../../lib/utils/helpers";
import dialogs from "../../components/dialogs";
import fsOperation from "../../lib/fileSystem/fsOperation";
import constants from "../../lib/constants";

export default function backupRestore() {
    const rootDir = cordova.file.externalRootDirectory;
    const backupFile = constants.BACKUP_FILE;
    const page = Page(strings.backup.capitalize() + '/' + strings.restore.capitalize());
    const settingsList = tag('div', {
        className: 'main list'
    });

    actionStack.push({
        id: 'backup-restore',
        action: page.hide
    });
    page.onhide = function () {
        actionStack.remove('backup-restore');
    };

    const values = appSettings.value.search;

    const settingsOptions = [{
            key: 'backup',
            text: strings.backup.capitalize(),
            icon: 'file_downloadget_app'
        },
        {
            key: 'restore',
            text: strings.restore.capitalize(),
            icon: 'historyrestore'
        }
    ];

    gen.listItems(settingsList, settingsOptions, changeSetting);

    function changeSetting() {

        switch (this.key) {
            case 'backup':
                backup();
                break;

            case 'restore':
                restore();
                break;

            default:
                break;
        }
    }

    function backup() {

        const settings = appSettings.value;
        const keyBindings = window.customKeyBindings;
        const ftpaccounts = JSON.parse(localStorage.ftpaccounts || '[]');
        const modes = JSON.parse(localStorage.modeassoc || '{}');

        const backupString = JSON.stringify({
            settings,
            keyBindings,
            ftpaccounts,
            modes
        });
        const encrypted = helpers.credentials.encrypt(backupString);

        window.resolveLocalFileSystemURL(rootDir, fs => {
            fs.getDirectory('backups', {
                create: true
            }, fs => {

                fs.getDirectory('Acode', {
                    create: true
                }, fs => {

                    internalFs.writeFile(rootDir + backupFile, encrypted, true, false)
                        .then(() => {
                            dialogs.alert(
                                strings.success.toUpperCase(),
                                `${strings['backup successful']}\n${backupFile}.`
                            );
                        })
                        .catch(helpers.error);

                }, helpers.error);

            }, helpers.error);
        });
    }

    function restore() {

        SDcard.openDoc(data => {
            backupRestore.restore(data.uri);
        }, helpers.error, "application/octet-stream");

    }

    page.appendChild(settingsList);
    document.body.append(page);
}

backupRestore.restore = function (url) {
    fsOperation(url)
        .then(fs => {
            return fs.readFile('utf8');
        })
        .then(backup => {
            try {
                backup = helpers.credentials.decrypt(backup);
                backup = JSON.parse(backup);


                fsOperation(window.KEYBINDING_FILE)
                    .then(fs => {
                        return fs.writeFile(JSON.stringify(backup.keyBindings));
                    })
                    .then(() => {
                        localStorage.modeassoc = JSON.stringify(backup.modes || {});
                        localStorage.ftpaccounts = JSON.stringify(backup.ftpaccounts);
                        return internalFs.writeFile(appSettings.settingsFile, JSON.stringify(backup.settings), true, false);
                    })
                    .then(() => {
                        location.reload();
                    })
                    .catch(helpers.error);

            } catch (error) {
                dialogs.alert(strings.error.toUpperCase(), strings['invalid backup file']);
            }
        })
        .catch(helpers.error);
};