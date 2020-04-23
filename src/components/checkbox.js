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
  type = type || "checkbox";
  const $checkbox = tag.parse(mustache.render($_checkbox, {
    text,
    checked,
    name,
    id,
    type
  }));

  Object.defineProperty($checkbox, 'checked', {
    get: function () {
      return !!$checkbox.get('input').checked;
    },
    set: function (value) {
      $checkbox.get('input').checked = value;
    }
  });

  return $checkbox;
}

export default Checkbox;