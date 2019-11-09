import tag from 'html-tag-js';
import tile from './tile';

/**
 * @typedef {object} PageObj
 * @property {function():void} hide hides the page
 * @property {function():void} onhide executes on page hide event
 */

/**
 * 
 * @param {string} title 
 * @param {object} options 
 * @param {HTMLElement} [options.lead] type of page 
 * @param {HTMLElement} [options.tail] type of page 
 * @returns {HTMLDivElement & PageObj}
 */
function Page(title, options = {}) {
    const leadBtn = options.lead || tag('span', {
        className: 'icon chevron_left',
        onclick: hide
    });
    const header = tile({
        type: 'header',
        text: title,
        lead: leadBtn,
        tail: options.tail || tag('span', {
            className: 'icon'
        })
    });
    const page = tag('div', {
        className: 'page',
        child: header
    });

    header.classList.add('light');


    function hide() {
        page.onhide();
        page.classList.add('hide');
        setTimeout(() => {
            page.remove();
        }, 150);
    }

    page.onhide = () => {};
    page.hide = hide;
    page.settitle = header.text;

    return page;
}


export default Page;