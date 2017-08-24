<?php


$lat = $_GET["lat"];
$lng = $_GET["lng"];
$fetchTimeObjs = $_GET["fetchTimeObjs"];
$postIdsFaved = [];
$postIdsFavedStr = "";
if(isset($_GET["postIdsFaved"])){$postIdsFaved = $_GET["postIdsFaved"];}
setcookie("lastUserLoc", "$lat".","."$lng", time() + (86400 *30), "/");

$orStr = " and (";
for($i=0;$i<count($fetchTimeObjs);$i++){
	$or = " or ";
	if($i==0){$or="";}
	$start = round($fetchTimeObjs[$i]["start"]/1000);
	$end = round($fetchTimeObjs[$i]["end"]/1000);
	$orStr.="$or(startTime < $end and startTime >= $start)";
}
$orStr .=")";
if(count($fetchTimeObjs)==0){$orStr="and startTime < 10 ";}

include('/var/DBcred.php');
$conn = new mysqli($HOST, $USER, $PASSWORD, $DATABASE, $PORT);
#$qstr = "select id,lat,lng,post,postIp,startTime,voteCount,event, neighbors".
#	" from Posts where (abs($lat - lat) + abs($lng - lng))<.46 ". 
#	" $orStr order by(abs($lat-lat)+abs($lng-lng)) asc, startTime desc limit 100";
#$result = $conn->query($qstr);
$rA=[];
#$lls = [];
#$tot=0;
#while($r = $result->fetch_assoc()){
#	if(!in_array($r['lat'].",".$r['lng'],$lls)){
#		$rA[] = $r;
#		$lls[] = $r['lat'].",".$r['lng'];
#		$tot ++;
#		if($tot > 25){break;}
#	}
#}


for($i=0;$i<count($postIdsFaved);$i++){
	$id = $postIdsFaved[$i];
	$result = $conn->query("select * from Posts where id=$id $orStr");
	if($r = $result->fetch_assoc()){
		$rA[] = $r;
		$rA[count($rA)-1]["post"] = stripslashes($rA[count($rA)-1]["post"]);
		$postIdsFavedStr= $postIdsFavedStr.$r["id"].","; 
	}
}
setcookie("userFavPosts", substr($postIdsFavedStr,0,-1), time() + (86400 * 30), "/");
echo json_encode($rA);




?>



