'use strict';

/* jasmine specs for controllers go here */
describe('popupScheduleCtrl', function() {
	var scope, ctrl, $httpBackend, $httpBackend2,
		gamesObj = {
			date: "20160131",
			games: [{"id":"ncb400840321","home":"St John's","away":"Villanova","status":"u","date":"2016-01-31 17:00:00"}]
		},
		gamesObj2 = {error:"hey"};

	beforeEach(function(){
		this.addMatchers({
			toEqualData: function(expected) {
				return angular.equals(this.actual, expected);
			},
			toNotEqualData: function(expected) {
				return !(angular.equals(this.actual, expected));
			}
		});
	});

	beforeEach(module('ssCtrls'));

	beforeEach(inject(function($injector) {

		scope = $injector.get('$rootScope');
		scope.date = new Date(2016,0,31);

		var $controller = $injector.get('$controller');
		ctrl = $controller('popupScheduleCtrl', {$scope: scope});

		$httpBackend = $injector.get('$httpBackend');

		$httpBackend.when('GET', './app/api/getGamesBySchedule.php?sport=ncb&date=20160130')
			.respond(gamesObj2);

		$httpBackend.when('GET', /^\.\/app\/api\/getGamesBySchedule\.php\?sport\=ncb\&date\=\d+/)
			.respond(gamesObj);

		$httpBackend.flush();
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
		$httpBackend.resetExpectations();
	});

	//overkill
	/*it('should reset the games to an empty array', function (){
		expect(scope.gamesReset).toBeDefined();
		expect(scope.games).toEqualData([]);
		scope.games = [{}];
		expect(scope.games).toNotEqualData([]);
		scope.gamesReset();
		expect(scope.games).toEqualData([]);
	});*/

	it('should output the date as a string', function(){
		scope.date = new Date(2016,0,31);

		expect(scope.outputDate()).toBe("20160131");

		$httpBackend.flush();
	});

	it('should retrieve the schedule or error', function () {
		expect(scope.sport).toBe('ncb');
		scope.date = new Date(2016,0,31);
		expect(scope.games).toEqualData([]);

		$httpBackend.flush();

		expect(scope.games).toEqualData(gamesObj.games);


		expect(scope.sport).toBe('ncb');
		scope.date = new Date(2016,0,30);

		$httpBackend.flush();

		expect(scope.games).toEqualData([]);
		expect(scope.error).toEqualData(gamesObj2.error);
	})
});
