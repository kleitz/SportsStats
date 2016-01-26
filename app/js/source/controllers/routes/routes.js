;(function(){
	"use strict";
	angular.module("ssCtrls")
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider    
		.when('/:sport/game/:id', {
			templateUrl: '/views/game.html',
			controller: 'gameController',
			controllerAs: 'game',
			caseInsensitiveMatch: true
		})
		.when('/:id', {
			templateUrl: '/views/game.html',
			controller: 'gameController',
			controllerAs: 'game'
		})
		.otherwise({
			templateUrl: '/views/game.html',
			controller: 'gameController',
			controllerAs: 'game'
		});

		//$locationProvider.html5Mode(true);
	}]);
})();