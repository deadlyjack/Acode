import './styles.scss';
import Ref from 'html-tag-js/ref';

/**
 * @typedef {Object} Checkbox
 * @property {string} text
 * @property {Ref} ref
 * @property {boolean} checked
 * @property {string} [name]
 * @property {string} [id]
 * @property {string} [size]
 * @property {"checkbox"|"radio"} [type]
 */

/**
 * Create a checkbox
 * @param {string | Checkbox} text
 * @param {Boolean} checked
 * @param {string} [name]
 * @param {string} [id]
 * @param {string} [size]
 * @param {"checkbox"|"radio"} [type]
 * @param {Ref} [ref]
 */
function Checkbox(text, checked, name, id, type, ref, size) {
  if (typeof text === 'object') {
    ({ text, checked, name, id, type, ref, size } = text);
  }

  size = size || '1rem';

  const $input = ref || new Ref();
  const $checkbox = <label className="input-checkbox">
    <input ref={$input} checked={checked} type={type || 'checkbox'} name={name} id={id} />
    <span style={{ height: size, width: size }} className="box"></span>
    <span>{text}</span>
  </label>;


  Object.defineProperties($checkbox, {
    checked: {
      get() {
        return !!$input.el.checked;
      },
      set(value) {
        $input.el.checked = value;
      },
    },
    onclick: {
      get() {
        return $input.el.onclick;
      },
      set(onclick) {
        $input.el.onclick = onclick;
      },
    },
    onchange: {
      get() {
        return $input.el.onchange;
      },
      set(onchange) {
        $input.el.onchange = onchange;
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
    toggle: {
      value() {
        this.checked = !this.checked;
      }
    }
  });

  return $checkbox;
}

export default Checkbox;
