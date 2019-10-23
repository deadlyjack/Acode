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

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.provider.Settings;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import android.nfc.NfcAdapter;
import android.nfc.NfcManager;
import static android.nfc.NfcAdapter.EXTRA_ADAPTER_STATE;

/**
 * Diagnostic plugin implementation for Android
 */
public class Diagnostic_NFC extends CordovaPlugin{


    /*************
     * Constants *
     *************/

    public static final int NFC_STATE_VALUE_UNKNOWN = 0;
    public static final int NFC_STATE_VALUE_OFF = 1;
    public static final int NFC_STATE_VALUE_TURNING_ON = 2;
    public static final int NFC_STATE_VALUE_ON = 3;
    public static final int NFC_STATE_VALUE_TURNING_OFF = 4;

    public static final String NFC_STATE_UNKNOWN = "unknown";
    public static final String NFC_STATE_OFF = "powered_off";
    public static final String NFC_STATE_TURNING_ON = "powering_on";
    public static final String NFC_STATE_ON = "powered_on";
    public static final String NFC_STATE_TURNING_OFF = "powering_off";


    /**
     * Tag for debug log messages
     */
    public static final String TAG = "Diagnostic_NFC";

    public static NfcManager nfcManager;


    /*************
     * Variables *
     *************/

    /**
     * Singleton class instance
     */
    public static Diagnostic_NFC instance = null;

    private Diagnostic diagnostic;

    /**
     * Current Cordova callback context (on this thread)
     */
    protected CallbackContext currentContext;

    protected String currentNFCState = NFC_STATE_UNKNOWN;


    /*************
     * Public API
     ************/

    /**
     * Constructor.
     */
    public Diagnostic_NFC() {}

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
            diagnostic.applicationContext.registerReceiver(NFCStateChangedReceiver, new IntentFilter(NfcAdapter.ACTION_ADAPTER_STATE_CHANGED));
            nfcManager = (NfcManager) diagnostic.applicationContext.getSystemService(Context.NFC_SERVICE);
        }catch(Exception e){
            diagnostic.logWarning("Unable to register NFC state change receiver: " + e.getMessage());
        }

        try {
            currentNFCState = isNFCAvailable() ? NFC_STATE_ON : NFC_STATE_OFF;
        }catch(Exception e){
            diagnostic.logWarning("Unable to get initial NFC state: " + e.getMessage());
        }

        super.initialize(cordova, webView);
    }

    /**
     * Called on destroying activity
     */
    public void onDestroy() {
        try {
            diagnostic.applicationContext.unregisterReceiver(NFCStateChangedReceiver);
        }catch(Exception e){
            diagnostic.logWarning("Unable to unregister NFC state change receiver: " + e.getMessage());
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
            if (action.equals("switchToNFCSettings")){
                switchToNFCSettings();
                callbackContext.success();
            } else if(action.equals("isNFCPresent")) {
                callbackContext.success(isNFCPresent() ? 1 : 0);
            } else if(action.equals("isNFCEnabled")) {
                callbackContext.success(isNFCEnabled() ? 1 : 0);
            } else if(action.equals("isNFCAvailable")) {
                callbackContext.success(isNFCAvailable() ? 1 : 0);
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

    public void switchToNFCSettings() {
        diagnostic.logDebug("Switch to NFC Settings");
        Intent settingsIntent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
        if (android.os.Build.VERSION.SDK_INT >= 16) {
            settingsIntent = new Intent(android.provider.Settings.ACTION_NFC_SETTINGS);
        }
        cordova.getActivity().startActivity(settingsIntent);
    }

    public boolean isNFCPresent() {
        boolean result = false;
        try {
            NfcAdapter adapter = nfcManager.getDefaultAdapter();
            result = adapter != null;
        }catch(Exception e){
            diagnostic.logError(e.getMessage());
        }
        return result;
    }

    public boolean isNFCEnabled() {
        boolean result = false;
        try {
            NfcAdapter adapter = nfcManager.getDefaultAdapter();
            result = adapter != null && adapter.isEnabled();
        }catch(Exception e){
            diagnostic.logError(e.getMessage());
        }
        return result;
    }

    public boolean isNFCAvailable() {
        boolean result = isNFCPresent() && isNFCEnabled();
        return result;
    }

    public void notifyNFCStateChange(int stateValue){
        String newState = getNFCState(stateValue);
        try {
            if(newState != currentNFCState){
                diagnostic.logDebug("NFC state changed to: " + newState);
                diagnostic.executePluginJavascript("nfc._onNFCStateChange(\"" + newState +"\");");
                currentNFCState = newState;
            }
        }catch(Exception e){
            diagnostic.logError("Error retrieving current NFC state on state change: "+e.toString());
        }
    }

    public String getNFCState(int stateValue){

        String state;
        switch(stateValue){
            case NFC_STATE_VALUE_OFF:
                state = NFC_STATE_OFF;
                break;
            case NFC_STATE_VALUE_TURNING_ON:
                state = NFC_STATE_TURNING_ON;
                break;
            case NFC_STATE_VALUE_ON:
                state = NFC_STATE_ON;
                break;
            case NFC_STATE_VALUE_TURNING_OFF:
                state = NFC_STATE_TURNING_OFF;
                break;
            default:
                state = NFC_STATE_UNKNOWN;
        }
        return state;
    }

    /************
     * Overrides
     ***********/

    protected final BroadcastReceiver NFCStateChangedReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
        try {
            final String action = intent.getAction();
            if(instance != null && action.equals(NfcAdapter.ACTION_ADAPTER_STATE_CHANGED)){

                Log.v(TAG, "onReceiveNFCStateChange");
                final int stateValue = intent.getIntExtra(EXTRA_ADAPTER_STATE, -1);
                instance.notifyNFCStateChange(stateValue);
            }
        } catch (Exception e) {
            diagnostic.logError("Error receiving NFC state change: "+e.toString());
        }
        }
    };
}