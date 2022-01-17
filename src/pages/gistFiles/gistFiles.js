/**
 *
 * @param {Gist} gist
 */
function GistFiles(gist) {
  import(/* webpackChunkName: "gistFiles" */ './gistFiles.include').then(
    (res) => {
      const GistFiles = res.default;
      GistFiles(gist);
    },
  );
}

export default GistFiles;
