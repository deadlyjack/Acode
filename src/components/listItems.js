import Ref from 'html-tag-js/ref';
import FileBrowser from '../pages/fileBrowser/fileBrowser';
import Checkbox from './checkbox';
import dialogs from './dialogs';

/**
 * @typedef {Object} ListItem
 * @property {string} key
 * @property {string} text
 * @property {string} [icon]
 * @property {string} [iconColor]
 * @property {string} [info]
 * @property {string} [value]
 * @property {(value:string)=>string} [valueText]
 * @property {boolean} [checkbox]
 * @property {string} [prompt]
 * @property {string} [promptType]
 * @property {import('./dialogboxes/prompt').PromptOptions} [promptOptions]
 */

/**
 * 
 * @param {HTMLUListElement} $list 
 * @param {Array<ListItem>} items 
 * @param {()=>void} callback called when setting is changed
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
  items.forEach((item) => {
    const $setting = new Ref();
    const $settingName = new Ref();
    const $item = <div className={`list-item ${item.sake ? 'sake' : ''}`} data-key={item.key} data-action='list-item'>
      <span className={`icon ${item.icon || 'no-icon'}`} style={{ color: item.iconColor }}></span>
      <div ref={$setting} className="container">
        <div ref={$settingName} className="text">{item.text.capitalize(0)}</div>
      </div>
    </div>;

    let $checkbox, $valueText;

    if (item.info) {
      $settingName.append(
        <span className='icon info info-button' data-action='info' onclick={() => {
          dialogs.alert(strings.info, item.info);
        }}></span>
      )
    }

    if (item.value !== undefined) {
      $valueText = <small className='value'></small>;
      setValueText($valueText, item.value, item.valueText?.bind(item));
      $setting.append($valueText);
    } else if (item.checkbox !== undefined) {
      $checkbox = Checkbox('', item.checkbox);
      $item.appendChild($checkbox);
      $item.style.paddingRight = '10px';
    }

    if (Number.isInteger(item.index)) {
      $items.splice(item.index, 0, $item);
    } else {
      $items.push($item);
    }
  });

  $list.innerHTML = '';
  $list.append(...$items);
  $list.addEventListener('click', onclick);

  /**
   * Click handler for $list
   * @this {HTMLElement}
   * @param {MouseEvent} e 
   */
  async function onclick(e) {
    const $target = e.target;
    const { action, key } = e.target.dataset;
    if (action !== 'list-item') return;

    const item = items.find((item) => item.key === key);
    if (!item) return;

    const { select, checkbox, prompt, file, folder, color, link } = item;
    const { text, value, valueText } = item;
    const { promptType, promptOptions } = item;

    const $valueText = $target.get('.value');
    const $checkbox = $target.get('.input-checkbox');
    let res;

    try {
      if (select) {
        res = await dialogs.select(text, select, {
          default: value,
        });
      } else if (checkbox !== undefined) {
        $checkbox.toggle();
        res = $checkbox.checked;
      } else if (prompt) {
        res = await dialogs.prompt(prompt, value, promptType, promptOptions);
      } else if (file || folder) {
        const { url } = await FileBrowser(mode);
        res = url;
      } else if (color) {
        res = await dialogs.color(value);
      } else if (link) {
        system.openInBrowser(link);
        return;
      }
    } catch (error) {
      console.log(error);
    }

    item.value = res;
    setValueText($valueText, res, valueText?.bind(item));
    callback(key, item.value);
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
