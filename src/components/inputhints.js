import tag from 'html-tag-js';
import mustache from 'mustache';

/**
 *
 * @param {HTMLInputElement} $input
 * @param {Array<string>|function(function(Array<string>):void):void} hints
 * @param {function(value):void} onSelect
 */
function inputhints($input, hints, onSelect) {
  const template = '{{#hints}}<li action="hint" value="{{value}}">{{{text}}}</li>{{/hints}}';
  const $hintingContainer = tag('ul', {
    id: 'hints',
    className: 'loading scroll',
  });
  $input.addEventListener('focus', onfocus);

  if (typeof hints === 'function') {
    const cb = hints;
    hints = [];
    cb((res) => {
      if (Array.isArray(res)) {
        hints = res.map((item) => {
          if (typeof item === 'string') {
            return { value: item, text: item };
          }
          if ('value' in item && 'text' in item) {
            return item;
          }
          return null;
        });
      } else {
        hints = [];
      }
      $hintingContainer.innerHTML = mustache.render(template, { hints });
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
    $input.value = $el.textContent;
    if (onSelect) onSelect(value);
    else $input.dataset.value = value;
    const activeHint = $hintingContainer.get('.active');
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
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const activeHint = $hintingContainer.get('.active');
      if (!activeHint) return;
      const value = activeHint.getAttribute('value');
      if (onSelect) onSelect(value);
      else $input.value = value;
      $hintingContainer.textContent = '';
    }
  }

  /**
   *
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    const code = e.key;
    if (code === 'ArrowUp' || code === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
    }
    moveDown(code);
  }

  function moveDown(key) {
    let nextHint;
    let activeHint = $hintingContainer.get('.active');
    if (!activeHint) activeHint = $hintingContainer.firstChild;

    if (key === 'ArrowDown') {
      nextHint = activeHint.nextElementSibling;
      if (!nextHint) nextHint = $hintingContainer.firstElementChild;
    } else if (key === 'ArrowUp') {
      nextHint = activeHint.previousElementSibling;
      if (!nextHint) nextHint = $hintingContainer.lastElementChild;
    }

    if (nextHint) {
      activeHint.classList.remove('active');
      nextHint.classList.add('active');
      nextHint.scrollIntoView();
    }
  }

  /**
   * @this {HTMLInputElement}
   */
  function oninput() {
    const { value: toTest } = this;
    const matched = [];
    const regexp = new RegExp(toTest, 'i');
    hints.forEach((hint) => {
      const { value, text } = hint;
      if (
        regexp.test(value)
        || regexp.test(text)
      ) {
        matched.push(hint);
      }
    });
    $hintingContainer.textContent = '';
    $hintingContainer.innerHTML = mustache.render(template, { hints: matched });
    position();
  }

  function onfocus() {
    $hintingContainer.addEventListener('mousedown', handleClick);
    $input.addEventListener('keypress', handleKeypress);
    $input.addEventListener('keydown', handleKeydown);
    $input.addEventListener('blur', onblur);
    $input.addEventListener('input', oninput);

    position();

    window.addEventListener('resize', position);
  }

  function position(append = true) {
    const activeHint = $hintingContainer.get('.active');
    const { firstChild } = $hintingContainer;
    if (!activeHint && firstChild) firstChild.classList.add('active');
    const client = $input.getBoundingClientRect();
    const inputTop = client.top - 5;
    const inputBottom = client.bottom + 5;
    const inputLeft = client.left;
    const bottomHeight = window.innerHeight - inputBottom;
    const mid = window.innerHeight / 2;

    if (bottomHeight >= mid) {
      $hintingContainer.classList.remove('bottom');
      $hintingContainer.style.top = `${inputBottom}px`;
      $hintingContainer.style.bottom = 'auto';
    } else {
      $hintingContainer.classList.add('bottom');
      $hintingContainer.style.top = 'auto';
      $hintingContainer.style.bottom = `${inputTop}px`;
    }

    $hintingContainer.style.left = `${inputLeft}px`;
    $hintingContainer.style.width = `calc(${client.width}px - var(--scrollbar-width))`;
    if (append) app.append($hintingContainer);
  }

  function onblur() {
    $hintingContainer.remove();
    $hintingContainer.removeEventListener('mousedown', handleClick);
    $input.removeEventListener('keypress', handleKeypress);
    $input.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', position);
    $input.removeEventListener('blur', onblur);
    $input.removeEventListener('input', oninput);
  }

  function calcHeight() {

  }

  return {
    getSelected: () => $hintingContainer.get('.active'),
  }
}

export default inputhints;
