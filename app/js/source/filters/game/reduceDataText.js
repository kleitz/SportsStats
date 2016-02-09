;(function(){
	"use strict"
	angular.module("ssFilters")
	.filter("reduceDataText", function () {
		return function (values, statType) {
			var total,primary,
				string = '';
			if (angular.isDefined(values) &&
				angular.isDefined(values.total)) {
				if (angular.isDefined(values.primary)) {
					string += values.primary;
					if (angular.isDefined(statType) && 
							!statType.ns) {
						if (statType.add) {
							string += '/'+values.total;
						} else {
							string += '-'+(values.total-values.primary);
						}
					}
					return string;
				}
				else return string+values.total;
			}
			return '---';
		}
	})
})();