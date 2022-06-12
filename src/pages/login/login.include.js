import './login.scss';
import tag from 'html-tag-js';
import mustache from 'mustache';
import Page from '../../components/page';
import _template from './login.hbs';
import helpers from '../../lib/utils/helpers';
import gitHub from '../github/gitHub';
import constants from '../../lib/constants';
import Url from '../../lib/utils/Url';
import fsOperation from '../../lib/fileSystem/fsOperation';

export default async function GithubLoginInclude() {
  const $page = Page(strings['github login']);
  const $content = tag.parse(mustache.render(_template, strings));
  const $form = $content.get('.form');
  const $input = $content.get('input');
  const $token = $content.get('#token');
  const $errorMsg = $content.get('#error-msg');
  const $info = tag('a', {
    className: 'icon help',
    href: constants.GITHUB_TOKEN,
  });
  const fs = fsOperation(Url.join(DATA_STORAGE, '.github'));
  if (await fs.exists()) {
    fs.delete();
  }

  $page.get('header').append($info);
  $page.append($content);

  $input.onclick = () => ($errorMsg.textContent = '');
  $form.onsubmit = storeCredentials;

  actionStack.push({
    id: 'github login',
    action: $page.hide,
  });

  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove('github login');
  };

  Object.defineProperty($page, 'setMessage', {
    value(msg) {
      $errorMsg.textContent = msg;
    },
  });

  app.append($page);
  helpers.showAd();

  function storeCredentials(e) {
    e.preventDefault();
    let token = $token.value;
    const credentials = helpers.credentials;

    if (token) localStorage.setItem('token', credentials.encrypt(token));
    else return ($errorMsg.textContent = 'Please enter GitHub token!');

    gitHub($page);
  }
}
