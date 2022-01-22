package com.foxdebug.sftp;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.util.Log;
import androidx.documentfile.provider.DocumentFile;
import com.sshtools.client.SshClient;
import com.sshtools.common.publickey.InvalidPassphraseException;
import com.sshtools.common.publickey.SshKeyUtils;
import com.sshtools.common.ssh.SshException;
import com.sshtools.common.util.FileUtils;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.lang.SecurityException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.channels.UnresolvedAddressException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.apache.commons.io.IOUtils;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Sftp extends CordovaPlugin {

  private SshClient ssh;
  private Context context;
  private Activity activity;
  private String connectionID;

  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    context = cordova.getContext();
    activity = cordova.getActivity();
  }

  public boolean execute(
    final String action,
    final JSONArray args,
    final CallbackContext callbackContext
  )
    throws JSONException {
    final String arg1 = getJSONValueString(args, 0);
    final String arg2 = getJSONValueString(args, 1);
    final String arg3 = getJSONValueString(args, 2);
    final String arg4 = getJSONValueString(args, 3);
    final String arg5 = getJSONValueString(args, 4);

    switch (action) {
      case "connect-pass":
      case "connect-key":
      case "getfile":
      case "putfile":
      case "close":
      case "exec":
      case "isconnected":
        break;
      default:
        return false;
    }

    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            switch (action) {
              case "connect-pass":
                connectUsingPassword(
                  arg1,
                  getJSONValueInt(args, 1),
                  arg3,
                  arg4,
                  callbackContext
                );
                break;
              case "connect-key":
                connectUsingKeyFile(
                  arg1,
                  getJSONValueInt(args, 1),
                  arg3,
                  arg4,
                  arg5,
                  callbackContext
                );
                break;
              case "getfile":
                getFile(arg1, arg2, callbackContext);
                break;
              case "putfile":
                putFile(arg1, arg2, callbackContext);
                break;
              case "exec":
                exec(arg1, callbackContext);
                break;
              case "close":
                close(callbackContext);
                break;
              case "isconnected":
                isConnected(callbackContext);
                break;
              default:
                break;
            }
          }
        }
      );

    return true;
  }

  private void connectUsingPassword(
    String host,
    int port,
    String username,
    String password,
    CallbackContext callback
  ) {
    try {
      ssh = new SshClient(host, port, username, password.toCharArray());
      if (ssh.isConnected()) {
        connectionID = username + "@" + host;
        callback.success();
        Log.d("connectUsingPassword", "Connected successfully");
        return;
      }

      callback.error("Cannot connect");
    } catch (UnresolvedAddressException | SshException | IOException e) {
      callback.error(errMessage(e));
      Log.e("connectUsingPassword", "Cannot connect", e);
    }
  }

  private void connectUsingKeyFile(
    String host,
    int port,
    String username,
    String keyFile,
    String passphrase,
    CallbackContext callback
  ) {
    try {
      DocumentFile file = DocumentFile.fromSingleUri(
        context,
        Uri.parse(keyFile)
      );
      Uri uri = file.getUri();
      ContentResolver contentResolver = context.getContentResolver();
      InputStream in = contentResolver.openInputStream(uri);

      ssh =
        new SshClient(
          host,
          port,
          username,
          SshKeyUtils.getPrivateKey(in, passphrase)
        );

      if (ssh.isConnected()) {
        connectionID = username + "@" + host;
        callback.success();
        return;
      }

      callback.error("Cannot connect");
    } catch (
      InvalidPassphraseException
      | UnresolvedAddressException
      | SshException
      | IOException
      | SecurityException e
    ) {
      callback.error(errMessage(e));
      Log.e("connectUsingKeyFile", "Cannot connect", e);
    }
  }

  private void exec(String command, CallbackContext callback) {
    try {
      if (ssh != null) {
        JSONObject res = new JSONObject();
        StringBuffer buffer = new StringBuffer();
        int code = ssh.executeCommandWithResult(command, buffer);
        String result = buffer.toString();
        res.put("code", code);
        res.put("result", result);
        callback.success(res);
        return;
      }
      callback.error("Not connected");
    } catch (IOException | JSONException e) {
      callback.error(errMessage(e));
    }
  }

  private void getFile(
    String filename,
    String localFilename,
    CallbackContext callback
  ) {
    try {
      if (ssh != null) {
        URI uri = new URI(localFilename);
        File file = new File(uri);
        file.createNewFile();
        ssh.getFile(filename, file);
        callback.success();
        return;
      }
      Log.d("getFile", "ssh is null");
      callback.error("Not connected");
    } catch (IOException | URISyntaxException e) {
      callback.error(errMessage(e));
    }
  }

  private void putFile(
    String filename,
    String localFilename,
    CallbackContext callback
  ) {
    try {
      if (ssh != null) {
        URI uri = new URI(localFilename);
        File file = new File(uri);
        ssh.putFile(file, filename);
        callback.success();
        return;
      }
      callback.error("Not connected");
    } catch (IOException | URISyntaxException e) {
      callback.error(errMessage(e));
    }
  }

  private void close(CallbackContext callback) {
    try {
      if (ssh != null) {
        ssh.close();
        callback.success();
        return;
      }
      callback.error("Not connected");
    } catch (IOException e) {
      callback.error(errMessage(e));
    }
  }

  private void isConnected(CallbackContext callback) {
    if (ssh != null && ssh.isConnected()) {
      callback.success(connectionID);
      return;
    }

    callback.success(0);
  }

  private String getJSONValueString(JSONArray ar, int index) {
    try {
      return ar.getString(index);
    } catch (JSONException e) {
      return null;
    }
  }

  private int getJSONValueInt(JSONArray ar, int index) {
    try {
      return ar.getInt(index);
    } catch (JSONException e) {
      return 0;
    }
  }

  private String errMessage(Exception e) {
    String res = e.getMessage();
    if (res == null || res.equals("")) {
      return e.toString();
    }

    return res;
  }
}
