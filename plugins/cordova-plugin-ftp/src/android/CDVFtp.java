/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

package io.github.xfally.cordova.plugin.ftp;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

import android.util.Log;

import it.sauronsoftware.ftp4j.FTPClient;
import it.sauronsoftware.ftp4j.FTPDataTransferListener;
import it.sauronsoftware.ftp4j.FTPFile;
import it.sauronsoftware.ftp4j.FTPReply;
import it.sauronsoftware.ftp4j.FTPConnector;

public class CDVFtp extends CordovaPlugin {
    public static final String TAG = CDVFtp.class.getSimpleName();
    private String rootPath = "/";
    private FTPClient client = null;
    private String homeDirectoryPath = null;

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext)
            throws JSONException {
        if (action.equals("connect")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        connect(args.getString(0), args.getString(1), args.getString(2), args.getString(3),
                                args.getString(4), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("list")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        list(args.getString(0), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("createDirectory")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        createDirectory(args.getString(0), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("deleteDirectory")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        deleteDirectory(args.getString(0), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("deleteFile")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        deleteFile(args.getString(0), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("uploadFile")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        uploadFile(args.getString(0), args.getString(1), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("downloadFile")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        downloadFile(args.getString(0), args.getString(1), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("cancelAllRequests")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        cancelAllRequests(callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("disconnect")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        disconnect(callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("rename")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        rename(args.getString(0), args.getString(1), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("currentDirectory")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        currentDirectory(callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("homeDirectory")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        homeDirectory(callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else if (action.equals("exists")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        exists(args.getString(0), callbackContext);
                    } catch (Exception e) {
                        callbackContext.error(e.toString());
                    }
                }
            });
        } else {
            return false;
        }
        // This action/cmd is found/supported
        return true;
    }

    private void connect(String hostname, String username, String password, String mode, String type,
            CallbackContext callbackContext) {
        if (hostname == null || hostname.length() <= 0) {
            callbackContext.error("Expected hostname.");
        } else {
            if (username == null && password == null) {
                username = "anonymous";
                password = "anonymous@";
            }

            try {

                String[] address = hostname.split(":");
                int port = 21;
                String host = null;

                if (address.length == 2) {
                    port = Integer.parseInt(address[1]);
                    host = address[0];
                } else {
                    host = hostname;
                }

                if (this.client != null && this.client.isConnected()) {
                    String cUsername = this.client.getUsername();
                    String cHost = this.client.getHost();
                    String cPass = this.client.getPassword();
                    int cPort = this.client.getPort();

                    Boolean isAlreadyConnected = host.equals(cHost) && username.equals(cUsername)
                            && password.equals(cPass) && port == cPort;

                    if (isAlreadyConnected) {
                        callbackContext.success("OK");
                        return;
                    } else {
                        this.client.disconnect(true);
                        this.client.setAutoNoopTimeout(0);
                    }

                }

                this.client = new FTPClient();
                this.client.setAutoNoopTimeout(30000);

                if (type.equals("ftps"))
                    this.client.setSecurity(FTPClient.SECURITY_FTPS);
                else if (type.equals("ftpes"))
                    this.client.setSecurity(FTPClient.SECURITY_FTPES);

                if (mode.equals("active"))
                    this.client.setPassive(false);
                else if (mode.equals("passive"))
                    this.client.setPassive(true);

                this.client.connect(host, port);
                this.client.login(username, password);

                this.homeDirectoryPath = this.client.currentDirectory();

                callbackContext.success("OK");
            } catch (Exception e) {
                this.client = null;
                callbackContext.error(e.toString());
            }
        }
    }

    private void list(String path, CallbackContext callbackContext) {
        try {
            String currentDirectory = this.client.currentDirectory();

            if (path.equals("") || path == null)
                path = currentDirectory;

            if (!currentDirectory.equals(path)) {
                if (!path.endsWith("/"))
                    path = path.concat("/");
                this.client.changeDirectory(path);
            }

            FTPFile[] list = client.list();
            JSONArray fileList = new JSONArray();
            for (FTPFile file : list) {
                String name = file.getName();
                Number type = file.getType();
                String link = file.getLink();
                Number size = file.getSize();
                Date modifiedDate = file.getModifiedDate();
                String modifiedDateString = (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss zzz")).format(modifiedDate);

                JSONObject fileData = new JSONObject();
                fileData.put("name", name);
                fileData.put("type", type);
                fileData.put("link", link);
                fileData.put("size", size);
                fileData.put("modifiedDate", modifiedDateString);
                fileData.put("absolutePath", path + (path.endsWith("/") ? "" : "/") + name);
                fileList.put(fileData);
            }
            callbackContext.success(fileList);
        } catch (Exception e) {
            callbackContext.error(e.toString());
        }
    }

    private void createDirectory(String path, CallbackContext callbackContext) {
        if (path == null) {
            callbackContext.error("Expected path.");
        } else {
            if (!path.endsWith("/")) {
                path = path.concat("/");
            }

            try {
                this.client.changeDirectory(this.rootPath);
                this.client.createDirectory(path);
                callbackContext.success("Create directory OK");
            } catch (Exception e) {
                callbackContext.error(e.toString());
            }
        }
    }

    private void deleteDirectory(String path, CallbackContext callbackContext) {
        if (path == null) {
            callbackContext.error("Expected path.");
        } else {
            if (!path.endsWith("/")) {
                path = path.concat("/");
            }

            try {
                this.client.changeDirectory(this.rootPath);
                this.client.deleteDirectory(path);
                callbackContext.success("Delete directory OK");
            } catch (Exception e) {
                callbackContext.error(e.toString());
            }
        }
    }

    private void deleteFile(String file, CallbackContext callbackContext) {
        if (file == null) {
            callbackContext.error("Expected file.");
        } else {
            try {
                this.client.changeDirectory(this.rootPath);
                this.client.deleteFile(file);
                callbackContext.success("Delete file OK");
            } catch (Exception e) {
                callbackContext.error(e.toString());
            }
        }
    }

    private void uploadFile(String localFile, String remoteFile, CallbackContext callbackContext) {
        if (localFile == null || remoteFile == null) {
            callbackContext.error("Expected localFile and remoteFile.");
        } else {
            try {
                String remoteFilePath = remoteFile.substring(0, remoteFile.lastIndexOf('/') + 1);
                String remoteFileName = remoteFile.substring(remoteFile.lastIndexOf('/') + 1);
                String localFilePath = localFile.substring(0, localFile.lastIndexOf('/') + 1);
                String localFileName = localFile.substring(localFile.lastIndexOf('/') + 1);
                this.client.changeDirectory(remoteFilePath);
                File file = new File(localFile);
                InputStream in = new FileInputStream(file);
                long size = file.length();
                client.upload(remoteFileName, in, 0, 0, new CDVFtpTransferListener(size, callbackContext));
                // refer to CDVFtpTransferListener for transfer percent and completed
            } catch (Exception e) {
                callbackContext.error(e.toString());
            }
        }
    }

    private void downloadFile(String localFile, String remoteFile, CallbackContext callbackContext) {
        if (localFile == null || remoteFile == null) {
            callbackContext.error("Expected localFile and remoteFile.");
        } else {
            try {
                String remoteFilePath = remoteFile.substring(0, remoteFile.lastIndexOf('/') + 1);
                String remoteFileName = remoteFile.substring(remoteFile.lastIndexOf('/') + 1);
                this.client.changeDirectory(remoteFilePath);
                FTPFile[] list = client.list();
                JSONArray fileList = new JSONArray();
                for (FTPFile file : list) {
                    String name = file.getName();
                    // Number type = file.getType();
                    // String link = file.getLink();
                    Number size = file.getSize();
                    if (remoteFileName.equals(name)) {
                        client.download(remoteFileName, new File(localFile),
                                new CDVFtpTransferListener(size.longValue(), callbackContext));
                        // refer to CDVFtpTransferListener for transfer percent and completed
                        return;
                    }
                }
                callbackContext.error("File not found");
                // should never reach here!
            } catch (Exception e) {
                callbackContext.error(e.toString());
            }
        }
    }

    private void exists(String remoteFile, CallbackContext callbackContext) {
        if (remoteFile == null) {
            callbackContext.error("Expected remoteFile path.");
        } else {
            try {
                String remoteFilePath = remoteFile.substring(0, remoteFile.lastIndexOf('/') + 1);
                String remoteFileName = remoteFile.substring(remoteFile.lastIndexOf('/') + 1);
                this.client.changeDirectory(remoteFilePath);
                FTPFile[] list = client.list();
                JSONArray fileList = new JSONArray();
                for (FTPFile file : list) {
                    String name = file.getName();
                    if (remoteFileName.equals(name)) {
                        callbackContext.success(1);
                        return;
                    }
                }
                callbackContext.success(0);
                // should never reach here!
            } catch (Exception e) {
                callbackContext.error(e.toString());
            }
        }
    }

    private void rename(String path, String newPath, CallbackContext callbackContext) {
        if (path == null || newPath == null) {
            callbackContext.error("Expected localFile and remoteFile.");
        } else {
            try {
                this.client.rename(path, newPath);
                callbackContext.success("Rename OK");
            } catch (Exception e) {
                callbackContext.error(e.toString());
            }
        }
    }

    private void currentDirectory(CallbackContext callbackContext) {
        try {

            String dir = this.client.currentDirectory();
            callbackContext.success(dir);

        } catch (Exception e) {
            callbackContext.error(e.toString());
        }
    }

    private void homeDirectory(CallbackContext callbackContext) {
        try {

            callbackContext.success(this.homeDirectoryPath);

        } catch (Exception e) {
            callbackContext.error(e.toString());
        }
    }

    private void cancelAllRequests(CallbackContext callbackContext) {
        try {
            // `true` to perform a legal abort procedure (an ABOR command is sent to the
            // server),
            // `false` to abruptly close the transfer without advice.
            this.client.abortCurrentDataTransfer(true);
            callbackContext.success("Cancel OK.");
        } catch (Exception e) {
            callbackContext.error(e.toString());
        }
    }

    private void disconnect(CallbackContext callbackContext) {
        try {
            // `true` to perform a legal disconnect procedure (an QUIT command is sent to
            // the server),
            // `false` to break the connection without advice.
            this.client.disconnect(true);
            this.client.setAutoNoopTimeout(0);
            callbackContext.success("Disconnect OK.");
        } catch (Exception e) {
            this.client = null;
            callbackContext.error(e.toString());
        }
    }
}

class CDVFtpTransferListener implements FTPDataTransferListener {
    public static final String TAG = CDVFtpTransferListener.class.getSimpleName();
    private long totalSize = 0;
    private long curSize = 0;
    private CallbackContext callbackContext = null;
    private PluginResult pluginResult = null;

    public CDVFtpTransferListener(long size, CallbackContext callbackContext) {
        this.totalSize = size;
        this.callbackContext = callbackContext;
    }

    public void started() {
        // Transfer started
        Log.i(TAG, "Transfer started");
        this.curSize = 0;
    }

    public void transferred(int length) {
        // Yet other length bytes has been transferred since the last time this
        // method was called
        this.curSize += length;
        float percent = (float) this.curSize / (float) this.totalSize;
        Log.d(TAG, "Transferred, totalSize=" + this.totalSize + ", curSize=" + this.curSize + ", percent=" + percent);
        // Tip: just return if percent < 1, to prevent js:successCallback() invoked
        // twice, as completed() will also return 1.
        if (percent >= 0 && percent < 1) {
            this.pluginResult = new PluginResult(PluginResult.Status.OK, percent);
            this.pluginResult.setKeepCallback(true);
            this.callbackContext.sendPluginResult(this.pluginResult);
        }
    }

    public void completed() {
        // Transfer completed
        Log.i(TAG, "Transfer completed");
        this.pluginResult = new PluginResult(PluginResult.Status.OK, 1);
        this.pluginResult.setKeepCallback(false);
        this.callbackContext.sendPluginResult(this.pluginResult);
    }

    public void aborted() {
        // Transfer aborted
        Log.w(TAG, "Transfer aborted");
        this.pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
        this.pluginResult.setKeepCallback(false);
        this.callbackContext.sendPluginResult(this.pluginResult);
    }

    public void failed() {
        // Transfer failed
        Log.e(TAG, "Transfer failed");
        this.pluginResult = new PluginResult(PluginResult.Status.ERROR);
        this.pluginResult.setKeepCallback(false);
        this.callbackContext.sendPluginResult(this.pluginResult);
    }
}
