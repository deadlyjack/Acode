/**
 *
 * @param {object} options
 */
function GitHub(options) {
  import(/* webpackChunkName: "gitHub" */ './gitHub.include').then((res) => {
    const GitHub = res.default;
    GitHub(options);
  });
}

export default GitHub;
