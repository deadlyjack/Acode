function GithubLogin() {
  import(/* webpackChunkName: "githublogin" */ './login.include').then(
    (res) => {
      const GithubLogin = res.default;
      GithubLogin();
    }
  );
}

export default GithubLogin;
