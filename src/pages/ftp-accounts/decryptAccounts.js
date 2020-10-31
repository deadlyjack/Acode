import helpers from '../../lib/utils/helpers';

/**
 * 
 * @param {Array<FTPAccount>} accounts 
 */
function decryptAccounts(accounts) {
  const credentials = helpers.credentials;
  const temp = [];
  if (Array.isArray(accounts)) accounts.map(account => {
    let {
      name,
      username,
      password,
      hostname,
      port,
      id,
      security,
      mode,
      path
    } = account;

    username = credentials.decrypt(username);
    password = credentials.decrypt(password);
    hostname = credentials.decrypt(hostname);
    port = credentials.decrypt(port);

    temp.push({
      username,
      password,
      hostname,
      port,
      name: name ? name : `${username}@${hostname}`,
      id,
      security,
      mode,
      path
    });
  });

  return temp;
}

export default decryptAccounts;