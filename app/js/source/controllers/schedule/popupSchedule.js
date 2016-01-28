;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("popupScheduleCtrl",["$scope","$http",function($scope,$http){
		$scope.sport = "ncb";
		
		$scope.gamesReset = function() {
			$scope.games = [];
		}
		$scope.gamesReset();

		$scope.outputDate = function () {
			var year,month,day;
			year = $scope.date.getFullYear();
			month = $scope.date.getMonth()+1;
			month = (month<10) ? "0"+month : month;
			day = $scope.date.getDate();
			day = (day<10) ? "0"+day : day;
			return (""+year+month+day);
		}

		$scope.getSchedule = function () {
			$scope.gamesReset();
			$http({
				method: "GET",
				url: "./app/api/getGamesBySchedule.php?sport=" + $scope.sport + "&date=" + $scope.outputDate()
			})
			.then(function(response){
					if (response.data.error) {
						$scope.error = response.data.error;
						$scope.gamesReset();
					} else {
						$scope.error = "";
						if (response.data.date == $scope.outputDate()) {
							$scope.games = response.data.games;
						}
					}
				},
				function(response){
					$scope.gamesReset();
					if (response.status === 404) {
						$scope.error = "Could not connect.";
					}
				}
			);
		};

		$scope.$watchGroup(["date","sport"],$scope.getSchedule);
		$scope.date = new Date();
	}]);
})();