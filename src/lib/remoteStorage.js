import helpers from './utils/helpers';
import dialogs from '../components/dialogs';
import Url from './utils/Url';
import Sftp from './fileSystem/sftp';
import Ftp from './fileSystem/ftp';
import fsOperation from './fileSystem/fsOperation';
import URLParse from 'url-parse';

export default {
  /**
   *
   * @param  {...any} args [username, password, hostname, port, ftps, active, name]
   */
  async addFtp(...args) {
    let stopConnection = false;
    const {
      username, //
      password,
      hostname,
      port,
      ftps,
      active,
      alias,
    } = await prompt(...args);
    const security = ftps ? 'ftps' : 'ftp';
    const mode = active ? 'active' : 'passive';
    const ftp = Ftp(hostname, username, password, port, security, mode);
    try {
      dialogs.loader.create(strings['add ftp'], strings.connecting + '...', {
        timeout: 10000,
        callback() {
          stopConnection = true;
        },
      });
      const home = await ftp.getWorkingDirectory();

      if (stopConnection) {
        stopConnection = false;
        return;
      }

      const url = Url.formate({
        protocol: 'ftp:',
        username,
        password,
        hostname,
        port,
        path: '/',
        query: {
          mode,
          security,
        },
      });

      const res = {
        url,
        alias,
        name: alias,
        type: 'ftp',
        home: null,
      };

      if (home !== '/') {
        res.home = home;
      }
      dialogs.loader.destroy();
      return res;
    } catch (err) {
      if (stopConnection) {
        stopConnection = false;
        return;
      }

      dialogs.loader.destroy();
      await helpers.error(err);
      return await this.addFtp(
        username,
        password,
        hostname,
        alias,
        port,
        security,
        mode,
      );
    }

    function prompt(username, password, hostname, alias, port, security, mode) {
      port = port || 21;
      security = security || 'ftp';
      mode = mode || 'passive';
      return dialogs.multiPrompt(strings['add ftp'], [
        {
          id: 'alias',
          placeholder: 'Name',
          type: 'text',
          value: alias ? alias : '',
          required: true,
        },
        {
          id: 'username',
          placeholder: 'Username (optional)',
          type: 'text',
          value: username,
        },
        {
          id: 'hostname',
          placeholder: 'Hostname',
          type: 'text',
          required: true,
          value: hostname,
        },
        {
          id: 'password',
          placeholder: 'Password (optional)',
          type: 'password',
          value: password,
        },
        [
          'Security type: ',
          {
            id: 'ftp',
            placeholder: 'FTP',
            name: 'type',
            type: 'radio',
            value: security === 'ftp' ? true : false,
          },
          {
            id: 'ftps',
            placeholder: 'FTPS',
            name: 'type',
            type: 'radio',
            value: security === 'ftps' ? true : false,
          },
        ],
        [
          'Connection mode: ',
          {
            id: 'active',
            placeholder: 'Active',
            name: 'mode',
            type: 'radio',
            value: mode === 'active' ? true : false,
          },
          {
            id: 'passive',
            placeholder: 'Passive',
            name: 'mode',
            type: 'radio',
            value: mode === 'passive' ? true : false,
          },
        ],
        {
          id: 'port',
          placeholder: 'Port (optional)',
          type: 'number',
          value: port,
        },
      ]);
    }
  },
  /**
   * @param {...any} args [hostname, username, keyFile, password, passphrase, port, name]
   */
  async addSftp(...args) {
    let stopConnection = false;

    const {
      hostname,
      username,
      keyFile,
      password,
      passPhrase,
      port,
      alias,
      usePassword,
    } = await prompt(...args);
    const authType = usePassword ? 'password' : 'keyFile';

    dialogs.loader.create(strings['add sftp'], strings.connecting + '...', {
      timeout: 10000,
      callback() {
        stopConnection = true;
      },
    });
    const connection = Sftp(hostname, parseInt(port), username, {
      password,
      keyFile,
      passPhrase,
    });

    try {
      const home = await connection.pwd();

      if (stopConnection) {
        stopConnection = false;
        return;
      }

      let localKeyFile = '';
      if (keyFile) {
        let fs = fsOperation(keyFile);
        const rawData = await fs.readFile();
        const text = new TextDecoder('utf-8').decode(new Uint8Array(rawData));

        //Original key file sometimes gives permission error
        //To solve permission error
        const filename = keyFile.hashCode();
        localKeyFile = Url.join(DATA_STORAGE, filename);
        fs = fsOperation(localKeyFile);
        const exists = await fs.exists();
        if (exists) {
          await fs.writeFile(text);
        } else {
          let fs = fsOperation(DATA_STORAGE);
          await fs.createFile(filename, text);
        }
      }

      const url = Url.formate({
        protocol: 'sftp:',
        hostname,
        username,
        password,
        port,
        path: '/',
        query: {
          keyFile: localKeyFile,
          passPhrase,
        },
      });
      dialogs.loader.destroy();
      return {
        alias,
        name: alias,
        url,
        type: 'sftp',
        home,
      };
    } catch (err) {
      if (stopConnection) {
        stopConnection = false;
        return;
      }

      dialogs.loader.destroy();
      await helpers.error(err);
      return await this.addSftp(
        hostname,
        username,
        keyFile,
        password,
        passPhrase,
        port,
        alias,
        authType,
      );
    }

    function prompt(
      hostname,
      username,
      keyFile,
      password,
      passPhrase,
      port,
      alias,
      authType = 'password',
    ) {
      port = port || 22;

      const MODE_PASS = authType === 'password';
      const inputs = [
        {
          id: 'alias',
          placeholder: 'Name',
          type: 'text',
          value: alias ? alias : '',
          required: true,
        },
        {
          id: 'username',
          placeholder: 'Username (optional)',
          type: 'text',
          value: username,
        },
        {
          id: 'hostname',
          placeholder: 'Hostname',
          type: 'text',
          required: true,
          value: hostname,
        },
        [
          'Authentication type: ',
          {
            id: 'usePassword',
            placeholder: 'Password',
            name: 'authType',
            type: 'radio',
            value: MODE_PASS,
            onchange() {
              if (!!this.value) {
                this.prompt.$body.get('#password').hidden = false;
                this.prompt.$body.get('#keyFile').hidden = true;
                this.prompt.$body.get('#passPhrase').hidden = true;
              }
            },
          },
          {
            id: 'useKeyFile',
            placeholder: 'Key file',
            name: 'authType',
            type: 'radio',
            value: !MODE_PASS,
            onchange() {
              if (!!this.value) {
                const $password = this.prompt.$body.get('#password');
                $password.hidden = true;
                $password.value = '';
                this.prompt.$body.get('#keyFile').hidden = false;
                this.prompt.$body.get('#passPhrase').hidden = false;
              }
            },
          },
        ],
        {
          id: 'password',
          placeholder: 'Password',
          name: 'password',
          type: 'password',
          value: password,
          hidden: !MODE_PASS,
        },
        {
          id: 'keyFile',
          placeholder: 'Select key file',
          name: 'keyFile',
          hidden: MODE_PASS,
          value: keyFile,
          type: 'text',
          onclick() {
            sdcard.openDocumentFile((res) => {
              this.value = res.uri;
            });
          },
        },
        {
          id: 'passPhrase',
          placeholder: 'Passphrase (optional)',
          name: 'passPhrase',
          type: 'password',
          hidden: MODE_PASS,
          value: passPhrase,
        },
        {
          id: 'port',
          placeholder: 'Port (optional)',
          type: 'number',
          value: port,
        },
      ];

      return dialogs.multiPrompt(strings['add sftp'], inputs);
    }
  },
  edit({ name, storageType, url }) {
    let { username, password, hostname, port, query } = URLParse(url, true);

    if (username) {
      username = decodeURIComponent(username);
    }

    if (password) {
      password = decodeURIComponent(password);
    }

    if (storageType === 'ftp') {
      let { security, mode } = query;
      if (security) {
        security = decodeURIComponent(security);
      }

      if (mode) {
        mode = decodeURIComponent(mode);
      }

      return this.addFtp(
        username,
        password,
        hostname,
        name,
        port,
        security,
        mode,
      );
    }

    if (storageType === 'sftp') {
      let { passPhrase, keyFile } = query;
      if (passPhrase) {
        passPhrase = decodeURIComponent(passPhrase);
      }

      if (keyFile) {
        keyFile = decodeURIComponent(keyFile);
      }

      return this.addSftp(
        hostname,
        username,
        keyFile,
        password,
        passPhrase,
        port,
        name,
        password ? 'password' : 'key',
      );
    }

    return null;
  },
};
