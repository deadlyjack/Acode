//jshint ignore:start
/**
 * 
 * @param {"file"|"dir"} [type='file']
 * @param {function(string):boolean} checkFile button text or function to check extension
 * @param {string} info 
 * @param {boolean} doesOpenLast
 */
function FileBrowser(type, checkFile, info, doesOpenLast, ...args) {
    return new Promise((resolve, reject) => {
        import( /* webpackChunkName: "fileBrowser" */ './fileBrowser.include')
            .then(res => {
                const FileBrowser = res.default;
                FileBrowser(type, checkFile, info, doesOpenLast, ...args)
                    .then(resolve)
                    .catch(reject);
            });
    });
}

export default FileBrowser;