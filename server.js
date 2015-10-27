(function () {
  'use strict';

var express = require('express'),
    http = require('http'),
    app = express();

var path = require('path'),
    dirName = __dirname;
  var config = require('simpler-config').load(require(dirName + '/config.json'));
  var port = process.env.PORT || config.port || 9778;
  app.set('port', port);

  app.use(express.static(__dirname + '/public'));
    // Include the routes module    
  require('./app/routes')(app, port);

  http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
  });
})();
