//jshint ignore:start

function FtpAccounts() {
  import( /* webpackChunkName: "ftp-account" */ './ftp-accounts.include')
    .then(res => {
      const FtpAccounts = res.default;
      FtpAccounts();
    });
}

export default FtpAccounts;