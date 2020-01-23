import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../modules/helpers';
import GithubLogin from '../login/login';
import Page from '../../components/page';

import _template from './gists.hbs';
import _menu from './menu.hbs';
import './gists.scss';
import contextMenu from '../../components/contextMenu';
import fs from '../../modules/utils/androidFileSystem';
import dialogs from '../../components/dialogs';
import git from '../../modules/git';
import GistFiles from '../gistFiles/gistFiles';

function Gists() {
  const $search = tag('span', {
    className: 'icon search hidden'
  });
  const $menuToggler = tag('span', {
    className: 'icon more_vert'
  });
  const $page = Page('Gists');
  const {
    credentials
  } = helpers;
  /**
   * @type {Array<object>}
   */
  let gists = null;
  const github = git.GitHub();
  const user = github.getUser();
  const gistsFile = cordova.file.externalDataDirectory + '.gists';
  const $cm = contextMenu(mustache.render(_menu, strings), {
    top: '8px',
    right: '8px',
    toggle: $menuToggler,
    transformOrigin: 'top right'
  });

  $cm.addEventListener('click', handleClick);
  $page.querySelector('header').append($search, $menuToggler);

  fs.readFile(gistsFile)
    .then(res => {
      const decoder = new TextDecoder('utf-8');
      const text = credentials.decrypt(decoder.decode(res.data));
      const repos = JSON.parse(text);
      render(repos);
    })
    .catch(err => {
      dialogs.loaderShow('GitHub', strings.loading + '...');
      loadRepos();
    });

  /**
   * 
   * @param {Array<object>} res
   */
  function render(res) {
    gists = res;

    gists.map(gist => {
      const files = Object.values(gist.files);
      const {
        filename
      } = files[0];

      gist.name = filename;
      gist.files_count = files.length;
    });
    const $content = tag.parse(mustache.render(_template, gists));

    $content.addEventListener('click', handleClick);

    $page.append($content);
    document.body.appendChild($page);

    actionStack.push({
      id: 'repos',
      action: $page.hide
    });
    $page.onhide = function () {
      actionStack.remove('repos');
    }
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
      case 'gist':
        getGist();
        break;

      case 'open':
        window.open($el.parentElement.getAttribute('data-url'), '_system');
        break;

      case 'reload':
        $page.querySelector('#gists').remove();
        loadRepos();
        gistRecord.reset();
        break;
    }

    function getGist() {
      const id = $el.id;

      let gist = gistRecord.get(id);
      if (!gist) {
        dialogs.loaderShow('', strings.loading + '...');
        github.getGist(id).read()
          .then(res => {
            const data = res.data;
            gist = gistRecord.add(data);
            openFile();
          })
          .finally(() => {
            dialogs.loaderHide();
          });
      } else {
        openFile();
      }

      function openFile() {
        const files = Object.keys(gist.files);
        if (files.length > 1) {

          GistFiles(gist);

        } else {
          const file = gist.files[files[0]];
          editorManager.addNewFile(file.filename, {
            type: 'gist',
            text: file.content,
            record: gist,
            isUnsaved: false
          });

          actionStack.pop();
          actionStack.pop();
        }
      }

    }
  }

  function loadRepos() {
    dialogs.loaderShow('Gists', strings.loading + '...');
    user.listGists()
      .then(res => {
        const repos = res.data;
        const data = credentials.encrypt(JSON.stringify(repos));
        fs.writeFile(gistsFile, data, true, false)
          .catch(err => {
            plugins.toast.showShortBottom(strings.error);
            console.log(err);
          });

        render(repos);
      })
      .catch(err => {
        if (err.response) {
          GithubLogin();
        } else {
          console.log(err);
        }
      })
      .finally(() => {
        dialogs.loaderHide();
      });
  }
}

export default Gists;