'use strict';

describe('ReduceData', function() {
	var ReduceData,IsStatType,testData,ncbData,GameData;
	var ncbExpectedTotalResults = {
		"P" : 143,
		"SHT" : 164,
		"FG" : 129,
		"3s" : 55,
		"FT" : 35,
		"R" : 80,
		"A" : 29,
		"B" : 6,
		"TNO" : 34,
		"S" : 15,
		"PF" : 38,
		"TO" : 15,
		"TOP" : 2400
	};
	var ncbExpectedPrimaryResults = {
		"P" : 143,
		"SHT" : 77,
		"FG" : 52,
		"3s" : 14,
		"FT" : 25,
		"R" : 49,
		"A" : 29,
		"B" : 6,
		"TNO" : 34,
		"S" : 15,
		"PF" : 19,
		"TO" : 15,
		"TOP" : 2400
	};

	beforeEach(module('ssServices'));

	beforeEach(inject(function($injector) {

		ReduceData = $injector.get('ReduceData');
		IsStatType = $injector.get('IsStatType');
		GameData = $injector.get('GameData');

		jasmine.getJSONFixtures().fixturesPath='base/data';

		testData = getJSONFixture('test/game/20160126-Xav-Prov.json'); 
		GameData.setGame(testData);
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
			var st = ncbData.pl[statTypesI];
			var object = {statType: st};
			if (st.a === 'TOP') {
				object.game = testData;
				object.sport = ncbData;
			}
			expect(
				ReduceData(
					testData.plays.filter(function (d,i) {
						return IsStatType(d,{statType:st});
					}),
					object
				)+' '+st.l
			)
			.toBe(ncbExpectedTotalResults[st.a]+' '+st.l);
		}

		//test if it can reduce ncb PRIMARY play types
		for (var statTypesI = 0; statTypesI < ncbData.pl.length; statTypesI++) {
			var st = ncbData.pl[statTypesI];
			var closingString = ' '+st.l+' primary';
			var object = {statType: st,primary:true};
			if (st.a === 'TOP') {
				object.game = testData;
				object.sport = ncbData;
			}
			expect(
				ReduceData(
					testData.plays.filter(function (d,i) {
						return IsStatType(d,{statType:st});
					}), object
					
				)+closingString
			)
			.toBe(ncbExpectedPrimaryResults[st.a]+closingString);
		}
	});
});
