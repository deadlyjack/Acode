"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkcom_foxdebug_acode"] = self["webpackChunkcom_foxdebug_acode"] || []).push([["angularjs"],{

/***/ "./src/pages/fileBrowser/projects/ngjs.js":
/*!************************************************!*\
  !*** ./src/pages/fileBrowser/projects/ngjs.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  'index.html': '<!DOCTYPE html>\\n<html lang=\"en\">\\n<head>\\n  <meta charset=\"UTF-8\">\\n  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">\\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\\n\\n  <title><%name%></title>\\n  \\n  <!-- AngularJS -->\\n  <script src=\"https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js\"></script>\\n  <script src=\"https://cdn.jsdelivr.net/npm/angular@1.7.3/angular.min.js\"></script>\\n  \\n</head>\\n\\n<body>\\n  <!-- AngularJS App Container -->\\n<div id=\"angular-app\" data-ng-app=\"app\">\\n  <div data-ng-controller=\"MainCtrl as vm\" class=\"\">\\n    <h1 class=\"\">{{heading}}</h1>\\n    <p class=\"\">{{text}}</p>\\n  </div>\\n</div>\\n  <!-- Project -->\\n  <script src=\"index.js\"></script>\\n</body>\\n</html>',\n  'index.js': 'angular.module(\"app\", [])\\n  .controller(\"MainCtrl\", function ($scope) {\\n    $scope.heading = \"<%name%>\";\\n    $scope.text = \"Angular is different from AngularJS.\";\\n  });'\n});\n\n//# sourceURL=webpack://com.foxdebug.acode/./src/pages/fileBrowser/projects/ngjs.js?");

/***/ })

}]);