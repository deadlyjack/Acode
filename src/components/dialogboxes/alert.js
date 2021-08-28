import tag from 'html-tag-js';
/**
 *
 * @param {string} titleText
 * @param {string} message
 * @param {function():void} [onhide]
 */
function alert(titleText, message, onhide) {
  if (!message && titleText) {
    message = titleText;
    titleText = '';
  }

  const regex = /(https?:\/\/[^\s]+)/g;
  if (regex.test(message)) {
    message = message.replace(regex, function (url) {
      return `<a href='${url}'>${url}</a>`;
    });
  }

  const titleSpan = tag('strong', {
    className: 'title',
    textContent: titleText,
  });
  const messageSpan = tag('span', {
    className: 'message scroll',
    innerHTML: message,
  });
  const okBtn = tag('button', {
    textContent: strings.ok,
    onclick: hide,
  });
  const alertDiv = tag('div', {
    className: 'prompt alert',
    children: [
      titleSpan,
      messageSpan,
      tag('div', {
        className: 'button-container',
        child: okBtn,
      }),
    ],
  });
  const mask = tag('span', {
    className: 'mask',
    onclick: hide,
  });

  actionStack.push({
    id: 'alert',
    action: hideAlert,
  });

  app.append(alertDiv, mask);
  window.restoreTheme(true);

  function hideAlert() {
    alertDiv.classList.add('hide');
    window.restoreTheme();
    setTimeout(() => {
      app.removeChild(alertDiv);
      app.removeChild(mask);
    }, 300);
  }

  function hide() {
    if (onhide) onhide();
    actionStack.remove('alert');
    hideAlert();
  }
}

export default alert;
