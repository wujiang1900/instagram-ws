(function () {
  'use strict';
  var express = require("express"),
		app = express();
  var path = require('path'),
    dirName = __dirname;
  var config = require('simpler-config').load(require(dirName + '/config.json'));

  // Set port
 var port = config.port || 9778;

  // Use public directory for static files
  app.use(express.static(__dirname + '/public'));
  // Include the routes module		
  require('./app/routes')(app, port);

  // Your code here
  console.log('Listening on port: ' + port);
  app.listen(port);
})();