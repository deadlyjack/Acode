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

    const editor = editorManager.editor;
    const $row2 = footer.querySelector('#row2');
    const $searchRow1 = footer.querySelector('#search_row1')
    const $searchRow2 = footer.querySelector('#search_row2')
    const $textarea = editor.textInput.getElement();
    const shiftKey = footer.querySelector('#shift-key').getAttribute('data-state') === 'on' ? true : false;
    let state, skip = false,
        replaceWith = '';

    if (!['pallete', 'search', 'search-settings'].includes(action) &&
        editorManager.state === 'focus') editor.focus();

    if (['next', 'prev', 'replace', 'replace-all'].includes(action)) {
        const searchValue = footer.querySelector('#searchInput').value;
        if (!searchValue) return;

        const searching = footer.getAttribute('data-searching');
        if (searching !== searchValue) {
            footer.setAttribute('data-searching', searchValue);
            initializeSearch(searchValue);
            skip = true;
        }

        if (['replace', 'replace-all', 'search-settings'].includes(action)) {
            replaceWith = footer.querySelector('#replaceInput').value;
        }
    }


    switch (action) {
        case 'pallete':
            editor.execCommand('openCommandPallete');
            break;

        case 'tab':
            $textarea.dispatchEvent(new KeyboardEvent('keydown', {
                key: 9,
                keyCode: 9,
                shiftKey
            }));
            break;

        case 'shift':
            state = el.getAttribute('data-state') || 'off';
            if (state === 'off') {
                $textarea.dispatchEvent(new KeyboardEvent('keydown'));
                el.setAttribute('data-state', 'on');
                el.classList.add('active');
            } else {
                $textarea.dispatchEvent(new KeyboardEvent('keyup'));
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
                footer.querySelector('#searchInput').focus();
                app.classList.add('threestories');
            } else {
                removeSearchRow2();
            }
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
                app.classList.add('twostories');
            } else {
                removeRow2();
            }
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
            if (!skip)
                editorManager.editor.findNext();
            break;

        case 'prev':
            if (!skip)
                editorManager.editor.findPrevious();
            break;

        case 'replace':
            if (!replaceWith) return;
            editor.replace(replaceWith);
            break;

        case 'replace-all':
            if (!replaceWith) return;
            editor.replaceAll(replaceWith);
            break;

        case 'search-settings':
            editor.blur();
            searchSettings();
            break;
    }

    function removeRow2() {
        footer.removeChild($row2);
        app.classList.remove('twostories');
    }

    function removeSearchRow2() {
        footer.removeAttribute('data-searching');
        footer.removeChild($searchRow1);
        footer.removeChild($searchRow2);
        app.classList.remove('threestories');
    }

    function initializeSearch(search) {
        const searchSettings = appSettings.value.search;
        editor.find(search, {
            caseSensitive: searchSettings.caseSensitive,
            wrap: searchSettings.wrap,
            wholeWord: searchSettings.wholeWord,
            regExp: searchSettings.regExp
        });
    }
}

export default quickToolAction;