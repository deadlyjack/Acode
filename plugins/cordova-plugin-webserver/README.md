# cordova-plugin-webserver
*A webserver plugin for cordova*

This plugin helps you to start a full webserver in JavaScript on Android and iOS.

## Current supported platforms

- Android (i think all versions?! Tell me if it's not true)
- iOS (8.0 or later (armv7, armv7s or arm64))

## Why?

I started this project because I wanted a solution like [ExpressJS](http://expressjs.com/de/) but hybrid (for iOS and Android). I didn't want to build two native applications which each serve a backend (two codebases are just bah!). So this is the solution to create a Webserver which can receives HTTP Requests and responds with HTTP Responds.

## Installation

Just add the cordova plugin to your project

`cordova plugin add https://github.com/bykof/cordova-plugin-webserver`

## Use

Ok so it's pretty ez. There are 4 Methods which are available in the `webserver` variable:

- start(port) or start()
- stop()
- onRequest(request)
- sendResponse(responseId, responseObject, callbackSuccess, callbackError)

### start(port)

port (optional): Set a port of your webserver.
Default port: 8080

This method will start your webserver.

### stop()

This method will stop your webserver.

### onRequest(callback(request))

Every time the webserver receives an request your callback function is called. 
The request params will look like this:
```
{
	requestId: '3jh4-ku34k-k3j4k-k3j42',
	body: '',
	headers: {
		... some headers
	},
	method: 'POST',
	path: '/hello/world',
	query: 'bla=wer&blu=2'
}
```

### sendResponse(requestId, responseObject,  callbackSuccess, callbackError)

If you received a request you will probably send a response "*cough*"...
We need to add a requestId param to map a response to a request, because internally the webserver will wait for the response. (Yes currently the webserver will wait until there aren't computers anymore on earth).

The params have to look like this (there are not default values for the params!):
```
{
	status: 200,
	body: '<html>Hello ... something</html>',
	headers: {
		'Content-Type': 'text/html' <--- this is important
	}
}
```

#### Serving files


To serve a file in response to an http request you should use `path` param which points to the file
location on the device. 

```
{
	status: 200,
	path: '/sdcard0/Downloads/whatever.txt',
	headers: {
        }
}
```

The cordova-plugin-file plugin can be used to locate the path of the file data to be sent. For android you
might need strip the `file://` part of the file path for it to work. 
```
window.resolveLocalFileSystemURL('cdvfile://localhost/temporary/path/to/file.mp4', function(entry) {
  console.log(entry.toURL());
});
```

## Example

```javascript
webserver.onRequest(
	function(request) {
		console.log("O MA GAWD! This is the request: ", request);

		webserver.sendResponse(
			request.requestId,
			{
				status: 200,
				body: '<html>Hello World</html>',
				headers: {
					'Content-Type': 'text/html'
				}
			}
		);
	}
);

webserver.start();

//... after a long long time
// stop the server
webserver.stop();
```

## Credits

Special thanks to:

- https://github.com/NanoHttpd/nanohttpd
- https://github.com/swisspol/GCDWebServer
