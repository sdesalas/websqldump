var express = require('express');
var port = 5000;
var app = express();

app.set('port', port);

app.use('/', express.static(__dirname + '/www'));

app.listen(port, function() {
  console.log('Node app is running on port', app.get('port'));
});

