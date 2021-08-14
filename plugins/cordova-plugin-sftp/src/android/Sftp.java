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
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
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
  private CallbackContext callback;
  private Context context;
  private Activity activity;

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
    callback = callbackContext;
    int argLen = args.length();

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
                  arg4
                );
                break;
              case "connect-key":
                connectUsingKeyFile(
                  arg1,
                  getJSONValueInt(args, 1),
                  arg3,
                  arg4,
                  arg5
                );
                break;
              case "getfile":
                getFile(arg1, arg2);
                break;
              case "putfile":
                putFile(arg1, arg2);
                break;
              case "exec":
                exec(arg1);
                break;
              case "close":
                close();
                break;
              case "isconnected":
                isConnected();
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
    String password
  ) {
    try {
      ssh = new SshClient(host, port, username, password.toCharArray());
      if (ssh.isConnected()) {
        callback.success();
        return;
      }

      callback.error("Cannot connect");
    } catch (SshException e) {
      callback.error(e.getMessage());
      Log.e("connectUsingPassword", "Cannot connect", e);
    } catch (IOException e) {
      callback.error(e.getMessage());
      Log.e("connectUsingPassword", "Cannot connect", e);
    } catch (Error e) {
      callback.error(e.getMessage());
      Log.e("connectUsingKeyFile", "Cannot connect", e);
    }
  }

  private void connectUsingKeyFile(
    String host,
    int port,
    String username,
    String keyFile,
    String passphrase
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
        callback.success();
        return;
      }

      callback.error("Cannot connect");
    } catch (InvalidPassphraseException e) {
      callback.error(e.getMessage());
      Log.e("connectUsingKeyFile", "Cannot connect", e);
    } catch (SshException e) {
      callback.error(e.getMessage());
      Log.e("connectUsingKeyFile", "Cannot connect", e);
    } catch (IOException e) {
      callback.error(e.getMessage());
      Log.e("connectUsingKeyFile", "Cannot connect", e);
    } catch (SecurityException e) {
      callback.error(e.getMessage());
      Log.e("connectUsingKeyFile", "Cannot connect", e);
    }
  }

  private void exec(String command) {
    try {
      if (ssh != null) {
        String res = ssh.executeCommand(command);
        callback.success(res);
      }
      callback.error("Not connected");
    } catch (IOException e) {
      callback.error(e.getMessage());
      Log.e("execCommand", "Cannot execute command", e);
    }
  }

  private void getFile(String filename, String localFilename) {
    try {
      if (ssh != null) {
        File file = new File(localFilename);
        ssh.getFile(filename, file);
        callback.success();
        return;
      }
      callback.error("Not connected");
    } catch (IOException e) {
      callback.error(e.getMessage());
    }
  }

  private void putFile(String filename, String localFilename) {
    try {
      if (ssh != null) {
        File file = new File(localFilename);
        ssh.putFile(file, filename);
        callback.success();
        return;
      }
      callback.error("Not connected");
    } catch (IOException e) {
      callback.error(e.getMessage());
    }
  }

  private void close() {
    try {
      if (ssh != null) {
        ssh.close();
        callback.success();
        return;
      }
      callback.error("Not connected");
    } catch (IOException e) {
      callback.error(e.getMessage());
    }
  }

  private void isConnected() {
    if (ssh != null && ssh.isConnected()) {
      callback.success(1);
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
}
