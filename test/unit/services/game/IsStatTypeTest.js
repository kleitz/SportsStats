'use strict';

describe('IsStatType', function() {
	var IsStatType,testData,ncbData;
	var statTypePlays = {
		"p":[
			{id:0,value:false},
			{id:1,value:true},
			{id:4,value:false},
			{id:0,primary:true,value:false},
			{id:1,primary:true,value:true},
			{id:4,primary:true,value:false}
		],
		"sht":[],
		"fg":[],
		"3s":[],
		"ft":[],
		"r":[],
		"a":[],
		"b":[],
		"tno":[],
		"s":[],
		"pf":[],
		"to":[],
		"top":[]
	}

	beforeEach(module('ssServices'));

	beforeEach(inject(function($injector) {

		IsStatType = $injector.get('IsStatType');

		jasmine.getJSONFixtures().fixturesPath='base/data';

		testData = getJSONFixture('test/game/20160126-Xav-Prov.json'); 
		ncbData = getJSONFixture('ncb.json');
	}));

	it('should return the reduced data number ', function(){

		//test if service exists
		expect(IsStatType).toBeDefined();

		//test if no attribudes returneds false
		expect(IsStatType()).toBe(false);

		//test if an empty play and options returns false
		expect(IsStatType({},{})).toBe(false);

		//test from arrays of test plays
		for (var statTypesI = 0; statTypesI < ncbData.pl.length; statTypesI++) {
			var st = ncbData.pl[statTypesI].a.toLowerCase();
			for (var playI = 0; playI < statTypePlays[st].length; playI++) {
				expect(
					IsStatType(
						testData.plays[statTypePlays[st][playI].id],
						{
							statType: ncbData.pl[statTypesI],
							primary: statTypePlays[st][playI].primary
						}
					)
				)
				.toBe(statTypePlays[st][playI].value);
			}
		}
	});
});
