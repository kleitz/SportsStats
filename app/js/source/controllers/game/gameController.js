;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("gameController",["$scope","$routeParams","$http","ReduceData", "IsStatType","GameData","SportData",function($scope,$routeParams,$http,ReduceData,IsStatType,GameData,SportData){
		var sport,id;
		$scope.mainScope.sportData = null;
		$scope.mainScope.gameData = null;
		$scope.game = null;
		$scope.sport = null;
		var compare = {plays:{}};
		$scope.aH = [{s:"a",l:"away"},{s:"h",l:"home"}];

		//setup
		if (!$routeParams.id) {
			$scope.mainScope.title = "";
		} else {

			//determine variables from the route
			if (!$routeParams.sport && $routeParams.id) {
				sport = $routeParams.id.substring(0,3);
				id = $routeParams.id.substring(3,$routeParams.id.length);
			} else {
				sport = $routeParams.sport;
				id = $routeParams.id;
			}

			//set loading message
			$scope.mainScope.messageSet("Loading . . .");

			//Check if sport is already loaded
			//this should be moved to a provider
			if (angular.isDefined(SportData.getSport(sport)))  {
				setSport(SportData.getSport(sport));
			} else {
				$http({
					method: "GET",
					url: "./data/"+sport+".json"
				})
				.then(function(response){
						setSport(response.data, true);
					},
					function(response){
						$scope.mainScope.sportData = null;
						if (response.status === 404) {
							$scope.mainScope.messageSet("Chosen sport not supported.",true);
						}
					}
				);
			}
		}

		$scope.setCompareStat = function (statType) {
			$scope.game.compare.stat = statType;
			$scope.aH.forEach(function(team,teamI){
				$scope.game.compare.plays[team.s] = $scope.filterPlays($scope.game.plays, statType, team);
			});
		}

		$scope.filterPlays = function (plays, statType, team) {
			//Returns object {total:[],primary:[]}
			//which contains a filtered array of plays

			var teamI, teamS, returnedObj = {};
			if (!(plays && statType && team)) {
				return [];
			}
			returnedObj.total = plays.filter(function(d,i){
				teamS = team;
				if ($scope.game.compare.stat.dpp) {
					for(teamI=0;teamI<$scope.aH.length;teamI++) {
						if ($scope.aH[teamI] !== team) {
							teamS = $scope.aH[teamI];
							break;
						}
					};
				}
				return IsStatType(d,{statType: statType, team: teamS});
			})
			if (statType.ns) {
				returnedObj.primary = returnedObj.total;
			} else {
				returnedObj.primary = plays.filter(function(d,i){
					teamS = team;
					if ($scope.game.compare.stat.dpp) {
						for(teamI=0;teamI<$scope.aH.length;teamI++) {
							if ($scope.aH[teamI] !== team) {
								teamS = $scope.aH[teamI];
								break;
							}
						};
					}
					return IsStatType(d,{statType: statType, team: teamS, primary: true});
				})
			}
			return returnedObj;
		}

		$scope.reduceData = function (plays,options) {
			return ReduceData(plays,options);
		}
		
		//for setting sport to scope and SportData
		var setSport = function (sport, isNew) {
			$scope.mainScope.sportData = sport;
			$scope.sport = sport;
			getGames();
			if (isNew) {
				SportData.setSport(sport);
			}
		}
		

		//retrieving game data and setting some variables
		//this should be moved to a provider
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
							response.data.id = id;
							response.data.sport = SportData.getSport(sport.toUpperCase());
						}
						$scope.mainScope.gameData = response.data;
						$scope.game = response.data;
						GameData.setGame($scope.game);
						$scope.game.compare = compare;
						$scope.setCompareStat($scope.sport.pl[0]);
						$scope.mainScope.title = 
							response.data.a.short + ":" +
							response.data.aScore + " " +
							response.data.h.short + ":" +
							response.data.hScore;
						$scope.mainScope.messageReset();
						getBoxScoreOt();
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

		var getBoxScoreOt = function () {
			if ($scope.game.boxScore.length > 6) {
				$scope.game.boxScoreOT = {};
				$scope.aH.forEach(function(team){
					$scope.game.boxScoreOT[team.s] = $scope.game.boxScore.reduce(function(prevVal, period) {
						if (period.ot) 
							return prevVal + period[team.s];
						return prevVal;
					},0)
				})
			}
		}
	}]);
})();