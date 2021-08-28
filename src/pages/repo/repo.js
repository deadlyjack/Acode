function Repo(owner, repoName) {
  import(/* webpackChunkName: "repo" */ './repo.include').then((res) => {
    const Repo = res.default;
    Repo(owner, repoName);
  });
}

export default Repo;
