<?php
//header('Content-Type: text/xml');
/*echo '<?xml version="1.0" encoding="UTF8"?>';*/
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
		'regPeriods' => 2
	),
	'nba' => array(
		'id' => 'nba',
		'maxTextTime' => '12:00',
		'otTextTime' => '12:00',
		'maxTime' => 720,
		'startPlay' => 'jump ball',
		'startPlayShort' => 'i',
		'regPeriods' => 4
	)
);

if(preg_match('/^[a-zA-Z]{3}[0-9]+$/',$gId) && 
	$sportVars[$sportId] != null) {
	$recordHit = "INSERT INTO HITS (GID) VALUE ('$gId')";
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

$playTable = $html->find('table.mod-data', 0);
//$game = array();
//echo json_encode($game);
$plays = array();
$boxScore = array();
$playid = 0;
$period = 0;
$lastBoxScorePlay = 0;

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


foreach($playTable->nodes as $a) {
	if ($a->tag == "thead") {
		foreach($a->nodes as $b) {
			foreach($b->nodes as $c) {
				if ($c->tag == "th") {
					$c_label = str_replace('</b>','',$c->innertext);
					if (!($c_label == "TIME" || $c_label == "SCORE")) {
						if (!isset($game->a)) {
							$away = new Team();
							$away->teamName = ucwords(strtolower($c_label));
							$away->short = $html->find('td.team',1)->nodes[0]->innertext;
							$game->a = $away;
							getTeamData($game->a,$dbcon,"a",$sportVars[$sportId]);
						}
						else if (!isset($game->h)) {
							$home = new Team();
							$home->teamName = ucwords(strtolower($c_label));
							$home->short = $html->find('td.team',2)->nodes[0]->innertext;
							$game->h = $home;
							getTeamData($game->h,$dbcon,"h",$sportVars[$sportId]);
						}
					}
				}
			}
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
		//echo $a_nodes[3]->innertext . "\n";
		//echo strpos(strtolower($a_nodes[3]->innertext),'jump ball');
		//echo "\n";
		if ((sizeof($plays)==0 || strpos(strtolower(end($plays)->getPlayText()), strtolower('end of ')) !== false) && (strpos(strtolower($a_nodes[1]->innertext),$sportVars[$sportId]['startPlay']) === false && strpos(strtolower($a_nodes[3]->innertext),$sportVars[$sportId]['startPlay']) === false)) {
			$play = new Play();
			//{"id":0,"a":0,"e":"h","h":0,"m":null,"p":"j","q":1,"s":"h","t":2400,"x":1}
			$play->t = $sportVars[$sportId]['maxTime'];
			$play->id = $playid;
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
		$play = new Play();
		$timeExp = explode(':',$a_nodes[0]->innertext);
		$play->t = intval($timeExp[0])*60+intval($timeExp[1]);
		if (count($a_nodes) == 4) {
			$lastPlay = end($plays);
			if (sizeof($plays) == 0) {
				$period++;
			} else if ($lastPlay->p[0] == 'e') {
				$period++;
			}
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
		else {
			$playTeam = 'n';
			if (strpos(strtolower($a_nodes[1]->innertext), strtolower($game->h->teamName)) !== FALSE) {
				$playTeam = 'h'; //home
			}
			else if (strpos(strtolower($a_nodes[1]->innertext), strtolower($game->a->teamName)) !== FALSE) {
				$playTeam = 'a'; //away
			}
			$play->e = $playTeam;
			$play->setPlayText(str_replace('<b>', '', str_replace('</b>', '', $a_nodes[1]->innertext)));
			$lastPlay = end($plays);
			$play->a = $lastPlay->a;
			$play->h = $lastPlay->h;
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
		}
		//If there's no play to start the half/quarter. choose play team.
		if ($playid==1 &&
				$plays[0]->e == "n") {
			//$plays[0]->e = $play->e;
		}
		$play->q = $period;
		selectPlayShort($sportVars[$sportId],$play, $plays, array($game->a,$game->h));
		$play->id = $playid;
		++$playid;
		
		//Fix ESPN data issues
		if ($play->a < end($plays)->a) {
			if (end($plays)->p[2] != 'm') {
				end($plays)->a = $plays[sizeof($plays)-2]->a;
			} else {
				$play->a = end($plays)->a;
			}
		}
		if ($play->h < end($plays)->h) {
			if (end($plays)->p[2] != 'm') {
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
		
		array_push($plays,$play);
	}
}
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

