"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkcom_foxdebug_acode"] = self["webpackChunkcom_foxdebug_acode"] || []).push([["githublogin"],{

/***/ "./src/pages/login/login.include.js":
/*!******************************************!*\
  !*** ./src/pages/login/login.include.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ GithubLoginInclude; }\n/* harmony export */ });\n/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ \"./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js\");\n/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ \"./node_modules/@babel/runtime/regenerator/index.js\");\n/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _login_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./login.scss */ \"./src/pages/login/login.scss\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! html-tag-js */ \"./node_modules/html-tag-js/dist/tag.js\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(html_tag_js__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! mustache */ \"./node_modules/mustache/mustache.mjs\");\n/* harmony import */ var _components_page__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/page */ \"./src/components/page.js\");\n/* harmony import */ var _login_hbs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./login.hbs */ \"./src/pages/login/login.hbs\");\n/* harmony import */ var _utils_helpers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/helpers */ \"./src/utils/helpers.js\");\n/* harmony import */ var _github_gitHub__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../github/gitHub */ \"./src/pages/github/gitHub.js\");\n/* harmony import */ var _lib_constants__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../lib/constants */ \"./src/lib/constants.js\");\n/* harmony import */ var _utils_Url__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/Url */ \"./src/utils/Url.js\");\n/* harmony import */ var _fileSystem_fsOperation__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../fileSystem/fsOperation */ \"./src/fileSystem/fsOperation.js\");\n\n\n\n\n\n\n\n\n\n\n\n\nfunction GithubLoginInclude() {\n  return _GithubLoginInclude.apply(this, arguments);\n}\n\nfunction _GithubLoginInclude() {\n  _GithubLoginInclude = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__[\"default\"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee() {\n    var $page, $content, $form, $input, $token, $errorMsg, $info, fs, storeCredentials;\n    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            storeCredentials = function _storeCredentials(e) {\n              e.preventDefault();\n              var token = $token.value;\n              var credentials = _utils_helpers__WEBPACK_IMPORTED_MODULE_7__[\"default\"].credentials;\n              if (token) localStorage.setItem('token', credentials.encrypt(token));else return $errorMsg.textContent = 'Please enter GitHub token!';\n              (0,_github_gitHub__WEBPACK_IMPORTED_MODULE_8__[\"default\"])($page);\n            };\n\n            $page = (0,_components_page__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(strings['github login']);\n            $content = html_tag_js__WEBPACK_IMPORTED_MODULE_3___default().parse(mustache__WEBPACK_IMPORTED_MODULE_4__[\"default\"].render(_login_hbs__WEBPACK_IMPORTED_MODULE_6__[\"default\"], strings));\n            $form = $content.get('.form');\n            $input = $content.get('input');\n            $token = $content.get('#token');\n            $errorMsg = $content.get('#error-msg');\n            $info = html_tag_js__WEBPACK_IMPORTED_MODULE_3___default()('a', {\n              className: 'icon help',\n              href: _lib_constants__WEBPACK_IMPORTED_MODULE_9__[\"default\"].GITHUB_TOKEN\n            });\n            fs = (0,_fileSystem_fsOperation__WEBPACK_IMPORTED_MODULE_11__[\"default\"])(_utils_Url__WEBPACK_IMPORTED_MODULE_10__[\"default\"].join(DATA_STORAGE, '.github'));\n            _context.next = 11;\n            return fs.exists();\n\n          case 11:\n            if (!_context.sent) {\n              _context.next = 13;\n              break;\n            }\n\n            fs.delete();\n\n          case 13:\n            $page.header.append($info);\n            $page.body = $content;\n\n            $input.onclick = function () {\n              return $errorMsg.textContent = '';\n            };\n\n            $form.onsubmit = storeCredentials;\n            actionStack.push({\n              id: 'github login',\n              action: $page.hide\n            });\n\n            $page.onhide = function () {\n              _utils_helpers__WEBPACK_IMPORTED_MODULE_7__[\"default\"].hideAd();\n              actionStack.remove('github login');\n            };\n\n            Object.defineProperty($page, 'setMessage', {\n              value: function value(msg) {\n                $errorMsg.textContent = msg;\n              }\n            });\n            app.append($page);\n            _utils_helpers__WEBPACK_IMPORTED_MODULE_7__[\"default\"].showAd();\n\n          case 22:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee);\n  }));\n  return _GithubLoginInclude.apply(this, arguments);\n}\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/login/login.include.js?");

/***/ }),

/***/ "./src/pages/login/login.scss":
/*!************************************!*\
  !*** ./src/pages/login/login.scss ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/login/login.scss?");

/***/ }),

/***/ "./src/pages/login/login.hbs":
/*!***********************************!*\
  !*** ./src/pages/login/login.hbs ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<div id='github-login' class='main'>\\r\\n  <form class='form' action='#'>\\r\\n    <input type='text' id='token' placeholder='GitHub token' />\\r\\n\\r\\n    <span id='error-msg'></span>\\r\\n    <div class='button-container primary'>\\r\\n      <button type='submit'>{{login}}</button>\\r\\n    </div>\\r\\n  </form>\\r\\n</div>\");\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/login/login.hbs?");

/***/ })

}]);