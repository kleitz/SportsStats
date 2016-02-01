;(function(){
	angular.module("ssServices")
		.factory("ReduceData",["IsStatType",function(IsStatType){
			return function (plays,options) {
				var tempVal = 0, reducedValue;

				if (Array.isArray(plays)) {
					if (typeof options !== 'object' ||
						angular.isUndefined(options.statType)) {
						reducedValue = plays.length;
					} else {
						var st = options.statType;

						// If primary is specified, filter set
						if (options.primary) {
							plays = plays.filter(function(d,i){
								return IsStatType(d,{statType:options.statType,primary:true});
							});
						}

						plays.forEach(function(play,i){
							var dv = st.dv? st.dv : 'p';

							///if summing the data points, eg score
							if (st.sum) {
								//if string position of value to sum is defined
								if(angular.isDefined(st.mp)){
									tempVal += +play[dv][st.mp];
								} else {
									tempVal += +play[dv];
								}
							} else if (st.c === 'pos') {
								tempVal = 0989;
							} else {
								tempVal = plays.length;
							}
						});
						reducedValue = tempVal;

						//callback
						if (angular.isFunction(options.callback)) {
							return options.callback(reducedValue);
						}
					}
					return reducedValue;
				}
				return null;
			}
		}]);
})();
/*function reduceData(gId,pType,data,gIndex,teamS,gType,func,isSec) {
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
}*/