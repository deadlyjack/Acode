import quickTools from '../handlers/quickTools';
import constants from './constants';

export default {
  beforeRender() {
    //animation
    appSettings.applyAnimationSetting();

    //full-screen
    if (appSettings.value.fullscreen) {
      acode.exec('enable-fullscreen');
    }

    //disable-floating-button
    if (appSettings.value.disableFloatingButton) {
      root.classList.add('disable-floating-button');
    }

    //setup vibration
    app.addEventListener('click', function (e) {
      const $target = e.target;
      if ($target.hasAttribute('vibrate') && appSettings.value.vibrateOnTap) {
        navigator.vibrate(constants.VIBRATION_TIME);
      }
    });

    system.setInputType(appSettings.value.keyboardMode);
  },
  afterRender() {
    appSettings.applyAutoSaveSetting();
    //quick-tools
    if (appSettings.value.quickTools) {
      quickTools.actions('enable-quick-tools');
    }
  },
};
