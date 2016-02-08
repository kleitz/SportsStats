;(function() {
"use strict";

var games = {};
var sports = {};
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
	
	d3.select("div#popup")
		.on("click",closePopup);
	
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
d3.select(window).on("hashchange",function(){
	if (d3.select("div.gameBox").attr("id")) {
		d3.selectAll("."+d3.select("div.gameBox").attr("id")).remove();
	}
	d3.select("div.gameBox").
		attr("id",location.hash.substring(1));
	loadGames();
});
loadGames();

function loadGames(){
	d3.selectAll("div.gameBox.notLoaded")
		.forEach(function(d){
			insertGameInput(d[0]);
			if (d[0].id.length != 0)
				loadSport(d[0].id);
			else {
				if (location.hash.length) {
					d[0].id = location.hash.substring(1);
					loadSport(d[0].id);
				}
			}
		});
}
function inputGame(input,callback,errorCallback) {
	var id,sport;
	if (input.match(/^([a-z]{3})(\d+)$/)) {
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
		location.hash = "#"+sport+id;
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
		colors[team.s] = hexToRgb(games[gId][team.s].primary);
		if (!colors[team.s]) {
			return;
		}
	});
	var difTot = 0;
	for (var rgbI=0; rgbI<colors[aH[0].s].length; rgbI++) {
		difTot += Math.abs(colors[aH[0].s][rgbI]-colors[aH[1].s][rgbI]);
	}
	if (difTot < 150) {
		var tempColor = games[gId]['h'].secondary;
		var tempColorRgb = hexToRgb(tempColor);
		if (tempColorRgb) {
			if (tempColorRgb.reduce(function(a,b){return a+b;}) > 612) {
				tempColor = "CCCCCC";
			}
		}
		games[gId]['h'].secondary = games[gId]['h'].primary;
		games[gId]['h'].primary = tempColor;
	}
}

//load data for that particular sport
function loadSport (gId) {
	addLoader(gId);
	if (isDef(sports[gId.substring(0,3)])) {
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
			sports[gId.substring(0,3)] = data;
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
		.data(sports[gId.substring(0,3)].p)
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
		.text(function(p) { return sports[gId.substring(0,3)].po[p].l+((p!="top")?"s":"")	; });
	titleDiv.select("div.tSLabelCont").append("br");
	titleDiv.select("div.tSLabelCont").append("span")
		.text(function(p,i){ if (sports[gId.substring(0,3)].po[p].pl && !sports[gId.substring(0,3)].po[p].fs) return sports[gId.substring(0,3)].po[p].pl + ((sports[gId.substring(0,3)].po[p].add)?" / ":" - ") + sports[gId.substring(0,3)].po[p].sl});
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
			.style("fill","#"+games[gId][team.s].primary);
		//create sec stat bar
		statSvg.append("rect")
			.classed("statBarSec "+team.l,true)
			.attr("y",1+((1+graphVars.teamStatHeight)*teamI)+2)
			.attr("height",graphVars.teamStatHeight-4)
			.attr("x", -2)
			.attr("width", 0)
			.style("fill","#"+games[gId][team.s].secondary);
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
	sports[gId.substring(0,3)].p.forEach(function(p){
		tRow.append("td")
			.classed("thead",true)
			.classed("teamStatMin",true)
			.classed("col"+p,true)
			.attr("title",sports[gId.substring(0,3)].po[p].l+"s")
			.text(sports[gId.substring(0,3)].po[p].a)
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
			.text(games[gId][team.s].teamName);
		sports[gId.substring(0,3)].p.forEach(function(p){
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
	if (sports[gId.substring(0,3)].p.length%2 == 1) {
		d3.select("div.teamStats." + gId)
			.append("div")
			.classed("teamStatFill " + gId,true)
	}
	
	createShowDisp(gId,"teamStats","team stats",false,"teamStatsMin");
}

//graph static team stats
function graphTeamStats(gId) {
	var sPL = sports[gId.substring(0,3)].p;//sportsPlayList
	var sPO = sports[gId.substring(0,3)].po;
	sPL.forEach(function(p,pI){
		var teamStatData = {};
		//collect data for each play type
		aH.forEach(function(team){
			teamStatData[team.s] = games[gId].plays.filter(
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
			plays = games[gId]["playsTot"+teamS];
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
				plays = games[gId]["plays"+teamS][args.index];
			} else if (args.type == "split") {
				plays = games[gId]["playsSplit"+teamS][args.index];
			} else {
				plays = games[gId]["playsTot"+teamS];
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
	if (play == games[gId].plays[pId]) {
		return 0;
	} else {
		return ((games[gId].plays[pId].t - play.t)*direction);
	}
}

function getNextPos(gId,pId,direction) {
	if((direction)?pId<games[gId].plays.length-1:pId>0) {
		direction = (direction)?1:-1;
		var id = pId;
		for(id+=direction;!games[gId].plays[id].x;id+=direction){}
		return games[gId].plays[id];
	} else {
		return games[gId].plays[pId];
	}
}

//load and set game data
function loadGame (gId) {
	if (!isDef(games[gId])) {
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
			games[gId] = game;
		
			dispGame()
		});
	}
	else {
		dispGame();
	}
	function dispGame() {
		stopLoader(gId);
		colorTest(gId);
		displayTitleScore(gId);
		addSplitButtons(gId);
		setMainGraph(gId);
		addTeamStats(gId);
		addPlayerStats(gId);
		addSplitGraph(gId);
		addPlayByPlay(gId);
		countPlays(gId);
		plotScore(gId);
		graphAll(gId, sports[gId.substring(0,3)].p[0], graphVars.graphTime);
	}
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
	sports[gId.substring(0,3)].ave.forEach(function(ave){
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
		.on("click",function(){return graphAll(gId, games[gId].lastPType, 0);});
}

function graphAll(gId,pType,time) {
		graphTeamStats(gId);
		if (pType == games[gId].lastPType) {
			games[gId].lastPType = null;
		}
		setTimeout(function(){
			if (games[gId].lastPType == null
					&& pType !== null) {
				plotHist(gId,pType);
			}
		},time);
}

function countPlays(gId){
	var split = sports[gId.substring(0,3)].split;
	var pos = sports[gId.substring(0,3)].pos;
	aH.forEach(function(team,teamI){
		games[gId]["plays"+team.s] = d3.layout.histogram()
			.bins(games[gId].totTime/sports[gId.substring(0,3)].s)
			.range([0,games[gId].totTime])
			.value(function(p){return p.t;})(games[gId].plays.filter(function(p){
				return p.x && p[pos] == team.s;
			}));
		games[gId]["plays"+team.s].forEach(function(d,i){
			games[gId]["plays"+team.s][i] = d.length;
		});
		games[gId]["playsSplit"+team.s] = d3.layout.histogram()
			.bins(split.bins)
			.range([split.rangeMin,split.rangeMax])
			.value(function(p){return getPlayTime(gId,p.id,true);})
			(games[gId].plays.filter(
				function(p){
				return p.x && p[pos] == team.s;
			}));
		games[gId]["playsSplit"+team.s].forEach(function(d,i){
			games[gId]["playsSplit"+team.s][i] = d.length;
		});
		games[gId]["playsTot"+team.s] = games[gId].plays.filter(function(p){
			return p.x && p[pos] == team.s;
		}).length;
		//some shots at the buzzer hit after 35 seconds
		games[gId]["playsSplit"+team.s][split.bins-1] += games[gId]["playsTot"+team.s] - games[gId]["playsSplit"+team.s].reduce(function(a,b){return a+b;});
	});
}

function setMainGraph(gId) {
	//set svgs
	games[gId].histChart = d3.select("div#"+gId)
		.append("svg")
		.attr("width", graphVars.histGraphWidth + margin.left + margin.right)
		.attr("height", graphVars.histGraphHeight + margin.histTop + margin.histBottom)
		.attr("id","histChart"+gId)
		.classed(gId,true)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.histTop + ")");
	
	games[gId].chart = d3.select("div#"+gId)
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
		.text(sports[gId.substring(0,3)].split.title);
	games[gId].splitGraph = splitGraphCont.append("svg")
		.attr("width", graphVars.histGraphWidth + margin.left + margin.right)
		.attr("height", graphVars.histGraphHeight + margin.histTop + margin.bottom)
		.attr("id","splitGraph"+gId)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.histTop + ")");
	games[gId].splitX = d3.scale.linear()
		.range([1, graphVars.histGraphWidth])
		.domain([sports[gId.substring(0,3)].split.rangeMin,sports[gId.substring(0,3)].split.bins]);
	games[gId].splitXAxis = d3.svg.axis()
		.scale(games[gId].splitX)
		.orient("bottom")
		.ticks(sports[gId.substring(0,3)].split.bins+1)
		.tickFormat(function(d){
			if (sports[gId.substring(0,3)].split.reverse) {
				return sports[gId.substring(0,3)].split.rangeMax - d / sports[gId.substring(0,3)].split.bins * sports[gId.substring(0,3)].split.rangeMax;
			} else {
				return d / sports[gId.substring(0,3)].split.bins * sports[gId.substring(0,3)].split.rangeMax;
			}
		});
	games[gId].splitGraph.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphVars.histGraphHeight + ")")
		.call(games[gId].splitXAxis);
	games[gId].splitGraph.append("g")
		.attr("class", "y axis");
	createShowDisp(gId,"splitGraphCont",sports[gId.substring(0,3)].split.title.toLowerCase(),false);
}

function addPlayByPlay(gId) {
	var pbpCont = d3.select("div#"+gId)
		.append("div")
		.classed(gId,true)
		.attr("id","pbpCont"+gId)
		.append("table")
		.classed("fullWidth",true);
	games[gId].plays.forEach(function(p,pI){
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
			if (p.p[0] == 'e' && pI!=games[gId].plays.length-1) {
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
			.text(games[gId][aH[0].s].teamName)
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
			.text(games[gId][aH[1].s].teamName)
			.classed("pbp",true)
			.classed("pbpHead",true)
			.classed("center",true);
	}
	
	createShowDisp(gId,"pbpCont","full play-by-play",true);
}

function getDispTime(gId,p) {
	var dispTime = "";
	if (p.p[0] == 'e') {
		return "0:00"+" "+games[gId].boxScore[p.q-1].l;
	}
	var t = getMinutes(gId,p.t);
	dispTime += Math.trunc(t.t/60) + ":";
	dispTime += (t.t%60 < 10)? "0"+(t.t%60):t.t%60;
	return dispTime+" "+games[gId].boxScore[t.p].l;
}

function getPlayText(gId,play) {
	var sport = gId.substring(0,3);
	var playText = sports[sport].pt[play.p[0]];
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
					playAr.push(games[gId][play.e].teamName);
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
	if (play == games[gId].plays[games[gId].plays.length-1] &&
			oI == "e") {
		playAr.pop();
		playAr.push("game.");
	}
	return playAr.join(" ");
}

//display headline score and teams
function displayTitleScore(gId) {
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
			.style("border-color","#"+games[gId][team.s].primary)
			.append("div")
			.classed("larTitle "+gId+" "+team.l, true)
			.classed("bottomText",true)
			.classed("fullWidth",true)
			.text(games[gId][team.s].teamName);
	});
	var bSCont = bS
		.append("div")
		.classed("bSCont",true);
	bSCont.append("div")
		.classed("bSDateLoc",true)
		.classed("fullWidth center",true)
		.html(games[gId].gameDate+"<br>"+games[gId].venue.venueName+", "+games[gId].venue.city+", "+games[gId].venue.state);
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
			.text(games[gId][team.s+"Score"]);
	})
	var bSTable = bSLower
		.append("table")
		.classed("bSTable",true);
	aH.unshift({s:"period"});
	aH.forEach(function(team,teamI) {
//		if (games[gId].boxScore.length > 3)
		var bSTR = bSTable.append("tr");
		bSTR.append("td")
			.classed("bold",true)
			.classed("thead",!teamI)
			.text(function(){
				if (teamI) {
					return games[gId][team.s].short;
				} else if (games[gId].final) {
					return "Final"
				} else {
					var lastPlay = games[gId]
						.plays[
							games[gId].plays.length-1
						];
					return minToTime(lastPlay.t)
						+ " "
						+ games[gId].boxScore[
							lastPlay.q-1].l;
				}
			});
		var otTot = 0;
		games[gId].boxScore.forEach(function(bS,bSI){
			if (bS.ot && bSI != games[gId].boxScore.length-1 && games[gId].boxScore.length>5) {
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
					return games[gId][team.s+"Score"];
				}
			});
	});
	aH.shift();
}

function addPlayerStats(gId) {
	var playerStatsSvg = d3.select("div#"+gId)
		.append("div")
		.attr("id","playerStatsGraph"+gId)
		.classed(gId,true)
		.append("svg")
		.attr("width", graphVars.histGraphWidth + margin.left + margin.right)
		.attr("height", graphVars.histGraphHeight + margin.bottom + margin.top);
	games[gId].playerStatsGraph = playerStatsSvg
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
		games[gId].playerStatsGraph.append("g")
			.attr("class", team.s+" axis");
	});
	
	var sPO = sports[gId.substring(0,3)].po;
	games[gId].players = {};
	var playerStatsTable = d3.select("div#"+gId)
		.append("div")
		.classed("playerStats",true)
		.classed(gId,true)
		.attr("id","playerStats"+gId)
		.append("table")
		.classed("playerStatsT",true);
	
	aH.forEach(function(team) {
		games[gId].players[team.s] = {};
		games[gId].players[team.s].ps = [];
		games[gId].plays.forEach(function(p){
				if(p.e == team.s && p.m) {
					p.m.forEach(function(player) {
						if (!games[gId].players[team.s][player]) {
							games[gId].players[team.s].ps.push(player);
							games[gId].players[team.s][player] = [];
						}
						games[gId].players[team.s][player].push(p);
					});
				}
		});
		var playerRow = playerStatsTable.append("tr");
		playerRow.append("td")
			.classed("thead",true)
			.text(games[gId][team.s].teamName);
		sports[gId.substring(0,3)].p.forEach(function(p){
			if(p!="top" && p!="to") {
				playerRow.append("td")
					.classed("thead",true)
					.attr("title",sPO[p].l+"s")
					.text(sPO[p].a + ((sPO[p].ad)?" ("+sPO[p].ad+")":""));
			}
		});
		games[gId].players[team.s].ps.forEach(function(player){
			playerRow = playerStatsTable.append("tr")
				.classed("hover",true);
			playerRow.append("td").text(player);
			sports[gId.substring(0,3)].p.forEach(function(p){
				if(p!="top" && p!="to") {
					var mainRegExp = new RegExp(sPO[p].c,"i");
					var totPlays = games[gId].players[team.s][player].filter(function(play){
						return (isData(gId,play.id,p) 
								&& player == games[gId].plays[play.id].m[(sPO[p].player)?sPO[p].player:0]);
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
	if(d3.select("#"+obId+gId)[0][0]) {
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
	var period = games[gId].boxScore.length-1;
	for(var boxI = games[gId].boxScore.length-1; boxI>=0; boxI--) {
		var b = games[gId].boxScore[boxI];
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
	var mOG = games[gId].chart.append("g")
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
	var lineKey = games[gId].chart.append("g")
		.attr("class", "lineKey " + gId);
	aH.forEach(function(team, teamI) {
		lineKey.append("line")
			.attr("x1", 10)
			.attr("x2", 30)
			.attr("y1", 10 + teamI*20)
			.attr("y2", 10 + teamI*20)
			.style("stroke-width",5)
			.style("stroke", "#"+games[gId][team.s].primary)
			.style("shape-rendering", "crispEdges");
		lineKey.append("text")
			.text(games[gId][team.s].teamName)
			.attr("x", 35)
			.attr("text-anchor", "start")
			.attr("y", 10 + teamI*20)
			.attr("dy", ".3em");
	});
	
	//setup domain
	var yMax = 10*Math.ceil(Math.max(d3.max(games[gId].plays, function(p) { return p.a; }), d3.max(games[gId].plays, function(p) { return p.h; }))/10);
	games[gId].x = d3.scale.linear()
		.range([0, width])
		.domain([games[gId].totTime,0]);
	games[gId].xAxisScale = d3.scale.linear()
		.range([0, width])
		.domain([games[gId].totTime/sports[gId.substring(0,3)].s,0]);

	games[gId].y = d3.scale.linear()
		.range([height, 0])
		.domain([-10, yMax]);
	//axes are printed after mouse over g
	
	//add score diff links - needs to be over mOG for link reasons
	var scoreDiff = games[gId].chart.append("g")
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
		.on("click",function(){switchScoreDiff(gId,this);graphAll(gId, games[gId].lastPType, 0);});
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
		.on("click",function(){switchScoreDiff(gId,this);graphAll(gId, games[gId].lastPType, 0);});
	
	//bisect time
    games[gId].bisectTime = d3.bisector(function(p) {
    	return games[gId].totTime - p.t; 
    });
	
	//create mouseover
	d3.select("svg#chart"+gId)
		.on("mousemove",function(){
			var mouseT = games[gId].x.invert(d3.mouse(this)[0]-margin.left);
			if (mouseT < 0) {
				mouseT = 0;
			} else if (mouseT > games[gId].totTime) {
				mouseT = games[gId].totTime;
			}
			mOG.attr("transform","translate("+games[gId].x(mouseT)+",0)");
			var perTime = getMinutes(gId,mouseT);
			var time = minToTime(perTime.t);
			var pID = games[gId].bisectTime.left(games[gId].plays, games[gId].totTime - mouseT,1);
			var scoreText = "";
			aH.forEach(function(team){
				scoreText += games[gId][team.s].short + ":";
				scoreText += games[gId].plays[pID-1][team.s] + " ";
			});
			var text = mOG.select("text")
				.text(scoreText+"- "+time+" "+games[gId].boxScore[perTime.p].l);
			var textSize = text.node().getBBox();
			if (games[gId].x(mouseT) + textSize.width/2 > graphVars.lineGraphWidth) {
				text.attr("dx", graphVars.lineGraphWidth - (games[gId].x(mouseT) + textSize.width/2));
			} else if (games[gId].x(mouseT) - textSize.width/2 < 0) {
				text.attr("dx", textSize.width/2-games[gId].x(mouseT));
			} else {
				text.attr("dx",0);
			}
			
		})
		.on("mouseover",function(){mOG.style("display",null)})
		.on("mouseout",function(){mOG.style("display","none")});
	
	//display axes (on top of mouse over g)
	games[gId].xAxis = d3.svg.axis()
		.scale(games[gId].xAxisScale)
		.orient("bottom")
		.tickFormat(function(d,i) { 
			var perTime = getMinutes(gId,d*sports[gId.substring(0,3)].s);
			if(games[gId].boxScore[perTime.p].t == perTime.t) {
				return games[gId].boxScore[perTime.p].l;
			} else {
				return (perTime.t/60) + ":00";
			}
		});
	
	games[gId].yAxis = d3.svg.axis()
		.scale(games[gId].y)
		.orient("left");
	
	games[gId].histXAxis = d3.svg.axis()
		.scale(games[gId].xAxisScale)
		.orient("bottom")
		.tickFormat("");
	
	displayClip(gId,graphVars.graphTime);
	
	//create plot axes
	games[gId].chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(games[gId].xAxis);
	games[gId].chart.append("g")
		.attr("class", "y axis "+gId)
		.call(games[gId].yAxis);
	
	games[gId].histChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphVars.histGraphHeight + ")")
		.call(games[gId].histXAxis);
	
	//create replay buttons
	graphVars.replayTimes.forEach(function(timeInS,i){
		var replayButton = games[gId].chart
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
	
	games[gId].lineData = {a:[],h:[]};
	//set up score paths
	games[gId].line = {a:d3.svg.line()
		.x(function(p) { return games[gId].x(p.t); })
		.y(function(p) { return games[gId].y(p.a); }),
		h:d3.svg.line()
		.x(function(p) { return games[gId].x(p.t); })
		.y(function(p) { return games[gId].y(p.h); })};
	aH.forEach(function(team){
		games[gId].chart
				.append("path")
				.attr("class", "line")
				.attr("id","line"+gId+team.s)
				.attr("stroke-width","2px")
				.attr("stroke", "#"+games[gId][team.s].primary)
				.attr("clip-path", "url(#graphClip"+gId+")");
	});
	games[gId].chart.append("line")
		.attr("x1",games[gId].x(0))
		.attr("x2",games[gId].x(games[gId].totTime))
		.attr("y1",games[gId].y(0))
		.attr("y2",games[gId].y(0))
		.style("stroke","black")
		.style("stroke-width",2)
		.style("display","none")
		.attr("id","diffMidLine"+gId);
	plotLine(gId);
}

//plot score line
function plotLine(gId) {
	var yMax,yMin;
	var sc = sports[gId.substring(0,3)].score;
	if (games[gId].scoreDiff) {
		yMin = 10*Math.floor(d3.min(games[gId].plays, function(p) { return p.a-p.h; })/10);
		if (yMin == 0) {
			yMin = -10;
		}
		yMax = 10*Math.ceil(d3.max(games[gId].plays, function(p) { return p.a-p.h; })/10);
		if (yMax == 0) {
			yMax = 10;
		}
	} else {
		yMin = 0;
		yMax = 10*Math.ceil(Math.max(d3.max(games[gId].plays, function(p) { return p.a; }), d3.max(games[gId].plays, function(p) { return p.h; }))/10);
	}
	games[gId].y = d3.scale.linear()
		.range([height, 0])
		.domain([yMin, yMax]);
	games[gId].yAxis = d3.svg.axis()
		.orient("left")
		.scale(games[gId].y)
		.tickFormat(function(d){return Math.abs(d)});
	d3.select(".y.axis."+gId)
		.call(games[gId].yAxis);
	games[gId].lineData["a"].length = 0;
	games[gId].lineData["h"].length = 0;
	//create plot path data (extra points to make it square)
	games[gId].plays.forEach(function(play,playI) {
		if (isData(gId,play.id,'pt') ||
				playI==0 || playI == games[gId].plays.length-1) {
			if (games[gId].scoreDiff) {
				aH.forEach(function(team) {
					if(playI!=0){
						var score = {
							h: games[gId].plays[playI-1].h-games[gId].plays[playI-1].a,
							a: games[gId].plays[playI-1].a-games[gId].plays[playI-1].h
						}
						if (score[team.s]<0) {
							score[team.s]=0;
						}
						games[gId].lineData[team.s].push({
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
					games[gId].lineData[team.s].push({
						t: play.t,
						h: -score.h,
						a: score.a,
						q: play.q
					});
				});
			} else {
				aH.forEach(function(team) {
					if(playI!=0){
						games[gId].lineData[team.s].push({
							t: play.t,
							h: games[gId].plays[playI-1].h,
							a: games[gId].plays[playI-1].a,
							q: play.q
						});
					}
					games[gId].lineData[team.s].push(play);
				});
			}
		}
	});
	
	//plot score path
	aH.forEach(function(team) {
		d3.select("#line"+gId+team.s)
			.datum(games[gId].lineData[team.s])
			.transition().duration(graphVars.dispTime)
			.attr("d",games[gId].line[team.s]);
	});
	
	if (games[gId].scoreDiff) {
		d3.select("#diffMidLine"+gId)
			.attr("y1",games[gId].y(0))
			.attr("y2",games[gId].y(0))
			.style("display",null);
	} else {
		d3.select("#diffMidLine"+gId)
			.style("display","none");
	}
}

function isData(gId,pId,pType,isPrim) {
	var play = games[gId].plays[pId];
	var sport = gId.substring(0,3);
	var comp = sports[sport].po[pType].c;
	var mPos = sports[sport].po[pType].mp;
	var prim = sports[sport].po[pType].p;
	var primPos = sports[sport].po[pType].pp;
	var primDat = sports[sport].po[pType].pd;
	var noSec = sports[sport].po[pType].ns;
	var nextPlay = sports[sport].po[pType].np;
	prim = (!isDef(prim)) ? comp : prim;
	var compRegExp = new RegExp(comp,"i");
	var primRegExp = new RegExp(prim,"i");
	var mainBool;
	if(comp == "pos"){
		return play.x;	
	} else {
		var dv = (sports[sport].po[pType].dv) ? sports[sport].po[pType].dv : 'p';
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
			var nP = games[gId].plays[pId+1];
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
	var comp = sports[sport].po[pType].c;
	var prim = sports[sport].po[pType].p;
	var defPosP = sports[sport].po[pType].dpp; //primary is defense, mainly for per possession calculation
	var defPosS = sports[sport].po[pType].dps;
	var primSum = sports[sport].po[pType].sum;
	var primPos = sports[sport].po[pType].pp;
	var mPos = sports[sport].po[pType].mp;
	var primVal = sports[sport].po[pType].pv;
	var primValPos = sports[sport].po[pType].pvp;
	var noSec = sports[sport].po[pType].ns;
	var playDir = sports[sport].pd;
	var splitTime = sports[sport].s;
	var dataValue = (sports[sport].po[pType].dv)?sports[sport].po[pType].dv:'p';
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
		} else if (comp=="pos" && (gType!="split" || sports[sport].split.top)) {
			//calculating time of possession
			if (gType != 'tot' && !isSec) {
				var finTime = gIndex*splitTime;
				var startTime = (gIndex+1)*splitTime;
				var pId = games[gId].bisectTime[
					(playDir?'right':'left')](games[gId].plays, games[gId].totTime - ((playDir)?startTime:finTime),0);
				var prevPos = getNextPos(gId,pId,false);
				var nextPos = (games[gId].plays[pId].x)? games[gId].plays[pId]: getNextPos(gId,pId,true);
				if (((playDir)?prevPos.e:nextPos.e) == teamS &&
						((playDir && startTime != games[gId].totTime) ||
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
		sPOT = sports[sport].po[pType],
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
		games[gId].scoreDiff = (links[0]=="D");
		plotLine(gId);
	}
}

function displayClip(gId,time) {
	//clip for point path and points
	var clipRect = games[gId].chart
		.select("#graphClip"+gId);
	if (clipRect[0][0] != null) {
		clipRect.remove();
		if (time != false) {
			games[gId].chart.selectAll("circle.point."+gId).remove();
			//only display points if user has not cleared data
			if (games[gId].lastPType != null) {
				plotHist(gId, games[gId].lastPType, time);
			}
		}
	}
	games[gId].chart.append("clipPath")
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
	var sPO = sports[sport].po[pType];
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
	games[gId].chart.selectAll("circle.transWaiting.point."+gId)
		.remove();
	
	//create comparisons	
	var compRegExp = new RegExp(comp,"i");
	var primRegExp = new RegExp(prim,"i");
	
	var histData = games[gId].plays.filter(function(p,pI) {
		if (pType == games[gId].lastPType && !dispTime) {
			return false;
		}
		return isData(gId,pI,pType);
	});
	
	//if user pressed same button again
	if (pType == games[gId].lastPType && !dispTime) {
		games[gId].lastPType = null;
	} else {
		displayClip(gId,0)
		games[gId].lastPType = pType;
		d3.select("#"+gId+"_"+pType)
			.classed("active",true);
		d3.select("#teamStatsMin"+gId)
			.selectAll(".col"+pType)
			.classed("active",true);
	}
	
	var histTeam = {}
	aH.forEach(function(team,teamI){
		histTeam[team.s] = d3.layout.histogram()
			.bins(games[gId].totTime/sports[gId.substring(0,3)].s)
			.range([0,games[gId].totTime])
			.value(function(p){return p.t;})(histData.filter(function(p) { return p.e == oppAH(team.s,!otherTeam); }))
	});
		
	var histX = d3.scale.linear()
		.range([1, graphVars.histGraphWidth+1])
		.domain([games[gId].totTime,0]);
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
	games[gId].histChart.select('g.x.axis')
		.transition().duration(graphVars.dispTime)
		.attr("transform","translate(0,"
				+(graphVars.histGraphHeight-histY(0))+")");
	
	//display bars
	aH.forEach(function(team,teamI) {
		var chartBars = games[gId].histChart.selectAll('rect.p.'+team.s)
			.data(histTeam[team.s]);
		chartBars
		  .enter()
			.append('rect')
			.attr("class","p "+team.s)
			.attr("x",function(d,i){return histX(d.dx*i + d.dx/2*(2-teamI));})
			.attr("width",function(d) {return histX(games[gId].totTime-d.dx/2)-2;})
			.attr("y",graphVars.histGraphHeight)
			.attr("height",0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+games[gId][team.s].primary);
		
		chartBars
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(histTeam[team.s].length-i); } )
			.attr("y",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"time",function(d){return graphVars.histGraphHeight-histY(negZero(d));});
			})
			.attr("height",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"time",function(d){return histY(Math.abs(d)) - histY(0);});
			});
		
		var textFields = games[gId].histChart.selectAll('text.p.'+team.s)
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
		var secBars = games[gId].histChart.selectAll('rect.s.'+team.s)
			.data(histTeam[team.s]);
		secBars
		  .enter()
			.append('rect')
			.attr("class","s "+team.s)
			.attr("x",function(d,i){return histX(d.dx*i + d.dx/2*(2-teamI))+2;})
			.attr("width",function(d) {return histX(games[gId].totTime-d.dx/2)-6;})
			.attr("y",graphVars.histGraphHeight)
			.attr("height",function(d) {return 0;})
			.style("fill","#"+games[gId][team.s].secondary)
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
	var graphPoint = games[gId].chart.selectAll("circle.point."+gId)
		.data(histData,function(p) {return p.id;});
	var prevGraphPoints = games[gId].chart.selectAll("circle.point."+gId);
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
					return (isData(gId,p.id,pType,true)) ? "#"+games[gId][p.e].primary : "#"+games[gId][p.e].secondary;
				}
				return "white";
			})
		.attr("cy",function(p) {
				if (games[gId].scoreDiff) {
					if (p.e != "n") {
						return games[gId].y(p.a-p.h);
					}
					else {
						return games[gId].y(0);
					}
				} else {
					if (p.e != "n") {
						return games[gId].y(p[p.e]);
					}
					else {
						return games[gId].y((p.a+p.h)/2);
					}
				}
			})
	
	graphPoint
		.enter()
		.append("circle")
		.attr("class","point " + gId)
		.attr("id",function(p){return "playpoint-"+p.id;})
		.attr("cx",function(p) {return games[gId].x(p.t);})
		.attr("cy",function(p) {
				if (games[gId].scoreDiff) {
					if (p.e != "n") {
						return games[gId].y(p.a-p.h);
					}
					else {
						return games[gId].y(0);
					}
				} else {
					if (p.e != "n") {
						return games[gId].y(p[p.e]);
					}
					else {
						return games[gId].y((p.a+p.h)/2);
					}
				}
			})
		.attr("r",function(){return (dispTime)?0:30;})
		.style("opacity",function(){return (dispTime)?1:0;})
		.style("fill",function(p) {
				if (p.e != "n") {
					return (isData(gId,p.id,pType,true)) ? "#"+games[gId][p.e].primary : "#"+games[gId][p.e].secondary;
				}
				return "white";
			})
		.style("stroke",function(p) {
				if (p.e != "n") {
					return "#"+games[gId][p.e].primary;
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
				return (games[gId].totTime - p.t)/games[gId].totTime*dispTime;
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
	games[gId].chart.selectAll("path.vorPath").remove();
	games[gId].chart.selectAll(".vorClip").remove();
	histData.forEach(function(p){
		var x = games[gId].x(p.t);
		var y = ((games[gId].scoreDiff)?
					((p.e != "n")?
						games[gId].y(p.a-p.h):
						games[gId].y(0)
					):
					((p.e != "n")?
						games[gId].y(p[p.e]):
						games[gId].y((p.a+p.h)/2)))
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
	games[gId].chart.selectAll("clipPath")
		.data(voronoiData)
		.enter().append("svg:clipPath")
		.attr("id", function(d, i) { return gId+"-playvorclip-"+i;})
		.classed("vorClip",true)
		.append("svg:circle")
		.attr('cx', function(d) { return d[0]; })
		.attr('cy', function(d) { return d[1]; })
		.attr('r', 10);
	games[gId].chart.selectAll("path.vorPath")
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
			var graphPoint = games[gId].chart.select("circle#playpoint-" + histData[i].id + "." + gId)
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
				var labelCont = games[gId].chart.append("g")
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
			var graphPoint = games[gId].chart.select("circle#playpoint-" + histData[i].id + "." + gId)
			if (!graphPoint.classed("transWaiting")){
				graphPoint.transition()
					.duration(graphVars.dispTime/4)
					.attr('r',3)
					.attr('stroke-width',"2px");
			}
			games[gId].chart.select("g#pointLabel-"+histData[i].id)
				.remove();
		});
	
	//Points Key
	var primLabel = (sports[gId.substring(0,3)].po[pType].l2)?
			sports[gId.substring(0,3)].po[pType].l2:
			sports[gId.substring(0,3)].po[pType].l,
		keyData;
	if (sports[gId.substring(0,3)].po[pType].pl) {
		primLabel += " - " + sports[gId.substring(0,3)].po[pType].pl
	}
	if (games[gId].lastPType == null) {
		keyData = []
	} else {
		keyData = [{"pType":pType,"label": primLabel}];
		if ((prim != comp && !noSec) || sports[gId.substring(0,3)].po[pType].fs) {
			keyData.push( {"pType":pType, "label":sports[gId.substring(0,3)].po[pType].sl} );
		}
	}
	var graphKey = games[gId].chart.selectAll("g.linePointKey."+gId)
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
				if (sports[gId.substring(0,3)].po[pType].fs && i>0 && teamI<1) {
					return 0;
				}
				return 4;
			})
			.attr("cx",14 + 12*teamI)
			.attr("cy",10)
			.style("fill", function(d,i) {
				if (sports[gId.substring(0,3)].po[pType].fs && i>0) {
					return 'white';
				}
				return i%2==0 ? "#"+games[gId][team.s].primary : "#"+games[gId][team.s].secondary;
			})
			.style("stroke-width","2px")
			.style("stroke", function(d,i) {
				if (sports[gId.substring(0,3)].po[pType].fs && i>0) {
					return 'black';
				}
				return "#"+games[gId][team.s].primary;
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
	var pTypeFilter = games[gId].lastPType == null ? [] : [sports[gId.substring(0,3)].po[pType]];
	var histLabels = 
			[games[gId].histChart.selectAll("g.graphTitle."+gId)
				.data(pTypeFilter,function(d) {return d.l}),
			games[gId].splitGraph.selectAll("g.graphTitle."+gId)
				.data(pTypeFilter,function(d) {return d.l}),
			games[gId].playerStatsGraph.selectAll("g.graphTitle."+gId)
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
				var l2 = sports[gId.substring(0,3)].po[pType].l2;
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
			.bins(sports[gId.substring(0,3)].split.bins)
			.range([sports[gId.substring(0,3)].split.rangeMin,sports[gId.substring(0,3)].split.rangeMax])
			.value(function(p){
				if (sports[gId.substring(0,3)].split.type == 'play') {
					return getPlayTime(gId,p.id);
				} else if (sports[gId.substring(0,3)].split.type == 'down') {
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
	games[gId].splitGraph.select('g.x.axis')
		.transition().duration(graphVars.dispTime)
		.attr("transform","translate(0,"
				+(splitY(0))+")");
	aH.forEach(function(team,teamI){
		var splitBars = games[gId].splitGraph.selectAll('rect.splitBar.'+team.s)
			.data(splitTeam[team.s]);
		splitBars
		  .enter()
			.append('rect')
			.attr("class","splitBar "+team.s)
			.attr("x",function(d,i){return games[gId].splitX(i + (teamI/2))+1;})
			.attr("width",function(d) {return games[gId].splitX(1/2)-2})
			.attr("y",function(d) {return graphVars.histGraphHeight;})
			.attr("height", 0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+games[gId][team.s].primary);
		splitBars
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(i); } )
			.attr("y",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"split",function(d) {return splitY(negZero(d));});
			})
			.attr("height",function(d,i) {
				return reduceData(gId,pType,d,i,team.s,"split",function(d){return splitY(0)-splitY(Math.abs(d))});
			});
		
		var splitBarsSec = games[gId].splitGraph.selectAll('rect.splitBarSec.'+team.s)
			.data(splitTeam[team.s]);
		splitBarsSec
		  .enter()
			.append('rect')
			.attr("class","splitBarSec "+team.s)
			.attr("x",function(d,i){return games[gId].splitX(i + (teamI/2))+3;})
			.attr("width",function(d) {return games[gId].splitX(1/2)-6})
			.attr("y",function(d) {return graphVars.histGraphHeight;})
			.attr("height", 0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+games[gId][team.s].secondary);
		splitBarsSec
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(i); } )
			.attr("y",function(d,i) {return reduceData(gId,pType,d,i,team.s,"split",function(d) {return splitY(negZero(d))+2;});
			})
			.attr("height",function(d,i) {
				return negZero(reduceData(gId,pType,d,i,team.s,"split",function(d){return splitY(0)-splitY(d)-2},true));
			});
	});
	games[gId].splitYAxis = d3.svg.axis()
		.scale(splitY)
		.orient("left")
		.ticks((yMax<3)?2:4)
		.tickFormat(function(d){return d;});
	games[gId].splitGraph.select("g.y.axis")
		.call(games[gId].splitYAxis);
	
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
		var playerBars = games[gId].playerStatsGraph.selectAll("rect.playerBar."+team.l)
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
			.style("fill","#"+games[gId][team.s].primary);
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
		var playerLabel = games[gId].playerStatsGraph.selectAll("g.playerText."+team.l)
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
		var playerSecBars = games[gId].playerStatsGraph.selectAll("rect.playerSecBar."+team.l)
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
			.style("fill","#"+games[gId][team.s].secondary);
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
		games[gId].playerYAxis = d3.svg.axis()
			.scale(playerY)
			.orient((teamI)?"left":"right")
			.ticks(4)
			.tickFormat(function(d){return d;});
		games[gId].playerStatsGraph.select("g."+team.s+".axis")
			.call(games[gId].playerYAxis);
	});
}
})();

