<?php 


function writeFile($content){

	file_put_contents('events.json', $content);
}

function readFileJson(){

	$jsonFile = file_get_contents('events.json');
	return $jsonFile;
}


if (isset($_POST['allEvents'])) {

	writeFile(json_encode($_POST['allEvents']));
	
} else {

	$events = readFileJson();
	echo $events;
}


 ?>