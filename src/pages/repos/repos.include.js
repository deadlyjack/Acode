import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../lib/utils/helpers';
import GithubLogin from '../login/login';
import Page from '../../components/page';

import _template from './repos.hbs';
import _menu from './menu.hbs';
import './repos.scss';
import Repo from '../repo/repo';
import contextMenu from '../../components/contextMenu';
import fs from '../../lib/fileSystem/internalFs';
import dialogs from '../../components/dialogs';
import git from '../../lib/git';
import searchBar from '../../components/searchbar';

function ReposInclude() {
  const $search = tag('span', {
    className: 'icon search',
    attr: {
      action: 'search',
    },
  });
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu',
    },
  });
  const $page = Page('Repositories');
  const { credentials } = helpers;
  /**
   * @type {Array<object>}
   */
  let repos = null;
  const github = git.GitHub();
  const user = github.getUser();
  const githubFile = cordova.file.externalDataDirectory + '.github';
  const $cm = contextMenu(mustache.render(_menu, strings), {
    top: '8px',
    right: '8px',
    toggle: $menuToggler,
    transformOrigin: 'top right',
  });

  $cm.addEventListener('click', handleClick);
  $page.querySelector('header').append($search, $menuToggler);
  $search.onclick = () => {
    searchBar($page.querySelector('#repos'));
  };

  dialogs.loader.create('GitHub', strings.loading + '...');
  fs.readFile(githubFile)
    .then((res) => {
      const text = credentials.decrypt(helpers.decodeText(res.data));
      const repos = JSON.parse(text);
      render(repos);
    })
    .catch((err) => {
      loadRepos();
    });

  /**
   *
   * @param {Array<object>} res
   */
  function render(res) {
    repos = res;

    repos.map((repo) => {
      const { language, size, updated_at } = repo;

      repo.size = (size / 1024).toFixed(2) + 'KB';
      repo.updated_at = new Date(updated_at).toLocaleDateString();
      repo.language = `file_type_${(language || 'text').toLowerCase()}`;
    });
    const $content = tag.parse(mustache.render(_template, repos));

    $content.addEventListener('click', handleClick);

    $page.append($content);
    document.body.appendChild($page);

    actionStack.push({
      id: 'repos',
      action: $page.hide,
    });
    $page.onhide = function () {
      actionStack.remove('repos');
    };

    dialogs.loader.destroy();
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

    if (action === 'reload') $cm.hide();
    switch (action) {
      case 'repo':
        const name = $el.getAttribute('name');
        const owner = $el.getAttribute('owner');
        Repo(owner, name, $page);
        break;
      case 'reload':
        $page.querySelector('#repos').remove();
        dialogs.loader.create('Repositories', strings.loading + '...');
        loadRepos();
        break;
      case 'open':
        window.open($el.parentElement.getAttribute('data-url'), '_system');
        break;
    }
  }

  function loadRepos() {
    user
      .listRepos()
      .then((res) => {
        const repos = res.data;
        const data = credentials.encrypt(JSON.stringify(repos));
        fs.writeFile(githubFile, data, true, false).catch((err) => {
          toast(strings.error);
          console.error(err);
        });

        render(repos);
      })
      .catch((err) => {
        if (err.response) {
          GithubLogin();
        } else {
          console.error(err);
        }
      })
      .finally(() => {
        dialogs.loader.destroy();
      });
  }
}

export default ReposInclude;
