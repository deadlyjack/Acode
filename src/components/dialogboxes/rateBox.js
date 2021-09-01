import dialogs from '../dialogs';
import template from '../../views/rating.hbs';
import constants from '../../lib/constants';
import helpers from '../../lib/utils/helpers';

function rateBox() {
  const box = dialogs
    .box('Did you like the app?', template, strings.cancel)
    .onclick(onInteract)
    .onhide(() => ++localStorage.count);

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
      if (val === 5) {
        window.open(
          `https://play.google.com/store/apps/details?id=${BuildInfo.packageName}`,
          '_system'
        );
        localStorage.dontAskForRating = true;
      } else {
        const stars = getStars(val);
        const subject = 'feedback - Acode editor';
        const textBody =
          stars + '</br>%0A' + helpers.getFeedbackBody('</br>%0A');
        const email = constants.FEEDBACK_EMAIL;
        window.open(
          `mailto:${email}?subject=${subject}&body=${textBody}`,
          '_system'
        );
      }
      ++localStorage.count;
    }, 100);

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

    while (star--) str += '★';
    while (nostar--) str += '☆';

    return str;
  }
}

export default rateBox;
