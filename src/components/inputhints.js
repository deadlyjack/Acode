import tag from 'html-tag-js';
import mustache from 'mustache';

/**
 *
 * @param {HTMLInputElement} $input
 * @param {Array<string>|function(function(Array<string>):void):void} hints
 */
function inputhints($input, hints) {
  const template = '{{#.}}<li action="hint" value="{{.}}">{{.}}</li>{{/.}}';
  const $hintingContainer = tag('ul', {
    id: 'hints',
    className: 'loading scroll',
  });
  $input.addEventListener('focus', onfocus);
  let interval;

  if (typeof hints === 'function') {
    const cb = hints;
    hints = [];
    cb((res) => {
      hints = res;
      $hintingContainer.innerHTML = mustache.render(template, hints);
      $hintingContainer.classList.remove('loading');
      position(false);
    });
  } else {
    $hintingContainer.innerHTML = mustache.render(template, hints);
  }

  /**
   *
   * @param {MouseEvent} e
   */
  function handleClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    const $el = e.target;
    const action = $el.getAttribute('action');
    if (action !== 'hint') return;
    const value = $el.getAttribute('value');
    $input.value = value;
    let activeHint = $hintingContainer.get('.active');
    if (!activeHint) return;
    activeHint.classList.remove('active');
    $el.classList.add('active');
    $hintingContainer.textContent = '';
  }

  /**
   *
   * @param {KeyboardEvent} e
   */
  function handleKeypress(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      const activeHint = $hintingContainer.get('.active');
      if (!activeHint) return;
      const value = activeHint.getAttribute('value');
      $input.value = value;
      $hintingContainer.textContent = '';
    }
  }

  /**
   *
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    const code = e.keyCode;
    execute();
    interval = setInterval(execute, 300);
    document.onkeyup = function () {
      document.onkeyup = null;
      clearInterval(interval);
    };

    function execute() {
      let nextHint;
      let activeHint = $hintingContainer.get('.active');
      if (!activeHint) activeHint = $hintingContainer.firstChild;

      if (code === 40) {
        //downarrow

        prevent();
        nextHint = activeHint.nextElementSibling;
        if (!nextHint) nextHint = $hintingContainer.firstElementChild;
      } else if (code === 38) {
        //uparrow

        prevent();
        nextHint = activeHint.previousElementSibling;
        if (!nextHint) nextHint = $hintingContainer.lastElementChild;
      }

      if (nextHint) {
        activeHint.classList.remove('active');
        nextHint.classList.add('active');
        nextHint.scrollIntoView();
      }
    }

    function prevent() {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * @this {HTMLInputElement}
   */
  function oninput() {
    const value = this.value;
    const matched = [];
    hints.map((hint) => {
      if (new RegExp(value).test(hint)) matched.push(hint);
    });
    $hintingContainer.textContent = '';
    $hintingContainer.innerHTML = mustache.render(template, matched);
    position();
  }

  function onfocus() {
    $hintingContainer.addEventListener('mousedown', handleClick);
    // $hintingContainer.addEventListener('touchstart', handleClick);
    $input.addEventListener('keypress', handleKeypress);
    $input.addEventListener('keydown', handleKeydown);
    $input.addEventListener('blur', onblur);
    $input.addEventListener('input', oninput);

    position();

    window.addEventListener('resize', position);
  }

  function position(append = true) {
    const activeHint = $hintingContainer.get('.active');
    const firstChild = $hintingContainer.firstChild;
    if (!activeHint && firstChild) firstChild.classList.add('active');
    const client = $input.getBoundingClientRect();
    const top = client.top - 5;
    const bottom = client.bottom + 5;
    const actualHeight = $hintingContainer.childElementCount * 30;
    let height = actualHeight,
      containerTop;
    let topHeight = top;
    let bottomHeight = innerHeight - bottom;

    if (topHeight > bottomHeight) {
      $hintingContainer.classList.add('bottom');
      containerTop = top - actualHeight;
      if (containerTop < 0) {
        containerTop = 5;
        height = topHeight - 5;
      }
    } else {
      $hintingContainer.classList.remove('bottom');
      containerTop = bottom;
      if (bottomHeight < actualHeight) {
        height = bottomHeight - 5;
      }
    }

    $hintingContainer.style.transform = `translate(${client.left}px, ${containerTop}px)`;
    $hintingContainer.style.width = client.width + 'px';
    $hintingContainer.style.height = height + 'px';
    if (append === true) app.append($hintingContainer);
  }

  function onblur() {
    $hintingContainer.remove();
    $hintingContainer.removeEventListener('mousedown', handleClick);
    // $hintingContainer.removeEventListener('touchstart', handleClick);
    $input.removeEventListener('keypress', handleKeypress);
    $input.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', position);
    $input.removeEventListener('blur', onblur);
    $input.removeEventListener('input', oninput);
  }
}

export default inputhints;
