import tag from 'html-tag-js';
import mustache from 'mustache';

import Page from "../../components/page";
import _template from './login.hbs';
import './login.scss';
import helpers from '../../lib/utils/helpers';
import gitHub from '../github/gitHub';
import fs from '../../lib/fileSystem/internalFs';
import constants from '../../lib/constants';

export default function GithubLoginInclude() {
  const $page = Page('Github Login');
  const $content = tag.parse(mustache.render(_template, strings));
  const $form = $content.get('.form');
  const $input = $content.get('input');
  const $token = $content.get("#token");
  const $errorMsg = $content.get('#error-msg');
  const $info = tag('a', {
    className: 'icon help',
    href: constants.GITHUB_TOKEN
  });
  fs.deleteFile(cordova.file.externalDataDirectory + '.github');

  $page.get('header').append($info);
  $page.append($content);

  $input.onclick = ()=>$errorMsg.textContent = '';
  $form.onsubmit = storeCredentials;

  actionStack.push({
    id: 'github login',
    action: $page.hide
  });

  $page.onhide = function () {
    actionStack.remove('github login');
  };

  $page.setMessage = function (msg) {
    $errorMsg.textContent = msg;
  };

  document.body.appendChild($page);

  function storeCredentials(e) {
    e.preventDefault();
    let token = $token.value;
    const credentials = helpers.credentials;


    if (token)
      localStorage.setItem('token', credentials.encrypt(token));
    else
      return ($errorMsg.textContent = 'Please enter GitHub token!');

    gitHub({
      $loginPage: $page
    });
  }
}