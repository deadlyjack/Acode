import tag from 'html-tag-js';
import autosize from 'autosize';
import Picker from 'vanilla-picker';
import tile from "./tile";
import helpers from '../modules/helpers';
import inputhints from './inputhints';
/**
 * @typedef {"text"|"numberic"|"tel"|"search"|"email"|"url"} Types
 */

/**
 * 
 * @param {string} message 
 * @param {string} defaultValue 
 * @param {Types} type 
 * @param {object} options
 * @param {RegExp} options.match
 * @param {boolean} options.required
 */
function prompt(message, defaultValue, type = 'text', options = {}) {
    return new Promise((resolve) => {

        const inputType = type === 'text' ? 'textarea' : 'input';
        type = type === 'filename' ? 'text' : type;

        const messageSpan = tag('span', {
            textContent: message,
            className: 'message scroll'
        });
        const input = tag(inputType, {
            value: defaultValue,
            className: 'input',
        });
        const okBtn = tag('button', {
            type: "submit",
            textContent: strings.ok,
            disabled: !defaultValue,
            onclick: function () {
                if (options.required && !input.value) {
                    errorMessage.textContent = strings.required;
                    return;
                }
                hide();
                resolve(input.value);
            }
        });
        const cancelBtn = tag('button', {
            textContent: strings.cancel,
            type: 'button',
            onclick: function () {
                hide();
            }
        });
        const errorMessage = tag("span", {
            className: 'error-msg'
        });
        const promptDiv = tag('form', {
            action: "#",
            className: 'prompt',
            onsubmit: (e) => {
                e.preventDefault();
                if (!okBtn.disabled) {
                    resolve(input.value);
                }
            },
            children: [
                messageSpan,
                input,
                errorMessage,
                tag('div', {
                    className: 'button-container',
                    children: [
                        cancelBtn,
                        okBtn
                    ]
                })
            ]
        });
        const mask = tag('span', {
            className: 'mask'
        });

        if (inputType === 'textarea') {
            input.rows = 1;
            input.inputMode = type;
        } else {
            input.type = type;
        }

        input.oninput = function () {
            if (options.match && !options.match.test(this.value)) {
                okBtn.disabled = true;
                errorMessage.textContent = strings['invalid value'];
            } else {
                okBtn.disabled = false;
                errorMessage.textContent = '';
            }
        };

        input.onfocus = function () {
            this.select();
        };

        actionStack.push({
            id: 'prompt',
            action: hidePrompt
        });

        window.restoreTheme(true);
        app.append(promptDiv, mask);
        input.focus();
        autosize(input);

        function hidePrompt() {
            promptDiv.classList.add('hide');
            window.restoreTheme();
            setTimeout(() => {
                if (promptDiv.isConnected) promptDiv.remove();
                if (mask.isConnected) mask.remove();
            }, 300);
        }

        function hide() {
            actionStack.remove('prompt');
            hidePrompt();
        }
    });
}


/**
 * @typedef {Object} Input
 * @property {string} id
 * @property {Types} type
 * @property {boolean} required
 * @property {RegExp} match
 * @property {string} value
 * @property {function(function(Array<string>):void):void} hints
 * @property {string} [placeholder]
 */

/**
 * 
 * @param {string} message 
 * @param {Array<Input>} inputs 
 * @returns {Promise<Strings>}
 */
function multiPrompt(message, inputs) {
    return new Promise((resolve) => {
        const messageSpan = tag('span', {
            textContent: message,
            className: 'message scroll'
        });
        let inputAr = [];

        const okBtn = tag('button', {
            type: "submit",
            textContent: strings.ok,
            onclick: function (e) {
                e.preventDefault();
                e.stopPropagation();

                for (let $input of inputAr) {
                    if ($input.isRequired && !$input.value) {
                        $errorMessage.textContent = strings.required;
                        $promptDiv.insertBefore($errorMessage, $input.nextElementSibling);
                        return;
                    }
                }
                hide();
                resolve(getValue());
            }
        });
        const cancelBtn = tag('button', {
            textContent: strings.cancel,
            type: 'button',
            onclick: function () {
                hide();
            }
        });
        const $errorMessage = tag("span", {
            className: 'error-msg'
        });
        const $mask = tag('span', {
            className: 'mask'
        });

        inputs.map(input => {
            const {
                id,
                required,
                type,
                match,
                value,
                placeholder,
                hints
            } = input;

            const inputType = type === 'textarea' ? 'textarea' : 'input';
            let _type = type === 'filename' ? 'text' : type;

            const $input = tag('input', {
                id,
                placeholder,
                value: value,
                className: 'input',
                isRequired: required
            });

            if (hints) {
                inputhints($input, hints);
            }

            if (inputType === 'textarea') {
                $input.rows = 1;
                $input.inputMode = _type;
                autosize($input);
            } else {
                $input.type = _type;
            }

            $input.oninput = function () {
                if (match && !match.test(this.value)) {
                    okBtn.disabled = true;
                    $promptDiv.insertBefore($errorMessage, $input.nextElementSibling);
                    $errorMessage.textContent = strings['invalid value'];
                } else {
                    okBtn.disabled = false;
                    $errorMessage.textContent = '';
                }
            };

            $input.onfocus = function () {
                this.select();
            };

            inputAr.push($input);
            return input;
        });

        const $promptDiv = tag('form', {
            action: "#",
            className: 'prompt multi',
            onsubmit: (e) => {
                e.preventDefault();
                if (!okBtn.disabled) {
                    resolve(getValue());
                }
            },
            children: [
                messageSpan,
                ...inputAr,
                tag('div', {
                    className: 'button-container',
                    children: [
                        cancelBtn,
                        okBtn
                    ]
                })
            ]
        });

        actionStack.push({
            id: 'prompt',
            action: hidePrompt
        });

        window.restoreTheme(true);
        document.body.append($promptDiv, $mask);
        inputAr[0].focus();

        function hidePrompt() {
            $promptDiv.classList.add('hide');
            window.restoreTheme();
            setTimeout(() => {
                if ($promptDiv.isConnected) $promptDiv.remove();
                if ($mask.isConnected) $mask.remove($mask);
            }, 300);
        }

        function hide() {
            actionStack.remove('prompt');
            hidePrompt();
        }

        function getValue() {
            const values = {};
            inputAr.map($input => {
                values[$input.id] = $input.value;
                return $input;
            });

            return values;
        }
    });
}

/**
 * 
 * @param {string} titleText 
 * @param {string} message 
 * @param {function():void} [onhide] 
 */
function alert(titleText, message, onhide) {

    if (!message && titleText) {
        message = titleText;
        titleText = '';
    }

    const regex = /(https?:\/\/[^\s]+)/g;
    if (regex.test(message)) {
        message = message.replace(regex, function (url) {
            return `<a href='${url}'>${url}</a>`;
        });
    }

    const titleSpan = tag('strong', {
        className: 'title',
        textContent: titleText
    });
    const messageSpan = tag('span', {
        className: 'message scroll',
        innerHTML: message
    });
    const okBtn = tag('button', {
        textContent: strings.ok,
        onclick: hide
    });
    const alertDiv = tag('div', {
        className: 'prompt alert',
        children: [
            titleSpan,
            messageSpan,
            tag('div', {
                className: 'button-container',
                child: okBtn
            })
        ]
    });
    const mask = tag('span', {
        className: 'mask',
        onclick: hide
    });

    actionStack.push({
        id: 'alert',
        action: hideAlert
    });

    app.append(alertDiv, mask);
    window.restoreTheme(true);

    function hideAlert() {
        alertDiv.classList.add('hide');
        window.restoreTheme();
        setTimeout(() => {
            app.removeChild(alertDiv);
            app.removeChild(mask);
        }, 300);
    }

    function hide() {
        if (onhide) onhide();
        actionStack.remove('alert');
        hideAlert();
    }
}

/**
 * 
 * @param {string} titleText 
 * @param {string} message 
 * @returns {Promise<void>}
 */
function confirm(titleText, message) {
    return new Promise((resolve) => {
        if (!message && titleText) {
            message = titleText;
            titleText = '';
        }

        const titleSpan = tag('strong', {
            className: 'title',
            textContent: titleText
        });
        const messageSpan = tag('span', {
            className: 'message scroll',
            textContent: message
        });
        const okBtn = tag('button', {
            textContent: strings.ok,
            onclick: function () {
                hide();
                resolve();
            }
        });
        const cancelBtn = tag('button', {
            textContent: strings.cancel,
            onclick: function () {
                hide();
            }
        });
        const confirmDiv = tag('div', {
            className: 'prompt confirm',
            children: [
                titleSpan,
                messageSpan,
                tag('div', {
                    className: 'button-container',
                    children: [
                        cancelBtn,
                        okBtn
                    ]
                })
            ]
        });
        const mask = tag('span', {
            className: 'mask'
        });

        actionStack.push({
            id: 'confirm',
            action: hideAlert
        });

        app.append(confirmDiv, mask);
        window.restoreTheme(true);

        function hideAlert() {
            confirmDiv.classList.add('hide');
            window.restoreTheme();
            setTimeout(() => {
                app.removeChild(confirmDiv);
                app.removeChild(mask);
            }, 300);
        }

        function hide() {
            actionStack.remove('confirm');
            hideAlert();
        }
    });
}

/**
 * 
 * @param {string} title 
 * @param {string[]} options 
 * @param {object} opts 
 * @param {string} opts.default 
 * @param {boolean} opts.textTransform 
 */
function select(title, options, opts = {}) {
    return new Promise(resolve => {
        const titleSpan = title && tag('strong', {
            className: 'title',
            textContent: title
        });
        const list = tag('ul', {
            className: 'scroll' + (opts.textTransform === false ? ' no-text-transform' : '')
        });
        const selectDiv = tag('div', {
            className: 'prompt select',
            children: titleSpan ? [
                titleSpan,
                list
            ] : [list]
        });
        const mask = tag('span', {
            className: 'mask',
            onclick: hide
        });
        let defaultVal;

        options.map(option => {

            let value = null;
            let text = null;
            let lead = null;
            let disabled = false;
            if (Array.isArray(option)) {
                value = option[0];
                text = option[1];

                if (option.length > 2 && typeof option[2] === 'string') {
                    lead = tag('i', {
                        className: `icon ${option[2]}`
                    });
                }

                option.map((o, i) => {
                    if (typeof o === 'boolean' && i > 1) disabled = !o;
                    return o;
                });

            } else {
                value = text = option;
            }

            const item = tile({
                lead,
                text: tag('span', {
                    className: 'text',
                    innerHTML: text
                })
            });

            if (opts.default === value) {
                item.classList.add('selected');
                defaultVal = item;
            }

            item.onclick = function () {
                if (value) {
                    resolve(value);
                    hide();
                }
            };

            if (disabled) item.classList.add('disabled');

            list.append(item);

            return option;
        });

        actionStack.push({
            id: 'select',
            action: hideSelect
        });

        document.body.append(selectDiv, mask);
        if (defaultVal) defaultVal.scrollIntoView();

        window.restoreTheme(true);

        function hideSelect() {
            selectDiv.classList.add('hide');
            window.restoreTheme();
            setTimeout(() => {
                document.body.removeChild(selectDiv);
                document.body.removeChild(mask);
            }, 300);
        }

        function hide() {
            actionStack.remove('select');
            hideSelect();
            let listItems = [...list.children];
            listItems.map(item => {
                item.onclick = null;
            });
        }
    });
}

/**
 * 
 * @param {string} titleText 
 * @param {string} message 
 */
function loaderShow(titleText, message) {
    if (!message && titleText) {
        message = titleText;
        titleText = '';
    }

    const oldLoaderDiv = tag.get('#__loader');

    if (oldLoaderDiv) oldLoaderDiv.remove();

    const titleSpan = tag('strong', {
        className: 'title',
        textContent: titleText
    });
    const messageSpan = tag('span', {
        className: 'message loader',
        children: [
            tag('span', {
                className: 'loader'
            }),
            tag('div', {
                className: 'message',
                innerHTML: message
            })
        ]
    });
    const loaderDiv = oldLoaderDiv || tag('div', {
        className: 'prompt alert',
        id: '__loader',
        children: [
            titleSpan,
            messageSpan
        ]
    });
    const mask = tag.get('#__loader-mask') || tag('span', {
        className: 'mask',
        id: '__loader-mask'
    });

    if (!oldLoaderDiv) {
        window.freeze = true;
        document.body.append(loaderDiv, mask);
        window.restoreTheme(true);
    }
}

function loaderHide() {
    const loaderDiv = document.querySelector('#__loader');
    const mask = document.querySelector('#__loader-mask');

    if (loaderDiv) loaderDiv.classList.add('hide');
    window.restoreTheme();
    setTimeout(() => {
        window.freeze = false;
        if (loaderDiv && loaderDiv.isConnected) loaderDiv.remove();
        if (mask && mask.isConnected) mask.remove();
    }, 300);
}

/**
 * 
 * @param {string} titleText 
 * @param {string} html
 * @param {string} [hideButtonText]
 */
function box(titleText, html, hideButtonText) {
    let waitFor = 0,
        strOK = hideButtonText || strings.ok,
        _onclick = () => {},
        _onhide = () => {};

    const promiseLike = {
        hide,
        wait,
        onclick,
        onhide
    };

    const okBtn = tag('button', {
        className: 'disabled',
        textContent: strOK,
        onclick: hide
    });
    const box = tag('div', {
        className: 'prompt box',
        children: [
            tag('strong', {
                className: 'title',
                textContent: titleText
            }),
            tag('div', {
                className: 'message',
                innerHTML: html,
                onclick: __onclick
            }),
            tag('div', {
                className: 'button-container',
                child: okBtn
            })
        ]
    });
    const mask = tag('span', {
        className: 'mask',
        onclick: hide
    });

    setTimeout(decTime, 0);

    actionStack.push({
        id: 'box',
        action: hideSelect
    });

    document.body.append(box, mask);

    window.restoreTheme(true);

    function decTime() {
        if (waitFor >= 1000) {
            okBtn.textContent = `${strOK} (${parseInt(waitFor/1000)}sec)`;
            waitFor -= 1000;
            setTimeout(decTime, 1000);
        } else {
            okBtn.textContent = strOK;
            okBtn.classList.remove("disabled");
        }
    }

    function hideSelect() {
        box.classList.add('hide');
        window.restoreTheme();
        setTimeout(() => {
            document.body.removeChild(box);
            document.body.removeChild(mask);
        }, 300);
    }

    function hide() {
        if (waitFor) return;
        const imgs = box.getAll('img');
        if (imgs) {
            for (let img of imgs) {
                URL.revokeObjectURL(img.src);
            }
        }
        actionStack.remove('box');
        hideSelect();
        if (_onhide) _onhide();
    }

    function wait(time) {
        time -= time % 1000;
        waitFor = time;
        return promiseLike;
    }

    function __onclick() {
        if (_onclick) _onclick();
    }

    /**
     * 
     * @param {function(this:HTMLElement, Event):void} onclick 
     */
    function onclick(onclick) {
        _onclick = onclick;
        return promiseLike;
    }

    /**
     * 
     * @param {function():void} onhide 
     */
    function onhide(onhide) {
        _onhide = onhide;
        return promiseLike;
    }

    return promiseLike;
}

/**
 * Choose color
 * @param {string} defaultColor 
 */
function color(defaultColor) {
    let type = helpers.checkColorType(defaultColor) || 'hex';
    return new Promise(resolve => {
        const colorModes = ['hsl', 'hex', 'rgb'];
        let mode = colorModes.indexOf(type);
        let color = null;

        const parent = tag('div', {
            className: 'message color-picker'
        });
        const okBtn = tag('button', {
            textContent: strings.ok,
            onclick: function () {
                hide();
                resolve(color);
            }
        });
        const toggleMode = tag('button', {
            textContent: type,
            onclick: function (e) {
                ++mode;
                if (mode >= colorModes.length) mode = 0;
                type = colorModes[mode];
                this.textContent = type;
                picker.setOptions({
                    color,
                    editorFormat: type
                });
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        });
        const box = tag('div', {
            className: 'prompt box',
            children: [
                tag('strong', {
                    className: 'title',
                    textContent: strings['choose color']
                }),
                parent,
                tag('div', {
                    className: 'button-container',
                    children: [toggleMode, okBtn]
                })
            ]
        });
        const mask = tag('span', {
            className: 'mask',
            onclick: hide
        });
        const picker = new Picker({
            parent,
            popup: false,
            editor: true,
            color: defaultColor,
            onChange,
            alpha: true,
            editorFormat: type
        });

        picker.show();

        actionStack.push({
            id: 'box',
            action: hideSelect
        });

        document.body.append(box, mask);

        window.restoreTheme(true);

        function hideSelect() {
            box.classList.add('hide');
            window.restoreTheme();
            setTimeout(() => {
                document.body.removeChild(box);
                document.body.removeChild(mask);
            }, 300);
        }

        function hide() {
            actionStack.remove('box');
            hideSelect();
            picker.destroy();
        }

        function onChange(c) {
            if (!c) return;

            const alpha = c.rgba[3] < 1 ? true : false;
            if (type === 'hex') {

                if (alpha) color = c.hex;
                else color = c.hex.slice(0, -2);

            } else if (type === 'rgb') {

                if (alpha) color = c.rgbaString;
                else color = c.rgbString;

            } else {

                if (alpha) color = c.hslaString;
                else color = c.hslString;

            }

            if (color) {
                setTimeout(() => {
                    const $editor = box.get('.picker_editor');
                    if ($editor) $editor.style.backgroundColor = color;
                }, 0);
            }
        }
    });
}

export default {
    prompt,
    multiPrompt,
    alert,
    confirm,
    select,
    loaderShow,
    loaderHide,
    box,
    color
};