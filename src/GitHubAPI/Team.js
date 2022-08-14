/**
 * @file
 * @copyright  2016 Matt Smith (Development Seed)
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';
import debug from 'debug';
const log = debug('github:team');

/**
 * A Team allows scoping of API requests to a particular Github Organization Team.
 */
class Team extends Requestable {
  /**
   * Create a Team.
   * @param {string} [teamId] - the id for the team
   * @param {Requestable.auth} [auth] - information required to authenticate to Github
   * @param {string} [apiBase=https://api.github.com] - the base Github API URL
   */
  constructor(teamId, auth, apiBase) {
    super(auth, apiBase);
    this.__teamId = teamId;
  }

  /**
   * Get Team information
   * @see https://developer.github.com/v3/orgs/teams/#get-team
   * @param {Requestable.callback} [cb] - will receive the team
   * @return {Promise} - the promise for the http request
   */
  getTeam(cb) {
    log(`Fetching Team ${this.__teamId}`);
    return this._request('Get', `/teams/${this.__teamId}`, undefined, cb);
  }

  /**
   * List the Team's repositories
   * @see https://developer.github.com/v3/orgs/teams/#list-team-repos
   * @param {Requestable.callback} [cb] - will receive the list of repositories
   * @return {Promise} - the promise for the http request
   */
  listRepos(cb) {
    log(`Fetching repositories for Team ${this.__teamId}`);
    return this._requestAllPages(
      `/teams/${this.__teamId}/repos`,
      undefined,
      cb,
    );
  }

  /**
   * Edit Team information
   * @see https://developer.github.com/v3/orgs/teams/#edit-team
   * @param {object} options - Parameters for team edit
   * @param {string} options.name - The name of the team
   * @param {string} [options.description] - Team description
   * @param {string} [options.repo_names] - Repos to add the team to
   * @param {string} [options.privacy=secret] - The level of privacy the team should have. Can be either one
   * of: `secret`, or `closed`
   * @param {Requestable.callback} [cb] - will receive the updated team
   * @return {Promise} - the promise for the http request
   */
  editTeam(options, cb) {
    log(`Editing Team ${this.__teamId}`);
    return this._request('PATCH', `/teams/${this.__teamId}`, options, cb);
  }

  /**
   * List the users who are members of the Team
   * @see https://developer.github.com/v3/orgs/teams/#list-team-members
   * @param {object} options - Parameters for listing team users
   * @param {string} [options.role=all] - can be one of: `all`, `maintainer`, or `member`
   * @param {Requestable.callback} [cb] - will receive the list of users
   * @return {Promise} - the promise for the http request
   */
  listMembers(options, cb) {
    log(`Getting members of Team ${this.__teamId}`);
    return this._requestAllPages(
      `/teams/${this.__teamId}/members`,
      options,
      cb,
    );
  }

  /**
   * Get Team membership status for a user
   * @see https://developer.github.com/v3/orgs/teams/#get-team-membership
   * @param {string} username - can be one of: `all`, `maintainer`, or `member`
   * @param {Requestable.callback} [cb] - will receive the membership status of a user
   * @return {Promise} - the promise for the http request
   */
  getMembership(username, cb) {
    log(`Getting membership of user ${username} in Team ${this.__teamId}`);
    return this._request(
      'GET',
      `/teams/${this.__teamId}/memberships/${username}`,
      undefined,
      cb,
    );
  }

  /**
   * Add a member to the Team
   * @see https://developer.github.com/v3/orgs/teams/#add-team-membership
   * @param {string} username - can be one of: `all`, `maintainer`, or `member`
   * @param {object} options - Parameters for adding a team member
   * @param {string} [options.role=member] - The role that this user should have in the team. Can be one
   * of: `member`, or `maintainer`
   * @param {Requestable.callback} [cb] - will receive the membership status of added user
   * @return {Promise} - the promise for the http request
   */
  addMembership(username, options, cb) {
    log(`Adding user ${username} to Team ${this.__teamId}`);
    return this._request(
      'PUT',
      `/teams/${this.__teamId}/memberships/${username}`,
      options,
      cb,
    );
  }

  /**
   * Get repo management status for team
   * @see https://developer.github.com/v3/orgs/teams/#remove-team-membership
   * @param {string} owner - Organization name
   * @param {string} repo - Repo name
   * @param {Requestable.callback} [cb] - will receive the membership status of added user
   * @return {Promise} - the promise for the http request
   */
  isManagedRepo(owner, repo, cb) {
    log(
      `Getting repo management by Team ${this.__teamId} for repo ${owner}/${repo}`,
    );
    return this._request204or404(
      `/teams/${this.__teamId}/repos/${owner}/${repo}`,
      undefined,
      cb,
    );
  }

  /**
   * Add or Update repo management status for team
   * @see https://developer.github.com/v3/orgs/teams/#add-or-update-team-repository
   * @param {string} owner - Organization name
   * @param {string} repo - Repo name
   * @param {object} options - Parameters for adding or updating repo management for the team
   * @param {string} [options.permission] - The permission to grant the team on this repository. Can be one
   * of: `pull`, `push`, or `admin`
   * @param {Requestable.callback} [cb] - will receive the membership status of added user
   * @return {Promise} - the promise for the http request
   */
  manageRepo(owner, repo, options, cb) {
    log(
      `Adding or Updating repo management by Team ${this.__teamId} for repo ${owner}/${repo}`,
    );
    return this._request204or404(
      `/teams/${this.__teamId}/repos/${owner}/${repo}`,
      options,
      cb,
      'PUT',
    );
  }

  /**
   * Remove repo management status for team
   * @see https://developer.github.com/v3/orgs/teams/#remove-team-repository
   * @param {string} owner - Organization name
   * @param {string} repo - Repo name
   * @param {Requestable.callback} [cb] - will receive the membership status of added user
   * @return {Promise} - the promise for the http request
   */
  unmanageRepo(owner, repo, cb) {
    log(
      `Remove repo management by Team ${this.__teamId} for repo ${owner}/${repo}`,
    );
    return this._request204or404(
      `/teams/${this.__teamId}/repos/${owner}/${repo}`,
      undefined,
      cb,
      'DELETE',
    );
  }

  /**
   * Delete Team
   * @see https://developer.github.com/v3/orgs/teams/#delete-team
   * @param {Requestable.callback} [cb] - will receive the list of repositories
   * @return {Promise} - the promise for the http request
   */
  deleteTeam(cb) {
    log(`Deleting Team ${this.__teamId}`);
    return this._request204or404(
      `/teams/${this.__teamId}`,
      undefined,
      cb,
      'DELETE',
    );
  }
}

export default Team;
