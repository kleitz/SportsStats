;(function(){
	"use strict";

	angular.module("ssFilters")
		.filter("printedTime",function(){
			return function(input, scope) {
				var secondsToTime = function (totSeconds) {
					var seconds = totSeconds%60;
					var minutes = (totSeconds-seconds)/60;
					seconds = (seconds < 10) ? "0"+seconds : seconds;
					return minutes + ":" + seconds;
				}

				if (scope) {
					if (scope.game && scope.sport) {
						if (scope.game.totTime && scope.sport.q && scope.game.boxScore) {
							var totPeriods = scope.game.boxScore.length,
								n = scope.sport.q.n,
								time;
							input = +input;

							while (totPeriods > n && input >= scope.sport.q.o) {
								totPeriods--;
								input -= scope.sport.q.o;
							}
							while (totPeriods > 1 && input >= scope.sport.q.t) {
								totPeriods--;
								input -= scope.sport.q.t;
							}

							if (input == 0) {
								if (totPeriods === scope.game.boxScore.length && scope.game.aScore != scope.game.hScore) {
									if (n >= totPeriods) {
										return "Final";
									} else {
										time = "Final";
									}
								}
								else if (totPeriods === n/2) {
									return "Half"
								} else {
									time = "End";
								}
							} else {
								time = secondsToTime(input);
							}
							return time + " " + scope.game.boxScore[totPeriods-1].l;
						}
					}
				}
				return secondsToTime(+input);
			}
		});
})();