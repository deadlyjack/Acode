import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../lib/helpers';
import Page from '../../components/page';

import _template from './ftp-accounts.hbs';
import _list from './list.hbs';
import './ftp-accounts.scss';

import SearchBar from '../../components/searchbar';
import dialogs from '../../components/dialogs';
import remoteFs from '../../lib/fileSystem/remoteFs';
import openFolder from '../../lib/addFolder';

function FTPAccountsInclude() {
  let accounts = JSON.parse(localStorage.ftpaccounts || '[]');
  const $search = tag('span', {
    className: 'icon search',
    attr: {
      action: "search"
    }
  });
  const $page = Page('FTP Accounts');
  const {
    credentials
  } = helpers;
  const $content = tag.parse(mustache.render(_template, {
    list: mustache.render(_list, {
      accounts: decryptAccounts()
    })
  }));

  $content.addEventListener('click', handleClick);
  $page.querySelector('header').append($search);
  $search.onclick = () => {
    SearchBar($page.querySelector('.list'));
  };


  $page.append($content);
  app.appendChild($page);
  actionStack.push({
    id: 'repos',
    action: $page.hide
  });
  $page.onhide = function () {
    actionStack.remove('repos');
  };

  /**
   * 
   * @param {Event} e 
   */
  function handleClick(e) {
    let $target = e.target;
    if (!($target instanceof HTMLElement)) return;
    const action = $target.getAttribute('action');
    if (!action) return;

    if (action === 'add-account') {

      addAccount();

    } else if (action === 'remove') {

      const $parent = $target.parentElement;
      if (!$parent) return;
      const id = $parent.id;
      if (!id) return;
      remove(id);

    } else if (action === 'ftp-account' || action === "edit") {

      if (action === "edit") $target = $target.parentElement;

      const username = $target.getAttribute("username");
      const password = $target.getAttribute("password");
      const hostname = $target.getAttribute("hostname");
      const port = $target.getAttribute("port");
      const name = $target.getAttribute("name");
      const security = $target.getAttribute("security");
      const mode = $target.getAttribute("mode");
      const id = $target.id;

      if (action === 'edit') {
        addAccount(username, password, hostname, name, port, id, security, mode);
      } else {
        const fs = remoteFs(username, password, hostname, port);
        openFolder(fs.origin, {
          saveState: false,
          reloadOnResume: false,
          name
        });

        actionStack.pop();
      }

    }
  }

  function addAccount(username, password, hostname, name, port, id, security, mode) {

    prompt(username, password, hostname, name, port, security, mode).then(values => {
      const {
        username,
        password,
        hostname,
        port,
        ftp,
        ftps,
        active,
        passive,
        name
      } = values;

      if (id) remove(id);

      if (Array.isArray(accounts)) accounts.push({
        username: credentials.encrypt(username),
        password: credentials.encrypt(password),
        hostname: credentials.encrypt(hostname),
        port: credentials.encrypt(port),
        id: id || helpers.uuid(),
        security: ftps ? "ftps" : "ftp",
        mode: active ? "active" : "passive",
        name,
      });

      localStorage.setItem('ftpaccounts', JSON.stringify(accounts));
      $content.innerHTML = mustache.render(_list, {
        accounts: decryptAccounts()
      });

    });
  }

  function decryptAccounts() {
    const temp = [];
    if (Array.isArray(accounts)) accounts.map(account => {
      let {
        name,
        username,
        password,
        hostname,
        port,
        id,
        security,
        mode
      } = account;

      username = credentials.decrypt(username);
      password = credentials.decrypt(password);
      hostname = credentials.decrypt(hostname);
      port = credentials.decrypt(port);

      temp.push({
        username,
        password,
        hostname,
        port,
        name: name ? name : `${username}@${hostname}`,
        id,
        security,
        mode
      });
      return account;
    });

    return temp;
  }

  function remove(id) {
    if (Array.isArray(accounts)) accounts = accounts.filter(account => {
      return account.id !== id;
    });

    $content.innerHTML = mustache.render(_list, {
      accounts: decryptAccounts()
    });

    localStorage.setItem('ftpaccounts', JSON.stringify(accounts));
  }

  function prompt(username, password, hostname, name, port, security, mode) {
    port = port || 21;
    security = security || "ftp";
    mode = mode || "passive";
    return dialogs.multiPrompt('FTP login', [{
        id: "name",
        placeholder: "Name (optional)",
        type: "text",
        value: name ? name : ''
      },
      {
        id: "username",
        placeholder: "Username (optional)",
        type: "text",
        value: username
      },
      {
        id: "password",
        placeholder: "Password (optional)",
        type: "password",
        value: password
      },
      {
        id: "hostname",
        placeholder: "Hostname",
        type: "text",
        required: true,
        value: hostname
      },
      [
        "Security type: ",
        {
          id: "ftp",
          placeholder: "FTP",
          name: "type",
          type: "radio",
          value: security === "ftp" ? true : false
        },
        {
          id: "ftps",
          placeholder: "FTPS",
          name: "type",
          type: "radio",
          value: security === "ftps" ? true : false
        }
      ],
      [
        "Connection mode: ",
        {
          id: "active",
          placeholder: "Active",
          name: "mode",
          type: "radio",
          value: mode === "active" ? true : false
        },
        {
          id: "passive",
          placeholder: "Passive",
          name: "mode",
          type: "radio",
          value: mode === "passive" ? true : false
        }
      ],
      {
        id: "port",
        placeholder: "Port (optional)",
        type: "number",
        value: port
      }
    ]);
  }
}

export default FTPAccountsInclude;