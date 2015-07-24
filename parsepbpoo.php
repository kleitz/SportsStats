<?php
//header('Content-Type: text/xml');
/*echo '<?xml version="1.0" encoding="UTF8"?>';*/
include_once('classes/simple_html_dom.php');
include_once('classes/game.php');
include_once('classes/dbvars.php');

$dbcon = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

preg_match('/[0-9]+/',$_GET['gameId'],$gameId);
preg_match('/[a-zA-Z]+/',$_GET['gameId'],$sportId);

$html = file_get_html("http://espn.go.com/$sportId[0]/playbyplay?gameId=$gameId[0]&period=0");

//error_reporting(E_ALL);
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400597322'); //Ken TAM
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400788981'); //Wis Duke
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400546902'); //Neb Bay + Tech + team foul
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400597403'); //SC TAMU
//$html = file_get_html('http://espn.go.com/ncb/playbyplay?gameId=400597413'); //ARK TAMU

$playTable = $html->find('table.mod-data', 0);
$game = array();
$game = new GameWithPlays();
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
							getTeamData($game->a,$dbcon,"a");
						}
						else if (!isset($game->h)) {
							$home = new Team();
							$home->teamName = ucwords(strtolower($c_label));
							$home->short = $html->find('td.team',2)->nodes[0]->innertext;
							$game->h = $home;
							getTeamData($game->h,$dbcon,"h");
						}
					}
				}
			}
		}
	}
	else if ($a->tag == "tr") {
		$a_nodes = $a->nodes;
		//echo $a_nodes[3]->innertext . "\n";
		//echo strpos(strtolower($a_nodes[3]->innertext),'jump ball');
		//echo "\n";
		if ((sizeof($plays)==0 || strpos(strtolower(end($plays)->getPlayText()), strtolower('end of ')) !== false) && (strpos(strtolower($a_nodes[1]->innertext),'jump ball') === false && strpos(strtolower($a_nodes[3]->innertext),'jump ball') === false)) {
			$play = new Play();
			//{"id":0,"a":0,"e":"h","h":0,"m":null,"p":"j","q":1,"s":"h","t":2400,"x":1}
			$play->t = 1200;
			$play->id = $playid;
			$playid++;
			$play->p = "j";
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
			if ($a_nodes[0]->innertext == "20:00" || ($lastPlay->t == "0:00" && $a_nodes[0]->innertext == "5:00")) {
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
		$play = getPlayShort($play, $plays);
		$play->q = $period;
		$play->id = $playid;
		++$playid;
		array_push($plays,$play);
	}
}
for($boxI = 0; $boxI<sizeof($boxScore); $boxI++) {
	if ($boxI == 0) {
		$boxScore[$boxI]->l = "1st";
	} else if ($boxI == 1) {
		$boxScore[$boxI]->l = "2nd";
	} else {
		$boxScore[$boxI]->l = "OT";
		$boxScore[$boxI]->ot = true;
		if (sizeof($boxScore)>3) {
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






/*
1 - free throw attempt
2 - 2 point shot
3 - 3 point shot
a - assist
b - block
d - dunk
e - technical foul
f - foul
i - tip-in
l - layup
m - made attempt
o - timeout
r - rebound
s - steal
u - jump shot
t - turnover
x - unknown
z - other attempted shot
*/
function getPlayShort($play, $plays) {
	$playTextLower = strtolower($play->getPlayText());
	$playString = '';
	$player1 = '';
	$player2 = '';
	$possession = '';
	$possessionNew = 0;
	if (strpos($playTextLower, 'made') !== false ||
			strpos($playTextLower, 'missed') !== false) {
		if  (strpos($playTextLower, 'three') !== false) {
			$playString .= '3';
		} else if (strpos($playTextLower, 'free throw') !== false) {
			$playString .= '1';
			$playNum = sizeof($plays)-1;
			if ($plays[$playNum]->p[0] == '1') {
				$plays[$playNum]->x = 0;
			}
			if ($plays[$playNum]->p[0] == 'o') {
				$playNum--;
			}
			if ($plays[$playNum]->p[0] == 'f') {
				$plays[$playNum]->p .= 's';
				$plays[$playNum]->x = 0;
				$playNum--;
				if ($plays[$playNum]->p[0] == '2' || 
						$plays[$playNum]->p[0] == '3') {
					$plays[$playNum]->x = 0;
				}
			}
		} else {
			$playString .='2';
		}
		if  (strpos($playTextLower, 'jumper') !== false) {
			$playString .= 'j';
		} else if (strpos($playTextLower, 'tip') !== false) {
			$playString .= 't';
		} else if (strpos($playTextLower, 'dunk') !== false) {
			$playString .= 'd';
		} else if (strpos($playTextLower, 'layup') !== false) {
			$playString .= 'l';
		} else if (strpos($playTextLower, 'free') !== false) {
			$playString .= 'f';
		} else {
			$playString .= 'z';
		}
		if (strpos($playTextLower, 'made') !== false) {
			$possessionNew = 1;
			$possession = ($play->e == 'a') ? 'h' : 'a';
			$playString .= 'm';
			if (strpos($playTextLower, 'assisted') !== false) {
				$playString .='a';
				$strStart = strpos($play->getPlayText(), 'Assisted by ')+12;
				$player2 = substr($play->getPlayText(), $strStart, strlen($play->getPlayText()) - $strStart - 1);
			}
			$player1 = explode(' made',$play->getPlayText());
			$player1 = $player1[0];
		} else {
			$possession = ($play->e == 'a') ? 'a' : 'h';
			$player1 = explode(' missed',$play->getPlayText());
			$player1 = $player1[0];
		}
		if ($playString[0] == 1) {
			$possessionNew = 1;
		}
	} else if (strpos($playTextLower, 'foul') !== false) {
		$playString .= 'f';
		$numFouls = 1;
		$player1 = str_replace('.','', str_replace('Foul on ', '', $play->getPlayText()));
		foreach($plays as $p) {
			if (substr($p->p,0,1) == 'f' &&
					$player1 == $p->m) {
				$numFouls++;
			}
		}
		$playString .= $numFouls;
		if (strpos($playTextLower, 'technical foul') !== false) {
			$playString .= 't';
		}
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'rebound') !== false) {
		$playString .= 'r';
		if (strpos($playTextLower, 'offensive') !== false) {
			$playString .= 'o';
		} else if (strpos($playTextLower, 'defensive') !== false) {
			$playString .= 'd';
		}
		$player1 = str_replace(' Rebound.','', str_replace(' Offensive','', str_replace(' Defensive','', $play->getPlayText())));
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'timeout') !== false) {
		$playString .= 'o';
		$possession = ($play->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'block') !== false) {
		$playString .= 'b';
		$player1 = str_replace(' Block.','', $play->getPlayText());
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'steal') !== false) {
		$playNum = sizeof($plays)-1;
		if ($plays[$playNum]->p[0] == 't') {
			$plays[$playNum]->x = 0;
		}
		$playString .= 's';
		$player1 = str_replace(' Steal.','', $play->getPlayText());
		$possession = ($play->e == 'a') ? 'a' : 'h';
		$possessionNew = 1;
	} else if (strpos($playTextLower, 'turnover') !== false) {
		$playString .= 't';
		$player1 = str_replace(' Turnover.','', $play->getPlayText());
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'jump ball') !== false) {
		$playString .= 'j';
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'end') !== false) {
		$playString .= 'e';
		$possessionNew = 1;
		$possession = end($plays)->s;
		$play->e = (end($plays)->s)?end($plays)->s:end($plays)->e;
	}
	else {
		$playString .= $playTextLower;
	}
	$play->p = $playString;
	if ($player1 != "") {
		$play->m = $player1;
	}
	if ($player2 != "") {
		$play->o = $player2;
	}
	$play->s = $possession;
	$play->x = $possessionNew;
	return $play;
}


function getTeamData($team,$dbcon,$index) {
	$query = 'SELECT * FROM CMB_TEAMS WHERE TEAM_NAME = "'.$team->teamName.'" OR ABBR_NAME = "'.$team->short.'"';
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

