;(function(){
	"use strict";
	angular.module("ssApp",["ssServices","ssCtrls","ssDirectives","ssFilters","ngRoute","oldD3Script","ngSanitize"]);
})();
;(function(){
	"use strict";
	angular.module("ssCtrls",["ngRoute"]);
})();
;(function(){
	"use strict";
	angular.module("ssDirectives",[]);
})();
;(function(){
	"use strict";
	angular.module("ssFilters",[]);
})();
;(function(){
	"use strict";
	angular.module("ssServices",[]);
})();
;(function() {
"use strict";

angular.module("oldD3Script",[])
angular.module("oldD3Script").directive("ssD3Old",function(){
		var directive = {};
		directive.restrict = 'A';
		directive.scope = {
			game:"=ssD3Old",
			sport:"=ssD3OldSport"
		}
		directive.link = function(scope, elements, attr){
			///begin old code definitions

var games = {};
var sports = {};

			///end old code definitoins
			var regraph = function () {
				var gameBox = d3.select(elements[0])
					.select("div.gameBox");
				gameBox.text("");
				if (scope.game != null && scope.sport != null) {
					gameBox.attr("id",scope.game.id);
					dispGame();
				} else {
					gameBox.attr("id","");
				}
			}
			scope.$watch("game",regraph);
			scope.$watch("sport",regraph);

			///begin old code

var margin = {top: 20, right: 40, bottom: 30, left: 30, histTop: 30, histBottom: 8},
	loaderVars = {
		num : 3,
		width : 10,
		pad : 40},
	graphVars = {
		dispTime : 500,
		graphTime : 1000,
		replayTimes : [5,15,30],
		lineGraphHeight: 400 - margin.top - margin.bottom,
		lineGraphWidth: 800 - margin.right - margin.left,
		histGraphHeight: 98 - margin.histTop - margin.histBottom,
		histGraphWidth: 800 - margin.left - margin.right,
		teamStatWidth: 200,
		teamStatHeight: 18,
		showHideShape: {
			triangle:"M0,0L0,0L12,0L12,0L6,10Z",
			dash:"M0,7L0,3L12,3L12,7L6,7Z",
			plus:"M1,7L1,3L4,3L4,0L8,0L8,3L11,3L11,7L8,7L8,10L4,10L4,7Z",
			pDash: "M1,7L1,3L1,3L4,3L8,3L11,3L11,3L11,7L11,7L8,7L4,7L1,7Z"},
		sportMapping: {menscollegebasketball:"ncb"}},
	width = graphVars.lineGraphWidth,
	height = graphVars.lineGraphHeight,
	aH = [{s:"a",l:"away"},{s:"h",l:"home"}];
var nameSuffixes = ['sr','jr','ii','iii','iv','v','vi','vii'];
graphVars.stat10Pad = 5;
graphVars.stat10Width = (graphVars.lineGraphWidth)/20 - graphVars.stat10Pad;

d3.select("#showGames")
	.on("click",function(){
		console.log(games);
	});

(function(){
	var sDC = d3.select(".showDispCont");
	if (sDC[0][0] != null) {
		sDC.forEach(function(d,i){
			var parentId = d[0].parentNode.id;
			var id = d[0].id.replace(parentId,"");
			var labelTitle = d3.select(d[0]).attr("labelTitle");
			createShowDisp(parentId,id,labelTitle,true);
		});
	}
	
	//d3.select("div#popup")
	//	.on("click",closePopup);
	
	Date.prototype.yyyymmdd = function() {
		var yyyy = this.getFullYear().toString();
		var mm = (this.getMonth()+1).toString(); 
		var dd  = (this.getDate()+1).toString();
		return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]);
	};
	Date.prototype.todayLocal = (function() {
		var local = new Date(this);
		local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
		return local;
	});
})();

function minToTime(t) {
	return Math.trunc(t/60)
		+":"
		+(
			'00'
			+Math.trunc(t%60)
		).slice(-2);
}

function oppAH(team, skip) {
	if (skip) {
		return team;
	}
	if (typeof team == 'object') {
		return (team == aH[0])?aH[1]:aH[0];
	} else {
		return (team == aH[0].s)?aH[1].s:aH[0].s;
	}
}
function isDef(v) {
	return (typeof v !== 'undefined');
}
/*d3.select(window).on("hashchange",function(){
	if (d3.select("div.gameBox").attr("id")) {
		d3.selectAll("."+d3.select("div.gameBox").attr("id")).remove();
	}
	d3.select("div.gameBox").
		attr("id",location.hash.substring(1));
	loadGames();
});*/
//loadGames();

function loadGames(){
	d3.selectAll("div.gameBox.notLoaded")
		.forEach(function(d){
			insertGameInput(d[0]);
			if (d[0].id.length != 0)
				loadSport(d[0].id);
			else {
				if (location.hash.length) {
					d[0].id = location.hash.substring(2);
					loadSport(d[0].id);
				}
			}
		});
}
function insertGameInput(div) {
	if (d3.select(div).select("div.gameInputCont")[0][0]==null) {
		var gameInputBox = d3.select(div)
			.append("div")
			.classed("gameInputCont",true);
		var gameInput = gameInputBox.append("input")
			.attr("type","text")
			.attr("placeholder","Input ESPN box score URL (play-by-play required for compatibility)")
			.classed("gameInput",true);
		gameInput[0][0]
			.addEventListener("keydown", function(e){
				if (gameInput.attr("disabled") == "disabled") {
					return;
				}
				if (e.keyCode == 13) {
					var inputThis = this;
					inputGame(inputThis.value,
						function(){
							inputThis.value = "";
						},
						function(){
							inputThis.value = "Please try again";
					});
				}
			});
		function inputGame(input,callback,errorCallback) {
			var id,sport;
			if (input.match(/^\/([a-z]{3})(\d+)$/)) {
				id = input.substring(3);
				sport = input.substring(0,3);
			} else if (input.match(/\/[a-zA-Z-]+\/.*\?.*gameId=\d+/)) {
				id = getReq("gameId","?"+input.split('?')[1]);
				sport = input.match(/\/[a-zA-Z-]+\//)[0];
				sport = sport.substring(1,sport.length-1);
				sport = sport.replace(/-/g,'');
				if (isDef(graphVars.sportMapping[sport])) {
					sport = graphVars.sportMapping[sport];
				}
			} else {
				if (errorCallback) {
					errorCallback();
				}
				return;
			}
			if (isDef(id) && isNormalInteger(id)) {
				if (div.id.length > 0)
					d3.selectAll("."+div.id).remove();
				d3.select(div)
					.attr("id",sport + id);
				gameInput.attr("disabled","disabled");
				location.hash = "#/"+sport+id;
				if (callback) {
					callback();
				}
				//loadGames();
			} else {
				if (errorCallback) {
					errorCallback();
				}
			}
		}
		var browseSchedule = gameInputBox.append("input")
			.attr("type","button")
			.attr("value","Browse Schedule")
			.classed("browseButton",true)
			.classed("hover",true)
			.on("click",function(e) {
				event.preventDefault();
				var browseCont = openPopup()
					.append("div")
					.classed("browseCont",true);
				var buttonsDiv = browseCont
					.append("div")
					.classed("popupButtons",true);
				var searchDiv = buttonsDiv.append("div")
					.classed("left",true)
					.on('click', function(){
						d3.event.stopPropagation();
					});
				var schedIn = searchDiv.append("input")
					.attr("type","date")
					.on("change",searchSched);
				schedIn[0][0]
					.valueAsDate = new Date().todayLocal();
				var schedSelect = searchDiv.append("select")
					.on("change",searchSched);
				schedSelect.append("option")
					.attr("value","ncb")
					.text("NCAAM");
				schedSelect.append("option")
					.attr("value","nba")
					.text("NBA");
				buttonsDiv.append("input")
					.attr("type","button")
					.attr("value","Close")
					.classed("right",true);
				var sched = browseCont.append("div")
					.classed("browseSchedule",true)
					.on('click', function(){
						d3.event.stopPropagation();
					});
				var schedTop = sched.append("div");
				var filterData=[];
				schedTop.append("input")
					.attr("type","text")
					.attr("placeholder","Filter")
					.on("keyup",function(){
						var filterVal = this.value;
						if (filterVal.length > 0) {
							var filterWords = filterVal.match(/\b[a-z]+\b/gi);
							var filterRegEx = new RegExp("^(?=.*\\b" + filterWords.join("\\b)(?=.*\\b")+"\\w*\\b).*$","i");
						}
						filterSched([]);
						filterSched(
							filterData.filter(function(d){
								if (filterVal.length<1) {
									return true;
								} else {
									var dStr = d.away+" vs "+d.home;
									return dStr.match(filterRegEx);
									return false;
								}
							})
						);
					});
				var schedBox = sched.append("div");
				function searchSched() {
					schedBox.html("<div>Loading...</div>");
					d3.json("./app/api/getGamesBySchedule.php?sport="
							+schedSelect[0][0].value
							+"&date="
							+schedIn[0][0].valueAsDate.yyyymmdd(),
						function(error,data){
							if (error) {
								console.error(error);
								schedBox.html("<div>There was an error. Please try again.</div>");
								return;
							}
							if (isDef(data.error)) {
								schedBox.html("<div>"+data.error+"</div>");
								return;
							}
							if (data.date == schedIn[0][0].valueAsDate.yyyymmdd()) {
								filterData = data.games;
								filterSched(data.games);
							}
						});
				}
				function filterSched(games) {
					function started(g) {
						return ((g.status=='f')||(g.status=='l'))
					}
					games.sort(function(a,b){
						var result;
						if (started(a) == started(b)) {
							result = (+a.id.substring(3) < +b.id.substring(3)) ?
								-1:1;
						} else {
							result = (started(a))?-1:1;
						}
						return result;
					});
					var schedItem = schedBox.selectAll("div")
						.data(games, function(d) { 
							return (isDef(d))?d.id:0;
						});
					schedItem.enter()
						.append("div")
						.classed("hover pointer bold",function(d){
							return started(d);
						})
						.text(function(d){
							return d.away+' vs. '+d.home;
						})
						.on("click",function(d){
							if (started(d)) {
								inputGame(d.id,
									closePopup,
									function(){
									schedTop.append("span")
										.style("color","red")
										.text("Error loading game.")
										.transition()
										.duration(graphVars.dispTime*4)
										.style("opacity",0)
										.each("end",function(){
											d3.select(this).remove();
										});
								})
							}
						});
					schedItem.exit()
						.remove();
				}
				searchSched();
			});;
	}
}
function openPopup(white) {
	var pop = d3.select("div#popup")
		.html("")
		.style("display","block")
		.classed("popbgk",!white)
		.classed("popbgw",white);
	pop.transition(graphVars.dispTime)
		.style("opacity",1);
	return pop;
}
function closePopup() {
	d3.select("div#popup")
		.transition(graphVars.dispTime)
		.style("opacity","0")
		.each("end",function(d){
			d3.select(this)
				.style("display","none");
		});
}
function getReq(name,string){
	var obj = (string)?string:location.search;
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(obj))
	  return decodeURIComponent(name[1]);
}
function isNormalInteger(str) {
    var n = ~~Number(str);
    return String(n) === str && n >= 0;
}
function hexToRgb(hex) {
	var pattern = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
	var result = pattern.exec(hex);
	if (result) {
		result = [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		];
		return result;
	}
	else return false;
}
function colorTest(gId) {
	var colors = {};
	aH.forEach(function (team,teamI) {
		colors[team.s] = hexToRgb(scope.game[team.s].primary);
		if (!colors[team.s]) {
			return;
		}
	});
	var difTot = 0;
	for (var rgbI=0; rgbI<colors[aH[0].s].length; rgbI++) {
		difTot += Math.abs(colors[aH[0].s][rgbI]-colors[aH[1].s][rgbI]);
	}
	if (difTot < 150) {
		var tempColor = scope.game['h'].secondary;
		var tempColorRgb = hexToRgb(tempColor);
		if (tempColorRgb) {
			if (tempColorRgb.reduce(function(a,b){return a+b;}) > 612) {
				tempColor = "CCCCCC";
			}
		}
		scope.game['h'].secondary = scope.game['h'].primary;
		scope.game['h'].primary = tempColor;
	}
}

//load data for that particular sport
function loadSport (gId) {
	addLoader(gId);
	if (isDef(scope.sport)) {
		loadGame(gId);
	} else {
		d3.json("./data/"+gId.substring(0,3)+".json",function(error,data) {
			if (error) {
				console.error(error);
				d3.select("input.gameInput")
					.attr("value","This sport is not supported");
				stopLoader(gId);
				return;
			}
			scope.sport = data;
			loadGame(gId);
		});
	}
}

function addLoader(gId) {
	var loaderSvg = d3.select("#"+gId)
		.attr("loading",1)
		.append("div")
		.classed("loadingCont "+gId,true)
		.append("svg")
		.attr("width",graphVars.histGraphWidth + margin.left + margin.right)
		.attr("height",graphVars.histGraphHeight)
		.attr("id","loadingSvg");
	var loaderContainer = loaderSvg.append("g")
		.attr("transform","translate(" + ((graphVars.histGraphWidth + margin.left + margin.right)/2) + "," + (graphVars.histGraphHeight/2) + ")");
	for(var rI = 0; rI<loaderVars.num; rI++){
		var rect = loaderContainer.append("g")
			.attr("transform","translate("+(-1*(loaderVars.width * loaderVars.num + loaderVars.pad * (loaderVars.num-1))/2+rI*(loaderVars.width+loaderVars.pad))+",0)")
			.append("rect")
			.classed("loadingRect",true)
			.attr("x",-loaderVars.width/2)
			.attr("y",-loaderVars.width/2)
			.attr("height",loaderVars.width)
			.attr("width",loaderVars.width)
			.style("fill","#AAAAAA");
	}
	loaderSvg.selectAll("rect.loadingRect")
		.transition()
		.duration(graphVars.dispTime)
		.delay(function(d,i) {return graphVars.dispTime/loaderVars.num/2*i})
		.each(dispLoading);
	function dispLoading() {
		var item = d3.select(this);
		(function repeat() {
			item = item.transition()
				.attr("y",-loaderVars.width*3/2)
				.attr("height",loaderVars.width*3)
				.transition()
				.attr("y",-loaderVars.width/2)
				.attr("height",loaderVars.width)
				.transition()
				.attrTween("transform",rotTween)
				.styleTween("fill",colorTween)
			if (d3.select("#"+gId).attr('loading') == 1) {
				item.each("end",repeat);
			}
		})();
	}
	function rotTween() {
		var i = d3.interpolate(0, 360);
		return function(t) {
			return "rotate(" + i(t) + ")";
		};
	}
	function colorTween() {
		var i = d3.interpolate(0, 360);
		return function(t) {
			var sat = (i(t)>180)?360-i(t):i(t);
			sat = sat / 180 * 80;
			return "hsl(" + (i(t)+120) + ","+sat+"%,67%)";
		};
	}
}

function stopLoader(gId) {
	d3.select("#"+gId)
		.attr("loading",0)
		.select("div.loadingCont."+gId)
		.remove();
}

//add statistic fields
function addTeamStats(gId) {
	d3.select("div#"+gId)
		.append("div")
		.classed("teamStats cf "+gId,true)
		.classed("showDispCont",true)
		.attr("id","teamStats"+gId);
	var teamStat = d3.select("div.teamStats." + gId)
		.selectAll("div.teamStat."+gId)
		.data(scope.sport.p)
		.enter()
		.append("div")
		.classed("teamStat " + gId, true)
		.attr("id",function(p) { return gId+"_"+p;})
		.on("click", function(p){return plotHist(gId,p);});
	var titleDiv = teamStat.append("div")
		.classed("tSLabel " + gId, true)
		.classed("tLeft", function(p,i) { return i%2==0; })
		.classed("left", function(p,i){ return i%2==1; })
		.classed("right", function(p,i){ return i%2==0; })
	titleDiv
		.append("div")
		.classed("tSLabelCont",true)
		.classed("left", function(p,i){ return i%2==1; })
		.classed("right", function(p,i){ return i%2==0; })
		.append("span")
		.classed("medTitle",true)
		.text(function(p) { return scope.sport.po[p].l+((p!="top")?"s":"")	; });
	titleDiv.select("div.tSLabelCont").append("br");
	titleDiv.select("div.tSLabelCont").append("span")
		.text(function(p,i){ if (scope.sport.po[p].pl && !scope.sport.po[p].fs) return scope.sport.po[p].pl + ((scope.sport.po[p].add)?" / ":" - ") + scope.sport.po[p].sl});
	var statSvg = teamStat.append("div")
		.classed("left", function(p,i){ return i%2==0; })
		.classed("right", function(p,i){ return i%2==1; })
		.append("svg")
		.classed("teamStatSVG " + gId,true)
		.attr("id",function(p) { return "svg_"+gId+"_"+p; })
		.append("g")
		.attr("transform",function(d,i){return (i%2==0)?"translate("+graphVars.teamStatWidth+",0) scale(-1,1)":"";});
	var dataNumsDiv = titleDiv.append("div")
		.classed("tSDataCont",true)
		.classed("left", function(p,i){ return i%2==0; })
		.classed("right", function(p,i){ return i%2==1; });
	
	aH.forEach(function(team,teamI) {
		dataNumsDiv
			.append("div")
			.classed("tsDataLabel "+team.l, true);
		
		//create stat bar
		statSvg.append("rect")
			.classed("statBar "+team.l,true)
			.attr("y",1+((1+graphVars.teamStatHeight)*teamI))
			.attr("height",graphVars.teamStatHeight)
			.attr("x",0)
			.attr("width",0)
			.style("fill","#"+scope.game[team.s].primary);
		//create sec stat bar
		statSvg.append("rect")
			.classed("statBarSec "+team.l,true)
			.attr("y",1+((1+graphVars.teamStatHeight)*teamI)+2)
			.attr("height",graphVars.teamStatHeight-4)
			.attr("x", -2)
			.attr("width", 0)
			.style("fill","#"+scope.game[team.s].secondary);
	});
	var teamStatTable = d3.select("div#"+gId)
		.append("div")
		.classed("teamStatsMin",true)
		.classed(gId,true)
		.classed("showDispCont",true)
		.attr("id","teamStatsMin"+gId)
		.append("table")
		.classed("playerStatsT",true);
	var tRow = teamStatTable
		.append("tr");
	tRow.append("td")
		.classed("thead",true)
		.text("Team");
	scope.sport.p.forEach(function(p){
		tRow.append("td")
			.classed("thead",true)
			.classed("teamStatMin",true)
			.classed("col"+p,true)
			.attr("title",scope.sport.po[p].l+"s")
			.text(scope.sport.po[p].a)
			.on("click", function(){return plotHist(gId,p);})
			.on("mouseover", function(){
				d3.select("#teamStatsMin"+gId)
					.selectAll(".col"+p)
					.classed("hov",true);
			})
			.on("mouseout", function(){
				d3.select("#teamStatsMin"+gId)
					.selectAll("td")
					.classed("hov",false);
			});
	});
	aH.forEach(function(team){
		tRow = teamStatTable
			.append("tr")
			.attr("id","teamStatsMinRow"+team.s+gId);
		tRow.append("td")
			.text(scope.game[team.s].teamName);
		scope.sport.p.forEach(function(p){
			tRow.append("td")
				.classed("teamStatMin",true)
				.classed("col"+p,true)
				.on("click", function(){return plotHist(gId,p);})
				.on("mouseover", function(){
					d3.select("#teamStatsMin"+gId)
						.selectAll(".col"+p)
						.classed("hov",true);
				})
				.on("mouseout", function(){
					d3.select("#teamStatsMin"+gId)
						.selectAll("td")
						.classed("hov",false);
				});
		});
	});
	
	//adding extra blank tile
	if (scope.sport.p.length%2 == 1) {
		d3.select("div.teamStats." + gId)
			.append("div")
			.classed("teamStatFill " + gId,true)
	}
	
	createShowDisp(gId,"teamStats","team stats",false,"teamStatsMin");
}

//graph static team stats
function graphTeamStats(gId) {
	var sPL = scope.sport.p;//sportsPlayList
	var sPO = scope.sport.po;
	sPL.forEach(function(p,pI){
		var teamStatData = {};
		//collect data for each play type
		aH.forEach(function(team){
			teamStatData[team.s] = scope.game.plays.filter(
				function(d){
					if(sPO[p].c=="pos") {
						return d.x && d.e == oppAH(team.s,!sPO[p].ot);
					} else {
						return isData(gId,d.id,p) && d.e == oppAH(team.s,!sPO[p].ot);
					}
				}
			);
			teamStatData[team.s+"PS"] = [];
			teamStatData[team.s+"val"] = [];
			teamStatData[team.s+"PS"].push(teamStatData[team.s].filter(
				function(d){ 
					return isData(gId, d.id, p, true);
				}
			));
			teamStatData[team.s+"PS"].push(teamStatData[team.s].filter(
				function(d){ 
					return isData(gId, d.id, p);
				}
			));
			teamStatData[team.s+"PS"].forEach(function(ps,psi){
				teamStatData[team.s+"val"][psi] = reduceData(gId, p, teamStatData[team.s+"PS"][psi], 0, team.s,"tot");
			});
			teamStatData[team.s+"valTot"] =  
				teamStatData[team.s+"val"][1];
		});
		teamStatData.max = Math.max(teamStatData[aH[0].s+"valTot"], teamStatData[aH[1].s+"valTot"]);
		if(teamStatData.max<1) {
			teamStatData.max = 1;
		} else {
			teamStatData.max = Math.ceil(teamStatData.max/5)*5;
		}
		
		aH.forEach(function(team,teamI){
			//change stats
			d3.select("#"+gId+"_"+p)
				.select("div.tSDataCont")
				.select("div.tsDataLabel."+team.l)
				.text(function(d,i){return reduceDataText(gId,p,teamStatData[team.s+"PS"][1],i,team.s,"tot",shortNum);});
			d3.select("#teamStatsMinRow"+team.s+gId)
				.select(".col"+p)
				.text(function(d,i){return reduceDataText(gId,p,teamStatData[team.s+"PS"][1],i,team.s,"tot",shortNum);});
			//change stat bar
			d3.select("#svg_"+gId+"_"+p)
				.select("g")
				.select(".statBar."+team.l)
				.transition().duration(graphVars.dispTime)
				.attr("x",0)
				.attr("width", teamStatData[team.s+"val"][1] / teamStatData.max * graphVars.teamStatWidth);
			//create secondary box
			d3.select("#svg_"+gId+"_"+p)
				.select("g")
				.select(".statBarSec."+team.l)
				.transition().duration(graphVars.dispTime)
				.attr("y",1+((1+graphVars.teamStatHeight)*teamI)+2)
				.attr("height",graphVars.teamStatHeight-4)
				.attr("x",function(d,i){ 
					return teamStatData[team.s+"val"][0]/ teamStatData.max * graphVars.teamStatWidth;
				})
				.attr("width", function(d,i){ 
					var rectWidth = (teamStatData[team.s+"val"][1]-teamStatData[team.s+"val"][0])/ teamStatData.max * graphVars.teamStatWidth - 2
					return (rectWidth > 0) ? rectWidth : 0;
				});
		});
	});
}

//raw or per pos
function rawOrPPNum(num,gId,teamS,args) {
	if (d3.select('input[name="pp'+gId+'"]:checked').node().value == "s") {
		var plays;
		if (!isDef(args)) {
			plays = scope.game["playsTot"+teamS];
		} else {
			if (args.dp) {
				for(var aHI = 0; aHI < aH.length; aHI++) {
					if (teamS != aH[aHI].s) {
						teamS = aH[aHI].s
						break;
					}
				}
			}
			if (args.type == "time") {
				plays = scope.game["plays"+teamS][args.index];
			} else if (args.type == "split") {
				plays = scope.game["playsSplit"+teamS][args.index];
			} else {
				plays = scope.game["playsTot"+teamS];
			}
		}
		var value = (plays>0)?num/plays:0;
		return value;
	} else {
		return num;
	}
}

function shortNum(value) {
	var precision = Math.floor(Math.log10(value))-1;
	if (precision >= 0 || precision == Infinity || value % 1 === 0) {
		return Math.floor(value);
	}
	if(precision<-2) {
		precision = -2;
	}
	return value.toFixed(precision*-1).replace(/(^0\.)/, '.');
}

//get time of pos
function getPlayTime(gId,pId,direction) {
	var play = getNextPos(gId,pId,direction);
	direction = (direction)?1:-1;
	if (play == scope.game.plays[pId]) {
		return 0;
	} else {
		return ((scope.game.plays[pId].t - play.t)*direction);
	}
}

function getNextPos(gId,pId,direction) {
	if((direction)?pId<scope.game.plays.length-1:pId>0) {
		direction = (direction)?1:-1;
		var id = pId;
		for(id+=direction;!scope.game.plays[id].x;id+=direction){}
		return scope.game.plays[id];
	} else {
		return scope.game.plays[pId];
	}
}

//load and set game data
function loadGame (gId) {
	if (!isDef(scope.game)) {
		d3.select("input.gameInput")
			.attr("value","");
		d3.json("./app/api/getGameData.php?gameId=" + gId
				,function(error,game) {
			d3.select("div#"+gId)
				.classed("loaded",true)
				.select(".gameInput")
				.attr("disabled",null);
			if (error) {
				console.error(error);
				stopLoader(gId);
				return;
			}
			if (isDef(game.error)) {
				d3.select("input.gameInput")
					.attr("value",game.error);
				console.error(game.error);
				stopLoader(gId);
				return;
			}
			game.totTime = 0;
			for (var boxI=0; boxI<game.boxScore.length; boxI++) {
				game.totTime += game.boxScore[boxI].t;
			}
			scope.game = game;
		
			dispGame();
		});
	}
	else {
		dispGame();
	}
}

function dispGame() {
	var gId = scope.game.id;
	scope.game.totTime = 0;
	for (var boxI=0; boxI<scope.game.boxScore.length; boxI++) {
		scope.game.totTime += scope.game.boxScore[boxI].t;
	}
	stopLoader(gId);
	colorTest(gId);
	//displayTitleScore(gId);
	addSplitButtons(gId);
	setMainGraph(gId);
	addTeamStats(gId);
	addPlayerStats(gId);
	addSplitGraph(gId);
	addPlayByPlay(gId);
	countPlays(gId);
	plotScore(gId);
	graphAll(gId, scope.sport.p[0], graphVars.graphTime);
}

function addSplitButtons(gId) {
	var opLoc = d3.select("div#"+gId)
		.append("div")
		.classed("opLoc "+gId,true);
	opLoc.append("input")
		.attr("type","radio")
		.attr("name","pp"+gId)
		.classed("pp "+gId,true)
		.attr("id","pp"+gId+"r")
		.attr("checked","checked")
		.attr("value","r");
	opLoc.append("label")
		.classed("ppl",true)
		.attr("for","pp"+gId+"r")
		.text("Raw data");
	scope.sport.ave.forEach(function(ave){
		opLoc.append("input")
			.attr("type","radio")
			.attr("name","pp"+gId)
			.classed("pp "+gId,true)
			.attr("id","pp"+gId+ave.i)
			.attr("value",ave.i);
		opLoc.append("label")
			.classed("ppl",true)
			.attr("for","pp"+gId+ave.i)
			.text("Per "+ave.l);
	});
	
	d3.selectAll("input.pp."+gId)
		.on("click",function(){return graphAll(gId, scope.game.lastPType, 0);});
}

function graphAll(gId,pType,time) {
		graphTeamStats(gId);
		if (pType == scope.game.lastPType) {
			scope.game.lastPType = null;
		}
		setTimeout(function(){
			if (scope.game.lastPType == null
					&& pType !== null) {
				plotHist(gId,pType);
			}
		},time);
}

function countPlays(gId){
	var split = scope.sport.split;
	var pos = scope.sport.pos;
	aH.forEach(function(team,teamI){
		scope.game["plays"+team.s] = d3.layout.histogram()
			.bins(scope.game.totTime/scope.sport.s)
			.range([0,scope.game.totTime])
			.value(function(p){return p.t;})(scope.game.plays.filter(function(p){
				return p.x && p[pos] == team.s;
			}));
		scope.game["plays"+team.s].forEach(function(d,i){
			scope.game["plays"+team.s][i] = d.length;
		});
		scope.game["playsSplit"+team.s] = d3.layout.histogram()
			.bins(split.bins)
			.range([split.rangeMin,split.rangeMax])
			.value(function(p){return getPlayTime(gId,p.id,true);})
			(scope.game.plays.filter(
				function(p){
				return p.x && p[pos] == team.s;
			}));
		scope.game["playsSplit"+team.s].forEach(function(d,i){
			scope.game["playsSplit"+team.s][i] = d.length;
		});
		scope.game["playsTot"+team.s] = scope.game.plays.filter(function(p){
			return p.x && p[pos] == team.s;
		}).length;
		//some shots at the buzzer hit after 35 seconds
		scope.game["playsSplit"+team.s][split.bins-1] += scope.game["playsTot"+team.s] - scope.game["playsSplit"+team.s].reduce(function(a,b){return a+b;});
	});
}

function setMainGraph(gId) {
	//set svgs
	scope.game.histChart = d3.select("div#"+gId)
		.append("svg")
		.attr("width", graphVars.histGraphWidth + margin.left + margin.right)
		.attr("height", graphVars.histGraphHeight + margin.histTop + margin.histBottom)
		.attr("id","histChart"+gId)
		.classed(gId,true)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.histTop + ")");
	
	scope.game.chart = d3.select("div#"+gId)
		.append("svg")
		.attr("width", graphVars.lineGraphWidth + margin.left + margin.right)
		.attr("height", graphVars.lineGraphHeight + margin.top + margin.bottom)
		.attr("id","chart"+gId)
		.classed(gId,true)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

//add split graph
function addSplitGraph(gId) {
	var splitGraphCont = d3.select("div#"+gId)
		.append("div")
		.classed(gId,true)
		.attr("id","splitGraphCont"+gId);
	splitGraphCont.append("div")
		.append("label")
		.classed("medTitle",true)
		.text(scope.sport.split.title);
	scope.game.splitGraph = splitGraphCont.append("svg")
		.attr("width", graphVars.histGraphWidth + margin.left + margin.right)
		.attr("height", graphVars.histGraphHeight + margin.histTop + margin.bottom)
		.attr("id","splitGraph"+gId)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.histTop + ")");
	scope.game.splitX = d3.scale.linear()
		.range([1, graphVars.histGraphWidth])
		.domain([scope.sport.split.rangeMin,scope.sport.split.bins]);
	scope.game.splitXAxis = d3.svg.axis()
		.scale(scope.game.splitX)
		.orient("bottom")
		.ticks(scope.sport.split.bins+1)
		.tickFormat(function(d){
			if (scope.sport.split.reverse) {
				return scope.sport.split.rangeMax - d / scope.sport.split.bins * scope.sport.split.rangeMax;
			} else {
				return d / scope.sport.split.bins * scope.sport.split.rangeMax;
			}
		});
	scope.game.splitGraph.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphVars.histGraphHeight + ")")
		.call(scope.game.splitXAxis);
	scope.game.splitGraph.append("g")
		.attr("class", "y axis");
	createShowDisp(gId,"splitGraphCont",scope.sport.split.title.toLowerCase(),false);
}

function addPlayByPlay(gId) {
	var pbpCont = d3.select("div#"+gId)
		.append("div")
		.classed(gId,true)
		.attr("id","pbpCont"+gId)
		.append("table")
		.classed("fullWidth",true);
	scope.game.plays.forEach(function(p,pI){
		if (pI==0) {
			pbpHead();
		}
		var bold = (!isNaN(p.p[0]) && p.p[2] == "m");
		var tr = pbpCont.append("tr")
			.classed("bold",bold);
		tr.append("td")
			.text(getDispTime(gId,p))
			.classed("pbp",true);
		if (p.p[0] == 'e' || p.e == 'n') {
			tr.append("td")
				.text(getPlayText(gId,p))
				.attr("colspan",3)
				.classed("center",true)
				.classed("pbp",true);
			if (p.p[0] == 'e' && pI!=scope.game.plays.length-1) {
				pbpHead();
			}
		} else {
		tr.append("td")
			.text(function(){if(p.e==aH[0].s){return getPlayText(gId,p)}})
			.classed("pbp",true);
		tr.append("td")
			.text(p[aH[0].s]+"-"+p[aH[1].s])
			.classed("pbp",true)
			.classed("center",true);
		tr.append("td")
			.text(function(){if(p.e==aH[1].s){return getPlayText(gId,p)}})
			.classed("pbp",true);
		}
	});
	
	function pbpHead() {
		var tr = pbpCont.append("tr")
			.classed("bold",true);
		tr.append("td")
			.text("Time")
			.style("width","70px")
			.classed("pbp",true)
			.classed("pbpHead",true)
			.classed("center",true);
		tr.append("td")
			.text(scope.game[aH[0].s].teamName)
			.classed("pbp",true)
			.classed("pbpHead",true)
			.classed("center",true);
		tr.append("td")
			.text("Score")
			.style("width","60px")
			.classed("pbp",true)
			.classed("pbpHead",true)
			.classed("center",true);
		tr.append("td")
			.text(scope.game[aH[1].s].teamName)
			.classed("pbp",true)
			.classed("pbpHead",true)
			.classed("center",true);
	}
	
	createShowDisp(gId,"pbpCont","full play-by-play",true);
}

function getDispTime(gId,p) {
	var dispTime = "";
	if (p.p[0] == 'e') {
		return "0:00"+" "+scope.game.boxScore[p.q-1].l;
	}
	var t = getMinutes(gId,p.t);
	dispTime += Math.trunc(t.t/60) + ":";
	dispTime += (t.t%60 < 10)? "0"+(t.t%60):t.t%60;
	return dispTime+" "+scope.game.boxScore[t.p].l;
}

function getPlayText(gId,play) {
	var sport = gId.substring(0,3);
	var playText = scope.sport.pt[play.p[0]];
	var playAr = [];
	for(var oI = 0; oI < playText.order.length; oI++) {
		if (isNaN(playText.order[oI])) {
			if (playText.order[oI] == "e" ||
					((playText.order[oI] == "m" ||
					playText.order[oI] == "o") &&
					play[playText.order[oI]] == null)) {
				if (play.e == "n") {
					playAr.push("Media");
				} else {
					playAr.push(scope.game[play.e].teamName);
				}
			} else {
				if (playText[playText.order[oI]]) {
					if (isDef(playText[playText.order[oI]].dataI)) {
						var dataI = playText[playText.order[oI]].dataI;
						playAr.push(play[playText.order[oI]][dataI]);
					} else {
						playAr.push(play[playText.order[oI]]);
					}
				} else {
					playAr.push(play[playText.order[oI]]);
				}
			}
			if (playText[playText.order[oI]] &&
					play[playText.order[oI]] != null) {
				if (playText[playText.order[oI]].xt) {
					if (playText[playText.order[oI]].xtns) {
						playAr[playAr.length-1] += playText[playText.order[oI]].xt;
					} else {
						playAr.push(playText[playText.order[oI]].xt);
					}
				}
			}
		} else {
			if (play.p.length > +playText.order[oI]) {
				playAr.push( playText[playText.order[oI]][ 
					play.p[playText.order[oI]] 
				]);
			} else if (playText[playText.order[oI]]["false"]){
				playAr.push(
					playText[playText.order[oI]]["false"]
				);
			}
			if (playText[playText.order[oI]].data) {
				if (isDef(playText[playText.order[oI]].dataI)) {
					var dataI = playText[playText.order[oI]].dataI;
					playAr.push(play[playText[playText.order[oI]].data][dataI]);
				} else {
					playAr.push(play[playText[playText.order[oI]].data]);
				}
			}
			if (playText[playText.order[oI]].xt) {
				playAr.push(playText[playText.order[oI]].xt);
			}
		}
	}
	if (play == scope.game.plays[scope.game.plays.length-1] &&
			oI == "e") {
		playAr.pop();
		playAr.push("game.");
	}
	return playAr.join(" ");
}

//display headline score and teams
/*function displayTitleScore(gId) {
	var bS = d3.select("div#"+gId)
		.append("div")
		.classed("boxScore",true)
		.classed(gId,true);
	aH.forEach(function(team,teamI) {
		//main container
		var mTLCont = bS
			.append("div")
			.classed("left",(teamI%2==0))
			.classed("right",(teamI%2==1))
			.classed("mTLCont",true);
		//team name
		mTLCont.append("div")
			.classed("left tRight",(teamI%2==0))
			.classed("right tLeft",(teamI%2==1))
			.classed("mainTeamLabel",true)
			.style("border-color","#"+scope.game[team.s].primary)
			.append("div")
			.classed("larTitle "+gId+" "+team.l, true)
			.classed("bottomText",true)
			.classed("fullWidth",true)
			.text(scope.game[team.s].teamName);
	});
	var bSCont = bS
		.append("div")
		.classed("bSCont",true);
	bSCont.append("div")
		.classed("bSDateLoc",true)
		.classed("fullWidth center",true)
		.html(scope.game.gameDate+"<br>"+scope.game.venue.venueName+", "+scope.game.venue.city+", "+scope.game.venue.state);
	var bSLower = bSCont
		.append("div")
		.classed("fullWidth",true);
	//score
	aH.forEach(function(team,teamI){
		bSLower.append("div")
			.classed("left tLeft",(teamI%2==0))
			.classed("right tRight",(teamI%2==1))
			.classed("mainScore",true)
			.append("div")
			.classed("larTitle "+gId+" "+team.l,true)
			.classed("bottomText",true)
			.classed("fullWidth",true)
			.classed("scoreNum",true)
			.text(scope.game[team.s+"Score"]);
	})
	var bSTable = bSLower
		.append("table")
		.classed("bSTable",true);
	aH.unshift({s:"period"});
	aH.forEach(function(team,teamI) {
//		if (scope.game.boxScore.length > 3)
		var bSTR = bSTable.append("tr");
		bSTR.append("td")
			.classed("bold",true)
			.classed("thead",!teamI)
			.text(function(){
				if (teamI) {
					return scope.game[team.s].short;
				} else if (scope.game.final) {
					return "Final"
				} else {
					var lastPlay = scope.game
						.plays[
							scope.game.plays.length-1
						];
					return minToTime(lastPlay.t)
						+ " "
						+ scope.game.boxScore[
							lastPlay.q-1].l;
				}
			});
		var otTot = 0;
		scope.game.boxScore.forEach(function(bS,bSI){
			if (bS.ot && bSI != scope.game.boxScore.length-1 && scope.game.boxScore.length>5) {
				if (teamI) {
					otTot += bS[team.s];
				} else {
					otTot++;
				}
			} else {
				bSTR.append("td")
					.classed("center",true)
					.classed("thead",!teamI)
					.text(function(){
						if (bS.ot && !teamI) {
							otTot++;
							return otTot + "OT";
						} else {
							return otTot+bS[team.s];
						}
					});
			}
		});
		bSTR.append("td")
			.classed("center bold",true)
			.classed("thead",!teamI)
			.text(function(){
				if (!teamI) {
					return "T";
				} else {
					return scope.game[team.s+"Score"];
				}
			});
	});
	aH.shift();
}*/

function addPlayerStats(gId) {
	var playerStatsSvg = d3.select("div#"+gId)
		.append("div")
		.attr("id","playerStatsGraph"+gId)
		.classed(gId,true)
		.append("svg")
		.attr("width", graphVars.histGraphWidth + margin.left + margin.right)
		.attr("height", graphVars.histGraphHeight + margin.bottom + margin.top);
	scope.game.playerStatsGraph = playerStatsSvg
		.append("g")
		.attr("transform", "translate(" + ((graphVars.histGraphWidth + margin.left + margin.right)/2) + ","+margin.top+")");
	playerStatsSvg.append("g")
		.append("text")
		.attr("text-anchor","middle")
		.style("font-weight","bold")
		.attr("y",graphVars.histGraphHeight+margin.top+margin.bottom)
		.attr("x",((graphVars.histGraphWidth + margin.left + margin.right)/2))
		.attr("dy","-.5em")
		.text("Player Stats");
	createShowDisp(gId,"playerStatsGraph","player stats graph",false);
	aH.forEach(function(team){
		scope.game.playerStatsGraph.append("g")
			.attr("class", team.s+" axis");
	});
	
	var sPO = scope.sport.po;
	scope.game.players = {};
	var playerStatsTable = d3.select("div#"+gId)
		.append("div")
		.classed("playerStats",true)
		.classed(gId,true)
		.attr("id","playerStats"+gId)
		.append("table")
		.classed("playerStatsT",true);
	
	aH.forEach(function(team) {
		scope.game.players[team.s] = {};
		scope.game.players[team.s].ps = [];
		scope.game.plays.forEach(function(p){
				if(p.e == team.s && p.m) {
					p.m.forEach(function(player) {
						if (!scope.game.players[team.s][player]) {
							scope.game.players[team.s].ps.push(player);
							scope.game.players[team.s][player] = [];
						}
						scope.game.players[team.s][player].push(p);
					});
				}
		});
		var playerRow = playerStatsTable.append("tr");
		playerRow.append("td")
			.classed("thead",true)
			.text(scope.game[team.s].teamName);
		scope.sport.p.forEach(function(p){
			if(p!="top" && p!="to") {
				playerRow.append("td")
					.classed("thead",true)
					.attr("title",sPO[p].l+"s")
					.text(sPO[p].a + ((sPO[p].ad)?" ("+sPO[p].ad+")":""));
			}
		});
		scope.game.players[team.s].ps.forEach(function(player){
			playerRow = playerStatsTable.append("tr")
				.classed("hover",true);
			playerRow.append("td").text(player);
			scope.sport.p.forEach(function(p){
				if(p!="top" && p!="to") {
					var mainRegExp = new RegExp(sPO[p].c,"i");
					var totPlays = scope.game.players[team.s][player].filter(function(play){
						return (isData(gId,play.id,p) 
								&& player == scope.game.plays[play.id].m[(sPO[p].player)?sPO[p].player:0]);
					});
					var primRegExp,totPrims;
					if(sPO[p].p || sPO[p].dv || sPO[p].pv) {
						totPrims = totPlays.filter(function(play){
							return isData(gId,play.id,p,true);
						});
					}	
					playerRow.append("td").text(function(){
						var text = "";
						if (sPO[p].p && !sPO[p].ns	) {
							text += totPrims.length + ((sPO[p].add)?"/":"-");
						}
						if (sPO[p].sum) {
							var sum = 0;
							totPlays.forEach(function(prim){
								sum += +prim.p[sPO[p].mp];
							});
							text = sum;
						}
						else if (sPO[p].add || !sPO[p].p || sPO[p].ns) {
							text += totPlays.length;
						}
						else {
							text += (totPlays.length-totPrims.length);
						}
						return text;
					});
				}
			});
		});
	});
	
	createShowDisp(gId,"playerStats","player stats table",true);
}

//create show/disp link
function createShowDisp(gId,obId,title,hidden,secId) {
	if(d3.select("#"+obId+gId)[0][0]) {
		function insertTriangle() {
			sdL.append("svg")
				.classed("inline arrowSvg",true)
				.attr("width",12)
				.attr("height",10)
				.append("g")
				.classed("arrow"+obId+gId,true)
				.append("path")
				.attr("d",(!hidden)?graphVars.showHideShape.pDash:graphVars.showHideShape.plus)
				.style("fill","#AAA");
		}
		var showHideText;
		if (secId) {
			showHideText = ["Maximize","Minimize"];
		} else {
			showHideText = ["Show","Hide"];
		}
		d3.select("#"+obId+gId)
			.classed("showDispCont",true)
			.attr("realHeight",function(){return this.getBoundingClientRect().height;})
			.style("display",(hidden)?"none":null);
		if (secId) {
			d3.select("#"+secId+gId)
				.classed("showDispCont",true)
				.attr("realHeight",function(){return this.getBoundingClientRect().height;})
				.style("display",(!hidden)?"none":null);
		}
		var showDisplayBox = d3.select("div#"+gId)
			.insert("div","#"+obId+gId)
			.classed("showDispBox",true)
			.classed(gId,true);
		var sdCheck = showDisplayBox.append("input")
			.attr("type","checkbox")
			.classed("showDispCheck",true)
			.attr("id","sD"+obId+gId)
			.property("checked",!hidden);
		var sdL = showDisplayBox.append("label")
			.attr("for","sD"+obId+gId)
			.classed("showDispLabel smaTitle",true);
		insertTriangle();
		sdL.append("span")
			.classed("sdsh",true)
			.text((hidden)?showHideText[0]:showHideText[1]);
		if (title) {
			sdL.append("span")
				.text(" "+title);
		}
		insertTriangle();
		sdCheck.on("click",function(){
			var checkBox = (d3.selectAll("#sD"+obId+gId+":checked")[0].length)?true:false;
			d3.select("#"+obId+gId)
				.style("height",function(){return checkBox?0:d3.select(this).attr("realHeight")+"px"})
				.style("display",null)
				.transition().duration(graphVars.dispTime)
				.style("height",function(){return (checkBox?d3.select(this).attr("realHeight"):0)+"px"})
				.each("end",function(){d3.select(this).style("display",checkBox?null:"none");})
			if (secId) {
				d3.select("#"+secId+gId)
					.style("height",function(){return !checkBox?0:d3.select(this).attr("realHeight")+"px"})
					.style("display",null)
					.transition().duration(graphVars.dispTime)
					.style("height",function(){return (!checkBox?d3.select(this).attr("realHeight"):0)+"px"})
					.each("end",function(){d3.select(this).style("display",!checkBox?null:"none");})
			}
			sdL.selectAll("path")
				.transition().duration(graphVars.dispTime)
				.attr("d",(checkBox)? graphVars.showHideShape.pDash:graphVars.showHideShape.plus);
			sdL.select("span.sdsh")
				.text((!checkBox)?showHideText[0]:showHideText[1]);
		});
	}
}

//convert period seconds to minutes
function getMinutes(gId,pTime) {
	var period = scope.game.boxScore.length-1;
	for(var boxI = scope.game.boxScore.length-1; boxI>=0; boxI--) {
		var b = scope.game.boxScore[boxI];
		if (pTime > b.t) {
			period -= 1;
			pTime = pTime - b.t;
		}
	}
	return {t:pTime,p:period};
}

//plot line, axes
function plotScore(gId) {
	//Mouse Over G
	var mOG = scope.game.chart.append("g")
		.classed("mouseover "+gId,true)
		.style("display","none");
	
	mOG.append("text")
		.attr("text-anchor", "middle")
		.attr("y",-5);
	
	mOG.append("line")
		.classed("moLine",true)
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2",0)
		.attr("y2",graphVars.lineGraphHeight);
	
	//set line key
	var lineKey = scope.game.chart.append("g")
		.attr("class", "lineKey " + gId);
	aH.forEach(function(team, teamI) {
		lineKey.append("line")
			.attr("x1", 10)
			.attr("x2", 30)
			.attr("y1", 10 + teamI*20)
			.attr("y2", 10 + teamI*20)
			.style("stroke-width",5)
			.style("stroke", "#"+scope.game[team.s].primary)
			.style("shape-rendering", "crispEdges");
		lineKey.append("text")
			.text(scope.game[team.s].teamName)
			.attr("x", 35)
			.attr("text-anchor", "start")
			.attr("y", 10 + teamI*20)
			.attr("dy", ".3em");
	});
	
	//setup domain
	var yMax = 10*Math.ceil(Math.max(d3.max(scope.game.plays, function(p) { return p.a; }), d3.max(scope.game.plays, function(p) { return p.h; }))/10);
	scope.game.x = d3.scale.linear()
		.range([0, width])
		.domain([scope.game.totTime,0]);
	scope.game.xAxisScale = d3.scale.linear()
		.range([0, width])
		.domain([scope.game.totTime/scope.sport.s,0]);

	scope.game.y = d3.scale.linear()
		.range([height, 0])
		.domain([-10, yMax]);
	//axes are printed after mouse over g
	
	//add score diff links - needs to be over mOG for link reasons
	var scoreDiff = scope.game.chart.append("g")
		.attr("transform","translate("+graphVars.lineGraphWidth/2+",0)");
	scoreDiff.append("line")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", 0)
		.attr("y2", 15)
		.style("stroke-width",1)
		.style("stroke", "#000");
	var text = scoreDiff.append("text")
		.classed("svgLink",true)
		.classed("svgLinkActive",true)
		.attr("id","scoreDiffS"+gId)
		.text("Score")
		.attr("text-anchor", "end")
		.attr("x",-10)
		.attr("dy",".9em");
	scoreDiff.append("rect")
		.classed("svgLinkBox",true)
		.classed("svgLinkBoxActive",true)
		.attr("id","scoreDiffBoxS"+gId)
		.attr("x",-10-text.node().getBBox().width)
		.attr("width",text.node().getBBox().width)
		.attr("height",text.node().getBBox().height)
		.on("click",function(){switchScoreDiff(gId,this);graphAll(gId, scope.game.lastPType, 0);});
	text = scoreDiff.append("text")
		.classed("svgLink",true)
		.attr("id","scoreDiffD"+gId)
		.text("Diff.")
		.attr("text-anchor", "start")
		.attr("x",10)
		.attr("dy",".9em");
	scoreDiff.append("rect")
		.classed("svgLinkBox",true)
		.attr("id","scoreDiffBoxD"+gId)
		.attr("x",10)
		.attr("width",text.node().getBBox().width)
		.attr("height",text.node().getBBox().height)
		.on("click",function(){switchScoreDiff(gId,this);graphAll(gId, scope.game.lastPType, 0);});
	
	//bisect time
    scope.game.bisectTime = d3.bisector(function(p) {
    	return scope.game.totTime - p.t; 
    });
	
	//create mouseover
	d3.select("svg#chart"+gId)
		.on("mousemove",function(){
			var mouseT = scope.game.x.invert(d3.mouse(this)[0]-margin.left);
			if (mouseT < 0) {
				mouseT = 0;
			} else if (mouseT > scope.game.totTime) {
				mouseT = scope.game.totTime;
			}
			mOG.attr("transform","translate("+scope.game.x(mouseT)+",0)");
			var perTime = getMinutes(gId,mouseT);
			var time = minToTime(perTime.t);
			var pID = scope.game.bisectTime.left(scope.game.plays, scope.game.totTime - mouseT,1);
			var scoreText = "";
			aH.forEach(function(team){
				scoreText += scope.game[team.s].short + ":";
				scoreText += scope.game.plays[pID-1][team.s] + " ";
			});
			var text = mOG.select("text")
				.text(scoreText+"- "+time+" "+scope.game.boxScore[perTime.p].l);
			var textSize = text.node().getBBox();
			if (scope.game.x(mouseT) + textSize.width/2 > graphVars.lineGraphWidth) {
				text.attr("dx", graphVars.lineGraphWidth - (scope.game.x(mouseT) + textSize.width/2));
			} else if (scope.game.x(mouseT) - textSize.width/2 < 0) {
				text.attr("dx", textSize.width/2-scope.game.x(mouseT));
			} else {
				text.attr("dx",0);
			}
			
		})
		.on("mouseover",function(){mOG.style("display",null)})
		.on("mouseout",function(){mOG.style("display","none")});
	
	//display axes (on top of mouse over g)
	scope.game.xAxis = d3.svg.axis()
		.scale(scope.game.xAxisScale)
		.orient("bottom")
		.tickFormat(function(d,i) { 
			var perTime = getMinutes(gId,d*scope.sport.s);
			if(scope.game.boxScore[perTime.p].t == perTime.t) {
				return scope.game.boxScore[perTime.p].l;
			} else {
				return (perTime.t/60) + ":00";
			}
		});
	
	scope.game.yAxis = d3.svg.axis()
		.scale(scope.game.y)
		.orient("left");
	
	scope.game.histXAxis = d3.svg.axis()
		.scale(scope.game.xAxisScale)
		.orient("bottom")
		.tickFormat("");
	
	displayClip(gId,graphVars.graphTime);
	
	//create plot axes
	scope.game.chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(scope.game.xAxis);
	scope.game.chart.append("g")
		.attr("class", "y axis "+gId)
		.call(scope.game.yAxis);
	
	scope.game.histChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphVars.histGraphHeight + ")")
		.call(scope.game.histXAxis);
	
	//create replay buttons
	graphVars.replayTimes.forEach(function(timeInS,i){
		var replayButton = scope.game.chart
			.append("g")
			.attr("transform", "translate(" + (width + 20) + "," + (8-margin.top + 30*i) + ")")
			.on("click", function(){
				return displayClip(gId,timeInS*1000);
			});
	
		replayButton
			.append("path")
			.attr("d", "M0,0 a10,10 0 1,0 10,10 h3 l-4,-4 l-4,4 h3 a8,8 0 1,1 -8,-8 z")
			.style("stroke","black");
		replayButton
			.append("text")
			.text(timeInS)
			.attr("text-anchor", "middle")
			.attr("x",0)
			.attr("y",10)
			.attr("dy",".35em")
			.attr("dx","-.1em")
			.style("font-size","7pt");
		replayButton
			.append("circle")
			.attr("cx",0)
			.attr("cy",10)
			.attr("r",10)
			.style("fill","transparent")
			.style("cursor","pointer");
	});
	
	scope.game.lineData = {a:[],h:[]};
	//set up score paths
	scope.game.line = {a:d3.svg.line()
		.x(function(p) { return scope.game.x(p.t); })
		.y(function(p) { return scope.game.y(p.a); }),
		h:d3.svg.line()
		.x(function(p) { return scope.game.x(p.t); })
		.y(function(p) { return scope.game.y(p.h); })};
	aH.forEach(function(team){
		scope.game.chart
				.append("path")
				.attr("class", "line")
				.attr("id","line"+gId+team.s)
				.attr("stroke-width","2px")
				.attr("stroke", "#"+scope.game[team.s].primary)
				.attr("clip-path", "url(#graphClip"+gId+")");
	});
	scope.game.chart.append("line")
		.attr("x1",scope.game.x(0))
		.attr("x2",scope.game.x(scope.game.totTime))
		.attr("y1",scope.game.y(0))
		.attr("y2",scope.game.y(0))
		.style("stroke","black")
		.style("stroke-width",2)
		.style("display","none")
		.attr("id","diffMidLine"+gId);
	plotLine(gId);
}

//plot score line
function plotLine(gId) {
	var yMax,yMin;
	var sc = scope.sport.score;
	if (scope.game.scoreDiff) {
		yMin = 10*Math.floor(d3.min(scope.game.plays, function(p) { return p.a-p.h; })/10);
		if (yMin == 0) {
			yMin = -10;
		}
		yMax = 10*Math.ceil(d3.max(scope.game.plays, function(p) { return p.a-p.h; })/10);
		if (yMax == 0) {
			yMax = 10;
		}
	} else {
		yMin = 0;
		yMax = 10*Math.ceil(Math.max(d3.max(scope.game.plays, function(p) { return p.a; }), d3.max(scope.game.plays, function(p) { return p.h; }))/10);
	}
	scope.game.y = d3.scale.linear()
		.range([height, 0])
		.domain([yMin, yMax]);
	scope.game.yAxis = d3.svg.axis()
		.orient("left")
		.scale(scope.game.y)
		.tickFormat(function(d){return Math.abs(d)});
	d3.select(".y.axis."+gId)
		.call(scope.game.yAxis);
	scope.game.lineData["a"].length = 0;
	scope.game.lineData["h"].length = 0;
	//create plot path data (extra points to make it square)
	scope.game.plays.forEach(function(play,playI) {
		if (isData(gId,play.id,'pt') ||
				playI==0 || playI == scope.game.plays.length-1) {
			if (scope.game.scoreDiff) {
				aH.forEach(function(team) {
					if(playI!=0){
						var score = {
							h: scope.game.plays[playI-1].h-scope.game.plays[playI-1].a,
							a: scope.game.plays[playI-1].a-scope.game.plays[playI-1].h
						}
						if (score[team.s]<0) {
							score[team.s]=0;
						}
						scope.game.lineData[team.s].push({
							t: play.t,
							h: -score.h,
							a: score.a,
							q: play.q
						});
					}
					var score = {
						h: play.h-play.a,
						a: play.a-play.h
					}
					if (score[team.s]<0) {
						score[team.s]=0;
					}
					scope.game.lineData[team.s].push({
						t: play.t,
						h: -score.h,
						a: score.a,
						q: play.q
					});
				});
			} else {
				aH.forEach(function(team) {
					if(playI!=0){
						scope.game.lineData[team.s].push({
							t: play.t,
							h: scope.game.plays[playI-1].h,
							a: scope.game.plays[playI-1].a,
							q: play.q
						});
					}
					scope.game.lineData[team.s].push(play);
				});
			}
		}
	});
	
	//plot score path
	aH.forEach(function(team) {
		d3.select("#line"+gId+team.s)
			.datum(scope.game.lineData[team.s])
			.transition().duration(graphVars.dispTime)
			.attr("d",scope.game.line[team.s]);
	});
	
	if (scope.game.scoreDiff) {
		d3.select("#diffMidLine"+gId)
			.attr("y1",scope.game.y(0))
			.attr("y2",scope.game.y(0))
			.style("display",null);
	} else {
		d3.select("#diffMidLine"+gId)
			.style("display","none");
	}
}

function isData(gId,pId,pType,isPrim) {
	var play = scope.game.plays[pId];
	var sport = gId.substring(0,3);
	var comp = scope.sport.po[pType].c;
	var mPos = scope.sport.po[pType].mp;
	var prim = scope.sport.po[pType].p;
	var primPos = scope.sport.po[pType].pp;
	var primDat = scope.sport.po[pType].pd;
	var noSec = scope.sport.po[pType].ns;
	var nextPlay = scope.sport.po[pType].np;
	prim = (!isDef(prim)) ? comp : prim;
	var compRegExp = new RegExp(comp,"i");
	var primRegExp = new RegExp(prim,"i");
	var mainBool;
	if(comp == "pos"){
		return play.x;	
	} else {
		var dv = (scope.sport.po[pType].dv) ? scope.sport.po[pType].dv : 'p';
		if (isDef(mPos)) {
			mainBool = compRegExp.test(play[dv][mPos]);
		} else {
			mainBool = (isDef(play[dv]));
		}
	}
	if (isDef(primDat)) {
		dv = primDat;
	}
	if ((isPrim || noSec || prim==comp) && mainBool) {
		var secBool;
		if (nextPlay) {
			var nP = scope.game.plays[pId+1];
			secBool = primRegExp.test(nP[dv]);
		} else if (isDef(primPos)) {
			secBool = primRegExp.test(play[dv][primPos]);
		} else {
			secBool = (isDef(play[dv]));
		}
		return secBool;
	} else {
		return mainBool;
	}
}

function reduceData(gId,pType,data,gIndex,teamS,gType,func,isSec) {
	var sport = gId.substring(0,3);
	var comp = scope.sport.po[pType].c;
	var prim = scope.sport.po[pType].p;
	var defPosP = scope.sport.po[pType].dpp; //primary is defense, mainly for per possession calculation
	var defPosS = scope.sport.po[pType].dps;
	var primSum = scope.sport.po[pType].sum;
	var primPos = scope.sport.po[pType].pp;
	var mPos = scope.sport.po[pType].mp;
	var primVal = scope.sport.po[pType].pv;
	var primValPos = scope.sport.po[pType].pvp;
	var noSec = scope.sport.po[pType].ns;
	var playDir = scope.sport.pd;
	var splitTime = scope.sport.s;
	var dataValue = (scope.sport.po[pType].dv)?scope.sport.po[pType].dv:'p';
	var dataAr = [];
	if (isSec) {
		var secData = data.filter(function(p){return !(isData(gId,p.id,pType,isSec))});
		dataAr.push(secData);
	} else {
		dataAr.push(data);
	}
	var value = 0;
	if (isDef(primVal)) {
		dataValue = primVal;
		mPos = primValPos;
	}
	dataAr.forEach(function(d,i){
		var tempVal = 0;
		if (primSum) {
			d.forEach(function(p) {
				if(!isDef(mPos)){
					tempVal += +p[dataValue];
				} else {
					tempVal += +p[dataValue][mPos];
				}
			});
		} else if (comp=="pos" && (gType!="split" || scope.sport.split.top)) {
			//calculating time of possession
			if (gType != 'tot' && !isSec) {
				var finTime = gIndex*splitTime;
				var startTime = (gIndex+1)*splitTime;
				var pId = scope.game.bisectTime[
					(playDir?'right':'left')](scope.game.plays, scope.game.totTime - ((playDir)?startTime:finTime),0);
				var prevPos = getNextPos(gId,pId,false);
				var nextPos = (scope.game.plays[pId].x)? scope.game.plays[pId]: getNextPos(gId,pId,true);
				if (((playDir)?prevPos.e:nextPos.e) == teamS &&
						((playDir && startTime != scope.game.totTime) ||
						(!playDir && finTime != 0))) {
					var outsideTime = (playDir)?startTime:finTime;
					var insideTime = (playDir)?
							((nextPos.t>finTime)?nextPos.t:finTime):
							((prevPos.t<startTime)?prevPos.t:startTime);
					if (playDir || outsideTime != finTime) {
						tempVal += Math.abs(outsideTime-insideTime);
					}
				}
			}
			d.forEach(function(p,pI) {
				if (gType == 'tot') {
					tempVal += getPlayTime(gId,p.id,playDir);
				} else {
					if (pI == ((playDir)?d.length-1:0) && 
							getNextPos(gId,p.id,playDir) != p &&
							((!playDir && getNextPos(gId,p.id,playDir).t > startTime) || 
							(playDir && getNextPos(gId,p.id,playDir).t < finTime))) {
						var funct = (playDir)?Math.floor:Math.ceil;
						tempVal += Math.abs(p.t - funct(p.t/splitTime)*splitTime);
					} else {
						tempVal += getPlayTime(gId,p.id,playDir);
					}
				}
			});
		} else {
			tempVal += d.length;
		}
		if (gType !== false) {
			value = rawOrPPNum(tempVal,gId,teamS,{index:gIndex, type:gType, dp:((i)?defPosS:defPosP)});
		} else {
			value = tempVal;
		}
	});
	if (isDef(func)) {
		value = func(value);
	}
	return value;
}

function reduceDataText(gId,pType,data,gIndex,teamS,gType,func,isSec) {
	var sport = gId.substring(0,3),
		sPOT = scope.sport.po[pType],
		string = "",
		total = reduceData(gId,pType,data,gIndex,teamS,gType,func,false),
		sec;
	if (sPOT.ns || sPOT.ls) {
		string += total;
	} else {
		sec = reduceData(gId,pType,data,gIndex,teamS,gType,func,true);
		string += (total-sec);
		if (sPOT.add) {
			string += '/' + total;
		} else {
			string += '-' + sec;
		}
	}
	return string;
}

function negZero(a) {
	return (a>0)?a:0;
}

//switch score diff on click
function switchScoreDiff(gId,ob) {
	var box = d3.select(ob);
	if(!box.classed("svgLinkBoxActive")){
		var links = [box.attr("id")[box.attr("id").length-gId.length-1],
				(box.attr("id")[box.attr("id").length-gId.length-1]=="D")?"S":"D"];
		links.forEach(function(link,linkI){
			d3.select("#scoreDiff"+link+gId).classed("svgLinkActive",!linkI);
			d3.select("#scoreDiffBox"+link+gId).classed("svgLinkBoxActive",!linkI);
		});
		scope.game.scoreDiff = (links[0]=="D");
		plotLine(gId);
	}
}

function displayClip(gId,time) {
	//clip for point path and points
	var clipRect = scope.game.chart
		.select("#graphClip"+gId);
	if (clipRect[0][0] != null) {
		clipRect.remove();
		if (time != false) {
			scope.game.chart.selectAll("circle.point."+gId).remove();
			//only display points if user has not cleared data
			if (scope.game.lastPType != null) {
				plotHist(gId, scope.game.lastPType, time);
			}
		}
	}
	scope.game.chart.append("clipPath")
		.attr("id","graphClip"+gId)
		.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("height",height)
		.attr("width",0)
		.transition().duration(time)
		.ease("linear")
		.attr("width",width+1);
}

//plot histogram, points, point keys
function plotHist(gId, pType, dispTime) {
	var sport = gId.substring(0,3);
	var sPO = scope.sport.po[pType];
	//display clicked link as active
	d3.selectAll("div.teamStat."+gId)
		.classed("active",false);
	d3.select("#teamStatsMin"+gId)
		.selectAll(".teamStatMin")
		.classed("active",false);
	//gather data for points and bars
	var comp = sPO.c;
	var prim = sPO.p;
	var mPos = sPO.mp;
	var primSum = sPO.sum;
	var primPos = sPO.pp;
	var noSec = sPO.ns;
	var labelSing = sPO.ls;
	var add = sPO.add;
	var otherTeam = sPO.ot;
	var defPosP = sPO.dpp;
	var defPosS = sPO.dps;
	var dataValue = (sPO.dv) ? sPO.dv : 'p';
	
	prim = isDef(prim) ?  prim : comp;
	var player = (sPO.player) ? sPO.player : 0;
	
	//cut last animation short for points
	scope.game.chart.selectAll("circle.transWaiting.point."+gId)
		.remove();
	
	//create comparisons	
	var compRegExp = new RegExp(comp,"i");
	var primRegExp = new RegExp(prim,"i");
	
	var histData = scope.game.plays.filter(function(p,pI) {
		if (pType == scope.game.lastPType && !dispTime) {
			return false;
		}
		return isData(gId,pI,pType);
	});
	
	//if user pressed same button again
	if (pType == scope.game.lastPType && !dispTime) {
		scope.game.lastPType = null;
	} else {
		displayClip(gId,0)
		scope.game.lastPType = pType;
		d3.select("#"+gId+"_"+pType)
			.classed("active",true);
		d3.select("#teamStatsMin"+gId)
			.selectAll(".col"+pType)
			.classed("active",true);
	}
	
	var histTeam = {}
	aH.forEach(function(team,teamI){
		histTeam[team.s] = d3.layout.histogram()
			.bins(scope.game.totTime/scope.sport.s)
			.range([0,scope.game.totTime])
			.value(function(p){return p.t;})(histData.filter(function(p) { return p.e == oppAH(team.s,!otherTeam); }))
	});
		
	var histX = d3.scale.linear()
		.range([1, graphVars.histGraphWidth+1])
		.domain([scope.game.totTime,0]);
	var histY = d3.scale.linear()
		.range([0, graphVars.histGraphHeight])
		.domain([
			Math.min(
				d3.min(histTeam.a, function(d,i) { return reduceData(gId,pType,d,i,aH[0].s,"time");}),
				d3.min(histTeam.h, function(d,i) { return reduceData(gId,pType,d,i,aH[1].s,"time");}),
				0)
			, 
			Math.max(
				d3.max(histTeam.a, function(d,i) { return reduceData(gId,pType,d,i,aH[0].s,"time");}),
				d3.max(histTeam.h, function(d,i) { return reduceData(gId,pType,d,i,aH[1].s,"time");}))
		]);
	scope.game.histChart.select('g.x.axis')
		.transition().duration(graphVars.dispTime)
		.attr("transform","translate(0,"
				+(graphVars.histGraphHeight-histY(0))+")");
	
	//display bars
	aH.forEach(function(team,teamI) {
		var chartBars = scope.game.histChart.selectAll('rect.p.'+team.s)
			.data(histTeam[team.s]);
		chartBars
		  .enter()
			.append('rect')
			.attr("class","p "+team.s)
			.attr("x",function(d,i){return histX(d.dx*i + d.dx/2*(2-teamI));})
			.attr("width",function(d) {return histX(scope.game.totTime-d.dx/2)-2;})
			.attr("y",graphVars.histGraphHeight)
			.attr("height",0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+scope.game[team.s].primary);
		
		chartBars
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(histTeam[team.s].length-i); } )
			.attr("y",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"time",function(d){return graphVars.histGraphHeight-histY(negZero(d));});
			})
			.attr("height",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"time",function(d){return histY(Math.abs(d)) - histY(0);});
			});
		
		var textFields = scope.game.histChart.selectAll('text.p.'+team.s)
			.data(histTeam[team.s]);
		
		textFields.enter()
			.append('text')
			.style("text-anchor","middle")
			.attr("class","p "+team.s)
			.attr("x",function(d,i){return histX(d.dx*i + d.dx/2*(2-teamI) - d.dx/4);})
			.attr("y",function(d) {return graphVars.histGraphHeight;})
			.attr("dy","-.2em");
		
		textFields
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(histTeam[team.s].length-i); } )
			.attr("y",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"time",function(d){return graphVars.histGraphHeight-histY(negZero(d))});
			})
			.text(function(d,i) {
				return reduceDataText(gId,pType,d,i,team.s,"time",shortNum); 
			});
		//set secondary box
		var secBars = scope.game.histChart.selectAll('rect.s.'+team.s)
			.data(histTeam[team.s]);
		secBars
		  .enter()
			.append('rect')
			.attr("class","s "+team.s)
			.attr("x",function(d,i){return histX(d.dx*i + d.dx/2*(2-teamI))+2;})
			.attr("width",function(d) {return histX(scope.game.totTime-d.dx/2)-6;})
			.attr("y",graphVars.histGraphHeight)
			.attr("height",function(d) {return 0;})
			.style("fill","#"+scope.game[team.s].secondary)
			.style("shape-rendering", "crispEdges");
		
		secBars
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(histTeam[team.s].length-i); } )
			.attr("y",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"time",function(d){return graphVars.histGraphHeight-histY(negZero(d))+2;});
			})
			.attr("height",function(d,i) {
				return negZero(reduceData(gId,pType,d,i,team.s,"time",function(d){return histY(d)-histY(0)-2;},true));
			});
	});

	//display points
	var graphPoint = scope.game.chart.selectAll("circle.point."+gId)
		.data(histData,function(p) {return p.id;});
	var prevGraphPoints = scope.game.chart.selectAll("circle.point."+gId);
	prevGraphPoints = prevGraphPoints[0].length;
	
	graphPoint
		.exit()
		.transition().duration(graphVars.dispTime)
		.delay(function(p,i) { return graphVars.dispTime/(2*prevGraphPoints)*i; } )
		.attr("r",0)
		.remove();
	
	graphPoint
		.transition().duration(graphVars.dispTime)
		.delay(0)
		.attr("r",3)
		.style("fill",function(p) {
				if (p.e != "n") {
					return (isData(gId,p.id,pType,true)) ? "#"+scope.game[p.e].primary : "#"+scope.game[p.e].secondary;
				}
				return "white";
			})
		.attr("cy",function(p) {
				if (scope.game.scoreDiff) {
					if (p.e != "n") {
						return scope.game.y(p.a-p.h);
					}
					else {
						return scope.game.y(0);
					}
				} else {
					if (p.e != "n") {
						return scope.game.y(p[p.e]);
					}
					else {
						return scope.game.y((p.a+p.h)/2);
					}
				}
			})
	
	graphPoint
		.enter()
		.append("circle")
		.attr("class","point " + gId)
		.attr("id",function(p){return "playpoint-"+p.id;})
		.attr("cx",function(p) {return scope.game.x(p.t);})
		.attr("cy",function(p) {
				if (scope.game.scoreDiff) {
					if (p.e != "n") {
						return scope.game.y(p.a-p.h);
					}
					else {
						return scope.game.y(0);
					}
				} else {
					if (p.e != "n") {
						return scope.game.y(p[p.e]);
					}
					else {
						return scope.game.y((p.a+p.h)/2);
					}
				}
			})
		.attr("r",function(){return (dispTime)?0:30;})
		.style("opacity",function(){return (dispTime)?1:0;})
		.style("fill",function(p) {
				if (p.e != "n") {
					return (isData(gId,p.id,pType,true)) ? "#"+scope.game[p.e].primary : "#"+scope.game[p.e].secondary;
				}
				return "white";
			})
		.style("stroke",function(p) {
				if (p.e != "n") {
					return "#"+scope.game[p.e].primary;
				}
				return "black";
			})
		.style("stroke-width",function(){return ((dispTime)?"":"1")+"0px";})
		.classed("transWaiting",true)
		.transition().duration(graphVars.dispTime)
		.delay(function(p,i) { 
			if(!dispTime) {
				return graphVars.dispTime/2/histData.length*i+graphVars.dispTime/2;
			} else {
				return (scope.game.totTime - p.t)/scope.game.totTime*dispTime;
			}
		})
		.ease("bounce")
		.attr("r",3)
		.style("opacity",1)
		.style("stroke-width","2px")
		.each("end",function(){
			d3.select(this).classed("transWaiting",false);
		});
	
	//Point links - voronoi
	var voronoiData = [];
	scope.game.chart.selectAll("path.vorPath").remove();
	scope.game.chart.selectAll(".vorClip").remove();
	histData.forEach(function(p){
		var x = scope.game.x(p.t);
		var y = ((scope.game.scoreDiff)?
					((p.e != "n")?
						scope.game.y(p.a-p.h):
						scope.game.y(0)
					):
					((p.e != "n")?
						scope.game.y(p[p.e]):
						scope.game.y((p.a+p.h)/2)))
		if (voronoiData.length == 0) {
			voronoiData.push([x,y]);
		} else {
			for(var $vdI=voronoiData.length-1;$vdI>=-1;$vdI--) {
				if ($vdI == -1) {
					voronoiData.push([x,y]);
					break;
				}
				if (voronoiData[$vdI][0] == x ||
						voronoiData[$vdI][1] == y) {
					if (voronoiData[$vdI][0] == x &&
							voronoiData[$vdI][1] == y) {
						voronoiData[$vdI][0] -= 3;
						voronoiData[$vdI][1] -= 3;
						voronoiData.push([x+3,y+3]);
						break;
					}
					else {
						continue;
					}
				}
				else {
					voronoiData.push([x,y]);
					break;
				}
			}
		}
	});
	scope.game.chart.selectAll("clipPath")
		.data(voronoiData)
		.enter().append("svg:clipPath")
		.attr("id", function(d, i) { return gId+"-playvorclip-"+i;})
		.classed("vorClip",true)
		.append("svg:circle")
		.attr('cx', function(d) { return d[0]; })
		.attr('cy', function(d) { return d[1]; })
		.attr('r', 10);
	scope.game.chart.selectAll("path.vorPath")
		.data(d3.geom.voronoi(voronoiData))
		.enter().append("svg:path")
		.classed("vorPath",true)
		.attr("d", function(d,i) { 
			if (!isDef(d)) {
				return "M3000,3000L3001,3001Z";
			}
			return "M" + d.join(",") + "Z"; })
		.attr("id", function(d,i) { 
			return gId+"-playvorpath-"+histData[i].id ; })
		.attr("clip-path", function(d,i) { return "url(#"+gId+"-playvorclip-"+i+")"; })
		.style("fill", function(d,i){return ("hsl("+(i / (voronoiData.length-1) * 720)+",100%,50%)");})
		.style('fill-opacity', 0)
		.on('mouseover',function(d,i){
			var graphPoint = scope.game.chart.select("circle#playpoint-" + histData[i].id + "." + gId)
			if (!graphPoint.classed("transWaiting")){
				graphPoint.transition()
					.duration(graphVars.dispTime/4)
					.attr('r',10)
					.attr('stroke-width',"6px");
				var playText = histData[i].a 
						+ "-" 
						+ histData[i].h 
						+ ": " 
						+ getPlayText(gId,histData[i]);
				var labelCont = scope.game.chart.append("g")
					.attr("id","pointLabel-"+histData[i].id);
				var labelBox = labelCont.append("rect")
					.attr("height",30)
					.classed("playLabelBox",true);
				var labelText = labelCont.append("text")
					.attr("alignment-baseline","middle")
					.text(playText)
					.attr("dy",labelBox.node().getBBox().height/2+1)
					.attr("dx",5);
				labelBox
					.attr("width",labelText.node().getBBox().width+10);
				var labelContX = (voronoiData[i][0]-labelText.node().getBBox().width/2-10);
				if (labelContX + labelText.node().getBBox().width > graphVars.lineGraphWidth) {
					labelContX = graphVars.lineGraphWidth - labelText.node().getBBox().width;
				} else if (labelContX < 0) {
					labelContX = 0;
				}
				var labelContY = voronoiData[i][1] + 45*((voronoiData[i][1] > 45)?-1:1);
				labelCont
					.attr("transform", "translate(" + labelContX + "," + labelContY + ")");
			}
		})
		.on('mouseout',function(d,i){
			var graphPoint = scope.game.chart.select("circle#playpoint-" + histData[i].id + "." + gId)
			if (!graphPoint.classed("transWaiting")){
				graphPoint.transition()
					.duration(graphVars.dispTime/4)
					.attr('r',3)
					.attr('stroke-width',"2px");
			}
			scope.game.chart.select("g#pointLabel-"+histData[i].id)
				.remove();
		});
	
	//Points Key
	var primLabel = (scope.sport.po[pType].l2)?
			scope.sport.po[pType].l2:
			scope.sport.po[pType].l,
		keyData;
	if (scope.sport.po[pType].pl) {
		primLabel += " - " + scope.sport.po[pType].pl
	}
	if (scope.game.lastPType == null) {
		keyData = []
	} else {
		keyData = [{"pType":pType,"label": primLabel}];
		if ((prim != comp && !noSec) || scope.sport.po[pType].fs) {
			keyData.push( {"pType":pType, "label":scope.sport.po[pType].sl} );
		}
	}
	var graphKey = scope.game.chart.selectAll("g.linePointKey."+gId)
		.data(keyData,function(d,i) {return d.pType+i});
	
	graphKey
		.exit()
		.transition().duration(graphVars.dispTime/2)
		.delay(function(d,i) { return graphVars.dispTime/4*(1/3+i/3)})
		.attr("transform",function(d,i){return "translate(-100, "+(40+20*i)+")";})
		.style("opacity",0)
		.remove();
	
	var graphKeyG = graphKey
		.enter()
		.append("g")
		.classed("linePointKey "+gId+" "+pType,true)
		.attr("transform",function(d,i){return "translate(-100, "+(40+20*i)+")";})
		.style("opacity",0);
	
	graphKeyG
		.transition().duration(graphVars.dispTime)
		.delay(function(d,i) { return graphVars.dispTime/2*(4/3+i/3);})
		.style("opacity",1)
		.attr("transform",function(d,i){return "translate(0, "+(40+20*i)+")";});
	
	aH.forEach(function(team,teamI) {
		graphKeyG
			.append("circle")
			.attr("r",function(d,i) {
				if (scope.sport.po[pType].fs && i>0 && teamI<1) {
					return 0;
				}
				return 4;
			})
			.attr("cx",14 + 12*teamI)
			.attr("cy",10)
			.style("fill", function(d,i) {
				if (scope.sport.po[pType].fs && i>0) {
					return 'white';
				}
				return i%2==0 ? "#"+scope.game[team.s].primary : "#"+scope.game[team.s].secondary;
			})
			.style("stroke-width","2px")
			.style("stroke", function(d,i) {
				if (scope.sport.po[pType].fs && i>0) {
					return 'black';
				}
				return "#"+scope.game[team.s].primary;
			});
	});
	graphKeyG
		.append("text")
		.text(function(d){ return d.label; })
		.attr("x", 35)
		.attr("text-anchor", "start")
		.attr("y", 10)
		.attr("dy", ".3em");
	
	//histogram label
	var pTypeFilter = scope.game.lastPType == null ? [] : [scope.sport.po[pType]];
	var histLabels = 
			[scope.game.histChart.selectAll("g.graphTitle."+gId)
				.data(pTypeFilter,function(d) {return d.l}),
			scope.game.splitGraph.selectAll("g.graphTitle."+gId)
				.data(pTypeFilter,function(d) {return d.l}),
			scope.game.playerStatsGraph.selectAll("g.graphTitle."+gId)
				.data(pTypeFilter,function(d) {return d.l})];
	histLabels.forEach(function(histLabel,hLI){
		var labVars = {};
		if (hLI == 2) {
			labVars.xyOut = "0, -10";
			labVars.xyIn = "0, 0";
			labVars.dy = "-.6em";
			labVars.x = 0;
			labVars.ta = "middle";
		}
		else {
			labVars.xyOut = "-100, -10";
			labVars.xyIn = "0, -10";
			labVars.dy = "-.5em";
			labVars.x = 5-margin.left;
			labVars.ta = "start";
		}
		histLabel
			.exit()
			.transition().duration(graphVars.dispTime/2)
			.delay(function(d,i) { return graphVars.dispTime/4*i})
			.attr("transform","translate("+labVars.xyOut+")")
			.style("opacity",0)
			.remove();
	
		histLabel = histLabel
			.enter()
			.append("g")
			.classed("graphTitle "+gId+" "+pType,true)
			.attr("transform","translate("+labVars.xyOut+")")
			.style("opacity",0);
	
		histLabel
			.transition().duration(graphVars.dispTime)
			.delay(function(d,i) { return graphVars.dispTime/2*(1+i/2);})
			.style("opacity",1)
			.attr("transform","translate("+labVars.xyIn+")");
	
		var hLText = histLabel
			.append("text")
			.attr("dy",labVars.dy)
			.attr("x",labVars.x)
			.attr("text-anchor", labVars.ta);
		hLText
			.append("tspan")
			.style("font-weight","bold")
			.text(function(d){
				var l2 = scope.sport.po[pType].l2;
				return ((hLI==2 && l2)? l2 : d.l) + ((labelSing && !(hLI && l2))?"":"s");}
			);
		hLText
			.append("tspan")
			.text(function(d){
				return ((d.pl && !d.fs)?
					(" - "+d.pl+((d.add)?" / ":" - ") + d.sl) : "");
			});
	});
	
	//play split graph
	var splitTeam = {}
	aH.forEach(function(team,teamI){
		splitTeam[team.s] = d3.layout.histogram()
			.bins(scope.sport.split.bins)
			.range([scope.sport.split.rangeMin,scope.sport.split.rangeMax])
			.value(function(p){
				if (scope.sport.split.type == 'play') {
					return getPlayTime(gId,p.id);
				} else if (scope.sport.split.type == 'down') {
					return p.d-.1;
				}
			})
			(histData.filter(function(p) { return p.e == oppAH(team.s,!otherTeam); }))
	});
	var yMin = Math.min(0,
			d3.min(splitTeam[aH[0].s], function(d,i) {
				return reduceData(gId,pType,d,i,aH[0].s,"split");
			}),
			d3.min(splitTeam[aH[1].s], function(d,i) {
				return reduceData(gId,pType,d,i,aH[1].s,"split");
			}),
			0
		);
	var yMax = Math.max(
			d3.max(splitTeam[aH[0].s], function(d,i) {
				return reduceData(gId,pType,d,i,aH[0].s,"split");
			}),
			d3.max(splitTeam[aH[1].s], function(d,i) {
				return reduceData(gId,pType,d,i,aH[1].s,"split");
			})
		);
	var splitY = d3.scale.linear()
		.range([graphVars.histGraphHeight,0])
		.domain([yMin,yMax]);
	scope.game.splitGraph.select('g.x.axis')
		.transition().duration(graphVars.dispTime)
		.attr("transform","translate(0,"
				+(splitY(0))+")");
	aH.forEach(function(team,teamI){
		var splitBars = scope.game.splitGraph.selectAll('rect.splitBar.'+team.s)
			.data(splitTeam[team.s]);
		splitBars
		  .enter()
			.append('rect')
			.attr("class","splitBar "+team.s)
			.attr("x",function(d,i){return scope.game.splitX(i + (teamI/2))+1;})
			.attr("width",function(d) {return scope.game.splitX(1/2)-2})
			.attr("y",function(d) {return graphVars.histGraphHeight;})
			.attr("height", 0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+scope.game[team.s].primary);
		splitBars
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(i); } )
			.attr("y",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"split",function(d) {return splitY(negZero(d));});
			})
			.attr("height",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"split",function(d){return splitY(0)-splitY(Math.abs(d))});
			});
		
		var splitBarsSec = scope.game.splitGraph.selectAll('rect.splitBarSec.'+team.s)
			.data(splitTeam[team.s]);
		splitBarsSec
		  .enter()
			.append('rect')
			.attr("class","splitBarSec "+team.s)
			.attr("x",function(d,i){return scope.game.splitX(i + (teamI/2))+3;})
			.attr("width",function(d) {return scope.game.splitX(1/2)-6})
			.attr("y",function(d) {return graphVars.histGraphHeight;})
			.attr("height", 0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+scope.game[team.s].secondary);
		splitBarsSec
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(i); } )
			.attr("y",function(d,i) {return reduceData(gId,pType,d,i,team.s,"split",function(d) {return splitY(negZero(d))+2;});
			})
			.attr("height",function(d,i) {
				return negZero(reduceData(gId,pType,d,i,team.s,"split",function(d){return splitY(0)-splitY(d)-2},true));
			});
	});
	scope.game.splitYAxis = d3.svg.axis()
		.scale(splitY)
		.orient("left")
		.ticks((yMax<3)?2:4)
		.tickFormat(function(d){return d;});
	scope.game.splitGraph.select("g.y.axis")
		.call(scope.game.splitYAxis);
	
	//player graph
	var playerStats = {}
	playerStats.max = 0;
	playerStats.min = 0;
	aH.forEach(function(team,teamI){
		playerStats[team.s] = [];
		var plStatOrder = {};
		histData.forEach(function(p){
			if (p.e == oppAH(team.s,!otherTeam) && pType != "to" && pType != "top") {
				if (p.m[player] != null) {
					if (!isDef(plStatOrder[p.m[player]])) {
						plStatOrder[p.m[player]] = playerStats[team.s].length;
						playerStats[team.s].push({});
						playerStats[team.s][plStatOrder[p.m[player]]].plays = [];
						playerStats[team.s][plStatOrder[p.m[player]]].name = p.m[player];
					}
					playerStats[team.s][plStatOrder[p.m[player]]].plays.push(p);
				}
			}
		});
		playerStats[team.s].sort(function (a, b) {
			return reduceData(gId, pType, b.plays, null, team.s)
					- reduceData(gId, pType, a.plays, null, team.s);
		});
		if (playerStats[team.s].length > 0) {
			var maxTemp = reduceData(gId, pType, playerStats[team.s][0].plays, null, team.s);
			var minTemp = reduceData(gId, pType, playerStats[team.s][playerStats[team.s].length-1].plays, null, team.s);
			playerStats.max = (maxTemp > playerStats.max) ? maxTemp : playerStats.max;
			playerStats.min = (minTemp < playerStats.min) ? minTemp : playerStats.min;
		}
		if (add) {
			playerStats[team.s].sort(function (a, b) {
				var diff = b.plays.filter(function(d){return comp=="pos" || d.p[primPos] == prim;}).length
						- a.plays.filter(function(d){return comp=="pos" || d.p[primPos] == prim;}).length;
				if (diff == 0) {
					diff = b.plays.length - a.plays.length;
				}
				return diff;
			});
		}
		if (playerStats[team.s].length > 9) {
			playerStats[team.s].length = 9;
		}
	});
	var playerY = d3.scale.linear()
		.range([0,graphVars.histGraphHeight])
		.domain([playerStats.max,playerStats.min]);
	aH.forEach(function(team,teamI){
		var playerBars = scope.game.playerStatsGraph.selectAll("rect.playerBar."+team.l)
			.data(playerStats[team.s],function(p) {return p.name;});
		playerBars
			.enter()
			.append("rect")
			.classed("playerBar",true)
			.classed(team.l,true)
			.attr("x",function(p,pI){
				return ((graphVars.stat10Width+graphVars.stat10Pad)*pI + (margin.right+margin.left)/2) * Math.pow(-1,!teamI) - graphVars.stat10Width*!teamI;
			})
			.attr("y",graphVars.histGraphHeight)
			.attr("width",graphVars.stat10Width)
			.attr("height",0)
			.style("fill","#"+scope.game[team.s].primary);
		playerBars
			.transition()
			.duration(graphVars.dispTime)
			.attr("x",function(p,pI){
				return ((graphVars.stat10Width+graphVars.stat10Pad)*pI + (margin.right+margin.left)/2) * Math.pow(-1,!teamI) - graphVars.stat10Width*!teamI;
			})
			.attr("y",function(d,i){
				return reduceData(gId,pType,d.plays,i,team.s,null,function(d){return playerY(negZero(d));});
			})
			.attr("height",function(d,i){
				return reduceData(gId,pType,d.plays,i,team.s,null,function(d){return playerY(0)-playerY(Math.abs(d))});
			});
		playerBars
			.exit()
			.transition()
			.duration(graphVars.dispTime)
			.attr("y",graphVars.histGraphHeight)
			.attr("height",0)
			.remove();
		var playerLabel = scope.game.playerStatsGraph.selectAll("g.playerText."+team.l)
			.data(playerStats[team.s],function(p) {return p.name;});
		playerLabel
			.enter()
			.append("g")
			.classed("playerText",true)
			.classed(team.l,true)
			.attr("transform",function(p,pI){
				return "translate("
				+ (((graphVars.stat10Width+graphVars.stat10Pad) * pI + (margin.right+margin.left)/2) * Math.pow(-1,!teamI) - graphVars.stat10Width*!teamI + graphVars.stat10Width/2)
				+","
				+graphVars.histGraphHeight
				+")";
			})
			.style("opacity",0)
			.append("text")
			.style("text-anchor",(teamI)?"start":"end")
			.attr("transform","rotate("+(20*Math.pow(-1,!teamI))+")")
			.attr("dy",12)
			.attr("dx",2)
			.text(function(p){
				var nameAr = p.name.split(' ');
				var surname = nameAr.pop().substring(0,4);
				if (nameAr.length > 1 && 
						nameSuffixes.indexOf(surname.toLowerCase()) > -1) {
					surname = nameAr.pop().substring(0,4);
				}
				var given = (nameAr[0])?nameAr[0][0]:false;
				var name = ((given)?nameAr[0][0] + ". ":"") +surname+".";
				return name;});
		playerLabel
			.transition()
			.duration(graphVars.dispTime)
			.style("opacity",1)
			.attr("transform",function(p,pI){
				return "translate("
				+ (((graphVars.stat10Width+graphVars.stat10Pad) * pI + (margin.right+margin.left)/2) * Math.pow(-1,!teamI) - graphVars.stat10Width*!teamI + graphVars.stat10Width/2)
				+","
				+graphVars.histGraphHeight
				+")";
			});
		playerLabel
			.exit()
			.transition()
			.duration(graphVars.dispTime)
			.style("opacity",0)
			.remove();
		var playerSecBars = scope.game.playerStatsGraph.selectAll("rect.playerSecBar."+team.l)
			.data(playerStats[team.s],function(p) {return p.name;});
		playerSecBars
			.enter()
			.append("rect")
			.classed("playerSecBar",true)
			.classed(team.l,true)
			.attr("x",function(p,pI){
				return ((graphVars.stat10Width+graphVars.stat10Pad)*pI + (margin.right+margin.left)/2) * Math.pow(-1,!teamI)-graphVars.stat10Width*!teamI+2;
			})
			.attr("y",graphVars.histGraphHeight+2)
			.attr("width",graphVars.stat10Width-4)
			.attr("height",0)
			.style("fill","#"+scope.game[team.s].secondary);
		playerSecBars
			.transition()
			.duration(graphVars.dispTime)
			.attr("x",function(p,pI){
				return ((graphVars.stat10Width+graphVars.stat10Pad)*pI + (margin.right+margin.left)/2) * Math.pow(-1,!teamI)-graphVars.stat10Width*!teamI+2;
			})
			.attr("y",function(d,i){
				return reduceData(gId,pType,d.plays,i,team.s,null,function(d){return playerY(d)+2});
			})
			.attr("height",function(d,i){
				return negZero(reduceData(gId,pType,d.plays,i,team.s,null,function(d){return playerY(0)-playerY(d)-2},true));
			});
		playerSecBars
			.exit()
			.transition()
			.duration(graphVars.dispTime)
			.attr("y",graphVars.histGraphHeight+2)
			.attr("height",0)
			.remove();
		scope.game.playerYAxis = d3.svg.axis()
			.scale(playerY)
			.orient((teamI)?"left":"right")
			.ticks(4)
			.tickFormat(function(d){return d;});
		scope.game.playerStatsGraph.select("g."+team.s+".axis")
			.call(scope.game.playerYAxis);
	});
}
		///end old code
		}
		return directive;
	});
})();


;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("gameController",["$scope","$routeParams","$http",function($scope,$routeParams,$http){
		var sport,id;
		$scope.mainScope.sportData = null;
		$scope.mainScope.gameData = null;
		if (!$routeParams.id) {
			$scope.mainScope.title = "";
		} else {
			if (!$routeParams.sport && $routeParams.id) {
				console.log($routeParams);
				sport = $routeParams.id.substring(0,3);
				id = $routeParams.id.substring(3,$routeParams.id.length);
			} else {
				sport = $routeParams.sport;
				id = $routeParams.id;
			}
			$scope.mainScope.messageReset();
			$scope.mainScope.messageSet("Loading . . .");
			$http({
				method: "GET",
				url: "./data/"+sport+".json"
			})
			.then(function(response){
					$scope.mainScope.sportData = response.data;
					$scope.sport = response.data;
					getGames();
				},
				function(response){
					$scope.mainScope.sportData = null;
					if (response.status === 404) {
						$scope.mainScope.messageSet("Chosen sport not supported.",true);
					}
				}
			);
			var getGames = function () {
				var apiUrl = "./app/api/getGameData.php?gameId="+sport+id;
				$http({
					method: "GET",
					url: apiUrl,
					transformResponse: function(data, headersGetter) {
						try {
							var jsonObject = JSON.parse(data);
							return jsonObject;
						}
						catch (e) {
							console.error("Invalid data: "+e);
							return {error: "Invalid data"};
						}
					}
				})
				.then(function(response){
						if (response.data.error) {
							$scope.mainScope.messageSet(response.data.error,true)
						} else {
							if (response.data.id === null) {
								response.data.id = sport+id;
							}
							$scope.mainScope.gameData = response.data;
							$scope.game = response.data;
							$scope.mainScope.title = 
								response.data.a.short + ":" +
								response.data.aScore + " " +
								response.data.h.short + ":" +
								response.data.hScore;
							$scope.mainScope.messageReset();
						}
					},
					function(response){
						$scope.mainScope.gameData = null;
						$scope.mainScope.title = "";
						$scope.mainScope.messageSet("Error loading game, please try again.",true);
						///show error
					}
				);
			}
		}
	}]);
})();
;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("popupCtrl", ["$scope","$sce",function($scope,$sce){
		$scope.close = function(){
			$scope.mainScope.popup = null;
		}
	}]);
})();
;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("ssCtrl", ["$scope",function($scope){
		$scope.question = 'question';
		$scope.mainScope = {};
		$scope.mainScope.messageReset = function () {
			$scope.mainScope.message = "";
			$scope.mainScope.messageWarning = false;
		}
		$scope.mainScope.messageSet = function (message, warning) {
			$scope.mainScope.messageReset();
			$scope.mainScope.message = message.toString();
			$scope.mainScope.messageWarning = !!warning;
		}
	}]);
})();
;(function(){
	"use strict";
	angular.module("ssCtrls")
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider    
		.when('/:sport/game/:id', {
			templateUrl: '/views/game/game.html',
			controller: 'gameController',
			controllerAs: 'game',
			caseInsensitiveMatch: true
		})
		.when('/:id', {
			templateUrl: '/views/game/game.html',
			controller: 'gameController',
			controllerAs: 'game'
		})
		.otherwise({
			templateUrl: '/views/game/game.html',
			controller: 'gameController',
			controllerAs: 'game'
		});

		//$locationProvider.html5Mode(true);
	}]);
})();
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
;(function(){
	"use strict";
	angular.module("ssCtrls")
	.controller("scheduleCtrl",["$scope",function($scope){
		$scope.openSchedule = function() {
			$scope.mainScope.popup = {
				id: "schedule",
				directive: "popup-schedule"
			};
		}
	}]);
})();
;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive('boxScore', function() {
		return {
			templateUrl: '/views/game/boxScore.html'
		};
	});
})();
;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive("compilePopup",["$compile","$sanitize",function($compile,$sanitize) {
		return function(scope,element,attrs) {
			scope.$watch(
				function(scope) {
					return scope.$eval(attrs.compilePopup);
				},
				function (value) {
					if (value) {
						var regex = /^[a-z0-9-]+$/i;
						if (value.directive && regex.test(value.directive)) {
							var directive = "<"+value.directive+"></"+value.directive+">";
							element.html(directive);
							$compile(element.contents())(scope);
							
							value.displayed = true;
						}
					}
				}
			);
		}
	}]);
})();
;(function(){
	"use strict";
	angular.module("ssDirectives")
	.directive('popupSchedule', function() {
		return {
			templateUrl: '/views/popupSchedule.html',
			controller: 'popupScheduleCtrl'
		};
	});
})();
;(function(){
	"use strict";

	angular.module("ssFilters")
		.filter("printedTime",function(){
			return function(input, scope) {
				if (scope) {
					if (scope.game && scope.sport) {
						if (scope.game.totTime && scope.sport.q) {
							var totPeriods = scope.game.boxScore.length,
								n = scope.sport.q.n,
								time;
							input = +input;

							while (totPeriods > n && input > scope.sport.q.o) {
								totPeriods--;
								input -= scope.sport.q.o;
							}
							while (totPeriods > 0 && input > scope.sport.q.t) {
								totPeriods--;
								input -= scope.sport.q.t;
							}

							if (input == 0) {
								if (totPeriods === scope.game.boxScore.length && scope.game.aScore != scope.game.hScore) {
									return "Final";
								}
								else {
									time = "End";
								}
							} else {
								time = secondsToTime(input);
							}
							return time + " " + scope.game.boxScore[totPeriods-1].l;
						}
					}
				}
				return input;


				var secondsToTime = function (totSeconds) {
					var seconds = totSeconds%60;
					var minutes = (totSeconds-seconds)/60;
					seconds = (seconds < 10) ? "0"+seconds : seconds;
					return = minutes + ":" + seconds;
				}
			}
		});
})();
;(function(){
	"use strict";

	angular.module("ssFilters")
		.value("ssSiteName","Act Opener")
		.filter("pageTitle",["ssSiteName",function(ssSiteName){
			return function(input) {
				if (input && input.length) {
					return input + " | " + ssSiteName;
				} else {
					return ssSiteName;
				}
			}
		}]);
})();