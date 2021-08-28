import tag from 'html-tag-js';
/**
 *
 * @param {string} titleText
 * @param {string} message
 * @returns {Promise<void>}
 */
function confirm(titleText, message) {
  return new Promise((resolve, reject) => {
    if (!message && titleText) {
      message = titleText;
      titleText = '';
    }

    const titleSpan = tag('strong', {
      className: 'title',
      textContent: titleText,
    });
    const messageSpan = tag('span', {
      className: 'message scroll',
      textContent: message,
    });
    const okBtn = tag('button', {
      textContent: strings.ok,
      onclick: function () {
        hide();
        resolve();
      },
    });
    const cancelBtn = tag('button', {
      textContent: strings.cancel,
      onclick: function () {
        hide();
        reject(false);
      },
    });
    const confirmDiv = tag('div', {
      className: 'prompt confirm',
      children: [
        titleSpan,
        messageSpan,
        tag('div', {
          className: 'button-container',
          children: [cancelBtn, okBtn],
        }),
      ],
    });
    const mask = tag('span', {
      className: 'mask',
    });

    actionStack.push({
      id: 'confirm',
      action: hideAlert,
    });

    app.append(confirmDiv, mask);
    window.restoreTheme(true);

    function hideAlert() {
      confirmDiv.classList.add('hide');
      window.restoreTheme();
      setTimeout(() => {
        app.removeChild(confirmDiv);
        app.removeChild(mask);
      }, 300);
    }

    function hide() {
      actionStack.remove('confirm');
      hideAlert();
    }
  });
}

export default confirm;
