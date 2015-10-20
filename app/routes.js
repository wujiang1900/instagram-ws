'use strict';
module.exports = function (app) {
	var request = require('request');
	var Q = require('q');
	var path = require('path'),
			dirName = __dirname.replace(path.basename(__dirname), '');
	
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
    var url = 'https://api.instagram.com/oauth/authorize/?client_id=2d3a4166301e4d6997f7c56683c68963&redirect_uri=http://'+
          req.hostname+':9778/instagram/confirm&response_type=code';
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

    return doHttp(req, res, url, method, formData)//.then(function(){console.log('Got token!');});
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