export default function addTouchListeners(el, editor) {
  const MouseEvent = ace.require('ace/mouse/mouse_event').MouseEvent;
  let mode = 'scroll';
  let startX;
  let startY;
  let touchStartT;
  let longTouchTimer;
  let pos;
  let mvY;
  let mvX;
  let animation;
  let ge;
  let arX = [];
  let arY = [];
  let scrollSpeed = 1;
  const config = {
    passive: false,
  };

  if (el.touchListeners) {
    Object.keys(el.touchListeners).forEach((key) => {
      el.touchListeners[key].forEach((event) => {
        el.removeEventListener(key, event.listener, event.useCapture);
      })
    });
  }

  el.addEventListener('touchstart', touchStart, config);
  el.addEventListener('touchmove', touchMove, config);
  el.addEventListener('touchend', touchCancel, config);
  el.addEventListener('touchcancel', touchCancel, config);

  function touchStart(e) {
    if (e.target.parentElement.className === 'clipboard-contextmneu') return;
    if (e.target.classList.contains('cursor-control')) return;
    cancelAnimationFrame(animation);
    const touches = e.touches;
    if (longTouchTimer || touches.length > 1) {
      clearTimeout(longTouchTimer);
      longTouchTimer = null;
      touchStartT = -1;
      mode = 'zoom';
      return;
    }
    const h = editor.renderer.layerConfig.lineHeight;
    const w = editor.renderer.layerConfig.lineHeight;
    const t = e.timeStamp;
    const touchObj = touches[0];
    const x = touchObj.clientX;
    const y = touchObj.clientY;
    if (Math.abs(startX - x) + Math.abs(startY - y) > h) touchStartT = -1;
    startX = e.clientX = x;
    startY = e.clientY = y;
    const ev = new MouseEvent(e, editor);
    pos = ev.getDocumentPosition();
    if (t - touchStartT < 500 && touches.length == 1) {
      e.preventDefault();
      e.button = 0;
    } else {
      const cursor = editor.selection.cursor;
      const anchor = editor.selection.isEmpty()
        ? cursor
        : editor.selection.anchor;
      const cursorPos = editor.renderer.$cursorLayer.getPixelPosition(
        cursor,
        true,
      );
      const anchorPos = editor.renderer.$cursorLayer.getPixelPosition(
        anchor,
        true,
      );
      const rect = editor.renderer.scroller.getBoundingClientRect();
      const weightedDistance = function (x, y) {
        x = x / w;
        y = y / h - 0.75;
        return x * x + y * y;
      };
      if (e.clientX < rect.left) {
        mode = 'zoom';
        return;
      }
      const diff1 = weightedDistance(
        e.clientX - rect.left - cursorPos.left,
        e.clientY - rect.top - cursorPos.top,
      );
      const diff2 = weightedDistance(
        e.clientX - rect.left - anchorPos.left,
        e.clientY - rect.top - anchorPos.top,
      );
      if (diff1 < 3.5 && diff2 < 3.5)
        mode = diff1 > diff2 ? 'cursor' : 'anchor';
      if (diff2 < 3.5) mode = 'anchor';
      else if (diff1 < 3.5) mode = 'cursor';
      else mode = 'scroll';
      longTouchTimer = setTimeout(handleLongTap, 450);
    }
    touchStartT = t;
  }

  function touchMove(e) {
    if (e.target.parentElement.className === 'clipboard-contextmneu') return;
    if (e.target.classList.contains('cursor-control')) return;
    if (longTouchTimer) {
      clearTimeout(longTouchTimer);
      longTouchTimer = null;
    }
    const touches = e.touches;
    if (touches.length > 1 || mode == 'zoom') return;
    const touchObj = touches[0];
    mvX = startX - touchObj.clientX;
    mvY = startY - touchObj.clientY;
    if (mode == 'wait') {
      if (mvX * mvX + mvY * mvY > 4) mode = 'cursor';
      else return e.preventDefault();
    }
    startX = touchObj.clientX;
    startY = touchObj.clientY;
    e.clientX = touchObj.clientX;
    e.clientY = touchObj.clientY;
    if (mode == 'scroll') {
      ge = e;
      scroll(e, mvX, mvY);
    } else {
      e.preventDefault();
    }
  }

  function touchCancel(e) {
    if (mode == 'zoom') {
      mode = '';
    } else if (longTouchTimer) {
      editor.selection.moveToPosition(pos);
    } else if (mode == 'scroll') {
      let sum = 0;
      let tx = parseInt(Math.abs(mvX));
      let ty = parseInt(Math.abs(mvY));
      scrollSpeed += 0.2;
      tx = tx * Math.sqrt(tx) * scrollSpeed;
      ty = ty * Math.sqrt(ty) * scrollSpeed;
      arX = [];
      arY = [];
      for (let i = 1; sum < tx; ++i) {
        sum += i;
        arX.push(i);
      }
      sum = 0;
      for (let _i = 1; sum < ty; ++_i) {
        sum += _i;
        arY.push(_i);
      }
      requestAnimationFrame(animate);
      e.preventDefault();
    }
    clearTimeout(longTouchTimer);
    longTouchTimer = null;
  }

  function animate() {
    const xlen = arX.length;
    const ylen = arY.length;
    if (xlen === 0 && ylen === 0) {
      mvX = 0;
      mvY = 0;
      scrollSpeed = 1;
      return;
    }
    const xsign = mvX < 0 ? -1 : 1;
    const ysign = mvY < 0 ? -1 : 1;
    const x = xlen ? xsign * arX.pop() : 0;
    const y = ylen ? ysign * arY.pop() : 0;
    scroll(ge, x, y);
    animation = requestAnimationFrame(animate);
  }

  function scroll(e, x, y) {
    const mouseEvent = new MouseEvent(e, editor);
    mouseEvent.speed = scrollSpeed;
    mouseEvent.wheelX = x;
    mouseEvent.wheelY = y;
    editor._emit('mousewheel', mouseEvent);
    e.preventDefault();
  }

  function handleLongTap() {
    clearTimeout(longTouchTimer);
    longTouchTimer = null;
    mode = 'wait';
  }
};