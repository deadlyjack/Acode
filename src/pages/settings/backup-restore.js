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

      const backupStorage = (
        await FileBrowser(
          'folder', //
          strings['select folder']
        )
      ).url;

      const backupFilename = 'Acode.backup';
      const backupDirname = 'Backup';
      const backupDir = Url.join(backupStorage, backupDirname);
      const backupFile = Url.join(backupDir, backupFilename);
      const backupStorageFS = await fsOperation(backupStorage);
      const backupDirFS = await fsOperation(backupDir);
      const backupFileFS = await fsOperation(backupFile);

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
          const srcFs = await fsOperation(keyFile);
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
        `${strings['backup successful']}\n${Uri.getVirtualAddress(backupFile)}.`
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
    for (let storage of storageList) {
      if (!storedStorageList.find((st) => st.uuid === storage.uuid)) {
        if ('keyFileData' in storage) {
          const keyFileData = storage.keyFileData;
          delete storage.keyFileData;

          const keyFile = decodeURIComponent(
            URLParse(storage.uri, true).query['keyFile']
          );
          const fs = await fsOperation(keyFile);
          if (!(await fs.exists())) {
            const dirFs = await fsOperation(Url.dirname(keyFile));
            await dirFs.createFile(Url.basename(keyFile));
          }
          await fs.writeFile(keyFileData);
        }

        storedStorageList.push(storage);
      }
    }
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

export default backupRestore;
