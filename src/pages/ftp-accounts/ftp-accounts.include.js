import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../modules/helpers';
import Page from '../../components/page';

import _template from './ftp-accounts.hbs';
import _list from './list.hbs';
import './ftp-accounts.scss';

import SearchBar from '../../components/searchbar';
import dialogs from '../../components/dialogs';
import remoteFs from '../../modules/utils/remoteFs';
import openFolder from '../../modules/addFolder';

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
      const path = $target.getAttribute("path");
      const id = $target.id;

      if (action === 'edit') {
        addAccount(username, password, hostname, path, port, id);
      } else {
        const fs = remoteFs(username, password, hostname, port, path);
        openFolder(fs.origin, {
          saveState: false,
          reloadOnResume: false
        });

        actionStack.pop();
      }

    }
  }

  function addAccount(username, password, hostname, path, port, id) {

    prompt(username, password, hostname, path, port, id).then(values => {
      const {
        username,
        password,
        hostname,
        port,
        path
      } = values;

      if (id) remove(id);

      if (Array.isArray(accounts)) accounts.push({
        username: credentials.encrypt(username),
        password: credentials.encrypt(password),
        hostname: credentials.encrypt(hostname),
        port: credentials.encrypt(port),
        path: path && credentials.encrypt(path),
        id: id || helpers.uuid()
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
      const {
        username,
        password,
        hostname,
        port,
        path,
        id
      } = account;
      temp.push({
        username: credentials.decrypt(username),
        password: credentials.decrypt(password),
        hostname: credentials.decrypt(hostname),
        path: path && credentials.decrypt(path),
        port: credentials.decrypt(port),
        id
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

  function prompt(username, password, hostname, path, port = 21) {
    return dialogs.multiPrompt('FTP login', [{
        id: "username",
        placeholder: "username (optional)",
        type: "text",
        value: username
      },
      {
        id: "password",
        placeholder: "password (optional)",
        type: "password",
        value: password
      },
      {
        id: "hostname",
        placeholder: "hostname",
        type: "text",
        required: true,
        value: hostname
      },
      {
        id: "path",
        placeholder: "path (optional)",
        type: "text",
        value: path
      },
      {
        id: "port",
        placeholder: "port (optional)",
        type: "number",
        value: port
      }
    ]);
  }
}

export default FTPAccountsInclude;