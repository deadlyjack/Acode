import URLParse from 'url-parse';
import path from './Path';
import Uri from './Uri';

export default {
  /**
   * Returns basename from a url eg. 'index.html' from 'ftp://localhost/foo/bar/index.html'
   * @param {string} url
   */
  basename(url) {
    url = this.parse(url).url;
    const protocol = this.getProtocol(url);
    if (protocol === 'content:') {
      try {
        let { rootUri, docId, isFileUri } = Uri.parse(url);

        if (isFileUri) return this.basename(rootUri);

        if (docId.endsWith('/')) docId = docId.slice(0, -1);
        docId = docId.split(':').pop();
        return this.pathname(docId).split('/').pop();
      } catch (error) {
        return null;
      }
    } else {
      if (url.endsWith('/')) url = url.slice(0, -1);
      return this.pathname(url).split('/').pop();
    }
  },

  /**
   * Checks if given urls are same or not
   * @param  {...String} urls 
   */
  areSame(...urls) {
    let firstUrl = urls[0];
    if (firstUrl.endsWith('/')) firstUrl = firstUrl.slice(0, -1);
    return urls.every(url => {
      if (url.endsWith('/')) url = url.slice(0, -1);
      return firstUrl === url;
    });
  },

  /**
   *
   * @param {String} url
   * returns the extension of the path, from the last occurrence of the . (period)
   * character to end of string in the last portion of the path.
   * If there is no . in the last portion of the path, or if there are no .
   * characters other than the first character of the basename of path (see path.basename()),
   * an empty string is returned.
   */
  extname(url) {
    const name = this.basename(url);
    if (name) return path.extname(name);
    else return null;
  },
  /**
   *
   * @param  {...string} pathnames
   * @returns {String}
   */
  join(...pathnames) {
    if (pathnames.length < 2)
      throw new Error('Join(), requires atleast two parameters');

    let { url, query } = this.parse(pathnames[0]);

    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || '';

    if (protocol === 'content://') {
      try {
        if (pathnames[1].startsWith('/')) pathnames[1] = pathnames[1].slice(1);
        const contentUri = Uri.parse(url);
        const protocol = this.getProtocol(contentUri.rootUri);
        if (protocol === 'content:') {
          let [root, pathname] = contentUri.docId.split(':');
          const newDocId = path.join(pathname, ...pathnames.slice(1));
          if (/^content:\/\/com.termux/.test(url)) {
            return `${contentUri.rootUri}::${root}${newDocId}${query}`;
          }
          return `${contentUri.rootUri}::${root}:${newDocId}${query}`;
        } else {
          return this.join(contentUri.rootUri, ...pathnames.slice(1));
        }
      } catch (error) {
        return null;
      }
    } else if (protocol) {
      url = url.replace(new RegExp('^' + protocol), '');
      pathnames[0] = url;
      return protocol + path.join(...pathnames) + query;
    } else {
      return path.join(url, ...pathnames.slice(1)) + query;
    }
  },
  /**
   * Make url safe by encoding url components
   * @param {string} url
   */
  safe(url) {
    let { url: uri, query } = this.parse(url);
    url = uri;
    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || '';
    if (protocol) url = url.replace(new RegExp('^' + protocol), '');
    const parts = url.split('/').map((part, i) => {
      if (i === 0) return part;
      return fixedEncodeURIComponent(part);
    });
    return protocol + parts.join('/') + query;

    function fixedEncodeURIComponent(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
    }
  },
  /**
   * Gets pathname from url eg. gets '/foo/bar' from 'ftp://myhost.com/foo/bar'
   * @param {string} url
   */
  pathname(url) {
    if (typeof url !== 'string' || !this.PROTOCOL_PATTERN.test(url)) return url;

    url = url.split('?')[0];
    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || '';

    if (protocol === 'content://') {
      try {
        const { rootUri, docId, isFileUri } = Uri.parse(url);
        if (isFileUri) return this.pathname(rootUri);
        else return '/' + (docId.split(':')[1] || docId);
      } catch (error) {
        return null;
      }
    } else {
      if (protocol) url = url.replace(new RegExp('^' + protocol), '');

      if (protocol !== 'file:///')
        return '/' + url.split('/').slice(1).join('/');

      return '/' + url;
    }
  },

  /**
   * Returns dirname from url eg. 'ftp://localhost/foo/'  from 'ftp://localhost/foo/bar'
   * @param {string} url
   */
  dirname(url) {
    if (typeof url !== 'string') throw new Error('URL must be string');

    const urlObj = this.parse(url);
    url = urlObj.url;
    const protocol = this.getProtocol(url);

    if (protocol === 'content:') {
      try {
        let { rootUri, docId, isFileUri } = Uri.parse(url);

        if (isFileUri) return this.dirname(rootUri);
        else {
          if (docId.endsWith('/')) docId = docId.slice(0, -1);
          docId = [...docId.split('/').slice(0, -1), ''].join('/');
          return Uri.format(rootUri, docId);
        }
      } catch (error) {
        return null;
      }
    } else {
      if (url.endsWith('/')) url = url.slice(0, -1);
      return [...url.split('/').slice(0, -1), ''].join('/') + urlObj.query;
    }
  },

  /**
   * Parse given url into url and query
   * @param {string} url
   * @returns {URLObject}
   */
  parse(url) {
    const [uri, query = ''] = url.split(/(?=\?)/);
    return {
      url: uri,
      query,
    };
  },

  /**
   * Formate Url object to string
   * @param {object} urlObj
   * @param {"ftp:"|"sftp:"|"http:"|"https:"} urlObj.protocol
   * @param {string|number} urlObj.hostname
   * @param {string} [urlObj.path]
   * @param {string} [urlObj.username]
   * @param {string} [urlObj.password]
   * @param {string|number} [urlObj.port]
   * @param {object} [urlObj.query]
   */
  formate(urlObj) {
    let { protocol, hostname, username, password, path, port, query } = urlObj;

    const enc = (str) => encodeURIComponent(str);

    if (!protocol || !hostname)
      throw new Error("Cannot formate url. Missing 'protocol' and 'hostname'.");

    let string = `${protocol}//`;

    if (username && password) string += `${enc(username)}:${enc(password)}@`;
    else if (username) string += `${username}@`;

    string += hostname;

    if (port) string += `:${port}`;

    if (path) {
      if (!path.startsWith('/')) path = '/' + path;

      string += path;
    }

    if (query && typeof query === 'object') {
      string += '?';

      for (let key in query) string += `${enc(key)}=${enc(query[key])}&`;

      string = string.slice(0, -1);
    }

    return string;
  },
  /**
   * Returns protocol of a url e.g. 'ftp:' from 'ftp://localhost/foo/bar'
   * @param {string} url
   * @returns {"ftp:"|"sftp:"|"http:"|"https:"}
   */
  getProtocol(url) {
    return (/^([a-z]+:)\/\/\/?/i.exec(url) || [])[1] || '';
  },
  /**
   *
   * @param {string} url
   * @returns {string}
   */
  hidePassword(url) {
    const { protocol, username, hostname, pathname } = URLParse(url);
    if (protocol === 'file:') {
      return url;
    } else {
      return `${protocol}//${username}@${hostname}${pathname}`;
    }
  },
  PROTOCOL_PATTERN: /^[a-z]+:\/\/\/?/i,
};
