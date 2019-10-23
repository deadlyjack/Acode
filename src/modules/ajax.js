/**
 * 
 * @param {object} [options] 
 * @param {string} [options.url] 
 * @param {string} [options.method]  
 * @param {object} [options.data]  
 * @param {"html"|"json"|"svg"|"text"|"xml"|"arraybuffer"|"document"} [options.responseType] 
 * @param {"application/json"|"application/x-www-form-urlencoded"} [options.contentType] 
 * @param {function(response):void} [options.onsuccess] 
 * @param {function(response):void} [options.onload] 
 * @param {function(xhr):void} [options.xhr] 
 * @param {function(err):void} [options.onerror]
 * @param {boolean} [options.serialize = true]
 * @returns {Promise}
 */
function ajax(options) {
    const xhr = getHTTP();

    return new Promise((resolve, reject) => {
        options = options || {};

        const contentType = options.contentType || 'application/x-www-form-urlencoded';
        const method = options.method === undefined ? 'get' : options.method;
        const url = options.url;

        options.responseType = options.responseType === undefined ? 'json' : options.responseType;
        options.serialize = options.serialize === undefined ? true : options.serialize;
        options.onsuccess = options.onsuccess || callback;
        options.onload = options.onload || callback;
        options.onerror = options.onerror || callback;

        const data = (options.serialize && options.data) ? serialize(options.data) : options.data;

        xhr.open(method, url, true);
        if (options.xhr) options.xhr(xhr);
        xhr.responseType = options.responseType;
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.send(data);

        xhr.addEventListener('readystatechange', function () {

            if (xhr.readyState !== 4) return;

            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                resolve(xhr);
            } else {
                reject(xhr);
            }

        });
    });

    /**
     * @returns {XMLHttpRequest}
     */
    function getHTTP() {
        if (XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }

    /**
     * @param {object} data 
     */
    function serialize(data) {
        const keys = Object.keys(data);
        let serial = "";
        keys.map((key, index) => {
            serial += key + (data[key] ? ("=" + data[key]) : '') + (index < keys.length - 1 ? '&' : '');
        });

        return encodeURI(serial);
    }

    function callback(param) {
        return param;
    }
}

export default ajax;