import tag from 'html-tag-js';
import Page from '../../components/page';
import git from '../../lib/git';
import dialogs from '../../components/dialogs';

import './info.scss';

export default function Info(repo, owner) {
  const $page = Page(repo);
  const gitHub = git.GitHub();
  const repository = gitHub.getRepo(owner, repo);

  dialogs.loader.create(repo, strings.loading + '...');
  repository
    .getReadme('master', false)
    .then((res) => {
      if (res.status === 200) {
        const data = res.data;
        let text = data.content;
        if (data.encoding === 'base64') {
          text = atob(text);
        }

        return gitHub.getMarkdown().render({
          text,
        });
      } else {
        return Promise.reject(res);
      }
    })
    .then((res) => {
      if (res.status === 200) {
        const text = res.data;
        $page.append(
          tag('div', {
            id: 'info-page',
            className: 'main',
            innerHTML: text,
          })
        );
      } else {
        $page.hide();
      }
    })
    .catch((err) => {
      dialogs.alert(strings.error, err.message);
      console.error(err);
      $page.hide();
    })
    .finally(() => {
      dialogs.loader.destroy();
    });

  actionStack.push({
    id: 'info',
    action: $page.hide,
  });
  $page.onhide = function () {
    actionStack.remove('info');
  };
  app.appendChild($page);
}
