<?php 

$postId = $_POST["postId"];
$voterIp = addslashes($_SERVER['REMOTE_ADDR']);

include('/var/DBcred.php');
$conn = new mysqli($HOST, $USER, $PASSWORD, $DATABASE, $PORT);



//are you voting too much?
$now = time();
$fiveAgo = $now - 5*60;
$act = $conn->query("select * from Votes where voterIp='$voterIp'".
	" and time>'$fiveAgo'");
$actNum =0;
while($r=$act->fetch_assoc()){
	$actNum++;
}
if($actNum > 10){echo 'you are voting too much'; return;};

//have you already upvoted this??
$act = $conn->query("select * from Votes where voterIp='$voterIp'".
	" and postId=$postId");
$voteTot =0;
while($r = $act->fetch_assoc()){
	$voteTot=$r["voteTotal"];
}
if($voteTot>0){echo 'already upvoted'; return;}


//ok to upvote! first change Posts, and then add to Votes
if($voteTot==''){$voteTot=0;}
$voteTot++;
$c = $conn->query("select voteCount from Posts where id=$postId");
$currCount = $c->fetch_assoc()["voteCount"];
$currCount ++;
$r = $conn->query("update Posts set voteCount=$currCount where ".
			"id=$postId");
#if($currCount>100){
#	$conn->query("update Posts set killTime=startTime + 3600 ".
#		"where id=$postId");
#}

			
$result = $conn->query("insert into Votes (voterIp,postId,voteTotal,time) values ".
	"('$voterIp','$postId',$voteTot,'$now')");

echo $result + $r;
			
			


?>
