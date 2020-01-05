function request(method, url, data, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      callback(this);
    }
  };
  xhttp.open(method, url, true);
  xhttp.send(data);
}

exports.defineAutoTests = function() {

  describe('Webserver (window.webserver)', function () {
    var fns = [
      'start'
    ];

    it('should exist', function() {
      expect(webserver).toBeDefined();
    });

    fns.forEach(function(fn) {
      it('should contain a ' + fn + ' function', function () {
        expect(typeof webserver[fn]).toBeDefined();
        expect(typeof webserver[fn] === 'function').toBe(true);
      });
    })
  });

  describe('Do a request', function() {

    it('should do a request with plaintext', function() {
        webserver.onRequest(
          function(request) {
            webserver.sendResponse(
              request.requestId,
              {
                status: 200,
                headers: {
                  'Content-Type': 'text/plain',
                  'TestHeader': 'Just a testheader'
                },
                body: 'Test success!'
              }
            )
          }
        );
        websever.start();
  
        request('GET', 'localhost:8080', undefined, function (response) {
          expect(response.responseText).toBe('Test success!');
        });
    });
  });
};

exports.defineManualTests = function(contentEl, createActionButton) {
  createActionButton('Start bljad Webserver', function() {
    console.log("Starting webserver...");

    webserver.onRequest(
      function(request) {
        console.log('Received request');
        console.log('requestId: ', request.requestId);
        console.log('body: ', request.body);
        console.log('headers: ', request.headers);
        console.log('path: ', request.path);
        console.log('query: ', request.query);
        console.log('method: ', request.method);

        webserver.sendResponse(
            request.requestId,
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'TestHeader': 'Just a testheader'
                },
                body: '<html><form method="POST"><input type="text" name="bla" /><input type="submit" /></form></html>'
            }
        );
      }
    );

    webserver.start(
      function() {
        console.log('Success!');
      },
      function() {
        console.log('Error!');
      }
    );
  });

  createActionButton('Start Webserver with Port 1337', function() {
    console.log("Starting webserver...");

    webserver.start(
      function() {
        console.log('Success!');
      },
      function() {
        console.log('Error!');
      },
      1337
    );
  });

  createActionButton('Stop Webserver', function() {
    console.log("Stopping webserver...");

    webserver.stop(
      function() {
        console.log('Success!');
      },
      function() {
        console.log('Error!');
      }
    );
  });
};
