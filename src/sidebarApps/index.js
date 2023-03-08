/**@type {HTMLElement} */
let $sidebar = null;
/**@type {HTMLElement} */
let $apps = null;
/**@type {string} */
let currentSection = null;

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
function add(icon, id, title, initFunction) {
  const container = <div className='container'></div>;
  if (!currentSection) {
    currentSection = id;
    $sidebar.replaceChild(container, getContainer());
  }
  contents.set(id, container);
  $apps.append(
    <Icon icon={icon} id={id} title={title} />,
  );

  if (initFunction) {
    initFunction(container);
  }
}

async function init($el) {
  $sidebar = $el;
  $apps = $sidebar.get('.apps');

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
};
