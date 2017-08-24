<?php 

$postId = $_POST["postId"];
$voterIp = addslashes($_SERVER['REMOTE_ADDR']);

include(dirname(__dir__).'/DBcred.php');
include('/var/DBcred.php');
$conn = new mysqli($HOST, $USER, $PASSWORD, $DATABASE, $PORT);

//have you been voting a lot of things lately?
$now = time();
$fiveAgo = $now - 5*60;
$act = $conn->query("select * from Votes where voterIp='$voterIp'".
	" and time>'$fiveAgo'");
$actNum =0;
while($r=$act->fetch_assoc()){
	$actNum++;
}
if($actNum > 10){echo 'you are voting too much'; return;};


//have you already downvoted this post?
$act = $conn->query("select * from Votes where voterIp='$voterIp'".
		" and postId=$postId");
$voteTotal=0;
while($r=$act->fetch_assoc()){
	$voteTotal = $r["voteTotal"];
}
if($voteTotal < 0){echo "already downVoted"; return;}



//ok to downVote! first change rightNowPosts, and then add to rightNowVotes
if($voteTotal == ''){$voteTotal=0;}
$c = $conn->query("select voteCount from Posts where id=$postId");
$c = $c->fetch_assoc()["voteCount"];
$c = intval($c);
$c = $c-1;
if($c<-5){
	$conn->query("delete from Posts where id=$postId"); 
	echo 2; return; 
}

$r = $conn->query("update Posts set voteCount='$c' where id=$postId");


$voteTotal--;
$result = $conn->query("insert into Votes (voterIp, postId, voteTotal, time) ".
				"values ('$voterIp', '$postId', $voteTotal, '$now')");


echo $result + $r;





?>
