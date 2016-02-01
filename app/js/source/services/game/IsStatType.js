;(function(){
	angular.module("ssServices")
		.factory("IsStatType",function(){
			return function (play,options) {
				var tempVal = 0;

				if (typeof options === 'object' &&
					angular.isDefined(options.statType) &&
					typeof play === 'object') {
					var statT = options.statType, response, compRegExp;

					//data value is either in play ('p') or defined
					var dataValue = (statT.dv) ? statT.dv : 'p';

					//New possessions are defined by play.x
					if (statT.c === 'pos') {
						return !!play.x;
					} else {

						//initial search using regexp to test if play is the type we want
						compRegExp = new RegExp(statT.c,'i');
						response = compRegExp.test(play[dataValue][statT.mp]);
					}

					//If response is true so far AND ... 
					//If we're searching for 'primary' data value OR ..
					//If the type has no secondary ('ns') type, eg steals
					if (response && (options.primary || statT.ns)) {

						//This was originally for conversions for football I'd rather rework the data, but I'll leave this as a reminder
						/*if (nextPlay) {
							var nP = scope.game.plays[pId+1];
							response = primRegExp.test(nP[dv]);
						} else */

						//if position of the primary idicator is defiend
						if (angular.isDefined(statT.pp)) {

							//regexp for the primary data value, at its 'primary poisition' ('pp')
							var primRegExp = new RegExp(statT.p,"i");
							return primRegExp.test(play[dataValue][statT.pp]);

						} else {

							//return whether or not the key for the data value is defined. kind of an "all else, just say whether it exists"
							return (angular.isDefined(play[dataValue]));
						}
					} else {
						return response;
					}
				} else {
					return false;
				}
			}
		});
})();