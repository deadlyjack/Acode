(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["repo-info"],{

/***/ "./src/pages/info/info.js":
/*!********************************!*\
  !*** ./src/pages/info/info.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Info; });\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! html-tag-js */ \"./node_modules/html-tag-js/dist/tag.js\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(html_tag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/page */ \"./src/components/page.js\");\n/* harmony import */ var _lib_git__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/git */ \"./src/lib/git.js\");\n/* harmony import */ var _components_dialogs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/dialogs */ \"./src/components/dialogs.js\");\n/* harmony import */ var _info_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./info.scss */ \"./src/pages/info/info.scss\");\n/* harmony import */ var _info_scss__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_info_scss__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\nfunction Info(repo, owner) {\n  var $page = Object(_components_page__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(repo);\n  var gitHub = _lib_git__WEBPACK_IMPORTED_MODULE_2__[\"default\"].GitHub();\n  var repository = gitHub.getRepo(owner, repo);\n  _components_dialogs__WEBPACK_IMPORTED_MODULE_3__[\"default\"].loader.create(repo, strings.loading + '...');\n  repository.getReadme('master', false).then(function (res) {\n    if (res.statusText === 'OK') {\n      var data = res.data;\n      var text = data.content;\n\n      if (data.encoding === 'base64') {\n        text = atob(text);\n      }\n\n      return gitHub.getMarkdown().render({\n        text: text\n      });\n    } else {\n      return Promise.reject(res);\n    }\n  }).then(function (res) {\n    if (res.statusText === 'OK') {\n      var text = res.data;\n      $page.append(html_tag_js__WEBPACK_IMPORTED_MODULE_0___default()('div', {\n        id: 'info-page',\n        className: 'main',\n        innerHTML: text\n      }));\n    } else {\n      $page.hide();\n    }\n  })[\"catch\"](function (err) {\n    _components_dialogs__WEBPACK_IMPORTED_MODULE_3__[\"default\"].alert(strings.error, err.message);\n    console.log(err);\n    $page.hide();\n  })[\"finally\"](function () {\n    _components_dialogs__WEBPACK_IMPORTED_MODULE_3__[\"default\"].loader.destroy();\n  });\n  actionStack.push({\n    id: 'info',\n    action: $page.hide\n  });\n\n  $page.onhide = function () {\n    actionStack.remove('info');\n  };\n\n  app.appendChild($page);\n}\n\n//# sourceURL=webpack:///./src/pages/info/info.js?");

/***/ }),

/***/ "./src/pages/info/info.scss":
/*!**********************************!*\
  !*** ./src/pages/info/info.scss ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/pages/info/info.scss?");

/***/ })

}]);