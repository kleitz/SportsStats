;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("popupScheduleCtrl",["$scope","$http",function($scope,$http){
		$scope.sport = "ncb";
		
		$scope.gamesReset = function() {
			$scope.games = [];
		}
		$scope.gamesReset();

		var outputDate = function () {
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
				url: "./app/api/getGamesBySchedule.php?sport="+$scope.sport+"&date="+outputDate()
			})
			.then(function(response){
					$scope.games = response.data.games;
				},
				function(response){
					//$scope.mainScope.sportData = null;
					if (response.status === 404) {
						///show error
					}
				}
			);
		};

		$scope.$watchGroup(["date","sport"],$scope.getSchedule);
		$scope.date = new Date();
	}]);
})();