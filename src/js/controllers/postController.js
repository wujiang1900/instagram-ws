(function() {
'use strict';

angular.module('instApp')
.controller('postController',['$scope', 'NgTableParams', '$resource', '$log',
function($scope, NgTableParams, $resource, $log) {
  $scope.showTable = true;

  var fields = 
    {'tag': 
      {'default' : 'CapitalOne', 
      validation: [
        {'Please provide a tag to search for.':
          function(value){
            return value.length===0;
          }
        }]
      },
    'count':
      {'default' : 3
      // validation: [
      //   {'Please provide a count to search for.':
      //     function(value){
      //       return value.length===0;
      //     }
      //   }]
      }
    };

  $scope.queryParams = {};
  Object.keys(fields).map( function(field){
    // $log.info(field);
    $scope.queryParams[field] = fields[field]['default'];
  });

  $scope.err = {};
  $scope.validate = function(field) {
    var validations = fields[field]['validation'];
    if(!validations) {
      return true;
    }
    validations.map(function(validation){
      Object.keys(validation).map(function(error){
        var field_value = $scope.queryParams[field];
        if(validation[error](field_value)) {
          // $log.info(field);
          $scope.err[field] = error;
        }
      });
    });
  };

 var Api = $resource('/instagram/recentByTag');
  $scope.tableParams = new NgTableParams({}, {
    getData: function(params) {
      return [{type:'image', caption:'here', link: 'hello', createTS: 120903011, user: 'jiang wu'},

      {type:'pdf', caption:'here', link: 'hello', createTS: 123203011, user: 'cindy wu'}];
      // ajax request to api
      // return Api.get(params.url()).$promise.then(function(data) {
      //   $scope.showTable = true;
      //   params.total(data.inlineCount); // recal. page nav controls
      //   return data.results;
      // });
    }
  });

  $scope.validateCount = function() {
    if(typeof $scope.queryParams.count===NaN) {
      $scope.err.count = 'Count has to be a number.';
    }
  };

  $scope.submit = function() {
    if(!isValid) {
      return;
    }
    // $scope.queryParams.tag = $scope.tag;
    // $scope.queryParams.count = $scope.count;
  };
  
}
]);

})();