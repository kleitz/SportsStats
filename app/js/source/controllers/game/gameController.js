;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("gameController",["$scope","$routeParams","$http","ReduceData",function($scope,$routeParams,$http,ReduceData){
		var sport,id;
		$scope.mainScope.sportData = null;
		$scope.mainScope.gameData = null;
		$scope.game = null;
		$scope.sport = null;
		$scope.aH = [{s:"a",l:"away"},{s:"h",l:"home"}];
		if (!$routeParams.id) {
			$scope.mainScope.title = "";
		} else {
			if (!$routeParams.sport && $routeParams.id) {
				sport = $routeParams.id.substring(0,3);
				id = $routeParams.id.substring(3,$routeParams.id.length);
			} else {
				sport = $routeParams.sport;
				id = $routeParams.id;
			}
			$scope.mainScope.messageReset();
			$scope.mainScope.messageSet("Loading . . .");
			$http({
				method: "GET",
				url: "./data/"+sport+".json"
			})
			.then(function(response){
					$scope.mainScope.sportData = response.data;
					$scope.sport = response.data;
					getGames();
				},
				function(response){
					$scope.mainScope.sportData = null;
					if (response.status === 404) {
						$scope.mainScope.messageSet("Chosen sport not supported.",true);
					}
				}
			);
			var getGames = function () {
				var apiUrl = "./app/api/getGameData.php?gameId="+sport+id;
				$http({
					method: "GET",
					url: apiUrl,
					transformResponse: function(data, headersGetter) {
						try {
							var jsonObject = JSON.parse(data);
							return jsonObject;
						}
						catch (e) {
							console.error("Invalid data: "+e);
							return {error: "Invalid data"};
						}
					}
				})
				.then(function(response){
						if (response.data.error) {
							$scope.mainScope.messageSet(response.data.error,true)
						} else {
							if (!response.data.id) {
								response.data.id = sport+id;
							}
							$scope.mainScope.gameData = response.data;
							$scope.game = response.data;
							$scope.setCompareStat($scope.sport.pl[0]);
							$scope.mainScope.title = 
								response.data.a.short + ":" +
								response.data.aScore + " " +
								response.data.h.short + ":" +
								response.data.hScore;
							$scope.mainScope.messageReset();
						}
					},
					function(response){
						$scope.mainScope.gameData = null;
						$scope.mainScope.title = "";
						$scope.mainScope.messageSet("Error loading game, please try again.",true);
						///show error
					}
				);
			}
		}

		$scope.setCompareStat = function (statType) {
			$scope.compareStat = statType;
		}

		$scope.reduceData = function () {
			return ReduceData();
		}
	}]);
})();