<?php
include_once('classes/simple_html_dom.php');
include_once('classes/game.php');
include_once('classes/dbvars.php');

$dbcon = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

if($db->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');
}

class emptyClass {}
$returnedObject = new emptyClass();
$returnedObject->games = array();


$date = $_REQUEST['date'];
$sport = $_REQUEST['sport'];
if (isset($date) &&
		preg_match('/\d{8}/',$date) &&
		intval(substr($date,0,4))>1900 &&
		intval(substr($date,4,2))<13 &&
		intval(substr($date,6,2))<32) 
{
	if (isset($sport) &&
			preg_match('/[a-z]{3}/i',$sport)) 
	{
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
					if (preg_match('/(^.+ \d+, .+ \d+( \(\d+OT\))?)|(live)/i',$schedRow->nodes[2]->nodes[0]->innertext,$scores)) {
						$game->started = true;
					}
					preg_match_all('/\d/',$schedRow->nodes[2]->nodes[0]->innertext,$scores);
				}
				if (isset($game->away) &&
						isset($game->home) &&
						isset($game->id)) 
				{
					array_push($returnedObject->games,$game);
				}
			}
		}
		echo $tbody->innertext;
	} else {
		$returnedObject->error = "Invalid sport.";
	}
} else {
	$returnedObject->error = "Invalid date.";
}
echo json_encode($returnedObject);

$dbcon->close();




















?>
