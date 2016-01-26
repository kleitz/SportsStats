;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive('popupSchedule', function() {
		return {
			templateUrl: '/views/popupSchedule.html',
			controller: 'popupScheduleCtrl'
		};
	});
})();