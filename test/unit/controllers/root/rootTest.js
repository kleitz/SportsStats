'use strict';

/* jasmine specs for controllers go here */
describe('ssCtrl', function() {
	var scope, ctrl;

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

	beforeEach(inject(function($injector) {

		scope = $injector.get('$rootScope');

		var $controller = $injector.get('$controller');
		ctrl = $controller('ssCtrl', {$scope: scope});
	}));

	it('should run the mainScope.message object', function(){
		expect(scope.mainScope).toEqualData({});
		expect(scope.mainScope.messageSet).toBeDefined();
		expect(scope.mainScope.messageReset).toBeDefined();

		expect(scope.mainScope.message).toBe(undefined);
		expect(scope.mainScope.messageWarning).toBe(undefined);

		scope.mainScope.messageSet("message1", "a");

		expect(scope.mainScope.message).toBe("message1");
		expect(scope.mainScope.messageWarning).toBe(true);

		scope.mainScope.messageSet("message2");

		expect(scope.mainScope.message).toBe("message2");
		expect(scope.mainScope.messageWarning).toBe(false);

		scope.mainScope.messageReset();

		expect(scope.mainScope.message).toBe(null);
		expect(scope.mainScope.messageWarning).toBe(false);
	});
});
