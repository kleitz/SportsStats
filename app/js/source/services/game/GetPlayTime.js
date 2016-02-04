;(function(){
	"use strict"
	angular.module("ssServices")
	.factory("GetPlayTime",["GetNextPossession","GameData",function(GetNextPossession,GameData){
		return function (play,backwards) {
			var play2 = GetNextPossession(play,backwards);
			var direction = (backwards)?-1:1;
			if (play2 === GameData.getGame().plays[play.id]) {
				return 0;
			} else {
				return ((GameData.getGame().plays[play.id].t - play2.t)*direction);
			}
		}
	}]);
})();