import Checkbox from 'components/checkbox';
import './styles.scss';
import Ref from 'html-tag-js/ref';
import autosize from 'autosize';
import files from 'lib/fileList';
import fsOperation from 'fileSystem';
import collapsableList from 'components/collapsableList';
import tile from 'components/tile';
import openFile from 'lib/openFile';
import dialogs from 'components/dialogs';
import addTouchListeners from 'ace/touchHandler';

const workers = [];
const results = [];

const $container = new Ref();
const $regExp = new Ref();
const $search = new Ref();
const $replace = new Ref();
const $exclude = new Ref();
const $include = new Ref();
const $wholeWord = new Ref();
const $caseSensitive = new Ref();
const $btnReplaceAll = new Ref();
const $resultOverview = new Ref();

const debounceInput = debounce(onInput, 500);
const resultOverview = {
  filesCount: 0,
  matchesCount: 0,
  reset() {
    this.filesCount = 0;
    this.matchesCount = 0;
    $resultOverview.innerHTML = searchResultText(0, 0);
  },
};

const CASE_SENSITIVE = "search-in-files-case-sensitive";
const WHOLE_WORD = "search-in-files-whole-word";
const REG_EXP = "search-in-files-reg-exp";
const EXCLUDE = "search-in-files-exclude";
const INCLUDE = "search-in-files-include";

const store = {
  get caseSensitive() {
    return localStorage.getItem(CASE_SENSITIVE) === 'true';
  },
  set caseSensitive(value) {
    localStorage.setItem(CASE_SENSITIVE, value);
  },
  get wholeWord() {
    return localStorage.getItem(WHOLE_WORD) === 'true';
  },
  set wholeWord(value) {
    return localStorage.setItem(WHOLE_WORD, value);
  },
  get regExp() {
    return localStorage.getItem(REG_EXP) === 'true';
  },
  set regExp(value) {
    return localStorage.setItem(REG_EXP, value);
  },
  get exclude() {
    return localStorage.getItem(EXCLUDE);
  },
  set exclude(value) {
    return localStorage.setItem(EXCLUDE, value);
  },
  get include() {
    return localStorage.getItem(INCLUDE);
  },
  set include(value) {
    return localStorage.setItem(INCLUDE, value);
  },
};

let useIncludeAndExclude = false;
/**@type {AceAjax.Editor} */
let searchResult = null;
let loader;

addEventListener($regExp, 'change', debounceInput);
addEventListener($wholeWord, 'change', debounceInput);
addEventListener($caseSensitive, 'change', debounceInput);
addEventListener($search, 'input', debounceInput);
addEventListener($include, 'input', debounceInput);
addEventListener($exclude, 'input', debounceInput);
addEventListener($btnReplaceAll, 'click', replaceAll);
$container.onref = ($el) => {
  searchResult = ace.edit($el, {
    mode: 'ace/mode/yaml',
    readOnly: true,
    useWorker: false,
    showLineNumbers: false,
    fontSize: '14px',
  });
  $container.style.lineHeight = '1.5';
  searchResult.session.setTabSize(1);
  searchResult.renderer.setMargin(0, 0, -20, 0);
  addTouchListeners(searchResult, true);
  searchResult.textInput.onContextMenu = (e) => e.preventDefault();
};

editorManager.on('add-folder', debounceInput);
editorManager.on('remove-folder', debounceInput);

export default [
  'search',
  'searchInFiles',
  strings['search in files'],
  (/**@type {HTMLElement} */ el) => {
    el.classList.add('search-in-files');

    el.content = <>
      <div className='header'>
        <div className='options'>
          <Checkbox checked={store.caseSensitive} size='10px' text='aA' ref={$caseSensitive} />
          <Checkbox checked={store.wholeWord} size='10px' text='a-z' ref={$wholeWord} />
          <Checkbox checked={store.regExp} size='10px' text='.*' ref={$regExp} />
        </div>
        <Details>
          <Summary>
            <Textarea ref={$search} type='search' name='search' placeholder={strings['search']} />
          </Summary>
          <div>
            <button ref={$btnReplaceAll} className='icon replace_all'></button>
            <Textarea ref={$replace} type='search' name='replace' placeholder={strings['replace']} />
          </div>
        </Details>
        <Details onexpand={(expanded) => {
          useIncludeAndExclude = expanded;
          debounceInput();
        }}>
          <Summary marker={false} className='extras'>...</Summary>
          <input value={store.exclude} ref={$exclude} type='search' name='exclude' placeholder={strings['exclude files']} />
          <input value={store.include} ref={$include} type='search' name='include' placeholder={strings['include files']} />
        </Details>
      </div>
      <span ref={$resultOverview} className='search-result' innerHTML={searchResultText(0, 0)}></span>
      <div ref={$container} ></div>
    </>;
  }
];

/**
 * Worker message handler
 * @param {Event} e 
 */
async function onWorkerMessage(e) {
  const { action, error, data, id } = e.data;
  if (error) {
    console.error(error);
    return;
  }

  switch (action) {
    case 'get-file': {
      let content;
      let readError;

      try {
        content = await fsOperation(data).readFile('utf-8');
      } catch (er) {
        readError = er;
      }

      e.target.postMessage({
        id,
        action: 'get-file',
        data: content,
        error: readError,
      });
      break;
    }

    case 'search-result': {
      const { file, matches, text } = data;
      if (!matches.length) return;
      resultOverview.filesCount += 1;
      resultOverview.matchesCount += matches.length;
      $resultOverview.innerHTML = searchResultText(
        resultOverview.filesCount,
        resultOverview.matchesCount,
      );
      searchResult.moveCursorTo(Infinity, Infinity);
      searchResult.insert(text);
      break;
    }

    case 'replace-result': {
      const { file, text } = data;
      if (!text) return;
      loader.setMessage(file.relativeUrl);
      await fsOperation(file.url).writeFile(text);
      break;
    }

    case 'done-replacing': {
      e.target.doneReplacing = true;

      if (workers.find(worker => worker.started && !worker.doneReplacing)) {
        break;
      }

      break;
    }

    case 'done-searching': {
      e.target.doneSearching = true;

      if (workers.find(worker => worker.started && !worker.doneSearching)) {
        break;
      }
      break;
    }

    default:
      break;

  }
}

/**
 * On input event handler
 * @param {InputEvent} e 
 */
function onInput(e) {
  const { target } = e || {};
  const search = $search.value.trim();

  if (target === $caseSensitive.el) {
    store.caseSensitive = $caseSensitive.el.checked;
  }

  if (target === $wholeWord.el) {
    store.wholeWord = $wholeWord.el.checked;
  }

  if (target === $regExp.el) {
    store.regExp = $regExp.el.checked;
  }

  if (target === $exclude.el) {
    store.exclude = $exclude.el.value;
  }

  if (target === $include.el) {
    store.include = $include.el.value;
  }

  terminateWorker();
  results.length = 0;
  searchResult.setValue('');
  searchResult.container.classList.add('loading');
  resultOverview.reset();

  if (!search) return;

  sendMessage('search-files', files(), search, getOptions());
}

/**
 * Replaces all occurrences of the search query with the replacement text in the files.
 * Sends a message to the worker threads to perform the replacement.
 */
async function replaceAll() {
  const search = $search.value.trim();
  const replace = $replace.value.trim();
  if (!search || !replace) return;

  loader = dialogs.loader.create(strings['loading...']);
  const confirmation = await dialogs.confirm(
    strings['warning'],
    replaceWarningText(
      resultOverview.filesCount,
      resultOverview.matchesCount
    ),
  );

  if (!confirmation) return;
  sendMessage('replace-all', files(), search, getOptions(), replace);
  loader.show();
}

/**
 * Sends a message to the worker threads to perform a specific action on a subset of files.
 *
 * @param {string} action - The action to be performed by the worker threads.
 * @param {Array<import('lib/fileList').Tree>} files - The files to be processed.
 * @param {string} search - The search query.
 * @param {object} options - The search options.
 * @param {string} replace - The replacement text (if applicable).
 */
function sendMessage(action, files, search, options, replace) {
  const len = workers.length;
  const limit = Math.ceil(files.length / len);
  for (let i = 0; i < len; i++) {
    const worker = workers[i];
    const offset = i * limit;
    const filesForThisWorker = files.slice(offset, offset + limit);
    if (!filesForThisWorker.length) break;
    worker.started = true;
    worker.postMessage({
      action: action,
      data: {
        files: filesForThisWorker,
        search,
        options,
        replace,
      },
    });
  }
}

/**
 * Worker error handler
 * @param {Error} e
 */
function onErrorMessage(e) {
  console.error(e);
}

/**
 * Terminates the existing Web Workers, if any, and then initializes new ones.
 * Also sets the onmessage and onerror handlers for these workers.
 */
function terminateWorker() {
  const len = navigator.hardwareConcurrency || 2;
  workers.forEach(worker => worker.terminate());
  workers.length = 0;

  for (let i = 0; i < len; i++) {
    const worker = getWorker();
    worker.onmessage = onWorkerMessage;
    worker.onerror = onErrorMessage;
    workers.push(worker);
  }
}

/**
 * Creates and returns a new Web Worker that executes the code in 'searchInFilesWorker.build.js'.
 *
 * @returns {Worker} A new Worker object that runs the code in 'searchInFilesWorker.build.js'.
 */
function getWorker() {
  return new Worker('./js/build/searchInFilesWorker.build.js');
}

/**
 * Retrieves the search options currently set in the user interface. This includes
 * search parameters such as 'case sensitive', 'whole word', 'regular expressions',
 * 'exclude' and 'include' depending on whether they are checked or filled in the UI.
 * 
 * Note that the 'exclude' and 'include' options are only retrieved when
 * the corresponding UI section is expanded (i.e., `useIncludeAndExclude` is true).
 * 
 * @returns {Object} An object containing the current search options.
 * @property {boolean} caseSensitive - Whether to perform a case-sensitive search.
 * @property {boolean} wholeWord - Whether to match only whole words in the search.
 * @property {boolean} regExp - Whether the search query is a regular expression.
 * @property {string} exclude - File paths to be excluded from the search, as a comma-separated string.
 * @property {string} include - File paths to be included in the search, as a comma-separated string.
 */
function getOptions() {
  const exclude = useIncludeAndExclude ? $exclude.el.value.trim() : '';
  const include = useIncludeAndExclude ? $include.el.value.trim() : '';
  const caseSensitive = $caseSensitive.el.checked;
  const wholeWord = $wholeWord.el.checked;
  const regExp = $regExp.el.checked;

  return {
    caseSensitive,
    wholeWord,
    regExp,
    exclude,
    include
  };
}

/**
 * Creates a debounced function that delays invoking the input function until after 'wait' milliseconds have elapsed 
 * since the last time the debounced function was invoked. Useful for implementing behavior that should only happen 
 * after the input is complete.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
 * @example
 * 
 * // Avoid costly calculations while the window size is in flux.
 * window.addEventListener('resize', debounce(myFunction, 200));
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Binds an event listener to the 'onref' method of the specified element reference.
 *
 * @param {Ref} $ref - The element reference containing the 'onref' method.
 * @param {string} type - The event type to listen for (e.g., 'input', 'change').
 * @param {Function} handler - The event handler function to be executed when the event occurs.
 * @returns {void}
 *
 * @example
 * // Add an input event listener to $search element reference
 * addEventListener($search, 'input', debounceInput);
 */
function addEventListener($ref, type, handler) {
  $ref.onref = ($el) => {
    $el.addEventListener(type, handler);
  };
}

/**
 * Handles the click event on the "open-file" action.
 *
 * @param {MouseEvent} e - The click event object.
 * @returns {Promise<void>} - A promise that resolves after opening the file.
 */
async function onTileClick(e) {
  const { target } = e;
  const { action } = target.dataset;
  if (action !== 'open-file') return;
  const { start, end, file } = target.dataset;
  const { editor } = editorManager;
  const [startLine, startColumn] = start.split(':');
  const [endLine, endColumn] = end.split(':');

  await openFile(file, { render: true });
  editor.moveCursorTo(startLine, startColumn);
  editor.selection.setRange({
    start: {
      row: startLine,
      column: startColumn,
    },
    end: {
      row: endLine,
      column: endColumn,
    },
  });
  actionStack.pop();
}

/**
 * Generates a search result text based on the number of files and matches.
 *
 * @param {number} files - The number of files searched.
 * @param {number} matches - The number of matches found.
 * @returns {string} - The search result text.
 */
function searchResultText(files, matches) {
  return strings['search result']
    .replace('{files}', `<strong>${files}</strong>`)
    .replace('{matches}', `<strong>${matches}</strong>`);
}

/**
 * Generate a warning message for replacing all matches in multiple files.
 * The message indicates the number of files and matches to be replaced.
 *
 * @param {number} files - The number of files to be affected by the replacement.
 * @param {number} matches - The number of matches to be replaced.
 * @returns {string} - The warning message.
 */
function replaceWarningText(files, matches) {
  return strings['replace warning']
    .replace('{files}', `<strong>${files}</strong>`)
    .replace('{matches}', `<strong>${matches}</strong>`);
}

/**
 * `Result` component that generates a collapsible and expandable list (ul HTML element) 
 * of matching lines from a given file.
 *
 * @param {object} props - The properties for the component.
 * @param {object} props.file - The file object, which contains name and url properties.
 * @param {Array.<object>} props.matches - An array of match objects, each containing a line and a position.
 * @param {string} props.matches[].line - The line from the file where the match occurred.
 * @param {object} props.matches[].position - The position of the match in the file.
 * @param {object} props.matches[].position.start - The starting position of the match, with line and column properties.
 * @param {object} props.matches[].position.end - The ending position of the match, with line and column properties.
 *
 * @returns {HTMLULElement} Returns a collapsible and expandable list (ul HTML element). 
 *                          The list's title is the file name, and its content consists of the matches.
 */
function Result({ file, matches }) {
  const $list = collapsableList(file.name, false);
  $list.$ul.content = matches.map(({ line, position: { start, end } }) => {
    const $item = tile({
      text: <span innerHTML={line}></span>
    });
    $item.dataset.action = 'open-file';
    $item.dataset.start = `${start.line}:${start.column}`;
    $item.dataset.end = `${end.line}:${end.column}`;
    $item.dataset.file = file.url;
    return $item;
  });
  return $list;
}

/**
 * A function component that returns a div element with the "details" attribute.
 * 
 * @param {Object} props - The properties object for the component.
 * @param {Function} props.onexpand - Callback function to be executed when the div expands.
 * @param {Array} children - An array of child elements to be inserted into the div.
 * 
 * @returns {HTMLDivElement} A div element with the "details" attribute, and any child elements.
 */
function Details({ onexpand }, children) {
  if (onexpand) onexpand(false);
  return <div onexpand={onexpand} attr-is="details">{children}</div>;
}

/**
 * A function component that returns a div element that functions as a summary.
 * 
 * @param {Object} props - The properties object for the component.
 * @param {boolean} props.marker - Indicator whether a marker should be included in the div.
 * @param {string} props.className - CSS class name to be applied to the div.
 * @param {Array} children - An array of child elements to be inserted into the div.
 * 
 * @returns {HTMLDivElement} A div element with a 'summary' attribute, a marker (if specified), and any child elements.
 */
function Summary({ marker = true, className }, children) {
  return <div onclick={toggle} attr-is="summary" className={className}>
    {
      marker
        ? <span className='marker'></span>
        : <></>
    }
    {children}
  </div>;

  /**
   * A function that toggles the 'open' attribute on the parent element of the div
   * and calls the onexpand function of the parent element if it exists.
   * 
   * @this {HTMLElement} The div element that the function is bound to.
   * @param {MouseEvent} e - The event object from the click event.
   */
  function toggle(e) {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement ||
      e.target.contentEditable === 'true'
    ) return;

    const $details = this.parentElement;

    $details.toggleAttribute('open');
    if ($details.hasAttribute('open')) {
      $details.onexpand?.(true);
    } else {
      $details.onexpand?.(false);
    }
  }
}

/**
 * Create a textarea element with autosize
 * @param {object} param0
 * @param {string} param0.name
 * @param {string} param0.placeholder 
 * @param {Ref} param0.ref
 * @returns {HTMLTextAreaElement}
 */
function Textarea({ name, placeholder, ref }) {
  return autosize(<textarea ref={ref} name={name} placeholder={placeholder} ></textarea>);
}
