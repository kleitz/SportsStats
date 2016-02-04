;(function(){
	"use strict"
	angular.module("ssServices")
		.factory("ReduceData",["IsStatType", "GameData", "SportData", "GetPlayTime", "GetNextPossession", function(IsStatType, GameData, SportData, GetPlayTime, GetNextPossession){

			//this function is for time of possession only
			var reduceTime = function (plays, options) {
				var tempVal = 0;
				var game = GameData.getGame();
				var sport = SportData.getSport(game.sport);

				var bisectTime = d3.bisector(function(p) {
					//Time counts down, bisector requires data scale positively
					return game.totTime - p.t;
				})

				//this was a previous play direction value
				//It doesn't make sense to me now, so I may want to fix it
				//True is forward. Basketball is false. Football is true.
				//todo
				var playDir = !SportData.pd;
				var teamS = plays[0].s;

				//beginning of the split (eg 2100)
				var startTime = game.totTime - options.splitIndex * sport.s;
				//end  of the split (eg 1800)
				var finTime = game.totTime - (options.splitIndex+1) * sport.s;

				//for my time histogram "split graph"
				//this adds partial plays so each split equals 300s 
				//or whatever the split is
				if (angular.isDefined(options.splitIndex)) {

					//get last play in the previous split
					var pId = bisectTime.right(game.plays, game.totTime-startTime);

					var play = game.plays[pId];

					//Find the nearest new possetion to the split point
					//for example a new posession (.x=1) at 2111 and 2087,
					//	when the split point is 2100
					var prevPos = GetNextPossession(play,true);
					//if the bisected play is new, keep that as the next play
					var nextPos = (play.x)? play: GetNextPossession(play,false);

					//if the earlier of the two possessions (ie the one outside
					//	the split) is the correct team, we need to add *part*
					//	of it to the total
					//and it's not the first split (ie beginning of the game)
					//	this is because there'd be no overlap then
					if (prevPos.s == teamS &&
							startTime != game.totTime) {
						//the time of the first possession of the split for
						// either team
						var insideTime = (nextPos.t>finTime)?nextPos.t:finTime;
						
						//add difference of the two times
						tempVal += Math.abs(startTime-insideTime);
					}
				}
				//cycle plays, adding time
				plays.forEach(function(play,playI) {
					//if working with the split time graph
					if (angular.isDefined(options.splitIndex)) {
						//if play is the last play of the array AND
						//	it follows into the next possession (ie the
						//	the next pos by anyone is in the next split)
						if (playI === plays.length-1 && 
								(GetNextPossession(play, false).t < finTime)) {
							//add the time UP TO the end of the split
							tempVal += play.t-finTime;
						} else {
							//add play time
							tempVal += GetPlayTime(play);
						}
					} else if (options.posCount){
						//sometimes I need to get just the number of
						//	possessions, such as the shot clock histogram
						tempVal++;
					} else {
						//add play time
						tempVal += GetPlayTime(play);
					}
				});
				return tempVal;
			}


			return function (plays,options) {
				var tempVal = 0, reducedValue;

				if (Array.isArray(plays)) {
					if (typeof options !== 'object' ||
						angular.isUndefined(options.statType)) {
						reducedValue = plays.length;
					} else {
						var st = options.statType;

						// If primary is specified, filter set
						if (options.primary) {
							plays = plays.filter(function(d,i){
								return IsStatType(d,{statType:options.statType,primary:true});
							});
						}

						if (st.c === 'pos' && !options.posCount) {
							reducedValue = reduceTime(plays,options);
						} else {
							plays.forEach(function(play,i){
								var dv = st.dv? st.dv : 'p';

								///if summing the data points, eg score
								if (st.sum) {
									//if string position of value to sum is defined
									if(angular.isDefined(st.mp)){
										tempVal += +play[dv][st.mp];
									} else {
										tempVal += +play[dv];
									}
								} else {
									tempVal = plays.length;
								}
							});
							reducedValue = tempVal;
						}

						//callback
						if (angular.isFunction(options.callback)) {
							return options.callback(reducedValue);
						}
					}
					return reducedValue;
				}
				return null;
			}



		}]);
})();