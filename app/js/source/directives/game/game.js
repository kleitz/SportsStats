;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive('boxScore', function() {
		return {
			templateUrl: '/views/game/boxScore.html'
		};
	})
	.directive('teamStatsTable', function() {
		return {
			templateUrl: '/views/game/teamStatsTable.html',
			controller: 'teamStatsTableCtrl'
		};
	})
	.directive('teamStatsGraph', function() {
		return {
			templateUrl: '/views/game/teamStatsGraph.html',
			controller: 'teamStatsGraphCtrl'
		};
	});
})();