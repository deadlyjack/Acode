import 'core-js/stable';
import 'html-tag-js/dist/polyfill';
import tag from 'html-tag-js';
import * as esprima from 'esprima';
import loadPolyFill from './utils/polyfill';

(function () {
  loadPolyFill.apply(window);

  let consoleVisible = false;
  const originalConsole = console;
  const $input = tag('textarea', {
    id: '__c-input',
    onblur() {
      setTimeout(() => {
        isFocused = false;
      }, 0);
    }
  });
  const $inputContainer = tag('c-input', {
    child: $input
  });
  const $toggler = tag('c-toggler', {
    style: {
      transform: `translate(2px, ${innerHeight / 2}px)`
    },
    onclick() {
      consoleVisible = !consoleVisible;
      if (consoleVisible) {
        showConsole();
      } else {
        hideConsole();
      }
    },
    ontouchstart() {
      document.addEventListener('touchmove', touchmove, {
        passive: false,
      });

      document.ontouchend = function (e) {
        document.removeEventListener('touchmove', touchmove, {
          passive: 'false',
        });
        document.ontouchend = null;
      };
    }
  });
  const $console = tag('c-console', {
    child: $inputContainer,
    onclick(e) {
      const el = e.target;
      const action = el.getAttribute('action');

      switch (action) {
        case 'use code':
          const value = el.getAttribute('data-code');

          $input.value = value;
          $input.focus();
          break;

        default:
          break;
      }
    }
  });
  const counter = {};
  const timers = {};
  let isFocused = false;

  if (!window.__objs) window.__objs = {};

  if (!tag.get('c-console')) {
    const $style = tag('style');
    $style.textContent = css();
    document.head.append($style);
    window.addEventListener('error', onError);
    assignCustomConsole();

    if (sessionStorage.getItem('__mode') === 'console') {
      showConsole();
      return;
    }

    tag.get('html').append($toggler);
    $console.setAttribute('title', 'Console');
    sessionStorage.setItem('__console_available', true);
    document.addEventListener('showconsole', showConsole);
    document.addEventListener('hideconsole', hideConsole);
  }

  function touchmove(e) {
    e.preventDefault();
    $toggler.style.transform = 'translate('
      .concat(e.touches[0].clientX - 20, 'px, ')
      .concat(e.touches[0].clientY - 20, 'px)');
  }

  function assignCustomConsole() {
    window.console = {
      assert(condition, msg, ...substituion) {
        if (!condition) {
          log('error', getStack(new Error()), msg, ...substituion);
        }
      },
      clear() {
        if (isFocused) $input.focus();
        $console.textContent = '';
        $console.appendChild($inputContainer);
      },
      count(hash = 'default') {
        if (!counter[hash]) {
          counter[hash] = 1;
        } else {
          ++counter[hash];
        }
        log('log', getStack(new Error()), `${hash}: ${counter[hash]}`);
      },
      countReset(hash) {
        delete counter[hash];
      },
      debug(...args) {
        log('log', getStack(new Error()), ...args);
      },
      dir(...args) {
        log('log', getStack(new Error()), ...args);
      },
      dirxml(...args) {
        log('log', getStack(new Error()), ...args);
      },
      error(...args) {
        originalConsole.error(...args);
        log('error', getStack(new Error()), ...args);
      },
      group(...args) {
        log('log', getStack(new Error()), ...args);
      },
      groupCollapsed(...args) {
        log('log', getStack(new Error()), ...args);
      },
      groupEnd(...args) {
        log('log', getStack(new Error()), ...args);
      },
      info(...args) {
        originalConsole.info(...args);
        log('info', getStack(new Error()), ...args);
      },
      log(msg, ...substituion) {
        originalConsole.log(msg, ...substituion);
        log('log', getStack(new Error()), msg, ...substituion);
      },
      table(...args) {
        log('log', getStack(new Error()), ...args);
      },
      time(label = 'default') {
        if (typeof label !== 'string') {
          throw new TypeError('label must be a string');
        }
        timers[label] = new Date().getTime();
      },
      timeEnd(label = 'default') {
        if (typeof label !== 'string') {
          throw new TypeError('label must be a string');
        }
        if (!timers[label]) {
          throw new Error(`No such label: ${label}`);
        }
        const time = new Date().getTime() - timers[label];
        log('log', getStack(new Error()), `${label}: ${time}ms`);
        delete timers[label];
      },
      timeLog(label = 'default') {
        if (typeof label !== 'string') {
          throw new TypeError('label must be a string');
        }
        if (!timers[label]) {
          throw new Error(`No such label: ${label}`);
        }
        const time = new Date().getTime() - timers[label];
        log('log', getStack(new Error()), `${label}: ${time}ms`);
      },
      trace(...args) {
        log('trace', getStack(new Error()), ...args);
      },
      warn(msg, ...substituion) {
        originalConsole.warn(msg, ...substituion);
        log('warn', getStack(new Error()), msg, ...substituion);
      },
    };
  }

  function showConsole() {
    tag.get('html').append($console);
    $input.addEventListener('keydown', onCodeInput);
  }

  function hideConsole() {
    $console.remove();
    $input.removeEventListener('keydown', onCodeInput);
  }

  function onCodeInput(e) {
    const key = e.key;
    isFocused = true;
    if (key === 'Enter') {
      const regex = /[\[|{\(\)\}\]]/g;
      let code = this.value.trim();
      let isOdd = (code.length - code.replace(regex, '').length) % 2;

      if (!code || isOdd) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      log('code', {}, code);
      $input.value = '';
      const res = execute(code);
      if (res.type === 'error') {
        log('error', getStack(new Error()), res.value);
      } else {
        log('log', getStack(new Error()), res.value);
      }
    }
  }

  function getBody(obj, ...keys) {
    if (
      obj instanceof Promise &&
      !('[[PromiseStatus]]' in obj)
    ) obj = getPromiseStatus(obj);

    let value = objValue(obj, ...keys);
    const $group = tag('c-group');
    const $toggler = tag('c-type', {
      attr: {
        type: 'body-toggler',
      },
      textContent: value ? value.constructor.name : value + ''
    });

    if (value instanceof Object) {
      $toggler.onclick = function () {
        if (this.classList.contains('__show-data')) {
          this.classList.remove('__show-data');
          $group.textContent = null;
          return;
        }

        this.classList.toggle('__show-data');

        const possibleKeys = [];

        for (let key in value) {
          possibleKeys.push(key);
        }

        possibleKeys.push(...[
          ...Object.keys(value),
          ...Object.getOwnPropertyNames(value),
          ...Object.keys(value['__proto__'] || {}),
        ])

        if (value['__proto__']) possibleKeys.push('__proto__');
        if (value['prototype']) possibleKeys.push('prototype');

        [...new Set(possibleKeys)]
          .forEach(key => $group.append(
            appendProperties(obj, ...keys, key)
          ));
      };
      $toggler.textContent = value.constructor.name;
    } else {
      const $val = getElement(value);
      $val.textContent = (value ?? value + '').toString();
      $group.append($val);
    }

    return [$toggler, $group];
  }

  function appendProperties(obj, ...keys) {
    const key = keys.pop();
    const value = objValue(obj, ...keys);
    const getter = value.__lookupGetter__(key);
    const $key = tag('c-key', {
      textContent: key + ':',
    });
    let $val;

    if (getter) {
      $val = tag('c-span', {
        style: {
          textDecoration: 'underline',
          color: '#39f',
          margin: '0 10px'
        },
        textContent: `...`,
        onclick() {
          const $val = getVal(value[key]);
          this.parentElement.replaceChild($val, this);
        }
      });
    } else {
      $val = getVal(value[key]);
    }

    return tag('c-line', {
      children: [$key, $val],
    });

    function getVal(val) {
      const type = typeof val;
      const $val = getElement(type);
      if (type === 'object' && val !== null) {
        $val.append(...getBody(obj, ...keys, key));
      } else {
        if (type === 'function') {
          val = parseFuntion(val);
        }
        $val.textContent = val + '';
      }
      return $val;
    }
  }

  function objValue(obj, ...keys) {
    return keys.reduce((acc, key) => acc[key], obj);
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
      },
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
    return tag('c-text', {
      className: `__c-${type}`,
    });
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
            : param.name + ','),
      );
      parameter = parameter.replace(/,$/, '');
      parameter += ')' + (type === 'arrow' ? '=>' : '') + '{...}';
      return parameter;
    }

    return str;
  }

  /**
   * Prints to the console.
   * @param {'log'|'error'|'warn'|'code'|'trace'|'table'} mode
   * @param {{stack: string, location: string}} options
   * @param  {...any} args 
   */
  function log(mode, options, ...args) {
    let location = options.location || 'console';
    const $messages = tag('c-message', {
      attr: {
        'log-level': mode
      }
    });

    args = format(args);

    if (args.length === 1 && args[0] instanceof Error) {
      args.unshift(args[0].message);
    }


    for (let arg of args) {
      const typeofArg = typeof arg;
      arg = (arg ?? arg + '');

      let $msg;
      if (mode === 'code') {
        $msg = tag('c-code');
        $msg.textContent = arg.length > 50 ? arg.substring(0, 50) + '...' : arg;
        $msg.setAttribute('data-code', arg);
        $msg.setAttribute('action', 'use code');
      } else {
        $msg = getElement(typeofArg);

        switch (typeofArg) {
          case 'object':
            $msg.append(...getBody(arg));
            break;
          case 'function':
            $msg.innerHTML = parseFuntion(arg);
            $msg.append(tag('c-line', {
              children: getBody(arg),
            }));
            break;
          default:
            $msg.innerHTML = arg;
            break;
        }
      }
      $messages.appendChild($msg);
    }

    if (location) {
      const $stack = tag('c-stack');
      $stack.innerHTML = `<c-date>${new Date().toLocaleString()}</c-date><c-trace>${location}</c-trace>`;
      $messages.appendChild($stack);
    }

    $console.insertBefore($messages, $inputContainer);

    while ($console.childElementCount > 100) {
      $console.firstElementChild.remove();
    }
  }

  /**
   *
   * @param {Array<any>} args
   * @returns
   */
  function format(args) {
    if (args.length <= 1) return [escapeHTML(args[0])];

    const originalArgs = [].concat(args);
    const styles = [];
    let msg = args.splice(0, 1)[0];

    if (typeof msg !== 'string') return originalArgs;

    let matched = matchRegex(msg);
    let match;
    while ((match = matched.next())) {
      if (match.done) break;
      let value = '';
      const specifier = match.value[0];
      const pos = match.value.index;

      if (!args.length) {
        value = specifier;
      } else {
        value = args.splice(0, 1)[0];
        if ([undefined, null].includes(value)) {
          value = value + '';
        }

        switch (specifier) {
          case '%c':
            styles.push({
              value,
              pos
            });
            value = '';
            break;
          case '%s':
            if (typeof value === 'object') {
              value = value.constructor.name;
            }
            break;
          case '%o':
          case '%O':
            let id = new Date().getMilliseconds() + '';
            window.__objs[id] = value;
            value = `<c-object onclick='console.log(window.__objs[${id}])'>Object</c-object>`;
            break;
          case '%d':
          case '%i':
            value = parseInt(value);
            break;
          case '%f':
            value = parseFloat(value);
            break;
          default:
            break;
        }
      }
      msg = msg.substring(0, pos) + escapeHTML(value) + msg.substring(pos + 2);
      matched = matchRegex(msg);
    }

    if (styles.length) {
      const toBeStyled = [];
      let remainingMsg = msg;
      styles.reverse().forEach((style, i) => {
        toBeStyled.push(remainingMsg.substring(style.pos));
        remainingMsg = msg.substring(0, style.pos);
        if (i === styles.length - 1) toBeStyled.push(msg.substring(0, style.pos));
      });
      msg = toBeStyled.map((str, i) => {
        if (i === toBeStyled.length - 1) return str;
        const { value } = styles[i];
        return `<c-span style="${value}">${str}</c-span>`;
      }).reverse().join('');
    }

    msg.replace(/%%[oOsdifc]/g, '%');

    args.unshift(msg);
    return args;

    /**
     *
     * @param {string} str
     * @returns {IterableIterator<RegExpMatchArray>}
     */
    function matchRegex(str) {
      return str.matchAll(/(?<!%)%[oOsdifc]/g);
    }
  }

  /**
   * Gets the stack trace of the current call
   * @param {Error} error 
   * @returns 
   */
  function getStack(error) {
    let stack = error.stack.split('\n');
    stack.splice(1, 1);
    let regExecRes = /<(.*)>:(\d+):(\d+)/.exec(stack[1]) || [];
    let src = '';
    const location = regExecRes[1];
    const lineno = regExecRes[2];
    const colno = regExecRes[3];

    if (location && lineno) {
      src = escapeHTML(`${location} ${lineno}${colno ? ':' + colno : ''}`);
    } else {
      const res = /\((.*)\)/.exec(stack[1])
      src = res && res[1] ? res[1] : '';
    }
    const index = src.indexOf(')');
    src = src.split('/').pop().substring(0, index < 0 ? undefined : index);
    if (src.length > 50) src = '...' + src.substring(src.length - 50);

    return {
      location: src,
      stack: stack.join('\n'),
    }
  }

  function execute(code) {
    let res = null;
    try {
      const parsed = esprima.parse(code, {
        range: true,
      }).body;
      res = execParsedCode(parsed);
    } catch (e) {
      res = execParsedCode([]);
    }

    return res;

    function execParsedCode(parsed) {
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
        const script = tag('script');
        script.textContent = extra;
        document.body.appendChild(script);
        document.body.removeChild(script);
        return exec(code);
      } else {
        return exec(code);
      }
    }

    function exec(code) {
      let res = null;
      try {
        res = { type: 'result', value: window.eval(code) };
      } catch (error) {
        res = { type: 'error', value: error };
      }

      return res;
    }
  }

  function onError(err) {
    const error = err.error;
    log("error", getStack(error), error);
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return tag('textarea', {
      textContent: str
    }).innerHTML;
  }

  function css() {
    return `c-toggler {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAE9JREFUOMtjYBh0gBHO+k+cSkYilcPVMpHqpIHRwIgUFERp+I8SekQ5CY8WXH7AqYWJyGglqIERV3QykaYcV7DiSSwsODw8yJIGdTPQIAQAg9gKJl7UINwAAAAASUVORK5CYII=);
      background-position: center;
      background-repeat: no-repeat;
      background-size: 24px;
      position: fixed;
      top: 0;
      left: 0;
      height: 30px;
      width: 30px;
      background-color: #fff;
      transform-origin: center;
      border-radius: 50%;
      box-shadow: -2px 2px 8px rgba(0, 0, 0, .4);
      z-index: 99999;
      opacity: 0.5;
  }
  
  c-object{
      color: #9999ff;
      text-decoration: underline;
  }
  
  c-toggler:active {
      box-shadow: -1px 1px 4px rgba(0, 0, 0, .4)
  }
  
  c-line {
      display: block;
  }
  
  c-console {
      box-sizing: border-box;
      overflow-y: auto;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      background-color: #313131;
      z-index: 99998;
      color: #eeeeee;
      font-family: "Roboto", sans-serif;
  }

  c-console[title]{
    padding-top: 65px;
    animation: --page-transition .1s ease 1;
  }
  
  c-console br:last-of-type {
      display: none;
  }
  
  c-console textarea {
      color: white;
      caret-color: currentColor !important;
      background-color: inherit;
  }
  
  c-input {
      display: flex;
      width: 100%;
      height: fit-content;
  }
  
  c-input::before {
      content: '>>';
      margin: 0 5px;
      height: 100%;
  }
  
  #__c-input {
      position: relative;
      width: 100%;
      border: none;
      background-color: transparent;
      overflow: scroll;
      resize: none;
      height: 200px;
  }

  #__c-input:focus {
    outline: none;
  }
  
  c-console[title]::before {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      background-color: inherit;
      z-index: 999999;
      content: attr(title);
      display: flex;
      height: 44px;
      align-items: center;
      justify-content: center;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      font-weight: 900;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
      margin-bottom: 10px;
      color: white;
      font-size: medium;
  }
  
  c-message {
      position: relative;
      display: flex;
      border-bottom: solid 1px rgba(204, 204, 204, 0.4);
      margin-bottom: 35px;
      font-size: .9rem;
      flex-wrap: wrap;
  }
  
  c-code {
      position: relative;
      color: rgb(214, 211, 211);
      font-size: 1em;
      font-family: 'Courier New', Courier, monospace;
      overflow-x: auto;
      white-space: pre;
      marginBottom: 0px;
      border: 'none';
  }
  
  c-code::after {
      content: 'use';
      background-color: #666;
      color: inherit;
      border-radius: 4px;
      padding: 0 0.4rem;
      font-size: 0.6rem;
  }
  
  c-code::before {
      content: '>>';
      padding: 0 5px;
      font-style: italic;
  }
  
  c-key {
      font-size: 0.9rem;
      color: #cc66ff;
  }
  
  c-message[log-level=error] {
      border-bottom: solid 1px rgba(255, 255, 255, 0.4);
      background-color: #422;
      color: inherit;
  }
  
  c-message[log-level=error]::after {
      background-color: #cc4343;
      color: inherit
  }
  
  c-message[log-level=warn] {
      border-bottom: solid 1px rgba(255, 255, 255, 0.4);
      background-color: #633;
      color: inherit;
  }
  
  c-message[log-level=warn]::after {
      background-color: #cc6969;
      color: inherit
  }
  
  c-stack:not(:empty) {
      content: attr(data-stack);
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      position: absolute;
      top: 100%;
      right: 0;
      display: flex;
      height: 20px;
      align-items: center;
      justify-content: space-between;
      width: 100vw;
      background-color: inherit;
      padding: 0 5px;
      box-sizing: border-box;
      font-size: .8rem;
      color: inherit;
  }
  
  c-text {
      padding: 2px;
      white-space: pre;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      overflow: auto;
      box-sizing: border-box;
      max-width: 100vw;
      font-size: 0.9rem;
      width: 100%;
      padding-left: 10px;
      white-space: break-spaces;
  }
  
  c-text.__c-boolean {
      color: rgb(130, 80, 177);
  }
  
  c-text.__c-number {
      color: rgb(97, 88, 221);
  }
  
  c-text.__c-symbol {
      color: rgb(111, 89, 172);
  }
  
  c-text.__c-function {
      color: rgb(145, 136, 168);
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9rem;
  }
  
  c-text.__c-function::before {
      content: 'ƒ';
      margin: 0 2px;
      font-style: italic;
      color: #9999ff;
  }
  
  c-text.__c-object,
  c-text.__c-undefined {
      color: rgb(118, 163, 118);
  }
  
  c-text.__c-string {
      color: rgb(59, 161, 59);
  }
  
  c-text.__c-string:not(.no-qoutes)::before {
      content: '"';
      margin-right: 2px;
  }
  
  c-text.__c-string:not(.no-qoutes)::after {
      content: '"';
      margin-left: 2px;
  }
  
  c-message.error c-text {
      overflow: unset;
      white-space: pre-wrap;
      word-break: break-word;
      color: white;
  }
  
  c-group {
      display: none;
      margin-left: 14px;
  }
  
  c-type[type="body-toggler"].__show-data+c-group {
      display: block;
  }
  
  c-type[type="body-toggler"]::before {
      display: inline-block;
      content: '▸';
      margin-right: 2.5px;
  }
  
  c-type[type="body-toggler"]::after {
      content: '{...}';
  }
  
  c-type[type="body-toggler"].__show-data::before {
      content: '▾';
  }
  
  c-type[type="body-toggler"].__show-data::after {
      display: none;
  }

  c-table {
      display: table;
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      font-size: 0.9rem;
      color: rgb(214, 211, 211);
      border: solid 1px rgba(204, 204, 204, 0.4);
  }

  c-table c-row {
      display: table-row;
      border-bottom: solid 1px rgba(204, 204, 204, 0.4);
  }

  c-table c-row:last-child {
      border-bottom: none;
  }

  c-table c-row:first-child {
      font-weight: bold;
  }

  c-table c-cell {
      display: table-cell;
      padding: 5px;
      border-bottom: solid 1px rgba(204, 204, 204, 0.4);
  }

  c-table c-cell:not(:last-child) {
    border-left: solid 1px rgba(204, 204, 204, 0.4);
  }
  
  @keyframes --page-transition {
      0% {
          opacity: 0;
          transform: translate3d(0, 50%, 0)
      }
  
      100% {
          opacity: 1;
          transform: translate3d(0, 0, 0)
      }
  }`;
  }
})();
