<?php

function selectPlayShort($theSportVars, $play, $plays, $teams) {
	if ($theSportVars['id'] == 'ncb') {
		getPlayShortNcb($theSportVars, $play, $plays, $teams);
	} else if ($theSportVars['id'] == 'nba') {
		getPlayShortNba($theSportVars, $play, $plays, $teams);
	} else {
		echo "fuck";
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
	} else if (strpos($playTextLower, 'end') !== false) {
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
	if ($player1 != "") {
		$play->m = preg_replace('/\.$/','',$player1);
	}
	if ($player2 != "") {
		$play->o = preg_replace('/\.$/','',$player2);
	}
	$play->s = $possession;
	$play->x = $possessionNew;
}


/* //  NBA  //
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
		$playString .= 'o';
		if (strpos($playTextLower, $teams[0]) !== false) {
			$play->e = 'a';
		} else if (strpos($playTextLower, $teams[0]) !== false) {
			$play->e = 'h';
		}
		$possession = (end($plays)->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'block') !== false) {
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
		$playString .= 'j';
		$possessionNew = 1;
		$possession = ($play->e == 'a') ? 'a' : 'h';
	} else if (strpos($playTextLower, 'end') !== false) {
		$playString .= 'e';
		$playString .= ($play->q <= $theSportVars['regPeriods']+1) ? $play->q : $theSportVars['regPeriods']+1;
		$possessionNew = 1;
		$possession = end($plays)->s;
		$play->e = (end($plays)->s)?end($plays)->s:end($plays)->e;
	} else if (strpos($playTextLower, 'enters the game for') !== false) {
		$possession = end($plays)->e;
		$possessionNew = 0;
		$playString .= 'u';
		$players = explode(' enters the game for ',$playTextLower);
		$player1 = $players[0];
		$player2 = $players[1];
	} else if (strpos($playTextLower, 'kicked ball') !== false) {
		$possessionNew = 0;
		$playString .= 'k';
		$players = explode(' kicked ball',$playTextLower);
		$player1 = $players[0];
		$possession = ($play->e == 'a') ? 'h' : 'a';
	}
	else {
		echo "asdfasdf";
		$playString .= $playTextLower;
	}
	$play->p = $playString;
	if ($player1 != "") {
		$play->m = ucwords(preg_replace('/\.$/','',trim($player1)));
	}
	if ($player2 != "") {
		$play->o = ucwords(preg_replace('/\.$/','',trim($player2)));
	}
	$play->s = $possession;
	$play->x = $possessionNew;
}
?>
