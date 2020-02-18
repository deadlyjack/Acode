import tag from 'html-tag-js';
import tile from "./tile";

/**
 * @typedef {object} Collaspable
 * @property {HTMLElement} titleEl
 * @property {function(HTMLElement):void} addListTile
 * @property {function():void} clearList
 * @property {function(void):void} ontoggle
 * @property {boolean} collasped
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
     * @param {boolean} [options.allCaps] 
     * @returns {HTMLElement & Collaspable}
     */
    collaspable: function (titleText, hidden, type = 'indicator', options = {}) {
        const $ul = tag('ul');
        const $collaspeIndicator = tag('span', {
            className: `icon ${type}`
        });
        const title = tile({
            lead: $collaspeIndicator,
            type: 'div',
            text: options.allCaps ? titleText.toUpperCase() : titleText,
            tail: options.tail
        });
        const $mainWrapper = tag(options.type || 'div', {
            className: 'list collaspable',
            children: [
                title,
                $ul
            ]
        });

        if (hidden) {
            $mainWrapper.classList.add('hidden');
        }

        title.classList.add('light');
        title.addEventListener('click', function () {
            if ($mainWrapper.classList.contains('hidden')) {
                $mainWrapper.classList.remove('hidden');
                $mainWrapper.collasped = false;
                if ($mainWrapper.ontoggle) $mainWrapper.ontoggle(false);
            } else {
                $mainWrapper.classList.add('hidden');
                $mainWrapper.collasped = true;
                if ($mainWrapper.ontoggle) $mainWrapper.ontoggle(true);
            }
        });

        function addListTile(listTile) {
            $ul.append(listTile);
        }

        function clearList() {
            $ul.textContent = '';
        }

        function text(str) {
            title.text(str.toUpperCase());
        }

        $mainWrapper.titleEl = title;
        $mainWrapper.addListTile = addListTile;
        $mainWrapper.clearList = clearList;
        $mainWrapper.text = text;
        $mainWrapper.list = $ul;
        $mainWrapper.ontoggle = () => {};

        return $mainWrapper;
    }
};