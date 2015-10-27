(function() {
'use strict';

angular.module('instApp')
.factory('CodeUrl', ['$resource', function($resource) {
  return $resource('/instagram/codeUrl');
}])
.factory('InstCode', ['$resource','CodeUrl', '$log', function($resource, CodeUrl, $log) {
  // CodeUrl.get().$promise.then(function(result) {
  //   $log.info(result.url);
    var result = {url : 'https://api.instagram.com/oauth/authorize/?client_id=2d3a4166301e4d6997f7c5…63&redirect_uri=http://localhost:9778/instagram/confirm&response_type=code'};
    return $resource(result.url, {}, {
        get:{
            method:'GET',
            isArray:false,
            headers:{'Access-Control-Allow-Origin': 'https://api.instagram.com'} 
        },
    });
  // });
}]);
})();