package com.foxdebug.system;

import android.os.Bundle;
import android.content.Intent;
import android.app.IntentService;
import android.util.Log;
import org.apache.cordova.CallbackContext;
import org.json.JSONObject;
import org.json.JSONException;

interface Callback {
  void run(JSONObject result);
}

public class PluginResultService extends IntentService {

  public static final String EXTRA_EXECUTION_ID = "execution_id";
  public static final String PLUGIN_SERVICE_LABEL = "PluginResultService";

  private static int EXECUTION_ID = 1000;
  private static final String LOG_TAG = "PluginResultService";
  
  private static Callback m_Callback = null;

  public PluginResultService() {
    super(PLUGIN_SERVICE_LABEL);
  }

  @Override
  protected void onHandleIntent(Intent intent) {
    if (intent == null) return;

    Log.d(LOG_TAG, PLUGIN_SERVICE_LABEL + " received execution result");
    final Bundle resultBundle = intent.getBundleExtra("result");

    if (resultBundle == null) {
      Log.e(LOG_TAG, "The intent does not contain the result bundle");
      return;
    }

    final int executionId = intent.getIntExtra(EXTRA_EXECUTION_ID, 0);

    Callback callback = PluginResultService.m_Callback;

    if (callback != null) {
      JSONObject result = new JSONObject();
      
      try {
        result.put("id", executionId);
        result.put(
          "stdoutLength", resultBundle.getString(
            "stdout_original_length", ""
          )
        );
        result.put(
          "stderrLength", resultBundle.getString(
            "stderr_original_length", ""
          )
        );
        result.put(
          "stdout", resultBundle.getString("stdout", "")
        );
        result.put(
          "stderr", resultBundle.getString("stderr", "")
        );
        result.put(
          "exitCode", resultBundle.getInt("exitCode", 0)
        );
        result.put(
          "errCode", resultBundle.getInt("err", 0)
        );
        result.put(
          "errMsg", resultBundle.getString("errmsg", "")
        );
  
        callback.run(result);
      } catch (JSONException e) {}
    }
  }

  public static synchronized int getNextExecutionId() {
    return EXECUTION_ID++;
  }
  
  public static void setCallback(Callback callback) {
    m_Callback = callback;
  }
}