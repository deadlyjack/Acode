import purchaseListener from 'handlers/purchase';
import helpers from "utils/helpers";

let callback;

export default function removeAds() {
  return new Promise((resolve, reject) => {
    iap.getProducts(['acode_pro_new'], (products) => {
      const [product] = products;

      iap.setPurchaseUpdatedListener(...purchaseListener(onpurchase, reject));

      iap.purchase(product.json, (code) => {
        // ignore
      }, (err) => {
        alert(strings.error, err);
      });
    });

    function onpurchase() {
      resolve();
      helpers.hideAd(true);
      localStorage.setItem('acode_pro', 'true');
      window.IS_FREE_VERSION = false;
      toast(strings['thank you :)']);
      if (typeof callback === 'function') callback();
    }
  });
}

Object.defineProperty(removeAds, 'callback', {
  set: (value) => {
    callback = value;
  }
});
