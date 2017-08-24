<?php



$lat = $_POST["lat"];
$lng = $_POST["lng"];
$post = addslashes($_POST["post"]);
$postIp = addslashes($_SERVER['REMOTE_ADDR']);
$img = addslashes($_POST["img"]);
$eventTimes = $_POST["eventTimes"];
$updateIds = $_POST["updateIds"];
$googDir = $_POST["googDir"];


include('/var/DBcred.php');
$conn = new mysqli($HOST, $USER, $PASSWORD, $DATABASE, $PORT);

//first... how much have you been posting?
$now = time();
$fiveAgo = time() - 10*60;
$act = $conn->query("select * from Posts where postIp='$postIp'".
			" and postTime>'$fiveAgo'");
$actNum=0;
while($g=$act->fetch_assoc()){
	$actNum++;
}
if($actNum > 0 && $updateIds=='normalPost'){
	echo json_encode(array(0,'overposting')); return; 
}


// first try and clean out our db ***plan to do this differently eventually *****
$r = $conn->query("delete from Posts where startTime < $now - 86400");


//overlapping dates check 
$starts = [];
for($i=0;$i<count($eventTimes);$i++){
	for($j=0;$j<count($starts);$j++){
		if(abs(intval($eventTimes[$i]["start"]) - intval($starts[$j]))<18000000){
			echo json_encode(array(0, 'overlapping dates')); return;
		}
	}
	$starts[]=$eventTimes[$i];
}


$gds=0;
//if this is an update, then delete all existing records
if($updateIds!="normalPost"){
	$orStr='';
	for($i=0;$i<count($updateIds);$i++){
		$orStr=$orStr."id=".$updateIds[$i]."||";
	}
	$orStr=substr($orStr,0,strlen($orStr)-2);
	$gds += $conn->query("delete from Posts where $orStr");
}

$postedIds=[];
//start our loop of posting multiple dates
for($i=0;$i<count($eventTimes);$i++){
	$startTime = round($eventTimes[$i]/1000);

	//insert
	$qstr="insert into Posts (lat,lng,post,postIp,img,startTime,googDir) values ".
				"($lat, $lng, '$post', '$postIp', '$img', $startTime, $googDir)";
	$result = $conn->query($qstr);
	if($result==1){
		$gds+=1;
		$postedIds[] = $conn->insert_id;
	}
	if($result!=1){echo json_encode(array(0,'something went wrong')); return;}
}

//now update all the posts we just made... giving their delKeys
$delKeyStr = join(',',$postedIds);
$orStr = '';
for($i=0;$i<count($postedIds);$i++){
	$orStr=$orStr."id=".$postedIds[$i]."||";
}
$orStr=substr($orStr,0,strlen($orStr)-2);
$gds += $conn->query("update Posts set delKey='$delKeyStr' where $orStr");


//echo success or not
if($updateIds=="normalPost"){
	if($gds==count($eventTimes) + 1){echo json_encode(array(1,"normal"));}
	else{echo json_encode(array(0,'something went wrong'));}
}

if($updateIds!="normalPost"){
	if($gds==count($eventTimes) + 2){echo json_encode(array(1,"update"));}
	else{echo json_encode(array(0,'something went wrong'));}
}


/*
mysql> describe Posts;
+-----------+------------------+------+-----+-------------------+----------------+
| Field     | Type             | Null | Key | Default           | Extra          |
+-----------+------------------+------+-----+-------------------+----------------+
| id        | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| lat       | decimal(7,5)     | YES  |     | NULL              |                |
| lng       | decimal(8,5)     | YES  |     | NULL              |                |
| post      | mediumtext       | YES  |     | NULL              |                |
| postIp    | char(50)         | NO   |     | NULL              |                |
| img       | mediumblob       | YES  |     | NULL              |                |
| startTime | int(10) unsigned | YES  |     | 1                 |                |
| killTime  | int(10) unsigned | YES  |     | 1                 |                |
| voteCount | smallint(6)      | YES  |     | 0                 |                |
| delKey    | char(200)        | YES  |     |                   |                |
| googDir   | tinyint(1)       | YES  |     | 0                 |                |
| postTime  | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+-----------+------------------+------+-----+-------------------+----------------+
12 rows in set (0.00 sec)




mysql> describe rightNowVotes;
+-----------+------------------+------+-----+-------------------+----------------+
| Field     | Type             | Null | Key | Default           | Extra          |
+-----------+------------------+------+-----+-------------------+----------------+
| id        | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| voterIp   | char(27)         | YES  |     | NULL              |                |
| postId    | int(10) unsigned | YES  |     | NULL              |                |
| voteTotal | tinyint(1)       | YES  |     | 0                 |                |
| time      | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+-----------+------------------+------+-----+-------------------+----------------+*/
/*
mysql> describe rightNowActivity;
+--------+------------------+------+-----+-------------------+----------------+
| Field  | Type             | Null | Key | Default           | Extra          |
+--------+------------------+------+-----+-------------------+----------------+
| id     | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| userIp | char(27)         | YES  |     | NULL              |                |
| time   | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+--------+------------------+------+-----+-------------------+----------------+
3 rows in set (0.00 sec)

mysql> describe rightNowReplies;
+-------------+------------------+------+-----+-------------------+----------------+
| Field       | Type             | Null | Key | Default           | Extra          |
+-------------+------------------+------+-----+-------------------+----------------+
| id          | int(10) unsigned | NO   | PRI | NULL              | auto_increment |
| postId      | int(10) unsigned | YES  |     | NULL              |                |
| replierIp   | char(27)         | YES  |     | NULL              |                |
| replierName | char(100)        | YES  |     | NULL              |                |
| reply       | char(255)        | YES  |     | NULL              |                |
| time        | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+-------------+------------------+------+-----+-------------------+----------------+
6 rows in set (0.00 sec)*/



?>








