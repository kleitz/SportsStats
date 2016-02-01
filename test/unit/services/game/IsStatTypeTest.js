'use strict';

describe('IsStatType', function() {
	var IsStatType,testData,ncbData;
	var statTypePlays = {
		"p":[
			{id:0,value:false}, //jump ball
			{id:1,value:true}, //made 2
			{id:4,value:false}, //missed 3
			{id:32,value:true}, //made FT
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:true}, //made 2
			{id:4,primary:true,value:false}, //missed 3
			{id:32,primary:true,value:true} //made FT
		],
		"sht":[
			{id:0,value:false}, //jump ball
			{id:1,value:true}, //made 2
			{id:4,value:true}, //missed 3
			{id:31,value:true}, //missed FT
			{id:32,value:true}, //made FT
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:true}, //made 2
			{id:4,primary:true,value:false}, //missed 3
			{id:31,primary:true,value:false}, //missed FT
			{id:32,primary:true,value:true} //made FT
		],
		"fg":[
			{id:0,value:false}, //jump ball
			{id:1,value:true}, //made 2
			{id:4,value:true}, //missed 3
			{id:32,value:false}, //made FT
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:true}, //made 2
			{id:4,primary:true,value:false}, //missed 3
			{id:32,primary:true,value:false} //made FT
		],
		"3s":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:4,value:true}, //missed 3
			{id:11,value:true}, //made 3 assist
			{id:32,value:false}, //made FT
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:4,primary:true,value:false}, //missed 3
			{id:11,primary:true,value:true}, //made 3 assist
			{id:32,primary:true,value:false} //made FT
		],
		"ft":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:4,value:false}, //missed 3
			{id:31,value:true}, //missed FT
			{id:32,value:true}, //made FT
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:4,primary:true,value:false}, //missed 3
			{id:31,primary:true,value:false}, //missed FT
			{id:32,primary:true,value:true} //made FT
		],
		"r":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:5,value:true}, //defensive rebound
			{id:14,value:true}, //offensive rebound
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:5,primary:true,value:true}, //defensive rebound
			{id:14,primary:true,value:false}, //offensive rebound
		],
		"a":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:11,value:true}, //made 3 assist
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:11,primary:true,value:true}, //made 3 assist
		],
		"b":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:13,value:true}, //block
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:13,primary:true,value:true}, //block
		],
		"tno":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:3,value:true}, //turnover
			{id:6,value:true}, //turnover - steal
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:3,primary:true,value:true}, //turnover
			{id:6,primary:true,value:true}, //turnover - steal
		],
		"s":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:6,value:false}, //turnover - steal
			{id:7,value:true}, //steal
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:3,primary:true,value:false}, //turnover
			{id:6,primary:true,value:false}, //turnover - steal
			{id:7,primary:true,value:true} //steal
		],
		"pf":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:2,value:true}, //floor foul
			{id:29,value:true}, //shooting foul
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:2,primary:true,value:false}, //floor foul
			{id:29,primary:true,value:true} //shooting foul
		],
		"to":[
			{id:0,value:false}, //jump ball
			{id:1,value:false}, //made 2
			{id:30,value:true}, //timeout
			{id:0,primary:true,value:false}, //jump ball
			{id:1,primary:true,value:false}, //made 2
			{id:30,primary:true,value:true} //timeout
		],
		//this really tests the data more than anything, so it's not worth much
		"top":[
			{id:0,value:true}, //jump ball
			{id:1,value:true}, //made 2
			{id:2,value:true}, //floor foul (new shot clock)
			{id:3,value:true}, //turnover
			{id:4,value:false}, //missed 3
			{id:5,value:true}, //defensive rebound
			{id:7,value:true}, //steal
			{id:14,value:true}, //offensive rebound
			{id:29,value:false}, //shooting foul (for purpose of shot clock stuff)
			{id:31,value:false}, //missed FT first (1/2)
			{id:32,value:true} //made FT second (2/2)
		]
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
					)+st+statTypePlays[st][playI].id
				)
				.toBe(statTypePlays[st][playI].value+st+statTypePlays[st][playI].id);
			}
		}
	});
});
