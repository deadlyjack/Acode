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
  const $page = Page(title);
  const $settingsList = tag('div', { className: 'main list' });

  if (settings.length > 5) {
    const $search = tag('span', {
      className: 'icon search',
      attr: {
        action: 'search',
      },
      onclick() {
        searchBar($settingsList);
      }
    });

    $page.header.append($search);
  }

  actionStack.push({
    id: title,
    action: $page.hide,
  });

  $page.onhide = function () {
    helpers.hideAd();
    actionStack.remove(title);
  };

  listItems($settingsList, settings, callback);

  $page.body = $settingsList;
  app.append($page);
  helpers.showAd();
}