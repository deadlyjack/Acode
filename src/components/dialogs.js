import tag from 'html-tag-js';
import alert from './dialogboxes/alert';
import multiPrompt from './dialogboxes/multiprompt';
import prompt from './dialogboxes/prompt';
import confirm from './dialogboxes/confirm';
import box from './dialogboxes/box';
import select from './dialogboxes/select';
import color from './dialogboxes/color';

const loader = {
  /**
   * Creates new loading dialog
   * @param {string} titleText Title text
   * @param {string} message Loading message
   * @param {{timeout: Number, callback: function():void}} cancel Loading message
   */
  create(titleText, message, cancel = null) {
    if (!message && titleText) {
      message = titleText;
      titleText = '';
    }

    if (this.loaderDiv) this.loaderDiv = null;
    if (this.mask) this.mask = null;

    const oldLoaderDiv = tag.get('#__loader');

    if (oldLoaderDiv) oldLoaderDiv.remove();

    const titleSpan = tag('strong', {
      className: 'title',
      textContent: titleText,
    });
    const $messageSpan = tag('span', {
      className: 'message loader',
      children: [
        tag('span', {
          className: 'loader',
        }),
        tag('div', {
          className: 'message',
          innerHTML: message,
        }),
      ],
    });
    const $loaderDiv =
      oldLoaderDiv ||
      tag('div', {
        className: 'prompt alert',
        id: '__loader',
        children: [titleSpan, $messageSpan],
      });
    const mask =
      tag.get('#__loader-mask') ||
      tag('span', {
        className: 'mask',
        id: '__loader-mask',
      });

    if (cancel) {
      const { timeout, callback } = cancel;

      if (typeof timeout === 'number') {
        setTimeout(() => {
          const loader = this;
          loader.show();
          $loaderDiv.append(
            tag('div', {
              className: 'button-container',
              child: tag('button', {
                textContent: strings.cancel,
                onclick() {
                  loader.destroy();
                  if (typeof callback === 'function') {
                    callback();
                  }
                },
              }),
            }),
          );
        }, timeout);
      }
    }

    if (!oldLoaderDiv) {
      window.freeze = true;
      document.body.append($loaderDiv, mask);
      window.restoreTheme(true);
    }
  },
  /**
   * Removes the loader from DOM permanently
   */
  destroy() {
    const loaderDiv = document.querySelector('#__loader');
    const mask = document.querySelector('#__loader-mask');
    if (!loaderDiv && !mask) return;
    if (loaderDiv) loaderDiv.classList.add('hide');
    window.freeze = false;
    window.restoreTheme();
    setTimeout(() => {
      if (loaderDiv && loaderDiv.isConnected) loaderDiv.remove();
      if (mask && mask.isConnected) mask.remove();
    }, 300);
  },
  /**
   * Hides the loading dialoge box temporarily and can be restored using show method
   */
  hide() {
    const loaderDiv = document.querySelector('#__loader');
    const mask = document.querySelector('#__loader-mask');

    if (loaderDiv) {
      this.loaderDiv = loaderDiv;
      loaderDiv.remove();
    }
    if (mask) {
      this.mask = mask;
      mask.remove();
    }
  },
  /**
   * Shows previously hidden dialoge box.
   */
  show() {
    if (this.loaderDiv) {
      app.append(this.loaderDiv);
      this.loaderDiv = null;
    }
    if (this.mask) {
      app.append(this.mask);
      this.mask = null;
    }
  },
};

export default {
  alert,
  box,
  color,
  confirm,
  loader,
  multiPrompt,
  prompt,
  select,
};
