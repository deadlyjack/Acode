import quickTools from './handlers/quickTools';
import constants from './constants';

export default {
  beforeRender() {
    //animation
    if (!appSettings.value.animation) app.classList.add('no-animation');

    //apply theme
    if (
      /free/.test(BuildInfo.packageName) &&
      appSettings.value.appTheme === 'dark'
    ) {
      appSettings.value.appTheme = 'default';
      appSettings.update();
    }

    //full-screen
    if (appSettings.value.fullscreen) Acode.exec('enable-fullscreen');

    //disable-floating-button
    if (appSettings.value.disableFloatingButton)
      root.classList.add('disable-floating-button');

    //setup vibration
    app.addEventListener('touchstart', function (e) {
      const el = e.target;

      if (el instanceof HTMLElement && el.hasAttribute('vibrate')) {
        if (appSettings.value.vibrateOnTap)
          navigator.vibrate(constants.VIBRATION_TIME);
      }
    });

    //setup autosave
    const autoSave = parseInt(appSettings.value.autosave);
    if (autoSave && autoSave >= 1000) {
      saveInterval = setInterval(() => {
        editorManager.files.map((file) => {
          if (!file.readOnly && file.uri && file.isUnsaved && !file.isSaving)
            Acode.exec('save', false);
        });
      }, autoSave);
    }
  },
  afterRender() {
    //quick-tools
    if (appSettings.value.quickTools) quickTools.actions('enable-quick-tools');
  },
};
