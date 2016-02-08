'use strict';

/* jasmine specs for controllers go here */
describe('gameController', function() {
	var iteration = 1, scope, ctrl, $httpBackend, $routeParams,
		testId = '400840300',
		testSport = 'NCB',
		testDataId = 'testId';
	var gameUrl = /^\.\/app\/api\/getGameData\.php\?gameId\=[a-z]+\d+$/i;
	var sportUrl = /^\.\/data\/[a-z]{3}\.json$/i;
	var sportData = {
		a:'NCB',
		pl: ['a']
	};
	var gameDataError = {error:"test error"};
	var gameData = {
		plays:[],
		a:{short:"T1"},
		aScore:21,
		h:{short:"T2"},
		hScore:22,
		boxScore:[],
		compare: {
			plays:{
				a: [],
				h: []
			},
			primary:{
				a: [],
				h: []
			},
			stat: sportData.pl[0]
		}
	}


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
	beforeEach(module('ssServices'));

	beforeEach(inject(function($injector) {

		scope = $injector.get('$rootScope');
		scope.mainScope = {
			messageReset: function (){
				scope.mainScope.message = "";
			},
			messageSet: function (message){
				scope.mainScope.message = message;
			},
			message: ""
		};

		if (iteration > 1) {
			$routeParams = $injector.get('$routeParams');

			if (iteration == 2) {
				$routeParams.id = testSport+testId;
			} else {
				$routeParams.id = testId;
				$routeParams.sport = testSport;
			}

			$httpBackend = $injector.get('$httpBackend');

			if (iteration == 2) {
				$httpBackend.when('GET', sportUrl)
					.respond(404,'');
			} else {
				$httpBackend.when('GET', sportUrl)
					.respond(sportData);
			}

			if (iteration == 3) {
				$httpBackend.when('GET', gameUrl)
					.respond(404,'');
			} else if (iteration == 4) {
				$httpBackend.when('GET', gameUrl)
					.respond(JSON.stringify(gameDataError));
			} else {
				if (iteration == 6) {
					gameData.id = testDataId;
				}
				$httpBackend.when('GET', gameUrl)
					.respond(JSON.stringify(gameData));
			}
		}

		var $controller = $injector.get('$controller');
		ctrl = $controller('gameController', {$scope: scope});

		//$httpBackend.flush();
	}));

	afterEach(function() {
		if (iteration > 1) {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
			$httpBackend.resetExpectations();
		}

		iteration++;
	});

	//11111111
	it('should return a scope with no data', function(){
		expect(scope.mainScope.message).toBe("");
		expect(scope.game).toBe(null);
		expect(scope.sport).toBe(null);
		expect(scope.mainScope.gameData).toBe(null);
		expect(scope.mainScope.sportData).toBe(null);
	});

	//22222222
	it('should return error for missing sport', function(){
		$httpBackend.flush();

		expect(scope.mainScope.message).toBe('Chosen sport not supported.');
		expect(scope.game).toBe(null);
		expect(scope.sport).toBe(null);
		expect(scope.mainScope.gameData).toBe(null);
		expect(scope.mainScope.sportData).toBe(null);
	});

	//33333333
	it('should return sport and 404 error for game data', function(){
		$httpBackend.flush();

		expect(scope.mainScope.message).toBe("Error loading game, please try again.");
		expect(scope.game).toBe(null);
		expect(scope.sport).toEqualData(sportData);
		expect(scope.mainScope.gameData).toBe(null);
		expect(scope.mainScope.sportData).toEqualData(sportData);
	});

	//44444444
	it('should return sport and return game data error', function(){
		$httpBackend.flush();

		expect(scope.mainScope.message).toBe(gameDataError.error);
		expect(scope.game).toBe(null);
		expect(scope.mainScope.gameData).toBe(null);
	});

	//55555555
	it('should return sport and return game data and create id', function(){
		$httpBackend.flush();

		expect(scope.mainScope.message).toBe('');
		gameData.id = testId;
		gameData.sport = sportData;
		expect(scope.game).toEqualData(gameData);
		expect(scope.mainScope.gameData).toEqualData(gameData);
	});

	//66666666
	it('should return sport and return game data', function(){
		$httpBackend.flush();

		gameData.id = testDataId;
		gameData.sport = sportData;
		expect(scope.game).toEqualData(gameData);
		expect(scope.mainScope.gameData).toEqualData(gameData);
	});
});
