<?php

$userIp=$_SERVER['REMOTE_ADDR'];
$lat = $_GET["lat"];
$lng = $_GET["lng"];
$fetchTimeObjs = [];
if(isset($_GET["fetchTimeObjs"])){$fetchTimeObjs = $_GET["fetchTimeObjs"];}
$withinAmt = $_GET["withinAmt"];
$sortBy = $_GET["sortBy"];
$keyWords = $_GET["keyWords"];
$ppF = $_GET["postsPerFetch"];
$num= ($_GET["scrollCount"]*$ppF).",$ppF"; 
setcookie("lastUserLoc", "$lat".","."$lng", time() + (86400 * 30), "/");


if(count($fetchTimeObjs)==0){echo "[]"; return;}

// build or string based on all the fetchTime objects
#$timeOrs = "(";
#for($i=0;$i<count($fetchTimeObjs);$i++){
#	$or = " or ";
#	if($i==0){$or="";}
#	$start = round($fetchTimeObjs[$i]["start"]/1000);
#	$end = round($fetchTimeObjs[$i]["end"]/1000);
#	$timeOrs.="$or(startTime < $end and killTime > $start)";
#}
#$timeOrs .=")";

$timeOrs = "(";
for($i=0;$i<count($fetchTimeObjs);$i++){
	$or = " or ";
	if($i==0){$or="";}
	$start = round($fetchTimeObjs[$i]["start"]/1000);
	$end = round($fetchTimeObjs[$i]["end"]/1000);
	$timeOrs.="$or(startTime >= $start and startTime<= $end)";
}
$timeOrs .=")";



// make sorting order by string
$rat = cos(deg2rad($lat));
$orderByStr = "order by startTime asc, (abs($lat-lat)+abs($lng-lng)*$rat) asc limit $num";
if($sortBy=='distance'){$orderByStr = "order by (pow(abs($lat-lat),2)+pow(abs($lng-lng)*$rat,2)) asc, startTime asc limit $num";}
if(trim($keyWords) != ''){
	$orderByStr = "order by hits desc, startTime asc limit $num";
	if($sortBy=='distance'){$orderByStr = "order by hits desc, (pow(abs($lat-lat),2)+pow(abs($lng-lng)*$rat,2)) asc limit $num";}
}

//make keyWord string
$kw1 = '';
$kw2 = '';
if(trim($keyWords) != ''){
	$kw1 = $kw1.",(";
  $kw2 = $kw2."and (";
  $kws = preg_split('/[ ,]/',$keyWords);
	for($i=0;$i<count($kws);$i++){
 		if($kws[$i]==''){continue;}
			$kw1 = $kw1."(post like '%".addslashes($kws[$i])."%')+";
			$kw2 = $kw2."post like '%".addslashes($kws[$i])."%' || ";
  }
  $kw1 = substr($kw1,0,-1).") as hits";
  $kw2 = substr($kw2,0,-3).")";
}

//make ballpark lat and lng 
$pLat = $lat + 0.014492754*$withinAmt;
$mLat = $lat - 0.014492754*$withinAmt;
$pLng = $lng + (0.014492754/$rat)*$withinAmt;
$mLng = $lng - (0.014492754/$rat)*$withinAmt;
$bLatLngStr = "lat<=$pLat and lat>=$mLat and lng<=$pLng and lng>=$mLng and "; 

// query db 
include('/var/DBcred.php');
$conn = new mysqli($HOST, $USER, $PASSWORD, $DATABASE, $PORT);
$qstr = "select id,lat,lng,post,postIp,startTime,killTime,voteCount,delKey,googDir $kw1".
	" from Posts where $bLatLngStr $timeOrs and ".
	"sqrt(pow(($lat-lat)*69.172,2) + pow((($lng-lng)*69.172*$rat),2))<$withinAmt $kw2 $orderByStr";

$result = $conn->query($qstr);
echo $conn->error; 
$rA=[];
$r = '';
while($r = $result->fetch_assoc()){
	$rA[] = $r;
	$rA[count($rA)-1]["post"] = stripslashes($rA[count($rA)-1]["post"]);
	$rA[count($rA)-1]["editable"]=false; 
	if($rA[count($rA)-1]["postIp"]==$userIp){$rA[count($rA)-1]["editable"]=true;} 
}

echo json_encode($rA);


?>
