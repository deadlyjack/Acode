import tag from 'html-tag-js';

export default function toast(message, duration) {
  const $oldToast = tag.get('#toast');
  const $toast = tag('span', {
    id: 'toast',
    textContent: message,
  });

  Object.defineProperties($toast, {
    hide: {
      value() {
        this.classList.add('hide');
        setTimeout(() => {
          this.remove();
          const $toast = toastQueue.splice(0, 1)[0];
          if ($toast) $toast.show();
        }, 500);
      },
    },
    show: {
      value() {
        app.append(this);

        setTimeout(() => {
          this.hide();
        }, duration || 3000);
      },
    },
  });

  if (!$oldToast) {
    $toast.show();
  } else {
    toastQueue.push($toast);
  }
}
