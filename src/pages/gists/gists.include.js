import tag from 'html-tag-js';
import mustache from 'mustache';
import helpers from '../../lib/utils/helpers';
import GithubLogin from '../login/login';
import Page from '../../components/page';

import _template from './gists.hbs';
import _menu from './menu.hbs';
import './gists.scss';
import contextMenu from '../../components/contextMenu';
import fs from '../../lib/fileSystem/internalFs';
import dialogs from '../../components/dialogs';
import git from '../../lib/git';
import GistFiles from '../gistFiles/gistFiles';
import constants from '../../lib/constants';
import searchBar from '../../components/searchbar';
import Icon from '../../components/icon';

function GistsInclude(callbackGists) {
  const $search = tag('span', {
    className: 'icon search',
    attr: {
      action: 'search',
    },
  });
  const $menuToggler = Icon('more_vert', 'toggle-menu');
  const $page = Page('Gists');
  const { credentials } = helpers;
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
    transformOrigin: 'top right',
  });

  $cm.addEventListener('click', handleClick);
  $page.querySelector('header').append($search, $menuToggler);
  $search.onclick = () => {
    searchBar($page.querySelector('.list'));
  };

  fs.readFile(gistsFile)
    .then((res) => {
      const text = credentials.decrypt(helpers.decodeText(res.data));
      const repos = JSON.parse(text);
      render(repos);
    })
    .catch((err) => {
      dialogs.loader.create('GitHub', strings.loading + '...');
      loadRepos();
    });

  /**
   *
   * @param {Array<object>} res
   */
  function render(res) {
    const $oldContent = $page.querySelector('#gists');
    if ($oldContent) $oldContent.remove();

    gists = callbackGists ? callbackGists(res) : res;
    gists.map((gist) => {
      const files = Object.values(gist.files);
      let filename = files.length > 0 ? files[0].filename : gist.id;

      gist.private = !gist.public;
      gist.name = filename;
      gist.files_count = files.length;
    });
    const $content = tag.parse(
      mustache.render(_template, {
        gists,
        msg: strings['empty folder message'],
      }),
    );

    $content.addEventListener('click', handleClick);

    $page.append($content);
    if (!$page.isConnected) {
      app.appendChild($page);
      helpers.showAd();
      actionStack.push({
        id: 'repos',
        action() {
          helpers.hideAd();
          $page.hide();
        },
      });
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

    if (['reload', 'create'].includes(action)) $cm.hide();
    switch (action) {
      case 'gist':
        getGist();
        break;

      case 'open':
        system.openInBrowser($el.parentElement.getAttribute('data-url'));
        break;

      case 'reload':
        loadRepos();
        gistRecord.reset();
        break;

      case 'share':
        break; //TODO: make it work

      case 'create':
        createGist();
        break;
    }

    function createGist() {
      const newGist = {
        id: parseInt(Math.random() * new Date().getTime()).toString(16),
        files: {},
        public: false,
      };
      dialogs
        .select('', ['public', 'private'], {
          default: 'priavate',
        })
        .then((res) => {
          if (res === 'public') newGist.public = true;

          return dialogs.prompt(
            strings['enter file name'],
            strings['new file'],
            'text',
            {
              match: constants.FILE_NAME_REGEX,
              required: true,
            },
          );
        })
        .then((filename) => {
          const file = {
            filename,
            content: '',
          };
          newGist.files[filename] = file;

          const gist = gistRecord.add(newGist, true);

          editorManager.addNewFile(filename, {
            type: 'gist',
            text: file.content,
            isUnsaved: false,
            record: gist,
            render: true,
          });

          actionStack.pop();
          actionStack.pop();
        });
    }

    function getGist() {
      const id = $el.id;

      let gist = gistRecord.get(id);
      if (!gist) {
        dialogs.loader.create('', strings.loading + '...');
        github
          .getGist(id)
          .read()
          .then((res) => {
            const data = res.data;
            gist = gistRecord.add(data);
            GistFiles(gist);
          })
          .catch((err) => {
            if (err) {
              dialogs.alert(strings.error, err.toString());
            }
          })
          .finally(() => {
            dialogs.loader.destroy();
          });
      } else {
        GistFiles(gist);
      }
    }
  }

  function loadRepos() {
    dialogs.loader.create('Gists', strings.loading + '...');
    user
      .listGists()
      .then((res) => {
        const repos = res.data;
        const data = credentials.encrypt(JSON.stringify(repos));
        fs.writeFile(gistsFile, data, true, false).catch((err) => {
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

export default GistsInclude;
