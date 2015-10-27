'use strict';
module.exports = function (app, port) {
  var ACTION__SEPARATOR = '::';
  var PARAM_SEPARATOR = '||';  
  var VALUE_SEPARATOR = '=='; 

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
  app.get('/instagram/codeUrl', getCodeUrl);
  app.get('/instagram/token', getCode);
	
	app.get('/instagram/:action', function(req, res) {
    console.log('query=' + req.query.page);
    console.log('params=' + req.params.page);
    console.log('action=' + req.params.action);
    //console.log('calling '+path.basename(req.path));

  //  req.writeHead(200, { 'Access-Control-Allow-Origin': '*' });

    var action = getAction(req, req.params.action);
    if (token === undefined ) {
      if(req.query.code) {
        // for ajax call (e.g. angular) 
        // to avoid “No 'Access-Control-Allow-Origin' header is present" error
        // we have to pass in 'code' param from client side
        // since res.redirect will not work
     //  res = null;
      }
      else {
        // this block is for calling action directly from postman or browser
        // ajax call (e.g. angular)  needs to pass in 'code' param, 
        //  otherwise, will get “No 'Access-Control-Allow-Origin' header is present" error
        getCode(req, res, action);
      }
    }
    else {
      doAction(res, action);
    }
	});

  function doAction(res, action) {
    doHttp(getActionUrl(action))
    .then(function(data){      
            res.send(data);
          })
    .catch(function(e) {
      //todo: error page
        console.log(e);
      });    
    // finally () ??
  }

  /* sample action:  'recentByTag::tag==CapitalOne||count==3||' */
  function getAction(req, action) {
    var params = config.actions[action]['params'];
    var paramStr = '';
    for(var i = 0; i<params.length; i++) {
      paramStr += params[i]+VALUE_SEPARATOR+req.query[params[i]]+PARAM_SEPARATOR;
    }
    return action + ACTION__SEPARATOR + paramStr;
  }

  function getCodeUrl(req, res, action) {
    // console.log(action);
    if(res) {
      action=null;
    }
    var url = authorize_url + '?client_id=' + client_id 
                      + '&redirect_uri=' + getRedirectUri(req, action) 
                        + '&response_type=' + response_type;
    if(res) {
      res.send({'url': url});
    }
    else {
      return url;
    }
  }

  function getCode(req, res, action) {
    // console.log(url);
    if(req.query.code) {
      getToken(req, res);
    }
    else {
      // can only be called from postman or browser, not from ajax call (e.g. angular) 
      //  otherwise, will get “No 'Access-Control-Allow-Origin' header is present" error
      res.redirect(getCodeUrl(req, null, action));
    }
  }

  function getToken(req, res) {

    //todo:  handle errors (see  https://instagram.com/developer/authentication/)
console.log('1');
    var action = req.query.action;
    var redirect_uri = getRedirectUri(req, action);

    var formData = {
        'client_id'     : client_id,
        'client_secret' : client_secret,
        'grant_type'    : grant_type,
        'redirect_uri'  : redirect_uri,
        'code'          : req.query.code
    };
console.log('3');
    doHttp(access_token_url, 'POST', formData).then(function(){
      console.log(token);
      if (action === undefined) {
        if(res)
          res.send(token);
      }
      else { 
        doAction(res, action);
      }
    });
    // finally () ??
  }

  function getRedirectUri(req, action) {
    console.log('2');
    return 'http://'+ req.hostname + ':'
                    + port 
                    + config.redirect_uri 
                    + ((typeof action === 'string') ? '?action=' + action : '');
  }

  function getActionUrl(action) {
     var actions = action.split(ACTION__SEPARATOR);
     var url = config.actions[actions[0]]['url'];
     var params = actions[1].split(PARAM_SEPARATOR);
     // console.log(params);
     var paramStr = ''
     for(var i = 0; i<params.length; i++) {
        var param = params[i].split(VALUE_SEPARATOR);
        var param_name = '{'+param[0]+'}';
        if(url.indexOf(param_name)>-1) {
          url = url.replace(param_name, param[1]);
        }
        else if(param[0].length>0) {
          paramStr += '&'+param[0]+'='+param[1];
        }
     }
     url = url.replace('{ACCESS-TOKEN}', token);
     return url + paramStr;
  }

  /* call url 
    and 
  return a promise
  */
	function doHttp(url, method, formData) {
	  var deferred = Q.defer();
	  if(method==null) {
      method = 'GET';
    }
	  var options = {
      method: method,
      formData: formData,
	    url: url 
      // headers: {
      //   'Access-Control-Allow-Origin': '*'
      // }
	  };
    console.log('Calling ' + options.url);
	  request(options, function(err, res, body) {
	    if (err) {
	      deferred.reject(err);
	      console.log(err);
	      return;
	    }
     //   console.log(body);
      try {
        token = JSON.parse(body).access_token;
      } catch(e) {
        console.log(e);
        deferred.reject(err);
        return;
      }
       deferred.resolve(body);
    });
    return deferred.promise;   
	}	 
}