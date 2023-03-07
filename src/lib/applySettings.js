import { actions } from '../handlers/quickTools';
import constants from './constants';
import appSettings from '../lib/settings';
import fonts from './fonts';
import themes from './themes';

export default {
  beforeRender() {
    //animation
    appSettings.applyAnimationSetting();

    //full-screen
    if (appSettings.value.fullscreen) {
      acode.exec('enable-fullscreen');
    }

    //setup vibration
    app.addEventListener('click', function (e) {
      const $target = e.target;
      if ($target.hasAttribute('vibrate') && appSettings.value.vibrateOnTap) {
        navigator.vibrate(constants.VIBRATION_TIME);
      }
    });

    system.setInputType(appSettings.value.keyboardMode);
    window.restoreTheme();
  },
  afterRender() {
    const { value: settings } = appSettings;
    if (!settings.floatingButton) {
      root.classList.add('hide-floating-button');
    }

    actions('set-quick-tools-height', settings.quickTools);
    fonts.setFont(settings.editorFont);
    themes.apply(settings.appTheme);
  },
};
