<?php

function selectPlayShort($theSportVars, $play, $plays, $teams) {
	if ($theSportVars['id'] == 'ncb') {
		getPlayShortNcb($theSportVars, $play, $plays, $teams);
	} else if ($theSportVars['id'] == 'nba') {
		getPlayShortNba($theSportVars, $play, $plays, $teams);
	} else if ($theSportVars['id'] == 'ncf') {
		getPlayShortNcf($theSportVars, $play, $plays, $teams);
	} else {
		echo "Sport not available.";
	}
}
/* //  NCB  //
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
function getPlayShortNcb($theSportVars, $play, $plays, $teams) {
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
				$plays[$playNum]->p[2] = 's';
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
		} else if (strpos($playTextLower, 'charge') !== false) {
			$playString .= 'c';
		} else {
			$playString .= 'f';
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
		$possession = (end($plays)->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'block') !== false) {
		$playString .= 'b';
		$player1 = str_replace(' Block.','', $play->getPlayText());
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'steal') !== false) {
		$playNum = sizeof($plays)-1;
		if ($plays[$playNum]->p[0] == 't') {
			$plays[$playNum]->x = 0;
			//$plays[$playNum]->x = 1;
			$plays[$playNum]->p .= 's';
			$plays[$playNum]->o = str_replace(' Steal.','', $play->getPlayText());
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
	} else if (strpos($playTextLower, 'kicked ball') !== false) {
		//0 - k - kicked ball
		$possessionNew = 0;
		$playString .= 'k';
		$players = explode(' kicked ball',$playTextLower);
		$player1 = $players[0];
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'goaltending') !== false) {
		//0 - g - goaltending
		$possessionNew = 1;
		$playString .= 'g';
		$players = explode(' defensive',$playTextLower);
		$players = explode(' offensive',$players[0]);
		$player1 = $players[0];
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'end ') !== false) {
		$playString .= 'e';
		$playString .= ($play->q <= $theSportVars['regPeriods']+1) ? $play->q : $theSportVars['regPeriods']+1;
		$possessionNew = 1;
		$possession = end($plays)->s;
		$play->e = (end($plays)->s)?end($plays)->s:end($plays)->e;
	}
	else {
		$playString .= $playTextLower;
	}
	$play->p = $playString;
	$play->m = array();
	if ($player2 != "") {
		array_unshift($play->m,ucwords(preg_replace('/\.$/','',trim($player2))));
	}
	if ($player1 != "") {
		array_unshift($play->m,ucwords(preg_replace('/\.$/','',trim($player1))));
	} else if (sizeof($play->m) > 0) {
		array_unshift($play->m, '');
	}
	$play->s = $possession;
	$play->x = $possessionNew;
}




///////////////////
//////  NBA  //////
///////////////////
function getPlayShortNba($theSportVars, $play, $plays, $teams) {
	$playTextLower = strtolower($play->getPlayText());
	$playString = '';
	$player1 = '';
	$player2 = '';
	$possession = '';
	$possessionNew = 0;
	if (strpos($playTextLower, 'makes') !== false ||
			strpos($playTextLower, 'misses') !== false) {
		//0 - 123 - points
		//1 - j jump - type of shot
		//  - t tip
		//  - d dunk
		//  - l layup
		//  - f free throw
		//2 - made?
		//3 - a assist
		//o - assister
		//d - distance
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
				$plays[$playNum]->p[2] = 's';
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
		if  (strpos($playTextLower, 'jump') !== false) {
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
		if (strpos($playTextLower, 'makes') !== false) {
			$possessionNew = 1;
			$possession = ($play->e == 'a') ? 'h' : 'a';
			$playString .= 'm';
			if (strpos($playTextLower, 'assists') !== false) {
				$playString .='a';
				$player2 = explode('(', $playTextLower);
				$player2 = explode(' assist', $player2[1]);
				$player2 = $player2[0];
			}
			$player1 = explode(' makes',$playTextLower);
			$player1 = $player1[0];
		} else {
			$possession = ($play->e == 'a') ? 'a' : 'h';
			$player1 = explode(' misses',$playTextLower);
			$player1 = $player1[0];
		}
		preg_match('/[0-9]+\-foot/',$playTextLower,$distance);
		if (sizeof($distance) == 1) {
			preg_match('/[0-9]+/',$distance[0],$distance);
			$play->d = $distance[0];
		}
		if ($playString[0] == 1) {
			$possessionNew = 1;
		}
	} else if (strpos($playTextLower, 'foul') !== false) {
		//0 - f - foul
		//1 - 1-6 - number personal foul
		//2 - t - technical
		//  - c - charge
		//  - s - shooting
		//  - f - floor
		//  - b - block
		//m - fouler
		//o - drew foul
		$playString .= 'f';
		$numFouls = 1;
		$player1 = preg_split('/( shooting | personal | offensive | loose ball )/', $playTextLower);
		$player1 = $player1[0];
		foreach($plays as $p) {
			if (substr($p->p,0,1) == 'f' &&
					$player1 == $p->m) {
				$numFouls++;
			}
		}
		$playString .= $numFouls;
		if (strpos($playTextLower, 'technical foul') !== false) {
			$playString .= 't';
		} else if (strpos($playTextLower, 'charge') !== false) {
			$playString .= 'c';
		} else if (strpos($playTextLower, 'lose') !== false) {
			$playString .= 'c';
		} else if (strpos($playTextLower, 'block') !== false) {
			$playString .= 'b';
		} else {
			$playString .= 'f';
		}
		if (strpos($playTextLower, ' draws ') !== false) {
			$player2 = explode('(',$playTextLower);
			$player2 = explode(' draws ',$player2[1]);
			$player2 = $player2[0];
		}
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'rebound') !== false) {
		//0 - r - rebound
		//1 - o - offensive
		//  - d - deffensive
		$playString .= 'r';
		if (strpos($playTextLower, 'offensive') !== false) {
			$playString .= 'o';
		} else if (strpos($playTextLower, 'defensive') !== false) {
			$playString .= 'd';
		}
		$player1 = str_replace(' team','', str_replace(' rebound','', str_replace(' offensive','', str_replace(' defensive','', $playTextLower))));
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'timeout') !== false) {
		//0 - o - timeout
		$playString .= 'o';
		if (strpos($playTextLower, $teams[0]->teamName) !== false) {
			$play->e = 'a';
		} else if (strpos($playTextLower, $teams[1]->teamName) !== false) {
			$play->e = 'h';
		}
		$possession = (end($plays)->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'block') !== false) {
		//0 - b - block
		$playString .= 'b';
		$players = explode(' blocks ',$playTextLower);
		$player1 = $players[0];
		$player2 = preg_replace('/ ?\'s [0-9a-z -]+/','',$players[1]);
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'turnover') !== false ||
			strpos($playTextLower, 'bad pass') !== false ||
			strpos($playTextLower, 'traveling') !== false) {
		//turnover
		//0 - t
		//1 - p - bad pass
		//  - t - traveling
		//  - l - lost ball
		//  - u - unknown
		//2 - s? - steal
		//o - stealer
		$playString .= 't';
		$player1 = preg_split('( turnover| bad pass | lost ball| traveling)', $playTextLower);
		$player1 = $player1[0];
		if (strpos($playTextLower, 'bad pass') !== false) {
			$playString .= 'p';
		} else if (strpos($playTextLower, 'traveling') !== false) {
			$playString .= 't';
		} else if (strpos($playTextLower, 'lost ball') !== false) {
			$playString .= 'l';
		} else {
			$playString .= 'u';
		}
		if (strpos($playTextLower, 'steal') !== false) {
			$playString .= 's';
			$player2 = explode('(', $playTextLower);
			$player2 = str_replace(' steals)','', $player2[1]);
		}
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'vs.') !== false) {
		//0 - j - jump
		$playString .= 'j';
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'enters the game for') !== false) {
		//0 - u - substitution
		$possession = end($plays)->e;
		$possessionNew = 0;
		$playString .= 'u';
		$players = explode(' enters the game for ',$playTextLower);
		$player1 = $players[0];
		$player2 = $players[1];
	} else if (strpos($playTextLower, 'kicked ball') !== false) {
		//0 - k - kicked ball
		$possessionNew = 0;
		$playString .= 'k';
		$players = explode(' kicked ball',$playTextLower);
		$player1 = $players[0];
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'goaltending') !== false) {
		//0 - g - goaltending
		$possessionNew = 1;
		$playString .= 'g';
		$players = explode(' defensive',$playTextLower);
		$players = explode(' offensive',$players[0]);
		$player1 = $players[0];
		$possession = ($play->e == 'a') ? 'h' : 'a';
	} else if (strpos($playTextLower, 'end ') !== false) {
		//0 - e - end of period
		//1 - # - period number
		$playString .= 'e';
		$playString .= ($play->q <= $theSportVars['regPeriods']+1) ? $play->q : $theSportVars['regPeriods']+1;
		$possessionNew = 1;
		$possession = end($plays)->s;
		$play->e = (end($plays)->s)?end($plays)->s:end($plays)->e;
	}
	else {
		$playString .= $playTextLower;
	}
	$play->p = $playString;
	$play->m = array();
	if ($player2 != "") {
		array_unshift($play->m,ucwords(preg_replace('/\.$/','',trim($player2))));
	}
	if ($player1 != "") {
		array_unshift($play->m,ucwords(preg_replace('/\.$/','',trim($player1))));
	} else if (sizeof($play->m) > 0) {
		array_unshift($play->m, '');
	}
	$play->s = $possession;
	$play->x = $possessionNew;
}

///////////////////
//////  NCF  ////// - College Football
///////////////////

/*
Kickoff
Run
Pass
Punt
Penalty
Sack
timeout
field goal
*/

/// things I'm missing in TAMU USCe:
// - fumble
// - pass for a loss
// - safety (oregon & auburn)
// - 1 point safety
// - punt or kickoff out of bounds (ore & aub?)
// - field goal returned
// - field goal blocked
// - fake punt (tcu boise fiesta bowl)
// - one point safety (oregon ksu 2013?)
// - regular safety, checking terms and men
// - missed extra point
// - Score by defensive team (including punts) Change XP too
// - Graphing negative yards

// too many coin flips!
function getPlayShortNcf($theSportVars, $play, $plays, $teams) {
	//$play->ppp = $play->getPlayText();
	$playTextLower = strtolower($play->getPlayText());
	$playString = '';
	$player1 = '';
	$player2 = '';
	$player3 = '';
	$possession = '';
	$possessionNew = 0;
	$reVars = array(
		'a'=>'(<a[a-zA-Z0-9:\-_\/\.\"= ]+>)?',
		'aC'=>'(<\/a>)?',
		'name'=>'([A-Z][a-zA-Z\-\'\. ]*)'
	);
	//get yards ball moved
	//g - yards Gained
	if (preg_match_all('/for (no gain|(a loss of )?([0-9]+)( y(ar)?ds?)( line)?)/',$playTextLower,$distance)) {
		$play->g = array();
		forEach($distance[3] as $i=>$d) {
			if (preg_match('/no gain/',$distance[1][$i])) {
				array_push($play->g,0);
			}
			else {
				$sign = (preg_match('/a loss of/',$distance[2][$i]))?-1:1;
				array_push($play->g,$sign*intval($d));
			}
		}
	}
	
	//Get down and yards to go
	//d - down
	//y - yards to go
	//b - ball on the x yardline
	//f - side of the Field
	$playSplit = explode("|",$playTextLower);
	$downYard = $playSplit[0];
	if (preg_match('/^([1-4])[a-z]{2} (down )?and ([0-9]+|goal)/',$downYard,$dy)) {
		$play->d = intval($dy[1]);
		$play->y = intval($dy[3]);
	} else {
		$play->d = 0;
	}
	$aShorts = $teams[0]->getShorts();
	$aShort1 = $aShorts[1];
	$hShorts = $teams[1]->getShorts();
	$hShort1 = $hShorts[1];
	if (preg_match('/50/',$downYard)) {
		$play->b = 50;
	} else if (preg_match('/at '.$aShort1.' ([0-9]+)/i',$downYard,$ballOn)) {
		$play->b = intval($ballOn[1]);
		$play->f = 'a';
	} else if (preg_match('/at '.$hShort1.' ([0-9]+)/i',$downYard,$ballOn)) {
		$play->b = intval($ballOn[1]);
		$play->f = 'h';
	}
	
	//c - sCore - getting convoluted now?
	if (preg_match('/ (touchdown|td|fg|field goal|safety|kick\))/',$playTextLower,$score) ||
			preg_match('/^<b>.*<\/b>$/',$playTextLower)) {
		if (preg_match('/(touchdown|td)/',$score[1])) {
			$play->c .= '6'; 
		} else if (preg_match('/(fg|field goal)/',$score[1])) {
			if (preg_match('/ (fg|field goal) good/',$playTextLower)) {
				$play->c .= '3';
			}
		} else if (preg_match('/safety/',$score[1])) {
			$play->c .= '2';
		} else if (preg_match('/kick\)/',$score[1]) &&
				preg_match('/\('.$reVars['name'].' kick\)/',$playTextLower,$kicker)) {
			$play->c .= '1';
			$play->m = $kicker[1];
		} else {
			$play->c .= '6';
		}
	}
	
	//Get play
	if (strpos($playTextLower, 'coin toss') !== false) {
		//0 - c - coin toss
		$playString .= "c";
		$play->t = $theSportVars['maxTime'];
		$play->x = 0;
		if (strpos($playTextLower, strtolower($teams[0]->teamName)) !== false) {
			$play->e = 'a';
		} else if (strpos($playTextLower, strtolower($teams[0]->teamName)) !== false) {
			$play->e = 'h';
		}
	} else if (strpos($playTextLower, ' pass ') !== false && 
			strpos($playTextLower, 'defensive pass interference') === false) {
		//0 - p - pass
		//1 - i - incomplete
		//2 - b - broken up
		//
		//1 - n - intercepted
		//1 - c - complete
		//m - qb
		//o - reciever
		//n - broken up
		$playString .= "p";
		if (strpos($playTextLower, 'incomplete') !== false) {
			$playString .= "i";
			if (strpos($playTextLower, 'broken up') !== false) {
				$playString .= "b";
				preg_match('/ broken up by '.$reVars['a'].$reVars['name'].$reVars['aC'].'/',$play->getPlayText(),$p3);
				if (sizeof($p3)>0) {
					$player3 = $p3[2];
				}
			}
		} else if (strpos($playTextLower, 'intercepted') !== false) {
			$playString .= "n";
		} else if (strpos($playTextLower, ' complete') !== false) {
			$playString .= "c";
		}
		preg_match('/'.$reVars['a'].$reVars['name'].$reVars['aC'].' pass/',$play->getPlayText(),$player1);
		$player1 = $player1[2];
		preg_match('/ ((in)?complete to|intercepted) '.$reVars['a'].$reVars['name'].$reVars['aC'].'( for|$)/',$play->getPlayText(),$p2);
		if (sizeof($p2)>0) {
			$player2 = $p2[4];
		}
	} else if (strpos($playTextLower, ' sacked ') !== false) {
		//0 - s - sack
		//m - passer
		//o - tackler
		$playString .= "rs";
		preg_match('/'.$reVars['a'].$reVars['name'].$reVars['aC'].' sacked by '.$reVars['a'].$reVars['name'].$reVars['aC'].'/',$play->getPlayText(),$players);
		$player1 = $players[2];
		$player2 = $players[5];
	} else if (strpos($playTextLower, ' run ') !== false) {
		//0 - r - run
		//m - runner
		$playString .= "r";
		preg_match('/'.$reVars['a'].$reVars['name'].$reVars['aC'].' run/',$play->getPlayText(),$p1);
		$player1 = $p1[2];
	} else if (preg_match(' (kickoff|punt|on-side kick) ',$playTextLower,$kp)) {
		//0 - k - kickoff
		//0 - u - punt
		//1 - o - on-side
		//1 - t - touchback
		//m - kicker
		//o - returner
		if ($kp[0] == 'kickoff' ||
				$kp[0] == 'on-side kick') {
			$playString .= 'k';
		} else if ($kp[0] == 'punt') {
			$playString .= 'u';
		}
		if ($kp[0] == 'on-side kick') {
			$playString .= 'o';
		}
		if (preg_match('/ touchback/',$playTextLower)) {
			$playString .= 't';
		} else if (preg_match('/ fair catch/',$playTextLower)) {
			$playString .= 'f';
		}
		preg_match('/'.$reVars['a'].$reVars['name'].$reVars['aC'].' (kickoff|punt|on-side kick)/',$play->getPlayText(),$p1);
		$player1 = $p1[2];
		preg_match('/(fair catch by|,) '.$reVars['a'].$reVars['name'].$reVars['aC'].' (return|at)/',$play->getPlayText(),$p2);
		if (sizeof($p2)>0) {
			$player2 = $p2[3];
		}
	} else if (preg_match(' (fg|field goal) ',$playTextLower,$kp)) {
		//0 - f - field goal
		//1 - g - good
		//1 - m - missed
		//1 - b - blocked
		//m - kicker
		$playString .= "f";
		if (preg_match('/ good/',$playTextLower,$p1)) {
			$playString .= "g";
		} else if (preg_match('/ missed/',$playTextLower,$p1)) {
			$playString .= "m";
		}
		
		preg_match('/'.$reVars['a'].$reVars['name'].$reVars['aC'].' ([0-9]+) yd/',$play->getPlayText(),$p1);
		$player1 = $p1[2];
		if (!isset($play->g)) {
			$play->g = array();
		}
		array_unshift($play->g,intval($p1[4]));
	} else if (strpos($playTextLower, ' penalty') !== false) {
		//0 - n - peNalty
		$playString .= 'n';
	} else if (strpos($playTextLower, 'timeout') !== false) {
		//0 - o - timeout
		$playString .= 'o';
		//echo $teams[0]->teamName;
		if (strpos($playTextLower, strtolower($teams[0]->teamName)) !== false) {
			//echo $playTextLower." a\n";
			$play->e = 'a';
		} else if (strpos($playTextLower, strtolower($teams[1]->teamName)) !== false) {
			//echo $playTextLower." h\n";
			$play->e = 'h';
		}
		//$possession = (end($plays)->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'end ') !== false) {
		//0 - e - end of period
		//1 - # - period number
		$playString .= 'e';
		$playString .= ($play->q <= $theSportVars['regPeriods']+1) ? $play->q : $theSportVars['regPeriods']+1;
		$play->e = (end($plays)->s)?end($plays)->s:end($plays)->e;
	}
	else {
		$playString .= $playTextLower;
	}
	$play->p = $playString;
	if (strlen($play->p)>5) {
		echo $play->id."\n";
	}
	$play->m = array();
	if ($player3 != "") {
		array_unshift($play->m,ucwords(preg_replace('/\.$/','',trim($player3))));
	}
	if ($player2 != "") {
		array_unshift($play->m,ucwords(preg_replace('/\.$/','',trim($player2))));
	} else if (sizeof($play->m) > 0) {
		array_unshift($play->m, '');
	}
	if ($player1 != "") {
		array_unshift($play->m,ucwords(preg_replace('/\.$/','',trim($player1))));
	} else if (sizeof($play->m) > 0) {
		array_unshift($play->m, '');
	}
}
?>
