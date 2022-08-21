import tag from 'html-tag-js';
import FileBrowser from '../pages/fileBrowser/fileBrowser';
import Checkbox from './checkbox';
import dialogs from './dialogs';

/**
 * 
 * @param {HTMLUListElement} $list 
 * @param {Array<Object>} items 
 * @param {()=>void} callback 
 */
export default function listItems($list, items, callback, sort = true) {
  items.sort((a, b) => {
    if (a.index && b.index) {
      return a.index - b.index;
    }
    return a.key < b.key ? -1 : 1;
  });
  const $items = [];

  if (sort) items = items.sort((a, b) => a.text < b.text ? -1 : 1);
  items.forEach((setting) => {
    const $setting = tag('div', {
      className: 'container',
      child: tag('span', {
        className: 'text',
        textContent: `${setting.text}`.capitalize(0),
      }),
    });
    const $item = tag('div', {
      className: 'list-item' + (setting.sake ? ' sake' : ''),
      children: [
        tag('i', {
          className: `icon ${setting.icon || 'no-icon'}`,
          style: {
            color: setting.iconColor,
          }
        }),
        $setting,
      ],
      dataset: {
        key: setting.key,
        action: 'list-item',
      }
    });

    let $checkbox, $valueText;

    if (setting.value !== undefined) {
      $valueText = tag('small', {
        className: 'value',
      });
      setValueText($valueText, setting.value, setting.valueText);
      $setting.appendChild($valueText);
    } else if (setting.checkbox !== undefined) {
      $checkbox = Checkbox('', setting.checkbox);
      $item.appendChild($checkbox);
      $item.style.paddingRight = '10px';
    }

    if (Number.isInteger(setting.index)) {
      $items.splice(setting.index, 0, $item);
    } else {
      $items.push($item);
    }
  });

  $list.innerHTML = '';
  $list.append(...$items);
  $list.addEventListener('click', onclick);

  async function onclick(e) {
    const $target = e.target;
    const { action, key } = e.target.dataset;
    if (action !== 'list-item') return;

    const item = items.find((item) => item.key === key);
    if (!item) return;

    const { select, checkbox, prompt, file, folder, color, link } = item;
    const { text, value, valueText } = item;
    const { promptType, promptOptions } = item;

    if (select) {
      try {
        const res = await dialogs.select(text, select, {
          default: value,
        });
        const $valueText = $target.get('.value');
        setValueText($valueText, res, valueText);
        callback(key, res);
      } catch (error) {
        // ignore
      }

      return;
    }

    if (checkbox !== undefined) {
      const $checkbox = $target.get('.input-checkbox');
      $checkbox.toggle();
      callback(key, $checkbox.checked);
      return;
    }

    if (prompt) {
      try {
        const res = await dialogs.prompt(prompt, value, promptType, promptOptions);
        const $valueText = this.get('.value');
        setValueText($valueText, res, valueText);
        callback(key, res);
      } catch (error) {
        // ignore
      }

      return;
    }

    if (file || folder) {
      try {
        const res = await dialogs.multiPrompt(text, {
          placeholder: strings['select file'],
          value,
          type: 'text',
          required: true,
          readOnly: true,
          onclick() {
            const mode = file ? 'file' : 'folder';
            FileBrowser(mode, ({ uri }) => {
              this.value = uri;
            });
          }
        });
        const $valueText = this.get('.value');
        setValueText($valueText, res, valueText);
        callback(key, res);
      } catch (error) {
        // ignore
      }

      return;
    }

    if (color) {
      try {
        const res = await dialogs.color(value);
        const $valueText = this.get('.value');
        setValueText($valueText, res, valueText);
        callback(key, res);
      } catch (error) {
        // ignore
      }

      return;
    }

    if (link) {
      system.openInBrowser(link);
    }

    callback(key, value);
  }

  function setValueText($valueText, value, valueText) {
    if (!$valueText) return;
    if (valueText) {
      $valueText.textContent = valueText(value);
    } else {
      $valueText.textContent = value;
    }
  }
}
