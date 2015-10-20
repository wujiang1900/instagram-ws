  'use strict';
  module.exports = function (app) {
	var request = require('request');
	var Q = require('q');
	var path = require('path'),
			dirName = __dirname.replace(path.basename(__dirname), '');
	
	app.get('/', function(req, res) {
		res.sendFile(dirName + '/public/index.html');
	});

  app.get('/instagram/confirm', getToken);

  app.get('/instagram', getCode);
	
	app.get('/instagram/recentByTag', function(req, res) {

    console.log('calling recentTag');

    getCode(req, res)//.then(getToken(req, res);

	  });

  function getCode(req, res) {
    var url = 'https://api.instagram.com/oauth/authorize/?client_id=2d3a4166301e4d6997f7c56683c68963&redirect_uri=http://localhost:9778/instagram/confirm&response_type=code';
    res.redirect(url);
  }

  function getToken(req, res) {
        var formData = {'client_id':'2d3a4166301e4d6997f7c56683c68963',
                    'client_secret':'2ef572cafb2d482f86b144242cb2bf5c',
                    'grant_type':'authorization_code',
                    'redirect_uri':'http://localhost:9778/instagram/confirm',
                    'code':req.query.code};
    var url = 'https://api.instagram.com/oauth/access_token';

    var method = 'POST';

    doHttp(req, res, url, method, formData);
  }

	 function doHttp(req, res, url, method, formData) {
	  var deferred = Q.defer();
	 // console.log(decodeURIComponent(url));
//console.log(req.query);
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
       console.log(body);
	    deferred.resolve(body);
	  }) ;
	  var results = deferred.promise;
//	  console.log(results);
	  res.send(results);
    return deferred.promise;
	}
}