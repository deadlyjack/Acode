(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["githublogin"],{

/***/ "./src/pages/login/login.hbs":
/*!***********************************!*\
  !*** ./src/pages/login/login.hbs ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<div id=\\\"github-login\\\" class=\\\"main\\\">\\n  <form class=\\\"form\\\" action=\\\"#\\\">\\n    <input type=\\\"text\\\" id=\\\"username\\\" placeholder=\\\"username\\\">\\n    <input type=\\\"password\\\" id=\\\"password\\\" placeholder=\\\"password\\\">\\n    <span class=\\\"hr\\\">or</span>\\n    <input type=\\\"text\\\" id=\\\"token\\\" placeholder=\\\"token\\\">\\n\\n    <span id=\\\"error-msg\\\"></span>\\n    <div class=\\\"button-container primary\\\">\\n      <button type=\\\"submit\\\">login</button>\\n    </div>\\n  </form>\\n</div>\");\n\n//# sourceURL=webpack:///./src/pages/login/login.hbs?");

/***/ }),

/***/ "./src/pages/login/login.include.js":
/*!******************************************!*\
  !*** ./src/pages/login/login.include.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return GithubLoginInclude; });\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! html-tag-js */ \"./node_modules/html-tag-js/dist/tag.js\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(html_tag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mustache */ \"./node_modules/mustache/mustache.js\");\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mustache__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_page__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/page */ \"./src/components/page.js\");\n/* harmony import */ var _login_hbs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./login.hbs */ \"./src/pages/login/login.hbs\");\n/* harmony import */ var _login_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./login.scss */ \"./src/pages/login/login.scss\");\n/* harmony import */ var _login_scss__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_login_scss__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _lib_helpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../lib/helpers */ \"./src/lib/helpers.js\");\n/* harmony import */ var _github_gitHub__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../github/gitHub */ \"./src/pages/github/gitHub.js\");\n/* harmony import */ var _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../lib/fileSystem/internalFs */ \"./src/lib/fileSystem/internalFs.js\");\n\n\n\n\n\n\n\n\nfunction GithubLoginInclude() {\n  var $page = Object(_components_page__WEBPACK_IMPORTED_MODULE_2__[\"default\"])('Github Login');\n  var $content = html_tag_js__WEBPACK_IMPORTED_MODULE_0___default.a.parse(mustache__WEBPACK_IMPORTED_MODULE_1___default.a.render(_login_hbs__WEBPACK_IMPORTED_MODULE_3__[\"default\"], strings));\n  /**@type {HTMLFormElement} */\n\n  var $form = $content.get('.form');\n  var $username = $content.get(\"#username\");\n  var $password = $content.get(\"#password\");\n  var $token = $content.get(\"#token\");\n  var $errorMsg = $content.get('#error-msg');\n  _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_7__[\"default\"].deleteFile(cordova.file.externalDataDirectory + '.github');\n  $page.append($content);\n  $content.onclick = handelClick;\n  $form.onsubmit = storeCredentials;\n  actionStack.push({\n    id: 'github login',\n    action: $page.hide\n  });\n\n  $page.onhide = function () {\n    actionStack.remove('github login');\n  };\n\n  $page.setMessage = function (msg) {\n    $errorMsg.textContent = msg;\n  };\n\n  document.body.appendChild($page);\n  /**\n   * \n   * @param {MouseEvent} e \n   */\n\n  function handelClick(e) {\n    /**\n     * @type {HTMLElement}\n     */\n    var $el = e.target;\n    if ($el instanceof HTMLInputElement) $errorMsg.textContent = '';\n  }\n\n  function storeCredentials(e) {\n    e.preventDefault();\n    var token = $token.value;\n    var username = $username.value;\n    var password = $password.value;\n    var credentials = _lib_helpers__WEBPACK_IMPORTED_MODULE_5__[\"default\"].credentials;\n    if (!username && !token) return $errorMsg.textContent = 'Please enter username and password or token!';\n\n    if (token) {\n      localStorage.setItem('token', credentials.encrypt(token));\n    }\n\n    if (username) {\n      if (!password) return $errorMsg.textContent = 'Please enter password!';\n      username = credentials.encrypt(username);\n      password = credentials.encrypt(password);\n      localStorage.setItem('username', username);\n      localStorage.setItem('password', password);\n    }\n\n    Object(_github_gitHub__WEBPACK_IMPORTED_MODULE_6__[\"default\"])({\n      $loginPage: $page\n    });\n  }\n}\n\n//# sourceURL=webpack:///./src/pages/login/login.include.js?");

/***/ }),

/***/ "./src/pages/login/login.scss":
/*!************************************!*\
  !*** ./src/pages/login/login.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/pages/login/login.scss?");

/***/ })

}]);