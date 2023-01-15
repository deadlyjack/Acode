import helpers from '../utils/helpers';

export default function purchaseListner(onpurchase, onerror) {
  return [
    (purchases) => {
      const [purchase] = purchases;
      if (purchase.purchaseState === iap.PURCAHSE_STATE_PURCHASED) {
        if (!purchase.isAcknowledged) {
          iap.acknowledgePurchase(purchase.purchaseToken, () => {
            onpurchase();
          }, (error) => {
            if (typeof onerror === 'function') onerror(error);
          });
          return;
        }
        onpurchase();
        return;
      }

      const message = purchase.purchaseState === iap.PURCAHSE_STATE_PENDING
        ? strings['purchase pending']
        : strings.failed;

      helpers.error(message);
      if (typeof onerror === 'function') onerror(message);
    },
    (error) => {
      if (error === iap.ITEM_ALREADY_OWNED) {
        onpurchase();
        return;
      }

      let message = error === iap.USER_CANCELED
        ? strings.failed
        : strings.canceled;

      if (typeof onerror === 'function') onerror(message);
    }
  ];
}