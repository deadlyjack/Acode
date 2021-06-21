import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../lib/utils/helpers';
import GithubLogin from '../login/login';
import Page from '../../components/page';

import _template from './gitHub.hbs';
import _menu from './menu.hbs';
import './gitHub.scss';
import contextMenu from '../../components/contextMenu';
import fs from '../../lib/fileSystem/internalFs';
import dialogs from '../../components/dialogs';
import git from '../../lib/git';
import Repos from '../repos/repos';
import Gists from '../gists/gists';

/**
 * 
 * @param {object} options
 */
function gitHubInclude(options = {}) {
  const $search = tag('span', {
    className: 'icon search hidden'
  });
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu'
    }
  });
  const $page = Page('Github');
  const {
    credentials
  } = helpers;

  const github = git.GitHub();
  const user = github.getUser();
  const githubFile = cordova.file.externalDataDirectory + '.github';
  const gitProfile = cordova.file.externalDataDirectory + '.git';
  const $cm = contextMenu(mustache.render(_menu, strings), {
    top: '8px',
    right: '8px',
    toggle: $menuToggler,
    transformOrigin: 'top right'
  });

  $cm.addEventListener('click', handleClick);
  $page.querySelector('header').append($search, $menuToggler);

  fs.readFile(gitProfile)
    .then(res => {
      const text = credentials.decrypt(helpers.decodeText(res.data));
      const profile = JSON.parse(text || '{}');
      render(profile);
    })
    .catch(err => {
      loadProfile();
    });


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
          plugins.toast.showShortBottom(strings.success);
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

    const $content = content(profile);
    $page.append($content);
    app.appendChild($page);

    actionStack.push({
      id: 'github',
      action: $page.hide
    });

    $page.onhide = function () {
      actionStack.remove('github');
    };

    $content.addEventListener('click', handleClick);

    if (options.$loginPage)
      options.$loginPage.hide();
  }

  function loadProfile(onload) {
    dialogs.loader.create('GitHub', strings.loading + '...');
    user.getProfile()
      .then(res => {

        const profile = res.data;
        const data = credentials.encrypt(JSON.stringify(profile));
        fs.writeFile(gitProfile, data, true, false)
          .catch(err => {
            plugins.toast.showShortBottom(strings.error);
            console.log(err);
          });
        if (onload) onload(profile);
        else render(profile);
      })
      .catch(err => {
        if (err.response.data) {
          console.log(err.response.data.message);
          if (err.response.status === 401) logout();
          if (options.$loginPage) {
            options.$loginPage.setMessage(err.response.data.message);
          } else {
            GithubLogin();
          }
        } else {
          if(options.$loginPage){
            options.$loginPage.setMessage(err.response.statusText);
          }
          logout();
        }
      })
      .finally(() => {
        dialogs.loader.destroy();
      });
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
    return tag.parse(mustache.render(_template, {
      ...strings,
      ...profile
    }));
  }

  function logout(onlogout) {
    if (localStorage.username) delete localStorage.username;
    if (localStorage.password) delete localStorage.password;
    if (localStorage.token) delete localStorage.token;
    Promise.all([fs.deleteFile(githubFile), fs.deleteFile(gitProfile)])
      .finally(() => {
        if (onlogout) onlogout();
      });
  }
}

export default gitHubInclude;