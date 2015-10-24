(function () {

	angular.module('Routes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/beanstack.html'
			})
			.when('/instagram', {
				templateUrl: 'views/recentPosts.html'
			});

			$locationProvider.html5Mode({
				enabled: true,
				requireBase: false
			});

	}])

})();