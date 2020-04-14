//jshint ignore:start

function Gists(...agrs) {
  import( /* webpackChunkName: "gists" */ './gists.include')
    .then(res => {
      const Gists = res;
      Gists(...agrs);
    });
}

export default Gists;