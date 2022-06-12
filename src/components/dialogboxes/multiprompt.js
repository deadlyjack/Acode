import tag from 'html-tag-js';
import autosize from 'autosize';
import inputhints from '../inputHints';
import Checkbox from '../checkbox';
import alert from './alert';

/**
 *
 * @param {string} message
 * @param {Array<Input|Array<Input>>} inputs
 * @param {String} help
 * @returns {Promise<Strings>}
 */
function multiPrompt(message, inputs, help) {
  return new Promise((resolve, reject) => {
    const $title = tag('div', {
      className: 'title',
      child: tag('span', {
        textContent: message
      }),
      style: {
        justifyContent: 'space-between',
      }
    });
    const $body = tag('div', {
      className: 'message scroll',
      style: {
        fontSize: '1rem',
      },
    });
    const okBtn = tag('button', {
      type: 'submit',
      textContent: strings.ok,
      onclick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        const inputAr = [...$body.getAll('input')];

        for (let $input of inputAr) {
          if ($input.isRequired && !$input.value) {
            $errorMessage.textContent = strings.required.capitalize();
            const $sibling = $input.nextElementSibling;
            const $parent = $input.parentElement;
            if ($sibling) $parent.insertBefore($errorMessage, $sibling);
            else $parent.append($errorMessage);
            return;
          }
        }
        hide();
        resolve(getValue());
      },
    });
    const cancelBtn = tag('button', {
      textContent: strings.cancel,
      type: 'button',
      onclick: function () {
        reject();
        hide();
      },
    });
    const $errorMessage = tag('span', {
      className: 'error-msg',
    });
    const $mask = tag('span', {
      className: 'mask',
    });
    const $promptDiv = tag('form', {
      action: '#',
      className: 'prompt multi',
      onsubmit: (e) => {
        e.preventDefault();
        if (!okBtn.disabled) {
          resolve(getValue());
        }
      },
      children: [
        $title,
        $body,
        tag('div', {
          className: 'button-container',
          children: [cancelBtn, okBtn],
        }),
      ],
    });

    if (/^https?:/.test(help)) {
      $title.append(tag('a', {
        href: help,
        className: 'icon help',
      }));
    } else if (typeof help === 'string') {
      $title.append(tag('span', {
        className: 'icon help',
        onclick: () => {
          alert(strings.info, help);
        }
      }));
    }

    inputs.map((input) => {
      if (Array.isArray(input)) createGroup(input);
      else $body.append(createInput(input));
    });

    actionStack.push({
      id: 'prompt',
      action: hidePrompt,
    });

    window.restoreTheme(true);
    system.setInputType("NORMAL");
    document.body.append($promptDiv, $mask);
    const $focusEl = [...$body.getAll('input[autofocus]')].pop();
    if ($focusEl) $focusEl.focus();

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
      system.setInputType(appSettings.value.keyboardMode);
      hidePrompt();
    }

    function getValue() {
      const values = {};
      const inputAr = [...$body.getAll('input')];
      inputAr.map(($input) => {
        if ($input.type === 'checkbox' || $input.type === 'radio')
          values[$input.id] = $input.checked;
        else values[$input.id] = $input.value;
      });

      return values;
    }

    /**
     *
     * @param {Array<input>} inputs
     */
    function createGroup(inputs) {
      const $text = tag('span', {
        className: 'hero',
      });
      const $group = tag('div', {
        className: 'input-group',
        child: $text,
      });

      inputs.map((input) => {
        let $input;

        if (typeof input === 'string') {
          $text.textContent = input;
        } else {
          $input = createInput(input);
          $group.append($input);
        }
      });

      $body.append($group);
    }

    /**
     *
     * @param {Input} input
     */
    function createInput(input) {
      const {
        id,
        required,
        type,
        match,
        value,
        placeholder,
        hints,
        name,
        disabled,
        onclick,
        onchange,
        readOnly,
        autofocus,
        hidden,
      } = input;

      const inputType = type === 'textarea' ? 'textarea' : 'input';
      let _type = type === 'filename' ? 'text' : type || 'text';

      let $input;

      if (_type === 'checkbox' || _type === 'radio') {
        $input = Checkbox(placeholder, value, name, id, type);
      } else {
        $input = tag(inputType, {
          id,
          placeholder,
          value: value,
          className: 'input',
          isRequired: required,
          readOnly,
          autofocus,
          hidden,
        });

        if (disabled) $input.disabled = true;
        if (hints) inputhints($input, hints);

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
      }

      Object.defineProperty($input, 'prompt', {
        value: { $body, hide },
      });

      if (onclick) $input.onclick = onclick.bind($input);
      if (onchange) $input.onchange = onchange.bind($input);

      return $input;
    }
  });
}

export default multiPrompt;
