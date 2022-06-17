import Page from '../../components/page';
import tag from 'html-tag-js';
import gen from '../../components/gen';
import helpers from '../../lib/utils/helpers';
import dialogs from '../../components/dialogs';
import fsOperation from '../../lib/fileSystem/fsOperation';
import URLParse from 'url-parse';
import Url from '../../lib/utils/Url';
import FileBrowser from '../fileBrowser/fileBrowser';
import Uri from '../../lib/utils/Uri';

function backupRestore() {
  const $page = Page(
    strings.backup.capitalize() + '/' + strings.restore.capitalize(),
  );
  const settingsList = tag('div', {
    className: 'main list',
  });

  actionStack.push({
    id: 'backup-restore',
    action: $page.hide,
  });
  $page.onhide = function () {
    helpers.hideAd();
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
  app.append($page);
  helpers.showAd();

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
      const keyBindings = await fsOperation(KEYBINDING_FILE).readFile('json');
      const storageList = JSON.parse(localStorage.storageList || '[]').filter(
        (s) => /s?ftp/.test(s.storageType),
      );

      const backupStorage = (
        await FileBrowser(
          'folder', //
          strings['select folder'],
        )
      ).url;

      const backupFilename = 'Acode.backup';
      const backupDirname = 'Backup';
      const backupDir = Url.join(backupStorage, backupDirname);
      const backupFile = Url.join(backupDir, backupFilename);
      const backupStorageFS = fsOperation(backupStorage);
      const backupDirFS = fsOperation(backupDir);
      const backupFileFS = fsOperation(backupFile);

      if (!(await backupDirFS.exists())) {
        await backupStorageFS.createDirectory(backupDirname);
      }

      if (!(await backupFileFS.exists())) {
        await backupDirFS.createFile(backupFilename);
      }

      for (let storage of storageList) {
        const url = URLParse(storage.uri, true);
        const keyFile = decodeURIComponent(url.query['keyFile'] || '');
        if (keyFile) {
          const srcFs = fsOperation(keyFile);
          storage.keyFileData = await srcFs.readFile('utf-8');
        }
      }

      const backupString = JSON.stringify({
        settings,
        keyBindings,
        storageList,
      });

      await backupFileFS.writeFile(backupString);

      dialogs.alert(
        strings.success.toUpperCase(),
        `${strings['backup successful']}\n${Uri.getVirtualAddress(
          backupFile,
        )}.`,
      );
    } catch (error) {
      console.error(error);
      helpers.toast(error);
    }
  }

  function restore() {
    sdcard.openDocumentFile(
      (data) => {
        backupRestore.restore(data.uri);
      },
      helpers.toast,
      'application/octet-stream',
    );
  }
}

backupRestore.restore = async function (url) {
  try {
    let fs = fsOperation(url);
    let backup = await fs.readFile('utf8');

    try {
      backup = JSON.parse(backup);
    } catch (error) {
      dialogs.alert(
        strings.error.toUpperCase(),
        strings['invalid backup file'],
      );
    }

    try {
      fs = fsOperation(window.KEYBINDING_FILE);
      await fs.writeFile(JSON.stringify(backup.keyBindings, undefined, 2));
    } catch (error) { }

    const { settings, storageList } = backup;
    const storedStorageList = JSON.parse(localStorage.storageList || '[]');
    for (let storage of storageList) {
      if (!storedStorageList.find((st) => st.uuid === storage.uuid)) {
        if ('keyFileData' in storage) {
          const keyFileData = storage.keyFileData;
          delete storage.keyFileData;

          const url = URLParse(storage.uri, true);
          const { passPhrase, keyFile } = url.query;
          const filename = Url.basename(decodeURIComponent(keyFile));
          const newKeyFile = Url.join(DATA_STORAGE, filename);

          const fs = fsOperation(newKeyFile);
          if (!(await fs.exists())) {
            const dirFs = fsOperation(DATA_STORAGE);
            await dirFs.createFile(filename);
          }
          await fs.writeFile(keyFileData);

          url.set('query', {
            passPhrase,
            keyFile: encodeURIComponent(newKeyFile),
          });

          storage.uri = url.toString(true);
        }

        storedStorageList.push(storage);
      }
    }
    localStorage.storageList = JSON.stringify(storedStorageList);

    const settingsDir = Url.dirname(appSettings.settingsFile);
    const settingsFileFS = fsOperation(settingsDir);
    fs = fsOperation(appSettings.settingsFile);

    if (!(await fs.exists())) {
      await settingsFileFS.createFile(Url.basename(appSettings.settingsFile));
    }

    await fs.writeFile(JSON.stringify(settings, undefined, 2));
    location.reload();
  } catch (err) {
    helpers.toast(err);
  }
};

export default backupRestore;
