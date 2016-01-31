'use strict';

/* jasmine specs for controllers go here */
describe('scheduleCtrl', function() {

	beforeEach(function(){
		jasmine.addMatchers({
			toEqualData: function () {
				return {
					compare: function (actual, expected) {
						return {
							pass: angular.equals(actual, expected)
						};
					}
				};
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
