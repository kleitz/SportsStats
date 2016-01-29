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
	});
})();