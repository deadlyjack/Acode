import tag from 'html-tag-js';

/**
 * @typedef {object} SideBar
 * @property {function():void} hide
 * @property {function():void} toggle
 * @property {function():void} onshow
 */

/**
 * 
 * @param {HTMLElement} [activator]
 * @param {HTMLElement} [toggler]
 * @returns {HTMLElement & SideBar}
 */
function sidenav(activator, toggler) {
    const parent = document.body;
    const el = tag('div', {
        id: 'sidenav'
    });
    const mask = tag('span', {
        className: 'mask',
        onclick: hide
    });
    const touch = {
        start: 0,
        total: 0,
        end: 0,
        target: null
    };
    let scrollPosition = 0;

    if (toggler) {
        toggler.addEventListener('click', toggle);
    }

    (activator || parent).addEventListener('touchstart', ontouchstart);

    function toggle() {
        if (el.activated) return hide();
        show();
    }

    function show() {
        el.onshow();
        el.activated = true;
        parent.append(el, mask);
        el.classList.add('show');
        document.ontouchstart = ontouchstart;

        el.scrollTop = scrollPosition;

        actionStack.push({
            id: 'sidenav',
            action: hideMaster
        });
    }

    function hide() {
        actionStack.remove('sidenav');
        hideMaster();
    }

    function hideMaster() {
        scrollPosition = el.scrollTop;
        el.style.transform = null;
        el.classList.remove('show');
        setTimeout(() => {
            el.activated = false;
            mask.remove();
            el.remove();
            activator.style.overflow = null;
        }, 300);
        document.ontouchstart = null;
        resetState();
    }

    /**
     * 
     * @param {TouchEvent} e 
     */
    function ontouchstart(e) {
        el.style.transition = 'none';
        touch.start = e.touches[0].clientX;
        touch.target = e.target;

        if (el.activated && e.target !== el && e.target !== mask) return;
        else if (!el.activated && touch.start > 10 || e.target === toggler) return;
        document.ontouchmove = ontouchmove;
        document.ontouchend = ontouchend;
    }

    /**
     * 
     * @param {TouchEvent} e 
     */
    function ontouchmove(e) {
        if (!el.isConnected) {
            parent.append(el, mask);
            el.scrollTop = scrollPosition;
            activator.style.overflow = 'hidden';
        }

        let width = el.getwidth();

        touch.end = e.touches[0].clientX;
        touch.total = touch.end - touch.start;

        if (!el.activated && touch.total < width && touch.start < 10) {
            el.style.transform = `translate3d(${-(width - touch.total)}px, 0, 0)`;
        } else if (touch.total < 0 && el.activated) {
            el.style.transform = `translate3d(${touch.total}px, 0, 0)`;
        }
    }

    /**
     * 
     * @param {TouchEvent} e 
     */
    function ontouchend(e) {
        if (e.target === mask && touch.total === 0) return;
        e.preventDefault();

        const threshold = el.getwidth() / 3;

        if ((el.activated && touch.total > -threshold) || (!el.activated && touch.total >= threshold)) {
            lclShow();
        } else if ((!el.activated && touch.total < threshold) || (el.activated && touch.total <= -threshold)) {
            hide();
        }


        function lclShow() {
            el.onshow();
            el.activated = true;
            el.style.transform = `translate3d(0, 0, 0)`;
            document.ontouchstart = ontouchstart;
            actionStack.remove('sidenav');
            actionStack.push({
                id: 'sidenav',
                action: hideMaster
            });
            resetState();
        }
    }

    function resetState() {
        touch.total = 0;
        touch.start = 0;
        touch.end = 0;
        touch.target = null;
        document.ontouchmove = null;
        document.ontouchend = null;
        el.style.transition = null;
    }

    el.getwidth = function () {
        el.width = el.width || el.getBoundingClientRect().width;
        return el.width;
    };

    el.hide = hide;
    el.toggle = toggle;
    el.onshow = () => {};

    return el;
}

export default sidenav;