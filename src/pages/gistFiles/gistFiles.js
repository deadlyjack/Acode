import tag from 'html-tag-js';
import mustache from 'mustache';

import _template from './gistFiles.hbs';
import './gistFiles.scss';
import Page from '../../components/page';
import helpers from '../../modules/helpers';

/**
 * 
 * @param {Gist} gist 
 */
function GistFiles(gist) {
  const fileNames = Object.keys(gist.files);
  const $page = Page(fileNames[0]);
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
    })
  };
  const $content = tag.parse(mustache.render(_template, views));

  $content.on('click', handleClick);

  $page.append($content);
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

    switch (action) {
      case 'file':
        file();
        break;

      case 'share':
        share();
        break;

      default:
        break;
    }

    function share() {
      const filename = $el.parentElement.getAttribute('filename');
      console.log(filename);
    }

    function file() {
      const filename = $el.getAttribute('data-filename');
      editorManager.addNewFile(filename, {
        type: "gist",
        text: gist.files[filename].content,
        isUnsaved: false,
        record: gist
      });
      actionStack.pop();
      actionStack.pop();
      actionStack.pop();
    }
  }
}

export default GistFiles;