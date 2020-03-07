import tag from 'html-tag-js';

/**
 * @typedef {object} contextMenuObj
 * @property {function():void} hide hides the menu
 * @property {function():void} show shows the page
 */

/**
 * 
 * @param {object} [opts]
 * @param {number} [opts.left] 
 * @param {number} [opts.top] 
 * @param {number} [opts.bottom] 
 * @param {number} [opts.right] 
 * @param {string} [opts.transformOrigin] 
 * @param {HTMLElement} [opts.toggle] 
 * @param {function():void} [opts.onshow] 
 * @param {function():void} [opts.onhide] 
 * @returns {HTMLElement & contextMenuObj}
 */
function contextMenu(innerHTML, opts) {
    if (!opts && typeof innerHTML === 'object') {
        opts = innerHTML;
        innerHTML = null;
    } else if (!opts) {
        opts = {};
    }

    const $el = tag('ul', {
        className: 'context-menu scroll',
        innerHTML: innerHTML || '',
        style: {
            top: opts.top || 'auto',
            left: opts.left || 'auto',
            right: opts.right || 'auto',
            bottom: opts.bottom || 'auto',
            transformOrigin: opts.transformOrigin || null
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
        $el.onshow();
        $el.classList.remove('hide');

        if (opts.innerHTML) {
            $el.innerHTML = opts.innerHTML();
        }

        if (opts.toggle) {

            const client = opts.toggle.getBoundingClientRect();
            if (!opts.top && !opts.bottom) $el.style.top = client.top + 'px';
            if (!opts.left && !opts.right) $el.style.right = (innerWidth - client.right) + 'px';

        }

        document.body.append($el, mask);
    }

    function hide() {
        actionStack.remove('main-menu');
        $el.onhide();
        $el.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(mask);
            document.body.removeChild($el);
        }, 100);
    }

    function toggle() {
        if ($el.parentElement) return hide();
        show();
    }

    if (opts.toggle) opts.toggle.addEventListener('click', toggle);

    $el.hide = hide;
    $el.show = show;
    $el.onshow = opts.onshow || (() => {});
    $el.onhide = opts.onhide || (() => {});

    return $el;
}


export default contextMenu;