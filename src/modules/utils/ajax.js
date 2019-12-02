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
 * @param {function} [options.onloadend]
 * @param {boolean} [options.response]
 * @param {function(xhr):void} [options.xhr] 
 * @param {function(err):void} [options.onerror]
 * @param {boolean} [options.serialize = true]
 * @returns {Promise<XMLHttpRequest>}
 */
function ajax(options) {
    const xhr = getHTTP();
    const response = options.response === undefined ? true : options.response;

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

        let data = options.data && serialize(options.data);

        if (options.data && contentType === 'application/json') {
            data = JSON.stringify(options.data);
        }

        xhr.open(method, url, true);
        if (options.xhr) options.xhr(xhr);
        xhr.responseType = options.responseType;
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.send(data);

        if (options.onloadend) {
            xhr.addEventListener('loadend', options.onloadend);
        }
        if (options.onload) {
            xhr.addEventListener('load', options.onload);
        }
        if (options.onerror) {
            xhr.addEventListener('error', options.onerror);
        }

        xhr.addEventListener('readystatechange', function () {

            if (xhr.readyState !== 4) return;

            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                if (options.onsuccess) {
                    options.onsuccess(xhr.response);
                }
                resolve(response ? xhr.response : xhr);
            } else {
                reject(response ? xhr.response : xhr);
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