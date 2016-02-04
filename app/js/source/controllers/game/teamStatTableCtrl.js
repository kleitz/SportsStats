;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("teamStatsTableCtrl",["$scope","ReduceData",function($scope,ReduceData){
		$scope.hover="";
		$scope.teamStatsTable = {};
		$scope.aH.forEach(function(team,teamI) {
			$scope.teamStatsTable[team.s] = {};
		});

		$scope.onOver = function(statType) {
			$scope.hover=statType;
		}

		$scope.onOff= function(statType) {
			if ($scope.hover == statType) {
				$scope.hover="";
			}
		}

		$scope.setTeamStats = function () {
			if ($scope.sport) {
				$scope.aH.forEach(function(team,teamI){
					$scope.sport.pl.forEach(function(statType){
						$scope.teamStatsTable[team.s][statType.a] = ReduceData($scope.filterPlays($scope.game.plays,statType,team), {statType: statType});
					});
				});
			}
		}
		
		$scope.$watch('game', $scope.setTeamStats);
	}]);
})();