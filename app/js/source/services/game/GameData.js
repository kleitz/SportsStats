;(function(){
	"use strict"
	angular.module("ssServices")
		.factory("GameData",function(){
			var gameData = {}
			var gameDataObject = function () {
			}

			gameDataObject.setGame = function (game) {
				gameData.game = game;
			}
			gameDataObject.getGame = function () {
				return gameData.game;
			}

			gameDataObject.clearData = function () {
				gameData = {};
			}

			return gameDataObject;
		});
})();