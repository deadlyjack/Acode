"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkcom_foxdebug_acode"] = self["webpackChunkcom_foxdebug_acode"] || []).push([["repos"],{

/***/ "./src/pages/repo/repo.js":
/*!********************************!*\
  !*** ./src/pages/repo/repo.js ***!
  \********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\nfunction Repo(owner, repoName) {\n  __webpack_require__.e(/*! import() | repo */ \"repo\").then(__webpack_require__.bind(__webpack_require__, /*! ./repo.include */ \"./src/pages/repo/repo.include.js\")).then(function (res) {\n    var Repo = res.default;\n    Repo(owner, repoName);\n  });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Repo);\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/repo/repo.js?");

/***/ }),

/***/ "./src/pages/repos/repos.include.js":
/*!******************************************!*\
  !*** ./src/pages/repos/repos.include.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! html-tag-js */ \"./node_modules/html-tag-js/dist/tag.js\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(html_tag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mustache */ \"./node_modules/mustache/mustache.mjs\");\n/* harmony import */ var _utils_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/helpers */ \"./src/utils/helpers.js\");\n/* harmony import */ var _login_login__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../login/login */ \"./src/pages/login/login.js\");\n/* harmony import */ var _components_page__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/page */ \"./src/components/page.js\");\n/* harmony import */ var _repos_hbs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./repos.hbs */ \"./src/pages/repos/repos.hbs\");\n/* harmony import */ var _menu_hbs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./menu.hbs */ \"./src/pages/repos/menu.hbs\");\n/* harmony import */ var _repos_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./repos.scss */ \"./src/pages/repos/repos.scss\");\n/* harmony import */ var _repo_repo__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../repo/repo */ \"./src/pages/repo/repo.js\");\n/* harmony import */ var _components_contextMenu__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/contextMenu */ \"./src/components/contextMenu.js\");\n/* harmony import */ var _fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../fileSystem/internalFs */ \"./src/fileSystem/internalFs.js\");\n/* harmony import */ var _components_dialogs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../components/dialogs */ \"./src/components/dialogs.js\");\n/* harmony import */ var _lib_git__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../lib/git */ \"./src/lib/git.js\");\n/* harmony import */ var _components_searchbar__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../components/searchbar */ \"./src/components/searchbar.js\");\n/* harmony import */ var _components_icon__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../components/icon */ \"./src/components/icon.js\");\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nfunction ReposInclude() {\n  var $search = html_tag_js__WEBPACK_IMPORTED_MODULE_0___default()('span', {\n    className: 'icon search',\n    attr: {\n      action: 'search'\n    },\n    onclick: function onclick() {\n      (0,_components_searchbar__WEBPACK_IMPORTED_MODULE_13__[\"default\"])($page.get('#repos'));\n    }\n  });\n  var $menuToggler = (0,_components_icon__WEBPACK_IMPORTED_MODULE_14__[\"default\"])('more_vert', 'toggle-menu');\n  var $page = (0,_components_page__WEBPACK_IMPORTED_MODULE_4__[\"default\"])('Repositories');\n  var credentials = _utils_helpers__WEBPACK_IMPORTED_MODULE_2__[\"default\"].credentials;\n  /**\r\n   * @type {Array<object>}\r\n   */\n\n  var repos = null;\n  var github = _lib_git__WEBPACK_IMPORTED_MODULE_12__[\"default\"].GitHub();\n  var user = github.getUser();\n  var githubFile = cordova.file.externalDataDirectory + '.github';\n  var $cm = (0,_components_contextMenu__WEBPACK_IMPORTED_MODULE_9__[\"default\"])(mustache__WEBPACK_IMPORTED_MODULE_1__[\"default\"].render(_menu_hbs__WEBPACK_IMPORTED_MODULE_6__[\"default\"], strings), {\n    top: '8px',\n    right: '8px',\n    toggle: $menuToggler,\n    transformOrigin: 'top right'\n  });\n  $cm.addEventListener('click', handleClick);\n  $page.querySelector('header').append($search, $menuToggler);\n\n  $search.onclick = function () {\n    (0,_components_searchbar__WEBPACK_IMPORTED_MODULE_13__[\"default\"])($page.querySelector('#repos'));\n  };\n\n  _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.create('GitHub', strings.loading + '...');\n  _fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].readFile(githubFile).then(function (res) {\n    var text = credentials.decrypt(_utils_helpers__WEBPACK_IMPORTED_MODULE_2__[\"default\"].decodeText(res.data));\n    var repos = JSON.parse(text);\n    render(repos);\n  }).catch(function (err) {\n    loadRepos();\n  });\n  /**\r\n   *\r\n   * @param {Array<object>} res\r\n   */\n\n  function render(res) {\n    repos = res;\n    repos.map(function (repo) {\n      var language = repo.language,\n          size = repo.size,\n          updated_at = repo.updated_at;\n      repo.size = (size / 1024).toFixed(2) + 'KB';\n      repo.updated_at = new Date(updated_at).toLocaleDateString();\n      repo.language = \"file_type_\".concat((language || 'text').toLowerCase());\n    });\n    var $content = html_tag_js__WEBPACK_IMPORTED_MODULE_0___default().parse(mustache__WEBPACK_IMPORTED_MODULE_1__[\"default\"].render(_repos_hbs__WEBPACK_IMPORTED_MODULE_5__[\"default\"], repos));\n    $content.addEventListener('click', handleClick);\n    $page.body = $content;\n    app.append($page);\n    _utils_helpers__WEBPACK_IMPORTED_MODULE_2__[\"default\"].showAd();\n    actionStack.push({\n      id: 'repos',\n      action: $page.hide\n    });\n\n    $page.onhide = function () {\n      _utils_helpers__WEBPACK_IMPORTED_MODULE_2__[\"default\"].hideAd();\n      actionStack.pop();\n      actionStack.remove('repos');\n    };\n\n    _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.destroy();\n  }\n  /**\r\n   *\r\n   * @param {MouseEvent} e\r\n   */\n\n\n  function handleClick(e) {\n    /**\r\n     * @type {HTMLElement}\r\n     */\n    var $el = e.target;\n    var action = $el.getAttribute('action');\n    if (action === 'reload') $cm.hide();\n\n    switch (action) {\n      case 'repo':\n        var name = $el.getAttribute('name');\n        var owner = $el.getAttribute('owner');\n        (0,_repo_repo__WEBPACK_IMPORTED_MODULE_8__[\"default\"])(owner, name, $page);\n        break;\n\n      case 'reload':\n        $page.querySelector('#repos').remove();\n        _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.create('Repositories', strings.loading + '...');\n        loadRepos();\n        break;\n\n      case 'open':\n        system.openInBrowser($el.parentElement.getAttribute('data-url'));\n        break;\n    }\n  }\n\n  function loadRepos() {\n    user.listRepos().then(function (res) {\n      var repos = res.data;\n      var data = credentials.encrypt(JSON.stringify(repos));\n      _fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].writeFile(githubFile, data, true, false).catch(function (err) {\n        toast(strings.error);\n        console.error(err);\n      });\n      render(repos);\n    }).catch(function (err) {\n      if (err.response) {\n        (0,_login_login__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n      } else {\n        console.error(err);\n      }\n    }).finally(function () {\n      _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.destroy();\n    });\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (ReposInclude);\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/repos/repos.include.js?");

/***/ }),

/***/ "./src/pages/repos/repos.scss":
/*!************************************!*\
  !*** ./src/pages/repos/repos.scss ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/repos/repos.scss?");

/***/ }),

/***/ "./src/pages/repos/menu.hbs":
/*!**********************************!*\
  !*** ./src/pages/repos/menu.hbs ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<li action='reload'>\\r\\n  <span class='text'>{{reload}}</span>\\r\\n  <span class='icon refresh'></span>\\r\\n</li>\");\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/repos/menu.hbs?");

/***/ }),

/***/ "./src/pages/repos/repos.hbs":
/*!***********************************!*\
  !*** ./src/pages/repos/repos.hbs ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<div class=\\\"main list\\\" id=\\\"repos\\\">\\r\\n  {{#.}}\\r\\n  <div class=\\\"list-item\\\" data-url=\\\"{{html_url}}\\\" action=\\\"repo\\\" owner=\\\"{{owner.login}}\\\" name=\\\"{{name}}\\\" id=\\\"{{id}}\\\">\\r\\n    <span class=\\\"octicon main-icon\\\" {{#private}}private{{/private}}></span>\\r\\n    <div class=\\\"container\\\">\\r\\n      <div class=\\\"text\\\">\\r\\n        <span>{{name}}</span>\\r\\n      </div>\\r\\n      <small class=\\\"value\\\">\\r\\n        <div class=\\\"group\\\">\\r\\n          <span class=\\\"octicon octicon-star\\\"></span>\\r\\n          <span class=\\\"text\\\">{{watchers}}</span>\\r\\n        </div>\\r\\n        <div class=\\\"group\\\">\\r\\n          <span class=\\\"octicon octicon-repo-forked\\\"></span>\\r\\n          <span class=\\\"text\\\">{{forks}}</span>\\r\\n        </div>\\r\\n        <div class=\\\"group\\\">\\r\\n          <span class=\\\"icon file {{language}}\\\"></span>\\r\\n        </div>\\r\\n      </small>\\r\\n    </div>\\r\\n    <span class=\\\"icon open_in_browser\\\" action=\\\"open\\\"></span>\\r\\n  </div>\\r\\n  {{/.}}\\r\\n</div>\");\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/repos/repos.hbs?");

/***/ })

}]);