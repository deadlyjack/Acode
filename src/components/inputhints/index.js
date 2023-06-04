import './style.scss';

/**
 * @typedef {Object} HintObj
 * @property {string} value
 * @property {string} text
 */

/**
 * @typedef {HintObj|string} Hint
 */

/**
 * @typedef {Object} HintModification
 * @property {(hint:Hint, index:number)=>void} add
 * @property {(hint:Hint)=>void} remove
 * @property {(index:number)=>void} removeIndex
 */

/**
 * @typedef {(setHints:(hints:Array<Hint>)=>void, modification: HintModification) => void} HintCallback
 */


/**
 * Generate a list of hints for an input field
 * @param {HTMLInputElement} $input Input field
 * @param {Array<Hint>|HintCallback} hints Hints or a callback to generate hints
 * @param {(value: string) => void} onSelect Callback to call when a hint is selected
 * @returns {{getSelected: ()=>HTMLLIElement, container: HTMLUListElement}}
 */

export default function inputhints($input, hints, onSelect) {
  /**@type {HTMLUListElement} */
  let $ul = <Ul />;
  $input.addEventListener('focus', onfocus);

  if (typeof hints === 'function') {
    const cb = hints;
    hints = [];
    updateUl(<Ul hints={[{
      text: strings['loading...'],
      value: '',
    }]} />);
    cb(setHints, hintModification());
  } else {
    setHints(hints);
  }

  /**
   * Handle click event
   * @param {MouseEvent} e Event
   */
  function handleClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    const $el = e.target;
    const action = $el.getAttribute('action');
    if (action !== 'hint') return;
    const value = $el.getAttribute('value');
    if (!value) return;
    $input.value = $el.textContent;
    if (onSelect) onSelect(value);
    else $input.dataset.value = value;
    const activeHint = $ul.get('.active');
    if (!activeHint) return;
    activeHint.classList.remove('active');
    $el.classList.add('active');
  }

  /**
   * Handle keypress event
   * @param {KeyboardEvent} e Event
   */
  function handleKeypress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const activeHint = $ul.get('.active');
      if (!activeHint) return;
      const value = activeHint.getAttribute('value');
      if (onSelect) onSelect(value);
      else $input.value = value;
    }
  }

  /**
   * Handle keydown event
   * @param {KeyboardEvent} e Event
   */
  function handleKeydown(e) {
    const code = e.key;
    if (code === 'ArrowUp' || code === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
    }
    moveDown(code);
  }

  /**
   * Moves the active hint up or down
   * @param {"ArrowDown" | "ArrowUp"} key Direction to move
   */
  function moveDown(key) {
    let nextHint;
    let activeHint = $ul.get('.active');
    if (!activeHint) activeHint = $ul.firstChild;

    if (key === 'ArrowDown') {
      nextHint = activeHint.nextElementSibling;
      if (!nextHint) nextHint = $ul.firstElementChild;
    } else if (key === 'ArrowUp') {
      nextHint = activeHint.previousElementSibling;
      if (!nextHint) nextHint = $ul.lastElementChild;
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
    updateUl(<Ul hints={matched} />);
  }

  function onfocus() {
    $input.addEventListener('keypress', handleKeypress);
    $input.addEventListener('keydown', handleKeydown);
    $input.addEventListener('blur', onblur);
    $input.addEventListener('input', oninput);
    window.addEventListener('resize', position);
    ulAddEventListeners();
    app.append($ul);
    position();
  }

  function onblur() {
    removeUl();
    $input.removeEventListener('keypress', handleKeypress);
    $input.removeEventListener('keydown', handleKeydown);
    $input.removeEventListener('blur', onblur);
    $input.removeEventListener('input', oninput);
    window.removeEventListener('resize', position);
  }

  /**
   * Update the position of the hint list
   * @param {boolean} append Append the list to the body or not
   */
  function position() {
    const activeHint = $ul.get('.active');
    const { firstElementChild } = $ul;
    if (!activeHint && firstElementChild) firstElementChild.classList.add('active');
    const client = $input.getBoundingClientRect();
    const inputTop = client.top - 5;
    const inputBottom = client.bottom + 5;
    const inputLeft = client.left;
    const bottomHeight = window.innerHeight - inputBottom;
    const mid = window.innerHeight / 2;

    if (bottomHeight >= mid) {
      $ul.classList.remove('bottom');
      $ul.style.top = `${inputBottom}px`;
      $ul.style.bottom = 'auto';
    } else {
      $ul.classList.add('bottom');
      $ul.style.top = 'auto';
      $ul.style.bottom = `${inputTop}px`;
    }

    $ul.style.left = `${inputLeft}px`;
    $ul.style.width = `${client.width}px`;
  }

  /**
   * Set hint items
   * @param {Array<Hint>} list Hint items 
   */
  function setHints(list) {
    if (Array.isArray(list)) {
      hints = list;
    } else {
      hints = [];
    }
    updateUl(<Ul hints={hints} />);
    $ul.classList.remove('loading');
  }

  function hintModification() {
    return {
      add(item, index) {
        if (index) {
          hints.splice(index, 0, item);
          const child = $ul.children[index];
          if (child) {
            $ul.insertBefore(child, $ul.children[index]);
          }
          return;
        }

        hints.push(item);
      },
      remove(item) {
        const index = hints.indexOf(item);
        if (index > -1) {
          hints.splice(index, 1);
        }
      },
      removeIndex(index) {
        hints.splice(index, 1);
      }
    };
  }

  function removeUl($el = $ul) {
    ulRemoveEventListeners($el);
    $el.remove();
    $el = null;
  }

  function ulAddEventListeners($el = $ul) {
    $el.addEventListener('mousedown', handleClick);
  }

  function ulRemoveEventListeners($el = $ul) {
    $el.removeEventListener('mousedown', handleClick);
  }

  function updateUl($newUl) {
    let $oldUl = $ul;
    $ul = $newUl;

    removeUl($oldUl);
    $oldUl = null;
    $input.blur();
    $input.focus();
  }

  return {
    getSelected: () => $ul.get('.active'),
    container: $ul,
  };
}

/**
 * Create a hint item
 * @param {object} param0 Hint item
 * @param {string} param0.value Hint value
 * @param {string} param0.text Hint text
 * @returns {HTMLLIElement}
 */
function Hint({ value, text }) {
  return <li attr-action='hint' attr-value={value} innerHTML={text}></li>;
}

/**
 * Create a hint list
 * @param {object} param0 Attributes
 * @param {Array<Hint>} param0.hints Hint items
 * @returns {HTMLUListElement}
 */
function Ul({ hints = [] }) {
  return <ul id='hints' className='scroll'>
    {hints.map((hint) => {
      if (typeof hint === 'string') {
        return <Hint value={hint} text={hint} />;
      }
      return <Hint {...hint} />;
    })}
  </ul>;
}
