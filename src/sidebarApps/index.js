const SIDRBAR_APPS_LAST_SECTION = 'sidebarAppslastSection';
/**@type {HTMLElement} */
let $sidebar = null;
/**@type {HTMLElement} */
let $apps = null;
/**@type {string} */
let currentSection = localStorage.getItem(SIDRBAR_APPS_LAST_SECTION);

/**@type {Map<string, HTMLElement>} */
const contents = new Map();

/**
 * @param {string} icon
 * @param {string} id
 * @param {HTMLElement} el
 * @param {string} title
 * @param {(container:HTMLElement)=>void} initFunction
 * @returns {void}
 */
function add(icon, id, title, initFunction, prepend) {
  const container = <div className='container'></div>;
  contents.set(id, container);

  if (!currentSection) currentSection = id;

  if (currentSection === id) {
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

function init($el) {
  $sidebar = $el;
  $apps = $sidebar.get('.apps');
}

async function loadApps() {
  add(...(await import('./files')).default);
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
  get,
  loadApps,
};
