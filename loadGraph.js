var games = {};
var sports = {};
var margin = {top: 20, right: 40, bottom: 30, left: 30, histTop: 30, histBottom: 8},
	loaderVars = {
		num : 3,
		width : 10,
		pad : 40}
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
		pDash:"M1,7L1,3L1,3L4,3L8,3L11,3L11,3L11,7L11,7L8,7L4,7L1,7Z"}},
	width = graphVars.lineGraphWidth,
	height = graphVars.lineGraphHeight,
	aH = [{s:"a",l:"away"},{s:"h",l:"home"}];
	nameSuffixes = ['sr','jr','ii','iii','iv','v','vi','vii'];
graphVars.stat10Pad = 5;
graphVars.stat10Width = (graphVars.lineGraphWidth)/20 - graphVars.stat10Pad;
d3.select(window).on("hashchange",function(){
	d3.selectAll("."+d3.select("div.gameBox").attr("id")).remove()
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
function insertGameInput(div) {
	if (d3.select(div).select("div.gameInputCont")[0][0]==null) {
		gameInput = d3.select(div)
			.append("div")
			.classed("gameInputCont",true)
			.append("input")
			.attr("type","text")
			.attr("placeholder","Input ESPN box score URL (play-by-play required for compatibility)")
			.classed("gameInput",true);
		gameInput[0][0]
			.addEventListener("keydown", function(e){
				if (gameInput.attr("disabled") == "disabled") {
					return;
				}
				if (e.keyCode == 13) {
					var id = getReq("gameId","?"+this.value.split('?')[1]);
					var sport = this.value.match(/\/[a-zA-Z-]+\//g)[0];
					sport = sport.substring(1,sport.length-1);
					if (typeof id !== "undefined" && isNormalInteger(id) && sport == "ncb") {
						if (div.id.length > 0)
							d3.selectAll("."+div.id).remove();
						d3.select(div)
							.attr("id",sport + id);
						gameInput.attr("disabled","disabled");
						console.log("#"+sport+id);
						location.hash = "#"+sport+id;
						this.value = "";
						loadGames();
					} else {
						this.value = "Please try again";
					}
				}
			});
	}
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

//load data for that particular sport
function loadSport (gId) {
	addLoader(gId);
	if (typeof sports[gId.substring(0,3)] !== "undefined") {
		loadGame(gId);
	} else {
		d3.json(gId.substring(0,3)+".json",function(error,data) {
			if (error) {
				console.error(error);
				d3.select(".chart."+gId).append("text").text("Error loading sport data").attr("y",20);
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
	loaderContainer = loaderSvg.append("g")
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
			console.log('hi');
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
			var rE = new RegExp(sPO[p].c,"i");
			teamStatData[team.s] = games[gId].plays.filter(
				function(d){
					if(sPO[p].c=="pos") {
						return d.x && d.e == team.s;
					} else {
						return rE.test(d.p[sPO[p].mp]) && d.e==team.s;
					}
				}
			);
			teamStatData[team.s+"PS"] = [];
			teamStatData[team.s+"val"] = [];
			teamStatData[team.s+"PS"].push(teamStatData[team.s].filter(
				function(d){ 
					return !sPO[p].p || d.p[sPO[p].pp] == sPO[p].p || sPO[p].ns;
				}
			));
			teamStatData[team.s+"PS"].push(teamStatData[team.s].filter(
				function(d){ 
					return sPO[p].p && d.p[sPO[p].pp] != sPO[p].p && !sPO[p].ns;
				}
			));
			teamStatData[team.s+"PS"].forEach(function(ps,psi){
				if (sPO[p].sum) {
					var primTot = 0;
					teamStatData[team.s+"PS"][psi].forEach(function(play) {
						if (play.p[sPO[p].pp] == sPO[p].p)
							primTot += +play.p[sPO[p].mp];
					});
					teamStatData[team.s+"val"][psi] = primTot;
				} else if (p=="top") {
					topTot = 0;
					teamStatData[team.s+"PS"][psi].forEach(function(play){
						topTot += getPlayTime(gId,play.id);
					});
					teamStatData[team.s+"val"][psi] = topTot;
				} else {
					teamStatData[team.s+"val"][psi] = teamStatData[team.s+"PS"][psi].length;
				}
			});
			teamStatData[team.s+"valTot"] = 
				rawOrPPNum(teamStatData[team.s+"val"][0], gId, team.s, {dp:sPO[p].dpp}) + 
				rawOrPPNum(teamStatData[team.s+"val"][1], gId, team.s, {dp:sPO[p].dps});
		});
		teamStatData.max = Math.max(teamStatData[aH[0].s+"valTot"], teamStatData[aH[1].s+"valTot"]);
		if(teamStatData.max<1) {
			teamStatData.max = 1;
		} else {
			teamStatData.max = Math.ceil(teamStatData.max/5)*5;
		}
		
		aH.forEach(function(team,teamI){
			//change stats
			function text (i){ 
				return shortNum(rawOrPPNum(teamStatData[team.s+"val"][0],gId,team.s,{dp:sPO[p].dpp}))
				+ ((sPO[p].pl && !sPO[p].fs)?
					((sPO[p].add)?"/":"-") 
					+ shortNum((sPO[p].add) ? 
						teamStatData[team.s+"valTot"] : 
						rawOrPPNum(teamStatData[team.s+"val"][1],gId,team.s,{dp:sPO[p].dps}))
					: "")};
			d3.select("#"+gId+"_"+p)
				.select("div.tSDataCont")
				.select("div.tsDataLabel."+team.l)
				.text(function(d,i){return text(i);});
			d3.select("#teamStatsMinRow"+team.s+gId)
				.select(".col"+p)
				.text(function(d,i){return text(i);});
			//change stat bar
			d3.select("#svg_"+gId+"_"+p)
				.select("g")
				.select(".statBar."+team.l)
				.transition().duration(graphVars.dispTime)
				.attr("x",0)
				.attr("width", teamStatData[team.s+"valTot"] / teamStatData.max * graphVars.teamStatWidth);
			//create secondary box
			d3.select("#svg_"+gId+"_"+p)
				.select("g")
				.select(".statBarSec."+team.l)
				.transition().duration(graphVars.dispTime)
				.attr("y",1+((1+graphVars.teamStatHeight)*teamI)+2)
				.attr("height",graphVars.teamStatHeight-4)
				.attr("x",function(d,i){ 
					return rawOrPPNum(teamStatData[team.s+"val"][0],gId,team.s,{dp:sPO[p].dpp})/ teamStatData.max * graphVars.teamStatWidth;
				})
				.attr("width", function(d,i){ 
					var rectWidth = rawOrPPNum(teamStatData[team.s+"val"][1],gId,team.s,{dp:sPO[p].dps})/ teamStatData.max * graphVars.teamStatWidth - 2
					return (rectWidth > 0) ? rectWidth : 0;
				});
		});
	});
}

//raw or per pos
function rawOrPPNum(num,gId,teamS,args) {
	if (d3.select('input[name="pp'+gId+'"]:checked').node().value == "p") {
		var plays;
		if (typeof args === 'undefined') {
			plays = games[gId]["playsTot"+teamS];
		} else {
			if (args.dp) {
				for(aHI = 0; aHI < aH.length; aHI++) {
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
		var value = num/plays;
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
	if((direction)?pId<games[gId].plays.length-1:pId>0) {
		direction = (direction)?1:-1;
		var id = pId;
		for(id+=direction;!games[gId].plays[id].x;id+=direction){}
		return ((games[gId].plays[pId].t - games[gId].plays[id].t)*direction);
	} else {
		return 0;
	}
}

//load and set game data
function loadGame (gId) {
	if (typeof games[gId] === "undefined") {
		d3.json("parsepbpoo.php?gameId=" + gId,function(error,game) {
			d3.select("div#"+gId)
				.classed("loaded",true)
				.select(".gameInput")
				.attr("disabled",null);
			if (error) {
				console.error(error);
				d3.select(".chart."+gId)
					.append("text")
					.text("Error loading game data")
					.attr("y",20);
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
	opLoc.append("input")
		.attr("type","radio")
		.attr("name","pp"+gId)
		.classed("pp "+gId,true)
		.attr("id","pp"+gId+"p")
		.attr("value","p");
	opLoc.append("label")
		.classed("ppl",true)
		.attr("for","pp"+gId+"p")
		.text("Per Possession");
	
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
	aH.forEach(function(team,teamI){
		games[gId]["plays"+team.s] = d3.layout.histogram()
			.bins(games[gId].totTime/300)
			.range([0,games[gId].totTime])
			.value(function(p){return p.t;})(games[gId].plays.filter(function(p){
				return p.x && p.s == team.s;
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
				return p.x && p.s == team.s;
			}));
		games[gId]["playsSplit"+team.s].forEach(function(d,i){
			games[gId]["playsSplit"+team.s][i] = d.length;
		});
		games[gId]["playsTot"+team.s] = games[gId].plays.filter(function(p){
			return p.x && p.s == team.s;
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
		.domain([sports[gId.substring(0,3)].split.rangeMin,sports[gId.substring(0,3)].split.rangeMax]);
	games[gId].splitXAxis = d3.svg.axis()
		.scale(games[gId].splitX)
		.orient("bottom")
		.tickFormat(function(d){
			return sports[gId.substring(0,3)].split.rangeMax - d;
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
	t = getMinutes(gId,p.t);
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
					play[playText.order[oI]] == null) {
				if (play.e == "n") {
					playAr.push("Media");
				} else {
					playAr.push(games[gId][play.e].teamName);
				}
			} else {
				playAr.push(play[playText.order[oI]]);
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
			if (playText[playText.order[oI]]["data"]) {
				playAr.push(play[playText[playText.order[oI]]["data"]]);
			}
			if (playText[playText.order[oI]]["xt"]) {
				playAr.push(playText[playText.order[oI]]["xt"]);
			}
		}
	}
	if (play == games[gId].plays[games[gId].plays.length-1]) {
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
	playerStatsTable = d3.select("div#"+gId)
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
					if (!games[gId].players[team.s][p.m]) {
						games[gId].players[team.s].ps.push(p.m);
						games[gId].players[team.s][p.m] = [];
					}
					games[gId].players[team.s][p.m].push(p);
					if (p.o) {
						if (!games[gId].players[team.s][p.o]) {
							games[gId].players[team.s].ps.push(p.o);
							games[gId].players[team.s][p.o] = [];
						}
						games[gId].players[team.s][p.o].push(p);
					}
				}
		});
		playerRow = playerStatsTable.append("tr");
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
			playerRow = playerStatsTable.append("tr");
			playerRow.append("td").text(player);
			sports[gId.substring(0,3)].p.forEach(function(p){
				if(p!="top" && p!="to") {
					var mainRegExp = new RegExp(sPO[p].c,"i");
					var totPlays = games[gId].players[team.s][player].filter(function(play){
						return (mainRegExp.test(games[gId].plays[play.id].p[sPO[p].mp]) 
								&& player == games[gId].plays[play.id][(sPO[p].p2)?"o":"m"]);
					});
					var primRegExp,totPrims;
					if(sPO[p].p) {
						primRegExp = new RegExp(sPO[p].p,"i");
						totPrims = totPlays.filter(function(play){
							return primRegExp.test(games[gId].plays[play.id].p[sPO[p].pp]);
						});
					}
					playerRow.append("td").text(function(){
						var text = "";
						if (sPO[p].p && !sPO[p].ns	) {
							text += totPrims.length + ((sPO[p].add)?"/":"-");
						}
						if (sPO[p].sum) {
							var sum = 0;
							totPrims.forEach(function(p2){
								sum += +p2.p[sPO[p].mp];
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
	period = games[gId].boxScore.length-1;
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
		.domain([games[gId].totTime/60,0]);

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
    }).left;
	
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
			var time = Math.trunc(perTime.t/60)+":"+('00'+Math.trunc(perTime.t%60)).slice(-2);
			var pID = games[gId].bisectTime(games[gId].plays, games[gId].totTime - mouseT,1);
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
			var perTime = getMinutes(gId,d*60);
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
		replayButton = games[gId].chart
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
	if (games[gId].scoreDiff) {
		yMin = 10*Math.floor(d3.min(games[gId].plays, function(p) { return p.a-p.h; })/10);
		if (yMin == 0) {
			yMin = 10;
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
		if (/\d/i.test(play.p[0]) &&
				play.p[2] == "m" ||
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
					score = {
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

//switch score diff on click
function switchScoreDiff(gId,ob) {
	box = d3.select(ob);
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
	//display clicked link as active
	d3.selectAll("div.teamStat."+gId)
		.classed("active",false);
	d3.select("#teamStatsMin"+gId)
		.selectAll(".teamStatMin")
		.classed("active",false);
	//gather data for points and bars
	var comp = sports[sport].po[pType].c;
	var prim = sports[sport].po[pType].p;
	var primPos = sports[sport].po[pType].pp;
	var mPos = sports[sport].po[pType].mp;
	var noSec = sports[sport].po[pType].ns;
	var labelSing = sports[sport].po[pType].ls;
	var primSum = sports[sport].po[pType].sum;
	var add = sports[sport].po[pType].add;
	var defPosP = sports[sport].po[pType].dpp;
	var defPosS = sports[sport].po[pType].dps;
	
	prim = typeof prim !== 'undefined' ?  prim : comp;
	var player = (sports[gId.substring(0,3)].po[pType].p2)?"o":"m";
	
	//cut last animation short for points
	games[gId].chart.selectAll("circle.transWaiting.point."+gId)
		.remove();
	
	//if user pressed same button again
	if (pType == games[gId].lastPType && !dispTime) {
		comp = null;
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
	
	//create comparisons	
	var compRegExp = new RegExp(comp,"i");
	var primRegExp = new RegExp(prim,"i");
	
	var histData = games[gId].plays.filter(function(p,pI) { 
		if(comp == "pos"){
			return 	p.x;	
		} else {
			return compRegExp.test(p.p[mPos]);
		}
	});
	
	if (noSec) {
		histData = histData.filter(function(p,I) {
			return primRegExp.test(p.p[primPos]);
		});
	}
	
	var histTeam = {}
	aH.forEach(function(team,teamI){
		histTeam[team.s] = d3.layout.histogram()
			.bins(games[gId].totTime/300)
			.range([0,games[gId].totTime])
			.value(function(p){return p.t;})(histData.filter(function(p) { return p.e == team.s; }))
	});
	function reduceData(data,gIndex,teamS,gType,func,isSec) {
		var dataAr = [];
		if (isSec || defPosP || defPosS) {
			if (noSec) {
				return 0;
			}
			if (!isSec  && (defPosP || defPosS)) {
				priData = data.filter(function(p){return comp=="pos" || p.p[primPos] == prim;});
				dataAr.push(priData);
			}
			secData = data.filter(function(p){return comp!="pos" && p.p[primPos] != prim;});
			dataAr.push(secData);
		} else {
			dataAr.push(data);
		}
		var value = 0;
		dataAr.forEach(function(d,i){
			var tempVal = 0;
			if (primSum) {
				d.forEach(function(p) {
					tempVal += +p.p[mPos];
				});
			} else if (comp=="pos") {
				d.forEach(function(p) {
					tempVal += getPlayTime(gId,p.id);
				});
			} else {
				tempVal += d.length;
			}
			if (gType !== false) {
				value += rawOrPPNum(tempVal,gId,teamS,{index:gIndex, type:gType, dp:((i)?defPosS:defPosP)});
			} else {
				value += tempVal;
			}
		});
		if (typeof func !== "undefined") {
			value = func(value);
		}
		value = (value<0)?0:value;
		return value;
	}
		
	var histX = d3.scale.linear()
		.range([1, graphVars.histGraphWidth+1])
		.domain([games[gId].totTime,0]);
	var histY = d3.scale.linear()
		.range([0, graphVars.histGraphHeight])
		.domain([0, Math.max(
			d3.max(histTeam.a, function(d,i) { return reduceData(d,i,aH[0].s,"time");}),
			d3.max(histTeam.h, function(d,i) { return reduceData(d,i,aH[1].s,"time");})
		)]);
	
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
				return reduceData(d,i,team.s,"time",function(d){return graphVars.histGraphHeight-histY(d);});
			})
			.attr("height",function(d,i) {
				return reduceData(d,i,team.s,"time",histY);
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
				return reduceData(d,i,team.s,"time",function(d){return graphVars.histGraphHeight-histY(d)});
			})
			.text(function(d,i) {
				if (comp == null) {
					return "";
				}
				if (primSum) {
					var primTot = 0;
					d.forEach(function(p) {
						primTot += +p.p[mPos];
					});
					return shortNum(rawOrPPNum(primTot,gId,team.s,{index:i,type:"time", dp:defPosP}));
				} else if (comp=="pos") {
					var topTot = 0;
					d.forEach(function(p) {
						topTot += getPlayTime(gId,p.id);
					});
					return shortNum(rawOrPPNum(topTot,gId,team.s,{index:i,type:"time", dp:defPosP}));
				} else {
					var secLength = d.filter(function(p){return !primRegExp.test(p.p[primPos]);}).length;
					var textStr = shortNum(rawOrPPNum((d.y - secLength),gId,team.s,{index:i,type:"time", dp:defPosP}));
					if (sports[gId.substring(0,3)].po[pType].pl && 
							!sports[gId.substring(0,3)].po[pType].fs) {
						textStr += 
							((sports[gId.substring(0,3)].po[pType].add)?"/":"-") 
							+ shortNum(rawOrPPNum(((sports[gId.substring(0,3)].po[pType].add) ? d.y : secLength),gId,team.s,{index:i,type:"time"}));
					}
					return textStr;
				} 
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
				return reduceData(d,i,team.s,"time",function(d){return graphVars.histGraphHeight-histY(d)+2});
			})
			.attr("height",function(d,i) {
				return reduceData(d,i,team.s,"time",function(d){return histY(d)-2;},true);
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
					return (!prim || primRegExp.test(p.p[primPos]) || prim=="pos") ? "#"+games[gId][p.e].primary : "#"+games[gId][p.e].secondary;
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
					return (!prim || primRegExp.test(p.p[primPos]) || comp=="pos") ? "#"+games[gId][p.e].primary : "#"+games[gId][p.e].secondary;
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
		.attr("id", function(d, i) { return "clip-"+i;})
		.classed("vorClip",true)
		.append("svg:circle")
		.attr('cx', function(d) { return d[0]; })
		.attr('cy', function(d) { return d[1]; })
		.attr('r', 10)
		.style('fill','black');
	games[gId].chart.selectAll("path.vorPath")
		.data(d3.geom.voronoi(voronoiData))
		.enter().append("svg:path")
		.classed("vorPath",true)
		.attr("d", function(d) { return "M" + d.join(",") + "Z"; })
		.attr("id", function(d,i) { 
			return ; })
		.attr("clip-path", function(d,i) { return "url(#clip-"+i+")"; })
		.style("fill", function(d,i){return ("hsl("+(i / (voronoiData.length-1) * 720)+",100%,50%)");})
		//.style("stroke", "#000")
		.style('fill-opacity', 0)
		.on('mouseover',function(d,i){
			games[gId].chart.select("circle#playpoint-" + histData[i].id + "." + gId)
				.transition()
				.duration(graphVars.dispTime/4)
				.attr('r',10)
				.attr('stroke-width',"6px");
			var playText = getPlayText(gId,histData[i]);
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
			//console.log(playAr.join(" "));
		})
		.on('mouseout',function(d,i){
			games[gId].chart.select("circle#playpoint-" + histData[i].id + "." + gId)
				.transition()
				.duration(graphVars.dispTime/4)
				.attr('r',3)
				.attr('stroke-width',"2px");
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
	
	graphKeyG = graphKey
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
			.value(function(p){return getPlayTime(gId,p.id);})(histData.filter(function(p) { return p.e == team.s; }))
	});
	var yMax = Math.max(
			d3.max(splitTeam[aH[0].s], function(d,i) {
				return reduceData(d,i,aH[0].s,"split");
			}),
			d3.max(splitTeam[aH[1].s], function(d,i) {
				return reduceData(d,i,aH[1].s,"split");
			})
		);
	var splitY = d3.scale.linear()
		.range([graphVars.histGraphHeight,0])
		.domain([0,yMax]);
	aH.forEach(function(team,teamI){
		var splitBars = games[gId].splitGraph.selectAll('rect.splitBar.'+team.s)
			.data(splitTeam[team.s]);
		splitBars
		  .enter()
			.append('rect')
			.attr("class","splitBar "+team.s)
			.attr("x",function(d,i){return games[gId].splitX(d.dx*i + d.dx/2*(teamI))+1;})
			.attr("width",function(d) {return games[gId].splitX(d.dx/2)-2})
			.attr("y",function(d) {return graphVars.histGraphHeight;})
			.attr("height", 0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+games[gId][team.s].primary);
		splitBars
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(i); } )
			.attr("y",function(d,i) {
				return reduceData(d,i,team.s,"split",splitY);
			})
			.attr("height",function(d,i) {
				return reduceData(d,i,team.s,"split",function(d){return graphVars.histGraphHeight-splitY(d)});
			});
		
		var splitBarsSec = games[gId].splitGraph.selectAll('rect.splitBarSec.'+team.s)
			.data(splitTeam[team.s]);
		splitBarsSec
		  .enter()
			.append('rect')
			.attr("class","splitBarSec "+team.s)
			.attr("x",function(d,i){return games[gId].splitX(d.dx*i + d.dx/2*(teamI))+3;})
			.attr("width",function(d) {return games[gId].splitX(d.dx/2)-6})
			.attr("y",function(d) {return graphVars.histGraphHeight;})
			.attr("height", 0)
			.style("shape-rendering", "crispEdges")
			.style("fill","#"+games[gId][team.s].secondary);
		splitBarsSec
			.transition().duration(graphVars.dispTime)
			.delay(function(p,i) { return graphVars.dispTime/2/histTeam[team.s].length*(i); } )
			.attr("y",function(d,i) {
				return reduceData(d,i,team.s,"split",function(d){return splitY(d)+2});
			})
			.attr("height",function(d,i) {
				return reduceData(d,i,team.s,"split",function(d){return graphVars.histGraphHeight-splitY(d)-2},true);
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
	aH.forEach(function(team,teamI){
		playerStats[team.s] = [];
		var plStatOrder = {};
		histData.forEach(function(p){
			if (p.e == team.s && p[player] != null && pType != "to" && pType != "top") {
				if (typeof plStatOrder[p[player]] === "undefined") {
					plStatOrder[p[player]] = playerStats[team.s].length;
					playerStats[team.s].push({});
					playerStats[team.s][plStatOrder[p[player]]].plays = [];
					playerStats[team.s][plStatOrder[p[player]]].name = p[player];
				}
				playerStats[team.s][plStatOrder[p[player]]].plays.push(p);
			}
		});
		playerStats[team.s].sort(function (a, b) {
			if(primSum){
				return b.plays.reduce(function(a2,b2){
						var a2val = (a2.p) ? +a2.p[mPos] : a2.x;
						return {x:a2val + +b2.p[mPos]};
					}).x 
					- a.plays.reduce(function(a2,b2){
						var a2val = (a2.p) ? +a2.p[mPos] : a2.x;
						return {x:a2val + +b2.p[mPos]};
					}).x;
			}
			return b.plays.length - a.plays.length;
		});
		if (playerStats[team.s].length > 0) {
			if(primSum){
				var tot =  playerStats[team.s][0].plays.reduce(function(a2,b2){
						var a2val = (a2.p) ? +a2.p[mPos] : a2.x;
						return {x:a2val + +b2.p[mPos]};
					}).x;
				playerStats.max = (playerStats.max > tot) ? playerStats.max : tot;
			}
			playerStats.max = (playerStats.max > playerStats[team.s][0].plays.length) ? playerStats.max : playerStats[team.s][0].plays.length;
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
		.domain([playerStats.max,0]);
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
				return reduceData(d.plays,i,team.s,false,playerY);
			})
			.attr("height",function(d,i){
				return reduceData(d.plays,i,team.s,false,function(d){return graphVars.histGraphHeight-playerY(d)});
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
				return reduceData(d.plays,i,team.s,false,function(d){return playerY(d)+2});
			})
			.attr("height",function(d,i){
				return reduceData(d.plays,i,team.s,false,function(d){return graphVars.histGraphHeight-playerY(d)-2},true);
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
			.ticks((playerStats.max<4)?playerStats.max:4)
			.tickFormat(function(d){return d;});
		games[gId].playerStatsGraph.select("g."+team.s+".axis")
			.call(games[gId].playerYAxis);
	});
}
