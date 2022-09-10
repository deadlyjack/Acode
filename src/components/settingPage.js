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
  let note;

  settings = settings.filter((setting) => {
    if ('note' in setting) {
      note = setting.note;
      return false;
    }
    return true;
  });

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

  if (note) {
    $page.append(tag('div', {
      className: 'note',
      children: [
        tag('div', {
          className: 'note-title',
          children: [
            tag('span', {
              className: 'icon info'
            }),
            tag('span', {
              textContent: strings.info,
            }),
          ]
        }),
        tag('p', {
          textContent: note,
        }),
      ],
    }));
  }

  $page.append(tag('div', {
    style: {
      height: '50vh',
    },
  }));

  app.append($page);
  helpers.showAd();

  return { $page, $list };
}