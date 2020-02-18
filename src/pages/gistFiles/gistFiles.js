import tag from 'html-tag-js';
import mustache from 'mustache';

import _template from './gistFiles.hbs';
import _menu from './menu.hbs';
import './gistFiles.scss';
import Page from '../../components/page';
import helpers from '../../modules/helpers';
import contextMenu from '../../components/contextMenu';
import dialogs from '../../components/dialogs';
import Gists from '../gists/gists';
import git from '../../modules/git';
import constants from '../../constants';

/**
 * 
 * @param {Gist} gist 
 */
function GistFiles(gist) {
  const fileNames = Object.keys(gist.files);
  const $page = Page(fileNames[0] || 'Gist:' + gist.id);
  const views = {
    files: (() => {
      const files = [];
      Object.values(gist.files).map(file => {
        files.push({
          filename: file.filename,
          type: helpers.getIconForFile(file.filename)
        });
      });
      return files;
    }),
    msg: strings['empty folder message']
  };
  const $content = tag.parse(mustache.render(_template, views));
  const $menuToggler = tag('span', {
    className: 'icon more_vert',
    attr: {
      action: 'toggle-menu'
    }
  });
  const $cm = contextMenu(mustache.render(_menu, strings), {
    top: '8px',
    right: '8px',
    toggle: $menuToggler,
    transformOrigin: 'top right'
  });

  $content.on('click', handleClick);
  $cm.on('click', handleClick);
  $page.append($content);
  $page.querySelector('header').append($menuToggler);
  app.appendChild($page);

  actionStack.push({
    id: 'gistFiles',
    action: $page.hide
  });

  $page.onhide = function () {
    actionStack.remove('gistFiles');
  };

  /**
   * 
   * @param {MouseEvent} e 
   */
  function handleClick(e) {
    const $el = e.target;
    const action = $el.getAttribute('action');
    if (!action) return;

    if (['create', 'delete-gist'].includes(action)) $cm.hide();
    switch (action) {
      case 'file':
        file();
        break;

      case 'share':
        share();
        break;

      case 'create':
        addFile();
        break;

      case 'delete-gist':
        deleteGist();
        break;

      case 'delete-file':
        deleteFile();
        break;
    }

    function addFile() {
      dialogs.prompt(strings['enter file name'], strings['new file'], 'text', {
          match: constants.FILE_NAME_REGEX,
          required: true
        })
        .then(name => {

          gist.addFile(name);
          editorManager.addNewFile(name, {
            type: 'gist',
            filename: name,
            isUnsaved: false,
            record: gist,
            render: true
          });

          actionStack.pop();
          actionStack.pop();
          actionStack.pop();

        });
    }

    function deleteFile() {
      const filename = $el.parentElement.getAttribute('filename');
      dialogs.confirm(strings.warning, strings['delete {name}'].replace('{name}', filename))
        .then(() => {
          if (filename) {
            dialogs.loaderShow(filename, strings.loading + '...');
            gist.removeFile(filename)
              .then(() => {
                $el.parentElement.remove();
                window.plugins.toast.showShortBottom(strings.success);
              })
              .catch(err => {
                if (err) dialogs.alert(strings.error, err.toString());
              })
              .finally(() => {
                dialogs.loaderHide();
              });
          }
        });
    }

    function deleteGist() {
      dialogs.confirm(strings.warning, strings['delete {name}'].replace('{name}', 'Gist: ' + gist.id))
        .then(() => {

          const Gist = git.GitHub().getGist(gist.id);
          dialogs.loaderShow('', strings.loading + '...');
          Gist.delete()
            .then(res => {
              if (res.status === 204) {
                for (let file of editorManager.files) {
                  if (file.type === 'gist' && file.record.id === gist.id) editorManager.removeFile(file, true);
                }
                window.plugins.toast.showShortBottom(strings.success);
                actionStack.pop();
                actionStack.pop();
                Gists(gists => {
                  let index;
                  for (let [i, g] of gists.entries()) {
                    if (g.id === gist.id) {
                      index = i;
                      break;
                    }
                  }

                  if (index !== undefined) {
                    gists.splice(index, 1);
                  }
                  return gists;
                });
              }
            })
            .catch(err => {
              if (err) {
                console.log(err);
                dialogs.alert(strings.error, err.toString());
              }
            })
            .finally(() => {
              dialogs.loaderHide();
            });

        });
    }

    function share() {
      const filename = $el.parentElement.getAttribute('filename');
      console.log(filename);
    }

    function file() {
      const filename = $el.getAttribute('filename');
      editorManager.addNewFile(filename, {
        type: "gist",
        text: gist.files[filename].content,
        isUnsaved: false,
        record: gist,
        render: true
      });
      actionStack.pop();
      actionStack.pop();
      actionStack.pop();
    }
  }
}

export default GistFiles;