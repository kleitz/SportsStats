<?php
include_once('classes/simple_html_dom.php');
include_once('classes/game.php');
include_once('classes/dbvars.php');

$dbcon = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

if($dbcon->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');
}

class emptyClass {}
$returnedObject = new emptyClass();
$returnedObject->games = array();


$date = $_REQUEST['date'];
$sport = $_REQUEST['sport'];
$numUnfin = 0;
$numFin = 0;
if (isset($date) &&
		preg_match('/^\d{8}$/',$date) &&
		intval(substr($date,0,4))>1900 &&
		intval(substr($date,4,2))<13 &&
		intval(substr($date,6,2))<32) 
{
	$returnedObject->date = $date;
	if (isset($sport) &&
			preg_match('/^[a-z]{3}$/i',$sport)) 
	{
		$dateSQL = substr($date,0,4).'-'.substr($date,4,2).'-'.substr($date,6,2);
		$select_query = <<<SQL
SELECT 
		gid, 
		home, 
		away, 
		status,
		date
	FROM
		games
	WHERE
		DATE(date) = '$dateSQL'
		AND
		sport = '$sport'
SQL;
		if($select_data = $dbcon->query($select_query)){
			$games = array();
			$unprepGames = 0;
			while($row = $select_data->fetch_assoc()) {
				$game = new emptyClass();
				$game->id = $sport.$row['gid'];
				$game->home = $row['home'];
				$game->away = $row['away'];
				$game->status = $row['status'];
				$game->date = $row['date'];
				$select_date = explode(' ',$row['date']);
				if (!preg_match('/^[lfps]$/',$game->status) &&
					$select_date[1] == '00:00:01' &&
					$date == date(Ymd))
				{
					$unprepGames++;
				}
				array_push($games,$game);
			}
			if ($select_data->num_rows > 0 &&
					$unprepGames == 0) 
			{
				$returnedObject->fetch = 'd';
				$returnedObject->games = $games;
			} else {
				$returnedObject->fetch = 's';
				$html = file_get_html("http://espn.go.com/$sport/schedule/_/date/$date");
				$tables = $html->find("table.schedule");
				foreach($tables as $table) {
					$tNode = $table;
					if (preg_match('/<tbody/',$table->innertext)) {
						foreach($table->nodes as $t) {
							if ($t->tag == 'tbody') {
								$tNode = $t;
								break;
							}
						}
					}
					foreach($tNode->nodes as $schedRow) {
						$game = new emptyClass();
						if ($schedRow->tag == 'tr') {
							for ($srI = 0; $srI<2; $srI++) {
								foreach($schedRow->nodes[$srI]->nodes as $teamA) {
									if (preg_match('/a|span/',$teamA->tag)) {
										foreach($teamA->nodes as $teamSp) {
											if ($teamSp->tag == 'span') {
												if ($srI==0) {
													$game->away = $teamSp->innertext;
												} else {
													$game->home = $teamSp->innertext;
												}
											}
										}
									}
								}
							}
							preg_match('/gameId\=(\d+)/',$schedRow->nodes[2]->innertext,$gameId);
							$game->id=$sport.$gameId[1];
							$game->date = substr($date,0,4) . '-' . substr($date,4,2) . '-' . substr($date,6,2);
							if (preg_match('/(live)/i',$schedRow->nodes[2]->nodes[0]->innertext,$status)) {
								$game->status = 'l';
							} else if (preg_match('/^.+ \d+, .+ \d+( \(\d*OT\))?$/i',$schedRow->nodes[2]->nodes[0]->innertext,$status)) {
								$game->status = 'f';
							} else if (preg_match('/(postponed)/i',$schedRow->nodes[2]->nodes[0]->innertext,$status)) {
								$game->status = 'p';
							} else if (preg_match('/(suspended)/i',$schedRow->nodes[2]->nodes[0]->innertext,$status)) {
								$game->status = 's';
							} else {
								$game->status = "u";
							}
							//set time
							if (preg_match( '/T(\d{2}:\d{2})Z/i', $schedRow->nodes[2]->attr['data-date'], $status)) {
								$game->date .= " $status[2].:00";
							} else {
								$game->date .= ' 00:00:01';
							}
							preg_match_all('/\d/',$schedRow->nodes[2]->nodes[0]->innertext,$scores);
						}
						if (isset($game->away) &&
							isset($game->home) &&
							isset($game->id)) 
						{
							if (!preg_match('/^[lfps]$/',$game->status))
							{
								$numUnfin++;
							} else {
								$numFin++;
							}
							array_push($returnedObject->games,$game);
						}
					}
				}
				if (($numUnfin == 0 || $numFin == 0)
						&& sizeof($returnedObject->games)>0) 
				{
					$gSport = $dbcon->real_escape_string($sport);
					foreach($returnedObject->games as $game) {
						$gid = $dbcon->real_escape_string(substr($game->id,3));
						$gHome = $dbcon->real_escape_string($game->home);
						$gAway = $dbcon->real_escape_string($game->away);
						$gStatus = $dbcon->real_escape_string($game->status);
						$gDate = $dbcon->real_escape_string($game->date);
						$insertSql = <<<SQL
INSERT INTO games
	(gid, home, away, date, sport,status)
	VALUES (
	'$gid',
	'$gHome',
	'$gAway',
	'$gDate',
	'$gSport',
	'$gStatus'
	)
	ON DUPLICATE KEY UPDATE
	gid = VALUES(gid)
SQL;
						if(!$dbcon->query($insertSql)) {
							die('There was an error inserting the data [' . $db->error . ']');
						}
					}
				}
			}
		} else {
			$returnedObject->error = "Failed query.";
		}
	} else {
		$returnedObject->error = "Invalid sport.";
	}
} else {
	$returnedObject->error = "Invalid date.";
}
echo json_encode($returnedObject);

$dbcon->close();




















?>
