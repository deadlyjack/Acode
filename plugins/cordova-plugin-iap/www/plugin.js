module.exports = {
  getProducts: function (productIds, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Iap', 'getProducts', [productIds]);
  },
  setPurchaseUpdatedListener: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Iap', 'setPurchaseUpdatedListener', []);
  },
  startConnection: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Iap', 'startConnection', []);
  },
  consume: function (productId, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Iap', 'consume', [productId]);
  },
  purchase: function (productId, onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Iap', 'purchase', [productId]);
  },
  getPurchases: function (onSuccess, onFail) {
    cordova.exec(onSuccess, onFail, 'Iap', 'getPurchases', []);
  },
  BILLING_UNAVAILABLE: 3,
  DEVELOPER_ERROR: 5,
  ERROR: 6,
  FEATURE_NOT_SUPPORTED: -2,
  ITEM_ALREADY_OWNED: 7,
  ITEM_NOT_OWNED: 8,
  ITEM_UNAVAILABLE: 4,
  OK: 0,
  SERVICE_DISCONNECTED: -1,
  SERVICE_TIMEOUT: -3,
  SERVICE_TIMEOUT: 2,
  USER_CANCELED: 1
};