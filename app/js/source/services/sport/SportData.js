;(function(){
	"use strict"
	angular.module("ssServices")
		.factory("SportData",function(){
			var sportData = {}
			var sportDataObject = function () {
			}

			sportDataObject.setSport = function (sport) {
				sportData[sport.a] = sport;
			}
			sportDataObject.getSport = function (sportId) {
				return sportData[sportId];
			}

			sportDataObject.clearData = function () {
				sportData = {};
			}

			return sportDataObject;
		});
})();