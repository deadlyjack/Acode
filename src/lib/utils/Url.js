import path from "./path";

export default {
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

    return protocol + path.join(...pathnames).slice(1) + query;
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
   * 
   * @param {string} url 
   */
  pathname(url) {

    if (typeof url !== "string" || !this.PROTOCOL_PATTERN.test(url)) throw new Error("Invalid URL string");

    url = url.split('?')[0];
    const protocol = (this.PROTOCOL_PATTERN.exec(url) || [])[0] || "";
    if (protocol) url = url.replace(new RegExp('^' + protocol), '');
    return "/" + url.split('/').slice(1).join('/') || "/";
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

  PROTOCOL_PATTERN: /^[a-z]+:\/\/\/?/i
};