/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';
import Utf8 from 'utf8';
import { Base64 } from 'js-base64';
import debug from 'debug';
const log = debug('github:repository');

/**
 * Repository encapsulates the functionality to create, query, and modify files.
 */
class Repository extends Requestable {
  /**
   * Create a Repository.
   * @param {string} fullname - the full name of the repository
   * @param {Requestable.auth} [auth] - information required to authenticate to Github
   * @param {string} [apiBase=https://api.github.com] - the base Github API URL
   */
  constructor(fullname, auth, apiBase) {
    super(auth, apiBase);
    this.__fullname = fullname;
    this.__currentTree = {
      branch: null,
      sha: null,
    };
  }

  /**
   * Get a reference
   * @see https://developer.github.com/v3/git/refs/#get-a-reference
   * @param {string} ref - the reference to get
   * @param {Requestable.callback} [cb] - will receive the reference's refSpec or a list of refSpecs that match `ref`
   * @return {Promise} - the promise for the http request
   */
  getRef(ref, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/git/refs/${ref}`,
      null,
      cb,
    );
  }

  /**
   * Create a reference
   * @see https://developer.github.com/v3/git/refs/#create-a-reference
   * @param {Object} options - the object describing the ref
   * @param {Requestable.callback} [cb] - will receive the ref
   * @return {Promise} - the promise for the http request
   */
  createRef(options, cb) {
    return this._request(
      'POST',
      `/repos/${this.__fullname}/git/refs`,
      options,
      cb,
    );
  }

  /**
   * Delete a reference
   * @see https://developer.github.com/v3/git/refs/#delete-a-reference
   * @param {string} ref - the name of the ref to delte
   * @param {Requestable.callback} [cb] - will receive true if the request is successful
   * @return {Promise} - the promise for the http request
   */
  deleteRef(ref, cb) {
    return this._request(
      'DELETE',
      `/repos/${this.__fullname}/git/refs/${ref}`,
      null,
      cb,
    );
  }

  /**
   * Delete a repository
   * @see https://developer.github.com/v3/repos/#delete-a-repository
   * @param {Requestable.callback} [cb] - will receive true if the request is successful
   * @return {Promise} - the promise for the http request
   */
  deleteRepo(cb) {
    return this._request('DELETE', `/repos/${this.__fullname}`, null, cb);
  }

  /**
   * List the tags on a repository
   * @see https://developer.github.com/v3/repos/#list-tags
   * @param {Requestable.callback} [cb] - will receive the tag data
   * @return {Promise} - the promise for the http request
   */
  listTags(cb) {
    return this._request('GET', `/repos/${this.__fullname}/tags`, null, cb);
  }

  /**
   * List the open pull requests on the repository
   * @see https://developer.github.com/v3/pulls/#list-pull-requests
   * @param {Object} options - options to filter the search
   * @param {Requestable.callback} [cb] - will receive the list of PRs
   * @return {Promise} - the promise for the http request
   */
  listPullRequests(options, cb) {
    options = options || {};
    return this._request('GET', `/repos/${this.__fullname}/pulls`, options, cb);
  }

  /**
   * Get information about a specific pull request
   * @see https://developer.github.com/v3/pulls/#get-a-single-pull-request
   * @param {number} number - the PR you wish to fetch
   * @param {Requestable.callback} [cb] - will receive the PR from the API
   * @return {Promise} - the promise for the http request
   */
  getPullRequest(number, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/pulls/${number}`,
      null,
      cb,
    );
  }

  /**
   * List the files of a specific pull request
   * @see https://developer.github.com/v3/pulls/#list-pull-requests-files
   * @param {number|string} number - the PR you wish to fetch
   * @param {Requestable.callback} [cb] - will receive the list of files from the API
   * @return {Promise} - the promise for the http request
   */
  listPullRequestFiles(number, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/pulls/${number}/files`,
      null,
      cb,
    );
  }

  /**
   * Compare two branches/commits/repositories
   * @see https://developer.github.com/v3/repos/commits/#compare-two-commits
   * @param {string} base - the base commit
   * @param {string} head - the head commit
   * @param {Requestable.callback} cb - will receive the comparison
   * @return {Promise} - the promise for the http request
   */
  compareBranches(base, head, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/compare/${base}...${head}`,
      null,
      cb,
    );
  }

  /**
   * List all the branches for the repository
   * @see https://developer.github.com/v3/repos/#list-branches
   * @param {Requestable.callback} cb - will receive the list of branches
   * @return {Promise} - the promise for the http request
   */
  listBranches(cb) {
    return this._request('GET', `/repos/${this.__fullname}/branches`, { per_page: 100 }, cb);
  }

  /**
   * Get a raw blob from the repository
   * @see https://developer.github.com/v3/git/blobs/#get-a-blob
   * @param {string} sha - the sha of the blob to fetch
   * @param {Requestable.callback} cb - will receive the blob from the API
   * @return {Promise} - the promise for the http request
   */
  getBlob(sha, cb) {
    let resType = 'raw';
    if (typeof cb === 'string') resType = cb;
    return this._request(
      'GET',
      `/repos/${this.__fullname}/git/blobs/${sha}`,
      null,
      cb,
      resType,
    );
  }

  /**
   * Get a single branch
   * @see https://developer.github.com/v3/repos/branches/#get-branch
   * @param {string} branch - the name of the branch to fetch
   * @param {Requestable.callback} cb - will receive the branch from the API
   * @returns {Promise} - the promise for the http request
   */
  getBranch(branch, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/branches/${branch}`,
      null,
      cb,
    );
  }

  /**
   * Get a commit from the repository
   * @see https://developer.github.com/v3/repos/commits/#get-a-single-commit
   * @param {string} sha - the sha for the commit to fetch
   * @param {Requestable.callback} cb - will receive the commit data
   * @return {Promise} - the promise for the http request
   */
  getCommit(sha, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/git/commits/${sha}`,
      null,
      cb,
    );
  }

  /**
   * List the commits on a repository, optionally filtering by path, author or time range
   * @see https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
   * @param {Object} [options] - the filtering options for commits
   * @param {string} [options.sha] - the SHA or branch to start from
   * @param {string} [options.path] - the path to search on
   * @param {string} [options.author] - the commit author
   * @param {(Date|string)} [options.since] - only commits after this date will be returned
   * @param {(Date|string)} [options.until] - only commits before this date will be returned
   * @param {Requestable.callback} cb - will receive the list of commits found matching the criteria
   * @return {Promise} - the promise for the http request
   */
  listCommits(options, cb) {
    options = options || {};
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    options.since = this._dateToISO(options.since);
    options.until = this._dateToISO(options.until);

    return this._request(
      'GET',
      `/repos/${this.__fullname}/commits`,
      options,
      cb,
    );
  }

  /**
   * Gets a single commit information for a repository
   * @see https://developer.github.com/v3/repos/commits/#get-a-single-commit
   * @param {string} ref - the reference for the commit-ish
   * @param {Requestable.callback} cb - will receive the commit information
   * @return {Promise} - the promise for the http request
   */
  getSingleCommit(ref, cb) {
    ref = ref || '';
    return this._request(
      'GET',
      `/repos/${this.__fullname}/commits/${ref}`,
      null,
      cb,
    );
  }

  /**
   * Get tha sha for a particular object in the repository. This is a convenience function
   * @see https://developer.github.com/v3/repos/contents/#get-contents
   * @param {string} [branch] - the branch to look in, or the repository's default branch if omitted
   * @param {string} path - the path of the file or directory
   * @param {Requestable.callback} cb - will receive a description of the requested object, including a `SHA` property
   * @return {Promise} - the promise for the http request
   */
  getSha(branch, path, cb) {
    branch = branch ? `?ref=${branch}` : '';
    return this._request(
      'GET',
      `/repos/${this.__fullname}/contents/${path}${branch}`,
      null,
      cb,
    );
  }

  /**
   * List the commit statuses for a particular sha, branch, or tag
   * @see https://developer.github.com/v3/repos/statuses/#list-statuses-for-a-specific-ref
   * @param {string} sha - the sha, branch, or tag to get statuses for
   * @param {Requestable.callback} cb - will receive the list of statuses
   * @return {Promise} - the promise for the http request
   */
  listStatuses(sha, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/commits/${sha}/statuses`,
      null,
      cb,
    );
  }

  /**
   * Get the combined view of commit statuses for a particular sha, branch, or tag
   * @see https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
   * @param {string} sha - the sha, branch, or tag to get the combined status for
   * @param {Requestable.callback} cb - will receive the combined status
   * @returns {Promise} - the promise for the http request
   */
  getCombinedStatus(sha, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/commits/${sha}/status`,
      null,
      cb,
    );
  }

  /**
   * Get a description of a git tree
   * @see https://developer.github.com/v3/git/trees/#get-a-tree
   * @param {string} treeSHA - the SHA of the tree to fetch
   * @param {Requestable.callback} cb - will receive the callback data
   * @return {Promise} - the promise for the http request
   */
  getTree(treeSHA, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/git/trees/${treeSHA}`,
      null,
      cb,
    );
  }

  /**
   * Create a blob
   * @see https://developer.github.com/v3/git/blobs/#create-a-blob
   * @param {(string|Buffer|Blob)} content - the content to add to the repository
   * @param {Requestable.callback} cb - will receive the details of the created blob
   * @return {Promise} - the promise for the http request
   */
  createBlob(content, cb) {
    let postBody = this._getContentObject(content);

    log('sending content', postBody);
    return this._request(
      'POST',
      `/repos/${this.__fullname}/git/blobs`,
      postBody,
      cb,
    );
  }

  /**
   * Get the object that represents the provided content
   * @param {string|Buffer|Blob} content - the content to send to the server
   * @return {Object} the representation of `content` for the GitHub API
   */
  _getContentObject(content) {
    if (typeof content === 'string') {
      log('contet is a string');
      return {
        content: Utf8.encode(content),
        encoding: 'utf-8',
      };
    } else if (typeof Buffer !== 'undefined' && content instanceof Buffer) {
      log('We appear to be in Node');
      return {
        content: content.toString('base64'),
        encoding: 'base64',
      };
    } else if (typeof Blob !== 'undefined' && content instanceof Blob) {
      log('We appear to be in the browser');
      return {
        content: Base64.encode(content),
        encoding: 'base64',
      };
    } else {
      // eslint-disable-line
      log(
        `Not sure what this content is: ${typeof content}, ${JSON.stringify(
          content,
        )}`,
      );
      throw new Error(
        'Unknown content passed to postBlob. Must be string or Buffer (node) or Blob (web)',
      );
    }
  }

  /**
   * Update a tree in Git
   * @see https://developer.github.com/v3/git/trees/#create-a-tree
   * @param {string} baseTreeSHA - the SHA of the tree to update
   * @param {string} path - the path for the new file
   * @param {string} blobSHA - the SHA for the blob to put at `path`
   * @param {Requestable.callback} cb - will receive the new tree that is created
   * @return {Promise} - the promise for the http request
   * @deprecated use {@link Repository#createTree} instead
   */
  updateTree(baseTreeSHA, path, blobSHA, cb) {
    let newTree = {
      base_tree: baseTreeSHA, // eslint-disable-line
      tree: [
        {
          path: path,
          sha: blobSHA,
          mode: '100644',
          type: 'blob',
        },
      ],
    };

    return this._request(
      'POST',
      `/repos/${this.__fullname}/git/trees`,
      newTree,
      cb,
    );
  }

  /**
   * Create a new tree in git
   * @see https://developer.github.com/v3/git/trees/#create-a-tree
   * @param {Object} tree - the tree to create
   * @param {string} baseSHA - the root sha of the tree
   * @param {Requestable.callback} cb - will receive the new tree that is created
   * @return {Promise} - the promise for the http request
   */
  createTree(tree, baseSHA, cb) {
    return this._request(
      'POST',
      `/repos/${this.__fullname}/git/trees`,
      {
        tree,
        base_tree: baseSHA, // eslint-disable-line camelcase
      },
      cb,
    );
  }

  /**
   * Add a commit to the repository
   * @see https://developer.github.com/v3/git/commits/#create-a-commit
   * @param {string} parent - the SHA of the parent commit
   * @param {string} tree - the SHA of the tree for this commit
   * @param {string} message - the commit message
   * @param {Object} [options] - commit options
   * @param {Object} [options.author] - the author of the commit
   * @param {Object} [options.commiter] - the committer
   * @param {Requestable.callback} cb - will receive the commit that is created
   * @return {Promise} - the promise for the http request
   */
  commit(parent, tree, message, options, cb) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    let data = {
      message,
      tree,
      parents: [parent],
    };

    data = Object.assign({}, options, data);

    return this._request(
      'POST',
      `/repos/${this.__fullname}/git/commits`,
      data,
      cb,
    ).then((response) => {
      this.__currentTree.sha = response.data.sha; // Update latest commit
      return response;
    });
  }

  /**
   * Update a ref
   * @see https://developer.github.com/v3/git/refs/#update-a-reference
   * @param {string} ref - the ref to update
   * @param {string} commitSHA - the SHA to point the reference to
   * @param {boolean} force - indicates whether to force or ensure a fast-forward update
   * @param {Requestable.callback} cb - will receive the updated ref back
   * @return {Promise} - the promise for the http request
   */
  updateHead(ref, commitSHA, force, cb) {
    return this._request(
      'PATCH',
      `/repos/${this.__fullname}/git/refs/${ref}`,
      {
        sha: commitSHA,
        force: force,
      },
      cb,
    );
  }

  /**
   * Update commit status
   * @see https://developer.github.com/v3/repos/statuses/
   * @param {string} commitSHA - the SHA of the commit that should be updated
   * @param {object} options - Commit status parameters
   * @param {string} options.state - The state of the status. Can be one of: pending, success, error, or failure.
   * @param {string} [options.target_url] - The target URL to associate with this status.
   * @param {string} [options.description] - A short description of the status.
   * @param {string} [options.context] - A string label to differentiate this status among CI systems.
   * @param {Requestable.callback} cb - will receive the updated commit back
   * @return {Promise} - the promise for the http request
   */
  updateStatus(commitSHA, options, cb) {
    return this._request(
      'POST',
      `/repos/${this.__fullname}/statuses/${commitSHA}`,
      options,
      cb,
    );
  }

  /**
   * Update repository information
   * @see https://developer.github.com/v3/repos/#edit
   * @param {object} options - New parameters that will be set to the repository
   * @param {string} options.name - Name of the repository
   * @param {string} [options.description] - A short description of the repository
   * @param {string} [options.homepage] - A URL with more information about the repository
   * @param {boolean} [options.private] - Either true to make the repository private, or false to make it public.
   * @param {boolean} [options.has_issues] - Either true to enable issues for this repository, false to disable them.
   * @param {boolean} [options.has_wiki] - Either true to enable the wiki for this repository, false to disable it.
   * @param {boolean} [options.has_downloads] - Either true to enable downloads, false to disable them.
   * @param {string} [options.default_branch] - Updates the default branch for this repository.
   * @param {Requestable.callback} cb - will receive the updated repository back
   * @return {Promise} - the promise for the http request
   */
  updateRepository(options, cb) {
    return this._request('PATCH', `/repos/${this.__fullname}`, options, cb);
  }

  /**
   * Get information about the repository
   * @see https://developer.github.com/v3/repos/#get
   * @param {Requestable.callback} cb - will receive the information about the repository
   * @return {Promise} - the promise for the http request
   */
  getDetails(cb) {
    return this._request('GET', `/repos/${this.__fullname}`, null, cb);
  }

  /**
   * List the contributors to the repository
   * @see https://developer.github.com/v3/repos/#list-contributors
   * @param {Requestable.callback} cb - will receive the list of contributors
   * @return {Promise} - the promise for the http request
   */
  getContributors(cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/contributors`,
      null,
      cb,
    );
  }

  /**
   * List the contributor stats to the repository
   * @see https://developer.github.com/v3/repos/#list-contributors
   * @param {Requestable.callback} cb - will receive the list of contributors
   * @return {Promise} - the promise for the http request
   */
  getContributorStats(cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/stats/contributors`,
      null,
      cb,
    );
  }

  /**
   * List the users who are collaborators on the repository. The currently authenticated user must have
   * push access to use this method
   * @see https://developer.github.com/v3/repos/collaborators/#list-collaborators
   * @param {Requestable.callback} cb - will receive the list of collaborators
   * @return {Promise} - the promise for the http request
   */
  getCollaborators(cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/collaborators`,
      null,
      cb,
    );
  }

  /**
   * Check if a user is a collaborator on the repository
   * @see https://developer.github.com/v3/repos/collaborators/#check-if-a-user-is-a-collaborator
   * @param {string} username - the user to check
   * @param {Requestable.callback} cb - will receive true if the user is a collaborator and false if they are not
   * @return {Promise} - the promise for the http request {Boolean} [description]
   */
  isCollaborator(username, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/collaborators/${username}`,
      null,
      cb,
    );
  }

  /**
   * Get the contents of a repository
   * @see https://developer.github.com/v3/repos/contents/#get-contents
   * @param {string} ref - the ref to check
   * @param {string} path - the path containing the content to fetch
   * @param {boolean} raw - `true` if the results should be returned raw instead of GitHub's normalized format
   * @param {Requestable.callback} cb - will receive the fetched data
   * @return {Promise} - the promise for the http request
   */
  getContents(ref, path, raw, cb) {
    path = path ? `${encodeURI(path)}` : '';
    return this._request(
      'GET',
      `/repos/${this.__fullname}/contents/${path}`,
      {
        ref,
      },
      cb,
      raw,
    );
  }

  /**
   * Get the README of a repository
   * @see https://developer.github.com/v3/repos/contents/#get-the-readme
   * @param {string} ref - the ref to check
   * @param {boolean} raw - `true` if the results should be returned raw instead of GitHub's normalized format
   * @param {Requestable.callback} cb - will receive the fetched data
   * @return {Promise} - the promise for the http request
   */
  getReadme(ref, raw, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/readme`,
      {
        ref,
      },
      cb,
      raw,
    );
  }

  /**
   * Fork a repository
   * @see https://developer.github.com/v3/repos/forks/#create-a-fork
   * @param {Requestable.callback} cb - will receive the information about the newly created fork
   * @return {Promise} - the promise for the http request
   */
  fork(cb) {
    return this._request('POST', `/repos/${this.__fullname}/forks`, null, cb);
  }

  /**
   * Fork a repository to an organization
   * @see https://developer.github.com/v3/repos/forks/#create-a-fork
   * @param {String} org - organization where you'd like to create the fork.
   * @param {Requestable.callback} cb - will receive the information about the newly created fork
   * @return {Promise} - the promise for the http request
   *
   */
  forkToOrg(org, cb) {
    return this._request(
      'POST',
      `/repos/${this.__fullname}/forks?organization=${org}`,
      null,
      cb,
    );
  }

  /**
   * List a repository's forks
   * @see https://developer.github.com/v3/repos/forks/#list-forks
   * @param {Requestable.callback} cb - will receive the list of repositories forked from this one
   * @return {Promise} - the promise for the http request
   */
  listForks(cb) {
    return this._request('GET', `/repos/${this.__fullname}/forks`, null, cb);
  }

  /**
   * Create a new branch from an existing branch.
   * @param {string} [oldBranch=master] - the name of the existing branch
   * @param {string} newBranch - the name of the new branch
   * @param {Requestable.callback} cb - will receive the commit data for the head of the new branch
   * @return {Promise} - the promise for the http request
   */
  createBranch(oldBranch, newBranch, cb) {
    if (typeof newBranch === 'function') {
      cb = newBranch;
      newBranch = oldBranch;
      oldBranch = 'master';
    }

    return this.getRef(`heads/${oldBranch}`).then((response) => {
      let sha = response.data.object.sha;
      return this.createRef(
        {
          sha,
          ref: `refs/heads/${newBranch}`,
        },
        cb,
      );
    });
  }

  /**
   * Create a new pull request
   * @see https://developer.github.com/v3/pulls/#create-a-pull-request
   * @param {Object} options - the pull request description
   * @param {Requestable.callback} cb - will receive the new pull request
   * @return {Promise} - the promise for the http request
   */
  createPullRequest(options, cb) {
    return this._request(
      'POST',
      `/repos/${this.__fullname}/pulls`,
      options,
      cb,
    );
  }

  /**
   * Update a pull request
   * @see https://developer.github.com/v3/pulls/#update-a-pull-request
   * @param {number|string} number - the number of the pull request to update
   * @param {Object} options - the pull request description
   * @param {Requestable.callback} [cb] - will receive the pull request information
   * @return {Promise} - the promise for the http request
   */
  updatePullRequest(number, options, cb) {
    return this._request(
      'PATCH',
      `/repos/${this.__fullname}/pulls/${number}`,
      options,
      cb,
    );
  }

  /**
   * List the hooks for the repository
   * @see https://developer.github.com/v3/repos/hooks/#list-hooks
   * @param {Requestable.callback} cb - will receive the list of hooks
   * @return {Promise} - the promise for the http request
   */
  listHooks(cb) {
    return this._request('GET', `/repos/${this.__fullname}/hooks`, null, cb);
  }

  /**
   * Get a hook for the repository
   * @see https://developer.github.com/v3/repos/hooks/#get-single-hook
   * @param {number} id - the id of the webook
   * @param {Requestable.callback} cb - will receive the details of the webook
   * @return {Promise} - the promise for the http request
   */
  getHook(id, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/hooks/${id}`,
      null,
      cb,
    );
  }

  /**
   * Add a new hook to the repository
   * @see https://developer.github.com/v3/repos/hooks/#create-a-hook
   * @param {Object} options - the configuration describing the new hook
   * @param {Requestable.callback} cb - will receive the new webhook
   * @return {Promise} - the promise for the http request
   */
  createHook(options, cb) {
    return this._request(
      'POST',
      `/repos/${this.__fullname}/hooks`,
      options,
      cb,
    );
  }

  /**
   * Edit an existing webhook
   * @see https://developer.github.com/v3/repos/hooks/#edit-a-hook
   * @param {number} id - the id of the webhook
   * @param {Object} options - the new description of the webhook
   * @param {Requestable.callback} cb - will receive the updated webhook
   * @return {Promise} - the promise for the http request
   */
  updateHook(id, options, cb) {
    return this._request(
      'PATCH',
      `/repos/${this.__fullname}/hooks/${id}`,
      options,
      cb,
    );
  }

  /**
   * Delete a webhook
   * @see https://developer.github.com/v3/repos/hooks/#delete-a-hook
   * @param {number} id - the id of the webhook to be deleted
   * @param {Requestable.callback} cb - will receive true if the call is successful
   * @return {Promise} - the promise for the http request
   */
  deleteHook(id, cb) {
    return this._request(
      'DELETE',
      `/repos/${this.__fullname}/hooks/${id}`,
      null,
      cb,
    );
  }

  /**
   * List the deploy keys for the repository
   * @see https://developer.github.com/v3/repos/keys/#list-deploy-keys
   * @param {Requestable.callback} cb - will receive the list of deploy keys
   * @return {Promise} - the promise for the http request
   */
  listKeys(cb) {
    return this._request('GET', `/repos/${this.__fullname}/keys`, null, cb);
  }

  /**
   * Get a deploy key for the repository
   * @see https://developer.github.com/v3/repos/keys/#get-a-deploy-key
   * @param {number} id - the id of the deploy key
   * @param {Requestable.callback} cb - will receive the details of the deploy key
   * @return {Promise} - the promise for the http request
   */
  getKey(id, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/keys/${id}`,
      null,
      cb,
    );
  }

  /**
   * Add a new deploy key to the repository
   * @see https://developer.github.com/v3/repos/keys/#add-a-new-deploy-key
   * @param {Object} options - the configuration describing the new deploy key
   * @param {Requestable.callback} cb - will receive the new deploy key
   * @return {Promise} - the promise for the http request
   */
  createKey(options, cb) {
    return this._request('POST', `/repos/${this.__fullname}/keys`, options, cb);
  }

  /**
   * Delete a deploy key
   * @see https://developer.github.com/v3/repos/keys/#remove-a-deploy-key
   * @param {number} id - the id of the deploy key to be deleted
   * @param {Requestable.callback} cb - will receive true if the call is successful
   * @return {Promise} - the promise for the http request
   */
  deleteKey(id, cb) {
    return this._request(
      'DELETE',
      `/repos/${this.__fullname}/keys/${id}`,
      null,
      cb,
    );
  }

  /**
   * Delete a file from a branch
   * @see https://developer.github.com/v3/repos/contents/#delete-a-file
   * @param {string} branch - the branch to delete from, or the default branch if not specified
   * @param {string} path - the path of the file to remove
   * @param {Requestable.callback} cb - will receive the commit in which the delete occurred
   * @return {Promise} - the promise for the http request
   */
  deleteFile(branch, path, cb) {
    return this.getSha(branch, path).then((response) => {
      const deleteCommit = {
        message: `Delete the file at '${path}'`,
        sha: response.data.sha,
        branch,
      };
      return this._request(
        'DELETE',
        `/repos/${this.__fullname}/contents/${path}`,
        deleteCommit,
        cb,
      );
    });
  }

  /**
   * Change all references in a repo from oldPath to new_path
   * @param {string} branch - the branch to carry out the reference change, or the default branch if not specified
   * @param {string} oldPath - original path
   * @param {string} newPath - new reference path
   * @param {Requestable.callback} cb - will receive the commit in which the move occurred
   * @return {Promise} - the promise for the http request
   */
  move(branch, oldPath, newPath, cb) {
    let oldSha;
    return this.getRef(`heads/${branch}`)
      .then(({ data: { object } }) =>
        this.getTree(`${object.sha}?recursive=true`),
      )
      .then(({ data: { tree, sha } }) => {
        oldSha = sha;
        let newTree = tree.map((ref) => {
          if (ref.path === oldPath) {
            ref.path = newPath;
          }
          if (ref.type === 'tree') {
            delete ref.sha;
          }
          return ref;
        });
        return this.createTree(newTree);
      })
      .then(({ data: tree }) =>
        this.commit(oldSha, tree.sha, `Renamed '${oldPath}' to '${newPath}'`),
      )
      .then(({ data: commit }) =>
        this.updateHead(`heads/${branch}`, commit.sha, true, cb),
      );
  }

  /**
   * Write a file to the repository
   * @see https://developer.github.com/v3/repos/contents/#update-a-file
   * @param {string} branch - the name of the branch
   * @param {string} path - the path for the file
   * @param {string} content - the contents of the file
   * @param {string} message - the commit message
   * @param {Object} [options] - commit options
   * @param {Object} [options.author] - the author of the commit
   * @param {Object} [options.commiter] - the committer
   * @param {boolean} [options.encode] - true if the content should be base64 encoded
   * @param {Requestable.callback} cb - will receive the new commit
   * @return {Promise} - the promise for the http request
   */
  writeFile(branch, path, content, message, options, cb) {
    options = options || {};
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    let filePath = path ? encodeURI(path) : '';
    let shouldEncode = options.encode !== false;
    let commit = {
      branch,
      message,
      author: options.author,
      committer: options.committer,
      content: shouldEncode ? Base64.encode(content) : content,
    };

    return this.getSha(branch, filePath).then(
      (response) => {
        commit.sha = response.data.sha;
        return this._request(
          'PUT',
          `/repos/${this.__fullname}/contents/${filePath}`,
          commit,
          cb,
        );
      },
      () => {
        return this._request(
          'PUT',
          `/repos/${this.__fullname}/contents/${filePath}`,
          commit,
          cb,
        );
      },
    );
  }

  /**
   * Check if a repository is starred by you
   * @see https://developer.github.com/v3/activity/starring/#check-if-you-are-starring-a-repository
   * @param {Requestable.callback} cb - will receive true if the repository is starred and false if the repository
   *                                  is not starred
   * @return {Promise} - the promise for the http request {Boolean} [description]
   */
  isStarred(cb) {
    return this._request204or404(`/user/starred/${this.__fullname}`, null, cb);
  }

  /**
   * Star a repository
   * @see https://developer.github.com/v3/activity/starring/#star-a-repository
   * @param {Requestable.callback} cb - will receive true if the repository is starred
   * @return {Promise} - the promise for the http request
   */
  star(cb) {
    return this._request('PUT', `/user/starred/${this.__fullname}`, null, cb);
  }

  /**
   * Unstar a repository
   * @see https://developer.github.com/v3/activity/starring/#unstar-a-repository
   * @param {Requestable.callback} cb - will receive true if the repository is unstarred
   * @return {Promise} - the promise for the http request
   */
  unstar(cb) {
    return this._request(
      'DELETE',
      `/user/starred/${this.__fullname}`,
      null,
      cb,
    );
  }

  /**
   * Create a new release
   * @see https://developer.github.com/v3/repos/releases/#create-a-release
   * @param {Object} options - the description of the release
   * @param {Requestable.callback} cb - will receive the newly created release
   * @return {Promise} - the promise for the http request
   */
  createRelease(options, cb) {
    return this._request(
      'POST',
      `/repos/${this.__fullname}/releases`,
      options,
      cb,
    );
  }

  /**
   * Edit a release
   * @see https://developer.github.com/v3/repos/releases/#edit-a-release
   * @param {string} id - the id of the release
   * @param {Object} options - the description of the release
   * @param {Requestable.callback} cb - will receive the modified release
   * @return {Promise} - the promise for the http request
   */
  updateRelease(id, options, cb) {
    return this._request(
      'PATCH',
      `/repos/${this.__fullname}/releases/${id}`,
      options,
      cb,
    );
  }

  /**
   * Get information about all releases
   * @see https://developer.github.com/v3/repos/releases/#list-releases-for-a-repository
   * @param {Requestable.callback} cb - will receive the release information
   * @return {Promise} - the promise for the http request
   */
  listReleases(cb) {
    return this._request('GET', `/repos/${this.__fullname}/releases`, null, cb);
  }

  /**
   * Get information about a release
   * @see https://developer.github.com/v3/repos/releases/#get-a-single-release
   * @param {string} id - the id of the release
   * @param {Requestable.callback} cb - will receive the release information
   * @return {Promise} - the promise for the http request
   */
  getRelease(id, cb) {
    return this._request(
      'GET',
      `/repos/${this.__fullname}/releases/${id}`,
      null,
      cb,
    );
  }

  /**
   * Delete a release
   * @see https://developer.github.com/v3/repos/releases/#delete-a-release
   * @param {string} id - the release to be deleted
   * @param {Requestable.callback} cb - will receive true if the operation is successful
   * @return {Promise} - the promise for the http request
   */
  deleteRelease(id, cb) {
    return this._request(
      'DELETE',
      `/repos/${this.__fullname}/releases/${id}`,
      null,
      cb,
    );
  }

  /**
   * Merge a pull request
   * @see https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button
   * @param {number|string} number - the number of the pull request to merge
   * @param {Object} options - the merge options for the pull request
   * @param {Requestable.callback} [cb] - will receive the merge information if the operation is successful
   * @return {Promise} - the promise for the http request
   */
  mergePullRequest(number, options, cb) {
    return this._request(
      'PUT',
      `/repos/${this.__fullname}/pulls/${number}/merge`,
      options,
      cb,
    );
  }

  /**
   * Get information about all projects
   * @see https://developer.github.com/v3/projects/#list-repository-projects
   * @param {Requestable.callback} [cb] - will receive the list of projects
   * @return {Promise} - the promise for the http request
   */
  listProjects(cb) {
    return this._requestAllPages(
      `/repos/${this.__fullname}/projects`,
      {
        AcceptHeader: 'inertia-preview',
      },
      cb,
    );
  }

  /**
   * Create a new project
   * @see https://developer.github.com/v3/projects/#create-a-repository-project
   * @param {Object} options - the description of the project
   * @param {Requestable.callback} cb - will receive the newly created project
   * @return {Promise} - the promise for the http request
   */
  createProject(options, cb) {
    options = options || {};
    options.AcceptHeader = 'inertia-preview';
    return this._request(
      'POST',
      `/repos/${this.__fullname}/projects`,
      options,
      cb,
    );
  }
}

export default Repository;
