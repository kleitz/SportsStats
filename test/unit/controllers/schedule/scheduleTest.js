'use strict';

/* jasmine specs for controllers go here */
describe('scheduleCtrl', function() {

	beforeEach(function(){
		this.addMatchers({
			toEqualData: function(expected) {
				return angular.equals(this.actual, expected);
			}
		});
	});

	beforeEach(module('ssCtrls'));


	describe('scheduleCtrl', function(){
		var scope, ctrl, $httpBackend;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			scope.mainScope = {};
			ctrl = $controller('scheduleCtrl', {$scope: scope});
		}));

		it('should set the mainScope.popup', function (){
			expect(scope.openSchedule).toBeDefined();

			scope.openSchedule();

			expect(scope.mainScope.popup).toEqualData({
				id: "schedule",
				directive: "popup-schedule"
			});
		});
	});
});
