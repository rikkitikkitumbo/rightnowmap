<?php


include('/var/DBcred.php');
session_start();
if($_SESSION["pword"] != 'grego421'){echo 'need pword'; return;}
$conn = new mysqli($HOST,$USER,$PASSWORD,$DATABASE,$PORT);
$logFile = fopen(getcwd()."/fbL.txt","w") or die("unable to open log file");

//write start time
date_default_timezone_set('America/Los_Angeles');
$nowStr = Date('Y-m-d H:i:s', time());
fwrite($logFile, "start: ".$nowStr."\n"); 

//global context for file_get_contents calls 
$ctx = stream_context_create(array(
    'http' => array(
        'timeout' => 600,
        'ignore_errors' => true
        )
    )
);

$latsStored = []; $lngsStored = []; $startsStored = []; $spams = 0;
for($k=0;$k<7;$k++){
$fbLines = fopen(getcwd()."/fbLoad".$k.".txt","r") or die("unable to open file");
$news=0; $dups=0; $qTimes=0; $noTimes=0; $googLocs=0; $noLocs=0;
while($ln = fgets($fbLines)){
$ln = ( substr($ln,9,strlen($ln)) );
#echo $ln;


$lnd = json_decode($ln);
for($i=0;$i<count($lnd->payload->results[0]->events);$i++){
	$pTime = $lnd->payload->results[0]->events[$i]->dateAndTime;
	$time = preg_split('[ ]',$lnd->payload->results[0]->events[$i]->dateAndTime);
	$month = $lnd->payload->results[0]->events[$i]->month;
	$date = $lnd->payload->results[0]->events[$i]->day;
	$hr = preg_split('[:]',$time[1])[0];
	$min = preg_split('[:]',$time[1])[1];
	$ampm = $time[2];
	if($min==''){$min=0;}
	$startTime = convTime($month,$date,$hr,$min,$ampm);
	$link="https://facebook.com/events/".$lnd->payload->results[0]->events[$i]->id;
	$img= "<img src=\"".$lnd->payload->results[0]->events[$i]->coverPhoto->uri."\" class='meetupImg'>";
	$description = $lnd->payload->results[0]->events[$i]->description;
	$title = $lnd->payload->results[0]->events[$i]->title;
	$loc = $lnd->payload->results[0]->events[$i]->location;
	echo "next: $month,$date,$hr,$min,$ampm | $startTime | $title <br><br>";
	if($ampm != "am" && $ampm != "pm" && $ampm!="AM" && $ampm!="PM"){
		$qTimes++;
		preg_match("/\\s[0-9:]+[am|pm]{2}/",$description,$matches);
		$newtime = trim($matches[0]);
		$newtime = substr($newtime,0,-2)." ".substr($newtime,strlen($newtime)-2,strlen($newtime));
		$time = preg_split('[ ]',$newtime);
		$hr = preg_split('[:]',$time[0])[0];
		$min = preg_split('[:]',$time[0])[1];
		$ampm = $time[1];
		if($min==''){$min=0;}
		$startTime = convTime($month,$date,$hr,$min,$ampm);
		echo "time changed?: $newtime, $startTime | $month,$date,$hr,$min,$ampm | $startTime | $title <br>";
	}
	if($ampm != "am" && $ampm != "pm" && $ampm!="AM" && $ampm!="PM"){echo "noTime!:$link <br>"; $noTimes ++; continue;}
	$description = preg_replace("/\n/","<br>",$description);
	
	// geolocate
	$adr = urlencode("$loc");
	$d = file_get_contents("https://searchahead-public-api-b2c-production.cloud.mapquest.com/search/v3/prediction?collection=address,adminArea,airport,category,franchise,poi&feedback=true&key=Qi4KYzoLWofj0T1FcJTYpEiERWepV7P0&limit=1&location=-122.78401851654053,45.51650427896908&q=$adr");
	$d = json_decode($d);
	$lat= round(floatval($d->results[0]->place->geometry->coordinates[1]),5);
	$lng= round(floatval($d->results[0]->place->geometry->coordinates[0]),5);
 	echo "location: $lat, $lng | $loc <br>";
 	if($lat==0 || $lng==0){ //try with google if mapquest sucked
	 	$ress = file_get_contents("https://www.google.com/maps/place/$adr",null,$ctx,0,1000);
		$pattern = "/\(\[\[\[[^,]*,([^,]*),([^\]]*)/";
		preg_match($pattern,$ress,$matches);
		$lat = round(floatval($matches[2]),5);
		$lng = round(floatval($matches[1]),5);
		$googLocs++;
		echo "Googlocation: $lat, $lng | $loc <br>";
 	}
 	if($lat=='' || $lng==''){echo 'loc not found!<br>'; $noLocs++; continue;}
 	
 	
 	//check for spamming, if there is a similar post in the db, skip!
	$spam=0;
	$sC = 0;
	global $latsStored;global $lngsStored;global $startsStored;
	while($sC<count($latsStored) && $spam==0){
		if(abs($latsStored[$sC]-$lat)<.001 && abs($lngsStored[$sC]-$lng)<.001 && abs($startsStored[$sC]-$startTime)<=4500){
			$spam=1;
			$spams++;
		}
		$sC++;
	}
	if($spam==1){echo "spam!: $link<br>"; continue;}
	$latsStored[]=$lat; $lngsStored[]=$lng; $startsStored[]=$startTime;

 	
 	//make post 
 	$post = "<b>$title - </b><br>$img<br><br>When: $startTime<br>".
			"Where: $loc<br>Link: <a href='$link' target='_blank'>$link</a><br>".
			"Description:<br> $description";
	$post = addslashes($post);
	
	//insert 
	$rat = cos(deg2rad($lat));
	$plat= $lat + 0.03639;
	$mlat= $lat - 0.03639;
	$plng= $lng + 0.03639/$rat;
	$mlng= $lng - 0.03639/$rat;
	
	$r = $conn->query("select id from Posts where lat=$lat and lng=$lng and startTime=$startTime");
	if(mysqli_num_rows($r)>0){
		$dups++;
		continue;
	}
	
	$r = $conn->query("select id from Posts where lat<$plat and lat>$mlat and".
		" lng<$plng and lng>$mlng and post like '%$link%'");
	if(mysqli_num_rows($r)>0){
		$dups++;
		$id = $r->fetch_assoc()["id"];
		$result = $conn->query("update Posts set lat=$lat,lng=$lng,post='$post',postIp='facebook',".
			"startTime=$startTime,voteCount=0 where id=$id");
		echo $conn->error;
		echo "updated: ".$result."<br>";
		continue;
	}
	
	$news++;
	$result = $conn->query("insert into Posts (lat,lng,post,postIp,startTime,voteCount".
		",delKey,googDir) values ($lat,$lng,'$post','facebook',$startTime,0,0,1)");
	echo "new: $result<br>";
}

} // end of while loop
fwrite ($logFile, "End of file $k | spams: $spams, dups: $dups, news: $news, qTimes: $qTimes, noTimes: $noTimes, googLocs: $googLocs \n");

fclose($fbLines);
}//end of all load files loop

$nowStr = Date('Y-m-d H:i:s', time());
fwrite($logFile, "\n end: ".$nowStr."\n"); 
fclose($logFile);



function convTime($mon,$date,$hr,$min, $ampm){
	$hr = intval($hr);
	$min = intval($min);
	if($ampm=="pm"){$ampm="PM";}
	if($ampm=="am"){$ampm="AM";}
	if($ampm == "PM" && $hr!=12){$hr=$hr+12;}
	if($ampm == "AM" && $hr==12){$hr=0;}
	return mktime($hr,$min,0,$mon+1,$date,2017);
#	return "$mon, $date, $hr, $min";

}







?>

