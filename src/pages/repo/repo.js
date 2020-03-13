import _template from './repo.hbs';
import _list from './list.hbs';
import _menu from './menu.hbs';
import './repo.scss';


import tag from 'html-tag-js';
import mustache from 'mustache';
import mimeType from 'mime-types';
import Page from '../../components/page';
import helpers from '../../modules/helpers';
import dialogs from '../../components/dialogs';
import git from '../../modules/git';
import contextMenu from '../../components/contextMenu';
import Info from '../info/info';
import SearchBar from '../../components/searchbar';

export default function Repo(owner, repoName) {
  const $page = Page(repoName);
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu'
    }
  });
  const $content = tag.parse(_template);
  const $navigation = $content.querySelector('.navigation');
  const repo = git.GitHub().getRepo(owner, repoName);
  const $search = tag('span', {
    className: 'icon search',
    attr: {
      action: "search"
    }
  });
  let cachedTree = {};
  let currentTree = {};
  let idsToFlush = [];
  let branch;
  const branches = [];
  const input1 = {
    id: 'from',
    placeholder: strings['use branch'],
    hints: cb => {
      cb(branches.slice(0, -1));
    },
    type: 'text'
  };
  const input2 = {
    id: 'branch',
    placeholder: strings['new branch'],
    type: 'text',
    match: /^[a-z\-_0-9]+$/i
  };
  const path = [];
  const $cm = contextMenu(mustache.render(_menu, strings), {
    toggle: $menuToggler,
    top: '8px',
    right: '8px',
    transformOrigin: 'top right'
  });

  dialogs.loaderShow(repoName, strings.loading + '...');
  repo.listBranches()
    .then(res => {
      dialogs.loaderHide();
      const data = res.data;
      data.map(branch => {
        branches.push(branch.name);
      });
      branches.push(['add', strings['new branch'], 'add']);
      return dialogs.select(strings['select branch'], branches);
    })
    .then(res => {
      if (res === 'add') {
        addBranch();
      } else {
        branch = res;
        getRepo();
      }
    })
    .catch(err => {
      helpers.error(err);
      console.error(err);
    })
    .finally(res => {
      dialogs.loaderHide();
    });

  function addBranch() {
    dialogs.multiPrompt(strings['create new branch'], [input1, input2])
      .then(res => {
        const from = res.from;
        branch = res.branch;
        dialogs.loaderShow('', strings.loading + '...');
        return repo.createBranch(from, branch);
      })
      .then(getRepo)
      .catch(err => {
        helpers.error(err);
        console.error(err);
      })
      .finally(() => {
        dialogs.loaderHide();
      });
  }

  function getRepo() {
    dialogs.loaderShow(repoName, strings.loading + '...');
    repo.getSha(branch, '')
      .then(res => {
        const list = res.data;
        render(list, repoName, 'root');
        actionStack.push({
          id: 'repo',
          action: $page.hide
        });

        $page.onhide = function () {
          $page.removeEventListener('click', handleClick);
          actionStack.remove('repo');
          idsToFlush.map(id => {
            actionStack.remove(id);
          });
        };
      })
      .catch(err => {
        helpers.error(err);
        console.error(err);
      })
      .finally(() => {
        dialogs.loaderHide();
      });
    $page.addEventListener('click', handleClick);
    $page.append($content);
    $page.querySelector('header').append($search, $menuToggler);
    document.body.appendChild($page);
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

    if (!action) return;
    if (action === 'info') $cm.hide();

    performeAction(action, $el);
  }

  function render(list, name, sha) {
    $page.settitle(repoName + ` (${branch})`);

    if (!(sha in cachedTree)) {
      list.map(entry => {
        const {
          size,
          type,
          name
        } = entry;
        entry.size = (size / 1024).toFixed(2) + 'KB';
        if (!entry.name && entry.path) entry.name = entry.path;
        entry.isDirectory = type === 'dir' || type === 'tree';
        entry.isFile = !entry.isDirectory;
        entry.type = entry.isDir ? 'folder' : helpers.getIconForFile(name);
      });
    }

    list = helpers.sortDir(list, {
      showHiddenFiles: 'on',
      sortByName: 'on'
    });
    const $oldList = $content.querySelector('.list');
    if ($oldList) $oldList.remove();
    const $list = tag.parse(mustache.render(_list, {
      msg: strings['empty folder message'],
      list
    }));
    $content.append($list);
    if (sha in cachedTree) $list.scrollTop = cachedTree[sha].scroll || 0;
    navigate(name, sha);

    if (!(sha in cachedTree)) {
      currentTree = {
        list,
        name,
        sha
      };
      cachedTree[sha] = currentTree;
    } else {
      currentTree = cachedTree[sha];
    }
  }

  function navigate(name, sha, options = {}) {
    path.push(name);
    let $nav = $navigation.querySelector(`[sha="${sha}"]`);
    const $old = $navigation.querySelector('.active');

    if ($old) $old.classList.remove('active');
    if ($nav) {
      $nav.classList.add('active');
    } else {
      $nav = tag('span', {
        className: 'nav active',
        attr: {
          sha,
          action: 'navigate',
          text: name,
          name,
          ...options
        }
      });
      $navigation.append($nav);
    }

    $navigation.scrollLeft = $navigation.scrollWidth;
  }

  /**
   * 
   * @param {string} action 
   * @param {HTMLElement} $el 
   */
  function performeAction(action, $el) {
    const sha = $el.getAttribute('sha');
    const name = $el.getAttribute('name');

    switch (action) {
      case 'folder':
        folder();
        break;

      case 'file':
        file();
        break;

      case 'navigate':
        folder();
        break;

      case 'info':
        Info(repoName, owner);
        break;

      case 'search':
        SearchBar($content.get(".list"));
        break;
    }

    function folder() {

      currentTree.scroll = $content.querySelector('.list').scrollTop;

      const {
        sha: csha,
        list: clist,
        name: cname
      } = currentTree;
      if (sha in cachedTree) {
        render(cachedTree[sha].list, name, sha);
      } else {
        dialogs.loaderShow(repoName, strings.loading + '...');
        repo.getTree(sha)
          .then(res => {
            const data = res.data;
            render(data.tree, name, sha);
          })
          .catch(error)
          .finally(dialogs.loaderHide);
      }

      actionStack.push({
        id: csha,
        action: function () {
          render(clist, cname, csha);
          idsToFlush.pop();
          if (action === 'folder') {
            const $nav = $navigation.lastChild;
            if ($nav) {
              path.pop(); //BUG: somehow path is not removing on back, fix it
              $nav.remove();
            }
          }
        }
      });
      idsToFlush.push(csha);
    }

    function file() {
      dialogs.loaderShow(name, strings.loading + '...');
      const ext = helpers.getExt(name);
      const mime = mimeType.lookup(ext);
      const type = /image/i.test(mime) ? 'blob' : null;
      repo.getBlob(sha, 'blob')
        .then(async res => {
          let data = res.data;
          if (!type) {
            if (data instanceof Blob) {
              try {
                if (data.text) data = await data.text();
                else data = await helpers.blob2text(data);
              } catch (error) {
                console.error(error);
                dialogs.alert(strings.error, strings['unable to open file']);
              }
            }
            const record = gitRecord.add({
              sha,
              data,
              name,
              branch,
              repo: repoName,
              path: path.slice(1).join('/'),
              owner
            });

            editorManager.addNewFile(name, {
              type: 'git',
              record,
              text: data,
              isUnsaved: false
            });

            $page.hide();
            actionStack.pop();
            actionStack.pop();

          } else if (type === 'blob') {

            dialogs.box(name, `<img src='${URL.createObjectURL(data)}'>`);

          } else {
            alert(strings.error.toUpperCase(), strings['file not supported']);
          }

        })
        .finally(() => {
          dialogs.loaderHide();
        });
    }
  }

  function error(err) {
    console.log(err);
    actionStack.pop();
    dialogs.alert(strings.error, err.toString());
  }
}