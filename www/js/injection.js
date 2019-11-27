(function () {
    if (window.consoleLoaded) return;
    const inputContainer = document.createElement('c-input');
    const input = document.createElement('div');
    const toggler = document.createElement('c-toggler');
    const clearBtn = document.createElement('c-toggler');
    const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    }
    let isFocused = false;
    let flag;
    let flask;

    input.id = '__c-input';
    inputContainer.appendChild(input);
    clearBtn.innerHTML = '&times;';
    clearBtn.onclick = clear;
    clearBtn.style.fontSize = '1.2em';
    clearBtn.style.left = 'calc(100vw - 40px)';
    clearBtn.style.transform = "translate(-2px, 2px)";

    toggler.innerHTML = '&#9888;';
    toggler.style.transform = "translate(2px, 2px)";

    input.onblur = function () {
        setTimeout(() => {
            isFocused = false;
        }, 0);
    }

    toggler.onclick = toggleConsole;

    toggler.ontouchstart = function () {
        document.ontouchmove = function (e) {
            toggler.style.transform = "translate(".concat(e.touches[0].clientX - 20, "px, ").concat(e.touches[0].clientY - 20, "px)");
        };

        document.ontouchend = function (e) {
            document.ontouchmove = null;
            document.ontouchend = null;
        };
    };

    const errId = '_c_error' + new Date().getMilliseconds();
    const consoleElement = document.createElement('c-console');
    const counter = {};
    consoleElement.appendChild(inputContainer);

    consoleElement.onclick = function (e) {
        const el = e.target;
        const action = el.getAttribute('action');


        if (action === 'use code') {
            const value = el.getAttribute('data-code');

            flask.updateCode(value);
            flask.elTextarea.focus();
        }
    }

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
            })
        }
    }

    window.consoleLoaded = true;

    function loadConsole() {
        if (sessionStorage.getItem('__mode') === 'console') {
            toggleConsole();
        } else {
            document.body.appendChild(toggler);
        }
        const allMetas = document.querySelectorAll('meta');

        if (sessionStorage.getItem('_$mode') === 'mobile') {
            let get = false;
            for (let i = 0; i < allMetas.length; ++i) {
                if (allMetas[i].name === 'viewport') {
                    allMetas[i].setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                    get = true;
                    break;
                }
            }

            if (!get) {
                const metaTag = document.createElement('meta');
                metaTag.name = "viewport"
                metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                document.getElementsByTagName('head')[0].appendChild(metaTag);
            }
        } else if (window.__mode === 'desktop') {
            for (let i = 0; i < allMetas.length; ++i) {
                if (allMetas[i].name === 'viewport') {
                    allMetas[i].setAttribute('content', 'user-scalable=yes, maximum-scale=2');
                }
            }
        }
    }

    function toggleConsole() {
        if (consoleElement.isConnected) {
            document.body.removeChild(clearBtn);
            document.body.removeChild(consoleElement);
        } else {
            document.body.appendChild(clearBtn);
            document.body.appendChild(consoleElement);
            if (!flag) {
                flask = new CodeFlask('#__c-input', {
                    language: 'js'
                });
                /**
                 * @type {HTMLTextAreaElement}
                 */
                const editor = document.querySelector('.codeflask__textarea');
                if (editor) {
                    editor.addEventListener('keydown', function (e) {
                        const key = e.keyCode || e.which;
                        isFocused = true;

                        if (key === 13) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            const regex = /[\[|{\(\)\}\]]/g;
                            let code = this.value.trim();
                            let isOdd = (code.length - code.replace(regex, '').length) % 2;
                            const $code = document.createElement('c-code');
                            $code.textContent = code.length > 50 ? code.substr(0, 50) + '...' : code;
                            $code.setAttribute('data-code', code);
                            $code.setAttribute('action', 'use code');
                            if (!code || isOdd) return;
                            flask.updateCode('');
                            console.log(errId + 'code', $code.outerHTML);
                            const parsed = (function () {
                                try {
                                    return esprima.parse(code, {
                                        range: true
                                    }).body
                                } catch (e) {
                                    return [];
                                }
                            })();
                            let extra = '';
                            parsed.map(st => {
                                if (st.type === "VariableDeclaration") {
                                    if (['const', 'let'].indexOf(st.kind) < 0) return;

                                    const range = st.range;
                                    const excode = code.substring(range[0], range[1]) + ';';
                                    extra += excode;
                                }
                            });

                            if (extra) {
                                const script = document.createElement('script');
                                try {
                                    eval(extra);
                                    script.textContent = extra;
                                    document.body.appendChild(script);
                                    document.body.removeChild(script);

                                    exec(code);
                                } catch (error) {
                                    console.error(error);
                                }
                            } else {
                                exec(code);
                            }
                        }
                    });
                }
                flag = true;
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

    function getBody(obj) {
        let data = '';

        if (typeof obj === 'object') {
            for (let key in obj) {
                let val = obj[key];
                const type = typeof val;
                const $val = getElement(type);
                if (type === 'function') {
                    val = parseFuntion(val);
                } else if (type === 'object' && val !== null) {
                    val = val.constructor.name;
                }

                $val.textContent = escapeHTML(val + '');
                data += `<c-key>${key}</c-key>: ${$val.outerHTML}<br>`;
            }
        }

        function replaceTag(tag) {
            return tagsToReplace[tag] || tag;
        }

        function escapeHTML(str) {
            if (!str) return;
            return str.replace(/[&<>]/g, replaceTag);
        }

        return data;
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
            const fun = ('(' + data.toString() + ')').replace(/\{.*\}/, '{}')
            parsed = esprima.parse(fun).body[0]
        }

        if (parsed.type === "ExpressionStatement") {
            const expression = parsed.expression;
            if (expression.type === "ArrowFunctionExpression") {
                str = joinParams(expression.params, 'arrow');
            } else if (expression.type === "FunctionExpression") {
                str = joinParams(expression.params);
            }
        } else {
            let string = parsed.id.name + joinParams(parsed.params);
            str = string;
        }

        function joinParams(params, type) {
            let parameter = '(';
            params.map((param) => {
                parameter += param.type === "RestElement" ? '...' + param.argument.name : param.name + ',';
            });
            parameter = parameter.replace(/,$/, '');
            parameter += ')' + (type === 'arrow' ? '=>' : '') + '{...}';
            return parameter;
        }

        return str;
    }

    function log() {

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
            const caller_line = err.stack.split('\n')[arguments[0] === errId ? 4 : 3];
            const index = caller_line.indexOf("at ");
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
            clean = clean[1] + ":" + clean[2] + ":" + clean[3];
        }
        let flag = false;
        const messages = document.createElement('c-message');

        for (let arg of args) {
            const type = typeof arg;
            let msg;
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
                    arg = parseFuntion(arg);
                    arg += getBody(arg);
                }

                const valid = (['code', 'console'].indexOf(args[0]) > -1) ? args.length > 2 : args.length > 1;

                if (type === 'undefined' || type === 'string') {
                    arg = arg + ''
                } else {
                    arg = arg.toString();
                }
                if (/^%c/.test(arg) && valid) {
                    flag = true;
                    msg.textContent = arg.replace(/%[a-zA-Z]/, '');
                } else {
                    msg.textContent = arg;
                }

                if (qoutes && type === 'string')
                    msg.classList.add(qoutes);

            } else {
                if (flag) flag = false;
                let type;
                let body = getBody(arg);
                if (arg.constructor) {
                    type = arg.constructor.name;
                }
                msg = document.createElement('c-text');
                msg.innerHTML = `<c-type>${type}</c-type>` + body;
            }
            if (msg) messages.appendChild(msg);
        }

        if (clean) {
            const stack = document.createElement('c-stack');
            clean = clean.length > 35 ? '...' + clean.substr(clean.length - 32) : clean;
            stack.textContent = clean.replace('.run_', '').replace(/\)$/, '');
            messages.appendChild(stack);
        } else if (mode === 'code') {
            messages.style.marginBottom = '0';
            messages.style.border = 'none';
        }
        consoleElement.insertBefore(messages, inputContainer);
    }

    function error() {
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
        log: log,
        error: error,
        count: count,
        clear: clear
    };
})();