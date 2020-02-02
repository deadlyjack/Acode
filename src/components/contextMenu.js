import tag from 'html-tag-js';

/**
 * @typedef {object} contextMenuObj
 * @property {function():void} hide hides the menu
 * @property {function():void} show shows the page
 */

/**
 * 
 * @param {object} [pos]
 * @param {number} [pos.left] 
 * @param {number} [pos.top] 
 * @param {number} [pos.bottom] 
 * @param {number} [pos.right] 
 * @param {string} [pos.transformOrigin] 
 * @param {HTMLElement} [pos.toggle] 
 * @param {function():void} [pos.onshow] 
 * @param {function():void} [pos.onhide] 
 * @returns {HTMLElement & contextMenuObj}
 */
function contextMenu(innerHTML, pos = {}) {
    const el = tag('ul', {
        className: 'context-menu scroll',
        innerHTML: innerHTML,
        style: {
            top: pos.top || 'auto',
            left: pos.left || 'auto',
            right: pos.right || 'auto',
            bottom: pos.bottom || 'auto',
            transformOrigin: pos.transformOrigin || null
        }
    });
    const mask = tag('span', {
        className: 'mask',
        ontouchstart: hide
    });

    function show() {
        actionStack.push({
            id: 'main-menu',
            action: hide
        });
        el.onshow();
        el.classList.remove('hide');
        document.body.append(el, mask);
    }

    function hide() {
        actionStack.remove('main-menu');
        el.onhide();
        el.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(mask);
            document.body.removeChild(el);
        }, 100);
    }

    function toggle() {
        if (el.parentElement) return hide();
        show();
    }

    if (pos.toggle) pos.toggle.addEventListener('click', toggle);

    el.hide = hide;
    el.show = show;
    el.onshow = pos.onshow || (() => {});
    el.onhide = pos.onhide || (() => {});

    return el;
}


export default contextMenu;