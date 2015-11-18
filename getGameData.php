<?php
include_once('classes/simple_html_dom.php');
include_once('classes/game.php');
include_once('classes/dbvars.php');
include_once('classes/playSortFunctions.php');

$dbcon = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

$gId = mysqli_real_escape_string($dbcon,$_GET['gameId']);
$game = new GameWithPlays();

preg_match('/[0-9]+$/',$gId,$gameId);
$gameId = $gameId[0];
preg_match('/^[a-zA-Z]{3}/',$gId,$sportId);
$sportId = $sportId[0];

$periodNames = array("1st", "2nd", "3rd", "4th");
$sportVars = array(
	'ncb' => array(
		'id' => 'ncb',
		'maxTextTime' => '20:00',
		'otTextTime' => '5:00',
		'maxTime' => 1200,
		'startPlay' => 'jump ball',
		'startPlayShort' => 'j',
		'regPeriods' => 2,
		'sport' => 'basketball'
	),
	'nba' => array(
		'id' => 'nba',
		'maxTextTime' => '12:00',
		'otTextTime' => '12:00',
		'maxTime' => 720,
		'startPlay' => 'jump ball',
		'startPlayShort' => 'i',
		'regPeriods' => 4,
		'sport' => 'basketball'
	),
	'ncf' => array(
		'id' => 'ncf',
		'maxTextTime' => '15:00',
		'otTextTime' => '0:00',
		'maxTime' => 900,
		'regPeriods' => 4,
		'sport' => 'football'
	)
);
$sportVars[$sportId]['gId'] = $sportId.$gameId;

if(preg_match('/^[a-zA-Z]{3}[0-9]+$/',$gId) && 
	$sportVars[$sportId] != null) {
	$recordHit = "INSERT INTO SPORTS_HITS (GID) VALUE ('$gId')";
	mysqli_query($dbcon, $recordHit);
} else {
	$game->error = "Invalid ID";
	echo json_encode($game);
	return;
}

$html = file_get_html("http://espn.go.com/$sportId/playbyplay?gameId=$gameId&period=0");
//error_reporting(E_ALL);
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400597322'); //Ken TAM
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400788981'); //Wis Duke
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400546902'); //Neb Bay + Tech + team foul
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400597403'); //SC TAMU
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400597413'); //ARK TAMU

//$game = array();
//echo json_encode($game);
$plays = array();
$boxScore = array();
$playid = 0;
$period = 0;
$lastBoxScorePlay = 0;
$FBPos = array("new"=>false);
$FBPos['t'] = 0;
$FBPos['oldt'] = 0;

$timeLocation = $html->find('div.game-time-location', 0);
$timeLocationNodes = $timeLocation->nodes;
$dateTime = explode(',', $timeLocationNodes[0]->innertext);
$game->gameTime = $dateTime[0];
$game->gameDate = trim($dateTime[1].','.$dateTime[2]);
$location = explode(',', $timeLocationNodes[1]->innertext);
$venue = new Venue();
$venue->venueName = $location[0];
$venue->city = trim($location[1]);
$venue->state = trim($location[2]);
$game->venue = $venue;


$statusBar = $html->find('div.status-bar', 0);
if (preg_match('/final/i',$statusBar->innertext)) {
	$game->final = true;
}

if ($sportVars[$sportId]['sport'] == 'basketball') {
	$teamBox = $html->find('div.team');
	foreach($teamBox as $tb) {
		$teamInfo = $tb->find('div.team-info',0);
		foreach($teamInfo->nodes as $h) {
			if ($h->tag == "h3") {
				forEach($h->nodes as $a) {
					if ($a->tag == "a") {
						$teamName = $a->innertext;
						if (preg_match("/^(\w+ )?away( \w+)?$/",$tb->class)) {
							$away = new Team();
							$away->teamName = $teamName;
							$shortNameDiv = $html->find('div.line-score-container');
							$shortNameTDs = $shortNameDiv[0]->find('td.team');
							$away->short = $shortNameTDs[1]->nodes[0]->innertext;
							$game->a = $away;
							getTeamData($game->a,$dbcon,"a",$sportVars[$sportId]);
						}
						else if (preg_match("/^(\w+ )?home( \w+)?$/",$tb->class)) {
							$home = new Team();
							$home->teamName = $teamName;
							$shortNameDiv = $html->find('div.line-score-container');
							$shortNameTDs = $shortNameDiv[0]->find('td.team');
							$home->short = $shortNameTDs[2]->nodes[0]->innertext;
							$game->h = $home;
							getTeamData($game->h,$dbcon,"h",$sportVars[$sportId]);
						}
					}
				}
			}
		}
	}
	$playTable = $html->find('table.mod-data', 0);
	foreach($playTable->nodes as $ai=>$a) {
		if ($a->tag == "thead") {
			if ($sportVars[$sportId]['sport'] == 'football' &&
					$a->nodes[0]->class == 'team-color-strip') {
				$FBPos['e'] = (preg_match('/'.$game->h->teamName.'/i',$a->nodes[0]->nodes[0]->innertext)) ? 'h':'a';
				preg_match('/(\d+:\d\d)/i',$a->nodes[0]->nodes[0]->innertext,$time);
				$time = explode(":",$time[1]);
				$FBPos['t'] = intval($time[0])*60+intval($time[1]);
				$FBPos['new'] = true;
			}
		}
		else if ($a->tag == "tr") {
			$a_nodes = $a->nodes;
			if (sizeof($plays)!=0) {
				if (strpos(strtolower(end($plays)->getPlayText()), strtolower('end of ')) !== false){
					if (strpos(strtolower($a_nodes[1]->innertext),'end of game') !== false) {
						continue;
					}
				}
			}
			if (isset($sportVars[$sportId]['startPlay'])) {
				if ((sizeof($plays)==0 || strpos(strtolower(end($plays)->getPlayText()), strtolower('end of ')) !== false) && (strpos(strtolower($a_nodes[1]->innertext),$sportVars[$sportId]['startPlay']) === false && strpos(strtolower($a_nodes[3]->innertext),$sportVars[$sportId]['startPlay']) === false)) {
					$play = new Play();
					//{"id":0,"a":0,"e":"h","h":0,"m":null,"p":"j","q":1,"s":"h","t":2400,"x":1}
					$play->t = $sportVars[$sportId]['maxTime'];
					$play->id = sizeof($plays);
					$playid++;
					$play->p = $sportVars[$sportId]['startPlayShort'];
					if (sizeof($plays)==0) {
						$play->a = 0;
						$play->h = 0;
						$play->s = "n";
						$play->e = "n";
					} else {
						$play->a = end($plays)->a;
						$play->h = end($plays)->h;
						$play->s = "n";
						$play->e = end($plays)->e;
					}
					$play->x = 1;
					$period++;
					$play->q = $period;
					array_push($plays,$play);
				}
			}
			$play = new Play();
			if ($sportVars[$sportId]['sport'] == 'basketball') {
				$timeExp = explode(':',$a_nodes[0]->innertext);
				$play->t = intval($timeExp[0])*60+intval($timeExp[1]);
			} else if ($sportVars[$sportId]['sport'] == 'football') {
				$play->x = ($FBPos['new'])?1:0;
				if ($FBPos['new']) {
					$FBPos['new'] = false;
					$play->t = $FBPos['t'];
					$play->e = $FBPos['e'];
				} else {
					if (end($plays)->p[0] != 'o') {
						$play->e = end($plays)->e;
					} else {
						$pId = sizeof($plays)-2;
						while ($plays[$pId]->p[0] == 'o' &&
								$pId > 0 ) {
							$pId--;
						}
						$play->e = $plays[$pId]->e;
					}
				}
			}
			if (count($a_nodes) == 4) {
				$lastPlay = end($plays);
				if (sizeof($plays) == 0) {
					$period++;
				} else if ($lastPlay->p[0] == 'e') {
					$period++;
				}
			
			
			
				//set plays//
				if ($sportVars[$sportId]['sport'] == 'basketball') {
					if ($a_nodes[1]->innertext == '&nbsp;') {
						$play->e = 'h'; //home
						$play->setPlayText(str_replace('<b>', '', str_replace('</b>', '', $a_nodes[3]->innertext)));
					}
					else {
						$play->e = 'a'; //away
						$play->setPlayText(str_replace('<b>', '', str_replace('</b>', '', $a_nodes[1]->innertext)));
					}
					$play_scores = explode('-', $a_nodes[2]->innertext);
					$play->a = intval($play_scores[0]);
					$play->h = intval($play_scores[1]);
					if (strpos(strtolower($play->getPlayText()), strtolower('Deadball Team Rebound')) !== false ||
							strpos(strtolower($play->getPlayText()), strtolower('Foul on '.$game->h->teamName)) === 0 ||
							strpos(strtolower($play->getPlayText()), strtolower('Foul on '.$game->a->teamName)) === 0) {
						continue;
					}
				}
				else if ($sportVars[$sportId]['sport'] == 'football') {
					$play->setPlayText($a_nodes[0]->innertext."|".$a_nodes[1]->innertext);
					if (preg_match('/\d+/',$a_nodes[2]->innertext,$aScore) &&
							preg_match('/\d+/',$a_nodes[3]->innertext,$hScore)) {
						$play->a = intval($aScore[0]);
						$play->h = intval($hScore[0]);
					} else if (sizeof($plays)==0) {
						$play->a = 0;
						$play->h = 0;
					} else {
						$play->a = end($plays)->a;
						$play->h = end($plays)->h;
					}
				}
			}
			else {
				$playTeam = 'n';
				if (strpos(strtolower($a_nodes[1]->innertext), strtolower($game->h->teamName)) !== FALSE) {
					$playTeam = 'h'; //home
				}
				else if (strpos(strtolower($a_nodes[1]->innertext), strtolower($game->a->teamName)) !== FALSE) {
					$playTeam = 'a'; //away
				}
				$play->e = $playTeam;
				if ($sportVars[$sportId]['sport'] == 'basketball') {
					$play->setPlayText(str_replace('<b>', '', str_replace('</b>', '', $a_nodes[1]->innertext)));
				}
				$lastPlay = end($plays);
				$play->a = $lastPlay->a;
				$play->h = $lastPlay->h;
			}
			if (strpos(strtolower($play->getPlayText()), strtolower('end of ')) !== false ||
					strpos(strtolower($play->getPlayText()), strtolower('end game')) !== false ||
					strpos(strtolower($play->getPlayText()), strtolower('end half')) !== false) {
				$boxScoreElem = new BoxScore();
				$boxScoreElem->period = $period;
				$boxScoreElem->t = $plays[$lastBoxScorePlay]->t;
				$lastBoxScorePlay = sizeof($plays)+1;
				$lastABoxScore = 0;
				$lastHBoxScore = 0;
				foreach ($boxScore as $bse) {
					$lastABoxScore += $bse->a;
					$lastHBoxScore += $bse->h;
				}
				$boxScoreElem->a = $play->a - $lastABoxScore;
				$boxScoreElem->h = $play->h - $lastHBoxScore;
				array_push($boxScore,$boxScoreElem);
			}
		
			//If there's no play to start the half/quarter. choose play team.
			if ($playid==1 &&
					$plays[0]->e == "n") {
				//$plays[0]->e = $play->e;
			}
			$play->q = $period;
			$play->id = sizeof($plays);
			++$playid;
			if (selectPlayShort($sportVars[$sportId],$play, $plays, array($game->a,$game->h)) === false) {
				$teams = array($game->a,$game->h);
				$playText = $play->getPlayText();
				$teamsNames = array();
				for ($i = 0; $i<2; $i++) {
					array_push($teamsNames,$teams[0]->teamName);
					array_push($teamsNames,$teams[0]->short);
					if (sizeof($teams[0]->getShorts())>0) {
						array_merge($teamsNames, $teams[0]->getShorts());
					}
				}
				$textLike = preg_replace('/'.implode('|',$teamsNames).'/','%',$playText);
				$pe_querySelect = "SELECT * FROM SPORTS_PARSE_ERRORS WHERE playtext LIKE '$textLike'";
				$data = mysqli_query($dbcon,$pe_querySelect);
				if ($data != null) {
					if (mysqli_num_rows($data) == 0) {
						$gId = mysqli_real_escape_string($dbcon,$sportVars[$sportId]['gId']);
						$playText = mysqli_real_escape_string($dbcon,$playText);
						$pe_queryInsert = "INSERT INTO SPORTS_PARSE_ERRORS (gid, playtext) VALUES ('$gId', '$playText')";
						mysqli_query($dbcon,$pe_queryInsert);
					} else {
						$row = mysqli_fetch_array($data);
						if (!preg_match("/$sportVars[$sportId][gId]/",$row['gid'])) {
							$gId = $row['gid'].','.$sportVars[$sportId]['gId'];
							$pe_queryInc = "UPDATE SPORTS_PARSE_ERRORS gid SET $gId WHERE id = $row[id]";
							mysqli_query($dbcon,$pe_queryInc);
						}
					}
				}
				continue;
			}
		
			//Fix ESPN data issues
			if ($sportVars[$sportId]['sport'] == 'basketball') {
				if ($play->a < end($plays)->a) {
					if (preg_match('/^[0-9][a-z]m/',end($plays)->p[2])) {
						end($plays)->a = $plays[sizeof($plays)-2]->a;
					} else {
						$play->a = end($plays)->a;
					}
				}
				if ($play->h < end($plays)->h) {
					if (preg_match('/^[0-9][a-z]m/',end($plays)->p[2])) {
						end($plays)->h = $plays[sizeof($plays)-2]->h;
					} else {
						$play->h = end($plays)->h;
					}
				}
				if ($play->a > end($plays)->a) {
					if ($play->p[2] != 'm') {
						$play->a = end($plays)->a;
					}
				}
				if ($play->h > end($plays)->h) {
					if ($play->p[2] != 'm') {
						$play->h = end($plays)->h;
					}
				}
			}
			array_push($plays,$play);
		
		
			//add following play
			//Extra point
			if ($sportVars[$sportId]['sport'] == 'football' &&
					preg_match('/(td|touchdown)/i',$play->getPlayText())) {
				preg_match('/\((.+)( kick)\)/i',$play->getPlayText(),$xp);
				$play2 = new Play();
				$play2->x = 0;
				$play2->t = $play->t;
				$play2->q = $period;
				$play2->id = sizeof($plays);
				++$playid;
			
				$play2->m = array($xp[1]);
				$play2->c = '1';
				$play2->p = 'x';
				$play2->e = $play->e;
				$play2->d = $play->d;
				if (preg_match('/kick/i',$xp[2])) {
					$play2->p .= 'g';
					$play2->a = $play->a;
					$play2->h = $play->h;
				} else {
					$play2->p .= 'm';
				}
				$newScore = ($play->e == 'a')? $play->a : $play->h;
				$playOld = $plays[sizeof($plays)-2];
				$oldScore = ($playOld->e == 'a')? $playOld->a : $playOld->h;
				$scoreDiff = $newScore - $oldScore - 6;
				if ($play->e == 'a') {
					$play->a -= $scoreDiff;
				} else {
					$play->h -= $scoreDiff;
				}
				array_push($plays,$play2);
			}
		}
	}
} else if ($sportVars[$sportId]['sport'] == 'football') {
	$drivesWrap = $html->find('div#gamepackage-drives-wrap',0);
	$drives = $drivesWrap->find('ul.accordion',0);
	$teamBox = $html->find('div.team');
	foreach($teamBox as $tb) {
		$teamName = $tb->find('span.long-name',0)->innertext;
		$teamNameShort = $tb->find('span.abbrev',0)->innertext;
		$rank = $tb->find('span.rank',0)->innertext;
		preg_match('/id\/([0-9]+)/',$tb->find('a.team-name',0)->href,$teamId);
		$teamId = $teamId[1];
		$team = new Team();
		$team->teamName = ucwords(strtolower($teamName));
		$team->short = strtoupper($teamNameShort);
		$team->setESPNID($teamId);
		if ($rank != NULL) {
			$team->rank = intval($rank);
		}
		if (preg_match("/^(\w+ )?away( \w+)?$/",$tb->class)) {
			$game->a = $team;
			getTeamData($game->a,$dbcon,"a",$sportVars[$sportId]);
		}
		else if (preg_match("/^(\w+ )?home( \w+)?$/",$tb->class)) {
			$game->h = $team;
			getTeamData($game->h,$dbcon,"h",$sportVars[$sportId]);
		}
	}
	
	$teamIdComp = array();
	if (preg_match('/'.$game->a->getESPNID().'/',$game->h->getESPNID())) {
		$teamIdComp['id'] = $game->h->getESPNID();
		$teamIdComp['e'] = 'h';
		$teamIdComp['o'] = 'a';
	} else {
		$teamIdComp['id'] = $game->a->getESPNID();
		$teamIdComp['e'] = 'a';
		$teamIdComp['o'] = 'h';
	}
	
	//getting short id for football first column
	//There are 4 separate versions of the shortened team name per play-by-play page
	// - game best performers [don't need]
	// - yardline for down column
	// - yardline for play column
	// - score [can assume 'away' is column 3, and 'home' 4]
	if ($sportVars[$sportId]['sport'] == 'football') {
		$homeRegex = '(u?c?';
		for ($i=0;$i<strlen($game->h->teamName);$i++) {
			if ($game->h->teamName[$i] == ' ') {
				$homeRegex .= '(of)?';
			} else {
				$homeRegex .= $game->h->teamName[$i];
				if ($i != 0) {
					$homeRegex .= '?';
				}
			}
		}
		$homeRegex .= 'u?c?)';
		$awayRegex = '(u?c?';
		for ($i=0;$i<strlen($game->a->teamName);$i++) {
			if ($game->h->teamName[$i] == ' ') {
				$awayRegex .= '(of)?';
			} else {
				$awayRegex .= $game->a->teamName[$i];
				if ($i != 0) {
					$awayRegex .= '?';
				}
			}
		}
		$awayRegex .= 'u?c?)';
		$teamShorts = array();
		foreach($drives->nodes as $drive) {
			$playsDOM = $drive->find('ul.drive-list',0);
			foreach($playsDOM->nodes as $playDOM) {
				$downText = $playDOM->find('h3',0)->innertext;
				if (preg_match('/at '.$awayRegex.' [0-9]+$/i',$downText,$ashort)) {
					if (isset($teamShorts['a']) &&
							$ashort[1]!=$teamShorts['a']) {
						$teamShorts['a2'] = $ashort[1];
					} else if (!isset($teamShorts['a'])) {
						$teamShorts['a'] = $ashort[1];
					}
				}
				if (preg_match('/at '.$homeRegex.' [0-9]+$/i',$downText,$hshort)) {
					if (isset($teamShorts['h']) &&
							$hshort[1]!=$teamShorts['h']) {
						$teamShorts['h2'] = $hshort[1];
					} else if (!isset($teamShorts['h'])) {
						$teamShorts['h'] = $hshort[1];
					}
				}
				if (isset($teamShorts['h']) && isset($teamShorts['a'])) {
					if($teamShorts['h'] == $teamShorts['a']) {
						if (isset($teamShorts['h2'])) {
							$teamShorts['h'] = $teamShorts['h2'];
						} else {
							$teamShorts['a'] = $teamShorts['a2'];
						}
					}
					break;
				}
			}
		}
		$game->a->setShorts(1,$teamShorts['a']);
		$game->h->setShorts(1,$teamShorts['h']);
	}
	foreach($drives->nodes as $drive) {
		$FBPos['e'] = preg_match('/\/'.$game->a->getESPNID().'\.png/', $drive->find('img.team-logo',0)->src) ? 'a':'h';
		$driveText = $drive->find('span.drive-details',0)->innertext;
		echo $driveText."\n";
		preg_match('/ (\d*):([\d]{2})$/',$driveText,$timeText);
		$FBPos['oldt'] = $FBPos['t'];
		$FBPos['t'] = $FBPos['oldt']+intval($timeText[1])*60 + intval($timeText[2]);
		echo $FBPos['t']."\n";
		$FBPos['new'] = true;
		/*preg_match('/(\d+:\d\d)/i',$a->nodes[0]->nodes[0]->innertext,$time);
		$time = explode(":",$time[1]);
		$FBPos['t'] = intval($time[0])*60+intval($time[1]);
		$FBPos['new'] = true;
		$playsDOM = $drive->find('ul.drive-list',0);
		foreach($playsDOM->nodes as $playDOM) {
		}*/
	}
}
//fill out box score for unfinished games
if (sizeof($boxScore) < end($plays)->q) {
	$play = end($plays);
	$boxScoreElem = new BoxScore();
	$boxScoreElem->period = $play->q;
	$boxScoreElem->t = $plays[$lastBoxScorePlay]->t;
	$lastABoxScore = 0;
	$lastHBoxScore = 0;
	foreach ($boxScore as $bse) {
		$lastABoxScore += $bse->a;
		$lastHBoxScore += $bse->h;
	}
	$boxScoreElem->a = $play->a - $lastABoxScore;
	$boxScoreElem->h = $play->h - $lastHBoxScore;
	array_push($boxScore,$boxScoreElem);
}
while (sizeof($boxScore) < $sportVars[$sportId]['regPeriods']) {
	$boxScoreElem = new BoxScore();
	$boxScoreElem->period = end($boxScore)->period+1;
	$boxScoreElem->t = $sportVars[$sportId]['maxTime'];
	array_push($boxScore,$boxScoreElem);
}
//Do box score period things
for($boxI = 0; $boxI<sizeof($boxScore); $boxI++) {
	if ($boxI < $sportVars[$sportId]['regPeriods']) {
		$boxScore[$boxI]->l = $periodNames[$boxI];
	} else {
		$boxScore[$boxI]->l = "OT";
		$boxScore[$boxI]->ot = true;
		if (sizeof($boxScore)>$sportVars[$sportId]['regPeriods']+1) {
			$boxScore[$boxI]->l .= ($boxI-1);
		}
	}
}
$game->boxScore = $boxScore;
if ($sportVars[$sportId]['sport'] == 'football') {
	foreach($plays as $pi=>$play) {
		if ($play->t != null ||
				$pi == sizeof($plays)-1) {
			$p2i = $pi-1;
			$skipPI = ($pi == sizeof($plays)-1)?0:1;
			while ($p2i >= 0 && $plays[$p2i]->t == null) {
				$p2i--;
			}
			if ($p2i<0) {
				continue;
			}
			$originalTime = $play->t;
			if ($originalTime == 900 ||
					$originalTime == null) {
				$originalTime = 0;
			}
			$timePlays = $pi-$p2i;
			if ($plays[$pi-1]->p[0] == 'x') {
				$skipPI++;
				$timePlays--;
			}
			$tDiff = ($plays[$p2i]->t-$originalTime)/($timePlays);
			for ($p3i = $pi-$p2i-1;$p3i>=$skipPI;$p3i--) {
				$plays[$pi-$p3i]->t = $originalTime+intval(round($tDiff*$p3i));
			}
			if ($plays[$pi-1]->p[0] == 'x') {
				$plays[$pi-1]->t = $plays[$pi-2]->t;
			}
		}
	}
}
foreach($plays as $play) {
	for($i=$play->q; 
	$i<sizeof($game->boxScore); 
	$i++) {
		$play->t += $game->boxScore[$i]->t;
	}
}
end($plays)->x = 1;
$game->setSortPlays($plays);
$game->aScore = end($plays)->a;
$game->hScore = end($plays)->h;
//echo $game;
echo json_encode($game);









function getTeamData($team,$dbcon,$index,$sportVars) {
	$query = 'SELECT * FROM '.strtoupper($sportVars['id']).'_TEAMS WHERE TEAM_NAME = "'.$team->teamName.'" OR ABBR_NAME = "'.$team->short.'" OR TEAM_NAME = "'.$team->short.'"';
	$data = mysqli_query($dbcon, $query);
	if ($data) {
		if (mysqli_num_rows($data)==1) {
			$row = mysqli_fetch_array($data);
			$team->primary = $row['PRIMARY_COLOR'];
			$team->secondary = $row['SECONDARY_COLOR'];
			$team->id = $row['ID'];
			$team->teamName = $row['TEAM_NAME'];
			$team->short = $row['ABBR_NAME'];
			return;
		}
	}
	$secondary = array("h"=>"FF00FF","a"=>"6FFF00");
	//$primary = array("h"=>"000000","a"=>"888888");
	$primary = array("h"=>"993CF3","a"=>"4D4DFF");
	$team->primary = $primary[$index];
	$team->secondary = $secondary[$index];
	$team->id = 0;
}
mysqli_close($dbcon);
?>

