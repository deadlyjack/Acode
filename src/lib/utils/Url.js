import path from "./path";

export default {

  /**
   * Returns basename from a url eg. 'index.html' from 'fpt://localhost/foo/bar/index.html'
   * @param {string} url 
   */
  basename(url) {
    if (url.endsWith("/")) url = url.slice(0, -1);
    return this.pathname(url).split('/').pop();
  },
  extname(url) {
    let {
      url: uri,
      query
    } = this.parse(url);
    url = uri;
    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || "";
    if (protocol) url = url.replace(new RegExp('^' + protocol), '');
    return path.extname(url);
  },
  /**
   * 
   * @param  {...string} pathnames 
   */
  join(...pathnames) {
    if (pathnames.length < 2) throw new Error("Required at least two parameters");

    let {
      url,
      query
    } = this.parse(pathnames[0]);
    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || "";
    if (protocol) url = url.replace(new RegExp('^' + protocol), '');

    pathnames[0] = url;

    return protocol + path.join(...pathnames) + query;
  },
  /**
   * Make url safe by encoding url components
   * @param {string} url 
   */
  safe(url) {
    let {
      url: uri,
      query
    } = this.parse(url);
    url = uri;
    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || "";
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

    if (typeof url !== "string" || !this.PROTOCOL_PATTERN.test(url)) throw new Error("Invalid URL string");

    url = url.split('?')[0];
    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || "";
    if (protocol) url = url.replace(new RegExp('^' + protocol), '');

    if (protocol !== 'file:///')
      return "/" + url.split('/').slice(1).join('/');

    return "/" + url;
  },

  /**
   * Returns dirname from url eg. 'ftp://localhost/foo/' 'ftp://localhost/foo/bar'
   * @param {string} url 
   */
  dirname(url) {
    if (typeof url !== "string") throw new Error("URL must be string");

    const urlObj = this.parse(url);
    url = urlObj.url;

    if (url.endsWith('/')) url = url.slice(0, -1);
    return [...url.split('/').slice(0, -1), ''].join('/') + urlObj.query;
  },

  /**
   * Parse given url into url and query
   * @param {string} url 
   * @returns {URLObject}
   */
  parse(url) {
    const [uri, query = ""] = url.split(/(?=\?)/);
    return {
      url: uri,
      query
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
    let {
      protocol,
      hostname,
      username,
      password,
      path,
      port,
      query
    } = urlObj;

    const enc = str => encodeURIComponent(str);

    if (!protocol || !hostname) throw new Error("Cannot formate url. Missing 'protocol' and 'hostname'.");

    let string = `${protocol}//`;

    if (username && password) string += `${enc(username)}:${enc(password)}@`;
    else if (username) string += `${username}@`;

    string += hostname;

    if (port) string += `:${port}`;

    if (path) {
      if (!path.startsWith('/')) path = '/' + path;

      string += path;
    }

    if (query && typeof query === "object") {

      string += '?';

      for (let key in query)
        string += `${enc(key)}=${enc(query[key])}&`;

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
    return (/^([a-z]+:)\/\/\/?/i.exec(url) || [])[1] || "";
  },
  hidePassword(url) {
    const urlObj = new URL(url);
    if (urlObj.protocol === "file:") {
      return url;
    } else {
      return `${urlObj.origin}${urlObj.pathname}`;
    }
  },
  PROTOCOL_PATTERN: /^[a-z]+:\/\/\/?/i
};