var WEBSERVER_CLASS = 'Webserver';
var START_FUNCTION = 'start';
var ONREQUEST_FUNCTION = 'onRequest';
var SENDRESPONSE_FUNCION = 'sendResponse';
var STOP_FUNCTION = 'stop';


module.exports = {
  start: function(success_callback, error_callback, port) {
    var params = [];
    if (port) {
      params.push(port);
    }
    cordova.exec(
      success_callback,
      error_callback,
      WEBSERVER_CLASS,
      START_FUNCTION,
      params
    );
  },
  onRequest: function(success_callback) {
    cordova.exec(
      success_callback,
      function(error) {console.error(error)},
      WEBSERVER_CLASS,
      ONREQUEST_FUNCTION,
      []
    );
  },
  sendResponse: function(requestId, params, success_callback, error_callback) {
    cordova.exec(
      success_callback,
      error_callback,
      WEBSERVER_CLASS,
      SENDRESPONSE_FUNCION,
      [requestId, params]
    );
  },
  stop: function(success_callback, error_callback) {
    cordova.exec(
      success_callback,
      error_callback,
      WEBSERVER_CLASS,
      STOP_FUNCTION,
      []
    );
  }
}