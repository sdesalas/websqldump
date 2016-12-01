var static = require('node-static');
var open = require('open');
var fileServer = new static.Server('.');
var port = 5000;

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(port, function() {
  console.log('Node app is running on port', port);
  open('http://localhost:5000/spec/run.html');
});

