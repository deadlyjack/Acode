import tag from 'html-tag-js';
import Checkbox from './checkbox';

/**
 *
 * @param {string[]} options
 * @returns {elementContainer}
 */
function listTileGen(options) {
  const menuoptions = {};
  let counter = 0;

  options.map((option) => {
    let key = '';
    let text = '';
    if (Array.isArray(option)) {
      key = option[0];
      text = option[1];
    } else if (typeof option === 'string') {
      if (option === '{{saperate}}') {
        key = '{{saperate}}' + ++counter;
        text = option;
      } else {
        key = text = option;
      }
    } else {
      return Error('Expected string or array got ' + typeof option);
    }
    const item =
      text === '{{saperate}}'
        ? tag('hr')
        : tag('li', {
          child: tag('span', {
            className: 'text',
            textContent: text,
          }),
        });
    menuoptions[key] = item;
  });

  return menuoptions;
}

/**
 *
 * @param {string[]} options
 * @returns {elementContainer}
 */
function iconButton(options) {
  const opts = {};

  options.map((opt) => {
    let name = opt,
      className = opt;
    if (Array.isArray(opt)) {
      name = opt[0];
      className = opt[1];
    }

    opts[name] = tag('button', {
      className: `icon ${className}`,
    });
  });

  return opts;
}

/**
 * 
 * @param {HTMLUListElement} $list 
 * @param {Array<Object>} settings 
 * @param {()=>void} callback 
 */
function listItems($list, settings, callback, sort = true) {
  settings.sort((a, b) => {
    if (a.index && b.index) {
      return a.index - b.index;
    }
    return a.key < b.key ? -1 : 1;
  });
  const $items = [];

  if (sort) settings = settings.sort((a, b) => a.text < b.text ? -1 : 1);
  settings.forEach((setting) => {
    const $setting = tag('div', {
      className: 'container',
      child: tag('span', {
        className: 'text',
        textContent: `${setting.text}`.capitalize(0),
      }),
    });
    const $item = tag(setting.type || 'div', {
      className: 'list-item' + (setting.sake ? ' sake' : ''),
      children: [
        tag('i', {
          className: `icon ${setting.icon || 'no-icon'}`,
          style: {
            color: setting.color || '',
          }
        }),
        $setting,
      ],
      href: setting.href || undefined,
    });

    let $checkbox, $subText;

    if (setting.subText) {
      $subText = tag('small', {
        className: 'value',
        textContent: `${setting.subText || ''}`.capitalize(0),
      });
      $setting.appendChild($subText);
    } else if (setting.checkbox !== undefined) {
      $checkbox = Checkbox('', setting.checkbox);
      $item.appendChild($checkbox);
      $item.style.paddingRight = '10px';
    }

    if (setting.type !== 'a') {
      $item.onclick = callback.bind({
        key: setting.key,
        text: setting.text,
        set value(value) {
          if ($subText) $subText.textContent = value;
          else if ($checkbox) $checkbox.checked = value;
        },
        get value() {
          if ($subText) return $subText.textContent;
          else if ($checkbox) return $checkbox.checked;
        },
      });
    }

    if (Number.isInteger(setting.index)) {
      $items.splice(setting.index, 0, $item);
    } else {
      $items.push($item);
    }
  });

  $list.innerHTML = '';
  $list.append(...$items);
}

export default {
  listTileGen,
  iconButton,
  listItems,
};
