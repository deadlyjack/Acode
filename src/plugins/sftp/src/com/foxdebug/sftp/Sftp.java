package com.foxdebug.sftp;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.util.Log;
import androidx.documentfile.provider.DocumentFile;
import com.sshtools.client.PublicKeyAuthenticator;
import com.sshtools.client.SshClient;
import com.sshtools.common.publickey.InvalidPassphraseException;
import com.sshtools.common.publickey.SshKeyUtils;
import com.sshtools.common.ssh.SshException;
import com.sshtools.common.ssh.components.SshKeyPair;
import com.sshtools.common.util.FileUtils;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.SecurityException;
import java.lang.reflect.Method;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.channels.UnresolvedAddressException;
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
    String action,
    JSONArray args,
    CallbackContext callback
  ) {
    try {
      Method method = getClass()
        .getDeclaredMethod(action, JSONArray.class, CallbackContext.class);

      if (method != null) {
        method.invoke(this, args, callback);
        return true;
      }
    } catch (NoSuchMethodException e) {
      callback.error("Method not found: " + action);
      return false;
    } catch (SecurityException e) {
      callback.error("Security exception: " + e.getMessage());
      return false;
    } catch (Exception e) {
      callback.error("Exception: " + e.getMessage());
      return false;
    }

    return false;
  }

  public void connectUsingPassword(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String host = args.optString(0);
              int port = args.optInt(1);
              String username = args.optString(2);
              String password = args.optString(3);
              ssh = new SshClient(host, port, username, password.toCharArray());
              if (ssh.isConnected()) {
                connectionID = username + "@" + host;
                callback.success();
                Log.d("connectUsingPassword", "Connected successfully");
                return;
              }

              callback.error("Cannot connect");
            } catch (
              UnresolvedAddressException | SshException | IOException e
            ) {
              callback.error(errMessage(e));
              Log.e("connectUsingPassword", "Cannot connect", e);
            }
          }
        }
      );
  }

  public void connectUsingKeyFile(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String host = args.optString(0);
              int port = args.optInt(1);
              String username = args.optString(2);
              String keyFile = args.optString(3);
              String passphrase = args.optString(4);
              DocumentFile file = DocumentFile.fromSingleUri(
                context,
                Uri.parse(keyFile)
              );
              Uri uri = file.getUri();
              ContentResolver contentResolver = context.getContentResolver();
              InputStream in = contentResolver.openInputStream(uri);
              SshKeyPair pair = SshKeyUtils.getPrivateKey(in, passphrase);

              try {
                pair = SshKeyUtils.makeRSAWithSHA256Signature(pair);
                pair = SshKeyUtils.makeRSAWithSHA512Signature(pair);
              } catch (Exception e) {
                // ignore
              }

              ssh = new SshClient(host, port, username);

              ssh.authenticate(new PublicKeyAuthenticator(pair), 30000);

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
        }
      );
  }

  public void exec(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String command = args.optString(0);
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
        }
      );
  }

  public void getFile(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String filename = args.optString(0);
              String localFilename = args.optString(1);
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
        }
      );
  }

  public void putFile(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String filename = args.optString(0);
              String localFilename = args.optString(1);
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
        }
      );
  }

  public void close(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
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
        }
      );
  }

  public void isConnected(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            if (ssh != null && ssh.isConnected()) {
              callback.success(connectionID);
              return;
            }

            callback.success(0);
          }
        }
      );
  }

  public String errMessage(Exception e) {
    String res = e.getMessage();
    if (res == null || res.equals("")) {
      return e.toString();
    }

    return res;
  }
}
