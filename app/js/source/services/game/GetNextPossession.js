;(function(){
	"user strict";
	angular.module("ssServices")
		.factory("GetNextPossession",["GameData",function(GameData){
			return function (play,backward) {
				if((backward)?play.id>0:play.id<GameData.getGame().plays.length-1) {
					var direction = (backward)?-1:1;
					var id = play.id;
					for(id+=direction;!GameData.getGame().plays[id].x;id+=direction){}
					return GameData.getGame().plays[id];
				} else {
					return play;
				}
			}
		}]);
})();