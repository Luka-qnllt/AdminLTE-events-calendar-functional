<?php 

function writeFile($content){

	file_put_contents('draggable-events.json', $content);
}

function readFileJson(){

	$jsonFile = file_get_contents('draggable-events.json');
	return $jsonFile;
}


if (isset($_POST['event'])) {

	if ($_POST['event'] == 'delete') {
		writeFile('');
	} else {
		//echo $_POST['event'];
		//die;
		writeFile(json_encode($_POST['event']));
	}
	
} else {

	$events = readFileJson();
	echo $events;
}



 ?>