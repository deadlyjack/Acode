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
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;


import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.Settings;


import android.support.v4.app.ActivityCompat;

/**
 * Diagnostic plugin implementation for Android
 */
public class Diagnostic extends CordovaPlugin{


    /*************
     * Constants *
     *************/

    /**
     * Tag for debug log messages
     */
    public static final String TAG = "Diagnostic";


    /**
     * Map of "dangerous" permissions that need to be requested at run-time (Android 6.0/API 23 and above)
     * See http://developer.android.com/guide/topics/security/permissions.html#perm-groups
     */
    protected static final Map<String, String> permissionsMap;
    static {
        Map<String, String> _permissionsMap = new HashMap <String, String>();
        Diagnostic.addBiDirMapEntry(_permissionsMap, "READ_CALENDAR", Manifest.permission.READ_CALENDAR);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "WRITE_CALENDAR", Manifest.permission.WRITE_CALENDAR);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "CAMERA", Manifest.permission.CAMERA);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "READ_CONTACTS", Manifest.permission.READ_CONTACTS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "WRITE_CONTACTS", Manifest.permission.WRITE_CONTACTS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "GET_ACCOUNTS", Manifest.permission.GET_ACCOUNTS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "ACCESS_FINE_LOCATION", Manifest.permission.ACCESS_FINE_LOCATION);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "ACCESS_COARSE_LOCATION", Manifest.permission.ACCESS_COARSE_LOCATION);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "RECORD_AUDIO", Manifest.permission.RECORD_AUDIO);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "READ_PHONE_STATE", Manifest.permission.READ_PHONE_STATE);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "CALL_PHONE", Manifest.permission.CALL_PHONE);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "ADD_VOICEMAIL", Manifest.permission.ADD_VOICEMAIL);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "USE_SIP", Manifest.permission.USE_SIP);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "PROCESS_OUTGOING_CALLS", Manifest.permission.PROCESS_OUTGOING_CALLS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "SEND_SMS", Manifest.permission.SEND_SMS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "RECEIVE_SMS", Manifest.permission.RECEIVE_SMS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "READ_SMS", Manifest.permission.READ_SMS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "RECEIVE_WAP_PUSH", Manifest.permission.RECEIVE_WAP_PUSH);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "RECEIVE_MMS", Manifest.permission.RECEIVE_MMS);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "WRITE_EXTERNAL_STORAGE", Manifest.permission.WRITE_EXTERNAL_STORAGE);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "READ_CALL_LOG", Manifest.permission.READ_CALL_LOG);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "WRITE_CALL_LOG", Manifest.permission.WRITE_CALL_LOG);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "READ_EXTERNAL_STORAGE", Manifest.permission.READ_EXTERNAL_STORAGE);
        Diagnostic.addBiDirMapEntry(_permissionsMap, "BODY_SENSORS", Manifest.permission.BODY_SENSORS);
        permissionsMap = Collections.unmodifiableMap(_permissionsMap);
    }


    /*
     * Map of permission request code to callback context
     */
    protected HashMap<String, CallbackContext> callbackContexts = new HashMap<String, CallbackContext>();

    /*
     * Map of permission request code to permission statuses
     */
    protected HashMap<String, JSONObject> permissionStatuses = new HashMap<String, JSONObject>();


    /**
     * User authorised permission
     */
    protected static final String STATUS_GRANTED = "GRANTED";

    /**
     * User denied permission (without checking "never ask again")
     */
    protected static final String STATUS_DENIED_ONCE = "DENIED_ONCE";

    /**
     * User denied permission and checked "never ask again"
     */
    protected static final String STATUS_DENIED_ALWAYS = "DENIED_ALWAYS";

    /**
     * Authorisation has not yet been requested for permission
     */
    protected static final String STATUS_NOT_REQUESTED = "NOT_REQUESTED";

    public static final String CPU_ARCH_UNKNOWN = "unknown";
    public static final String CPU_ARCH_ARMv6 = "ARMv6";
    public static final String CPU_ARCH_ARMv7 = "ARMv7";
    public static final String CPU_ARCH_ARMv8 = "ARMv8";
    public static final String CPU_ARCH_X86 = "X86";
    public static final String CPU_ARCH_X86_64 = "X86_64";
    public static final String CPU_ARCH_MIPS = "MIPS";
    public static final String CPU_ARCH_MIPS_64 = "MIPS_64";

    protected static final String externalStorageClassName = "cordova.plugins.Diagnostic_External_Storage";
    protected static final Integer GET_EXTERNAL_SD_CARD_DETAILS_PERMISSION_REQUEST = 1000;

    /*************
     * Variables *
     *************/

    /**
     * Singleton class instance
     */
    public static Diagnostic instance = null;

    boolean debugEnabled = false;


    /**
     * Current Cordova callback context (on this thread)
     */
    protected CallbackContext currentContext;

    protected Context applicationContext;

    protected SharedPreferences sharedPref;
    protected SharedPreferences.Editor editor;

    /*************
     * Public API
     ************/

    /**
     * Constructor.
     */
    public Diagnostic() {}

    public static Diagnostic getInstance(){
        return instance;
    }

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

        applicationContext = this.cordova.getActivity().getApplicationContext();
        sharedPref = cordova.getActivity().getSharedPreferences(TAG, Activity.MODE_PRIVATE);
        editor = sharedPref.edit();

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
            if (action.equals("enableDebug")){
                debugEnabled = true;
                logDebug("Debug enabled");
                callbackContext.success();
            } else if (action.equals("switchToSettings")){
                switchToAppSettings();
                callbackContext.success();
            } else if (action.equals("switchToMobileDataSettings")){
                switchToMobileDataSettings();
                callbackContext.success();
            } else if (action.equals("switchToWirelessSettings")){
                switchToWirelessSettings();
                callbackContext.success();
            } else if(action.equals("isDataRoamingEnabled")) {
                callbackContext.success(isDataRoamingEnabled() ? 1 : 0);
            } else if(action.equals("getPermissionAuthorizationStatus")) {
                this.getPermissionAuthorizationStatus(args);
            } else if(action.equals("getPermissionsAuthorizationStatus")) {
                this.getPermissionsAuthorizationStatus(args);
            } else if(action.equals("requestRuntimePermission")) {
                this.requestRuntimePermission(args);
            } else if(action.equals("requestRuntimePermissions")) {
                this.requestRuntimePermissions(args);
            } else if(action.equals("isADBModeEnabled")) {
                callbackContext.success(isADBModeEnabled() ? 1 : 0);
            } else if(action.equals("isDeviceRooted")) {
                callbackContext.success(isDeviceRooted() ? 1 : 0);
            } else if(action.equals("restart")) {
                this.restart(args);
            } else if(action.equals("getArchitecture")) {
                callbackContext.success(getCPUArchitecture());
            } else {
                handleError("Invalid action");
                return false;
            }
        }catch(Exception e ) {
            handleError("Exception occurred: ".concat(e.getMessage()));
            return false;
        }
        return true;
    }

    public void restart(JSONArray args) throws Exception{
        boolean cold = args.getBoolean(0);
        if(cold){
            doColdRestart();
        }else{
            doWarmRestart();
        }
    }


    public boolean isDataRoamingEnabled() throws Exception {
        boolean result;
        if (Build.VERSION.SDK_INT < 17) {
            result = Settings.System.getInt(this.cordova.getActivity().getContentResolver(), Settings.Global.DATA_ROAMING, 0) == 1;
        }else{
            result = Settings.Global.getInt(this.cordova.getActivity().getContentResolver(), Settings.Global.DATA_ROAMING, 0) == 1;
        }
        return result;
    }

    public void switchToAppSettings() {
        logDebug("Switch to App Settings");
        Intent appIntent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", cordova.getActivity().getPackageName(), null);
        appIntent.setData(uri);
        cordova.getActivity().startActivity(appIntent);
    }


    public void switchToMobileDataSettings() {
        logDebug("Switch to Mobile Data Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_DATA_ROAMING_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }

    public void switchToWirelessSettings() {
        logDebug("Switch to wireless Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }

    public void getPermissionsAuthorizationStatus(JSONArray args) throws Exception{
        JSONArray permissions = args.getJSONArray(0);
        JSONObject statuses = _getPermissionsAuthorizationStatus(jsonArrayToStringArray(permissions));
        currentContext.success(statuses);
    }

    public void getPermissionAuthorizationStatus(JSONArray args) throws Exception{
        String permission = args.getString(0);
        JSONArray permissions = new JSONArray();
        permissions.put(permission);
        JSONObject statuses = _getPermissionsAuthorizationStatus(jsonArrayToStringArray(permissions));
        currentContext.success(statuses.getString(permission));
    }

    public void requestRuntimePermissions(JSONArray args) throws Exception{
        JSONArray permissions = args.getJSONArray(0);
        int requestId = storeContextByRequestId();
        _requestRuntimePermissions(permissions, requestId);
    }

    public void requestRuntimePermission(JSONArray args) throws Exception{
        requestRuntimePermission(args.getString(0));
    }

    public void requestRuntimePermission(String permission) throws Exception{
        requestRuntimePermission(permission, storeContextByRequestId());
    }

    public void requestRuntimePermission(String permission, int requestId) throws Exception{
        JSONArray permissions = new JSONArray();
        permissions.put(permission);
        _requestRuntimePermissions(permissions, requestId);
    }

    /**
     * get device ADB mode info
     */
    public int getADBMode(){
        int mode;
        if (Build.VERSION.SDK_INT >= 17){ // Jelly_Bean_MR1 and above
            mode = Settings.Global.getInt(applicationContext.getContentResolver(), Settings.Global.ADB_ENABLED, 0);
        } else { // Pre-Jelly_Bean_MR1
            mode = Settings.Secure.getInt(applicationContext.getContentResolver(), Settings.Secure.ADB_ENABLED, 0);
        }
        return mode;
    }

    /**
     * checks if ADB mode is on
     * especially for debug mode check
     */
    public boolean isADBModeEnabled(){
        boolean result = false;
        try {
            result = getADBMode() == 1;
        } catch (Exception e) {
            logError(e.getMessage());
        }
        logDebug("ADB mode enabled: " + result);
        return result;
    }

    /**
     * checks if device is rooted
     * refer to: https://stackoverflow.com/questions/1101380
     */
    public boolean isDeviceRooted(){
        // from build info
        String buildTags = android.os.Build.TAGS;
        if (buildTags != null && buildTags.contains("test-keys")) {
            return true;
        }

        // from binary exists
        try {
            String[] paths = { "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su",
                    "/data/local/bin/su", "/system/sd/xbin/su", "/system/bin/failsafe/su", "/data/local/su" };
            for (String path : paths) {
                if (new File(path).exists()) {
                    return true;
                }
            }
        } catch (Exception e) {
            logDebug(e.getMessage());
        }

        // from command authority
        Process process = null;
        try {
            process = Runtime.getRuntime().exec(new String[] { "/system/xbin/which", "su" });
            BufferedReader in = new BufferedReader(new InputStreamReader(process.getInputStream()));
            if (in.readLine() != null) {
                return true;
            }
        } catch (Exception e) {
            logDebug(e.getMessage());
        } finally {
            if (process != null) process.destroy();
        }

        return false;
    }


    /************
     * Internals
     ***********/

    public void logDebug(String msg) {
        if(debugEnabled){
            Log.d(TAG, msg);
            executeGlobalJavascript("console.log(\""+TAG+"[native]: "+escapeDoubleQuotes(msg)+"\")");
        }
    }

    public void logInfo(String msg){
        Log.i(TAG, msg);
        if(debugEnabled){
            executeGlobalJavascript("console.info(\""+TAG+"[native]: "+escapeDoubleQuotes(msg)+"\")");
        }
    }

    public void logWarning(String msg){
        Log.w(TAG, msg);
        if(debugEnabled){
            executeGlobalJavascript("console.warn(\""+TAG+"[native]: "+escapeDoubleQuotes(msg)+"\")");
        }
    }

    public void logError(String msg){
        Log.e(TAG, msg);
        if(debugEnabled){
            executeGlobalJavascript("console.error(\""+TAG+"[native]: "+escapeDoubleQuotes(msg)+"\")");
        }
    }

    public String escapeDoubleQuotes(String string){
        String escapedString = string.replace("\"", "\\\"");
        escapedString = escapedString.replace("%22", "\\%22");
        return escapedString;
    }

    /**
     * Handles an error while executing a plugin API method  in the specified context.
     * Calls the registered Javascript plugin error handler callback.
     * @param errorMsg Error message to pass to the JS error handler
     */
    public void handleError(String errorMsg, CallbackContext context){
        try {
            logError(errorMsg);
            context.error(errorMsg);
        } catch (Exception e) {
            logError(e.toString());
        }
    }

    /**
     * Handles an error while executing a plugin API method in the current context.
     * Calls the registered Javascript plugin error handler callback.
     * @param errorMsg Error message to pass to the JS error handler
     */
    public void handleError(String errorMsg) {
        handleError(errorMsg, currentContext);
    }

    /**
     * Handles error during a runtime permissions request.
     * Calls the registered Javascript plugin error handler callback
     * then removes entries associated with the request ID.
     * @param errorMsg Error message to pass to the JS error handler
     * @param requestId The ID of the runtime request
     */
    public void handleError(String errorMsg, int requestId){
        CallbackContext context;
        String sRequestId = String.valueOf(requestId);
        if (callbackContexts.containsKey(sRequestId)) {
            context = callbackContexts.get(sRequestId);
        }else{
            context = currentContext;
        }
        handleError(errorMsg, context);
        clearRequest(requestId);
    }

    protected JSONObject _getPermissionsAuthorizationStatus(String[] permissions) throws Exception{
        JSONObject statuses = new JSONObject();
        for(int i=0; i<permissions.length; i++){
            String permission = permissions[i];
            if(!permissionsMap.containsKey(permission)){
                throw new Exception("Permission name '"+permission+"' is not a valid permission");
            }
            String androidPermission = permissionsMap.get(permission);
            Log.v(TAG, "Get authorisation status for "+androidPermission);
            boolean granted = hasPermission(androidPermission);
            if(granted){
                statuses.put(permission, Diagnostic.STATUS_GRANTED);
            }else{
                boolean showRationale = shouldShowRequestPermissionRationale(this.cordova.getActivity(), androidPermission);
                if(!showRationale){
                    if(isPermissionRequested(permission)){
                        statuses.put(permission, Diagnostic.STATUS_DENIED_ALWAYS);
                    }else{
                        statuses.put(permission, Diagnostic.STATUS_NOT_REQUESTED);
                    }
                }else{
                    statuses.put(permission, Diagnostic.STATUS_DENIED_ONCE);
                }
            }
        }
        return statuses;
    }

    protected void _requestRuntimePermissions(JSONArray permissions, int requestId) throws Exception{
        JSONObject currentPermissionsStatuses = _getPermissionsAuthorizationStatus(jsonArrayToStringArray(permissions));
        JSONArray permissionsToRequest = new JSONArray();
        for(int i = 0; i<currentPermissionsStatuses.names().length(); i++){
            String permission = currentPermissionsStatuses.names().getString(i);
            boolean granted = currentPermissionsStatuses.getString(permission) == Diagnostic.STATUS_GRANTED;
            if(granted){
                Log.d(TAG, "Permission already granted for "+permission);
                JSONObject requestStatuses = permissionStatuses.get(String.valueOf(requestId));
                requestStatuses.put(permission, Diagnostic.STATUS_GRANTED);
                permissionStatuses.put(String.valueOf(requestId), requestStatuses);
            }else{
                String androidPermission = permissionsMap.get(permission);
                Log.d(TAG, "Requesting permission for "+androidPermission);
                permissionsToRequest.put(androidPermission);
            }
        }
        if(permissionsToRequest.length() > 0){
            Log.v(TAG, "Requesting permissions");
            requestPermissions(this, requestId, jsonArrayToStringArray(permissionsToRequest));

        }else{
            Log.d(TAG, "No permissions to request: returning result");
            sendRuntimeRequestResult(requestId);
        }
    }

    protected void sendRuntimeRequestResult(int requestId){
        String sRequestId = String.valueOf(requestId);
        CallbackContext context = callbackContexts.get(sRequestId);
        JSONObject statuses = permissionStatuses.get(sRequestId);
        Log.v(TAG, "Sending runtime request result for id="+sRequestId);
        context.success(statuses);
    }

    protected int storeContextByRequestId(){
        String requestId = generateRandomRequestId();
        callbackContexts.put(requestId, currentContext);
        permissionStatuses.put(requestId, new JSONObject());
        return Integer.valueOf(requestId);
    }

    protected String generateRandomRequestId(){
        String requestId = null;

        while(requestId == null){
            requestId = generateRandom();
            if(callbackContexts.containsKey(requestId)){
                requestId = null;
            }
        }
        return requestId;
    }

    protected String generateRandom(){
        Random rn = new Random();
        int random = rn.nextInt(1000000) + 1;
        return Integer.toString(random);
    }

    protected String[] jsonArrayToStringArray(JSONArray array) throws JSONException{
        if(array==null)
            return null;

        String[] arr=new String[array.length()];
        for(int i=0; i<arr.length; i++) {
            arr[i]=array.optString(i);
        }
        return arr;
    }

    protected CallbackContext getContextById(String requestId) throws Exception{
        if (!callbackContexts.containsKey(requestId)) {
            throw new Exception("No context found for request id=" + requestId);
        }
        return callbackContexts.get(requestId);
    }

    protected void clearRequest(int requestId){
        String sRequestId = String.valueOf(requestId);
        if (!callbackContexts.containsKey(sRequestId)) {
            return;
        }
        callbackContexts.remove(sRequestId);
        permissionStatuses.remove(sRequestId);
    }

    /**
     * Adds a bi-directional entry to a map in the form on 2 entries: key>value and value>key
     * @param map
     * @param key
     * @param value
     */
    protected static void addBiDirMapEntry(Map map, Object key, Object value){
        map.put(key, value);
        map.put(value, key);
    }

    protected boolean hasPermission(String permission) throws Exception{
        boolean hasPermission = true;
        Method method = null;
        try {
            method = cordova.getClass().getMethod("hasPermission", permission.getClass());
            Boolean bool = (Boolean) method.invoke(cordova, permission);
            hasPermission = bool.booleanValue();
        } catch (NoSuchMethodException e) {
            logWarning("Cordova v" + CordovaWebView.CORDOVA_VERSION + " does not support runtime permissions so defaulting to GRANTED for " + permission);
        }
        return hasPermission;
    }

    protected void requestPermissions(CordovaPlugin plugin, int requestCode, String [] permissions) throws Exception{
        try {
            java.lang.reflect.Method method = cordova.getClass().getMethod("requestPermissions", org.apache.cordova.CordovaPlugin.class ,int.class, java.lang.String[].class);
            method.invoke(cordova, plugin, requestCode, permissions);
            for(String permission : permissions){
                setPermissionRequested(permissionsMap.get(permission));
            }
        } catch (NoSuchMethodException e) {
            throw new Exception("requestPermissions() method not found in CordovaInterface implementation of Cordova v" + CordovaWebView.CORDOVA_VERSION);
        }
    }

    protected boolean shouldShowRequestPermissionRationale(Activity activity, String permission) throws Exception{
        boolean shouldShow;
        try {
            java.lang.reflect.Method method = ActivityCompat.class.getMethod("shouldShowRequestPermissionRationale", Activity.class, java.lang.String.class);
            Boolean bool = (Boolean) method.invoke(null, activity, permission);
            shouldShow = bool.booleanValue();
        } catch (NoSuchMethodException e) {
            throw new Exception("shouldShowRequestPermissionRationale() method not found in ActivityCompat class. Check you have Android Support Library v23+ installed");
        }
        return shouldShow;
    }

    public void executeGlobalJavascript(final String jsString){
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.loadUrl("javascript:" + jsString);
            }
        });
    }

    public void executePluginJavascript(final String jsString){
        executeGlobalJavascript("cordova.plugins.diagnostic." + jsString);
    }

    /**
     * Performs a warm app restart - restarts only Cordova main activity
     */
    protected void doWarmRestart() {
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    logInfo("Warm restarting main activity");
                    instance.cordova.getActivity().recreate();
                } catch (Exception ex) {
                    handleError("Unable to warm restart main activity: " + ex.getMessage());
                }
            }
        });
    }

    /**
     * Performs a full cold app restart - restarts application
     * https://stackoverflow.com/a/22345538/777265
     */
    protected void doColdRestart() {
        String baseError = "Unable to cold restart application: ";
        try {
            logInfo("Cold restarting application");
            Context c = applicationContext;
            //check if the context is given
            if (c != null) {
                //fetch the packagemanager so we can get the default launch activity
                // (you can replace this intent with any other activity if you want
                PackageManager pm = c.getPackageManager();
                //check if we got the PackageManager
                if (pm != null) {
                    //create the intent with the default start activity for your application
                    Intent mStartActivity = pm.getLaunchIntentForPackage(
                            c.getPackageName()
                    );
                    if (mStartActivity != null) {
                        //mStartActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        //create a pending intent so the application is restarted after System.exit(0) was called.
                        // We use an AlarmManager to call this intent in 100ms
                        int mPendingIntentId = 223344;
                        PendingIntent mPendingIntent = PendingIntent
                                .getActivity(c, mPendingIntentId, mStartActivity,
                                        PendingIntent.FLAG_CANCEL_CURRENT);
                        AlarmManager mgr = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
                        mgr.set(AlarmManager.RTC, System.currentTimeMillis() + 100, mPendingIntent);
                        Log.i(TAG,"Killing application for cold restart");
                        //kill the application
                        System.exit(0);
                    } else {
                        handleError(baseError+"StartActivity is null");
                    }
                } else {
                    handleError(baseError+"PackageManager is null");
                }
            } else {
                handleError(baseError+"Context is null");
            }
        } catch (Exception ex) {
            handleError(baseError+ ex.getMessage());
        }
    }

    protected String getCPUArchitecture(){
        String arch = CPU_ARCH_UNKNOWN;

        String abi = null;

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            abi = Build.CPU_ABI;
        } else {
            abi = Build.SUPPORTED_ABIS[0];
        }


        if (abi == "armeabi") {
            arch = CPU_ARCH_ARMv6;
        } else if (abi.equals("armeabi-v7a")) {
            arch = CPU_ARCH_ARMv7;
        } else if (abi.equals("arm64-v8a")) {
            arch = CPU_ARCH_ARMv8;
        } else if (abi.equals("x86")) {
            arch = CPU_ARCH_X86;
        } else if (abi.equals("x86_64")) {
            arch = CPU_ARCH_X86_64;
        } else if (abi.equals("mips")) {
            arch = CPU_ARCH_MIPS;
        } else if (abi.equals("mips64")) {
            arch = CPU_ARCH_MIPS_64;
        }

        return arch;
    }

    protected void setPermissionRequested(String permission){
        editor.putBoolean(permission, true);
        boolean success = editor.commit();
        if(!success){
            handleError("Failed to set permission requested flag for " + permission);
        }
    }

    protected boolean isPermissionRequested(String permission){
        return sharedPref.getBoolean(permission, false);
    }

    /************
     * Overrides
     ***********/

    /**
     * Callback received when a runtime permissions request has been completed.
     * Retrieves the stateful Cordova context and permission statuses associated with the requestId,
     * then updates the list of status based on the grantResults before passing the result back via the context.
     *
     * @param requestCode - ID that was used when requesting permissions
     * @param permissions - list of permissions that were requested
     * @param grantResults - list of flags indicating if above permissions were granted or denied
     */
    public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResults) throws JSONException {
        String sRequestId = String.valueOf(requestCode);
        Log.v(TAG, "Received result for permissions request id=" + sRequestId);
        try {

            CallbackContext context = getContextById(sRequestId);
            JSONObject statuses = permissionStatuses.get(sRequestId);

            for (int i = 0, len = permissions.length; i < len; i++) {
                String androidPermission = permissions[i];
                String permission = permissionsMap.get(androidPermission);
                String status;
                if (grantResults[i] == PackageManager.PERMISSION_DENIED) {
                    boolean showRationale = shouldShowRequestPermissionRationale(this.cordova.getActivity(), androidPermission);
                    if (!showRationale) {
                        if(isPermissionRequested(permission)){
                            // user denied WITH "never ask again"
                            status = Diagnostic.STATUS_DENIED_ALWAYS;
                        }else{
                            // The app doesn't have permission and the user has not been asked for the permission before
                            status = Diagnostic.STATUS_NOT_REQUESTED;
                        }
                    } else {
                        // user denied WITHOUT "never ask again"
                        status = Diagnostic.STATUS_DENIED_ONCE;
                    }
                } else {
                    // Permission granted
                    status = Diagnostic.STATUS_GRANTED;
                }
                statuses.put(permission, status);
                Log.v(TAG, "Authorisation for " + permission + " is " + statuses.get(permission));
                clearRequest(requestCode);
            }

            Class<?> externalStorageClass = null;
            try {
                externalStorageClass = Class.forName(externalStorageClassName);
            } catch( ClassNotFoundException e ){}

            if(requestCode == GET_EXTERNAL_SD_CARD_DETAILS_PERMISSION_REQUEST && externalStorageClass != null){
                Method method = externalStorageClass.getMethod("onReceivePermissionResult");
                method.invoke(null);
            }else{
                context.success(statuses);
            }
        }catch(Exception e ) {
            handleError("Exception occurred onRequestPermissionsResult: ".concat(e.getMessage()), requestCode);
        }
    }

}
