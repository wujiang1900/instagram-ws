(function () {
	'use strict';
	console.log('in angular');
	var app = angular.module("instApp", ["ngRoute", "Routes"])
	.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
		$routeProvider
			.when("/", {
				templateUrl: "views/beanstack.html"
			})
			.when("/instagram/confirm", {
				templateUrl: "/views/beanstack.html"
			});

			$locationProvider.html5Mode({
				enabled: true,
				requireBase: false
			});

	}])})();