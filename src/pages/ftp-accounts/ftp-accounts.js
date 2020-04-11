import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../modules/helpers';
import Page from '../../components/page';

import _template from './ftp-accounts.hbs';
import _list from './list.hbs';
import _menu from './menu.hbs';
import './ftp-accounts.scss';

import contextMenu from '../../components/contextMenu';
import SearchBar from '../../components/searchbar';
import dialogs from '../../components/dialogs';
import remoteFs from '../../modules/utils/remoteFs';
import openFolder from '../../modules/addFolder';

function FTPAccounts() {
  let accounts = JSON.parse(localStorage.ftpaccounts || '[]');
  const $search = tag('span', {
    className: 'icon search',
    attr: {
      action: "search"
    }
  });
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu'
    }
  });
  const $page = Page('FTP Accounts');
  const {
    credentials
  } = helpers;
  const $cm = contextMenu(mustache.render(_menu, strings), {
    top: '8px',
    right: '8px',
    toggle: $menuToggler,
    transformOrigin: 'top right'
  });
  const $content = tag.parse(mustache.render(_template, {
    list: mustache.render(_list, {
      accounts: decryptAccounts()
    })
  }));

  $cm.addEventListener('click', handleClick);
  $content.addEventListener('click', handleClick);
  $page.querySelector('header').append($search, $menuToggler);
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
    const $target = e.target;
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

      if (Array.isArray(accounts)) accounts = accounts.filter(account => {
        return account.id !== id;
      });

      $content.innerHTML = mustache.render(_list, {
        accounts: decryptAccounts()
      });

      localStorage.setItem('ftpaccounts', JSON.stringify(accounts));

    } else if ('ftp-account') {

      const username = $target.getAttribute("username");
      const password = $target.getAttribute("password");
      const hostname = $target.getAttribute("hostname");
      const port = $target.getAttribute("port");

      const fs = remoteFs(username, password, hostname, port);
      openFolder(fs.origin, {
        saveState: false,
        reloadOnResume: false
      });

      actionStack.pop();

    }

  }

  function addAccount() {
    dialogs.multiPrompt('FTP/SFTP login', [{
          id: "username",
          placeholder: "username",
          type: "text"
        },
        {
          id: "password",
          placeholder: "password",
          type: "password"
        },
        {
          id: "hostname",
          placeholder: "hostname",
          type: "text"
        },
        {
          id: "port",
          placeholder: "port (21)",
          type: "number",
          value: 21
        }
      ])
      .then(values => {
        const {
          username,
          password,
          hostname,
          port
        } = values;

        if (Array.isArray(accounts)) accounts.push({
          username: credentials.encrypt(username),
          password: credentials.encrypt(password),
          hostname: credentials.encrypt(hostname),
          port: credentials.encrypt(port),
          id: helpers.uuid()
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
        id
      } = account;
      temp.push({
        username: credentials.decrypt(username),
        password: credentials.decrypt(password),
        hostname: credentials.decrypt(hostname),
        port: credentials.decrypt(port),
        id
      });
      return account;
    });

    return temp;
  }
}

export default FTPAccounts;