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

  // app.get('/instagram/getToken', getCode);
	
	app.get('/instagram/:action', performAction);

  function performAction(req, res) {
    //console.log('calling '+path.basename(req.path));
 // console.log('req.params.action='+req.params.action);
    if(/CapitalOne/i.test(req.params.action)) {
      return doCapitalOne(req, res);
    }

    var action = buildActionStr(req, req.params.action);
    if (token === undefined ) {
       getCode(req, res, action);
    }
    else {
      return doAction(req, res, action);
    }
  }

  function doCapitalOne(req, res) {
    req.params.action = 'recentByTag';
    req.query.tag='CapitalOne';
    performAction(req, res);
  }

  /** process the action  
        and 
      return a promise with data
      or send result in the response
         (when res != null)
  */
  function doAction(req, res, action) {
    var deferred = Q.defer();
    doHttp(getActionUrl(action))
    .then(function(result){
      // console.log("got result. action="+action);
      var data = JSON.parse(result).data;
      if(/recentByTag::tag==CapitalOne/i.test(action)) {
        compileResults(req, res, data);  
      }
      else
      if(res) 
        res.send(result);
      else
        deferred.resolve(data);
    })
    .catch(function(e) {
      console.log(e);
      deferred.reject(e);
    });    
    // finally () ??
    return deferred.promise;
  }

  function compileResults(req, res, data) {
    var userInfoPromise = [];
    data.map(function(media, index){ 
    // console.log(index);     
      req.params.action = 'getUser';
      req.query.userId = media.user.id;
      userInfoPromise[index] = performAction(req, null);
    });

    userInfoPromise[data.length+1] = runSentimentAnalysis(data);

    var result = [];
    Promise.all(userInfoPromise).then(function(info){    
      data.map(function(m, i){ 
        result[i] = constructResult (m, info[i]);
      });
      result = {'mediaAndUserInfo':result, 'sentimentCount':info[data.length+1]};
      res.send(result);
    })
    .catch(function(e) {
      console.log(e);
    });
  }

  function constructResult (m, userInfo) {

    var r={};
    r.type = m.type;
    r.created_time = m.created_time;
    r.link = m.link;
    r.likeCount = m.likes.count;
    m.user.counts = userInfo.counts;
    r.user = m.user;
    return r;
  }

  /** call 3rd party sentiment analysis api to get the sentiment for each media  
        and 
      return a promise with the total count result 
  */
  function runSentimentAnalysis(data) {
    var deferred = Q.defer();
    var count = {positive:0, negative:0, neutral:0};

    Promise.all(data.map(function(media, index){
      var medialUrl = encodeURIComponent(media.link);

      //todo: externize the apikey & url to prop file
      var url = 'http://gateway-a.watsonplatform.net/calls/url/URLGetTargetedSentiment?targets=capitalone&url='
                + medialUrl + '&outputMode=json&apikey=c04b23aa4889edb454c4b72e6ae2cae79fa25bfe';
      // console.log(url);
      return doHttp(url);
    })).then(function(results) {
      results.map(function(result) {
        result = JSON.parse(result);
        switch(result["status"]) {
          case 'OK':          
        // console.log('result docSentiment type='+ result.docSentiment.type);
            switch(result.docSentiment.type) {
              case 'positive':
                count.positive++; 
                break;
              case 'negative':
                count.negative++; 
                break;
              case 'neutral':
              default:
                count.neutral++; 
            }
          case 'ERROR':
          default:
            // console.log(result.statusInfo);
            count.neutral++;
            // console.log('netural='+count.neutral);
        }
      });

      deferred.resolve(count);
    })
    .catch(function(e) {
      console.log(e);
      deferred.reject(e);
    });
    // .finally(function(e) {
    //   console.log(count.positive);
    // }
    // );

      return deferred.promise;
  }

  /* sample action:  'recentByTag::tag==CapitalOne||count==3||' */
  function buildActionStr(req, action) {
    var params = config.actions[action]['params'];
    var paramStr = '';
    for(var i = 0; i<params.length; i++) {
      paramStr += params[i]+VALUE_SEPARATOR+req.query[params[i]]+PARAM_SEPARATOR;
    }
    return action + ACTION__SEPARATOR + paramStr;
  }

/* sample action:  'recentByTag::tag==CapitalOne||count==3||' */
  function getActionUrl(action) {

      // console.log("getting url, action="+action);
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
     // console.log("getting url, url="+url + paramStr);
     return url + paramStr;
  }

  function getCode(req, res, action) {
    console.log('getting code...');
    var url = authorize_url + '?client_id=' + client_id 
                            + '&redirect_uri=' + getRedirectUri(req, action) 
                            + '&response_type=' + response_type;
    // console.log(url);
    // gettingToken = true;
    res.redirect(url);
  }

  function getToken(req, res) {
   // if(token) return doAction(req, res, action);

    //todo:  handle errors (see  https://instagram.com/developer/authentication/)

    var action = req.query.action;
    // if(typeof action !== 'string') {
    //   console.log("Action not a string!")
    //   return;
    // }

    // if(token) 
    //   res.send(token);

    var redirect_uri = getRedirectUri(req, action);

    var formData = {
        'client_id'     : client_id,
        'client_secret' : client_secret,
        'grant_type'    : grant_type,
        'redirect_uri'  : redirect_uri,
        'code'          : req.query.code
    };

    doHttp(access_token_url, 'POST', formData).then(function(){
      if (action === undefined) {
      console.log("action undefined.");
      }
      else { 
        console.log("token got successfully");
        return doAction(req, res, action);
      }
    });
    // finally () ??
  }

  function getRedirectUri(req, action) {
    // console.log("action to redirect="+action);
    return 'http://'+ req.hostname + ':'
                    + port 
                    + config.redirect_uri 
                    + ((typeof action === 'string') ? '?action=' + action : '');
  }

  /** perform a http request  
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
	  };
     console.log('Calling ' + options.url);
	  request(options, function(err, res, body) {
	    if (err) {
	      deferred.reject(err);
	      console.log(err);
	      return;
	    }
       // console.log(body);
     if(token===undefined)
      try {
        token = JSON.parse(body).access_token;
      } catch(e) {
        console.log('body='+body);
        console.log(e);
        deferred.reject(e);
        return;
      }
      
       deferred.resolve(body);
    });
    return deferred.promise;   
	}	 
}