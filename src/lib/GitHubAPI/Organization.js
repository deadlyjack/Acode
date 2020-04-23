/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * Organization encapsulates the functionality to create repositories in organizations
 */
class Organization extends Requestable {
   /**
    * Create a new Organization
    * @param {string} organization - the name of the organization
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(organization, auth, apiBase) {
      super(auth, apiBase);
      this.__name = organization;
   }

   /**
    * Create a repository in an organization
    * @see https://developer.github.com/v3/repos/#create
    * @param {Object} options - the repository definition
    * @param {Requestable.callback} [cb] - will receive the created repository
    * @return {Promise} - the promise for the http request
    */
   createRepo(options, cb) {
      return this._request('POST', `/orgs/${this.__name}/repos`, options, cb);
   }

   /**
    * List the repositories in an organization
    * @see https://developer.github.com/v3/repos/#list-organization-repositories
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   getRepos(cb) {
      let requestOptions = this._getOptionsWithDefaults({
         direction: 'desc'
      });

      return this._requestAllPages(`/orgs/${this.__name}/repos`, requestOptions, cb);
   }

   /**
    * Query if the user is a member or not
    * @param {string} username - the user in question
    * @param {Requestable.callback} [cb] - will receive true if the user is a member
    * @return {Promise} - the promise for the http request
    */
   isMember(username, cb) {
      return this._request204or404(`/orgs/${this.__name}/members/${username}`, null, cb);
   }

   /**
    * List the users who are members of the company
    * @see https://developer.github.com/v3/orgs/members/#members-list
    * @param {object} options - filtering options
    * @param {string} [options.filter=all] - can be either `2fa_disabled` or `all`
    * @param {string} [options.role=all] - can be one of: `all`, `admin`, or `member`
    * @param {Requestable.callback} [cb] - will receive the list of users
    * @return {Promise} - the promise for the http request
    */
   listMembers(options, cb) {
      return this._request('GET', `/orgs/${this.__name}/members`, options, cb);
   }

   /**
    * List the Teams in the Organization
    * @see https://developer.github.com/v3/orgs/teams/#list-teams
    * @param {Requestable.callback} [cb] - will receive the list of teams
    * @return {Promise} - the promise for the http request
    */
   getTeams(cb) {
      return this._requestAllPages(`/orgs/${this.__name}/teams`, undefined, cb);
   }

   /**
    * Create a team
    * @see https://developer.github.com/v3/orgs/teams/#create-team
    * @param {object} options - Team creation parameters
    * @param {string} options.name - The name of the team
    * @param {string} [options.description] - Team description
    * @param {string} [options.repo_names] - Repos to add the team to
    * @param {string} [options.privacy=secret] - The level of privacy the team should have. Can be either one
    * of: `secret`, or `closed`
    * @param {Requestable.callback} [cb] - will receive the created team
    * @return {Promise} - the promise for the http request
    */
   createTeam(options, cb) {
      return this._request('POST', `/orgs/${this.__name}/teams`, options, cb);
   }

   /**
    * Get information about all projects
    * @see https://developer.github.com/v3/projects/#list-organization-projects
    * @param {Requestable.callback} [cb] - will receive the list of projects
    * @return {Promise} - the promise for the http request
    */
   listProjects(cb) {
      return this._requestAllPages(`/orgs/${this.__name}/projects`, {
         AcceptHeader: 'inertia-preview'
      }, cb);
   }

   /**
    * Create a new project
    * @see https://developer.github.com/v3/repos/projects/#create-a-project
    * @param {Object} options - the description of the project
    * @param {Requestable.callback} cb - will receive the newly created project
    * @return {Promise} - the promise for the http request
    */
   createProject(options, cb) {
      options = options || {};
      options.AcceptHeader = 'inertia-preview';
      return this._request('POST', `/orgs/${this.__name}/projects`, options, cb);
   }
}

export default Organization;