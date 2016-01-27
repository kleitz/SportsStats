;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive("compilePopup",["$compile","$sanitize",function($compile,$sanitize) {
		return function(scope,element,attrs) {
			scope.$watch(
				function(scope) {
					return scope.$eval(attrs.compilePopup);
				},
				function (value) {
					if (value) {
						var regex = /^[a-z0-9-]+$/i;
						if (value.directive && regex.test(value.directive)) {
							var directive = "<"+value.directive+"></"+value.directive+">";
							element.html(directive);
							$compile(element.contents())(scope);
							
							value.displayed = true;
						}
					}
				}
			);
		}
	}]);
})();