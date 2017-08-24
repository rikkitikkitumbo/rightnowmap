<?php
include('/var/DBcred.php');
session_start();
if($_SESSION["pword"] != 'grego421'){echo 'incorrect pword'; return;}
$conn = new mysqli($HOST,$USER,$PASSWORD,$DATABASE,$PORT);
$logFile = fopen(getcwd()."/ebL.txt","w") or die("unable to open log file");

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

//start the big loop, doing meetup fetches for each city in our citiesFile
$citiesFile = file(getcwd()."/cities.txt") or die("unable to open file");
for($cities=22;$cities<23;$cities++){
$cityLineArray =  preg_split("/\|/",$citiesFile[$cities]); 
$cLat= floatval($cityLineArray[1]);
$cLng=floatval($cityLineArray[2]); 
$latsStored = []; $lngsStored = []; $startsStored = []; $titlesStored = [];

for($page=0;$page<18;$page++){ 
	$spams=0; $dups=0; $news=0; $onlines=0;
	$str = "https://www.eventbriteapi.com/v3/events/search/?sort_by=date&location.within=100mi".
	"&location.latitude=$cLat&location.longitude=$cLng&page=$page".
	"&include_all_series_instances=on&include_unavailable_events=on&token=ZFUBXV26Y76W5KOHM45L";
	$lnd = json_decode(file_get_contents($str,false,$ctx));

	for($i=0;$i<count($lnd->events);$i++){
		$title = $lnd->events[$i]->name->text;
		$description = $lnd->events[$i]->description->html;
		$startTime = strtotime($lnd->events[$i]->start->utc);
		$killTime = $startTime + 3600;
		$venue_id = $lnd->events[$i]->venue_id;
		$imgSrc = $lnd->events[$i]->logo->url;
		if(strlen($imgSrc)>4){$img = "<img src='".$imgSrc."' class='listEImg'><br>";}
		else{$img='';}
		$link = $lnd->events[$i]->url;
		
		//geoLocate 
		$str=file_get_contents($link,null,$ctx,0,16000);
		preg_match("/event:location:latitude\" content=\"([^\"]+)/",$str,$latMatch);
		$lat = $latMatch[1];
		preg_match("/event:location:longitude\" content=\"([^\"]+)/",$str,$lngMatch);
		$lng = $lngMatch[1];
		preg_match("/at ([^.]{1,150}). Find event/", $str, $locMatch);
		$loc = $locMatch[1];
		if($lat=='' || $lng=='' || preg_match("/online/i",$loc)){
			$onlines++;
			continue;
		}

		//check for spamming, if there is a similar post in the db, skip!
		$spam=0;
		$sC = 0;
		global $latsStored;global $lngsStored;global $startsStored;global $titlesStored;
		while($sC<count($latsStored) && $spam==0){
			if(abs($latsStored[$sC]-$lat)<.001 && abs($lngsStored[$sC]-$lng)<.001 
			&& abs($startsStored[$sC]-$startTime)<=4500||
			abs($startsStored[$sC]-$startTime)<=21600 && $titlesStored[$sC]==$title){
				$spam=1;
				$spams++;
			}
			$sC++;
		}
		if($spam==1){continue;}
		$latsStored[]=$lat; $lngsStored[]=$lng; $startsStored[]=$startTime; $titlesStored[]=$title;
		
		//make post
		$post = "<b>$title - </b><br>$img<br>When: $startTime<br>".
			"Where: $loc<br>Link: <a href='$link' target='_blank'>".substr($link,0,-30)."</a><br>".
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
			$id=$r->fetch_assoc()["id"];
			$result = $conn->query("update Posts set post='$post', lat=$lat,lng=$lng,postIp='eventBrite',".
				"startTime=$startTime,killTime=$killTime,voteCount=0,delKey=0,googDir=1 where id=$id");
			continue;
		}
	
		$news++;
		$result = $conn->query("insert into Posts (lat,lng,post,postIp,startTime,killTime,voteCount".
			",delKey,googDir) values ($lat,$lng,'$post','eventBrite',$startTime,$killTime,0,0,1)");
	
	}//end of all events for this page
 
 	fwrite($logFile,"completed loop $page for city: $cities, spams: $spams, dups: $dups, news: $news, onlines: $onlines |");
 	$nowStr = Date('Y-m-d H:i:s', time());
	fwrite($logFile, "$nowStr \n"); 
} //end of loop for this city 

}//end of everthing


$nowStr = Date('Y-m-d H:i:s', time());
fwrite($logFile, "\n end: ".$nowStr."\n"); 
fclose($logFile);








?>

