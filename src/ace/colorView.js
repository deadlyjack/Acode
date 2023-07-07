/**
 * This piece of code belongs to github.com/easylogic and is licensed under MIT
 * @see https://github.com/easylogic/ace-colorpicker/blob/main/src/extension/ace/colorview.js
 */

import helpers from 'utils/helpers';
import { Irid } from 'irid';
import { HEX, HSL, HSLA, RGB, RGBA } from 'utils/color';

const COLORPICKER_TOKEN_CLASS = '.ace_numeric,.ace_color';
const changedRules = [];

let editor = null;

/**
 * Initialize color view
 * @param {AceAjax.Editor} e Editor instance
 */
export default function initColorView(e) {
  editor = e;
  const { renderer } = editor;

  editor.on('changeMode', onChangeMode);
  renderer.on('afterRender', afterRender);
}

export function deactivateColorView() {
  const { renderer } = editor;

  changedRules.forEach((rule) => rule.shift());
  changedRules.length = 0;
  forceRender();

  editor.off('changeMode', onChangeMode);
  renderer.off('afterRender', afterRender);
}

/**
 * Checks if the session supports color
 * @param {AceAjax.IEditSession} session 
 * @returns 
 */
function sessionSupportsColor(session) {
  const mode = session.getMode().$id.split('/').pop();
  return /css|less|scss|sass|stylus|html|dart/.test(mode)
    ? mode
    : false;
}

function onChangeMode() {
  const session = editor.session;
  let forceUpdate = false;

  // if mode is not css, scss, sass, less, stylus, or html, return
  const mode = sessionSupportsColor(session);
  if (session._addedColorRule || !mode) {
    return;
  }

  let rules = session.$mode.$highlightRules.getRules();

  if (mode === 'css') {
    rules = { 'ruleset': rules['ruleset'] };
  } else if (mode === 'html') {
    rules = { 'css-ruleset': rules['css-ruleset'] };
  }

  Object.keys(rules).forEach((key) => {
    const rule = rules[key];
    if (rule instanceof Array) {
      const ruleExists = rule.some((r) => r.token === 'color');
      if (ruleExists) return;
      forceUpdate = true;
      rule.unshift({
        token: "color",
        regex: `${HEX}|${RGB}|${RGBA}|${HSL}|${HSLA}`,
      });
      changedRules.push(rule);
      return;
    }
  });

  if (!forceUpdate) return;

  forceRender();
}

function afterRender() {
  const { session, renderer } = editor;
  const { content } = renderer;

  // if session is css, scss, less, sass, stylus, or html (with css mode), continue

  if (!sessionSupportsColor(session)) {
    return;
  }

  content.getAll(COLORPICKER_TOKEN_CLASS).forEach(( /**@type {HTMLElement} */ el) => {
    let content = el.textContent;

    if (el.dataset.modified === 'true') return;

    if (!(helpers.isValidColor(content) || el.classList.contains('ace_color'))) return;

    try {
      const brightness = Irid(content).lightness();
      const fontColorString = brightness > 0.5 ? "#000" : "#fff";
      el.classList.add('ace_color');
      el.style.cssText = `background-color: ${content}; color: ${fontColorString}; pointer-events: all;`;
      el.dataset.modified = 'true';
    } catch (error) {
      console.log("Invalid color", content);
    }
  });
}

function forceRender() {
  const { session } = editor;
  // force recreation of tokenizer
  session.$mode.$tokenizer = null;
  session.bgTokenizer.setTokenizer(editor.session.$mode.getTokenizer());
  // force re-highlight whole document
  session.bgTokenizer.start(0);
}
