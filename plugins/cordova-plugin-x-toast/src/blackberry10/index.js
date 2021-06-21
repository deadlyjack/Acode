var toast,
	resultObjs = {},
	threadCallback = null,
   _utils = require("../../lib/utils");

module.exports = {

	show: function (success, fail, args, env) {
		var result = new PluginResult(args, env);
		resultObjs[result.callbackId] = result;
		
		var message = JSON.parse(decodeURIComponent(args[0])),
		duration = JSON.parse(decodeURIComponent(args[1])),
		position = JSON.parse(decodeURIComponent(args[2]));
		
		toast.getInstance().show(result.callbackId, {message:message, duration:duration, position:position});
	}
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin for connection
///////////////////////////////////////////////////////////////////

JNEXT.Toast = function () {
	var self = this,
		hasInstance = false;

	self.getId = function () {
		return self.m_id;
	};

	self.init = function () {
		if (!JNEXT.require("libToast")) {
			return false;
		}

		self.m_id = JNEXT.createObject("libToast.Toast_JS");

		if (self.m_id === "") {
			return false;
		}

		JNEXT.registerEvents(self);
	};

	// calls into InvokeMethod(string command) in Toast_JS.cpp
	self.show = function (callbackId, input) {
		return JNEXT.invoke(self.m_id, "show " + callbackId + " " + JSON.stringify(input));
	};

	// Fired by the Event framework (used by asynchronous callbacks)
	self.onEvent = function (strData) {
		var arData = strData.split(" "),
			callbackId = arData[0],
			result = resultObjs[callbackId],
			data = arData.slice(1, arData.length).join(" ");

		if (result) {
			if (callbackId != threadCallback) {
				result.callbackOk(data, false);
				delete resultObjs[callbackId];
			} else {
				result.callbackOk(data, true);
			}
		}
	};

	// ************************
	// End of methods to edit
	// ************************
	self.m_id = "";

	self.getInstance = function () {
		if (!hasInstance) {
			hasInstance = true;
			self.init();
		}
		return self;
	};

};

toast = new JNEXT.Toast();
