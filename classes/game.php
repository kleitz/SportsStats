<?php
class Game {
	public $id;
	public $gameDate;
	public $gameTime;
	public $venue;
	public $neutral;
	public $aScore;
	public $hScore;
	public $eventName;
	public $h;
	public $a;
	public $boxScore;
	
	public function isSetGame() {
		return isset($id)
				&& isset($date)
				&& isset($time)
				&& isset($city)
				&& isset($home)
				&& isset($away)
				&& isset($boxScore);
	}
	public function isSetDeep() {
		return $this->isSetGame()
			&& $home->isSetTeam()
			&& $away->isSetTeam();
	}
	
	public function __toString() {
		$returnString = '';
		$returnString .= '<GAME>';
		foreach($this as $key => $value) {
			if (!is_array($value)) {
				$returnString .= '<'.strtoupper($key).">".htmlspecialchars(value)."</".strtoupper($key).'>';
			}
			else {
				$returnString .= '<'.strtoupper($key).">".htmlspecialchars($value)."</".strtoupper($key).'>';
			}
		}
		$returnString .= '</GAME>';
		return $returnString;
	}
}

class GameWithPlays extends game {
	public $plays;
	
	public function setSortPlays($inputPlays) {
		usort($inputPlays, 'idSort');
		$this->plays = $inputPlays;
	}
	
	public function isSetGame() {
		return isset($id)
				&& isset($date)
				&& isset($time)
				&& isset($city)
				&& isset($home)
				&& isset($away)
				&& isset($plays);
	}
	
	public function __toString() {
		$returnString = '';
		$returnString .= '<GAME>';
		foreach($this as $key => $value) {
			$returnString .= '<' . strtoupper($key) . '>';
			if (!is_array($value)) {
				$returnString .= $value;
			}
			else {
				foreach($value as $item) {
					$returnString .= $item;
				}
			}
			$returnString .= '</' . strtoupper($key) . '>';
		}
		$returnString .= '</GAME>';
		return $returnString;
	}
}
function idSort($a, $b) {
	if ($a->id == $b->id) {
		return 0;
	}
	return ($a->id < $b->id) ? -1 : 1;
}

class Play {
	public $id;
	private $playText;
	public $a;	//Away Score
	public $e;	//Team performing play
	public $h;	//Home Score
	public $m;	//player
				// n third player
				// o second player
	public $p; 	//play
	public $q;	//Period with a backwards p
	//public $s;	//possession
	public $t;	//Time
	public $x;  //change of possession
	
	public function getPlayText() {
		return $this->playText;
	}
	public function setPlayText($pt) {
		$this->playText = $pt;
	}
	
	public function __toString() {
		$returnString = '';
		$returnString .= '<PLAY>';
		foreach($this as $key => $value) {
			if (!is_array($value)) {
				$returnString .= '<'.strtoupper($key).">".htmlspecialchars($value)."</".strtoupper($key).'>';
			}
		}
		$returnString .= '</PLAY>';
		return $returnString;
	}
}

class Team {
	public $id;
	public $teamName;
	public $primary;
	public $secondary;
	public $rank;
	private $shorts = array();
	
	
	public function getShorts() {
		return $this->shorts;
	}
	public function setShorts($id,$short) {
		$this->shorts[$id] = $short;
	}
	
	public function isSetTeam() {
		return isset($id)
				&& isset($teamName);
	}
	
	public function __toString() {
		$returnString = '';
		$returnString .= '<TEAM>';
		foreach($this as $key => $value) {
			if (!is_array($value)) {
				$returnString .= '<'.strtoupper($key).">".htmlspecialchars($value)."</".strtoupper($key).'>';
			}
		}
		$returnString .= '</TEAM>';
		return $returnString;
	}
}

class Rank {
	public $id;
	public $rankNumber;
	public $weekDate;
	
	public function __toString() {
		return (string)$rankNumber;
	}
}

class Venue {
	public $city;
	public $state;
	public $venueName;
	
	public function __toString() {
		$returnString = '';
		$returnString .= '<VENUE>';
		foreach($this as $key => $value) {
			if (!is_array($value)) {
				$returnString .= '<'.strtoupper($key).">".htmlspecialchars($value)."</".strtoupper($key).'>';
			}
		}
		$returnString .= '</VENUE>';
		return $returnString;
	}
}

class BoxScore {
	public $id;
	public $period;
	public $a;
	public $h;
	public $l;
	
	public function __toString() {
		$returnString = '';
		$returnString .= '<BOXSCORE>';
		foreach($this as $key => $value) {
			if (!is_array($value)) {
				$returnString .= '<'.strtoupper($key).">".htmlspecialchars($value)."</".strtoupper($key).'>';
			}
		}
		$returnString .= '</BOXSCORE>';
		return $returnString;
	}
}
?>
