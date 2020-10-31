import tag from 'html-tag-js';
import mustache from 'mustache';

import Page from "../../components/page";
import _template from './login.hbs';
import './login.scss';
import helpers from '../../lib/utils/helpers';
import gitHub from '../github/gitHub';
import fs from '../../lib/fileSystem/internalFs';

export default function GithubLoginInclude() {
  const $page = Page('Github Login');
  const $content = tag.parse(mustache.render(_template, strings));
  /**@type {HTMLFormElement} */
  const $form = $content.get('.form');
  const $token = $content.get("#token");
  const $errorMsg = $content.get('#error-msg');
  fs.deleteFile(cordova.file.externalDataDirectory + '.github');

  $page.append($content);

  $content.onclick = handelClick;
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

  /**
   * 
   * @param {MouseEvent} e 
   */
  function handelClick(e) {
    /**
     * @type {HTMLElement}
     */
    const $el = e.target;

    if ($el instanceof HTMLInputElement) $errorMsg.textContent = '';
  }

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