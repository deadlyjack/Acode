const path = {
  /**
 * Resolve the path eg.
```js
resolvePath('path/to/some/dir/', '../../dir') //returns 'path/to/dir'
```
 * @param {...string} paths 
 */
  resolve(...paths) {

    if (!paths.length) throw new Error("resolve(...path) : Arguments missing!")

    let resolved = [];

    paths.map(path => {

      const pathAr = path.split('/');
      if (!pathAr[0]) resolved = [];

      for (let dir of pathAr) {
        if (dir === '..') {
          if (resolved.length) resolved.pop();
        } else if (dir === '.') continue;
        else if (dir) resolved.push(dir);
      }

    });

    resolved.unshift('');

    return resolved.join('/');
  },
  /**
   * Joins the given number of paths
   * @param  {...string} paths 
   */
  join(...paths) {
    let res = paths.join('/');
    paths.map(path => {
      return this.resolve(path);
    });
    return this.resolve(res);
  },
  /**
 * Get path from full URI. eg.
 * ```js
    getPath("this/is/a/file.txt", "file.txt"); //'this/is/a/'
    getPath("this/is/a/file") //'this/is/a/'
 * ```
 * @param {string} fullname native url of the file
 * @param {string} [name] 
 */
  parent(fullname, name) {
    if (name) return fullname.replace(new RegExp(name + '$'), '');
    return fullname.split('/').slice(0, -1).join('/') + '/';
  },
  /**
   * Gets path name from path
   * @param {string} path 
   */
  name(path) {
    path = decodeURL(path);
    const ar = path.split('/');
    const last = ar.slice(-1)[0];
    if (!last) return ar.slice(-2)[0];
    return last;

    function decodeURL(url) {
      if (/%[0-9a-f]{2}/i.test(url)) {
        const newurl = decodeURI(url);
        if (url === newurl) return url;
        return decodeURL(newurl);
      }
      return url;
    }
  },
  /**
 * Subtracts the str2 from str1 if its in leading eg. 
 * ```js
  subtract("mystring", "my"); //'string'
  subtract("stringmy", "my"); //'stringmy'
 * ``` 
 *
 * @param {string} str1 string to subtract from
 * @param {string} str2 string to subtract
 */
  subtract(str1, str2) {
    return str1.replace(new RegExp("^" + str2), '');
  },
  /**
  * Checks if child uri is originated from root uri eg.
  * ```js
  isParent("file:///sdcard/", "file://sdcard/path/to/file") //true 
  isParent("file:///sdcard2/", "file://sdcard1/path/to/file") //false
  * ```
  * @param {string} root 
  * @param {string} child 
  */
  isParent(root, child) {
    return new RegExp("^" + root).test(child);
  }
};

export default path;