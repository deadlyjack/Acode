import tag from 'html-tag-js';
import constants from "../lib/constants";
import appSettings from "../lib/settings";
import quickToolsActions from './quickToolsActions';

const keyMapping = {
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
};
const CONTEXT_MENU_TIMEOUT = 1000;


let movex;
let time;
let touchmoved;
let isClickMode;
let contextmenu;
let contextmenuTimeout;

let $row;
let timeout;
let $touchstart;
let this$el;

export default init;

function reset() {
  console.log('reset');
  movex = 0;
  time = 300;
  $row = null;
  $touchstart = null;
  touchmoved = false;
  contextmenu = false;
  contextmenuTimeout = null;
}

/**
 * 
 * @param {HTMLElement} $el 
 */
function init($el) {
  this$el = $el;
  if (appSettings.value.quickToolsTriggerMode === appSettings.QUICKTOOLS_TRIGGER_MODE_CLICK) {
    isClickMode = true;
    $el.addEventListener('click', onclick);
    $el.addEventListener('contextmenu', oncontextmenu);
  } else {
    $el.addEventListener('touchstart', touchstart);
    $el.addEventListener('keydown', touchstart);
  }

  appSettings.on('update:quickToolsTriggerMode', (value) => {
    if (value === appSettings.QUICKTOOLS_TRIGGER_MODE_CLICK) {
      this$el.removeEventListener('touchstart', touchstart);
      this$el.removeEventListener('keydown', touchstart);
      this$el.addEventListener('contextmenu', onclick);
      this$el.addEventListener('click', onclick);
    } else {
      this$el.removeEventListener('contextmenu', onclick);
      this$el.removeEventListener('click', onclick);
      this$el.addEventListener('keydown', touchstart);
      this$el.addEventListener('touchstart', touchstart);
    }
  });
}

function onclick(e) {
  reset();

  const $el = e.target;
  const { which } = $el.dataset;

  if (which === undefined) {
    quickToolsActions(e);
    return;
  }

  e.preventDefault();
  e.stopPropagation();
  oncontextmenu(e);
  clearTimeout(timeout);
}

function touchstart(e) {
  reset();

  const $el = e.target;

  $touchstart = $el;

  if (isClickMode && this$el?.classList?.contains('active')) {
    this$el.classList.remove('active');
    clearTimeout(timeout);
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  if ($el.dataset.which) {
    contextmenuTimeout = setTimeout(() => {
      if (touchmoved) return;

      contextmenu = true;
      oncontextmenu(e);
    }, CONTEXT_MENU_TIMEOUT);
  }

  document.addEventListener('touchmove', touchmove);
  document.addEventListener('keyup', touchcancel);
  document.addEventListener('touchend', touchend);
  document.addEventListener('touchcancel', touchcancel);
}

/**
 * 
 * @param {TouchEvent} e 
 */
function touchend(e) {
  const $el = e.target;

  if ($touchstart !== $el || touchmoved || contextmenu) {
    touchcancel(e);
    return;
  }

  const { which } = $el.dataset;

  if (which === undefined) {
    quickToolsActions(e);
    return;
  }

  oncontextmenu(e);
  touchcancel(e);
}

/**
 *
 * @param {TouchEvent} e 
 */
function touchmove(e) {
  if (contextmenu) return;

  const $el = e.target;
  const { clientX } = e.touches[0];

  if (movex === 0) {
    movex = clientX;
    return;
  }

  const diff = movex - clientX;
  if (diff > 10 || diff < -10) {
    touchmoved = true;
  }

  if (!$row) {
    const $row1 = tag.get('#row1');
    const $row2 = tag.get('#row2');

    if ($row1.contains($el)) {
      $row = $row1;
    } else if ($row2.contains($el)) {
      $row = $row2;
    } else {
      throw new Error('Invalid element');
    }
  }

  $row.scrollBy(diff, 0);

  movex = clientX;
}

/**
 * 
 * @param {TouchEvent} e 
 */
function touchcancel(e) {
  document.removeEventListener('keyup', touchcancel);
  document.removeEventListener('touchend', touchend);
  document.removeEventListener('touchcancel', touchcancel);
  document.removeEventListener('touchmove', touchmove);
  clearTimeout(timeout);
  clearTimeout(contextmenuTimeout);
}

function oncontextmenu(e) {
  if (isClickMode && appSettings.value.vibrateOnTap) {
    navigator.vibrate(constants.VIBRATION_TIME_LONG);
    this$el.classList.add('active');
  }
  const $el = e.target;
  const { which } = $el.dataset;
  const { editor, activeFile } = editorManager;
  const $textarea = editor.textInput.getElement();
  const shiftKey = tag.get('#shift-key').dataset.state === 'on';

  const dispatchEventWithTimeout = () => {
    if (time > 50) {
      time -= 10;
    }

    dispatchKey({ which }, shiftKey, $textarea);
    timeout = setTimeout(dispatchEventWithTimeout, time);
  };

  if (activeFile.focused) {
    editor.focus();
  }
  dispatchEventWithTimeout();
}

function dispatchKey({ which }, shiftKey, $textarea) {
  const keyevent = window.createKeyboardEvent('keydown', {
    key: keyMapping[which],
    keyCode: which,
    shiftKey,
  });

  $textarea.dispatchEvent(keyevent);
}
