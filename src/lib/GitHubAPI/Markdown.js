/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * Renders html from Markdown text
 */
class Markdown extends Requestable {
  /**
   * construct a Markdown
   * @param {Requestable.auth} auth - the credentials to authenticate to GitHub
   * @param {string} [apiBase] - the base Github API URL
   * @return {Promise} - the promise for the http request
   */
  constructor(auth, apiBase) {
    super(auth, apiBase);
  }

  /**
   * Render html from Markdown text.
   * @see https://developer.github.com/v3/markdown/#render-an-arbitrary-markdown-document
   * @param {Object} options - conversion options
   * @param {string} [options.text] - the markdown text to convert
   * @param {string} [options.mode=markdown] - can be either `markdown` or `gfm`
   * @param {string} [options.context] - repository name if mode is gfm
   * @param {Requestable.callback} [cb] - will receive the converted html
   * @return {Promise} - the promise for the http request
   */
  render(options, cb) {
    return this._request('POST', '/markdown', options, cb, true);
  }
}

export default Markdown;
