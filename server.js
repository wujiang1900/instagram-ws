var express = require("express"),
		app = express(),
		port;

// Set port
port = process.env.PORT || 9778;
// Use public directory for static files
app.use(express.static(__dirname + '/public'));
// Include the routes module		
require('./app/routes')(app);

// Your code here

app.listen(port);