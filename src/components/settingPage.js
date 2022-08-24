import Page from "./page";
import searchBar from "./searchbar";
import listItems from "./listItems";
import tag from "html-tag-js";
import helpers from "../utils/helpers";

/**
 * 
 * @param {string} title 
 * @param {Array<object>} settings 
 * @param {(key, value) => void} callback 
 */

export default function settingsPage(title, settings, callback) {
  let hideSearchBar = () => { };
  const $page = Page(title);
  const $list = tag('div', { className: 'main list' });

  if (settings.length > 5) {
    const $search = tag('span', {
      className: 'icon search',
      attr: {
        action: 'search',
      },
      onclick() {
        searchBar($list, (hide) => {
          hideSearchBar = hide;
        });
      }
    });

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
  app.append($page);
  helpers.showAd();

  return { $page, $list };
}