import helpers from "../utils/helpers";

let callback;

export default async function removeAds() {
  return new Promise((resolve, reject) => {
    iap.getProducts(['acode_pro'], (products) => {
      const [product] = products;

      iap.setPurchaseUpdatedListener((purchases) => {
        const [purchase] = purchases;
        if (purchase.purchaseState === iap.PURCAHSE_STATE_PURCHASED) {
          onpurchase();
          resolve();
          return;
        }

        const message = purchase.purchaseState === iap.PURCAHSE_STATE_PENDING
          ? strings['purchase pending']
          : strings.failed;

        helpers.error(message);
        reject(message)
      }, (error) => {
        if (error === iap.ITEM_ALREADY_OWNED) {
          onpurchase();
          resolve();
          return;
        }

        let message = error === iap.USER_CANCELED
          ? strings.failed
          : strings.canceled;

        helpers.error(message);
        reject(message);
      });

      iap.purchase(product.json, (code) => {
        console.log(code);
      }, (err) => {
        alert(strings.error, err);
      });
    });
  });
}

function onpurchase() {
  helpers.hideAd(true);
  localStorage.setItem('acode_pro', 'true');
  window.IS_FREE_VERSION = false;
  toast(strings['thank you :)']);
  if (typeof callback === 'function') callback();
}

Object.defineProperty(removeAds, 'callback', {
  set: (value) => {
    callback = value;
  }
});
