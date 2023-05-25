import { minimatch } from 'minimatch';

const resolvers = {};

self.onmessage = (ev) => {
  const { action, data, error, id } = ev.data;
  switch (action) {
    case 'search-files':
      processFiles(data, 'search');
      break;

    case 'replace-files':
      processFiles(data, 'replace');
      break;

    case 'get-file': {
      if (!resolvers[id]) return;
      const cb = resolvers[id];
      cb(data, error);
      delete resolvers[id];
      break;
    }

    default:
      return false;
  }
};

/**
 * Process files for search or replace operations.
 *
 * @param {object} data - The data containing files, search, replace, and options.
 * @param {'search' | 'replace'} [mode='search'] - The mode of operation (search or replace).
 */
function processFiles(data, mode = 'search') {
  const process = mode === 'search' ? searchInFile : replaceInFile;
  const { files, search, replace, options } = data;
  const { test: skip } = Skip(options);
  const total = files.length;
  let count = 0;

  files.forEach(processFile);

  /**
  * Process a file for search or replace operation.
  *
  * @param {object} file - The file object to process.
  * @param {string} file.url - The URL of the file.
  */
  function processFile(file) {
    if (skip(file)) {
      done(++count === total, mode);
      return;
    }

    getFile(file.url, (res, err) => {
      if (err) {
        done(++count === total, mode);
        throw err;
      }

      process({ file, content: res, search, replace, options });
      done(++count === total, mode);
    });
  }
}


/**
 * Search for a string in the content of a file.
 * @param {object} arg - The content of the file to search.
 * @param {import('lib/fileList').Tree} arg.file - The file.
 * @param {string} arg.content - The file content.
 * @param {string} arg.search - The string to search for.
 * @param {object} arg.options - The search options.
 * @param {boolean} [arg.options.caseSensitive=false] - Whether the search is case-sensitive.
 * @param {boolean} [arg.options.wholeWord=false] - Whether to match whole words only.
 * @param {boolean} [arg.options.regExp=false] - Whether the search string is a regular expression.
 * @returns {Array<Match>} - An array of matched items with their start and end positions.
 *                   Each matched item has the properties: line, start, and end.
 */
function searchInFile({ file, content, search, options }) {
  const searchPattern = toRegex(search, options);
  const matches = [];

  let text = `${file.name}`;
  let match;

  if (text.length > 30) {
    text = `...${text.slice(-30)}`;
  }

  while ((match = searchPattern.exec(content))) {
    const [line] = match;
    const start = match.index;
    const end = start + line.length;
    const position = {
      start: getLineColumn(content, start),
      end: getLineColumn(content, end)
    };
    text += `\n\t${getSurrounding(content, line, start, end).trim()}`;
    matches.push({ line, position });
  }

  text = text + '\n';

  self.postMessage({
    action: 'search-result',
    data: {
      file,
      matches,
      text,
    },
  });
}

/**
 * Gets surrounding text of a match.
 * @param {string} content 
 * @param {string} line 
 * @param {number} start 
 * @param {number} end 
 */
function getSurrounding(content, line, start, end) {
  const max = 26;
  const remaining = max - (end - start);

  if (!remaining || remaining < 0) {
    return `...${line.substring(start, end + remaining)}`;
  }

  let left = Math.floor(remaining / 2);
  let right = remaining - left;

  if (start < left) {
    left = start;
    right = remaining;
  }

  let leftText = content.substring(start - left, start);
  let rightText = content.substring(end, end + right);

  if (/[\r\n]+/.test(leftText)) leftText = '';
  if (/[\r\n]+/.test(rightText)) rightText = '';

  return `${leftText}${line}${rightText}`;
}

/**
 * Replace a string in the content of a file.
 * @param {object} arg - The content of the file to search.
 * @param {import('lib/fileList').Tree} arg.file - The content of the file to search.
 * @param {string} arg.search - The string to search for.
 * @param {string} arg.replace - The string to replace with.
 * @param {object} arg.options - The search options.
 * @param {boolean} [arg.options.caseSensitive=false] - Whether the search is case-sensitive.
 * @param {boolean} [arg.options.wholeWord=false] - Whether to match whole words only.
 * @param {boolean} [arg.options.regExp=false] - Whether the search string is a regular expression.
 * @returns {string} - The modified content of the file with replacements.
 */
function replaceInFile({ file, search, replace, options }) {
  const searchPattern = toRegex(search, options);
  const newFile = file.replace(searchPattern, replace);

  self.postMessage({
    action: 'replace-result',
    data: {
      file,
      text: newFile,
    },
  });
}

/**
 * Converts a search string and options into a regular expression.
 *
 * @param {string} search - The search string.
 * @param {object} options - The search options.
 * @param {boolean} [options.caseSensitive=false] - Whether the search is case-sensitive.
 * @param {boolean} [options.wholeWord=false] - Whether to match whole words only.
 * @param {boolean} [options.regExp=false] - Whether the search string is a regular expression.
 * @returns {RegExp} - The regular expression created from the search string and options.
 */
function toRegex(search, options) {
  const { caseSensitive = false, wholeWord = false, regExp = false } = options;

  const flags = caseSensitive ? 'gm' : 'gim';
  let regexString = regExp ? search : escapeRegExp(search);

  if (wholeWord) {
    const wordBoundary = '\\b';
    const wholeWordPattern = `${wordBoundary}${regexString}${wordBoundary}`;
    regexString = wholeWordPattern;
  }

  return new RegExp(regexString, flags);
}

/**
 * Determines the line and column numbers for a given position in the file.
 *
 * @param {string} file - The file content as a string.
 * @param {number} position - The position in the file for which line and column
 * numbers are to be determined.
 *
 * @returns {Object} An object with 'line' and 'column' properties, representing
 * the line and column numbers respectively for the given position.
 *
 * @example
 *
 * const file = 'Hello, this is a test.\nAnother test is here.';
 * const position = 15;
 * const lineColumn = getLineColumn(file, position);
 * 
 * // lineColumn: { line: 1, column: 16 }
 */
function getLineColumn(file, position) {
  const lines = file.substring(0, position).split('\n');
  const lineNumber = lines.length - 1;
  const columnNumber = lines[lineNumber].length;
  return { line: lineNumber, column: columnNumber };
}

/**
 * Escapes special characters for use in a regular expression.
 *
 * @param {string} string - The string to be escaped.
 *
 * @returns {string} The string with special characters escaped for use in a
 * regular expression.
 *
 * @example
 *
 * const string = 'Hello. This is a test [string].';
 * const escapedString = escapeRegExp(string);
 * 
 * // escapedString: 'Hello\\. This is a test \\[string\\]\\.'
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Retrieves the contents of a file from the main thread.
 * @param {string} url 
 * @param {function} cb 
 */
function getFile(url, cb) {
  const id = parseInt(Date.now() + Math.random() * 1000000);
  resolvers[id] = cb;
  self.postMessage({
    action: 'get-file',
    data: url,
    id,
  });
}

/**
 * Sends a message to the main thread to indicate that the worker is done searching
 * or replacing.
 * @param {boolean} condition
 * @param {'search'|'replace'} mode
 */
function done(condition, mode) {
  if (condition) {
    self.postMessage({
      action: `done-${mode}ing`,
    });
  }
}


/**
 * Creates a skip function that filters files based on exclusion and inclusion patterns.
 *
 * @param {object} arg - The exclusion patterns separated by commas.
 * @param {string} arg.exclude - The exclusion patterns separated by commas.
 * @param {string} arg.include - The inclusion patterns separated by commas.
 */
function Skip({ exclude, include }) {
  const excludeFiles = (exclude ? exclude.split(',') : []).map((p) => p.trim());
  const includeFiles = (include ? include.split(',') : ['**']).map((p) => p.trim());

  /**
   * Tests whether a file should be skipped based on exclusion and inclusion patterns.
   *
   * @param {object} file - The file to be tested.
   * @param {string} file.relativeUrl - The relative URL of the file.
   * @returns {boolean} - Returns true if the file should be skipped, false otherwise.
   */
  function test(file) {
    return excludeFiles.some((pattern) => minimatch(file.relativeUrl, pattern)) ||
      !includeFiles.some((pattern) => minimatch(file.relativeUrl, pattern));
  }

  return {
    test
  };
}

/**
 * @typedef {Object} Match
 * @property {string} line - The line of the file where the match was found.
 * @property {string} text - Match result converted to a string.
 * @property {Object} position - An object representing the start and end positions of the match.
 * @property {Object} position.start - An object with properties line and column representing the start position.
 * @property {number} position.start.line - The line number of the start position.
 * @property {number} position.start.column - The column number of the start position.
 * @property {Object} position.end - An object with properties line and column representing the end position.
 * @property {number} position.end.line - The line number of the end position.
 * @property {number} position.end.column - The column number of the end position.
 */
