(function() {
'use strict';

angular.module('instApp')
.factory('RecentPost', ['$resource', function($resource) {
    return $resource('/instagram/recentByTag',{},{
        get:{
            method:'GET',
            isArray:false,
            headers:{'Access-Control-Allow-Origin': '*'} 
        },
    });
}]);
})();