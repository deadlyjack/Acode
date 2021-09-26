import _template from './repo.hbs';
import _list from './list.hbs';
import _menu from './menu.hbs';
import './repo.scss';
import tag from 'html-tag-js';
import mustache from 'mustache';
import mimeType from 'mime-types';
import Page from '../../components/page';
import helpers from '../../lib/utils/helpers';
import dialogs from '../../components/dialogs';
import git from '../../lib/git';
import contextMenu from '../../components/contextMenu';
import searchBar from '../../components/searchbar';

export default function RepoInclude(owner, repoName) {
  let $page;
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu',
    },
  });
  const $content = tag.parse(_template);
  const $navigation = $content.querySelector('.navigation');
  const repo = git.GitHub().getRepo(owner, repoName);
  const $search = tag('span', {
    className: 'icon search',
    attr: {
      action: 'search',
    },
  });
  let cachedTree = {
    '/': {
      name: '/',
      sha: '/',
      list: [],
    },
  };
  let currentTree = { list: [], name: '', sha: '', scroll: 0 };
  let branch;
  const branches = [];
  const input1 = {
    id: 'from',
    placeholder: strings['use branch'],
    hints: (cb) => {
      cb(branches.slice(0, -1));
    },
    type: 'text',
  };
  const input2 = {
    id: 'branch',
    placeholder: strings['new branch'],
    type: 'text',
    match: /^[a-z\-_0-9]+$/i,
  };
  const path = [];
  const $cm = contextMenu(mustache.render(_menu, strings), {
    toggle: $menuToggler,
    top: '8px',
    right: '8px',
    transformOrigin: 'top right',
  });

  dialogs.loader.create(repoName, strings.loading + '...');
  repo
    .listBranches()
    .then((res) => {
      dialogs.loader.destroy();
      const data = res.data;
      data.map((branch) => branches.push(branch.name));
      branches.push(['add', strings['new branch'], 'add']);
      return dialogs.select(strings['select branch'], branches);
    })
    .then((res) => {
      if (res === 'add') {
        addBranch();
      } else {
        branch = res;
        getRepo();
      }
    })
    .catch((err) => {
      helpers.error(err);
      dialogs.loader.destroy();
    });

  function addBranch() {
    dialogs
      .multiPrompt(strings['create new branch'], [input1, input2])
      .then((res) => {
        const from = res.from;
        branch = res.branch;
        dialogs.loader.create('', strings.loading + '...');
        return repo.createBranch(from, branch);
      })
      .then(getRepo)
      .catch((err) => {
        helpers.error(err);
      })
      .finally(() => {
        dialogs.loader.destroy();
      });
  }

  function getRepo() {
    dialogs.loader.create(repoName, strings.loading + '...');
    repo
      .getSha(branch, '')
      .then((res) => {
        const list = transofrmRepoList(res.data);
        $page = Page(repoName + ` (${branch})`, {
          lead: tag('span', {
            className: 'icon clearclose',
            attr: {
              action: 'close',
            },
          }),
        });
        cachedTree['/'].list = list;
        navigate('/', '/');
        actionStack.setMark();
        actionStack.push({
          id: 'repo',
          action: $page.hide,
        });

        $page.onhide = function () {
          $cm.removeEventListener('click', handleClick);
          $page.removeEventListener('click', handleClick);
          actionStack.clearFromMark();
          actionStack.remove('repo');
        };

        $cm.addEventListener('click', handleClick);
        $page.addEventListener('click', handleClick);
        $page.append($content);
        $page.querySelector('header').append($search, $menuToggler);
        document.body.appendChild($page);
      })
      .catch((err) => {
        helpers.error(err);
      })
      .finally(() => {
        dialogs.loader.destroy();
      });
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

  /**
   *
   * @param {{list: Array<Object>, scroll: Number}} param0
   */
  function render({ list, scroll = 0 }) {
    const $oldList = $content.get('.list');
    if ($oldList) $oldList.remove();
    const $list = tag.parse(
      mustache.render(_list, {
        msg: strings['empty folder message'],
        list,
      }),
    );
    $content.append($list);
    $list.scrollTop = scroll;
  }

  /**
   *
   * @param {String} name
   * @param {String} sha
   */
  async function navigate(name, sha) {
    const $nav = $navigation.get(`[sha="${sha}"]`);

    if ($nav) {
      let $topNav;
      let oldsha = null;
      while (($topNav = $navigation.lastChild) !== $nav) {
        const sha = $topNav.getAttribute('sha');
        actionStack.remove(sha);
        $topNav.remove();
        path.pop();

        if (oldsha && oldsha in cachedTree) {
          delete cachedTree[oldsha];
        }

        oldsha = sha;
      }

      const tree = await getTree(name, sha);
      if (tree) {
        render(tree);
        currentTree = tree;
        return;
      }
      render({ list: [], scroll: 0 });
      return;
    }

    const tree = await getTree(name, sha);
    if (tree) {
      const $list = $content.get('.list');
      if ($list) currentTree.scroll = $list.scrollTop;

      path.push(name);
      $navigation.append(
        tag('span', {
          className: 'nav',
          attr: {
            sha,
            action: 'navigate',
            text: name,
            name,
          },
        }),
      );
      $navigation.scrollLeft = $navigation.scrollWidth;

      const { sha: csha, name: cname } = currentTree;
      if (csha && cname) {
        actionStack.push({
          id: sha,
          action: function () {
            navigate(cname, csha);
          },
        });
      }

      render(tree);
      cachedTree[sha] = tree;
      currentTree = tree;
    }
  }

  async function getTree(name, sha) {
    if (sha in cachedTree) {
      return cachedTree[sha];
    }

    let tree = null;
    dialogs.loader.create(repoName, strings.loading + '...');
    try {
      const res = await repo.getTree(sha);
      let { tree: list } = res.data;
      list = transofrmRepoList(list);
      tree = { list, name, sha, scroll: 0 };
    } catch (err) {
      error(err);
    }
    dialogs.loader.destroy();
    return tree;
  }

  function transofrmRepoList(list) {
    list.map((entry) => {
      const { size, type } = entry;
      entry.size = (size / 1024).toFixed(2) + 'KB';
      if (!entry.name && entry.path) entry.name = entry.path;
      entry.isDirectory = type === 'dir' || type === 'tree';
      entry.isFile = !entry.isDirectory;
      entry.type = entry.isDirectory
        ? 'folder'
        : helpers.getIconForFile(entry.name);
    });

    return helpers.sortDir(list, {
      showHiddenFiles: 'on',
      sortByName: 'on',
    });
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
      case 'close':
        $page.hide();
        break;
      case 'navigate':
        navigate(name, sha);
        break;

      case 'file':
        file();
        break;

      case 'info':
        import('../info/info').then((res) => {
          res.default(repoName, owner);
        });
        break;

      case 'search':
        searchBar($content.get('.list'));
        break;
    }

    function file() {
      dialogs.loader.create(name, strings.loading + '...');
      const ext = helpers.extname(name);
      const mime = mimeType.lookup(ext);
      const type = /image/i.test(mime) ? 'blob' : null;
      repo
        .getBlob(sha, 'blob')
        .then(async (res) => {
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
              owner,
            });

            editorManager.addNewFile(name, {
              type: 'git',
              record,
              text: data,
              isUnsaved: false,
            });

            $page.hide();
            window.freeze = false;
            actionStack.pop();
            actionStack.pop();
            window.freeze = true;
          } else if (type === 'blob') {
            dialogs.box(name, `<img src='${URL.createObjectURL(data)}'>`);
          } else {
            alert(strings.error.toUpperCase(), strings['file not supported']);
          }
        })
        .finally(() => {
          dialogs.loader.destroy();
        });
    }
  }

  function error(err) {
    console.error(err);
    actionStack.pop();
    dialogs.alert(strings.error, err.toString());
  }
}
