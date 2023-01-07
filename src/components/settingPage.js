import Page from "./page";
import searchBar from "./searchbar";
import listItems from "./listItems";
import tag from "html-tag-js";
import helpers from "../utils/helpers";

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