;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("gameController",["$scope","$routeParams","$http",function($scope,$routeParams,$http){
		var sport,id;
		$scope.mainScope.sportData = null;
		$scope.mainScope.gameData = null;
		if (!$routeParams.id) {
			$scope.mainScope.title = "";
		} else {
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
					$scope.mainScope.sportData = null;
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
					$scope.mainScope.title = 
						response.data.a.short + ":" +
						response.data.aScore + " " +
						response.data.h.short + ":" +
						response.data.hScore;
				},
				function(response){
					$scope.mainScope.gameData = null;
					$scope.mainScope.title = "";
					///show error
				}
			);
		}
	}]);
})();