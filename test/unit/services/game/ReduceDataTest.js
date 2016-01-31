'use strict';

describe('ReduceData', function() {
	var ReduceData,testData,ncbData;
	var ncbExpectedTotalResults = [
		143,
		164,
		129,
		55,
		35,
		80,
		19,
		6,
		34,
		15,
		38,
		7,
		2400
	];

	beforeEach(module('ssServices'));

	beforeEach(inject(function($injector) {

		ReduceData = $injector.get('ReduceData');

		jasmine.getJSONFixtures().fixturesPath='base/data';

		testData = getJSONFixture('test/game/20160126-Xav-Prov.json'); 
		ncbData = getJSONFixture('ncb.json');
	}));

	it('should grab the test data', function (){
		expect(testData).toBeDefined();
		expect(testData.plays).toBeDefined();
		expect(testData.plays.length).toBe(357);

		expect(ncbData).toBeDefined();
	});

	it('should return the reduced data number ', function(){

		//test if service exists
		expect(ReduceData).toBeDefined();

		//test if no attribudes returneds null
		expect(ReduceData()).toBeNull();

		//test if no plays returns 0
		expect(ReduceData([])).toBe(0);

		//test if reduce data without options returns number of plays
		expect(ReduceData(testData.plays)).toBe(357);

		//test if it can reduce ncb play types
		for (var statTypesI = 0; statTypesI < ncbData.pl.length; statTypesI++) {
			expect(
				ReduceData(testData.plays),
				ncbData.pl[statTypesI]
			)
			.toBe(ncbExpectedTotalResults[statTypesI]);
		}
	});
});
