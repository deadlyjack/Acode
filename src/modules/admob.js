function Admob() {
  AdMob.setOptions({
    isTesting: false,
    bgColor: '#313131'
  });

  AdMob.createBanner({
    adId: 'ca-app-pub-9292130311136531/6117546903',
    position: AdMob.AD_POSITION.BOTTOM_CENTER,
    adSize: AdMob.AD_SIZE.SMART_BANNER,
    overlap: true,
    autoShow: false
  });

  AdMob.prepareInterstitial({
    adId: 'ca-app-pub-9292130311136531/3160211077',
    autoShow: false
  });
}

export default Admob;