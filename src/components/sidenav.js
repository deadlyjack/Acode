import tag from 'html-tag-js';
import openFolder from '../lib/addFolder';

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
    let mode = innerWidth > 750 ? 'tab' : 'phone';
    const START_THRESHOLD = 20; //Point where to start swip
    const $el = tag('div', {
        id: 'sidenav',
        className: mode
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
    let width = 250,
        eventAddedFlag = 0,
        _innerWidth = innerWidth,
        isScrolling = true,
        $$ = [],
        timeout, flag = false;
    activator = activator || app;

    if (toggler)
        toggler.addEventListener('click', toggle);

    if (mode === 'phone')
        activator.addEventListener('touchstart', ontouchstart);

    window.addEventListener('resize', function () {
        if (_innerWidth !== innerWidth) {

            hide(true);
            _innerWidth = innerWidth;
            $el.classList.remove(mode);
            mode = innerWidth > 750 ? 'tab' : 'phone';
            $el.classList.add(mode);

            if (mode === 'phone' && !eventAddedFlag) {
                activator.addEventListener('touchstart', ontouchstart);
                eventAddedFlag = 1;
            } else if (eventAddedFlag) {
                activator.removeEventListener('touchstart', ontouchstart);
                eventAddedFlag = 0;
            }

            editorManager.controls.update();

        }
    });

    function toggle() {
        if ($el.activated) return hide(true);
        show();
    }

    function show() {
        $el.activated = true;

        if (mode === 'phone') {

            $el.onshow();
            app.append($el, mask);
            $el.classList.add('show');
            document.ontouchstart = ontouchstart;

            actionStack.push({
                id: 'sidenav',
                action: hideMaster
            });

        } else {
            root.style.marginLeft = width + 'px';
            root.style.width = `calc(100% - ${width}px)`;
            app.append($el);
            editorManager.editor.resize(true);
            editorManager.controls.update();
        }

        restoreScrollPos();
        attachListner();

        onshow();
    }

    function onshow() {
        if ($el.onshow) $el.onshow.call($el);
        openFolder.updateHeight();
    }

    function restoreScrollPos() {
        $$ = [...$el.getAll(':scope>div>ul')];
        $$.map($ => {
            const scrollTop = $.getAttribute('scroll-pos');
            if (scrollTop) $.scrollTop = scrollTop;
        });
    }

    function attachListner() {
        $$.map($ => {
            $.onscroll = function () {
                if (timeout) clearTimeout(timeout);
                isScrolling = true;
                this.setAttribute('scroll-pos', this.scrollTop);
            };
        });
    }

    function hide(hideIfTab = false) {
        if (mode === 'phone') {
            actionStack.remove('sidenav');
            hideMaster();
        } else if (hideIfTab) {
            $el.activated = false;
            root.style.removeProperty('margin-left');
            root.style.removeProperty('width');
            $el.remove();
            editorManager.editor.resize(true);
            editorManager.controls.update();
        }
    }

    function hideMaster() {
        $el.style.transform = null;
        $el.classList.remove('show');
        setTimeout(() => {
            $el.activated = false;
            mask.remove();
            $el.remove();
            activator.style.overflow = null;
        }, 300);
        document.ontouchstart = null;
        resetState();

        $$.map($ => {
            isScrolling = false;
            timeout = null;
            $.onscroll = null;
        });
        $$ = [];
    }

    /**
     * 
     * @param {TouchEvent} e 
     */
    function ontouchstart(e) {
        const {
            clientX
        } = e.touches[0];
        $el.style.transition = 'none';
        touch.start = clientX;
        touch.target = e.target;

        if ($el.activated && !$el.contains(e.target) && e.target !== mask) return;
        else if (!$el.activated && touch.start > START_THRESHOLD || e.target === toggler) return;

        document.ontouchmove = ontouchmove;
        document.ontouchend = ontouchend;
    }

    /**
     * 
     * @param {TouchEvent} e 
     */
    function ontouchmove(e) {

        if (!flag) {
            flag = true;
            timeout = setTimeout(() => {
                timeout = null;
                isScrolling = false;
            }, 50);
        }

        if (isScrolling) return;

        let width = $el.getwidth();
        const {
            clientX
        } = e.touches[0];

        touch.end = clientX;
        touch.total = touch.end - touch.start;

        if (!$el.activated && touch.total < width && touch.start < START_THRESHOLD) {

            if (!$el.isConnected) {
                app.append($el, mask);
                activator.style.overflow = 'hidden';
                restoreScrollPos();
            }

            $el.style.transform = `translate3d(${-(width - touch.total)}px, 0, 0)`;
        } else if (touch.total < 0 && $el.activated) {
            $el.style.transform = `translate3d(${touch.total}px, 0, 0)`;
        }
    }

    /**
     * 
     * @param {TouchEvent} e 
     */
    function ontouchend(e) {

        flag = false;
        isScrolling = true;

        if (e.target === $el && !$el.textContent && touch.total === 0) {
            Acode.exec("open-folder");
            resetState();
            return hide();
        } else if (e.target !== mask && touch.total === 0) return resetState();
        else if (e.target === mask && touch.total === 0) return hide();
        e.preventDefault();

        const threshold = $el.getwidth() / 3;

        if (($el.activated && touch.total > -threshold) || (!$el.activated && touch.total >= threshold)) {
            lclShow();
        } else if ((!$el.activated && touch.total < threshold) || ($el.activated && touch.total <= -threshold)) {
            hide();
        }


        function lclShow() {
            attachListner();
            onshow();
            $el.activated = true;
            $el.style.transform = `translate3d(0, 0, 0)`;
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
        $el.style.transition = null;
        document.onscroll = null;
    }

    $el.getwidth = function () {
        const width = innerWidth * 0.7;
        return mode === "phone" ? (width >= 350 ? 350 : width) : 250;
    };

    $el.hide = hide;
    $el.toggle = toggle;
    $el.onshow = () => {};

    return $el;
}

export default sidenav;