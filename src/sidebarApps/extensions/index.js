import './style.scss';

import collapsableList from '../../components/collapsableList';
import Url from '../../utils/Url';
import fsOperation from '../../fileSystem';
import helpers from '../../utils/helpers';
import plugin from '../../pages/plugin';
import constants from '../../lib/constants';

/** @type {HTMLElement} */
let $installed = null;
/** @type {HTMLElement} */
let $explor = null;
/** @type {HTMLElement} */
let container = null;
/** @type {HTMLElement} */
let $searchResult = null;

let searchTimeout = null;
let installedPlugins = [];

export default [
  'extension',
  'extensions',
  strings['plugins'],
  (/**@type {HTMLElement} */ el) => {
    container = el;
    container.classList.add('extensions');
    container.content = <div className='header'>
      <span className='title'>{strings['plugins']}</span>
      <input oninput={searchPlugin} type='search' name='search-ext' placeholder='Search' />
    </div>;

    if (!$searchResult) {
      $searchResult = <ul className='list search-result'></ul>;
      container.append($searchResult);
    }

    if (!$explor) {
      $explor = collapsableList(strings['explore'], true);
      $explor.ontoggle = loadExplore;
      container.append($explor);
    }

    if (!$installed) {
      $installed = collapsableList(strings['installed']);
      $installed.ontoggle = loadInstalled;
      container.append($installed);
    }
  }
];

async function searchPlugin() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    $searchResult.content = '';
    const status = helpers.checkAPIStatus();
    if (!status) {
      $searchResult.content = <span className='error'>{strings['api_error']}</span>;
      return;
    }

    const query = this.value;
    if (!query) return;

    try {
      $searchResult.classList.add('loading');
      const plugins = await fsOperation(
        Url.join(constants.API_BASE, `plugins?name=${query}`),
      ).readFile('json');

      installedPlugins = await listInstalledPluings();
      $searchResult.content = plugins.map(ListItem);
      updateHeight($searchResult);
    } catch (error) {
      $searchResult.content = <span className='error'>{strings['error']}</span>;
    } finally {
      $searchResult.classList.remove('loading');
    }
  }, 500);
}


async function loadInstalled() {
  if (this.collapsed) return;

  const plugins = await listInstalledPluings();
  $installed.$ul.content = plugins.map(ListItem);
  updateHeight($installed);
}


async function loadExplore() {
  if (this.collapsed) return;

  const status = helpers.checkAPIStatus();
  if (!status) {
    $explor.$ul.content = <span className='error'>{strings['api_error']}</span>;
    return;
  }

  try {
    startLoading($explor);
    const plugins = await fsOperation(
      Url.join(constants.API_BASE, 'plugins?explore=random'),
    ).readFile('json');

    installedPlugins = await listInstalledPluings();
    $explor.$ul.content = plugins.map(ListItem);
    updateHeight($explor);
  } catch (error) {
    $explor.$ul.content = <span className='error'>{strings['error']}</span>;
  } finally {
    stopLoading($explor);
  }
}

async function listInstalledPluings() {
  const plugins = await Promise.all(
    (await fsOperation(PLUGIN_DIR).lsDir())
      .map(async (item) => {
        const id = Url.basename(item.url);
        const url = Url.join(item.url, 'plugin.json');
        const plugin = await fsOperation(url).readFile('json');
        const iconUrl = getLocalRes(id, 'icon.png');
        plugin.icon = await helpers.toInternalUri(iconUrl);
        plugin.installed = true;
        return plugin;
      })
  );
  return plugins;
}

function startLoading($list) {
  $list.$title.classList.add('loading');
}

function stopLoading($list) {
  $list.$title.classList.remove('loading');
}

/**
 * Update the height of the element
 * @param {HTMLElement} $el 
 */
function updateHeight($el) {
  const divs = container.getAll(':scope > div');
  let height = 0;
  divs.forEach((div) => {
    if (div === $el) return;
    div.collapse?.();
    div.style.removeProperty('height');
    height += div.offsetHeight;
  });

  $el.style.maxHeight = `calc(100% - ${height}px)`;
}

function getLocalRes(id, name) {
  return Url.join(PLUGIN_DIR, id, name);
}

function ListItem({ icon, name, id, version, installed }) {
  if (installed === undefined) {
    installed = !!installedPlugins.find(({ id: _id }) => _id === id);
  }
  const $el = <div className='tile' data-pluing-id={id}>
    <span className='icon' style={{ backgroundImage: `url(${icon})` }}></span>
    <span className='text sub-text' data-subtext={`v${version}${installed ? ` • ${strings['installed']}` : ''}`}>{name}</span>
  </div>;

  $el.onclick = () => {
    plugin({ id, installed }, () => {
      const $item = () => <ListItem icon={icon} name={name} id={id} version={version} installed={true} />;
      if ($installed.contains($el)) $installed.$ul?.append($item());
      if ($explor.contains($el)) $explor.$ul?.replaceChild($item(), $el);
      if ($searchResult.contains($el)) $searchResult?.replaceChild($item(), $el);
    }, () => {
      $el.remove();
    });
  }

  return $el;
}
