import tag from 'html-tag-js';
import Picker from 'vanilla-picker';
import restoreTheme from 'lib/restoreTheme';

let lastPicked = localStorage.__picker_last_picked || '#fff';

const HEX_COLOR = /^#([a-f0-9]{3}){1,2}([a-f0-9]{2})?$/i;
const RGB_COLOR = /^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(\s*,\s*\d?(\.\d+)?)?\)$/i;
const HSL_COLOR = /^hsla?\(([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(\s*,\s*\d?(\.\d+)?)?\)$/i;

/**
 * Choose color
 * @param {string} defaultColor Default color
 * @param {Function} onhide Callback function
 * @returns {Promise<string>}
 */
function color(defaultColor, onhide) {
  defaultColor = defaultColor || lastPicked;
  let type = checkColorType(defaultColor) || 'hex';
  return new Promise((resolve) => {
    const colorModes = ['hsl', 'hex', 'rgb'];
    let mode = colorModes.indexOf(type);
    let color = null;

    const parent = tag('div', {
      className: 'message color-picker',
    });
    const okBtn = tag('button', {
      textContent: strings.ok,
      onclick: function () {
        hide();
        lastPicked = color;
        localStorage.__picker_last_picked = color;
        resolve(color);
      },
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
          editorFormat: type,
        });
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      },
    });
    const box = tag('div', {
      className: 'prompt box',
      children: [
        tag('strong', {
          className: 'title',
          textContent: strings['choose color'],
        }),
        parent,
        tag('div', {
          className: 'button-container',
          children: [toggleMode, okBtn],
        }),
      ],
    });
    const mask = tag('span', {
      className: 'mask',
      onclick: hide,
    });
    const picker = new Picker({
      parent,
      popup: false,
      editor: true,
      color: defaultColor,
      onChange,
      alpha: true,
      editorFormat: type,
    });

    picker.show();

    actionStack.push({
      id: 'box',
      action: hideSelect,
    });

    document.body.append(box, mask);

    restoreTheme(true);

    function hideSelect() {
      box.classList.add('hide');
      restoreTheme();
      setTimeout(() => {
        document.body.removeChild(box);
        document.body.removeChild(mask);
      }, 300);
    }

    function hide() {
      actionStack.remove('box');
      picker.destroy();
      hideSelect();
      if (typeof onhide === 'function') onhide();
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

/**
 *
 * @param {string} color
 * @returns {'hex'|'rgb'|'hsl'}
 */
function checkColorType(color) {
  if (HEX_COLOR.test(color)) return 'hex';
  if (RGB_COLOR.test(color)) return 'rgb';
  if (HSL_COLOR.test(color)) return 'hsl';
  return null;
}

export default color;
