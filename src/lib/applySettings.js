import quickTools from './handlers/quickTools';
import constants from './constants';

export default {
  beforeRender() {
    //animation
    appSettings.applyAnimationSetting();

    //full-screen
    if (appSettings.value.fullscreen) acode.exec('enable-fullscreen');

    //disable-floating-button
    if (appSettings.value.disableFloatingButton)
      root.classList.add('disable-floating-button');

    //setup vibration
    let $target;
    app.addEventListener('touchstart', function (e) {
      $target = e.target;
    });

    app.addEventListener('touchmove', function (e) {
      $target = null;
    });

    app.addEventListener('touchend', function (e) {
      if (e.target === $target) {
        if ($target.hasAttribute('vibrate') && appSettings.value.vibrateOnTap) {
          navigator.vibrate(constants.VIBRATION_TIME);
        }
      }

      $target = null;
    });

    //setup autosave
    const autoSave = parseInt(appSettings.value.autosave);
    if (autoSave && autoSave >= 1000) {
      saveInterval = setInterval(() => {
        editorManager.files.map((file) => {
          if (!file.readOnly && file.uri && file.isUnsaved && !file.isSaving)
            acode.exec('save', false);
        });
      }, autoSave);
    }

    system.setInputType(appSettings.value.keyboardMode);
  },
  afterRender() {
    //quick-tools
    if (appSettings.value.quickTools) {
      quickTools.actions('enable-quick-tools');
    }
  },
};
