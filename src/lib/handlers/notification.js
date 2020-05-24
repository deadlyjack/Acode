import constants from "../constants";
import select from "../../components/dialogboxes/select";

export default function notification() {
  cordova.plugins.notification.local.on('click', e => {
    const id = e.id;
    const ids = constants.notification;
    switch (id) {
      case ids.EXIT_FULL_SCREEN:
        Acode.exec("disable-fullscreen");
        appSettings.value.fullscreen = false;
        appSettings.update();
        cordova.plugins.notification.local.clear(id);
        break;

      case ids.SUPPORT_ACODE:
        select("Support Acode", [
            [constants.PATREON, "Patreon", "patreon"],
            [constants.PAYPAL, "PayPal", "paypal"],
            [constants.PAID_VERSION, "Download paid version", "googleplay"]
          ])
          .then(res => {
            window.open(res, '_system');
          });
        break;

      default:
        break;
    }
  });
}