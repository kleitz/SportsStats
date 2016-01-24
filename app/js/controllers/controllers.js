;(function(){
	"use strict";
	angular.module("ssCtrls",["ngRoute"])
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
			templateUrl: '/views/game2.html',
			controller: 'gameController',
			controllerAs: 'game'
		});

		//$locationProvider.html5Mode(true);
	}])
	.controller("ssCtrl", ["$scope",function($scope){
		$scope.question = 'question';
		$scope.mainScope = {};
	}])
	.controller("gameController",["$scope","$routeParams","$http",function($scope,$routeParams,$http){
		var sport,id;
		$scope.mainScope.sportData = null;
		$scope.mainScope.gameData = null;
		if (!$routeParams.sport && $routeParams.id) {
			console.log($routeParams);
			sport = $routeParams.id.substring(0,3);
			id = $routeParams.id.substring(3,$routeParams.id.length);
		} else {
			sport = $routeParams.sport;
			id = $routeParams.id;
		}
		$http({
			method: "GET",
			url: "./data/"+sport+".json"
		})
		.then(function(response){
				$scope.mainScope.sportData = response.data;
			},
			function(response){
				if (response.status === 404) {
					///show error
				}
			}
		);
		$http({
			method: "GET",
			url: "./app/api/getGameData.php?gameId="+sport+id
		})
		.then(function(response){
				if (response.data.id === null) {
					response.data.id = sport+id;
				}
				$scope.mainScope.gameData = response.data;
			},
			function(response){
				///show error
			}
		);
	}]);
})();