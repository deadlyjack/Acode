function Gists(...agrs) {
  import(/* webpackChunkName: "gists" */ './gists.include').then((res) => {
    const Gists = res.default;
    Gists(...agrs);
  });
}

export default Gists;
