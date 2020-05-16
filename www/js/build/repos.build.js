(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["repos"],{

/***/ "./src/pages/repo/repo.js":
/*!********************************!*\
  !*** ./src/pages/repo/repo.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n//jshint ignore:start\nfunction Repo(owner, repoName) {\n  __webpack_require__.e(/*! import() | repo */ \"repo\").then(__webpack_require__.bind(null, /*! ./repo.include */ \"./src/pages/repo/repo.include.js\")).then(function (res) {\n    var Repo = res[\"default\"];\n    Repo(owner, repoName);\n  });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Repo);\n\n//# sourceURL=webpack:///./src/pages/repo/repo.js?");

/***/ }),

/***/ "./src/pages/repos/menu.hbs":
/*!**********************************!*\
  !*** ./src/pages/repos/menu.hbs ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<li action=\\\"reload\\\">\\n  <span class=\\\"text\\\">{{reload}}</span>\\n  <span class=\\\"icon refresh\\\"></span>\\n</li>\");\n\n//# sourceURL=webpack:///./src/pages/repos/menu.hbs?");

/***/ }),

/***/ "./src/pages/repos/repos.hbs":
/*!***********************************!*\
  !*** ./src/pages/repos/repos.hbs ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<div class=\\\"main list\\\" id=\\\"repos\\\">\\n  {{#.}}\\n  <div class=\\\"list-item\\\" data-url=\\\"{{html_url}}\\\" action=\\\"repo\\\" owner=\\\"{{owner.login}}\\\" name=\\\"{{name}}\\\" id=\\\"{{id}}\\\">\\n    <span class=\\\"octicon main-icon\\\" {{#private}}private{{/private}}></span>\\n    <div class=\\\"container\\\">\\n      <div class=\\\"text\\\">\\n        <span>{{name}}</span>\\n      </div>\\n      <small class=\\\"value\\\">\\n        <div class=\\\"group\\\">\\n          <span class=\\\"octicon octicon-star\\\"></span>\\n          <span class=\\\"text\\\">{{watchers}}</span>\\n        </div>\\n        <div class=\\\"group\\\">\\n          <span class=\\\"octicon octicon-repo-forked\\\"></span>\\n          <span class=\\\"text\\\">{{forks}}</span>\\n        </div>\\n        <div class=\\\"group\\\">\\n          <span class=\\\"icon file {{language}}\\\"></span>\\n        </div>\\n      </small>\\n    </div>\\n    <span class=\\\"icon open_in_browser\\\" action=\\\"open\\\"></span>\\n  </div>\\n  {{/.}}\\n</div>\");\n\n//# sourceURL=webpack:///./src/pages/repos/repos.hbs?");

/***/ }),

/***/ "./src/pages/repos/repos.include.js":
/*!******************************************!*\
  !*** ./src/pages/repos/repos.include.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! html-tag-js */ \"./node_modules/html-tag-js/dist/tag.js\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(html_tag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mustache */ \"./node_modules/mustache/mustache.js\");\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mustache__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_utils_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/utils/helpers */ \"./src/lib/utils/helpers.js\");\n/* harmony import */ var _login_login__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../login/login */ \"./src/pages/login/login.js\");\n/* harmony import */ var _components_page__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/page */ \"./src/components/page.js\");\n/* harmony import */ var _repos_hbs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./repos.hbs */ \"./src/pages/repos/repos.hbs\");\n/* harmony import */ var _menu_hbs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./menu.hbs */ \"./src/pages/repos/menu.hbs\");\n/* harmony import */ var _repos_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./repos.scss */ \"./src/pages/repos/repos.scss\");\n/* harmony import */ var _repos_scss__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_repos_scss__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _repo_repo__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../repo/repo */ \"./src/pages/repo/repo.js\");\n/* harmony import */ var _components_contextMenu__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/contextMenu */ \"./src/components/contextMenu.js\");\n/* harmony import */ var _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../lib/fileSystem/internalFs */ \"./src/lib/fileSystem/internalFs.js\");\n/* harmony import */ var _components_dialogs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../components/dialogs */ \"./src/components/dialogs.js\");\n/* harmony import */ var _lib_git__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../lib/git */ \"./src/lib/git.js\");\n/* harmony import */ var _components_searchbar__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../components/searchbar */ \"./src/components/searchbar.js\");\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nfunction ReposInclude() {\n  var $search = html_tag_js__WEBPACK_IMPORTED_MODULE_0___default()('span', {\n    className: 'icon search',\n    attr: {\n      action: \"search\"\n    }\n  });\n  var $menuToggler = html_tag_js__WEBPACK_IMPORTED_MODULE_0___default()('span', {\n    className: 'icon more_vert',\n    attr: {\n      action: 'toggle-menu'\n    }\n  });\n  var $page = Object(_components_page__WEBPACK_IMPORTED_MODULE_4__[\"default\"])('Repositories');\n  var credentials = _lib_utils_helpers__WEBPACK_IMPORTED_MODULE_2__[\"default\"].credentials;\n  /**\n   * @type {Array<object>}\n   */\n\n  var repos = null;\n  var github = _lib_git__WEBPACK_IMPORTED_MODULE_12__[\"default\"].GitHub();\n  var user = github.getUser();\n  var githubFile = cordova.file.externalDataDirectory + '.github';\n  var $cm = Object(_components_contextMenu__WEBPACK_IMPORTED_MODULE_9__[\"default\"])(mustache__WEBPACK_IMPORTED_MODULE_1___default.a.render(_menu_hbs__WEBPACK_IMPORTED_MODULE_6__[\"default\"], strings), {\n    top: '8px',\n    right: '8px',\n    toggle: $menuToggler,\n    transformOrigin: 'top right'\n  });\n  $cm.addEventListener('click', handleClick);\n  $page.querySelector('header').append($search, $menuToggler);\n\n  $search.onclick = function () {\n    Object(_components_searchbar__WEBPACK_IMPORTED_MODULE_13__[\"default\"])($page.querySelector('#repos'));\n  };\n\n  _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.create('GitHub', strings.loading + '...');\n  _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].readFile(githubFile).then(function (res) {\n    var decoder = new TextDecoder('utf-8');\n    var text = credentials.decrypt(decoder.decode(res.data));\n    var repos = JSON.parse(text);\n    render(repos);\n  })[\"catch\"](function (err) {\n    loadRepos();\n  });\n  /**\n   * \n   * @param {Array<object>} res\n   */\n\n  function render(res) {\n    repos = res;\n    repos.map(function (repo) {\n      var language = repo.language,\n          size = repo.size,\n          updated_at = repo.updated_at;\n      repo.size = (size / 1024).toFixed(2) + 'KB';\n      repo.updated_at = new Date(updated_at).toLocaleDateString();\n      repo.language = \"file_type_\".concat((language || 'text').toLowerCase());\n    });\n    var $content = html_tag_js__WEBPACK_IMPORTED_MODULE_0___default.a.parse(mustache__WEBPACK_IMPORTED_MODULE_1___default.a.render(_repos_hbs__WEBPACK_IMPORTED_MODULE_5__[\"default\"], repos));\n    $content.addEventListener('click', handleClick);\n    $page.append($content);\n    document.body.appendChild($page);\n    actionStack.push({\n      id: 'repos',\n      action: $page.hide\n    });\n\n    $page.onhide = function () {\n      actionStack.remove('repos');\n    };\n\n    _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.destroy();\n  }\n  /**\n   * \n   * @param {MouseEvent} e \n   */\n\n\n  function handleClick(e) {\n    /**\n     * @type {HTMLElement}\n     */\n    var $el = e.target;\n    var action = $el.getAttribute('action');\n    if (action === 'reload') $cm.hide();\n\n    switch (action) {\n      case 'repo':\n        var name = $el.getAttribute('name');\n        var owner = $el.getAttribute('owner');\n        Object(_repo_repo__WEBPACK_IMPORTED_MODULE_8__[\"default\"])(owner, name, $page);\n        break;\n\n      case 'reload':\n        $page.querySelector('#repos').remove();\n        _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.create('Repositories', strings.loading + '...');\n        loadRepos();\n        break;\n\n      case 'open':\n        window.open($el.parentElement.getAttribute('data-url'), '_system');\n        break;\n    }\n  }\n\n  function loadRepos() {\n    user.listRepos().then(function (res) {\n      var repos = res.data;\n      var data = credentials.encrypt(JSON.stringify(repos));\n      _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].writeFile(githubFile, data, true, false)[\"catch\"](function (err) {\n        plugins.toast.showShortBottom(strings.error);\n        console.log(err);\n      });\n      render(repos);\n    })[\"catch\"](function (err) {\n      if (err.response) {\n        Object(_login_login__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n      } else {\n        console.log(err);\n      }\n    })[\"finally\"](function () {\n      _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.destroy();\n    });\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (ReposInclude);\n\n//# sourceURL=webpack:///./src/pages/repos/repos.include.js?");

/***/ }),

/***/ "./src/pages/repos/repos.scss":
/*!************************************!*\
  !*** ./src/pages/repos/repos.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/pages/repos/repos.scss?");

/***/ })

}]);