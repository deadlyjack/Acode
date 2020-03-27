import dialogs from './dialogs';
import template from '../views/rating.hbs';
import constants from '../constants';
import helpers from '../modules/helpers';

function rateBox() {
  const box = dialogs.box('Did you like the app?', template, onInteract, onhide, strings.cancel);

  function onInteract(e) {
    /**
     * @type {HTMLSpanElement}
     */
    const $el = e.target;
    if (!$el) return;
    let val = $el.getAttribute('value');
    if (val) val = parseInt(val);
    const siblings = $el.parentElement.children;
    const len = siblings.length;
    for (let i = 0; i < len; ++i) {
      const star = siblings[i];
      star.classList.remove('stargrade', 'star_outline');
      if (i < val) star.classList.add('stargrade');
      else star.classList.add('star_outline');
    }

    setTimeout(() => {
      if (val === 5) window.open(`https://play.google.com/store/apps/details?id=${BuildInfo.packageName}`, '_system');
      else window.open(`mailto:dellevenjack@gmail.com?subject=feedback - Acode&body=<big>${getStars(val)}</big> <br> ${helpers.getFeedbackBody()}`, '_system');
    }, 100);

    localStorage.count = constants.RATING_TIME;
    box.hide();
  }

  /**
   * 
   * @param {number} num 
   */
  function getStars(num) {
    let star = num;
    let nostar = 5 - num;
    let str = '';
    while (star--) {
      str += '★';
    }

    while (nostar--) {
      str += '☆';
    }

    return str;
  }

  function onhide() {
    localStorage.count = -3;
  }
}

export default rateBox;