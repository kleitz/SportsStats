;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive("ssSvgTeamStat", ["AwayHome", "GraphTime", function(aH,GraphTime) {
		var directive = {};
		directive.restrict = 'AE';
		
		directive.scope = {
			values: '=?',
			statType: '=?',
			game: '=?'
		};

		directive.link = function(scope, elements, attr) {

			scope.initiate = function () {
				var options = scope.getOptions();
				scope.svg = d3.select(elements[0])
				.append("svg");

				scope.g = scope.svg.append("g");

				scope.setSize();
			}

			scope.getOptions = function () {
				var options = {
					height : 36,
					x : 0,
					y : [4,22],
					barWidth : 10,
					secondaryBorder : 2,
					startLength : 10,
					maxRound : 10
				}
				var containerWidth = 750;
				options.width = Math.floor((containerWidth-2)/4-30);
				return options;
			}

			scope.setSize = function () {
				var options = scope.getOptions();
				//no translation of 'g' 
				//and no margins to add to width and height
				scope.svg.attr('viewBox','0 0 ' + options.width + ' ' + options.height)
				.attr("width", options.width)
				.attr("height", options.height);
				//.attr('preserveAspectRatio','xMinYMin');

				scope.redraw();
			}

			scope.redraw = function () {
				if (angular.isDefined(scope.values.a.P)) {
					var vals = {}, xMax, x, options, primary,secondary,pos;
					pos = function (a) {
						return (a < 0) ? 0 : a;
					}

					options = scope.getOptions();

					aH.forEach(function(team,teamI) {
						vals[team.s] = scope.values[team.s][scope.statType.a];
					});

					xMax = d3.max([
						vals.a.total,
						vals.h.total
					]);
					xMax = Math.ceil(xMax/options.maxRound)*options.maxRound;

					x = d3.scale.linear()
					.domain([0,xMax])
					.range([ 0, options.width ]);

					//set primary
					primary = scope.g.selectAll("rect.primary")
					.data(aH);

					//enter primary
					primary.enter()
					.append("rect")
					.attr("class","primary")
					.attr("y", function(team,teamI){
						return options.y[teamI];
					})
					.attr("x",options.x)
					.attr("height",options.barWidth)
					.attr("width",0);

					//display primary
					primary
					.attr("fill",function(team,teamI){
						return '#'+scope.game[team.s].primary;
					})
					.transition()
					.duration(GraphTime)
					.attr("width",function(team,teamI){
						return x(scope.values[team.s][scope.statType.a].total);
					});

					//set secondary
					secondary = scope.g.selectAll("rect.secondary")
					.data(aH);

					//enter secondary
					secondary.enter()
					.append("rect")
					.attr("class","secondary")
					.attr("y", function(team,teamI){
						return options.y[teamI]+options.secondaryBorder;
					})
					.attr("x",options.x)
					.attr("height",options.barWidth-2*options.secondaryBorder);

					//transition secondary
					secondary
					.attr("fill",function(team,teamI){
						return '#'+scope.game[team.s].secondary;
					})
					.transition()
					.duration(GraphTime)
					.attr("x",function(team,teamI){
						return x(vals[team.s].primary);
					})
					.attr("width",function(team,teamI){
						return pos(
							x(
								vals[team.s].total 
								- vals[team.s].primary
							)-options.secondaryBorder
						);
					});
				}
			}

			scope.initiate();
			scope.$watch('values', scope.redraw,true);
		}

		return directive;
	}])
})();