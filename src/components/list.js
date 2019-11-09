import tag from 'html-tag-js';
import tile from "./tile";

/**
 * @typedef {object} Collaspable
 * @property {HTMLElement} titleEl
 * @property {function(HTMLElement):void} addListTile
 * @property {function():void} clearList
 */

export default {
    /**
     * 
     * @param {string} titleText
     * @param {boolean} hidden 
     * @param {HTMLElement} lead 
     * @param {object} [options] 
     * @param {HTMLElement} [options.tail] 
     * @param {string} [options.type] 
     * @returns {HTMLElement & Collaspable}
     */
    collaspable: function (titleText, hidden, type = 'indicator', options = {}) {
        const ul = tag('ul');
        const collaspeIndicator = tag('span', {
            className: `icon ${type}`
        });
        const title = tile({
            lead: collaspeIndicator,
            type: 'div',
            text: titleText.toUpperCase(),
            tail: options.tail
        });
        const mainWrapper = tag(options.type || 'div', {
            className: 'list collaspable',
            children: [
                title,
                ul
            ]
        });

        if (hidden) {
            mainWrapper.classList.add('hidden');
        }

        title.classList.add('light');
        title.addEventListener('click', function () {
            if (mainWrapper.classList.contains('hidden')) {
                mainWrapper.classList.remove('hidden');
            } else {
                mainWrapper.classList.add('hidden');
            }
        });

        function addListTile(listTile) {
            ul.append(listTile);
        }

        function clearList() {
            ul.textContent = '';
        }

        function text(str) {
            title.text(str.toUpperCase());
        }

        mainWrapper.titleEl = title;
        mainWrapper.addListTile = addListTile;
        mainWrapper.clearList = clearList;
        mainWrapper.text = text;
        mainWrapper.list = ul;

        return mainWrapper;
    }
};