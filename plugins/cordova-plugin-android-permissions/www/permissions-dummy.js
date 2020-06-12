var permissionsName = 'Permissions';

function Permissions() {

    this.ACCESS_CHECKIN_PROPERTIES = 'android.permission.ACCESS_CHECKIN_PROPERTIES';
    this.ACCESS_COARSE_LOCATION = 'android.permission.ACCESS_COARSE_LOCATION';
    this.ACCESS_FINE_LOCATION = 'android.permission.ACCESS_FINE_LOCATION';
    this.ACCESS_LOCATION_EXTRA_COMMANDS = 'android.permission.ACCESS_LOCATION_EXTRA_COMMANDS';
    this.ACCESS_MOCK_LOCATION = 'android.permission.ACCESS_MOCK_LOCATION';
    this.ACCESS_NETWORK_STATE = 'android.permission.ACCESS_NETWORK_STATE';
    this.ACCESS_SURFACE_FLINGER = 'android.permission.ACCESS_SURFACE_FLINGER';
    this.ACCESS_WIFI_STATE = 'android.permission.ACCESS_WIFI_STATE';
    this.ACCOUNT_MANAGER = 'android.permission.ACCOUNT_MANAGER';
    this.ADD_VOICEMAIL = 'com.android.voicemail.permission.ADD_VOICEMAIL';
    this.AUTHENTICATE_ACCOUNTS = 'android.permission.AUTHENTICATE_ACCOUNTS';
    this.BATTERY_STATS = 'android.permission.BATTERY_STATS';
    this.BIND_ACCESSIBILITY_SERVICE = 'android.permission.BIND_ACCESSIBILITY_SERVICE';
    this.BIND_APPWIDGET = 'android.permission.BIND_APPWIDGET';
    this.BIND_CARRIER_MESSAGING_SERVICE = 'android.permission.BIND_CARRIER_MESSAGING_SERVICE';
    this.BIND_DEVICE_ADMIN = 'android.permission.BIND_DEVICE_ADMIN';
    this.BIND_DREAM_SERVICE = 'android.permission.BIND_DREAM_SERVICE';
    this.BIND_INPUT_METHOD = 'android.permission.BIND_INPUT_METHOD';
    this.BIND_NFC_SERVICE = 'android.permission.BIND_NFC_SERVICE';
    this.BIND_NOTIFICATION_LISTENER_SERVICE = 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE';
    this.BIND_PRINT_SERVICE = 'android.permission.BIND_PRINT_SERVICE';
    this.BIND_REMOTEVIEWS = 'android.permission.BIND_REMOTEVIEWS';
    this.BIND_TEXT_SERVICE = 'android.permission.BIND_TEXT_SERVICE';
    this.BIND_TV_INPUT = 'android.permission.BIND_TV_INPUT';
    this.BIND_VOICE_INTERACTION = 'android.permission.BIND_VOICE_INTERACTION';
    this.BIND_VPN_SERVICE = 'android.permission.BIND_VPN_SERVICE';
    this.BIND_WALLPAPER = 'android.permission.BIND_WALLPAPER';
    this.BLUETOOTH = 'android.permission.BLUETOOTH';
    this.BLUETOOTH_ADMIN = 'android.permission.BLUETOOTH_ADMIN';
    this.BLUETOOTH_PRIVILEGED = 'android.permission.BLUETOOTH_PRIVILEGED';
    this.BODY_SENSORS = 'android.permission.BODY_SENSORS';
    this.BRICK = 'android.permission.BRICK';
    this.BROADCAST_PACKAGE_REMOVED = 'android.permission.BROADCAST_PACKAGE_REMOVED';
    this.BROADCAST_SMS = 'android.permission.BROADCAST_SMS';
    this.BROADCAST_STICKY = 'android.permission.BROADCAST_STICKY';
    this.BROADCAST_WAP_PUSH = 'android.permission.BROADCAST_WAP_PUSH';
    this.CALL_PHONE = 'android.permission.CALL_PHONE';
    this.CALL_PRIVILEGED = 'android.permission.CALL_PRIVILEGED';
    this.CAMERA = 'android.permission.CAMERA';
    this.CAPTURE_AUDIO_OUTPUT = 'android.permission.CAPTURE_AUDIO_OUTPUT';
    this.CAPTURE_SECURE_VIDEO_OUTPUT = 'android.permission.CAPTURE_SECURE_VIDEO_OUTPUT';
    this.CAPTURE_VIDEO_OUTPUT = 'android.permission.CAPTURE_VIDEO_OUTPUT';
    this.CHANGE_COMPONENT_ENABLED_STATE = 'android.permission.CHANGE_COMPONENT_ENABLED_STATE';
    this.CHANGE_CONFIGURATION = 'android.permission.CHANGE_CONFIGURATION';
    this.CHANGE_NETWORK_STATE = 'android.permission.CHANGE_NETWORK_STATE';
    this.CHANGE_WIFI_MULTICAST_STATE = 'android.permission.CHANGE_WIFI_MULTICAST_STATE';
    this.CHANGE_WIFI_STATE = 'android.permission.CHANGE_WIFI_STATE';
    this.CLEAR_APP_CACHE = 'android.permission.CLEAR_APP_CACHE';
    this.CLEAR_APP_USER_DATA = 'android.permission.CLEAR_APP_USER_DATA';
    this.CONTROL_LOCATION_UPDATES = 'android.permission.CONTROL_LOCATION_UPDATES';
    this.DELETE_CACHE_FILES = 'android.permission.DELETE_CACHE_FILES';
    this.DELETE_PACKAGES = 'android.permission.DELETE_PACKAGES';
    this.DEVICE_POWER = 'android.permission.DEVICE_POWER';
    this.DIAGNOSTIC = 'android.permission.DIAGNOSTIC';
    this.DISABLE_KEYGUARD = 'android.permission.DISABLE_KEYGUARD';
    this.DUMP = 'android.permission.DUMP';
    this.EXPAND_STATUS_BAR = 'android.permission.EXPAND_STATUS_BAR';
    this.FACTORY_TEST = 'android.permission.FACTORY_TEST';
    this.FLASHLIGHT = 'android.permission.FLASHLIGHT';
    this.FORCE_BACK = 'android.permission.FORCE_BACK';
    this.GET_ACCOUNTS = 'android.permission.GET_ACCOUNTS';
    this.GET_PACKAGE_SIZE = 'android.permission.GET_PACKAGE_SIZE';
    this.GET_TASKS = 'android.permission.GET_TASKS';
    this.GET_TOP_ACTIVITY_INFO = 'android.permission.GET_TOP_ACTIVITY_INFO';
    this.GLOBAL_SEARCH = 'android.permission.GLOBAL_SEARCH';
    this.HARDWARE_TEST = 'android.permission.HARDWARE_TEST';
    this.INJECT_EVENTS = 'android.permission.INJECT_EVENTS';
    this.INSTALL_LOCATION_PROVIDER = 'android.permission.INSTALL_LOCATION_PROVIDER';
    this.INSTALL_PACKAGES = 'android.permission.INSTALL_PACKAGES';
    this.INSTALL_SHORTCUT = 'com.android.launcher.permission.INSTALL_SHORTCUT';
    this.INTERNAL_SYSTEM_WINDOW = 'android.permission.INTERNAL_SYSTEM_WINDOW';
    this.INTERNET = 'android.permission.INTERNET';
    this.KILL_BACKGROUND_PROCESSES = 'android.permission.KILL_BACKGROUND_PROCESSES';
    this.LOCATION_HARDWARE = 'android.permission.LOCATION_HARDWARE';
    this.MANAGE_ACCOUNTS = 'android.permission.MANAGE_ACCOUNTS';
    this.MANAGE_APP_TOKENS = 'android.permission.MANAGE_APP_TOKENS';
    this.MANAGE_DOCUMENTS = 'android.permission.MANAGE_DOCUMENTS';
    this.MASTER_CLEAR = 'android.permission.MASTER_CLEAR';
    this.MEDIA_CONTENT_CONTROL = 'android.permission.MEDIA_CONTENT_CONTROL';
    this.MODIFY_AUDIO_SETTINGS = 'android.permission.MODIFY_AUDIO_SETTINGS';
    this.MODIFY_PHONE_STATE = 'android.permission.MODIFY_PHONE_STATE';
    this.MOUNT_FORMAT_FILESYSTEMS = 'android.permission.MOUNT_FORMAT_FILESYSTEMS';
    this.MOUNT_UNMOUNT_FILESYSTEMS = 'android.permission.MOUNT_UNMOUNT_FILESYSTEMS';
    this.NFC = 'android.permission.NFC';
    this.PERSISTENT_ACTIVITY = 'android.permission.PERSISTENT_ACTIVITY';
    this.PROCESS_OUTGOING_CALLS = 'android.permission.PROCESS_OUTGOING_CALLS';
    this.READ_CALENDAR = 'android.permission.READ_CALENDAR';
    this.READ_CALL_LOG = 'android.permission.READ_CALL_LOG';
    this.READ_CONTACTS = 'android.permission.READ_CONTACTS';
    this.READ_EXTERNAL_STORAGE = 'android.permission.READ_EXTERNAL_STORAGE';
    this.READ_FRAME_BUFFER = 'android.permission.READ_FRAME_BUFFER';
    this.READ_HISTORY_BOOKMARKS = 'com.android.browser.permission.READ_HISTORY_BOOKMARKS';
    this.READ_INPUT_STATE = 'android.permission.READ_INPUT_STATE';
    this.READ_LOGS = 'android.permission.READ_LOGS';
    this.READ_PHONE_STATE = 'android.permission.READ_PHONE_STATE';
    this.READ_PROFILE = 'android.permission.READ_PROFILE';
    this.READ_SMS = 'android.permission.READ_SMS';
    this.READ_SOCIAL_STREAM = 'android.permission.READ_SOCIAL_STREAM';
    this.READ_SYNC_SETTINGS = 'android.permission.READ_SYNC_SETTINGS';
    this.READ_SYNC_STATS = 'android.permission.READ_SYNC_STATS';
    this.READ_USER_DICTIONARY = 'android.permission.READ_USER_DICTIONARY';
    this.READ_VOICEMAIL = 'com.android.voicemail.permission.READ_VOICEMAIL';
    this.REBOOT = 'android.permission.REBOOT';
    this.RECEIVE_BOOT_COMPLETED = 'android.permission.RECEIVE_BOOT_COMPLETED';
    this.RECEIVE_MMS = 'android.permission.RECEIVE_MMS';
    this.RECEIVE_SMS = 'android.permission.RECEIVE_SMS';
    this.RECEIVE_WAP_PUSH = 'android.permission.RECEIVE_WAP_PUSH';
    this.RECORD_AUDIO = 'android.permission.RECORD_AUDIO';
    this.REORDER_TASKS = 'android.permission.REORDER_TASKS';
    this.RESTART_PACKAGES = 'android.permission.RESTART_PACKAGES';
    this.SEND_RESPOND_VIA_MESSAGE = 'android.permission.SEND_RESPOND_VIA_MESSAGE';
    this.SEND_SMS = 'android.permission.SEND_SMS';
    this.SET_ACTIVITY_WATCHER = 'android.permission.SET_ACTIVITY_WATCHER';
    this.SET_ALARM = 'com.android.alarm.permission.SET_ALARM';
    this.SET_ALWAYS_FINISH = 'android.permission.SET_ALWAYS_FINISH';
    this.SET_ANIMATION_SCALE = 'android.permission.SET_ANIMATION_SCALE';
    this.SET_DEBUG_APP = 'android.permission.SET_DEBUG_APP';
    this.SET_ORIENTATION = 'android.permission.SET_ORIENTATION';
    this.SET_POINTER_SPEED = 'android.permission.SET_POINTER_SPEED';
    this.SET_PREFERRED_APPLICATIONS = 'android.permission.SET_PREFERRED_APPLICATIONS';
    this.SET_PROCESS_LIMIT = 'android.permission.SET_PROCESS_LIMIT';
    this.SET_TIME = 'android.permission.SET_TIME';
    this.SET_TIME_ZONE = 'android.permission.SET_TIME_ZONE';
    this.SET_WALLPAPER = 'android.permission.SET_WALLPAPER';
    this.SET_WALLPAPER_HINTS = 'android.permission.SET_WALLPAPER_HINTS';
    this.SIGNAL_PERSISTENT_PROCESSES = 'android.permission.SIGNAL_PERSISTENT_PROCESSES';
    this.STATUS_BAR = 'android.permission.STATUS_BAR';
    this.SUBSCRIBED_FEEDS_READ = 'android.permission.SUBSCRIBED_FEEDS_READ';
    this.SUBSCRIBED_FEEDS_WRITE = 'android.permission.SUBSCRIBED_FEEDS_WRITE';
    this.SYSTEM_ALERT_WINDOW = 'android.permission.SYSTEM_ALERT_WINDOW';
    this.TRANSMIT_IR = 'android.permission.TRANSMIT_IR';
    this.UNINSTALL_SHORTCUT = 'com.android.launcher.permission.UNINSTALL_SHORTCUT';
    this.UPDATE_DEVICE_STATS = 'android.permission.UPDATE_DEVICE_STATS';
    this.USE_CREDENTIALS = 'android.permission.USE_CREDENTIALS';
    this.USE_SIP = 'android.permission.USE_SIP';
    this.VIBRATE = 'android.permission.VIBRATE';
    this.WAKE_LOCK = 'android.permission.WAKE_LOCK';
    this.WRITE_APN_SETTINGS = 'android.permission.WRITE_APN_SETTINGS';
    this.WRITE_CALENDAR = 'android.permission.WRITE_CALENDAR';
    this.WRITE_CALL_LOG = 'android.permission.WRITE_CALL_LOG';
    this.WRITE_CONTACTS = 'android.permission.WRITE_CONTACTS';
    this.WRITE_EXTERNAL_STORAGE = 'android.permission.WRITE_EXTERNAL_STORAGE';
    this.WRITE_GSERVICES = 'android.permission.WRITE_GSERVICES';
    this.WRITE_HISTORY_BOOKMARKS = 'com.android.browser.permission.WRITE_HISTORY_BOOKMARKS';
    this.WRITE_PROFILE = 'android.permission.WRITE_PROFILE';
    this.WRITE_SECURE_SETTINGS = 'android.permission.WRITE_SECURE_SETTINGS';
    this.WRITE_SETTINGS = 'android.permission.WRITE_SETTINGS';
    this.WRITE_SMS = 'android.permission.WRITE_SMS';
    this.WRITE_SOCIAL_STREAM = 'android.permission.WRITE_SOCIAL_STREAM';
    this.WRITE_SYNC_SETTINGS = 'android.permission.WRITE_SYNC_SETTINGS';
    this.WRITE_USER_DICTIONARY = 'android.permission.WRITE_USER_DICTIONARY';
    this.WRITE_VOICEMAIL = 'com.android.voicemail.permission.WRITE_VOICEMAIL';
}

function deprecated(name) {
  console.warn("Calling cordova.plugins.permissions." + name + " with the successCallback as first argument is deprecated");
  console.warn("The new signature is '" + name + "(permission, successCallback, errorCallback)'");
}

Permissions.prototype = {
    checkPermission: function(permission, successCallback, errorCallback) {
        successCallback( {hasPermission: true} );
    },
    requestPermission: function(permission, successCallback, errorCallback) {
        if (typeof permission === "function") {
            deprecated("requestPermission");
            successCallback = arguments[0];
            errorCallback = arguments[1];
            permission = arguments[2];
        }
        successCallback( {hasPermission: true} );
    },
    requestPermissions: function(permissions, successCallback, errorCallback) {
        successCallback( {hasPermission: true} );
    }
};

Permissions.prototype.hasPermission = function (permission, successCallback, errorCallback) {
    console.warn("hasPermission() function deprecated. Considers using checkPermission()");

    if (typeof permission === "function") {
        deprecated("hasPermission");
        successCallback = arguments[0];
        errorCallback = arguments[1];
        permission = arguments[2];
    }
    this.checkPermission.call(this, permission, successCallback, errorCallback);
};

module.exports = new Permissions();
