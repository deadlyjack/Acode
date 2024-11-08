package com.foxdebug.browser;

import android.content.Intent;
import com.foxdebug.browser.BrowserActivity;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Plugin extends CordovaPlugin {

  @Override
  public boolean execute(
    String action,
    JSONArray args,
    CallbackContext callbackContext
  ) throws JSONException {
    if (action.equals("open")) {
      String url = args.getString(0);
      JSONObject theme = args.getJSONObject(1);
      boolean onlyConsole = args.optBoolean(2, false);
      String themeString = theme.toString();
      Intent intent = new Intent(cordova.getActivity(), BrowserActivity.class);

      intent.putExtra("url", url);
      intent.putExtra("theme", themeString);
      intent.putExtra("onlyConsole", onlyConsole);
      cordova.getActivity().startActivity(intent);
      callbackContext.success("Opened browser");
      return true;
    }
    return false;
  }
}
