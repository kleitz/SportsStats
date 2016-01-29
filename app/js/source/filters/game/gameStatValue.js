;(function(){
	"use strict";

	angular.module("ssFilters")
		.filter("gameStatValue",function(){
			return function(plays, properties) {
				return "aye";
			}
		});
})();