import tag from 'html-tag-js';
import tile from '../tile';
/**
 *
 * @param {string} title
 * @param {string[]} options [value, text, icon, disable?]
 * @param {{
 *            onCancel: ()=>void,
 *            hideOnSelect: boolean,
 *            textTransform: boolean,
 *            default: String
 *        }} opts
 * @param {string} opts.default
 * @param {string} opts.onCancel
 * @param {boolean} opts.hideOnSelect
 * @param {boolean} opts.textTransform
 */
function select(title, options, opts = {}) {
  return new Promise((resolve) => {
    const titleSpan =
      title &&
      tag('strong', {
        className: 'title',
        textContent: title,
      });
    const $list = tag('ul', {
      className:
        'scroll' + (opts.textTransform === false ? ' no-text-transform' : ''),
    });
    const selectDiv = tag('div', {
      className: 'prompt select',
      children: titleSpan ? [titleSpan, $list] : [$list],
    });
    const mask = tag('span', {
      className: 'mask',
      onclick: () => {
        hide();
        if (typeof opts.onCancel === 'function') opts.onCancel();
      },
    });
    let $defaultVal;

    if (opts.hideOnSelect === undefined) opts.hideOnSelect = true;

    options.map((option) => {
      let value = null;
      let text = null;
      let lead = null;
      let disabled = false;
      if (Array.isArray(option)) {
        value = option[0];
        text = option[1];

        if (option.length > 2 && typeof option[2] === 'string') {
          lead = tag('i', {
            className: `icon ${option[2]}`,
          });
        }

        option.map((o, i) => {
          if (typeof o === 'boolean' && i > 1) disabled = !o;
        });
      } else {
        value = text = option;
      }

      const $item = tile({
        lead,
        text: tag('span', {
          className: 'text',
          innerHTML: text,
        }),
      });

      if (opts.default === value) {
        $item.classList.add('selected');
        $defaultVal = $item;
      }

      $item.tabIndex = '0';

      $item.onclick = function () {
        if (value !== undefined) {
          resolve(value);
          if (opts.hideOnSelect) hide();
        }
      };

      if (disabled) $item.classList.add('disabled');

      $list.append($item);
    });

    actionStack.push({
      id: 'select',
      action: hideSelect,
    });

    document.body.append(selectDiv, mask);
    if ($defaultVal) $defaultVal.scrollIntoView();

    const $firstChild = $defaultVal || $list.firstChild;
    if ($firstChild && $firstChild.focus) $firstChild.focus();

    window.restoreTheme(true);

    function hideSelect() {
      selectDiv.classList.add('hide');
      window.restoreTheme();
      setTimeout(() => {
        document.body.removeChild(selectDiv);
        document.body.removeChild(mask);
      }, 300);
    }

    function hide() {
      actionStack.remove('select');
      hideSelect();
      let listItems = [...$list.children];
      listItems.map((item) => (item.onclick = null));
    }
  });
}

export default select;
