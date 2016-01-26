;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("scheduleCtrl",["$scope",function($scope){
		$scope.openSchedule = function() {
			$scope.mainScope.popup = {
				id: "schedule",
				directive: "popup-schedule"
			};
		}
	}]);
})();