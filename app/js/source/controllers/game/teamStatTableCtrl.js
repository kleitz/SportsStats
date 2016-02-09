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
			var plays;
			if ($scope.sport) {
				$scope.aH.forEach(function(team,teamI){
					$scope.sport.pl.forEach(function(statType){
						plays = $scope.filterPlays($scope.game.plays,statType,team);
						$scope.teamStatsTable[team.s][statType.a] = {
							total: ReduceData(plays.total, 
								{statType: statType}
							)
						};
						if (statType.ns) {
							$scope.teamStatsTable[team.s][statType.a].primary = $scope.teamStatsTable[team.s][statType.a].total;
						} else {
							$scope.teamStatsTable[team.s][statType.a].primary = ReduceData(plays.primary, {statType: statType} );
						}
					});
				});
			}
		}
		
		$scope.$watch('game', $scope.setTeamStats);
	}]);
})();