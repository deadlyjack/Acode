import saveFile from "../saveFile";
import tag from 'html-tag-js';
import searchSettings from "../../pages/settings/searchSettings";

/**
 * 
 * @param {TouchEvent | MouseEvent} e 
 * @param {HTMLElement} footer
 * @param {string} row1
 * @param {string} row2
 */
function quickToolAction(e, footer, row1, row2, search) {
    if (!e.target) return;

    const el = e.target;
    const action = el.getAttribute('action');

    if (!action) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const editor = editorManager.editor;
    const $row2 = footer.querySelector('#row2');
    const $searchRow1 = footer.querySelector('#search_row1');
    const $searchRow2 = footer.querySelector('#search_row2');
    const $textarea = editor.textInput.getElement();
    const shiftKey = footer.querySelector('#shift-key').getAttribute('data-state') === 'on' ? true : false;
    let $searchInput = footer.querySelector('#searchInput'),
        $replaceInput = footer.querySelector('#replaceInput'),
        state, selectedText = editor.getCopyText();

    if (selectedText.length > 50) selectedText = '';

    if (!['pallete', 'search', 'search-settings'].includes(action) &&
        editorManager.state === 'focus') editor.focus();


    switch (action) {
        case 'pallete':
            editor.execCommand('openCommandPallete');
            break;

        case 'tab':
            $textarea.dispatchEvent(window.createKeyboardEvent('keydown', {
                key: 9,
                keyCode: 9,
                shiftKey
            }));
            break;

        case 'shift':
            state = el.getAttribute('data-state') || 'off';
            if (state === 'off') {
                $textarea.dispatchEvent(window.createKeyboardEvent('keydown'));
                el.setAttribute('data-state', 'on');
                el.classList.add('active');
            } else {
                $textarea.dispatchEvent(window.createKeyboardEvent('keyup'));
                el.setAttribute('data-state', 'off');
                el.classList.remove('active');
            }
            break;

        case 'undo':
            if (editor.session.getUndoManager().hasUndo())
                editor.undo();
            else
                break;

            if (!editor.session.getUndoManager().hasUndo()) {
                editorManager.activeFile.isUnsaved = false;
                editorManager.onupdate();
            }

            break;

        case 'redo':
            editor.redo();
            break;

        case 'search':
            if (!$searchRow1) {
                if ($row2) {
                    removeRow2();
                }
                footer.append(...tag.parse(search));
                if (!$searchInput) $searchInput = footer.querySelector('#searchInput');
                $searchInput.value = selectedText || '';
                if (!selectedText) $searchInput.focus();
                $searchInput.oninput = function () {
                    if (this.value) find(false, false);
                };
                root.classList.add('threestories');
                find(false, false);
            } else {
                removeSearchRow2();
            }
            editor.resize(true);
            break;

        case 'save':
            saveFile(editorManager.activeFile);
            break;

        case 'more':
            if (!$row2) {
                if ($searchRow1) {
                    removeSearchRow2();
                }
                footer.appendChild(tag.parse(row2));
                root.classList.add('twostories');
            } else {
                removeRow2();
            }
            editor.resize(true);
            break;

        case 'moveline-up':
            editor.moveLinesUp();
            break;

        case 'moveline-down':
            editor.moveLinesDown();
            break;

        case 'copyline-up':
            editor.copyLinesUp();
            break;

        case 'copyline-down':
            editor.copyLinesDown();
            break;

        case 'next':
            find(true, false);
            break;

        case 'prev':
            find(true, true);
            break;

        case 'replace':
            editor.replace($replaceInput.value || '');
            break;

        case 'replace-all':
            editor.replaceAll($replaceInput.value || '');
            break;

        case 'search-settings':
            editor.blur();
            searchSettings();
            break;
    }

    function removeRow2() {
        footer.removeChild($row2);
        root.classList.remove('twostories');
    }

    function removeSearchRow2() {
        footer.removeAttribute('data-searching');
        footer.removeChild($searchRow1);
        footer.removeChild($searchRow2);
        root.classList.remove('threestories');
    }

    function find(skip, backward) {
        const searchSettings = appSettings.value.search;
        editor.find($searchInput.value, {
            skipCurrent: skip,
            backwards: backward,
            caseSensitive: searchSettings.caseSensitive,
            wrap: searchSettings.wrap,
            wholeWord: searchSettings.wholeWord,
            regExp: searchSettings.regExp
        });

        updateStatus();
    }

    function updateStatus() {
        var regex = editor.$search.$options.re;
        var all = 0;
        var before = 0;
        const MAX_COUNT = 999;
        if (regex) {
            const value = editor.getValue();
            const offset = editor.session.doc.positionToIndex(editor.selection.anchor);
            let last = regex.lastIndex = 0;
            let m;
            while ((m = regex.exec(value))) {
                all++;
                last = m.index;
                if (last <= offset)
                    before++;
                if (all > MAX_COUNT)
                    break;
                if (!m[0]) {
                    regex.lastIndex = last += 1;
                    if (last >= value.length)
                        break;
                }
            }
        }
        footer.querySelector('#total-result').textContent = all > MAX_COUNT ? '999+' : all;
        footer.querySelector('#current-pos').textContent = before;
    }
}

export default quickToolAction;