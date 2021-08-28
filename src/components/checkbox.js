import tag from 'html-tag-js';
import mustache from 'mustache';
import $_checkbox from '../views/checkbox.hbs';

/**
 *
 * @param {String} text
 * @param {Boolean} checked
 * @param {String} [name]
 * @param {String} [id]
 * @param {"checkbox"|"radio"} [type]
 */
function Checkbox(text, checked, name, id, type) {
  type = type || 'checkbox';
  const $checkbox = tag.parse(
    mustache.render($_checkbox, {
      text,
      checked,
      name,
      id,
      type,
    })
  );

  const $input = $checkbox.get('input');

  Object.defineProperties($checkbox, {
    checked: {
      get() {
        return !!$input.checked;
      },
      set(value) {
        $input.checked = value;
      },
    },
    onclick: {
      get() {
        return $input.onclick;
      },
      set(onclick) {
        $input.onclick = onchange;
      },
    },
    onchange: {
      get() {
        return $input.onchange;
      },
      set(onchange) {
        $input.onchange = onchange;
      },
    },
    value: {
      get() {
        return this.checked;
      },
      set(value) {
        this.checked = value;
      },
    },
  });

  return $checkbox;
}

export default Checkbox;
