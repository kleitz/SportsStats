;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("teamStatsTableCtrl",["$scope",function($scope){
		$scope.hover="";

		$scope.onOver = function(statType) {
			$scope.hover=statType;
		}

		$scope.onOff= function(statType) {
			if ($scope.hover == statType) {
				$scope.hover="";
			}
		}
	}]);
})();