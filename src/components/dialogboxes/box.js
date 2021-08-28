import tag from 'html-tag-js';
/**
 *
 * @param {string} titleText
 * @param {string} html
 * @param {string} [hideButtonText]
 * @param {string} [cancelButtonText]
 */
function box(titleText, html, hideButtonText, cancelButtonText) {
  let waitFor = 0,
    strOK = hideButtonText || strings.ok,
    _onclick = () => {},
    _onhide = () => {},
    _then = () => {},
    _onOk = _hide,
    _onCancel = () => {};

  const promiseLike = {
    hide,
    wait,
    onclick,
    onhide,
    then,
    ok,
    cancle,
  };

  let cancelBtn,
    hideButton = typeof hideButtonText === 'boolean' ? hideButtonText : false;

  if (cancelButtonText) {
    cancelBtn = tag('button', {
      className: 'disabled',
      textContent: strOK,
      onclick: () => {
        _onCancel();
      },
    });
  }

  const okBtn = tag('button', {
    className: 'disabled',
    textContent: strOK,
    onclick: () => {
      _onOk();
    },
  });
  const body = tag('div', {
    className: 'message',
    innerHTML: html,
    onclick: __onclick,
  });
  const box = tag('div', {
    className: 'prompt box',
    children: [
      tag('strong', {
        className: 'title',
        textContent: titleText,
      }),
      body,
    ],
  });
  const mask = tag('span', {
    className: 'mask',
    onclick: _hide,
  });

  if (!hideButton) {
    box.append(
      tag('div', {
        className: 'button-container',
        children: cancelBtn ? [cancelBtn, okBtn] : [okBtn],
      })
    );
  }

  setTimeout(() => {
    decTime();
    actionStack.push({
      id: 'box',
      action: hideSelect,
    });

    document.body.append(box, mask);
    __then();

    window.restoreTheme(true);
  }, 0);

  function decTime() {
    if (waitFor >= 1000) {
      okBtn.textContent = `${strOK} (${parseInt(waitFor / 1000)}sec)`;
      waitFor -= 1000;
      setTimeout(decTime, 1000);
    } else {
      okBtn.textContent = strOK;
      okBtn.classList.remove('disabled');
    }
  }

  function hideSelect() {
    box.classList.add('hide');
    window.restoreTheme();
    setTimeout(() => {
      document.body.removeChild(box);
      document.body.removeChild(mask);
    }, 300);
  }

  function hide() {
    if (waitFor) return;
    const imgs = box.getAll('img');
    if (imgs) {
      for (let img of imgs) {
        URL.revokeObjectURL(img.src);
      }
    }
    actionStack.remove('box');
    hideSelect();
  }

  function _hide() {
    hide();
    if (_onhide) _onhide.call(promiseLike);
  }

  function wait(time) {
    time -= time % 1000;
    waitFor = time;
    return promiseLike;
  }

  function __onclick(e) {
    if (_onclick) _onclick.call(this, e);
  }

  function __then() {
    if (_then) _then(body.children);
  }

  /**
   *
   * @param {function(HTMLCollection)} callback
   */
  function then(callback) {
    _then = callback;
    return promiseLike;
  }

  /**
   *
   * @param {function(this:HTMLElement, Event):void} onclick
   */
  function onclick(onclick) {
    _onclick = onclick;
    return promiseLike;
  }

  /**
   *
   * @param {function():void} onhide
   */
  function onhide(onhide) {
    _onhide = onhide;
    return promiseLike;
  }

  /**
   *
   * @param {function():void} onOk
   */
  function ok(onOk) {
    _onOk = onOk;
    return promiseLike;
  }

  /**
   *
   * @param {function():void} onCancel
   */
  function cancle(onCancel) {
    _onCancel = oncancel;
    return promiseLike;
  }

  return promiseLike;
}

export default box;
