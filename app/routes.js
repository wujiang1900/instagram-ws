'use strict';
module.exports = function (app, port) {

  var request = require('request');
  var Q       = require('q');
  var path    = require('path'),
    dirName   = __dirname.replace(path.basename(__dirname), '');

  var config  = require('simpler-config').load(require(dirName + '/instagram.json'));

  var client_id        = config.client_id;
  var client_secret    = config.client_secret;
  var grant_type       = config.grant_type;
  var response_type    = config.response_type;
  var authorize_url    = config.authorize_url;
  var access_token_url = config.access_token_url;
	
	app.get('/', function(req, res) {
		res.sendFile(dirName + '/public/index.html');
	});

  var token = undefined;

  app.get('/instagram/confirm', getToken);

  app.get('/instagram', getCode);
	
	app.get('/instagram/recentByTag', function(req, res) {
    console.log('calling recentTag');
    if(token === undefined )
      getCode(req, res)//.then(function(){console.log('Got it!');});
   // getCode(req, res);
	});

  function getCode(req, res) {
    var redirect_uri = 'http://'+req.hostname+':'+port+config.redirect_uri;
    var url = authorize_url + '?client_id=' + client_id + '&redirect_uri='+ redirect_uri + '&response_type=' + response_type;
    res.redirect(url);
  }

  function getToken(req, res) {
    var redirect_uri = 'http://'+req.hostname+':'+port+config.redirect_uri;
    var formData = {
        'client_id'     : client_id,
        'client_secret' : client_secret,
        'grant_type'    : grant_type,
        'redirect_uri'  : redirect_uri,
        'code'          : req.query.code
    };
    var method = 'POST';

    return doHttp(req, res, access_token_url, method, formData)//.then(function(){console.log('Got token!');});
  }

	function doHttp(req, res, url, method, formData) {
	  var deferred = Q.defer();
	  if(method==null) method = 'GET';
	  var options = {
      method: method,
      formData: formData,
	    url: url //'https://api.instagram.com/v1/tags/'+req.query.tag+'/media/recent?count='+req.query.count
	    // , formData: {
	    //   'Accept': 'application/json'
	    // }
	  };
    console.log(options.url);
	  request(options, function(err, res, body) {
	   // console.log(err, res, body);
	    if (err) {
	      deferred.reject(err);
	      console.log(err);
	      return;
	    }
       // console.log(body);
      try {
        token = JSON.parse(body).access_token;
      } catch(e) {
        console.log(e);
        deferred.reject(err);
        return;
      }
       console.log('token='+token);
       deferred.resolve(body);
    });
//    var results = deferred.promise;
  //  console.log(results);
   // res.send(results);
    return deferred.promise;   
	}	 
}