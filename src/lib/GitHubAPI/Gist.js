/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * A Gist can retrieve and modify gists.
 */
class Gist extends Requestable {
   /**
    * Create a Gist.
    * @param {string} id - the id of the gist (not required when creating a gist)
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(id, auth, apiBase) {
      super(auth, apiBase);
      this.__id = id;
   }

   /**
    * Fetch a gist.
    * @see https://developer.github.com/v3/gists/#get-a-single-gist
    * @param {Requestable.callback} [cb] - will receive the gist
    * @return {Promise} - the Promise for the http request
    */
   read(cb) {
      return this._request('GET', `/gists/${this.__id}`, null, cb);
   }

   /**
    * Create a new gist.
    * @see https://developer.github.com/v3/gists/#create-a-gist
    * @param {Object} gist - the data for the new gist
    * @param {Requestable.callback} [cb] - will receive the new gist upon creation
    * @return {Promise} - the Promise for the http request
    */
   create(gist, cb) {
      return this._request('POST', '/gists', gist, cb)
         .then((response) => {
            this.__id = response.data.id;
            return response;
         });
   }

   /**
    * Delete a gist.
    * @see https://developer.github.com/v3/gists/#delete-a-gist
    * @param {Requestable.callback} [cb] - will receive true if the request succeeds
    * @return {Promise} - the Promise for the http request
    */
   delete(cb) {
      return this._request('DELETE', `/gists/${this.__id}`, null, cb);
   }

   /**
    * Fork a gist.
    * @see https://developer.github.com/v3/gists/#fork-a-gist
    * @param {Requestable.callback} [cb] - the function that will receive the gist
    * @return {Promise} - the Promise for the http request
    */
   fork(cb) {
      return this._request('POST', `/gists/${this.__id}/forks`, null, cb);
   }

   /**
    * Update a gist.
    * @see https://developer.github.com/v3/gists/#edit-a-gist
    * @param {Object} gist - the new data for the gist
    * @param {Requestable.callback} [cb] - the function that receives the API result
    * @return {Promise} - the Promise for the http request
    */
   update(gist, cb) {
      return this._request('PATCH', `/gists/${this.__id}`, gist, cb);
   }

   /**
    * Star a gist.
    * @see https://developer.github.com/v3/gists/#star-a-gist
    * @param {Requestable.callback} [cb] - will receive true if the request is successful
    * @return {Promise} - the Promise for the http request
    */
   star(cb) {
      return this._request('PUT', `/gists/${this.__id}/star`, null, cb);
   }

   /**
    * Unstar a gist.
    * @see https://developer.github.com/v3/gists/#unstar-a-gist
    * @param {Requestable.callback} [cb] - will receive true if the request is successful
    * @return {Promise} - the Promise for the http request
    */
   unstar(cb) {
      return this._request('DELETE', `/gists/${this.__id}/star`, null, cb);
   }

   /**
    * Check if a gist is starred by the user.
    * @see https://developer.github.com/v3/gists/#check-if-a-gist-is-starred
    * @param {Requestable.callback} [cb] - will receive true if the gist is starred and false if the gist is not starred
    * @return {Promise} - the Promise for the http request
    */
   isStarred(cb) {
      return this._request204or404(`/gists/${this.__id}/star`, null, cb);
   }

   /**
    * List the gist's commits
    * @see https://developer.github.com/v3/gists/#list-gist-commits
    * @param {Requestable.callback} [cb] - will receive the array of commits
    * @return {Promise} - the Promise for the http request
    */
   listCommits(cb) {
      return this._requestAllPages(`/gists/${this.__id}/commits`, null, cb);
   }

   /**
    * Fetch one of the gist's revision.
    * @see https://developer.github.com/v3/gists/#get-a-specific-revision-of-a-gist
    * @param {string} revision - the id of the revision
    * @param {Requestable.callback} [cb] - will receive the revision
    * @return {Promise} - the Promise for the http request
    */
   getRevision(revision, cb) {
      return this._request('GET', `/gists/${this.__id}/${revision}`, null, cb);
   }

   /**
    * List the gist's comments
    * @see https://developer.github.com/v3/gists/comments/#list-comments-on-a-gist
    * @param {Requestable.callback} [cb] - will receive the array of comments
    * @return {Promise} - the promise for the http request
    */
   listComments(cb) {
      return this._requestAllPages(`/gists/${this.__id}/comments`, null, cb);
   }

   /**
    * Fetch one of the gist's comments
    * @see https://developer.github.com/v3/gists/comments/#get-a-single-comment
    * @param {number} comment - the id of the comment
    * @param {Requestable.callback} [cb] - will receive the comment
    * @return {Promise} - the Promise for the http request
    */
   getComment(comment, cb) {
      return this._request('GET', `/gists/${this.__id}/comments/${comment}`, null, cb);
   }

   /**
    * Comment on a gist
    * @see https://developer.github.com/v3/gists/comments/#create-a-comment
    * @param {string} comment - the comment to add
    * @param {Requestable.callback} [cb] - the function that receives the API result
    * @return {Promise} - the Promise for the http request
    */
   createComment(comment, cb) {
      return this._request('POST', `/gists/${this.__id}/comments`, {
         body: comment
      }, cb);
   }

   /**
    * Edit a comment on the gist
    * @see https://developer.github.com/v3/gists/comments/#edit-a-comment
    * @param {number} comment - the id of the comment
    * @param {string} body - the new comment
    * @param {Requestable.callback} [cb] - will receive the modified comment
    * @return {Promise} - the promise for the http request
    */
   editComment(comment, body, cb) {
      return this._request('PATCH', `/gists/${this.__id}/comments/${comment}`, {
         body: body
      }, cb);
   }

   /**
    * Delete a comment on the gist.
    * @see https://developer.github.com/v3/gists/comments/#delete-a-comment
    * @param {number} comment - the id of the comment
    * @param {Requestable.callback} [cb] - will receive true if the request succeeds
    * @return {Promise} - the Promise for the http request
    */
   deleteComment(comment, cb) {
      return this._request('DELETE', `/gists/${this.__id}/comments/${comment}`, null, cb);
   }
}

export default Gist;