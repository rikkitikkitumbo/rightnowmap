<?php 
//this is how we made the list of citiesFile
#$citiesFile = fopen("/var/www/html/php/rightNow/meetupfetch/cities.txt","w") or die("unable to open file");
#$bgStr=file_get_contents("/var/www/html/php/rightNow/meetupfetch/html.txt");
#$regStr ="/<td>[^<]+<\/td>[^}]+?(?=title)title=\'(?<cities>[^\']*)\'[^}]+?(?=class=\'geo\')class=\'geo\'>(?<lats>[^;]+); (?<lngs>[^<]+)/";
#preg_match_all($regStr,$bgStr,$matches);
#echo count($matches[0]);

#for($i=0;$i<count($matches[0]);$i++){
#    fwrite($citiesFile,$matches['cities'][$i].'|');
#    fwrite($citiesFile,$matches['lats'][$i].'|');
#    fwrite($citiesFile,$matches['lngs'][$i]."\n");
#}
#return;

//set_time_limit(0);
//global context for file_get_contents calls 
session_start();
if($_SESSION["pword"] != 'grego421'){echo 'pword fail'; return;}
$ctx = stream_context_create(array(
    'http' => array(
        'timeout' => 600,
        'ignore_errors' => true,
        'header'=>'Connection: close\r\n'
        )
    )
);

include('/var/DBcred.php');
$conn = new mysqli($HOST,$USER,$PASSWORD,$DATABASE,$PORT);

//print start time
$logFile = fopen(getcwd()."/meL.txt","w") or die("unable to open file");
date_default_timezone_set('America/Los_Angeles');
$nowStr = Date('Y-m-d H:i:s', time());
fwrite($logFile, "start: ".$nowStr."\n"); 


//start the big loop, doing meetup fetches for each city in our citiesFile
$citiesFile = file(getcwd()."/cities.txt") or die("unable to open file");
for($cities=21;$cities<22;$cities++){
$cityLineArray =  preg_split("/\|/",$citiesFile[$cities]); 
$cLat= floatval($cityLineArray[1]);
$cLng=floatval($cityLineArray[2]); 
$latsStored = []; $lngsStored = []; $startsStored = []; $meetingsStored =[];
$s = (time() - 10000 )*1000;
for($jj=0;$jj<9;$jj++){  //had to put this in a loop because of meetup limits.
	$dups = 0; $spams=0; $news=0; $onlines=0;
	global $s;
	$url = "https://api.meetup.com/2/open_events?and_text=False&lat=$cLat&lon=$cLng".
		"&offset=0&format=json&limited_events=False&photo-host=public&page=175".  //dont forget 175!!!!!!!!!!1
		"&radius=75&desc=False&time=$s,1m&status=upcoming&key=54466a581a13a557b5b485a5f32103a";
	$g = file_get_contents($url);
	$data = json_decode($g);
	$len =  count($data->results);

	for($i=0;$i<$len;$i++){
		//continue if it's an online thing
		if(!$data->results[$i]->venue->lat){$onlines++; continue;}
		$place = $data->results[$i]->venue->name;
		if(preg_match("/online/i", $place)){$onlines++; continue;}
		
		$lat = round($data->results[$i]->venue->lat, 5);
		$lng = round($data->results[$i]->venue->lon, 5);
		$a1 = $data->results[$i]->venue->address_1;
		$c1 = $data->results[$i]->venue->city;
		$s1 = $data->results[$i]->venue->state;
		

		$link = $data->results[$i]->event_url;
		$meetingName = trim($data->results[$i]->name);
		$group = $data->results[$i]->group->name;
		$urlname = $data->results[$i]->group->urlname;
		$description = addslashes($data->results[$i]->description);
		$start = intval($data->results[$i]->time)/1000;
		$end = $start+3600; //two hours 7200
		
		//check for spamming, if there is a similar post in the db, skip!
		$spam=0;
		$sC = 0;
		global $latsStored;global $lngsStored;global $startsStored;global $meetingsStored;
		while($sC<count($latsStored) && $spam==0){
			if(abs($latsStored[$sC]-$lat)<.001 && abs($lngsStored[$sC]-$lng)<.001 
				&& abs($startsStored[$sC]-$start)<=4500 || $meetingsStored[$sC]==$meetingName){
				$spam=1;
				$spams++;
			}
			$sC++;
		}
		if($spam==1){continue;}
		$latsStored[]=$lat; $lngsStored[]=$lng; $startsStored[]=$start; $meetingsStored[]=$meetingName;
		
		// geolocate
		$adr = urlencode("$place, $a1, $c1, $s1");
		$ress = file_get_contents("https://www.google.com/maps/place/$adr",null,$ctx,0,1000);
		$pattern = "/\(\[\[\[[^,]*,([^,]*),([^\]]*)/";
		preg_match($pattern,$ress,$matches);
		$glat = round(floatval($matches[2]),5);
	 	$glng = round(floatval($matches[1]),5);
	 	$l = abs($lat - $glat);
	 	$ln = abs($lng - $glng);
	 	$sum = $l + $ln;
	 	if($sum > 1.0){
	 	}
	 	if($sum <= 1.0){
		 	$lat = $glat;
		 	$lng = $glng;
		}
		
		//get img
		$pg= file_get_contents($link,false,$ctx,0,8000);
		$pattern = '/property=\"og:image\" content=\"([^"]+)/';
		preg_match($pattern, $pg, $matches);
		$img = $matches[1];
		$img = preg_replace('/highres_/','global_',$img);
		if($img=='https://a248.e.akamai.net/secure.meetupstatic.com/s/img/786824251364989575000/logo/swarm/m_swarm_630x630.png'){
			$img='';}
		$hImg='';
		if($img==''){$hImg='hidden';}
		
		//make post
		$post = "<b>$group - </b><img src='$img' class=\"listMImg $hImg\"></img> \"$meetingName\"<br><br>When: $start<br>".
			"Where: $place, $a1, $c1<br>Link: <a href='$link' target='_blank'>meetup.com/".$urlname."</a><br>".
			"Description: $description";
		$post = addslashes($post);
		
		//write to db
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
			$id=$r->fetch_assoc()["id"];
			$dups++;
			$r = $conn->query("update Posts set lat=$lat, lng=$lng, post='$post', postIp='meetup', ".
				"img='', startTime=$start, killTime=$end, voteCount=0, delKey='meetup', googDir=1 where id=$id");
		}
		
		$news++;
		$r = $conn->query("insert into Posts (lat, lng, post, postIp, startTime, killTime, voteCount, googDir)".
			"values ($lat, $lng, '$post', 'meetup', $start, $end, 0, 1)");
		
		
		global $s;
		$s=$start*1000;
	}//end of a single meetup fetch

	fwrite($logFile,"completed loop $jj for city: $cities| spams: $spams, dups: $dups, news: $news, onlines: $onlines |");
	$nowStr = Date('Y-m-d H:i:s', time());
	fwrite($logFile, " $nowStr \n"); 
}//end of meetup fetch loop (4 for each city)

}//end of cities loop from citiesFile

date_default_timezone_set('America/Los_Angeles');
$nowStr = Date('Y-m-d H:i:s', time());
fwrite($logFile, "\n end: ".$nowStr."\n"); 
fclose($logFile);




?>




