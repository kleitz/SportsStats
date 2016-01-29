;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("ssCtrl", ["$scope",function($scope){
		$scope.mainScope = {};
		$scope.mainScope.messageReset = function () {
			$scope.mainScope.message = null;
			$scope.mainScope.messageWarning = false;
		}
		$scope.mainScope.messageSet = function (message, warning) {
			$scope.mainScope.messageReset();
			$scope.mainScope.message = message.toString();
			$scope.mainScope.messageWarning = !!warning;
		}
	}]);
})();