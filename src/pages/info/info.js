import tag from 'html-tag-js';
import Page from "../../components/page"
import git from "../../modules/git";
import dialogs from "../../components/dialogs";

import './info.scss';

export default function Info(repo, owner) {
  const $page = Page(repo);
  const gitHub = git.GitHub();
  const repository = gitHub.getRepo(owner, repo);

  dialogs.loaderShow(repo, strings.loading + '...');
  repository.getReadme('master', false)
    .then(res => {
      if (res.statusText === 'OK') {
        const data = res.data;
        let text = data.content;
        if (data.encoding === 'base64') {
          text = atob(text);
        }

        return gitHub.getMarkdown().render({
          text
        })
      } else {
        return Promise.reject(res);
      }
    })
    .then(res => {
      if (res.statusText === 'OK') {
        const text = res.data;
        $page.append(tag('div', {
          id: 'info-page',
          className: 'main',
          innerHTML: text
        }));
      } else {
        $page.hide();
      }
    })
    .catch(err => {
      dialogs.alert(strings.error, err.message);
      console.log(err);
      $page.hide();
    })
    .finally(() => {
      dialogs.loaderHide();
    });

  actionStack.push({
    id: 'info',
    action: $page.hide
  });
  $page.onhide = function () {
    actionStack.remove('info');
  };
  app.appendChild($page);
}