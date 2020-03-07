import tag from 'html-tag-js';
import helpers from '../helpers';
/**
 * 
 * @param {AceAjax.Editor} editor 
 * @param {Object} controls 
 * @param {HTMLElement} container 
 */
function textControl(editor, controls, container) {
    const $content = container.querySelector('.ace_scroller');
    const MouseEvent = ace.require('ace/mouse/mouse_event').MouseEvent;
    let oldPos = editor.getCursorPosition();
    $content.addEventListener('contextmenu', function (e) {
        oncontextmenu(e, editor, controls, container, $content, MouseEvent);
    });
    $content.addEventListener('click', function (e) {
        if (controls.callBeforeContextMenu) controls.callBeforeContextMenu();
        enableSingleMode(editor, controls, container, $content, MouseEvent);

        const shiftKey = tag.get('#shift-key');
        if (shiftKey && shiftKey.getAttribute('data-state') === 'on') {
            const me = new MouseEvent(e, editor);
            const pos = me.getDocumentPosition();
            editor.selection.setRange({
                start: oldPos,
                end: pos
            });

        } else {
            oldPos = editor.getCursorPosition();
        }
    });
}
/**
 * @param {MouseEvent} e 
 * @param {AceAjax.Editor} editor 
 * @param {Object} controls 
 * @param {HTMLElement} controls.start
 * @param {HTMLElement} controls.end
 * @param {HTMLElement} controls.menu
 * @param {HTMLElement} container
 * @param {HTMLElement} $content
 */
function oncontextmenu(e, editor, controls, container, $content, MouseEvent) {
    e.preventDefault();
    editor.focus();

    if (controls.callBeforeContextMenu) controls.callBeforeContextMenu();
    const ev = new MouseEvent(e, editor);
    const pos = ev.getDocumentPosition();

    editor.gotoLine(parseInt(pos.row + 1), parseInt(pos.column + 1));
    editor.selectMore(1, false, true);

    enableDoubleMode(editor, controls, container, $content, MouseEvent);
}

/**
 * 
 * @param {AceAjax.Editor} editor 
 * @param {Controls} controls 
 * @param {HTMLElement} container 
 * @param {HTMLElement} $content 
 */
function enableDoubleMode(editor, controls, container, $content, MouseEvent) {
    const lineHeight = editor.renderer.lineHeight;
    const $cm = controls.menu;
    const $cursor = editor.container.querySelector('.ace_cursor-layer>.ace_cursor');
    const initialScroll = {
        top: 0,
        left: 0
    };
    let cpos = {
        start: {
            x: 0,
            y: 0
        },
        end: {
            x: 0,
            y: 0
        }
    };

    controls.update = updateControls;
    controls.callBeforeContextMenu = containerOnClick;
    controls.end.onclick = null;
    $content.addEventListener('click', containerOnClick);
    editor.session.on('changeScrollTop', updatePosition);
    editor.session.on('changeScrollLeft', updatePosition);
    editor.selection.on('changeCursor', onchange);

    controls.start.ontouchstart = function (e) {
        touchStart.call(this, e, 'start');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    controls.end.ontouchstart = function (e) {
        touchStart.call(this, e, 'end');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    setTimeout(() => {
        container.append(controls.start, controls.end, $cm);
        updateControls();
    }, 0);

    function touchStart(e, action) {
        const el = this;

        document.ontouchmove = function (e) {
            e.clientY = e.touches[0].clientY - 28;
            e.clientX = e.touches[0].clientX;
            const ev = new MouseEvent(e, editor);
            const pos = ev.getDocumentPosition();
            const range = editor.selection.getRange();

            if (action === 'start') {
                if (pos.row > range.end.row && pos.column >= range.end.column) pos.column = range.end.column - 1;
                if (pos.row > range.end.row) pos.row = range.end.row;
                editor.selection.setSelectionAnchor(pos.row, pos.column);
            } else {
                if (pos.row < range.start.row && pos.column <= range.start.column) pos.column = range.start.column + 1;
                if (pos.row < range.start.row) pos.row = range.start.row;
                editor.selection.moveCursorToPosition(pos);
            }

            editor.renderer.scrollCursorIntoView(pos);
            if (action === 'start') {
                updateControls(action);
            }
        };

        document.ontouchend = function () {
            document.ontouchmove = null;
            document.ontouchend = null;
            el.touchStart = null;
            container.appendChild($cm);
        };
    }

    function updatePosition() {
        const scrollTop = editor.renderer.getScrollTop() - initialScroll.top;
        const scrollLeft = editor.renderer.getScrollLeft() - initialScroll.left;

        update(-scrollLeft, -scrollTop);

    }

    function onchange() {
        setTimeout(() => {
            updateControls('end');
        }, 0);

    }

    function updateControls(mode) {
        const selected = editor.getCopyText();
        if (!selected) {
            return containerOnClick();
        }

        const $singleMode = editor.container.querySelector('.ace_marker-layer>.ace_selection.ace_br15');
        const cursor = $cursor.getBoundingClientRect();
        const scrollTop = editor.renderer.getScrollTop();
        const scrollLeft = editor.renderer.getScrollLeft();

        if ($singleMode) {
            const singleMode = $singleMode.getBoundingClientRect();

            if (mode && typeof mode === 'string') {
                if (mode === 'start') {
                    cpos.start.x = singleMode.left;
                    cpos.start.y = singleMode.bottom;
                    cpos.end.x -= scrollLeft - initialScroll.left;
                    cpos.end.y -= scrollTop - initialScroll.top;
                } else {
                    cpos.start.x -= scrollLeft - initialScroll.left;
                    cpos.start.y -= scrollTop - initialScroll.top;
                    cpos.end.x = singleMode.right;
                    cpos.end.y = singleMode.bottom;
                }
            } else {
                cpos.start.x = singleMode.left;
                cpos.end.x = singleMode.right;
                cpos.end.y = cpos.start.y = singleMode.bottom;
            }
        } else {
            const $clientStart = editor.container.querySelector('.ace_marker-layer>.ace_selection.ace_br1.ace_start');
            const $clientEnd = editor.container.querySelector('.ace_marker-layer>.ace_selection.ace_br12');

            if ($clientStart && $clientEnd) {
                const clientStart = $clientStart.getBoundingClientRect();
                const clientEnd = $clientEnd.getBoundingClientRect();

                if (mode && typeof mode === 'string') {
                    if (mode === 'start') {
                        cpos.start.x = clientStart.left;
                        cpos.start.y = clientStart.bottom;
                        cpos.end.x -= scrollLeft - initialScroll.left;
                        cpos.end.y -= scrollTop - initialScroll.top;
                    } else {
                        cpos.start.x -= scrollLeft - initialScroll.left;
                        cpos.start.y -= scrollTop - initialScroll.top;
                        cpos.end.x = clientEnd.right;
                        cpos.end.y = clientEnd.bottom;
                    }

                } else {
                    cpos.start.x = clientStart.left;
                    cpos.end.x = clientEnd.right;
                    cpos.start.y = clientStart.bottom;
                    cpos.end.y = clientEnd.bottom;
                }
            } else {
                cpos.start.x = cursor.left;
                cpos.end.x = cursor.right;
                cpos.start.y = cpos.end.y = cursor.bottom;
            }
        }

        initialScroll.top = scrollTop;
        initialScroll.left = scrollLeft;
        controls.checkForColor();
        update();
    }

    function update(left = 0, top = 0) {
        const offset = parseFloat(root.style.marginLeft) || 0;
        controls.start.style.transform = `translate3d(${cpos.start.x + 1 + left - offset}px, ${cpos.start.y + top}px, 0) rotate(-45deg)`;
        controls.end.style.transform = `translate3d(${cpos.end.x + 4 + left - offset}px, ${cpos.end.y + top}px, 0) rotate(45deg)`;

        const cm = {
            left: cpos.end.x + left - offset,
            top: cpos.end.y - (40 + lineHeight) + top
        };
        const containerWidth = innerWidth - 40;
        let scale = 1;

        $cm.style.transform = `translate3d(${cm.left}px, ${cm.top}px, 0) scale(${scale})`;

        const cmClient = $cm.getBoundingClientRect();

        if (cmClient.width > containerWidth) scale = (containerWidth) / cmClient.width;

        if (cmClient.right > containerWidth) {
            cm.left = containerWidth - cmClient.width;
            cm.left = cm.left < 0 ? Math.abs(cm.left) / 2 : cm.left;
        }

        if (cmClient.left < 0) {
            cm.left = 0;
        }

        if (cmClient.right > containerWidth) {
            cm.left = (containerWidth - (cmClient.width * scale)) / 2;
        }

        if (cmClient.top < 0) {
            cm.top = 50;
        }

        $cm.style.transform = `translate3d(${cm.left}px, ${cm.top}px, 0) scale(${scale})`;
    }

    function containerOnClick() {
        controls.start.remove();
        controls.end.remove();
        $cm.remove();

        $content.removeEventListener('click', containerOnClick);
        editor.session.off('changeScrollTop', updatePosition);
        editor.session.off('changeScrollLeft', updatePosition);
        editor.selection.off('changeCursor', onchange);
        controls.start.ontouchstart = null;
        controls.end.ontouchstart = null;
    }
}

/**
 * @param {MouseEvent} e 
 * @param {AceAjax.Editor} editor 
 * @param {Object} controls 
 * @param {HTMLElement} controls.start
 * @param {HTMLElement} controls.end
 * @param {HTMLElement} controls.menu
 * @param {HTMLElement} container
 * @param {HTMLElement} $content
 */
function enableSingleMode(editor, controls, container, $content, MouseEvent) {
    const selectedText = editor.getCopyText();
    if (selectedText) return;
    const $cursor = editor.container.querySelector('.ace_cursor-layer>.ace_cursor');
    const $cm = controls.menu;
    const lineHeight = editor.renderer.lineHeight;
    const cpos = {
        x: 0,
        y: 0
    };
    const lessConent = `${editor.getReadOnly()? '' : `<span action="paste">${strings.paste}</span>`}<span action="select all">${strings["select all"]}<span>`;
    let updateTimeout;

    $cm.innerHTML = lessConent;
    if (editorManager.activeFile) editorManager.activeFile.controls = true;
    controls.update = updateEnd;
    controls.callBeforeContextMenu = callBeforeContextMenu;

    editor.on('blur', hide);
    editor.session.on('changeScrollTop', hide);
    editor.session.on('changeScrollLeft', hide);
    editor.selection.on('changeCursor', onchange);

    updateEnd();

    const mObserver = new MutationObserver(oberser);

    function oberser(list) {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateEnd();
    }

    mObserver.observe($cursor, {
        attributeFilter: ['style'],
        attributes: true
    });

    if (!controls.end.isConnected) container.append(controls.end);
    controls.end.ontouchstart = function (e) {
        touchStart.call(this, e);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    function touchStart() {
        const el = this;
        let showCm = $cm.isConnected;
        let move = false;

        document.ontouchmove = function (e) {
            e.clientY = e.touches[0].clientY - 28;
            e.clientX = e.touches[0].clientX;
            const ev = new MouseEvent(e, editor);
            const pos = ev.getDocumentPosition();

            editor.selection.moveCursorToPosition(pos);
            editor.selection.setSelectionAnchor(pos.row, pos.column);
            editor.renderer.scrollCursorIntoView(pos);
            if (showCm) $cm.remove();
            move = true;
        };
        document.ontouchend = function () {
            document.ontouchmove = null;
            document.ontouchend = null;
            el.touchStart = null;
            if (showCm) {
                if (editor.getCopyText()) {
                    $cm.innerHTML = controlscontrols[editor.getReadOnly() ? 'readOnlyContent' : 'fullContent'];
                } else {
                    $cm.innerHTML = lessConent;
                }
                container.appendChild($cm);
                updateCm();
            } else if (!move) {
                container.appendChild($cm);
                controls.checkForColor();
                updateCm();
            }
        };
    }

    function onchange() {
        updateTimeout = setTimeout(updateEnd, 0);
    }

    function updateEnd() {
        if (!editorManager.activeFile.controls) return controls.end.remove();
        const cursor = $cursor.getBoundingClientRect();

        cpos.x = cursor.right - 4;
        cpos.y = cursor.bottom;

        update();

    }

    function update(left = 0, top = 0) {
        const offset = parseFloat(root.style.marginLeft) || 0;
        controls.end.style.transform = `translate3d(${cpos.x + 2 + left - offset}px, ${cpos.y + top}px, 0) rotate(45deg)`;
        controls.end.style.display = 'block';
    }

    function updateCm() {
        const offset = parseFloat(root.style.marginLeft) || 0;
        const cm = {
            left: cpos.x - offset,
            top: cpos.y - (40 + lineHeight)
        };

        let scale = 1;

        $cm.style.transform = `translate3d(${cm.left}px, ${cm.top}px, 0) scale(${scale})`;

        const cmClient = $cm.getBoundingClientRect();
        if (cmClient.right + 10 > innerWidth) {
            cm.left = innerWidth - cmClient.width - 10;
        }

        if (cmClient.left < 10) {
            cm.left = 10;
        }

        if (cmClient.top < 0) {
            cm.top = 50;
        }

        //TODO: expriment
        $cm.style.transform = `translate3d(${cm.left * scale}px, ${cm.top}px, 0) scale(${scale})`;
    }

    function callBeforeContextMenu() {
        controls.end.remove();
        $cm.remove();
        $cm.innerHTML = controls[editor.getReadOnly() ? 'readOnlyContent' : 'fullContent'];
        editor.session.off('changeScrollTop', hide);
        editor.session.off('changeScrollLeft', hide);
        editor.selection.off('changeCursor', onchange);
        editor.off('blur', hide);
        mObserver.disconnect();
        controls.end.ontouchstart = null;

    }

    function hide() {
        const end = controls.end;
        if (end.isConnected) end.remove();
        if ($cm.isConnected) $cm.remove();
    }
}
export default textControl;