/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/injection.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _arrayWithoutHoles(arr) {\n  if (Array.isArray(arr)) {\n    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {\n      arr2[i] = arr[i];\n    }\n\n    return arr2;\n  }\n}\n\nmodule.exports = _arrayWithoutHoles;\n\n//# sourceURL=webpack:///./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js?");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/iterableToArray.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/iterableToArray.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _iterableToArray(iter) {\n  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === \"[object Arguments]\") return Array.from(iter);\n}\n\nmodule.exports = _iterableToArray;\n\n//# sourceURL=webpack:///./node_modules/@babel/runtime/helpers/iterableToArray.js?");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/nonIterableSpread.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/nonIterableSpread.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _nonIterableSpread() {\n  throw new TypeError(\"Invalid attempt to spread non-iterable instance\");\n}\n\nmodule.exports = _nonIterableSpread;\n\n//# sourceURL=webpack:///./node_modules/@babel/runtime/helpers/nonIterableSpread.js?");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/toConsumableArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/toConsumableArray.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var arrayWithoutHoles = __webpack_require__(/*! ./arrayWithoutHoles */ \"./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js\");\n\nvar iterableToArray = __webpack_require__(/*! ./iterableToArray */ \"./node_modules/@babel/runtime/helpers/iterableToArray.js\");\n\nvar nonIterableSpread = __webpack_require__(/*! ./nonIterableSpread */ \"./node_modules/@babel/runtime/helpers/nonIterableSpread.js\");\n\nfunction _toConsumableArray(arr) {\n  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();\n}\n\nmodule.exports = _toConsumableArray;\n\n//# sourceURL=webpack:///./node_modules/@babel/runtime/helpers/toConsumableArray.js?");

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _typeof2(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof2(obj); }\n\nfunction _typeof(obj) {\n  if (typeof Symbol === \"function\" && _typeof2(Symbol.iterator) === \"symbol\") {\n    module.exports = _typeof = function _typeof(obj) {\n      return _typeof2(obj);\n    };\n  } else {\n    module.exports = _typeof = function _typeof(obj) {\n      return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : _typeof2(obj);\n    };\n  }\n\n  return _typeof(obj);\n}\n\nmodule.exports = _typeof;\n\n//# sourceURL=webpack:///./node_modules/@babel/runtime/helpers/typeof.js?");

/***/ }),

/***/ "./src/injection.js":
/*!**************************!*\
  !*** ./src/injection.js ***!
  \**************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ \"./node_modules/@babel/runtime/helpers/toConsumableArray.js\");\n/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ \"./node_modules/@babel/runtime/helpers/typeof.js\");\n/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\n(function () {\n  if (window.consoleLoaded) return;\n  var inputContainer = document.createElement('c-input');\n  var input = document.createElement('div');\n  var toggler = document.createElement('c-toggler');\n  var clearBtn = document.createElement('c-toggler');\n  var tagsToReplace = {\n    '&': '&amp;',\n    '<': '&lt;',\n    '>': '&gt;'\n  };\n  var isFocused = false;\n  var flag;\n  var flask;\n  input.id = '__c-input';\n  inputContainer.appendChild(input);\n  clearBtn.innerHTML = '&times;';\n  clearBtn.onclick = clear;\n  clearBtn.style.fontSize = '1.2em';\n  clearBtn.style.left = 'calc(100vw - 40px)';\n  clearBtn.style.transform = \"translate(-2px, 2px)\";\n  toggler.innerHTML = '&#9888;';\n  toggler.style.transform = \"translate(2px, 2px)\";\n\n  input.onblur = function () {\n    setTimeout(function () {\n      isFocused = false;\n    }, 0);\n  };\n\n  toggler.onclick = toggleConsole;\n\n  toggler.ontouchstart = function () {\n    document.ontouchmove = function (e) {\n      toggler.style.transform = \"translate(\".concat(e.touches[0].clientX - 20, \"px, \").concat(e.touches[0].clientY - 20, \"px)\");\n    };\n\n    document.ontouchend = function (e) {\n      document.ontouchmove = null;\n      document.ontouchend = null;\n    };\n  };\n\n  var errId = '_c_error' + new Date().getMilliseconds();\n  var consoleElement = document.createElement('c-console');\n  var counter = {};\n  consoleElement.appendChild(inputContainer);\n\n  consoleElement.onclick = function (e) {\n    var el = e.target;\n    var action = el.getAttribute('action');\n\n    if (action === 'use code') {\n      var value = el.getAttribute('data-code');\n      flask.updateCode(value);\n      flask.elTextarea.focus();\n    }\n  };\n\n  if (!window.consoleLoaded) {\n    window.addEventListener('load', loadConsole);\n    window.addEventListener('error', function (err) {\n      console.error(err);\n    });\n  } else {\n    if (document.readyState === 'complete') {\n      loadConsole();\n    } else {\n      document.addEventListener('readystatechange', function () {\n        if (this.readyState === 'complete') loadConsole();\n      });\n    }\n  }\n\n  window.consoleLoaded = true;\n\n  function loadConsole() {\n    if (sessionStorage.getItem('__mode') === 'console') {\n      toggleConsole();\n    } else {\n      document.body.appendChild(toggler);\n    }\n\n    var allMetas = document.querySelectorAll('meta');\n\n    if (sessionStorage.getItem('_$mode') === 'mobile') {\n      var get = false;\n\n      for (var i = 0; i < allMetas.length; ++i) {\n        if (allMetas[i].name === 'viewport') {\n          allMetas[i].setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');\n          get = true;\n          break;\n        }\n      }\n\n      if (!get) {\n        var metaTag = document.createElement('meta');\n        metaTag.name = \"viewport\";\n        metaTag.content = \"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0\";\n        document.getElementsByTagName('head')[0].appendChild(metaTag);\n      }\n    } else if (window.__mode === 'desktop') {\n      for (var _i = 0; _i < allMetas.length; ++_i) {\n        if (allMetas[_i].name === 'viewport') {\n          allMetas[_i].setAttribute('content', 'user-scalable=yes, maximum-scale=2');\n        }\n      }\n    }\n  }\n\n  function toggleConsole() {\n    if (consoleElement.isConnected) {\n      document.body.removeChild(clearBtn);\n      document.body.removeChild(consoleElement);\n    } else {\n      document.body.appendChild(clearBtn);\n      document.body.appendChild(consoleElement);\n\n      if (!flag) {\n        flask = new CodeFlask('#__c-input', {\n          language: 'js'\n        });\n        /**\n         * @type {HTMLTextAreaElement}\n         */\n\n        var editor = flask.elTextarea;\n\n        if (editor) {\n          editor.addEventListener('keydown', function (e) {\n            var key = e.keyCode || e.which;\n            isFocused = true;\n\n            if (key === 13) {\n              e.preventDefault();\n              e.stopPropagation();\n              e.stopImmediatePropagation();\n              var regex = /[\\[|{\\(\\)\\}\\]]/g;\n              var code = this.value.trim();\n              var isOdd = (code.length - code.replace(regex, '').length) % 2;\n              var $code = document.createElement('c-code');\n              $code.textContent = code.length > 50 ? code.substr(0, 50) + '...' : code;\n              $code.setAttribute('data-code', code);\n              $code.setAttribute('action', 'use code');\n              if (!code || isOdd) return;\n              flask.updateCode('');\n              console.log(errId + 'code', $code.outerHTML);\n\n              var parsed = function () {\n                try {\n                  return esprima.parse(code, {\n                    range: true\n                  }).body;\n                } catch (e) {\n                  return [];\n                }\n              }();\n\n              var extra = '';\n              parsed.map(function (st) {\n                if (st.type === \"VariableDeclaration\") {\n                  if (['const', 'let'].indexOf(st.kind) < 0) return;\n                  var range = st.range;\n                  var excode = code.substring(range[0], range[1]) + ';';\n                  extra += excode;\n                }\n              });\n\n              if (extra) {\n                var script = document.createElement('script');\n                script.textContent = extra;\n                document.body.appendChild(script);\n                document.body.removeChild(script);\n                exec(code);\n              } else {\n                exec(code);\n              }\n            }\n          });\n        }\n\n        flag = true;\n      }\n    }\n\n    function exec(code) {\n      try {\n        var res = window.eval(code);\n        console.log(errId + 'log', res);\n      } catch (error) {\n        console.error(error);\n      }\n    }\n  }\n\n  function getBody(obj) {\n    var data = '';\n\n    if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(obj) === 'object') {\n      for (var key in obj) {\n        var val = obj[key];\n\n        var type = _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(val);\n\n        var $val = getElement(type);\n\n        if (type === 'function') {\n          val = parseFuntion(val);\n        } else if (type === 'object' && val !== null) {\n          val = val.constructor.name;\n        }\n\n        $val.textContent = escapeHTML(val + '');\n        data += \"<c-key>\".concat(key, \"</c-key>: \").concat($val.outerHTML, \"<br>\");\n      }\n    }\n\n    function replaceTag(tag) {\n      return tagsToReplace[tag] || tag;\n    }\n\n    function escapeHTML(str) {\n      if (!str) return;\n      return str.replace(/[&<>]/g, replaceTag);\n    }\n\n    return data;\n  }\n\n  function getElement(type) {\n    var el = document.createElement('c-text');\n\n    switch (type) {\n      case 'boolean':\n        el.classList.add('__c-boolean');\n        break;\n\n      case 'function':\n        el.classList.add('__c-function');\n        break;\n\n      case 'bigint':\n      case 'number':\n        el.classList.add('__c-number');\n        break;\n\n      case 'string':\n        el.classList.add('__c-string');\n        break;\n\n      case 'symbol':\n        el.classList.add('__c-symbol');\n        break;\n\n      case 'object':\n      case 'undefined':\n        el.classList.add('__c-undefined');\n        break;\n    }\n\n    return el;\n  }\n\n  function parseFuntion(data) {\n    var parsed;\n    var str;\n\n    try {\n      parsed = esprima.parse(data.toString()).body[0];\n    } catch (error) {\n      var fun = ('(' + data.toString() + ')').replace(/\\{.*\\}/, '{}');\n      parsed = esprima.parse(fun).body[0];\n    }\n\n    if (parsed.type === \"ExpressionStatement\") {\n      var expression = parsed.expression;\n\n      if (expression.type === \"ArrowFunctionExpression\") {\n        str = joinParams(expression.params, 'arrow');\n      } else if (expression.type === \"FunctionExpression\") {\n        str = joinParams(expression.params);\n      }\n    } else {\n      var string = parsed.id.name + joinParams(parsed.params);\n      str = string;\n    }\n\n    function joinParams(params, type) {\n      var parameter = '(';\n      params.map(function (param) {\n        parameter += param.type === \"RestElement\" ? '...' + param.argument.name : param.name + ',';\n      });\n      parameter = parameter.replace(/,$/, '');\n      parameter += ')' + (type === 'arrow' ? '=>' : '') + '{...}';\n      return parameter;\n    }\n\n    return str;\n  }\n\n  function log() {\n    var clean = null;\n    var error = null;\n    var args = Object.values(arguments);\n    var mode = 'normal';\n    var qoutes = '';\n\n    if (arguments.length === 0) {\n      args = [undefined];\n    }\n\n    if (arguments[0] === errId + 'error') {\n      error = arguments[1];\n      qoutes = 'no-qoutes';\n      var filename = error.filename || 'console';\n      args = [errId, error.message];\n      clean = filename;\n      if (error.lineno) clean += ':' + error.lineno;\n      if (error.colno) clean += ':' + error.colno;\n    } else if (arguments[0] === errId + 'log') {\n      clean = mode = 'console';\n      args.splice(0, 1);\n    } else if (arguments[0] === errId + 'code') {\n      mode = 'code';\n      args.splice(0, 1);\n    } else {\n      var err = getErrorObject();\n      var caller_line = err.stack.split('\\n')[arguments[0] === errId ? 4 : 3];\n      var index = caller_line.indexOf(\"at \");\n      clean = caller_line.slice(index + 2, caller_line.length);\n    }\n\n    if (mode === 'normal' && Array.isArray(clean)) {\n      var tmpclean = /\\/\\.run_(.+):(\\d+):(\\d+)/.exec(clean);\n\n      if (!tmpclean) {\n        clean = /^(.+):(\\d+):(\\d+)/.exec(clean.split('/').slice(-1));\n      } else {\n        clean = tmpclean;\n      }\n\n      var clean1 = clean[1].split(',');\n\n      if (clean1.length >= 2) {\n        clean[1] = clean1.pop();\n      }\n\n      clean = clean[1] + \":\" + clean[2] + \":\" + clean[3];\n    }\n\n    var flag = false;\n    var messages = document.createElement('c-message');\n    var _iteratorNormalCompletion = true;\n    var _didIteratorError = false;\n    var _iteratorError = undefined;\n\n    try {\n      for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {\n        var arg = _step.value;\n\n        var type = _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(arg);\n\n        var msg = void 0;\n\n        if (mode === 'code') {\n          messages.innerHTML = arg;\n        } else if (type !== 'object' || arg === null) {\n          if (arg === errId) {\n            messages.classList.add('error');\n            continue;\n          }\n\n          if (flag) {\n            messages.lastElementChild.setAttribute('style', arg);\n            flag = false;\n            continue;\n          }\n\n          msg = getElement(type);\n\n          if (type === 'function') {\n            arg = parseFuntion(arg);\n            arg += getBody(arg);\n          }\n\n          var valid = ['code', 'console'].indexOf(args[0]) > -1 ? args.length > 2 : args.length > 1;\n\n          if (type === 'undefined' || type === 'string') {\n            arg = arg + '';\n          } else {\n            arg = arg.toString();\n          }\n\n          if (/^%c/.test(arg) && valid) {\n            flag = true;\n            msg.textContent = arg.replace(/%[a-zA-Z]/, '');\n          } else {\n            msg.textContent = arg;\n          }\n\n          if (qoutes && type === 'string') msg.classList.add(qoutes);\n        } else {\n          if (flag) flag = false;\n\n          var _type = void 0;\n\n          var body = getBody(arg);\n\n          if (arg.constructor) {\n            _type = arg.constructor.name;\n          }\n\n          msg = document.createElement('c-text');\n          msg.innerHTML = \"<c-type>\".concat(_type, \"</c-type>\") + body;\n        }\n\n        if (msg) messages.appendChild(msg);\n      }\n    } catch (err) {\n      _didIteratorError = true;\n      _iteratorError = err;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && _iterator[\"return\"] != null) {\n          _iterator[\"return\"]();\n        }\n      } finally {\n        if (_didIteratorError) {\n          throw _iteratorError;\n        }\n      }\n    }\n\n    if (clean) {\n      var stack = document.createElement('c-stack');\n      clean = decodeURI(clean.replace('.run_', '').replace(/\\)$/, '').replace(location.origin, ''));\n      clean = clean.length > 35 ? '...' + clean.substr(clean.length - 32) : clean;\n      stack.textContent = clean;\n      messages.appendChild(stack);\n    } else if (mode === 'code') {\n      messages.style.marginBottom = '0';\n      messages.style.border = 'none';\n    }\n\n    consoleElement.insertBefore(messages, inputContainer);\n  }\n\n  function error() {\n    if (arguments.length === 0) return;\n    var error = arguments[0];\n\n    if (arguments[0] instanceof Error || arguments[0] instanceof ErrorEvent) {\n      log(errId + 'error', error);\n      return;\n    }\n\n    var args = Object.values(arguments);\n    args.unshift(errId);\n    log.apply(void 0, _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(args));\n  }\n\n  function count() {\n    var hash = (arguments[0] || 'default') + '';\n\n    if (!counter[hash]) {\n      counter[hash] = 1;\n    } else {\n      ++counter[hash];\n    }\n\n    log(\"\".concat(hash, \": \").concat(counter[hash]));\n  }\n\n  function clear() {\n    if (isFocused) input.focus();\n    consoleElement.textContent = '';\n    consoleElement.appendChild(inputContainer);\n  }\n\n  function getErrorObject() {\n    try {\n      throw Error('');\n    } catch (err) {\n      return err;\n    }\n  }\n\n  console = {\n    log: log,\n    error: error,\n    count: count,\n    clear: clear\n  };\n})();\n\n//# sourceURL=webpack:///./src/injection.js?");

/***/ })

/******/ });