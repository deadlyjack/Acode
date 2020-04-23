import tag from 'html-tag-js';
import alert from './dialogboxes/alert';
import multiPrompt from './dialogboxes/multiprompt';
import prompt from './dialogboxes/prompt';
import confirm from './dialogboxes/confirm';
import box from './dialogboxes/box';
import select from './dialogboxes/select';
import color from './dialogboxes/color';

/**
 * 
 * @param {string} titleText 
 * @param {string} message 
 */
function loaderShow(titleText, message) {
    if (!message && titleText) {
        message = titleText;
        titleText = '';
    }

    const oldLoaderDiv = tag.get('#__loader');

    if (oldLoaderDiv) oldLoaderDiv.remove();

    const titleSpan = tag('strong', {
        className: 'title',
        textContent: titleText
    });
    const messageSpan = tag('span', {
        className: 'message loader',
        children: [
            tag('span', {
                className: 'loader'
            }),
            tag('div', {
                className: 'message',
                innerHTML: message
            })
        ]
    });
    const loaderDiv = oldLoaderDiv || tag('div', {
        className: 'prompt alert',
        id: '__loader',
        children: [
            titleSpan,
            messageSpan
        ]
    });
    const mask = tag.get('#__loader-mask') || tag('span', {
        className: 'mask',
        id: '__loader-mask'
    });

    if (!oldLoaderDiv) {
        window.freeze = true;
        document.body.append(loaderDiv, mask);
        window.restoreTheme(true);
    }
}

function loaderHide() {
    const loaderDiv = document.querySelector('#__loader');
    const mask = document.querySelector('#__loader-mask');

    if (loaderDiv) loaderDiv.classList.add('hide');
    window.restoreTheme();
    setTimeout(() => {
        window.freeze = false;
        if (loaderDiv && loaderDiv.isConnected) loaderDiv.remove();
        if (mask && mask.isConnected) mask.remove();
    }, 300);
}

export default {
    alert,
    box,
    color,
    confirm,
    loaderShow,
    loaderHide,
    multiPrompt,
    prompt,
    select
};