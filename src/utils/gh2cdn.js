/**
 * Converts github url to jsdelivr cdn url
 * @param {string} url Github raw url
 */
export default function gh2cdn(url) {
  const regex = /^https:\/\/raw.githubusercontent.com\//;
  if (!regex.test(url)) return url;

  url = url.replace(regex, '');
  const parts = url.split('/');

  const [user, repo, branch, ...file] = parts;
  return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${file.join('/')}`;
}
