/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';
import debug from 'debug';
const log = debug('github:user');

/**
 * A User allows scoping of API requests to a particular Github user.
 */
class User extends Requestable {
   /**
    * Create a User.
    * @param {string} [username] - the user to use for user-scoped queries
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(username, auth, apiBase) {
      super(auth, apiBase);
      this.__user = username;
   }

   /**
    * Get the url for the request. (dependent on if we're requesting for the authenticated user or not)
    * @private
    * @param {string} endpoint - the endpoint being requested
    * @return {string} - the resolved endpoint
    */
   __getScopedUrl(endpoint) {
      if (this.__user) {
         return endpoint ?
            `/users/${this.__user}/${endpoint}` :
            `/users/${this.__user}`;

      } else { // eslint-disable-line
         switch (endpoint) {
            case '':
               return '/user';

            case 'notifications':
            case 'gists':
               return `/${endpoint}`;

            default:
               return `/user/${endpoint}`;
         }
      }
   }

   /**
    * List the user's repositories
    * @see https://developer.github.com/v3/repos/#list-user-repositories
    * @param {Object} [options={}] - any options to refine the search
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   listRepos(options, cb) {
      if (typeof options === 'function') {
         cb = options;
         options = {};
      }

      options = this._getOptionsWithDefaults(options);

      log(`Fetching repositories with options: ${JSON.stringify(options)}`);
      return this._requestAllPages(this.__getScopedUrl('repos'), options, cb);
   }

   /**
    * List the orgs that the user belongs to
    * @see https://developer.github.com/v3/orgs/#list-user-organizations
    * @param {Requestable.callback} [cb] - will receive the list of organizations
    * @return {Promise} - the promise for the http request
    */
   listOrgs(cb) {
      return this._request('GET', this.__getScopedUrl('orgs'), null, cb);
   }

   /**
    * List followers of a user
    * @see https://developer.github.com/v3/users/followers/#list-followers-of-a-user
    * @param {Requestable.callback} [cb] - will receive the list of followers
    * @return {Promise} - the promise for the http request
    */
   listFollowers(cb) {
      return this._request('GET', this.__getScopedUrl('followers'), null, cb);
   }

   /**
    * List users followed by another user
    * @see https://developer.github.com/v3/users/followers/#list-users-followed-by-another-user
    * @param {Requestable.callback} [cb] - will receive the list of who a user is following
    * @return {Promise} - the promise for the http request
    */
   listFollowing(cb) {
      return this._request('GET', this.__getScopedUrl('following'), null, cb);
   }

   /**
    * List the user's gists
    * @see https://developer.github.com/v3/gists/#list-a-users-gists
    * @param {Requestable.callback} [cb] - will receive the list of gists
    * @return {Promise} - the promise for the http request
    */
   listGists(cb) {
      return this._request('GET', this.__getScopedUrl('gists'), null, cb);
   }

   /**
    * List the user's notifications
    * @see https://developer.github.com/v3/activity/notifications/#list-your-notifications
    * @param {Object} [options={}] - any options to refine the search
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   listNotifications(options, cb) {
      options = options || {};
      if (typeof options === 'function') {
         cb = options;
         options = {};
      }

      options.since = this._dateToISO(options.since);
      options.before = this._dateToISO(options.before);

      return this._request('GET', this.__getScopedUrl('notifications'), options, cb);
   }

   /**
    * Show the user's profile
    * @see https://developer.github.com/v3/users/#get-a-single-user
    * @param {Requestable.callback} [cb] - will receive the user's information
    * @return {Promise} - the promise for the http request
    */
   getProfile(cb) {
      return this._request('GET', this.__getScopedUrl(''), null, cb);
   }

   /**
    * Gets the list of starred repositories for the user
    * @see https://developer.github.com/v3/activity/starring/#list-repositories-being-starred
    * @param {Requestable.callback} [cb] - will receive the list of starred repositories
    * @return {Promise} - the promise for the http request
    */
   listStarredRepos(cb) {
      let requestOptions = this._getOptionsWithDefaults();
      return this._requestAllPages(this.__getScopedUrl('starred'), requestOptions, cb);
   }

   /**
    * Gets the list of starred gists for the user
    * @see https://developer.github.com/v3/gists/#list-starred-gists
    * @param {Object} [options={}] - any options to refine the search
    * @param {Requestable.callback} [cb] - will receive the list of gists
    * @return {Promise} - the promise for the http request
    */
   listStarredGists(options, cb) {
      options = options || {};
      if (typeof options === 'function') {
         cb = options;
         options = {};
      }
      options.since = this._dateToISO(options.since);
      return this._request('GET', '/gists/starred', options, cb);
   }

   /**
    * List email addresses for a user
    * @see https://developer.github.com/v3/users/emails/#list-email-addresses-for-a-user
    * @param {Requestable.callback} [cb] - will receive the list of emails
    * @return {Promise} - the promise for the http request
    */
   getEmails(cb) {
      return this._request('GET', '/user/emails', null, cb);
   }

   /**
    * Have the authenticated user follow this user
    * @see https://developer.github.com/v3/users/followers/#follow-a-user
    * @param {string} username - the user to follow
    * @param {Requestable.callback} [cb] - will receive true if the request succeeds
    * @return {Promise} - the promise for the http request
    */
   follow(username, cb) {
      return this._request('PUT', `/user/following/${username}`, null, cb);
   }

   /**
    * Have the currently authenticated user unfollow this user
    * @see https://developer.github.com/v3/users/followers/#follow-a-user
    * @param {string} username - the user to unfollow
    * @param {Requestable.callback} [cb] - receives true if the request succeeds
    * @return {Promise} - the promise for the http request
    */
   unfollow(username, cb) {
      return this._request('DELETE', `/user/following/${username}`, null, cb);
   }

   /**
    * Create a new repository for the currently authenticated user
    * @see https://developer.github.com/v3/repos/#create
    * @param {object} options - the repository definition
    * @param {Requestable.callback} [cb] - will receive the API response
    * @return {Promise} - the promise for the http request
    */
   createRepo(options, cb) {
      return this._request('POST', '/user/repos', options, cb);
   }
}

export default User;