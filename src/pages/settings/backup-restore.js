import Page from '../../components/page';
import tag from 'html-tag-js';
import gen from '../../components/gen';
import helpers from '../../lib/utils/helpers';
import dialogs from '../../components/dialogs';
import fsOperation from '../../lib/fileSystem/fsOperation';
import URLParse from 'url-parse';
import Url from '../../lib/utils/Url';

function backupRestore() {
  const rootDir = cordova.file.externalRootDirectory;
  const backupFile = Url.join(rootDir, backupRestore.BACKUP_FILE);
  const $page = Page(
    strings.backup.capitalize() + '/' + strings.restore.capitalize()
  );
  const settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'backup-restore',
    action: $page.hide,
  });
  $page.onhide = function () {
    actionStack.remove('backup-restore');
  };

  const settingsOptions = [
    {
      key: 'backup',
      text: strings.backup.capitalize(),
      icon: 'file_downloadget_app',
    },
    {
      key: 'restore',
      text: strings.restore.capitalize(),
      icon: 'historyrestore',
    },
  ];

  gen.listItems(settingsList, settingsOptions, changeSetting);

  $page.appendChild(settingsList);
  document.body.append($page);

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

  async function backup() {
    try {
      const settings = appSettings.value;
      const keyBindings = window.customKeyBindings;
      const storageList = JSON.parse(localStorage.storageList || '[]').filter(
        (s) => /s?ftp/.test(s.storageType)
      );

      const backupDir = Url.join(rootDir, 'Backups');
      const appBackupDir = Url.join(backupDir, 'Acode');
      const backupDirFS = await fsOperation(backupDir);
      const appBackupDirFS = await fsOperation(appBackupDir);
      const rootDirFS = await fsOperation(rootDir);

      if (!(await backupDirFS.exists())) {
        await rootDirFS.createDirectory('Backups');
      }

      if (!(await appBackupDirFS.exists())) {
        await backupDirFS.createDirectory('Acode');
      }

      for (let storage of storageList) {
        const url = URLParse(storage.uri, true);
        const keyFile = decodeURIComponent(url.query['keyFile'] || '');
        const passPhrase = decodeURIComponent(url.query['passPhrase'] || '');
        const filename = Url.basename(keyFile);
        const newKeyFile = Url.join(appBackupDir, filename);
        if (keyFile && keyFile !== newKeyFile) {
          const newKeyFileFs = await fsOperation(newKeyFile);

          if (await newKeyFileFs.exists()) {
            await newKeyFileFs.deleteFile();
          }

          const fs = await fsOperation(keyFile);
          await fs.copyTo(appBackupDir);
          url.set('query', {
            keyFile: newKeyFile,
            passPhrase,
          });
          storage.uri = url.toString(true);
        }
      }

      const backupString = JSON.stringify({
        settings,
        keyBindings,
        storageList,
      });

      const encrypted = helpers.credentials.encrypt(backupString);

      const backupFileFS = await fsOperation(backupFile);

      if (!(await backupFileFS.exists())) {
        await appBackupDirFS.createFile('backup');
      }

      await backupFileFS.writeFile(encrypted);

      dialogs.alert(
        strings.success.toUpperCase(),
        `${strings['backup successful']}\n${backupRestore.BACKUP_FILE}.`
      );
    } catch (error) {
      console.error(error);
      helpers.error(error);
    }
  }

  function restore() {
    sdcard.openDocumentFile(
      (data) => {
        backupRestore.restore(data.uri);
      },
      helpers.error,
      'application/octet-stream'
    );
  }
}

backupRestore.restore = async function (url) {
  try {
    let fs = await fsOperation(url);
    let backup = await fs.readFile('utf8');

    try {
      backup = helpers.credentials.decrypt(backup);
      backup = JSON.parse(backup);
    } catch (error) {
      dialogs.alert(
        strings.error.toUpperCase(),
        strings['invalid backup file']
      );
    }

    fs = await fsOperation(window.KEYBINDING_FILE);
    await fs.writeFile(JSON.stringify(backup.keyBindings, undefined, 2));

    const { settings, storageList } = backup;
    const storedStorageList = JSON.parse(localStorage.storageList || '[]');
    storedStorageList.push(...storageList);
    localStorage.storageList = JSON.stringify(storedStorageList);

    const settingsDir = Url.dirname(appSettings.settingsFile);
    const settingsFileFS = await fsOperation(settingsDir);
    fs = await fsOperation(appSettings.settingsFile);

    if (!(await fs.exists())) {
      await settingsFileFS.createFile(Url.basename(appSettings.settingsFile));
    }

    await fs.writeFile(JSON.stringify(settings, undefined, 2));
    location.reload();
  } catch (error) {
    helpers.error(error);
  }
};

backupRestore.BACKUP_FILE = 'Backups/Acode/backup';

export default backupRestore;
