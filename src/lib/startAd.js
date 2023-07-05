export default async function startAd() {
  if (!IS_FREE_VERSION || !admob) return;

  const consentStatus = await consent.getConsentStatus();
  if (consentStatus === consent.ConsentStatus.Required) {
    await consent.requestInfoUpdate();
  }

  const formStatus = await consent.getFormStatus();
  if (formStatus === consent.FormStatus.Available) {
    const form = await consent.loadForm();
    form.show();
  }

  await admob.start();

  const banner = new admob.BannerAd({
    adUnitId: 'ca-app-pub-5911839694379275/9157899592', // Production
    // adUnitId: 'ca-app-pub-3940256099942544/6300978111', // Test
    position: 'bottom',
  });

  const interstitial = new admob.InterstitialAd({
    adUnitId: 'ca-app-pub-5911839694379275/9570937608', // Production
    // adUnitId: 'ca-app-pub-3940256099942544/5224354917', // Test
  });

  interstitial.load();

  interstitial.on('dismiss', () => {
    interstitial.load();
  });
  window.ad = banner;
  window.iad = interstitial;
}