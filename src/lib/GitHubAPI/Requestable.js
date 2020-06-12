/**
 * @file
 * @copyright  2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import ajax from 'axios';
import debug from 'debug';
import {
   Base64
} from 'js-base64';

const log = debug('github:request');

/**
 * The error structure returned when a network call fails
 */
class ResponseError extends Error {
   /**
    * Construct a new ResponseError
    * @param {string} message - an message to return instead of the the default error message
    * @param {string} path - the requested path
    * @param {Object} response - the object returned by Axios
    */
   constructor(message, path, response) {
      super(message);
      this.path = path;
      this.request = response.config;
      this.response = (response || {}).response || response;
      this.status = response.status;
   }
}

/**
 * Requestable wraps the logic for making http requests to the API
 */
class Requestable {
   /**
    * Either a username and password or an oauth token for Github
    * @typedef {Object} Requestable.auth
    * @prop {string} [username] - the Github username
    * @prop {string} [password] - the user's password
    * @prop {token} [token] - an OAuth token
    */
   /**
    * Initialize the http internals.
    * @param {Requestable.auth} [auth] - the credentials to authenticate to Github. If auth is
    *                                  not provided request will be made unauthenticated
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    * @param {string} [AcceptHeader=v3] - the accept header for the requests
    */
   constructor(auth, apiBase, AcceptHeader) {
      this.__apiBase = apiBase || 'https://api.github.com';
      this.__auth = {
         token: auth.token,
         username: auth.username,
         password: auth.password,
      };
      this.__AcceptHeader = AcceptHeader || 'v3';

      if (auth.token) {
         this.__authorizationHeader = 'token ' + auth.token;
      } else if (auth.username && auth.password) {
         this.__authorizationHeader = 'Basic ' + Base64.encode(auth.username + ':' + auth.password);
      }
   }

   /**
    * Compute the URL to use to make a request.
    * @private
    * @param {string} path - either a URL relative to the API base or an absolute URL
    * @return {string} - the URL to use
    */
   __getURL(path) {
      let url = path;

      if (path.indexOf('//') === -1) {
         url = this.__apiBase + path;
      }

      let newCacheBuster = 'timestamp=' + new Date().getTime();
      return url.replace(/(timestamp=\d+)/, newCacheBuster);
   }

   /**
    * Compute the headers required for an API request.
    * @private
    * @param {boolean} raw - if the request should be treated as JSON or as a raw request
    * @param {string} AcceptHeader - the accept header for the request
    * @return {Object} - the headers to use in the request
    */
   __getRequestHeaders(raw, AcceptHeader) {
      let headers = {
         'Content-Type': 'application/json;charset=UTF-8',
         'Accept': 'application/vnd.github.' + (AcceptHeader || this.__AcceptHeader),
      };

      if (raw) {
         headers.Accept += '.raw';
      }
      headers.Accept += '+json';

      if (this.__authorizationHeader) {
         headers.Authorization = this.__authorizationHeader;
      }

      return headers;
   }

   /**
    * Sets the default options for API requests
    * @protected
    * @param {Object} [requestOptions={}] - the current options for the request
    * @return {Object} - the options to pass to the request
    */
   _getOptionsWithDefaults(requestOptions = {}) {
      if (!(requestOptions.visibility || requestOptions.affiliation)) {
         requestOptions.type = requestOptions.type || 'all';
      }
      requestOptions.sort = requestOptions.sort || 'updated';
      requestOptions.per_page = requestOptions.per_page || '100'; // eslint-disable-line

      return requestOptions;
   }

   /**
    * if a `Date` is passed to this function it will be converted to an ISO string
    * @param {*} date - the object to attempt to coerce into an ISO date string
    * @return {string} - the ISO representation of `date` or whatever was passed in if it was not a date
    */
   _dateToISO(date) {
      if (date && (date instanceof Date)) {
         date = date.toISOString();
      }

      return date;
   }

   /**
    * A function that receives the result of the API request.
    * @callback Requestable.callback
    * @param {Requestable.Error} error - the error returned by the API or `null`
    * @param {(Object|true)} result - the data returned by the API or `true` if the API returns `204 No Content`
    * @param {Object} request - the raw {@linkcode https://github.com/mzabriskie/axios#response-schema Response}
    */
   /**
    * Make a request.
    * @param {string} method - the method for the request (GET, PUT, POST, DELETE)
    * @param {string} path - the path for the request
    * @param {*} [data] - the data to send to the server. For HTTP methods that don't have a body the data
    *                   will be sent as query parameters
    * @param {Requestable.callback} [cb] - the callback for the request
    * @param {boolean} [raw=false] - if the request should be sent as raw. If this is a falsy value then the
    *                              request will be made as JSON
    * @return {Promise} - the Promise for the http request
    */
   _request(method, path, data, cb, raw) {
      const url = this.__getURL(path);

      const AcceptHeader = (data || {}).AcceptHeader;
      if (AcceptHeader) {
         delete data.AcceptHeader;
      }
      const headers = this.__getRequestHeaders(raw, AcceptHeader);

      let queryParams = {};

      const shouldUseDataAsParams = data && (typeof data === 'object') && methodHasNoBody(method);
      if (shouldUseDataAsParams) {
         queryParams = data;
         data = undefined;
      }

      const config = {
         url: url,
         method: method,
         headers: headers,
         params: queryParams,
         data: data,
         responseType: raw ? (raw === 'raw' ? 'text' : raw) : 'json',
      };

      log(`${config.method} to ${config.url}`);
      const requestPromise = ajax(config).catch(callbackErrorOrThrow(cb, path));

      if (typeof cb === 'function') {
         requestPromise.then((response) => {
            if (response.data && Object.keys(response.data).length > 0) {
               // When data has results
               cb(null, response.data, response);
            } else if (config.method !== 'GET' && Object.keys(response.data).length < 1) {
               // True when successful submit a request and receive a empty object
               cb(null, (response.status < 300), response);
            } else {
               cb(null, response.data, response);
            }
         });
      }

      return requestPromise;
   }

   /**
    * Make a request to an endpoint the returns 204 when true and 404 when false
    * @param {string} path - the path to request
    * @param {Object} data - any query parameters for the request
    * @param {Requestable.callback} cb - the callback that will receive `true` or `false`
    * @param {method} [method=GET] - HTTP Method to use
    * @return {Promise} - the promise for the http request
    */
   _request204or404(path, data, cb, method = 'GET') {
      return this._request(method, path, data)
         .then(function success(response) {
            if (cb) {
               cb(null, true, response);
            }
            return true;
         }, function failure(response) {
            if (response.response.status === 404) {
               if (cb) {
                  cb(null, false, response);
               }
               return false;
            }

            if (cb) {
               cb(response);
            }
            throw response;
         });
   }

   /**
    * Make a request and fetch all the available data. Github will paginate responses so for queries
    * that might span multiple pages this method is preferred to {@link Requestable#request}
    * @param {string} path - the path to request
    * @param {Object} options - the query parameters to include
    * @param {Requestable.callback} [cb] - the function to receive the data. The returned data will always be an array.
    * @param {Object[]} results - the partial results. This argument is intended for internal use only.
    * @return {Promise} - a promise which will resolve when all pages have been fetched
    * @deprecated This will be folded into {@link Requestable#_request} in the 2.0 release.
    */
   _requestAllPages(path, options, cb, results) {
      results = results || [];

      return this._request('GET', path, options)
         .then((response) => {
            let thisGroup;
            if (response.data instanceof Array) {
               thisGroup = response.data;
            } else if (response.data.items instanceof Array) {
               thisGroup = response.data.items;
            } else {
               let message = `cannot figure out how to append ${response.data} to the result set`;
               throw new ResponseError(message, path, response);
            }
            results.push(...thisGroup);

            const nextUrl = getNextPage(response.headers.link);
            if (nextUrl) {
               if (!options) {
                  options = {};
               }
               options.page = parseInt(
                  nextUrl.match(/([&\?]page=[0-9]*)/g)
                  .shift()
                  .split('=')
                  .pop()
               );
               if (!(options && typeof options.page !== 'number')) {
                  log(`getting next page: ${nextUrl}`);
                  return this._requestAllPages(nextUrl, options, cb, results);
               }
            }

            if (cb) {
               cb(null, results, response);
            }

            response.data = results;
            return response;
         }).catch(callbackErrorOrThrow(cb, path));
   }
}

export default Requestable;

// ////////////////////////// //
//  Private helper functions  //
// ////////////////////////// //
const METHODS_WITH_NO_BODY = ['GET', 'HEAD', 'DELETE'];

function methodHasNoBody(method) {
   return METHODS_WITH_NO_BODY.indexOf(method) !== -1;
}

function getNextPage(linksHeader = '') {
   const links = linksHeader.split(/\s*,\s*/); // splits and strips the urls
   return links.reduce(function (nextUrl, link) {
      if (link.search(/rel="next"/) !== -1) {
         return (link.match(/<(.*)>/) || [])[1];
      }

      return nextUrl;
   }, undefined);
}

function callbackErrorOrThrow(cb, path) {
   return function handler(object) {
      let error;
      if (object.hasOwnProperty('config')) {
         const {
            response: {
               status,
               statusText
            },
            config: {
               method,
               url
            }
         } = object;
         let message = (`${status} error making request ${method} ${url}: "${statusText}"`);
         error = new ResponseError(message, path, object);
         log(`${message} ${JSON.stringify(object.data)}`);
      } else {
         error = object;
      }
      if (cb) {
         log('going to error callback');
         cb(error);
      } else {
         log('throwing error');
         throw error;
      }
   };
}