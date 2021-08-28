import tag from 'html-tag-js';
import autosize from 'autosize';

/**
 *
 * @param {string} message
 * @param {string} defaultValue
 * @param {"textarea"|"text"|"numberic"|"tel"|"search"|"email"|"url"} type
 * @param {object} options
 * @param {RegExp} options.match
 * @param {boolean} options.required
 * @param {string} options.placeholder
 */
function prompt(message, defaultValue, type = 'text', options = {}) {
  return new Promise((resolve) => {
    const inputType = type === 'textarea' ? 'textarea' : 'input';
    type = type === 'filename' ? 'text' : type;

    const messageSpan = tag('span', {
      textContent: message,
      className: 'message scroll',
    });
    const input = tag(inputType, {
      value: defaultValue,
      className: 'input',
      placeholder: options.placeholder || '',
    });
    const okBtn = tag('button', {
      type: 'submit',
      textContent: strings.ok,
      disabled: !defaultValue,
      onclick: function () {
        if (options.required && !input.value) {
          errorMessage.textContent = strings.required;
          return;
        }
        hide();
        resolve(input.value);
      },
    });
    const cancelBtn = tag('button', {
      textContent: strings.cancel,
      type: 'button',
      onclick: function () {
        hide();
      },
    });
    const errorMessage = tag('span', {
      className: 'error-msg',
    });
    const promptDiv = tag('form', {
      action: '#',
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
          children: [cancelBtn, okBtn],
        }),
      ],
    });
    const mask = tag('span', {
      className: 'mask',
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
      action: hidePrompt,
    });

    window.restoreTheme(true);
    app.append(promptDiv, mask);
    input.focus();
    if (inputType === 'textarea') autosize(input);

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

export default prompt;
