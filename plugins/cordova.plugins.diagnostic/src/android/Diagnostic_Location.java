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
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.location.LocationManager;
import android.os.Build;
import android.util.Log;

import android.content.Context;
import android.content.Intent;
import android.provider.Settings;

/**
 * Diagnostic plugin implementation for Android
 */
public class Diagnostic_Location extends CordovaPlugin{


    /*************
     * Constants *
     *************/

    /**
     * Tag for debug log messages
     */
    public static final String TAG = "Diagnostic_Location";

    private static String gpsLocationPermission = "ACCESS_FINE_LOCATION";
    private static String networkLocationPermission = "ACCESS_COARSE_LOCATION";


    private static final String LOCATION_MODE_HIGH_ACCURACY = "high_accuracy";
    private static final String LOCATION_MODE_DEVICE_ONLY = "device_only";
    private static final String LOCATION_MODE_BATTERY_SAVING = "battery_saving";
    private static final String LOCATION_MODE_OFF = "location_off";
    private static final String LOCATION_MODE_UNKNOWN = "unknown";

    /*************
     * Variables *
     *************/

    /**
     * Singleton class instance
     */
    public static Diagnostic_Location instance = null;

    private Diagnostic diagnostic;

    public static LocationManager locationManager;

    /**
     * Current Cordova callback context (on this thread)
     */
    protected CallbackContext currentContext;

    private String currentLocationMode = null;

    /*************
     * Public API
     ************/

    /**
     * Constructor.
     */
    public Diagnostic_Location() {}

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

        try {
            diagnostic.applicationContext.registerReceiver(locationProviderChangedReceiver, new IntentFilter(LocationManager.PROVIDERS_CHANGED_ACTION));
            locationManager = (LocationManager) this.cordova.getActivity().getSystemService(Context.LOCATION_SERVICE);
        }catch(Exception e){
            diagnostic.logWarning("Unable to register Location Provider Change receiver: " + e.getMessage());
        }

        try {
            currentLocationMode = getLocationModeName();
        }catch(Exception e){
            diagnostic.logWarning("Unable to get initial location mode: " + e.getMessage());
        }

        super.initialize(cordova, webView);
    }

    /**
     * Called on destroying activity
     */
    public void onDestroy() {
        try {
            diagnostic.applicationContext.unregisterReceiver(locationProviderChangedReceiver);
        }catch(Exception e){
            diagnostic.logWarning("Unable to unregister Location Provider Change receiver: " + e.getMessage());
        }
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
            if (action.equals("switchToLocationSettings")){
                switchToLocationSettings();
                callbackContext.success();
            } else if(action.equals("isLocationAvailable")) {
                callbackContext.success(isGpsLocationAvailable() || isNetworkLocationAvailable() ? 1 : 0);
            } else if(action.equals("isLocationEnabled")) {
                callbackContext.success(isGpsLocationEnabled() || isNetworkLocationEnabled() ? 1 : 0);
            } else if(action.equals("isGpsLocationAvailable")) {
                callbackContext.success(isGpsLocationAvailable() ? 1 : 0);
            } else if(action.equals("isNetworkLocationAvailable")) {
                callbackContext.success(isNetworkLocationAvailable() ? 1 : 0);
            } else if(action.equals("isGpsLocationEnabled")) {
                callbackContext.success(isGpsLocationEnabled() ? 1 : 0);
            } else if(action.equals("isNetworkLocationEnabled")) {
                callbackContext.success(isNetworkLocationEnabled() ? 1 : 0);
            } else if(action.equals("getLocationMode")) {
                callbackContext.success(getLocationModeName());
            }else {
                diagnostic.handleError("Invalid action");
                return false;
            }
        }catch(Exception e ) {
            diagnostic.handleError("Exception occurred: ".concat(e.getMessage()));
            return false;
        }
        return true;
    }

    public boolean isGpsLocationAvailable() throws Exception {
        boolean result = isGpsLocationEnabled() && isLocationAuthorized();
        diagnostic.logDebug("GPS location available: " + result);
        return result;
    }

    public boolean isGpsLocationEnabled() throws Exception {
        int mode = getLocationMode();
        boolean result = (mode == 3 || mode == 1);
        diagnostic.logDebug("GPS location setting enabled: " + result);
        return result;
    }

    public boolean isNetworkLocationAvailable() throws Exception {
        boolean result =  isNetworkLocationEnabled() && isLocationAuthorized();
        diagnostic.logDebug("Network location available: " + result);
        return result;
    }

    public boolean isNetworkLocationEnabled() throws Exception {
        int mode = getLocationMode();
        boolean result = (mode == 3 || mode == 2);
        diagnostic.logDebug("Network location setting enabled: " + result);
        return result;
    }

    public String getLocationModeName() throws Exception {
        String modeName;
        int mode = getLocationMode();
        switch(mode){
            case Settings.Secure.LOCATION_MODE_HIGH_ACCURACY:
                modeName = LOCATION_MODE_HIGH_ACCURACY;
                break;
            case Settings.Secure.LOCATION_MODE_SENSORS_ONLY:
                modeName = LOCATION_MODE_DEVICE_ONLY;
                break;
            case Settings.Secure.LOCATION_MODE_BATTERY_SAVING:
                modeName = LOCATION_MODE_BATTERY_SAVING;
                break;
            case Settings.Secure.LOCATION_MODE_OFF:
                modeName = LOCATION_MODE_OFF;
                break;
            default:
                modeName = LOCATION_MODE_UNKNOWN;
        }
        return modeName;
    }

    public void notifyLocationStateChange(){
        try {
            String newMode = getLocationModeName();
            if(!newMode.equals(currentLocationMode)){
                diagnostic.logDebug("Location mode change to: " + newMode);
                diagnostic.executePluginJavascript("location._onLocationStateChange(\"" + newMode +"\");");
                currentLocationMode = newMode;
            }
        }catch(Exception e){
            diagnostic.logError("Error retrieving current location mode on location state change: "+e.toString());
        }
    }

    public void switchToLocationSettings() {
        diagnostic.logDebug("Switch to Location Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }



    /************
     * Internals
     ***********/
    /**
     * Returns current location mode
     */
    private int getLocationMode() throws Exception {
        int mode;
        if (Build.VERSION.SDK_INT >= 19){ // Kitkat and above
            mode = Settings.Secure.getInt(this.cordova.getActivity().getContentResolver(), Settings.Secure.LOCATION_MODE);
        }else{ // Pre-Kitkat
            if(isLocationProviderEnabled(LocationManager.GPS_PROVIDER) && isLocationProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                mode = 3;
            } else if(isLocationProviderEnabled(LocationManager.GPS_PROVIDER)){
                mode = 1;
            } else if(isLocationProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                mode = 2;
            }else{
                mode = 0;
            }
        }
        return mode;
    }

    private boolean isLocationAuthorized() throws Exception {
        boolean authorized = diagnostic.hasPermission(diagnostic.permissionsMap.get(gpsLocationPermission)) || diagnostic.hasPermission(diagnostic.permissionsMap.get(networkLocationPermission));
        Log.v(TAG, "Location permission is "+(authorized ? "authorized" : "unauthorized"));
        return authorized;
    }

    private boolean isLocationProviderEnabled(String provider) {
        return locationManager.isProviderEnabled(provider);
    }


    /************
     * Overrides
     ***********/

    protected final BroadcastReceiver locationProviderChangedReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
        try {
            final String action = intent.getAction();
            if(instance != null && action.equals(LocationManager.PROVIDERS_CHANGED_ACTION)){
                Log.v(TAG, "onReceiveLocationProviderChange");
                instance.notifyLocationStateChange();
            }
        } catch (Exception e) {
            diagnostic.logError("Error receiving location provider state change: "+e.toString());
        }
        }
    };
}
