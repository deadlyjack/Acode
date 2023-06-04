import quickTools from 'components/quickTools';
import constants from "lib/constants";
import appSettings from "lib/settings";
import actions, { key } from './quickTools';

const CONTEXT_MENU_TIMEOUT = 500;
const MOVEX_THRESHOLD = 50;

let time;
let movex;
let movedx; // total moved x
let touchmoved;
let isClickMode;
let contextmenu;
let contextmenuTimeout;
let active = false; // is button already active

/**@type {HTMLElement} */
let $row;
/**@type {number} */
let timeout;
/**@type {HTMLElement} */
let $touchstart;

function reset() {
  movex = 0;
  movedx = 0;
  time = 300;
  $row = null;
  $touchstart = null;
  contextmenu = false;
  touchmoved = undefined;
  contextmenuTimeout = null;
  active = false;
}

/**
 * Initialize quick tools
 * @param {HTMLElement} $footer 
 */
export default function init() {
  const { $footer, $toggler, $input, $shift, $ctrl, $alt, $meta, $save } = quickTools;

  $toggler.addEventListener('click', () => {
    actions('toggle');
  });

  key.on('shift', (value) => {
    if (value) $shift.classList.add('active');
    else $shift.classList.remove('active');
  });

  key.on('ctrl', (value) => {
    if (value) $ctrl.classList.add('active');
    else $ctrl.classList.remove('active');
  });

  key.on('alt', (value) => {
    if (value) $alt.classList.add('active');
    else $alt.classList.remove('active');
  });

  key.on('meta', (value) => {
    if (value) $meta.classList.add('active');
    else $meta.classList.remove('active');
  });

  editorManager.on(['file-content-changed', 'switch-file'], () => {
    if (editorManager.activeFile?.isUnsaved) {
      $save.classList.add('notice');
    } else {
      $save.classList.remove('notice');
    }
  });

  editorManager.on('save-file', () => {
    $save.classList.remove('notice');
  });

  editorManager.editor.on('focus', () => {
    if (key.shift || key.ctrl || key.alt || key.meta) {
      quickTools.$input.focus();
    }
  });

  root.append($footer, $toggler);
  document.body.append($input);
  if (appSettings.value.quickToolsTriggerMode === appSettings.QUICKTOOLS_TRIGGER_MODE_CLICK) {
    isClickMode = true;
    $footer.addEventListener('click', onclick);
    $footer.addEventListener('contextmenu', oncontextmenu);
  } else {
    $footer.addEventListener('touchstart', touchstart);
    $footer.addEventListener('keydown', touchstart);
  }

  appSettings.on('update:quickToolsTriggerMode', (value) => {
    if (value === appSettings.QUICKTOOLS_TRIGGER_MODE_CLICK) {
      $footer.removeEventListener('touchstart', touchstart);
      $footer.removeEventListener('keydown', touchstart);
      $footer.addEventListener('contextmenu', onclick);
      $footer.addEventListener('click', onclick);
    } else {
      $footer.removeEventListener('contextmenu', onclick);
      $footer.removeEventListener('click', onclick);
      $footer.addEventListener('keydown', touchstart);
      $footer.addEventListener('touchstart', touchstart);
    }
  });
}

function onclick(e) {
  reset();

  e.preventDefault();
  e.stopPropagation();
  click(e.target);
  clearTimeout(timeout);
}

function touchstart(e) {
  reset();

  const $el = e.target;
  if ($el instanceof HTMLInputElement) {
    return;
  }

  $touchstart = $el;
  e.preventDefault();
  e.stopPropagation();

  if ($el.dataset.repeate === 'true') {
    contextmenuTimeout = setTimeout(() => {
      if (touchmoved) return;
      contextmenu = true;
      oncontextmenu(e);
    }, CONTEXT_MENU_TIMEOUT);
  }

  if ($el.classList.contains('active')) {
    active = true;
  } else {
    $el.classList.add('active');
  }
  document.addEventListener('touchmove', touchmove);
  document.addEventListener('keyup', touchcancel);
  document.addEventListener('touchend', touchend);
  document.addEventListener('touchcancel', touchcancel);
}

/**
 * Event handler for touchmove event
 * @param {TouchEvent} e 
 */
function touchmove(e) {
  if (contextmenu || touchmoved === false) return;

  const { $row1, $row2 } = quickTools;
  const $el = e.target;
  const { clientX } = e.touches[0];

  if (movex === 0) {
    movex = clientX;
    return;
  }

  const diff = movex - clientX;
  if (touchmoved === undefined) {
    if (Math.abs(diff) > appSettings.value.touchMoveThreshold) {
      touchmoved = true;
    } else {
      if ($row) {
        const movedX = $row.scrollLeft % $row.clientWidth;
        // $row.scrollBy(-movedX, 0);
        // scrollBy is not working on mobile
        $row.scrollLeft -= movedX;
      }
      touchmoved = false;
      return;
    }
  }

  movedx += diff;

  if (!$row) {
    if ($row1?.contains($el)) {
      $row = $row1;
    } else if ($row2?.contains($el)) {
      $row = $row2;
    }
  }

  if ($row) {
    $row.style.scrollBehavior = 'unset';
    $row.scrollLeft += diff;
  }

  if (!active) $touchstart.classList.remove('active');
  movex = clientX;
}

/**
 * Event handler for touchend event
 * @param {TouchEvent} e 
 */
function touchend(e) {
  const { $row1 } = quickTools;
  const $el = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

  if (touchmoved && $row) {
    $row.style.scrollBehavior = 'smooth';
    const slide = parseInt($row.scrollLeft / $row.clientWidth, 10);
    let scroll = 0;
    if (movedx < 0 && movedx > -MOVEX_THRESHOLD) {
      scroll = (slide - 1) * $row.clientWidth;
    } else if (movedx > 0 && movedx > MOVEX_THRESHOLD) {
      scroll = (slide + 1) * $row.clientWidth;
    } else {
      scroll = slide * $row.clientWidth;
    }

    if ($row === $row1) {
      localStorage.quickToolRow1ScrollLeft = scroll;
    } else {
      localStorage.quickToolRow2ScrollLeft = scroll;
    }

    $row.scrollLeft = scroll;
    touchcancel(e);
    return;
  }


  if ($touchstart !== $el || contextmenu) {
    touchcancel(e);
    return;
  }

  touchcancel(e);
  click($el);
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
  if (!active) $touchstart.classList.remove('active');
}

/**
 * Handler for contextmenu event
 * @param {TouchEvent|MouseEvent} e 
 */
function oncontextmenu(e) {
  const $el = e.target;
  const { lock } = $el.dataset;

  if (lock === 'true') {
    return; // because button with lock=true is locked when clicked so contextmenu doesn't make sense
  }

  const { editor, activeFile } = editorManager;

  if (isClickMode && appSettings.value.vibrateOnTap) {
    navigator.vibrate(constants.VIBRATION_TIME_LONG);
    $el.classList.add('active');
  }

  const dispatchEventWithTimeout = () => {
    if (time > 50) {
      time -= 10;
    }
    click($el);
    timeout = setTimeout(dispatchEventWithTimeout, time);
  };

  if (activeFile.focused) {
    editor.focus();
  }
  dispatchEventWithTimeout();
}

/**
 * Executes the action associated with the button
 * @param {HTMLElement} $el 
 */
function click($el) {
  const { action } = $el.dataset;
  if (!action) return;

  let { value } = $el.dataset;

  if (!value) {
    value = $el.value;
  }

  actions(action, value);
}
