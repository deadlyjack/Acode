/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * Project encapsulates the functionality to create, query, and modify cards and columns.
 */
class Project extends Requestable {
   /**
    * Create a Project.
    * @param {string} id - the id of the project
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(id, auth, apiBase) {
      super(auth, apiBase, 'inertia-preview');
      this.__id = id;
   }

   /**
    * Get information about a project
    * @see https://developer.github.com/v3/projects/#get-a-project
    * @param {Requestable.callback} cb - will receive the project information
    * @return {Promise} - the promise for the http request
    */
   getProject(cb) {
      return this._request('GET', `/projects/${this.__id}`, null, cb);
   }

   /**
    * Edit a project
    * @see https://developer.github.com/v3/projects/#update-a-project
    * @param {Object} options - the description of the project
    * @param {Requestable.callback} cb - will receive the modified project
    * @return {Promise} - the promise for the http request
    */
   updateProject(options, cb) {
      return this._request('PATCH', `/projects/${this.__id}`, options, cb);
   }

   /**
    * Delete a project
    * @see https://developer.github.com/v3/projects/#delete-a-project
    * @param {Requestable.callback} cb - will receive true if the operation is successful
    * @return {Promise} - the promise for the http request
    */
   deleteProject(cb) {
      return this._request('DELETE', `/projects/${this.__id}`, null, cb);
   }

   /**
    * Get information about all columns of a project
    * @see https://developer.github.com/v3/projects/columns/#list-project-columns
    * @param {Requestable.callback} [cb] - will receive the list of columns
    * @return {Promise} - the promise for the http request
    */
   listProjectColumns(cb) {
      return this._requestAllPages(`/projects/${this.__id}/columns`, null, cb);
   }

   /**
    * Get information about a column
    * @see https://developer.github.com/v3/projects/columns/#get-a-project-column
    * @param {string} colId - the id of the column
    * @param {Requestable.callback} cb - will receive the column information
    * @return {Promise} - the promise for the http request
    */
   getProjectColumn(colId, cb) {
      return this._request('GET', `/projects/columns/${colId}`, null, cb);
   }

   /**
    * Create a new column
    * @see https://developer.github.com/v3/projects/columns/#create-a-project-column
    * @param {Object} options - the description of the column
    * @param {Requestable.callback} cb - will receive the newly created column
    * @return {Promise} - the promise for the http request
    */
   createProjectColumn(options, cb) {
      return this._request('POST', `/projects/${this.__id}/columns`, options, cb);
   }

   /**
    * Edit a column
    * @see https://developer.github.com/v3/projects/columns/#update-a-project-column
    * @param {string} colId - the column id
    * @param {Object} options - the description of the column
    * @param {Requestable.callback} cb - will receive the modified column
    * @return {Promise} - the promise for the http request
    */
   updateProjectColumn(colId, options, cb) {
      return this._request('PATCH', `/projects/columns/${colId}`, options, cb);
   }

   /**
    * Delete a column
    * @see https://developer.github.com/v3/projects/columns/#delete-a-project-column
    * @param {string} colId - the column to be deleted
    * @param {Requestable.callback} cb - will receive true if the operation is successful
    * @return {Promise} - the promise for the http request
    */
   deleteProjectColumn(colId, cb) {
      return this._request('DELETE', `/projects/columns/${colId}`, null, cb);
   }

   /**
    * Move a column
    * @see https://developer.github.com/v3/projects/columns/#move-a-project-column
    * @param {string} colId - the column to be moved
    * @param {string} position - can be one of first, last, or after:<column-id>,
    * where <column-id> is the id value of a column in the same project.
    * @param {Requestable.callback} cb - will receive true if the operation is successful
    * @return {Promise} - the promise for the http request
    */
   moveProjectColumn(colId, position, cb) {
      return this._request(
         'POST',
         `/projects/columns/${colId}/moves`, {
            position: position
         },
         cb
      );
   }

   /**
    * Get information about all cards of a project
    * @see https://developer.github.com/v3/projects/cards/#list-project-cards
    * @param {Requestable.callback} [cb] - will receive the list of cards
    * @return {Promise} - the promise for the http request
    */
   listProjectCards(cb) {
      return this.listProjectColumns()
         .then(({
            data
         }) => {
            return Promise.all(data.map((column) => {
               return this._requestAllPages(`/projects/columns/${column.id}/cards`, null);
            }));
         }).then((cardsInColumns) => {
            const cards = cardsInColumns.reduce((prev, {
               data
            }) => {
               prev.push(...data);
               return prev;
            }, []);
            if (cb) {
               cb(null, cards);
            }
            return cards;
         }).catch((err) => {
            if (cb) {
               cb(err);
               return;
            }
            throw err;
         });
   }

   /**
    * Get information about all cards of a column
    * @see https://developer.github.com/v3/projects/cards/#list-project-cards
    * @param {string} colId - the id of the column
    * @param {Requestable.callback} [cb] - will receive the list of cards
    * @return {Promise} - the promise for the http request
    */
   listColumnCards(colId, cb) {
      return this._requestAllPages(`/projects/columns/${colId}/cards`, null, cb);
   }

   /**
    * Get information about a card
    * @see https://developer.github.com/v3/projects/cards/#get-a-project-card
    * @param {string} cardId - the id of the card
    * @param {Requestable.callback} cb - will receive the card information
    * @return {Promise} - the promise for the http request
    */
   getProjectCard(cardId, cb) {
      return this._request('GET', `/projects/columns/cards/${cardId}`, null, cb);
   }

   /**
    * Create a new card
    * @see https://developer.github.com/v3/projects/cards/#create-a-project-card
    * @param {string} colId - the column id
    * @param {Object} options - the description of the card
    * @param {Requestable.callback} cb - will receive the newly created card
    * @return {Promise} - the promise for the http request
    */
   createProjectCard(colId, options, cb) {
      return this._request('POST', `/projects/columns/${colId}/cards`, options, cb);
   }

   /**
    * Edit a card
    * @see https://developer.github.com/v3/projects/cards/#update-a-project-card
    * @param {string} cardId - the card id
    * @param {Object} options - the description of the card
    * @param {Requestable.callback} cb - will receive the modified card
    * @return {Promise} - the promise for the http request
    */
   updateProjectCard(cardId, options, cb) {
      return this._request('PATCH', `/projects/columns/cards/${cardId}`, options, cb);
   }

   /**
    * Delete a card
    * @see https://developer.github.com/v3/projects/cards/#delete-a-project-card
    * @param {string} cardId - the card to be deleted
    * @param {Requestable.callback} cb - will receive true if the operation is successful
    * @return {Promise} - the promise for the http request
    */
   deleteProjectCard(cardId, cb) {
      return this._request('DELETE', `/projects/columns/cards/${cardId}`, null, cb);
   }

   /**
    * Move a card
    * @see https://developer.github.com/v3/projects/cards/#move-a-project-card
    * @param {string} cardId - the card to be moved
    * @param {string} position - can be one of top, bottom, or after:<card-id>,
    * where <card-id> is the id value of a card in the same project.
    * @param {string} colId - the id value of a column in the same project.
    * @param {Requestable.callback} cb - will receive true if the operation is successful
    * @return {Promise} - the promise for the http request
    */
   moveProjectCard(cardId, position, colId, cb) {
      return this._request(
         'POST',
         `/projects/columns/cards/${cardId}/moves`, {
            position: position,
            column_id: colId
         }, // eslint-disable-line camelcase
         cb
      );
   }
}

export default Project;