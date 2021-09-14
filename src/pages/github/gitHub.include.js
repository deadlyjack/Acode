import './gitHub.scss';
import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../lib/utils/helpers';
import GithubLogin from '../login/login';
import Page from '../../components/page';
import _template from './gitHub.hbs';
import _menu from './menu.hbs';
import contextMenu from '../../components/contextMenu';
import dialogs from '../../components/dialogs';
import git from '../../lib/git';
import Repos from '../repos/repos';
import Gists from '../gists/gists';
import fsOperation from '../../lib/fileSystem/fsOperation';
import Url from '../../lib/utils/Url';

/**
 *
 * @param {object} $loginPage
 */
async function gitHubInclude($loginPage) {
  let $page;
  const $search = tag('span', {
    className: 'icon search hidden',
  });
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu',
    },
  });
  const { credentials } = helpers;

  const github = git.GitHub();
  const user = github.getUser();
  const githubFile = Url.join(DATA_STORAGE, '.github');
  const gitProfile = Url.join(DATA_STORAGE, '.git');
  const $cm = contextMenu(mustache.render(_menu, strings), {
    top: '8px',
    right: '8px',
    toggle: $menuToggler,
    transformOrigin: 'top right',
  });

  $cm.addEventListener('click', handleClick);

  const fs = fsOperation(gitProfile);
  if (await fs.exists()) {
    const text = await fs.readFile('utf-8');
    const profile = helpers.credentials.decrypt(text);
    render(helpers.parseJSON(profile));
  } else {
    loadProfile();
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

    if (['logout', 'reload'].includes(action)) $cm.hide();
    switch (action) {
      case 'logout':
        logout(() => {
          toast(strings.success);
          $page.hide();
        });
        break;
      case 'gist':
        Gists();
        break;
      case 'repos':
        Repos();
        break;
      case 'reload':
        loadProfile(function (profile) {
          let $content = tag.get('#github');
          if ($content) $content.remove();
          $content = content(profile);
          $page.append($content);
          $content.addEventListener('click', handleClick);
        });
        break;
      case 'open':
        window.open($el.getAttribute('data-value'), '_system');
        break;
    }
  }

  function render(profile) {
    if (!$page) $page = Page('Github');
    const $content = content(profile);
    $page.append($content);
    app.appendChild($page);
    $page.querySelector('header').append($search, $menuToggler);

    actionStack.push({
      id: 'github',
      action: $page.hide,
    });

    $page.onhide = function () {
      actionStack.remove('github');
    };

    $content.addEventListener('click', handleClick);

    if ($loginPage) $loginPage.hide();
  }

  async function loadProfile(onload) {
    dialogs.loader.create('GitHub', strings.loading + '...');
    try {
      const profile = await user.getProfile();
      const { data: profileData } = profile;
      const data = credentials.encrypt(JSON.stringify(profileData));
      try {
        const fs = fsOperation(gitProfile);
        if (!(await fs.exists())) {
          const dataFs = fsOperation(DATA_STORAGE);
          await dataFs.createFile('.git');
        }
        await fs.writeFile(data);
      } catch (error) {}

      if (typeof onload === 'function') onload(profileData);
      else render(profileData);
    } catch (err) {
      if (err.response.data) {
        console.error(err.response.data.message);
        if (err.response.status === 401) logout();
        if ($loginPage) {
          $loginPage.setMessage(err.response.data.message);
        } else {
          GithubLogin();
        }
      } else {
        if ($loginPage) {
          $loginPage.setMessage(err.response.statusText);
        }
        logout();
      }
    }

    dialogs.loader.destroy();
  }

  /**
   *
   * @param {*} profile
   * @returns {HTMLElement}
   */
  function content(profile) {
    if (profile) {
      profile.total_repos = profile.total_private_repos + profile.public_repos;
      profile.total_gists = profile.private_gists + profile.public_gists;
    }
    return tag.parse(
      mustache.render(_template, {
        ...strings,
        ...profile,
      })
    );
  }

  async function logout(onlogout) {
    if (localStorage.username) delete localStorage.username;
    if (localStorage.password) delete localStorage.password;
    if (localStorage.token) delete localStorage.token;

    try {
      await fsOperation(gitProfile).deleteFile();
      await fsOperation(githubFile).deleteFile();
    } catch (error) {}
    if (onlogout) onlogout();
  }
}

export default gitHubInclude;
