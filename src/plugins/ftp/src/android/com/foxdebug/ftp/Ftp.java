package com.foxdebug.ftp;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.lang.SecurityException;
import java.lang.reflect.Method;
import java.net.SocketException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URISyntaxException;
import java.util.HashMap;
import org.apache.commons.net.ftp.*;
import org.apache.commons.net.ftp.parser.ParserInitializationException;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Ftp extends CordovaPlugin {

  HashMap<String, FTPClient> ftpProfiles = new HashMap<String, FTPClient>();
  Context context;
  Activity activity;
  String connectionID;

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
      Method method =
        this.getClass()
          .getDeclaredMethod(action, JSONArray.class, CallbackContext.class);
      if (method != null) {
        method.invoke(this, args, callback);
        return true;
      }
      return false;
    } catch (NoSuchMethodException e) {
      callback.error(e.getMessage());
      return false;
    } catch (SecurityException e) {
      callback.error(e.getMessage());
      return false;
    } catch (Exception e) {
      callback.error(e.getMessage());
      return false;
    }
  }

  public void connect(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String host = getJSONValueString(args, 0);
              int port = getJSONValueInt(args, 1);
              String username = getJSONValueString(args, 2);
              String password = getJSONValueString(args, 3);
              String defaultPath = getJSONValueString(args, 4);
              String sequirtyType = getJSONValueString(args, 5);
              String connectionMode = getJSONValueString(args, 6);
              String encryption = getJSONValueString(args, 7);
              String encoding = getJSONValueString(args, 8);
              String ftpId = getFtpId(host, port, username);
              int reply;

              FTPClient ftp;

              if (ftpProfiles.containsKey(ftpId)) {
                ftp = ftpProfiles.get(ftpId);
                reply = ftp.getReplyCode();
                if (ftp.isConnected() && FTPReply.isPositiveCompletion(reply)) {
                  Log.d("FTP", "FTPClient (" + ftpId + ") is connected");
                  callback.success(ftpId);
                  return;
                }
                Log.d("FTP", "FTPClient (" + ftpId + ") is not connected");
                ftp.disconnect();
              } else {
                Log.d("FTP", "Creating new FTPClient (" + ftpId + ")");
                ftp = new FTPClient();
                ftpProfiles.put(ftpId, ftp);
              }

              ftp.connect(host, port);
              ftp.setControlKeepAliveTimeout(300);
              if (connectionMode.equals("active")) {
                Log.d("FTP", "Entering Local Active mode");
                ftp.enterLocalActiveMode();
              } else {
                Log.d("FTP", "Entering Passive Active mode");
                ftp.enterLocalPassiveMode();
              }

              ftp.login(username, password);

              reply = ftp.getReplyCode();
              if (!FTPReply.isPositiveCompletion(reply)) {
                ftp.disconnect();
                callback.error("FTP server refused connection.");
                return;
              }

              ftp.setListHiddenFiles(true);

              ftpProfiles.put(ftpId, ftp);
              callback.success(ftpId);
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void listDirectory(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                path = "/";
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              FTPFile[] files = ftp.listFiles(path);
              Log.d("FTP", "Listing files in " + path);
              Log.d("FTP", "Found " + files.length + " files.");
              JSONArray jsonFiles = new JSONArray();
              for (FTPFile file : files) {
                JSONObject jsonFile = new JSONObject();
                String filename = file.getName();

                if (filename.equals(".") || filename.equals("..")) {
                  continue;
                }

                jsonFile.put("name", filename);
                jsonFile.put("size", file.getSize());
                jsonFile.put("isDirectory", file.isDirectory());
                jsonFile.put("isFile", file.isFile());
                jsonFile.put("isSymbolicLink", file.isSymbolicLink());
                jsonFile.put("link", file.getLink());
                jsonFile.put("url", joinPath(path, filename));
                jsonFile.put(
                  "lastModified",
                  file.getTimestamp().getTimeInMillis()
                );
                jsonFile.put(
                  "canWrite",
                  file.hasPermission(
                    FTPFile.USER_ACCESS,
                    FTPFile.WRITE_PERMISSION
                  )
                );
                jsonFile.put(
                  "canRead",
                  file.hasPermission(
                    FTPFile.USER_ACCESS,
                    FTPFile.READ_PERMISSION
                  )
                );
                jsonFiles.put(jsonFile);
              }
              callback.success(jsonFiles);
            } catch (ParserInitializationException e) {
              callback.error(e.getMessage());
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void exists(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                path = "/";
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              // check if file or directory exists
              FTPFile[] ftpFiles = ftp.listFiles(path);
              if (ftpFiles.length > 0) {
                callback.success(1);
              } else {
                callback.success(0);
              }
            } catch (ParserInitializationException e) {
              callback.error(e.getMessage());
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void sendNoOp(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }
              ftp.sendNoOp();
              callback.success();
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void deleteFile(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                callback.error("Path is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              ftp.deleteFile(path);
              callback.success();
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void deleteDirectory(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                callback.error("Path is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              // delete all files in the directory
              emptyDirectory(path, ftp);

              ftp.removeDirectory(path);
              callback.success();
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void rename(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String oldPath = getJSONValueString(args, 1);
              String newPath = getJSONValueString(args, 2);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (oldPath == null || oldPath.isEmpty()) {
                callback.error("Old path is required.");
                return;
              }

              if (newPath == null || newPath.isEmpty()) {
                callback.error("New path is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              ftp.rename(oldPath, newPath);
              callback.success();
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void downloadFile(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);
              String localFilePath = getJSONValueString(args, 2);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                callback.error("Path is required.");
                return;
              }

              if (localFilePath == null || localFilePath.isEmpty()) {
                callback.error("Local file is required.");
                return;
              }

              URI uri = new URI(localFilePath);
              File localFile = new File(uri);
              FTPClient ftp = ftpProfiles.get(ftpId);

              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              InputStream inputStream = ftp.retrieveFileStream(path);
              if (inputStream == null) {
                callback.error("File not found.");
                return;
              }

              FileOutputStream outputStream = new FileOutputStream(localFile);
              byte[] buffer = new byte[1024];
              int bytesRead = -1;
              while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
              }
              outputStream.close();
              inputStream.close();

              if (!ftp.completePendingCommand()) {
                ftp.logout();
                ftp.disconnect();
                callback.error("File transfer failed.");
                return;
              }

              callback.success();
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (URISyntaxException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void uploadFile(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String localFilePath = getJSONValueString(args, 1);
              String remoteFilePath = getJSONValueString(args, 2);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (remoteFilePath == null || remoteFilePath.isEmpty()) {
                callback.error("Path is required.");
                return;
              }

              if (localFilePath == null || localFilePath.isEmpty()) {
                callback.error("Local file is required.");
                return;
              }

              Log.d("FTPUpload", "uploadFile: " + localFilePath);
              URI uri = new URI(localFilePath);
              File localFile = new File(uri);
              FTPClient ftp = ftpProfiles.get(ftpId);

              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              Log.d("FTPUpload", "Destination " + remoteFilePath);
              OutputStream outputStream = ftp.storeFileStream(remoteFilePath);
              if (outputStream == null) {
                callback.error("File not found.");
                return;
              }

              InputStream inputStream = new FileInputStream(localFile);
              byte[] buffer = new byte[1024];
              int bytesRead = -1;
              while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
              }
              outputStream.close();
              inputStream.close();

              if (!ftp.completePendingCommand()) {
                ftp.logout();
                ftp.disconnect();
                callback.error("File transfer failed.");
                return;
              }

              callback.success();
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (URISyntaxException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void getKeepAlive(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              callback.success((int) ftp.getControlKeepAliveTimeout());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void execCommand(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String command = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (command == null || command.isEmpty()) {
                callback.error("Command is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              ftp.sendCommand(command);
              String reply = ftp.getReplyString();
              callback.success(reply);
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
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
            try {
              String ftpId = getJSONValueString(args, 0);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              boolean connected = ftp.isConnected();
              callback.success(connected ? 1 : 0);
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void disconnect(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp != null) {
                ftp.disconnect();
                ftpProfiles.remove(ftpId);
              }
              callback.success();
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void createDirectory(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                callback.error("Path is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              ftp.makeDirectory(path);
              callback.success();
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void changeDirectory(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                callback.error("Path is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              ftp.changeWorkingDirectory(path);
              callback.success();
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void changeToParentDirectory(
    JSONArray args,
    CallbackContext callback
  ) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              ftp.changeToParentDirectory();
              callback.success();
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void getWorkingDirectory(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              String workingDirectory = ftp.printWorkingDirectory();
              callback.success(workingDirectory);
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  public void getStat(JSONArray args, CallbackContext callback) {
    cordova
      .getThreadPool()
      .execute(
        new Runnable() {
          public void run() {
            try {
              String ftpId = getJSONValueString(args, 0);
              String path = getJSONValueString(args, 1);

              if (ftpId == null || ftpId.isEmpty()) {
                callback.error("FTP ID is required.");
                return;
              }

              if (path == null || path.isEmpty()) {
                callback.error("Path is required.");
                return;
              }

              FTPClient ftp = ftpProfiles.get(ftpId);
              if (ftp == null) {
                callback.error("FTP client not found.");
                return;
              }

              FTPFile[] files = ftp.listFiles(path);
              if (files == null || files.length == 0) {
                callback.error("File not found.");
                return;
              }

              FTPFile file = files[0];
              JSONObject stat = new JSONObject();
              stat.put("isFile", file.isFile());
              stat.put("isDirectory", file.isDirectory());
              stat.put("isSymbolicLink", file.isSymbolicLink());
              stat.put("type", file.getType());
              stat.put("size", file.getSize());
              stat.put("name", file.getName());
              stat.put("lastModified", file.getTimestamp().getTimeInMillis());
              stat.put("link", file.getLink());
              stat.put("group", file.getGroup());
              stat.put("user", file.getUser());
              stat.put(
                "canWrite",
                file.hasPermission(
                  FTPFile.USER_ACCESS,
                  FTPFile.WRITE_PERMISSION
                )
              );
              stat.put(
                "canRead",
                file.hasPermission(FTPFile.USER_ACCESS, FTPFile.READ_PERMISSION)
              );

              callback.success(stat);
            } catch (ParserInitializationException e) {
              callback.error(e.getMessage());
            } catch (FTPConnectionClosedException e) {
              callback.error(e.getMessage());
            } catch (IOException e) {
              callback.error(e.getMessage());
            } catch (Exception e) {
              callback.error(e.getMessage());
            }
          }
        }
      );
  }

  private String getFtpId(String host, int port, String username) {
    return username + "@" + host + ":" + port;
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

  private void emptyDirectory(String directory, FTPClient client) {
    try {
      FTPFile[] files = client.listFiles(directory);
      for (FTPFile file : files) {
        if (file.isDirectory()) {
          emptyDirectory(directory + "/" + file.getName(), client);
        } else {
          client.deleteFile(directory + "/" + file.getName());
        }
      }
      client.removeDirectory(directory);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private String joinPath(String p1, String p2) {
    if (!p1.endsWith("/")) {
      p1 += "/";
    }
    return p1 + p2;
  }
}
