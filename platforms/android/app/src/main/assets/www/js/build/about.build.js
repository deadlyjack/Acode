"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkcom_foxdebug_acode"] = self["webpackChunkcom_foxdebug_acode"] || []).push([["about"],{

/***/ "./src/pages/about/about.include.js":
/*!******************************************!*\
  !*** ./src/pages/about/about.include.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ AboutInclude; }\n/* harmony export */ });\n/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ \"./node_modules/@babel/runtime/helpers/esm/defineProperty.js\");\n/* harmony import */ var _about_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./about.scss */ \"./src/pages/about/about.scss\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! html-tag-js */ \"./node_modules/html-tag-js/dist/tag.js\");\n/* harmony import */ var html_tag_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(html_tag_js__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mustache__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mustache */ \"./node_modules/mustache/mustache.mjs\");\n/* harmony import */ var _components_page__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/page */ \"./src/components/page.js\");\n/* harmony import */ var _about_hbs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./about.hbs */ \"./src/pages/about/about.hbs\");\n/* harmony import */ var _utils_helpers__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/helpers */ \"./src/utils/helpers.js\");\n\n\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }\n\n\n\n\n\n\n\nfunction AboutInclude() {\n  var $page = (0,_components_page__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(strings.about.capitalize());\n  system.getWebviewInfo(function (res) {\n    return render(res);\n  }, function () {\n    return render();\n  });\n  actionStack.push({\n    id: 'about',\n    action: $page.hide\n  });\n\n  $page.onhide = function () {\n    actionStack.remove('about');\n    _utils_helpers__WEBPACK_IMPORTED_MODULE_6__[\"default\"].hideAd();\n  };\n\n  app.append($page);\n  _utils_helpers__WEBPACK_IMPORTED_MODULE_6__[\"default\"].showAd();\n\n  function render(webview) {\n    var $content = html_tag_js__WEBPACK_IMPORTED_MODULE_2___default().parse(mustache__WEBPACK_IMPORTED_MODULE_3__[\"default\"].render(_about_hbs__WEBPACK_IMPORTED_MODULE_5__[\"default\"], _objectSpread(_objectSpread({}, BuildInfo), {}, {\n      webview: webview\n    })));\n    $page.classList.add('about-us');\n    $page.body = $content;\n  }\n}\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/about/about.include.js?");

/***/ }),

/***/ "./src/pages/about/about.scss":
/*!************************************!*\
  !*** ./src/pages/about/about.scss ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/about/about.scss?");

/***/ }),

/***/ "./src/pages/about/about.hbs":
/*!***********************************!*\
  !*** ./src/pages/about/about.hbs ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"<div id='about-page' class='main scroll'>\\n  <span class='logo' style='background-image: url(./res/logo/logo.png);'></span>\\n  <div class='list'>\\n    <span class='list-item'>\\n      <span class='icon no-icon'></span>\\n      <div class='container'>\\n        <h2 class='text'>Acode editor {{version}} ({{versionCode}})</h2>\\n      </div>\\n    </span>\\n    {{#webview}}\\n      <a\\n        class='list-item no-transform'\\n        href='https://play.google.com/store/apps/details?id={{packageName}}'\\n      >\\n        <span class='icon googlechrome'></span>\\n        <div class='container'>\\n          <span class='text'>Webview {{versionName}}</span>\\n          <span class='value'>{{packageName}}</span>\\n        </div>\\n      </a>\\n    {{/webview}}\\n    <a class='list-item' href='https://acode.foxdebug.com'>\\n      <span class='icon acode'></span>\\n      <div class='container'>\\n        <span class='text'>Official webpage</span>\\n      </div>\\n    </a>\\n    <a class='list-item' href='https://foxdebug.com'>\\n      <span class='icon foxdebug'></span>\\n      <div class='container'>\\n        <span class='text'>foxdebug.com</span>\\n      </div>\\n    </a>\\n    <a class='list-item' href='mailto:apps@foxdebug.com'>\\n      <span class='icon gmail'></span>\\n      <div class='container'>\\n        <span class='text'>Mail</span>\\n      </div>\\n    </a>\\n    <a class='list-item' href='https://twitter.com/foxdebug'>\\n      <span class='icon twitter'></span>\\n      <div class='container'>\\n        <span class='text'>Twitter</span>\\n      </div>\\n    </a>\\n    <a class='list-item' href='https://www.instagram.com/foxdebug_com/'>\\n      <span class='icon instagram'></span>\\n      <div class='container'>\\n        <span class='text'>Instagram</span>\\n      </div>\\n    </a>\\n    <a class='list-item' href='https://github.com/deadlyjack/acode'>\\n      <span class='icon github'></span>\\n      <div class='container'>\\n        <span class='text'>GitHub</span>\\n      </div>\\n    </a>\\n\\n  <div style='height: 30vh; width: 10vw'></div>\\n</div>\");\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/about/about.hbs?");

/***/ })

}]);