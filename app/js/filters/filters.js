;(function(){
	"use strict";
	angular.module("ssFilters",[]);

	angular.module("ssFilters")
		.value("ssSiteName","Act Opener")
		.filter("ssTitleFilter",["ssSiteName",function(ssSiteName){
			return function(input) {
				if (input && input.length) {
					return input + " | " + ssSiteName;
				} else {
					return ssSiteName;
				}
			}
		}]);
})();