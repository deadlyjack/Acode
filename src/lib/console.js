import 'core-js/stable';
import loadPolyFill from './utils/polyfill';

(function () {
  loadPolyFill.apply(window);

  if (!HTMLElement.prototype.append) {
    HTMLElement.prototype.append = function (...node) {
      for (let el of node) this.appendChild(el);
    };
  }

  if (window.consoleLoaded) return;
  const inputContainer = document.createElement('c-input');
  const input = document.createElement('textarea');
  const toggler = document.createElement('c-toggler');
  const errId = '_c_error' + new Date().getMilliseconds();
  const consoleElement = document.createElement('c-console');
  const counter = {};
  const _console = console;
  const tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  let isFocused = false;
  let flag;

  input.id = '__c-input';
  inputContainer.appendChild(input);

  toggler.innerHTML = '&#9888;';
  toggler.style.transform = `translate(2px, ${innerHeight / 2}px)`;

  input.onblur = function () {
    setTimeout(() => {
      isFocused = false;
    }, 0);
  };

  toggler.onclick = toggleConsole;

  toggler.ontouchstart = function () {
    document.addEventListener('touchmove', touchmove, {
      passive: false,
    });

    document.ontouchend = function (e) {
      document.removeEventListener('touchmove', touchmove, {
        passive: 'false',
      });
      document.ontouchend = null;
    };
  };

  consoleElement.appendChild(inputContainer);

  consoleElement.onclick = function (e) {
    const el = e.target;
    const action = el.getAttribute('action');

    switch (action) {
      case 'use code':
        const value = el.getAttribute('data-code');

        input.value = value;
        input.focus();
        break;

      default:
        break;
    }
  };

  if (!window.consoleLoaded) {
    window.addEventListener('load', loadConsole);
    window.addEventListener('error', function (err) {
      console.error(err);
    });
  } else {
    if (document.readyState === 'complete') {
      loadConsole();
    } else {
      document.addEventListener('readystatechange', function () {
        if (this.readyState === 'complete') loadConsole();
      });
    }
  }

  window.consoleLoaded = true;

  function touchmove(e) {
    e.preventDefault();
    toggler.style.transform = 'translate('
      .concat(e.touches[0].clientX - 20, 'px, ')
      .concat(e.touches[0].clientY - 20, 'px)');
  }

  function loadConsole() {
    if (sessionStorage.getItem('__mode') === 'console') {
      toggleConsole();
    } else {
      if (!toggler.isConnected) {
        document.body.appendChild(toggler);
      }
      setInterval(() => {
        if (!toggler.isConnected) document.body.appendChild(toggler);
      }, 1000);
    }
    const allMetas = document.querySelectorAll('meta');

    if (sessionStorage.getItem('_$mode') === 'mobile') {
      let get = false;
      for (let i = 0; i < allMetas.length; ++i) {
        if (allMetas[i].name === 'viewport') {
          allMetas[i].setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
          );
          get = true;
          break;
        }
      }

      if (!get) {
        const metaTag = document.createElement('meta');
        metaTag.name = 'viewport';
        metaTag.content =
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
        document.getElementsByTagName('head')[0].appendChild(metaTag);
      }
    } else if (window.__mode === 'desktop') {
      for (let i = 0; i < allMetas.length; ++i) {
        if (allMetas[i].name === 'viewport') {
          allMetas[i].setAttribute(
            'content',
            'user-scalable=yes, maximum-scale=2'
          );
        }
      }
    }
  }

  function toggleConsole() {
    if (consoleElement.isConnected) {
      consoleElement.remove();
    } else {
      document.body.appendChild(consoleElement);
      if (!flag) {
        input.addEventListener('keydown', function (e) {
          const key = e.keyCode || e.which;
          isFocused = true;
          if (key === 13) {
            const regex = /[\[|{\(\)\}\]]/g;
            let code = this.value.trim();
            let isOdd = (code.length - code.replace(regex, '').length) % 2;

            if (!code || isOdd) return;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const $code = document.createElement('c-code');

            $code.textContent =
              code.length > 50 ? code.substr(0, 50) + '...' : code;
            $code.setAttribute('data-code', code);
            $code.setAttribute('action', 'use code');
            input.value = '';
            console.log(errId + 'code', $code.outerHTML);
            execute(code);
          }
        });
        flag = true;
      }
    }
  }

  function getBody(obj) {
    const toggler = document.createElement('c-type');
    const group = document.createElement('c-group');

    if (obj instanceof Promise) obj = getPromiseStatus(obj);

    toggler.onclick = function () {
      if (this.classList.contains('__show-data')) {
        this.classList.remove('__show-data');
        group.textContent = null;
        return;
      }

      this.classList.toggle('__show-data');

      let keys = [
        ...Object.keys(obj),
        ...Object.getOwnPropertyNames(obj),
        '__proto__',
        'prototype',
      ];

      keys = [...new Set(keys)];

      for (let key in obj) {
        if (!keys.includes(key)) append(key);
      }

      for (let key of keys) {
        append(key);
      }

      function append(key, isProto) {
        if (!(key in obj)) return;
        let val = obj[key];
        const $key = document.createElement('c-key');
        const type = typeof val;
        const $val = getElement(type);
        if (type === 'object' && val !== null) {
          $val.append(...getBody(val));
        } else {
          if (type === 'function') {
            val = parseFuntion(val);
          }
          $val.textContent = escapeHTML(val + '');
        }

        $key.textContent = key + ':';
        if (isProto) $key.setAttribute('type', 'proto');
        const $line = document.createElement('c-line');
        $line.append($key, $val);
        group.append($line);
      }
    };
    toggler.setAttribute('type', 'body-toggler');
    toggler.textContent = (obj.constructor && obj.constructor.name) || 'Object';

    return [toggler, group];

    // return `<c-type action="toggle-body" class="__show-data">${type}</c-type><c-group>${data}</c-group>`;

    function replaceTag(tag) {
      return tagsToReplace[tag] || tag;
    }

    function escapeHTML(str) {
      if (!str) return;
      return str.replace(/[&<>]/g, replaceTag);
    }
  }

  function getPromiseStatus(obj) {
    if (obj.info) return;
    let status = 'pending';
    let value;
    let result = obj.then(
      (val) => {
        status = 'resolved';
        value = val;
      },
      (val) => {
        status = 'rejected';
        value = val;
      }
    );

    Object.defineProperties(result, {
      '[[PromiseStatus]]': {
        get: () => status,
      },
      '[[PromiseValue]]': {
        get: () => value,
      },
    });

    return result;
  }

  function getElement(type) {
    const el = document.createElement('c-text');
    switch (type) {
      case 'boolean':
        el.classList.add('__c-boolean');
        break;

      case 'function':
        el.classList.add('__c-function');
        break;

      case 'bigint':
      case 'number':
        el.classList.add('__c-number');
        break;

      case 'string':
        el.classList.add('__c-string');
        break;

      case 'symbol':
        el.classList.add('__c-symbol');
        break;

      case 'object':
      case 'undefined':
        el.classList.add('__c-undefined');
        break;
    }

    return el;
  }

  function parseFuntion(data) {
    let parsed;
    let str;

    try {
      parsed = esprima.parse(data.toString()).body[0];
    } catch (error) {
      try {
        const fun = ('(' + data.toString() + ')').replace(/\{.*\}/, '{}');
        parsed = esprima.parse(fun).body[0];
      } catch (error) {
        return data
          .toString()
          .replace(/({).*(})/, '$1...$2')
          .replace(/^function\s+[\w_$\d]+\s*/, '')
          .replace(/\s*/g, '');
      }
    }

    if (parsed.type === 'ExpressionStatement') {
      const expression = parsed.expression;
      if (expression.type === 'ArrowFunctionExpression') {
        str = joinParams(expression.params, 'arrow');
      } else if (expression.type === 'FunctionExpression') {
        str = joinParams(expression.params);
      }
    } else {
      let string = parsed.id.name + joinParams(parsed.params || []);
      str = string;
    }

    function joinParams(params, type) {
      let parameter = '(';
      params.map(
        (param) =>
          (parameter +=
            param.type === 'RestElement'
              ? '...' + param.argument.name
              : param.name + ',')
      );
      parameter = parameter.replace(/,$/, '');
      parameter += ')' + (type === 'arrow' ? '=>' : '') + '{...}';
      return parameter;
    }

    return str;
  }

  function log() {
    _console.log(...arguments);

    let clean = null;
    let error = null;
    let args = Object.values(arguments);
    let mode = 'normal';
    let qoutes = '';
    if (arguments.length === 0) {
      args = [undefined];
    }
    if (arguments[0] === errId + 'error') {
      error = arguments[1];
      qoutes = 'no-qoutes';
      const filename = error.filename || 'console';
      args = [errId, error.message];
      clean = filename;
      if (error.lineno) clean += ':' + error.lineno;
      if (error.colno) clean += ':' + error.colno;
    } else if (arguments[0] === errId + 'log') {
      clean = mode = 'console';
      args.splice(0, 1);
    } else if (arguments[0] === errId + 'code') {
      mode = 'code';
      args.splice(0, 1);
    } else {
      const err = getErrorObject();
      const caller_line =
        err.stack.split('\n')[arguments[0] === errId ? 4 : 3] || 'at console';
      const index = caller_line.indexOf('at ');
      clean = caller_line.slice(index + 2, caller_line.length);
    }

    if (mode === 'normal' && Array.isArray(clean)) {
      let tmpclean = /\/\.run_(.+):(\d+):(\d+)/.exec(clean);

      if (!tmpclean) {
        clean = /^(.+):(\d+):(\d+)/.exec(clean.split('/').slice(-1));
      } else {
        clean = tmpclean;
      }

      const clean1 = clean[1].split(',');

      if (clean1.length >= 2) {
        clean[1] = clean1.pop();
      }
      clean = clean[1] + ':' + clean[2] + ':' + clean[3];
    }
    let flag = false;
    const messages = document.createElement('c-message');

    for (let arg of args) {
      const type = typeof arg;
      let msg, extras;
      if (mode === 'code') {
        messages.innerHTML = arg;
      } else if (type !== 'object' || arg === null) {
        if (arg === errId) {
          messages.classList.add('error');
          continue;
        }

        if (flag) {
          messages.lastElementChild.setAttribute('style', arg);
          flag = false;
          continue;
        }

        msg = getElement(type);
        if (type === 'function') {
          const fun = arg;
          arg = parseFuntion(arg);
          extras = getBody(fun);
        }

        const valid =
          ['code', 'console'].indexOf(args[0]) > -1
            ? args.length > 2
            : args.length > 1;

        if (type === 'undefined' || type === 'string' || arg === null) {
          arg = arg + '';
        } else {
          arg = arg.toString();
        }
        if (/^%c/.test(arg) && valid) {
          flag = true;
          msg.textContent = arg.replace(/%[a-zA-Z]/, '');
        } else {
          msg.textContent = arg;
        }

        if (qoutes && type === 'string') msg.classList.add(qoutes);

        if (extras) {
          const $line = document.createElement('c-line');
          $line.append(...extras);
          msg.append($line);
        }
      } else {
        if (flag) flag = false;
        let body = getBody(arg);
        msg = document.createElement('c-text');
        msg.append(...body);
      }
      if (msg) messages.appendChild(msg);
    }

    if (clean) {
      const stack = document.createElement('c-stack');
      clean = decodeURI(
        clean
          .replace('.run_', '')
          .replace(/\)$/, '')
          .replace(location.origin, '')
      );
      clean =
        clean.length > 35 ? '...' + clean.substr(clean.length - 32) : clean;
      stack.innerHTML = `<c-date>${new Date().toLocaleString()}</c-date><c-trace>${clean}</c-trace>`;
      messages.appendChild(stack);
    } else if (mode === 'code') {
      messages.style.marginBottom = '0';
      messages.style.border = 'none';
    }
    consoleElement.insertBefore(messages, inputContainer);

    while (consoleElement.childElementCount - 100 > 0)
      consoleElement.firstElementChild.remove();
  }

  function error() {
    _console.error(...arguments);
    if (arguments.length === 0) return;
    const error = arguments[0];
    if (arguments[0] instanceof Error || arguments[0] instanceof ErrorEvent) {
      log(errId + 'error', error);
      return;
    }
    const args = Object.values(arguments);
    args.unshift(errId);
    log(...args);
  }

  function count() {
    const hash = (arguments[0] || 'default') + '';

    if (!counter[hash]) {
      counter[hash] = 1;
    } else {
      ++counter[hash];
    }
    log(`${hash}: ${counter[hash]}`);
  }

  function clear() {
    if (isFocused) input.focus();
    consoleElement.textContent = '';
    consoleElement.appendChild(inputContainer);
  }

  function getErrorObject() {
    try {
      throw Error('');
    } catch (err) {
      return err;
    }
  }

  console = {
    log,
    error,
    count,
    clear,
    warn: error,
    info: log,
  };

  function execute(code) {
    try {
      const parsed = esprima.parse(code, {
        range: true,
      }).body;
      doStuff(parsed);
    } catch (e) {
      doStuff([]);
    }

    function doStuff(parsed) {
      let extra = '';
      parsed.map((st) => {
        if (st.type === 'VariableDeclaration') {
          if (['const', 'let'].indexOf(st.kind) < 0) return;

          const range = st.range;
          const excode = code.substring(range[0], range[1]) + ';';
          extra += excode;
        }
      });

      if (extra) {
        const script = document.createElement('script');
        script.textContent = extra;
        document.body.appendChild(script);
        document.body.removeChild(script);
        exec(code);
      } else {
        exec(code);
      }
    }

    function exec(code) {
      try {
        let res = window.eval(code);
        console.log(errId + 'log', res);
      } catch (error) {
        console.error(error);
      }
    }
  }

  if (!window.consoleLoaded) {
    window.addEventListener('error', function (err) {
      console.error(err);
    });
  }
})();
