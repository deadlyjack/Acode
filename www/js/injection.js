"use strict";

(function () {
    var style = document.createElement('style');
    document.head.appendChild(style);
    var toggler = document.createElement('c-toggler');
    var clearBtn = document.createElement('c-toggler');
    clearBtn.innerHTML = '&times;';
    clearBtn.onclick = clear;
    clearBtn.style.fontSize = '1.2em';
    clearBtn.style.left = 'calc(100vw - 40px)';
    clearBtn.style.transform = "translate(-2px, 2px)";

    toggler.innerHTML = '&#9888;';
    toggler.style.transform = "translate(2px, 2px)";

    toggler.onclick = function () {
        if (consoleElement.parentElement) {
            document.body.removeChild(clearBtn);
            document.body.removeChild(consoleElement);
        } else {
            document.body.appendChild(clearBtn);
            document.body.appendChild(consoleElement);
        }
    };

    toggler.ontouchstart = function () {
        document.ontouchmove = function (e) {
            toggler.style.transform = "translate(".concat(e.touches[0].clientX - 20, "px, ").concat(e.touches[0].clientY - 20, "px)");
        };

        document.ontouchend = function (e) {
            document.ontouchmove = null;
            document.ontouchend = null;
        };
    };

    var errId = '_c_error' + new Date().getMilliseconds();
    var consoleElement = document.createElement('c-console');
    var counter = {};

    window.addEventListener('load', function () {
        document.body.appendChild(toggler);
        var allMetas = document.querySelectorAll('meta');

        if (window.__mode === 'mobile') {
            var get = false;
            for (var __i = 0; __i < allMetas.length; ++__i) {
                if (allMetas[__i].name === 'viewport') {
                    allMetas[__i].setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                    get = true;
                    break;
                }
            }

            if (!get) {
                var metaTag = document.createElement('meta');
                metaTag.name = "viewport"
                metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                document.getElementsByTagName('head')[0].appendChild(metaTag);
            }
        } else if (window.__mode === 'desktop') {
            for (var __i = 0; __i < allMetas.length; ++__i) {
                if (allMetas[__i].name === 'viewport') {
                    allMetas[__i].setAttribute('content', 'user-scalable=yes, maximum-scale=2');
                }
            }
        }

        if (!('__loaded' in sessionStorage)) {
            sessionStorage.setItem('__loaded', 'true');
            setTimeout(() => {
                location.reload();
            }, 100);
        }


    });

    window.addEventListener('error', function (err) {
        console.error(err);
    });

    function log() {
        if (arguments.length === 0) return;

        var clean = null;
        var error = null;
        var args = Object.values(arguments);
        if (arguments[0] === errId + 'error') {
            error = arguments[1];
            args = [errId, error.message];
            clean = error.filename + ":" + error.lineno + ":" + error.colno;
        } else {
            var err = getErrorObject();
            var caller_line = err.stack.split('\n')[arguments[0] === errId ? 4 : 3];
            var index = caller_line.indexOf("at ");
            clean = caller_line.slice(index + 2, caller_line.length);
        }

        let tmpclean = /\/\.run_(.+):(\d+):(\d+)/.exec(clean);

        if (!tmpclean) {
            clean = /^(.+):(\d+):(\d+)/.exec(clean.split('/').slice(-1));
        } else {
            clean = tmpclean;
            clean[2] -= 1;
        }

        if (clean[1] > 25) {
            clean = clean.split('/').slice(-2).join('/');
            if (clean[1] > 35) {
                clean = '...' + clean.slice(clean.lenght - 25);
            } else {
                clean = '...' + clean;
            }

            // if (clean.slice(-1) === ')') clean = clean.slice(0, -1);
        }
        clean = clean[1] + ":" + clean[2] + ":" + clean[3];
        var flag = false;
        var messages = document.createElement('c-message');

        for (let arg of args) {
            if (typeof arg === 'string') {
                if (arg === errId) {
                    messages.classList.add('error');
                    continue;
                }

                if (flag) {
                    messages.lastElementChild.setAttribute('style', arg);
                    flag = false;
                    continue;
                }

                if (/^%c/.test(arg)) flag = true;
                var msg = document.createElement('c-text');
                msg.textContent = arg.replace(/%[a-zA-Z]/, '');
                messages.appendChild(msg);
            } else {
                if (flag) flag = false;

                var _msg = document.createElement('c-text');

                _msg.textContent = JSON.stringify(arg, undefined, 2);
                messages.appendChild(_msg);
            }
        }

        messages.setAttribute('data-stack', clean);
        consoleElement.appendChild(messages);
    }

    function error() {
        if (arguments.lenght === 0) return;
        var error = arguments[0];
        if (arguments[0].constructor.name === 'ErrorEvent') {
            log(errId + 'error', error);
            return;
        }
        var args = Object.values(arguments);
        args.unshift(errId);
        log(...args);
    }

    function count() {
        var hash = (arguments[0] || 'default') + '';

        if (!counter[hash]) {
            counter[hash] = 1;
        } else {
            ++counter[hash];
        }

        log("".concat(hash, ": ").concat(counter[hash]));
    }

    function clear() {
        consoleElement.textContent = '';
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
    var css = "c-toggler{position:fixed;top:0;left:0;display:flex;height:40px;width:40px;background-color:#99f;align-items:center;justify-content:center;user-select:none;transform-origin:center;border-radius:50%;color:#fff;box-shadow:-2px 2px 8px rgba(0,0,0,.4);z-index:99999}c-toggler:active{box-shadow:-1px 1px 4px rgba(0,0,0,.4)}c-console{box-sizing:border-box;padding-top:65px;overflow-y:auto;position:fixed;top:0;left:0;height:100vh;width:100vw;background-color:#fff;z-index:99998;animation:--page-transition .1s ease 1}c-console::before{position:fixed;top:0;left:0;width:100vw;background-color:white;z-index:999999;content:'Console';display:flex;height:44px;align-items:center;justify-content:center;font-family:Verdana,Geneva,Tahoma,sans-serif;font-weight:900;box-shadow:0 2px 4px rgba(0,0,0,.2);margin-bottom:10px}c-message{position:relative;display:flex;border-bottom:solid 1px #ccc;margin-bottom:35px;font-size:.9em}c-message.error{background-color:#f66;color:#300}c-message.error::after{background-color:#cc4343;color:#fff}c-message::after{content:attr(data-stack);font-family:Verdana,Geneva,Tahoma,sans-serif;position:absolute;top:100%;right:0;display:flex;height:20px;align-items:center;justify-content:flex-end;width:100vw;background-color:#eee;padding:0 5px;box-sizing:border-box;font-size:.8em}c-text{padding:2px;white-space:pre;font-family:Verdana,Geneva,Tahoma,sans-serif;overflow:auto; box-sizing:border-box; max-width: 100vw}@keyframes --page-transition{0%{opacity:0;transform:translate3d(0,50%,0)}100%{opacity:1;transform:translate3d(0,0,0)}}";
    style.textContent = css;
})();