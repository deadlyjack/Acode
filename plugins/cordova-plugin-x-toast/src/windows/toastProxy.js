/**
 * @author Piotr Smolarski <ph0ndragxdev@gmail.com>
 */
var toastProxy = {

    lastDisplayedNotification: null,

    show: function(successCallback, errorCallback, options) {
        var notifications = Windows.UI.Notifications;

        var template = notifications.ToastTemplateType.ToastText01;
        var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);

        var toastTextElements = toastXml.getElementsByTagName("text");
        toastTextElements[0].appendChild(toastXml.createTextNode(options[0].message));

        var toastNode = toastXml.selectSingleNode("/toast");
        toastNode.setAttribute("duration", options[0].duration);

        var toast = new notifications.ToastNotification(toastXml);

        toast.onactivated = function (event) {
            toastProxy.lastDisplayedNotification = null;
            successCallback({
                event: "touch",
                message: options[0].message,
                data: options[0].data
            });
        };

        toast.ondismissed = function (event) {
            toastProxy.lastDisplayedNotification = null;
            successCallback({
                event: "hide",
                message: options[0].message,
                data: options[0].data
            });
        };

        toast.onfailed = function(err) {
            toastProxy.lastDisplayedNotification = null;
            errorCallback(err);
        };

        notifications.ToastNotificationManager.createToastNotifier().show(toast);
    },

    hide: function() {
        if (this.lastDisplayedNotification !== null) {
            notifications.ToastNotificationManager.createToastNotifier().hide(toast);
            this.lastDisplayedNotification = null;
        }
    }
};

cordova.commandProxy.add("Toast", toastProxy);
