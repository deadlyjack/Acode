import tag from 'html-tag-js';

/**
 * @typedef {object} Tile
 * @property {function(string):void} text
 * @property {function(string):void} subText
 * @property {function(string):void} appendText
 * @property {function(HTMLElement):void} lead
 * @property {function(HTMLElement):void} tail
 */

/**
 * 
 * @param {object} [options] 
 * @param {HTMLElement} [options.lead] 
 * @param {HTMLElement} [options.tail] 
 * @param {string | HTMLElement} [options.text]
 * @param {string} [options.subText]
 * @param {string} [options.type] 
 * @returns {HTMLElement & Tile}
 */
function tile(options = {}) {
    const el = tag(options.type || "li", {
        className: 'tile'
    });
    const titleEl = typeof options.text === 'string' ? tag('span', {
        textContent: options.text || ''
    }) : options.text;
    const leadEl = options.lead || tag('span', {
        className: 'lead'
    });
    const tailEl = options.tail || tag('span', {
        className: 'tail'
    });

    if (options.subText) {
        titleEl.setAttribute('data-subtext', options.subText);
        titleEl.classList.add('sub-text');
    }

    el.append(leadEl, titleEl, tailEl);

    /**
     * 
     * @param {string} txt 
     */
    function text(txt) {
        titleEl.textContent = txt;
    }

    function subText(txt) {
        if (txt) {
            titleEl.setAttribute('data-subtext', txt);
            titleEl.classList.add('sub-text');
        } else {
            titleEl.classList.remove('sub-text');
        }
    }

    function appendText(txt) {
        titleEl.textContent += txt;
    }

    /**
     * 
     * @param {HTMLElement} newLead 
     */
    function lead(newLead) {
        el.replaceChild(newLead, el.firstChild);
    }

    /**
     * 
     * @param {HTMLElement} newLead 
     */
    function tail(newTail) {
        el.replaceChild(newTail, el.lastChild);
    }

    el.text = text;
    el.subText = subText;
    el.lead = lead;
    el.tail = tail;
    el.appendText = appendText;

    return el;
}

export default tile;