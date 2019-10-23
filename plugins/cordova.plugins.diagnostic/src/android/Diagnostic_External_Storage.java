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
package cordova.plugins;

/*
 * Imports
 */

import android.os.Build;
import android.os.Environment;
import android.os.StatFs;
import android.support.v4.os.EnvironmentCompat;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Diagnostic plugin implementation for Android
 */
public class Diagnostic_External_Storage extends CordovaPlugin{


    /*************
     * Constants *
     *************/


    /**
     * Tag for debug log messages
     */
    public static final String TAG = "Diagnostic_External_Storage";


    /*************
     * Variables *
     *************/

    /**
     * Singleton class instance
     */
    public static Diagnostic_External_Storage instance = null;

    private Diagnostic diagnostic;

    /**
     * Current Cordova callback context (on this thread)
     */
    protected CallbackContext currentContext;

    protected static String externalStoragePermission = "READ_EXTERNAL_STORAGE";


    /*************
     * Public API
     ************/

    /**
     * Constructor.
     */
    public Diagnostic_External_Storage() {}

    /**
     * Sets the context of the Command. This can then be used to do things like
     * get file paths associated with the Activity.
     *
     * @param cordova The context of the main Activity.
     * @param webView The CordovaWebView Cordova is running in.
     */
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        Log.d(TAG, "initialize()");
        instance = this;
        diagnostic = Diagnostic.getInstance();

        super.initialize(cordova, webView);
    }


    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  True if the action was valid, false if not.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        currentContext = callbackContext;

        try {
            if(action.equals("getExternalSdCardDetails")) {
                this.getExternalSdCardDetails();
            } else {
                diagnostic.handleError("Invalid action");
                return false;
            }
        }catch(Exception e ) {
            diagnostic.handleError("Exception occurred: ".concat(e.getMessage()));
            return false;
        }
        return true;
    }

    public static void onReceivePermissionResult() throws JSONException{
        instance._getExternalSdCardDetails();
    }

    /************
     * Internals
     ***********/

    protected void getExternalSdCardDetails() throws Exception{
        String permission = diagnostic.permissionsMap.get(externalStoragePermission);
        if (diagnostic.hasPermission(permission)) {
            _getExternalSdCardDetails();
        } else {
            diagnostic.requestRuntimePermission(permission, Diagnostic.GET_EXTERNAL_SD_CARD_DETAILS_PERMISSION_REQUEST);
        }
    }


    protected void _getExternalSdCardDetails() throws JSONException {
        String[] storageDirectories = getStorageDirectories();

        JSONArray details = new JSONArray();
        for(int i=0; i<storageDirectories.length; i++) {
            String directory = storageDirectories[i];
            File f = new File(directory);
            JSONObject detail = new JSONObject();
            if(f.canRead()){
                detail.put("path", directory);
                detail.put("filePath", "file://"+directory);
                detail.put("canWrite", f.canWrite());
                detail.put("freeSpace", getFreeSpaceInBytes(directory));
                if(directory.contains("Android")){
                    detail.put("type", "application");
                }else{
                    detail.put("type", "root");
                }
                details.put(detail);
            }
        }
        currentContext.success(details);
    }

    /**
     * Given a path return the number of free bytes in the filesystem containing the path.
     *
     * @param path to the file system
     * @return free space in bytes
     */
    protected long getFreeSpaceInBytes(String path) {
        try {
            StatFs stat = new StatFs(path);
            long blockSize = stat.getBlockSize();
            long availableBlocks = stat.getAvailableBlocks();
            return availableBlocks * blockSize;
        } catch (IllegalArgumentException e) {
            // The path was invalid. Just return 0 free bytes.
            return 0;
        }
    }


    /**
     * Returns all available external SD-Cards in the system.
     *
     * @return paths to all available external SD-Cards in the system.
     */
    protected String[] getStorageDirectories() {

        List<String> results = new ArrayList<String>();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) { //Method 1 for KitKat & above
            File[] externalDirs = this.cordova.getActivity().getApplicationContext().getExternalFilesDirs(null);

            for (File file : externalDirs) {
                if(file == null){
                    continue;
                }
                String applicationPath = file.getPath();
                String rootPath = applicationPath.split("/Android")[0];

                boolean addPath = false;

                if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    addPath = Environment.isExternalStorageRemovable(file);
                }
                else{
                    addPath = Environment.MEDIA_MOUNTED.equals(EnvironmentCompat.getStorageState(file));
                }

                if(addPath){
                    results.add(rootPath);
                    results.add(applicationPath);
                }
            }
        }

        if(results.isEmpty()) { //Method 2 for all versions
            // better variation of: http://stackoverflow.com/a/40123073/5002496
            String output = "";
            try {
                final Process process = new ProcessBuilder().command("mount | grep /dev/block/vold")
                        .redirectErrorStream(true).start();
                process.waitFor();
                final InputStream is = process.getInputStream();
                final byte[] buffer = new byte[1024];
                while (is.read(buffer) != -1) {
                    output = output + new String(buffer);
                }
                is.close();
            } catch (final Exception e) {
                e.printStackTrace();
            }
            if(!output.trim().isEmpty()) {
                String devicePoints[] = output.split("\n");
                for(String voldPoint: devicePoints) {
                    results.add(voldPoint.split(" ")[2]);
                }
            }
        }

        //Below few lines is to remove paths which may not be external memory card, like OTG (feel free to comment them out)
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            for (int i = 0; i < results.size(); i++) {
                if (!results.get(i).toLowerCase().matches(".*[0-9a-f]{4}[-][0-9a-f]{4}.*")) {
                    diagnostic.logDebug(results.get(i) + " might not be extSDcard");
                    results.remove(i--);
                }
            }
        } else {
            for (int i = 0; i < results.size(); i++) {
                if (!results.get(i).toLowerCase().contains("ext") && !results.get(i).toLowerCase().contains("sdcard")) {
                    diagnostic.logDebug(results.get(i)+" might not be extSDcard");
                    results.remove(i--);
                }
            }
        }

        String[] storageDirectories = new String[results.size()];
        for(int i=0; i<results.size(); ++i) storageDirectories[i] = results.get(i);

        return storageDirectories;
    }

}
