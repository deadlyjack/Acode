`package com.foxdebug.system;

import android.os.Bundle;
import org.apache.cordova.*;

public class BrowserActivity extends CordovaActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    String launchUrl = "file:///android_asset/www/browser.html";
    Bundle extras = getIntent().getExtras();
    if (extras != null) {
      String action = extras.getString("action");
      String value = extras.getString("value");
      if (extras.getBoolean("cdvStartInBackground", false)) {
        moveTaskToBack(true);
      }
      if (action != null && value != null) loadUrl(
        launchUrl + "?" + action + "=" + value
      );
      return;
    }

    loadUrl(launchUrl);
  }
}`;
