function Admob() {
  AdMob.setOptions({
    isTesting: false,
    bgColor: '#313131'
  });

  AdMob.createBanner({
    adId: 'ca-app-pub-9184710420764586/3924534388',
    position: AdMob.AD_POSITION.BOTTOM_CENTER,
    adSize: AdMob.AD_SIZE.SMART_BANNER,
    overlap: true,
    autoShow: false
  });

  AdMob.prepareInterstitial({
    adId: 'ca-app-pub-9184710420764586/8163726949',
    autoShow: false
  });
}

export default Admob;