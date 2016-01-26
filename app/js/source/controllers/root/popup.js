;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("popupCtrl", ["$scope","$sce",function($scope,$sce){
		$scope.close = function(){
			$scope.mainScope.popup = null;
		}
	}]);
})();