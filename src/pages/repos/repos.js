//jshint ignore:start

function Repos() {
  import( /* webpackChunkName: "repos" */ './repos.include')
    .then(res => {
      const Repos = res.default;
      Repos();
    });
}

export default Repos;