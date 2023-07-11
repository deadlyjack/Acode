import Page from "./page";
import Ref from 'html-tag-js/ref';
import Checkbox from './checkbox';
import alert from 'dialogs/alert';
import searchBar from "./searchbar";
import helpers from "utils/helpers";
import select from 'dialogs/select';
import prompt from 'dialogs/prompt';
import colorPicker from 'dialogs/color';
import actionStack from 'lib/actionStack';
import FileBrowser from 'pages/fileBrowser';
import { isValidColor } from 'utils/color/regex';

/**
 * 
 * @param {string} title 
 * @param {Array<object>} settings 
 * @param {(key, value) => void} callback  called when setting is changed
 */

export default function settingsPage(title, settings, callback) {
  let hideSearchBar = () => { };
  const $page = Page(title);
  const $list = <div className='main list'></div>;
  let note;

  settings = settings.filter((setting) => {
    if ('note' in setting) {
      note = setting.note;
      return false;
    }
    return true;
  });

  if (settings.length > 5) {
    const $search = <span className='icon search' attr-action='search'></span>;
    $search.onclick = () => {
      searchBar($list, (hide) => {
        hideSearchBar = hide;
      });
    };

    $page.header.append($search);
  }

  actionStack.push({
    id: title,
    action: $page.hide,
  });

  $page.ondisconnect = () => hideSearchBar();
  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove(title);
  };

  listItems($list, settings, callback);

  $page.body = $list;

  if (note) {
    $page.append(
      <div className='note'>
        <div className='note-title'>
          <span className='icon info'></span>
          <span>{strings.info}</span>
        </div>
        <p innerHTML={note}></p>
      </div>
    );
  }

  $page.append(<div style={{ height: '50vh' }}></div>);

  app.append($page);
  helpers.showAd();

  return { $page, $list };
}

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
 * @property {import('dialogs/prompt').PromptOptions} [promptOptions]
 */

/**
 * 
 * @param {HTMLUListElement} $list 
 * @param {Array<ListItem>} items 
 * @param {()=>void} callback called when setting is changed
 */
function listItems($list, items, callback) {
  const $items = [];

  // sort settings by text before rendering
  items.sort((acc, cur) => acc.text.localeCompare(cur.text));
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
          alert(strings.info, item.info);
        }}></span>
      );
    }

    if (item.checkbox !== undefined || typeof item.value === 'boolean') {
      $checkbox = Checkbox('', item.checkbox || item.value);
      $item.appendChild($checkbox);
      $item.style.paddingRight = '10px';
    } else if (item.value !== undefined) {
      $valueText = <small className='value'></small>;
      setValueText($valueText, item.value, item.valueText?.bind(item));
      $setting.append($valueText);
      setColor($item, item.value);
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

    const {
      select: options,
      prompt: promptText,
      color: selectColor,
      checkbox,
      file,
      folder,
      link,
    } = item;
    const { text, value, valueText } = item;
    const { promptType, promptOptions } = item;

    const $valueText = $target.get('.value');
    const $checkbox = $target.get('.input-checkbox');
    let res;

    try {
      if (options) {
        res = await select(text, options, {
          default: value,
        });
      } else if (checkbox !== undefined) {
        $checkbox.toggle();
        res = $checkbox.checked;
      } else if (promptText) {
        res = await prompt(promptText, value, promptType, promptOptions);
        if (res === null) return;
      } else if (file || folder) {
        const mode = file ? 'file' : 'folder';
        const { url } = await FileBrowser(mode);
        res = url;
      } else if (selectColor) {
        res = await colorPicker(value);
      } else if (link) {
        system.openInBrowser(link);
        return;
      }
    } catch (error) {
      console.log(error);
    }

    item.value = res;
    setValueText($valueText, res, valueText?.bind(item));
    setColor($target, res);
    callback(key, item.value);
  }
}

/**
 * Sets color decoration of a setting
 * @param {HTMLDivElement} $setting 
 * @param {string} color 
 * @returns 
 */
function setColor($setting, color) {
  if (!isValidColor(color)) return;
  /**@type {HTMLSpanElement} */
  const $noIcon = $setting.get('.no-icon');
  if (!$noIcon) return;
  $noIcon.style.backgroundColor = color;
}

/**
 * Sets the value text of a setting
 * @param {HTMLSpanElement} $valueText 
 * @param {string} value 
 * @param {string} valueText 
 * @returns 
 */
function setValueText($valueText, value, valueText) {
  if (!$valueText) return;

  if (typeof valueText === 'function') {
    value = valueText(value);
  }

  if (typeof value === 'string') {
    if (value.match('\n')) [value] = value.split('\n');

    if (value.length > 47) {
      value = value.slice(0, 47) + '...';
    }
  }

  $valueText.textContent = value;
}
