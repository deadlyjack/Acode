const SIDRBAR_APPS_LAST_SECTION = 'sidebarAppslastSection';
/**@type {HTMLElement} */
let $sidebar = null;
/**@type {HTMLElement} */
let $apps = null;
/**@type {string} */
let currentSection = localStorage.getItem(SIDRBAR_APPS_LAST_SECTION);

/**@type {Map<string, HTMLElement>} */
const contents = new Map();
/**@type {Map<string, (container:HTMLElement)=>void>} */
const onselect = new Map();

/**
 * @param {string} icon icon of the app
 * @param {string} id id of the app
 * @param {HTMLElement} el element to show in sidebar
 * @param {string} title title of the app
 * @param {(container:HTMLElement)=>void} initFunction
 * @param {boolean} prepend weather to show this app at the top of the sidebar or not
 * @param {(container:HTMLElement)=>void} onseleted
 * @returns {void}
 */
function add(icon, id, title, initFunction, prepend, onseleted) {
  const container = <div className='container'></div>;
  contents.set(id, container);
  if (onseleted) onselect.set(id, onseleted);
  if (!currentSection) currentSection = id;

  if (currentSection === id) {
    onselect.get(id)?.(container);
    $sidebar.replaceChild(container, getContainer());
  }

  if (prepend) {
    $apps.prepend(
      <Icon icon={icon} id={id} title={title} />,
    );
  } else {
    $apps.append(
      <Icon icon={icon} id={id} title={title} />,
    );
  }


  if (initFunction) {
    initFunction(container);
  }
}

/**
 * Removes a sidebar app with the given ID.
 * @param {string} id - The ID of the sidebar app to remove.
 * @returns {void}
 */
function removeApp(id) {
  if (!contents.has(id)) return;

  const appIcon = $sidebar.get(`.icon#${id}`);
  appIcon?.remove();

  const container = contents.get(id);
  container?.remove();
  contents.delete(id);

  if (currentSection !== id) return;

  const firstApp = $sidebar.querySelector('.icon');
  if (firstApp) {
    const newSectionId = firstApp.id;
    const newContainer = contents.get(newSectionId);

    currentSection = newSectionId;
    localStorage.setItem(SIDRBAR_APPS_LAST_SECTION, newSectionId);
    $sidebar.replaceChild(newContainer, getContainer());
    firstApp.classList.add('active');
    return;
  }

  currentSection = null;
  localStorage.removeItem(SIDRBAR_APPS_LAST_SECTION);
  getContainer()?.remove();
}

/**
 * Initialize sidebar apps
 * @param {HTMLElement} $el 
 */
function init($el) {
  $sidebar = $el;
  $apps = $sidebar.get('.apps');
}

async function loadApps() {
  add(...(await import('./files')).default);
  add(...(await import('./searchInFiles')).default);
  add(...(await import('./extensions')).default);
}

/**
 * 
 * @param {object} param0 
 * @param {string} param0.icon
 * @param {string} param0.id
 * @param {string} param0.title
 * @returns {HTMLElement}
 */
function Icon({ icon, id, title }) {
  const onclick = function () {
    localStorage.setItem(SIDRBAR_APPS_LAST_SECTION, id);
    const currentContent = getContainer();
    const content = contents.get(id);

    contents.set(currentSection, currentContent);
    currentSection = id;

    $sidebar.replaceChild(content, currentContent);
    $sidebar.get('.apps .active')
      .classList.remove('active');

    this.classList.add('active');
    onselect.get(id)?.(content);
  };
  return <span
    onclick={onclick}
    title={title}
    className={`icon ${icon} ${id === currentSection ? 'active' : ''}`}
  ></span>;
}

function get(id) {
  return contents.get(id);
}

function getContainer() {
  return $sidebar.get('.container');
}

export default {
  init,
  add,
  removeApp,
  get,
  loadApps,
};
