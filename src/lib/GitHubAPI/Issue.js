/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * Issue wraps the functionality to get issues for repositories
 */
class Issue extends Requestable {
   /**
    * Create a new Issue
    * @param {string} repository - the full name of the repository (`:user/:repo`) to get issues for
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(repository, auth, apiBase) {
      super(auth, apiBase);
      this.__repository = repository;
   }

   /**
    * Create a new issue
    * @see https://developer.github.com/v3/issues/#create-an-issue
    * @param {Object} issueData - the issue to create
    * @param {Requestable.callback} [cb] - will receive the created issue
    * @return {Promise} - the promise for the http request
    */
   createIssue(issueData, cb) {
      return this._request('POST', `/repos/${this.__repository}/issues`, issueData, cb);
   }

   /**
    * List the issues for the repository
    * @see https://developer.github.com/v3/issues/#list-issues-for-a-repository
    * @param {Object} options - filtering options
    * @param {Requestable.callback} [cb] - will receive the array of issues
    * @return {Promise} - the promise for the http request
    */
   listIssues(options, cb) {
      return this._requestAllPages(`/repos/${this.__repository}/issues`, options, cb);
   }

   /**
    * List the events for an issue
    * @see https://developer.github.com/v3/issues/events/#list-events-for-an-issue
    * @param {number} issue - the issue to get events for
    * @param {Requestable.callback} [cb] - will receive the list of events
    * @return {Promise} - the promise for the http request
    */
   listIssueEvents(issue, cb) {
      return this._request('GET', `/repos/${this.__repository}/issues/${issue}/events`, null, cb);
   }

   /**
    * List comments on an issue
    * @see https://developer.github.com/v3/issues/comments/#list-comments-on-an-issue
    * @param {number} issue - the id of the issue to get comments from
    * @param {Requestable.callback} [cb] - will receive the comments
    * @return {Promise} - the promise for the http request
    */
   listIssueComments(issue, cb) {
      return this._request('GET', `/repos/${this.__repository}/issues/${issue}/comments`, null, cb);
   }

   /**
    * Get a single comment on an issue
    * @see https://developer.github.com/v3/issues/comments/#get-a-single-comment
    * @param {number} id - the comment id to get
    * @param {Requestable.callback} [cb] - will receive the comment
    * @return {Promise} - the promise for the http request
    */
   getIssueComment(id, cb) {
      return this._request('GET', `/repos/${this.__repository}/issues/comments/${id}`, null, cb);
   }

   /**
    * Comment on an issue
    * @see https://developer.github.com/v3/issues/comments/#create-a-comment
    * @param {number} issue - the id of the issue to comment on
    * @param {string} comment - the comment to add
    * @param {Requestable.callback} [cb] - will receive the created comment
    * @return {Promise} - the promise for the http request
    */
   createIssueComment(issue, comment, cb) {
      return this._request('POST', `/repos/${this.__repository}/issues/${issue}/comments`, {
         body: comment
      }, cb);
   }

   /**
    * Edit a comment on an issue
    * @see https://developer.github.com/v3/issues/comments/#edit-a-comment
    * @param {number} id - the comment id to edit
    * @param {string} comment - the comment to edit
    * @param {Requestable.callback} [cb] - will receive the edited comment
    * @return {Promise} - the promise for the http request
    */
   editIssueComment(id, comment, cb) {
      return this._request('PATCH', `/repos/${this.__repository}/issues/comments/${id}`, {
         body: comment
      }, cb);
   }

   /**
    * Delete a comment on an issue
    * @see https://developer.github.com/v3/issues/comments/#delete-a-comment
    * @param {number} id - the comment id to delete
    * @param {Requestable.callback} [cb] - will receive true if the request is successful
    * @return {Promise} - the promise for the http request
    */
   deleteIssueComment(id, cb) {
      return this._request('DELETE', `/repos/${this.__repository}/issues/comments/${id}`, null, cb);
   }

   /**
    * Edit an issue
    * @see https://developer.github.com/v3/issues/#edit-an-issue
    * @param {number} issue - the issue number to edit
    * @param {Object} issueData - the new issue data
    * @param {Requestable.callback} [cb] - will receive the modified issue
    * @return {Promise} - the promise for the http request
    */
   editIssue(issue, issueData, cb) {
      return this._request('PATCH', `/repos/${this.__repository}/issues/${issue}`, issueData, cb);
   }

   /**
    * Get a particular issue
    * @see https://developer.github.com/v3/issues/#get-a-single-issue
    * @param {number} issue - the issue number to fetch
    * @param {Requestable.callback} [cb] - will receive the issue
    * @return {Promise} - the promise for the http request
    */
   getIssue(issue, cb) {
      return this._request('GET', `/repos/${this.__repository}/issues/${issue}`, null, cb);
   }

   /**
    * List the milestones for the repository
    * @see https://developer.github.com/v3/issues/milestones/#list-milestones-for-a-repository
    * @param {Object} options - filtering options
    * @param {Requestable.callback} [cb] - will receive the array of milestones
    * @return {Promise} - the promise for the http request
    */
   listMilestones(options, cb) {
      return this._request('GET', `/repos/${this.__repository}/milestones`, options, cb);
   }

   /**
    * Get a milestone
    * @see https://developer.github.com/v3/issues/milestones/#get-a-single-milestone
    * @param {string} milestone - the id of the milestone to fetch
    * @param {Requestable.callback} [cb] - will receive the milestone
    * @return {Promise} - the promise for the http request
    */
   getMilestone(milestone, cb) {
      return this._request('GET', `/repos/${this.__repository}/milestones/${milestone}`, null, cb);
   }

   /**
    * Create a new milestone
    * @see https://developer.github.com/v3/issues/milestones/#create-a-milestone
    * @param {Object} milestoneData - the milestone definition
    * @param {Requestable.callback} [cb] - will receive the milestone
    * @return {Promise} - the promise for the http request
    */
   createMilestone(milestoneData, cb) {
      return this._request('POST', `/repos/${this.__repository}/milestones`, milestoneData, cb);
   }

   /**
    * Edit a milestone
    * @see https://developer.github.com/v3/issues/milestones/#update-a-milestone
    * @param {string} milestone - the id of the milestone to edit
    * @param {Object} milestoneData - the updates to make to the milestone
    * @param {Requestable.callback} [cb] - will receive the updated milestone
    * @return {Promise} - the promise for the http request
    */
   editMilestone(milestone, milestoneData, cb) {
      return this._request('PATCH', `/repos/${this.__repository}/milestones/${milestone}`, milestoneData, cb);
   }

   /**
    * Delete a milestone (this is distinct from closing a milestone)
    * @see https://developer.github.com/v3/issues/milestones/#delete-a-milestone
    * @param {string} milestone - the id of the milestone to delete
    * @param {Requestable.callback} [cb] - will receive the status
    * @return {Promise} - the promise for the http request
    */
   deleteMilestone(milestone, cb) {
      return this._request('DELETE', `/repos/${this.__repository}/milestones/${milestone}`, null, cb);
   }

   /**
    * Create a new label
    * @see https://developer.github.com/v3/issues/labels/#create-a-label
    * @param {Object} labelData - the label definition
    * @param {Requestable.callback} [cb] - will receive the object representing the label
    * @return {Promise} - the promise for the http request
    */
   createLabel(labelData, cb) {
      return this._request('POST', `/repos/${this.__repository}/labels`, labelData, cb);
   }

   /**
    * List the labels for the repository
    * @see https://developer.github.com/v3/issues/labels/#list-all-labels-for-this-repository
    * @param {Object} options - filtering options
    * @param {Requestable.callback} [cb] - will receive the array of labels
    * @return {Promise} - the promise for the http request
    */
   listLabels(options, cb) {
      return this._request('GET', `/repos/${this.__repository}/labels`, options, cb);
   }

   /**
    * Get a label
    * @see https://developer.github.com/v3/issues/labels/#get-a-single-label
    * @param {string} label - the name of the label to fetch
    * @param {Requestable.callback} [cb] - will receive the label
    * @return {Promise} - the promise for the http request
    */
   getLabel(label, cb) {
      return this._request('GET', `/repos/${this.__repository}/labels/${label}`, null, cb);
   }

   /**
    * Edit a label
    * @see https://developer.github.com/v3/issues/labels/#update-a-label
    * @param {string} label - the name of the label to edit
    * @param {Object} labelData - the updates to make to the label
    * @param {Requestable.callback} [cb] - will receive the updated label
    * @return {Promise} - the promise for the http request
    */
   editLabel(label, labelData, cb) {
      return this._request('PATCH', `/repos/${this.__repository}/labels/${label}`, labelData, cb);
   }

   /**
    * Delete a label
    * @see https://developer.github.com/v3/issues/labels/#delete-a-label
    * @param {string} label - the name of the label to delete
    * @param {Requestable.callback} [cb] - will receive the status
    * @return {Promise} - the promise for the http request
    */
   deleteLabel(label, cb) {
      return this._request('DELETE', `/repos/${this.__repository}/labels/${label}`, null, cb);
   }
}

export default Issue;