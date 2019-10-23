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

import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * Diagnostic plugin implementation for Android
 */
public class Diagnostic_Bluetooth extends CordovaPlugin{


    /*************
     * Constants *
     *************/

    /**
     * Current state of Bluetooth hardware is unknown
     */
    protected static final String BLUETOOTH_STATE_UNKNOWN = "unknown";

    /**
     * Current state of Bluetooth hardware is ON
     */
    protected static final String BLUETOOTH_STATE_POWERED_ON = "powered_on";

    /**
     * Current state of Bluetooth hardware is OFF
     */
    protected static final String BLUETOOTH_STATE_POWERED_OFF = "powered_off";

    /**
     * Current state of Bluetooth hardware is transitioning to ON
     */
    protected static final String BLUETOOTH_STATE_POWERING_ON = "powering_on";

    /**
     * Current state of Bluetooth hardware is transitioning to OFF
     */
    protected static final String BLUETOOTH_STATE_POWERING_OFF = "powering_off";

    /**
     * Tag for debug log messages
     */
    public static final String TAG = "Diagnostic_Bluetooth";

    private String currentBluetoothState = null;


    /*************
     * Variables *
     *************/

    /**
     * Singleton class instance
     */
    public static Diagnostic_Bluetooth instance = null;

    private Diagnostic diagnostic;

    /**
     * Current Cordova callback context (on this thread)
     */
    protected CallbackContext currentContext;


    /*************
     * Public API
     ************/

    /**
     * Constructor.
     */
    public Diagnostic_Bluetooth() {}

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
            diagnostic.applicationContext.registerReceiver(bluetoothStateChangeReceiver, new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED));
            currentBluetoothState = getBluetoothState();
        }catch(Exception e){
            diagnostic.logWarning("Unable to register Bluetooth state change receiver: " + e.getMessage());
        }

        super.initialize(cordova, webView);
    }

    /**
     * Called on destroying activity
     */
    public void onDestroy() {
        try {
            diagnostic.applicationContext.unregisterReceiver(bluetoothStateChangeReceiver);
        }catch(Exception e){
            diagnostic.logWarning("Unable to unregister Bluetooth state change receiver: " + e.getMessage());
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
            if (action.equals("switchToBluetoothSettings")){
                switchToBluetoothSettings();
                callbackContext.success();
            } else if(action.equals("isBluetoothAvailable")) {
                callbackContext.success(isBluetoothAvailable() ? 1 : 0);
            } else if(action.equals("isBluetoothEnabled")) {
                callbackContext.success(isBluetoothEnabled() ? 1 : 0);
            } else if(action.equals("hasBluetoothSupport")) {
                callbackContext.success(hasBluetoothSupport() ? 1 : 0);
            } else if(action.equals("hasBluetoothLESupport")) {
                callbackContext.success(hasBluetoothLESupport() ? 1 : 0);
            } else if(action.equals("hasBluetoothLEPeripheralSupport")) {
                callbackContext.success(hasBluetoothLEPeripheralSupport() ? 1 : 0);
            } else if(action.equals("setBluetoothState")) {
                setBluetoothState(args.getBoolean(0));
                callbackContext.success();
            } else if(action.equals("getBluetoothState")) {
                callbackContext.success(getBluetoothState());
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




    /************
     * Internals
     ***********/

    public void switchToBluetoothSettings() {
        diagnostic.logDebug("Switch to Bluetooth Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
        cordova.getActivity().startActivity(settingsIntent);
    }

    public boolean isBluetoothAvailable() {
        boolean result = hasBluetoothSupport() && isBluetoothEnabled();
        return result;
    }

    public boolean isBluetoothEnabled() {
        BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        boolean result = mBluetoothAdapter != null && mBluetoothAdapter.isEnabled();
        return result;
    }

    public boolean hasBluetoothSupport() {
        PackageManager pm = this.cordova.getActivity().getPackageManager();
        boolean result = pm.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH);
        return result;
    }

    public boolean hasBluetoothLESupport() {
        PackageManager pm = this.cordova.getActivity().getPackageManager();
        boolean result = pm.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE);
        return result;
    }

    public boolean hasBluetoothLEPeripheralSupport() {
        if (Build.VERSION.SDK_INT >=21){
            BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            boolean result = mBluetoothAdapter != null && mBluetoothAdapter.isMultipleAdvertisementSupported();
            return result;
        }
        return false;
    }

    public static boolean setBluetoothState(boolean enable) {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        boolean isEnabled = bluetoothAdapter.isEnabled();
        if (enable && !isEnabled) {
            return bluetoothAdapter.enable();
        }
        else if(!enable && isEnabled) {
            return bluetoothAdapter.disable();
        }
        return true;
    }

    public String getBluetoothState(){

        String bluetoothState = BLUETOOTH_STATE_UNKNOWN;
        if(hasBluetoothSupport()){
            BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
            if(mBluetoothAdapter == null){
                diagnostic.logWarning("Bluetooth adapter unavailable or not found");
                return BLUETOOTH_STATE_UNKNOWN;
            }
            int state = mBluetoothAdapter.getState();
            switch(state){
                case BluetoothAdapter.STATE_OFF:
                    bluetoothState = BLUETOOTH_STATE_POWERED_OFF;
                    break;
                case BluetoothAdapter.STATE_ON:
                    bluetoothState = BLUETOOTH_STATE_POWERED_ON;
                    break;
                case BluetoothAdapter.STATE_TURNING_OFF:
                    bluetoothState = BLUETOOTH_STATE_POWERING_OFF;
                    break;
                case BluetoothAdapter.STATE_TURNING_ON:
                    bluetoothState = BLUETOOTH_STATE_POWERING_ON;
                    break;
            }
        }
        return bluetoothState;
    }

    public void notifyBluetoothStateChange(){
        try {
            String newState = getBluetoothState();
            if(!newState.equals(currentBluetoothState)){
                diagnostic.logDebug("Bluetooth state changed to: " + newState);
                diagnostic.executePluginJavascript("bluetooth._onBluetoothStateChange(\""+newState+"\");");
                currentBluetoothState = newState;
            }
        }catch(Exception e){
            diagnostic.logError("Error retrieving current Bluetooth state on Bluetooth state change: "+e.toString());
        }
    }

    /************
     * Overrides
     ***********/

    protected final BroadcastReceiver bluetoothStateChangeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            if(instance != null && action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)){
                Log.v(TAG, "bluetoothStateChangeReceiver");
                instance.notifyBluetoothStateChange();
            }
        }
    };
}
