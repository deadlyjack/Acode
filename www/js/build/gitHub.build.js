(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["gitHub"],{

/***/ "./node_modules/@babel/runtime/helpers/defineProperty.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _defineProperty(obj, key, value) {\n  if (key in obj) {\n    Object.defineProperty(obj, key, {\n      value: value,\n      enumerable: true,\n      configurable: true,\n      writable: true\n    });\n  } else {\n    obj[key] = value;\n  }\n\n  return obj;\n}\n\nmodule.exports = _defineProperty;\n\n//# sourceURL=webpack:///./node_modules/@babel/runtime/helpers/defineProperty.js?");

/***/ }),

/***/ "./src/pages/gists/gists.js":
/*!**********************************!*\
  !*** ./src/pages/gists/gists.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n//jshint ignore:start\nfunction Gists() {\n  for (var _len = arguments.length, agrs = new Array(_len), _key = 0; _key < _len; _key++) {\n    agrs[_key] = arguments[_key];\n  }\n\n  __webpack_require__.e(/*! import() | gists */ \"gists\").then(__webpack_require__.bind(null, /*! ./gists.include */ \"./src/pages/gists/gists.include.js\")).then(function (res) {\n    var Gists = res[\"default\"];\n    Gists.apply(void 0, agrs);\n  });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Gists);\n\n//# sourceURL=webpack:///./src/pages/gists/gists.js?");

/***/ }),

/***/ "./src/pages/github/gitHub.hbs":
/*!*************************************!*\
  !*** ./src/pages/github/gitHub.hbs ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<div class=\\\"main\\\" id=\\\"github\\\">\\n  <div class=\\\"profile\\\">\\n    <img src=\\\"{{avatar_url}}\\\" alt=\\\"avatar\\\">\\n    <h2 class=\\\"info\\\">\\n      <span class=\\\"name\\\">{{name}}</span>\\n      <small class=\\\"login\\\">{{login}}</small>\\n    </h2>\\n    <div class=\\\"tags\\\">\\n      <span class=\\\"tag\\\" data-value=\\\"{{followers}}\\\">followers</span>\\n      <span class=\\\"tag\\\" data-value=\\\"{{following}}\\\">following</span>\\n      <span class=\\\"tag\\\" data-value=\\\"{{total_repos}}\\\">repositories</span>\\n      <span class=\\\"tag\\\" data-value=\\\"{{total_gists}}\\\">gists</span>\\n    </div>\\n    <div class=\\\"button-container primary\\\">\\n      <button action=\\\"open\\\" data-value=\\\"{{html_url}}\\\">open in browser</button>\\n    </div>\\n  </div>\\n  <div class=\\\"list\\\">\\n    <div class=\\\"list-item\\\" action=\\\"gist\\\">\\n      <span class=\\\"octicon octicon-gist\\\"></span>\\n      <div class=\\\"container\\\">\\n        <span class=\\\"text\\\">Gists</span>\\n      </div>\\n    </div>\\n    <div class=\\\"list-item\\\" action=\\\"repos\\\">\\n      <div class=\\\"octicon octicon-repo\\\"></div>\\n      <div class=\\\"container\\\">\\n        <span class=\\\"text\\\">Repositories</span>\\n      </div>\\n    </div>\\n  </div>\\n</div>\");\n\n//# sourceURL=webpack:///./src/pages/github/gitHub.hbs?");

/***/ }),

/***/ "./src/pages/github/gitHub.include.js":
/*!********************************************!*\
  !*** ./src/pages/github/gitHub.include.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ \"./node_modules/@babel/runtime/helpers/defineProperty.js\");\n/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! html-tag-js */ \"./node_modules/html-tag-js/dist/tag.js\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(html_tag_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mustache */ \"./node_modules/mustache/mustache.js\");\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mustache__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_utils_helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/utils/helpers */ \"./src/lib/utils/helpers.js\");\n/* harmony import */ var _login_login__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../login/login */ \"./src/pages/login/login.js\");\n/* harmony import */ var _components_page__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/page */ \"./src/components/page.js\");\n/* harmony import */ var _gitHub_hbs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gitHub.hbs */ \"./src/pages/github/gitHub.hbs\");\n/* harmony import */ var _menu_hbs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./menu.hbs */ \"./src/pages/github/menu.hbs\");\n/* harmony import */ var _gitHub_scss__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./gitHub.scss */ \"./src/pages/github/gitHub.scss\");\n/* harmony import */ var _gitHub_scss__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_gitHub_scss__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _components_contextMenu__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/contextMenu */ \"./src/components/contextMenu.js\");\n/* harmony import */ var _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../lib/fileSystem/internalFs */ \"./src/lib/fileSystem/internalFs.js\");\n/* harmony import */ var _components_dialogs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../components/dialogs */ \"./src/components/dialogs.js\");\n/* harmony import */ var _lib_git__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../lib/git */ \"./src/lib/git.js\");\n/* harmony import */ var _repos_repos__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../repos/repos */ \"./src/pages/repos/repos.js\");\n/* harmony import */ var _gists_gists__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../gists/gists */ \"./src/pages/gists/gists.js\");\n\n\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n/**\n * \n * @param {object} options\n */\n\nfunction gitHubInclude() {\n  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n  var $search = html_tag_js__WEBPACK_IMPORTED_MODULE_1___default()('span', {\n    className: 'icon search hidden'\n  });\n  var $menuToggler = html_tag_js__WEBPACK_IMPORTED_MODULE_1___default()('span', {\n    className: 'icon more_vert',\n    attr: {\n      action: 'toggle-menu'\n    }\n  });\n  var $page = Object(_components_page__WEBPACK_IMPORTED_MODULE_5__[\"default\"])('Github');\n  var credentials = _lib_utils_helpers__WEBPACK_IMPORTED_MODULE_3__[\"default\"].credentials;\n  var github = _lib_git__WEBPACK_IMPORTED_MODULE_12__[\"default\"].GitHub();\n  var user = github.getUser();\n  var githubFile = cordova.file.externalDataDirectory + '.github';\n  var gitProfile = cordova.file.externalDataDirectory + '.git';\n  var $cm = Object(_components_contextMenu__WEBPACK_IMPORTED_MODULE_9__[\"default\"])(mustache__WEBPACK_IMPORTED_MODULE_2___default.a.render(_menu_hbs__WEBPACK_IMPORTED_MODULE_7__[\"default\"], strings), {\n    top: '8px',\n    right: '8px',\n    toggle: $menuToggler,\n    transformOrigin: 'top right'\n  });\n  $cm.addEventListener('click', handleClick);\n  $page.querySelector('header').append($search, $menuToggler);\n  _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].readFile(gitProfile).then(function (res) {\n    var decoder = new TextDecoder('utf-8');\n    var text = credentials.decrypt(decoder.decode(res.data));\n    var profile = JSON.parse(text || '{}');\n    render(profile);\n  })[\"catch\"](function (err) {\n    loadProfile();\n  });\n  /**\n   * \n   * @param {MouseEvent} e \n   */\n\n  function handleClick(e) {\n    /**\n     * @type {HTMLElement}\n     */\n    var $el = e.target;\n    var action = $el.getAttribute('action');\n    if (['logout', 'reload'].includes(action)) $cm.hide();\n\n    switch (action) {\n      case 'logout':\n        logout(function () {\n          plugins.toast.showShortBottom(strings.success);\n          $page.hide();\n        });\n        break;\n\n      case 'gist':\n        Object(_gists_gists__WEBPACK_IMPORTED_MODULE_14__[\"default\"])();\n        break;\n\n      case 'repos':\n        Object(_repos_repos__WEBPACK_IMPORTED_MODULE_13__[\"default\"])();\n        break;\n\n      case 'reload':\n        loadProfile(function (profile) {\n          var $content = html_tag_js__WEBPACK_IMPORTED_MODULE_1___default.a.get('#github');\n          if ($content) $content.remove();\n          $content = content(profile);\n          $page.append($content);\n          $content.addEventListener('click', handleClick);\n        });\n        break;\n\n      case 'open':\n        window.open($el.getAttribute('data-value'), '_system');\n        break;\n    }\n  }\n\n  function render(profile) {\n    var $content = content(profile);\n    $page.append($content);\n    app.appendChild($page);\n    actionStack.push({\n      id: 'github',\n      action: $page.hide\n    });\n\n    $page.onhide = function () {\n      actionStack.remove('github');\n    };\n\n    $content.addEventListener('click', handleClick);\n  }\n\n  function loadProfile(onload) {\n    _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.create('GitHub', strings.loading + '...');\n    user.getProfile().then(function (res) {\n      if (options.$loginPage) options.$loginPage.hide();\n      var profile = res.data;\n      var data = credentials.encrypt(JSON.stringify(profile));\n      _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].writeFile(gitProfile, data, true, false)[\"catch\"](function (err) {\n        plugins.toast.showShortBottom(strings.error);\n        console.log(err);\n      });\n      if (onload) onload(profile);else render(profile);\n    })[\"catch\"](function (err) {\n      if (err.response) {\n        console.log(err.response.data.message);\n        if (err.response.status === 401) logout();\n\n        if (options.$loginPage) {\n          options.$loginPage.setMessage(err.response.data.message);\n        } else {\n          Object(_login_login__WEBPACK_IMPORTED_MODULE_4__[\"default\"])();\n        }\n      } else {\n        console.log(err);\n      }\n    })[\"finally\"](function () {\n      _components_dialogs__WEBPACK_IMPORTED_MODULE_11__[\"default\"].loader.destroy();\n    });\n  }\n  /**\n   * \n   * @param {*} profile \n   * @returns {HTMLElement}\n   */\n\n\n  function content(profile) {\n    if (profile) {\n      profile.total_repos = profile.total_private_repos + profile.public_repos;\n      profile.total_gists = profile.private_gists + profile.public_gists;\n    }\n\n    return html_tag_js__WEBPACK_IMPORTED_MODULE_1___default.a.parse(mustache__WEBPACK_IMPORTED_MODULE_2___default.a.render(_gitHub_hbs__WEBPACK_IMPORTED_MODULE_6__[\"default\"], _objectSpread({}, strings, {}, profile)));\n  }\n\n  function logout(onlogout) {\n    if (localStorage.username) delete localStorage.username;\n    if (localStorage.password) delete localStorage.password;\n    if (localStorage.token) delete localStorage.token;\n    _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].deleteFile(githubFile).then(function () {\n      return _lib_fileSystem_internalFs__WEBPACK_IMPORTED_MODULE_10__[\"default\"].deleteFile(gitProfile);\n    })[\"finally\"](function () {\n      if (onlogout) onlogout();\n    });\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (gitHubInclude);\n\n//# sourceURL=webpack:///./src/pages/github/gitHub.include.js?");

/***/ }),

/***/ "./src/pages/github/gitHub.scss":
/*!**************************************!*\
  !*** ./src/pages/github/gitHub.scss ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/pages/github/gitHub.scss?");

/***/ }),

/***/ "./src/pages/github/menu.hbs":
/*!***********************************!*\
  !*** ./src/pages/github/menu.hbs ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<li action=\\\"reload\\\">\\n  <span class=\\\"text\\\">{{reload}}</span>\\n  <span class=\\\"icon refresh\\\"></span>\\n</li>\\n<li action=\\\"logout\\\">\\n  <span class=\\\"text\\\">{{logout}}</span>\\n  <span class=\\\"icon logout\\\"></span>\\n</li>\");\n\n//# sourceURL=webpack:///./src/pages/github/menu.hbs?");

/***/ }),

/***/ "./src/pages/repos/repos.js":
/*!**********************************!*\
  !*** ./src/pages/repos/repos.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n//jshint ignore:start\nfunction Repos() {\n  __webpack_require__.e(/*! import() | repos */ \"repos\").then(__webpack_require__.bind(null, /*! ./repos.include */ \"./src/pages/repos/repos.include.js\")).then(function (res) {\n    var Repos = res[\"default\"];\n    Repos();\n  });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Repos);\n\n//# sourceURL=webpack:///./src/pages/repos/repos.js?");

/***/ })

}]);