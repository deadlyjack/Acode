import tag from 'html-tag-js';

/**
 * Rerturn an icon
 * @param {string} icon
 * @param {string} [action]
 * @returns {HTMLSpanElement}
 */
export default function Icon(icon, action) {
  return tag('span', {
    className: 'icon ' + icon,
    attr: {
      action,
    },
  });
}
