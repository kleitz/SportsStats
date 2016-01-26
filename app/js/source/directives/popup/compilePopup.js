;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive("compilePopup",["$compile",function($compile) {
		return function(scope,element,attrs) {
			scope.$watch(
				function(scope) {
					return scope.$eval(attrs.compilePopup);
				},
				function (value) {
					if (value) {
						if (value.directive) {
							element.html("<"+value.directive+"></"+value.directive+">");
							$compile(element.contents())(scope);
						}
					}
				}
			);
		}
	}]);
})();