<?php 



$ids = preg_split("[,]",$_GET["ids"]);

include('/var/DBcred.php');

$conn = new mysqli($HOST, $USER, $PASSWORD, $DATABASE, $PORT);

$orStr='';
for($i=0;$i<count($ids);$i++){
	$orStr=$orStr."id=".$ids[$i]."||";
}
$orStr=substr($orStr,0,strlen($orStr)-2);

$result = $conn->query("select id,post,startTime,delKey from Posts where ".$orStr);
$rA = [];
while($r=$result->fetch_assoc()){
	$rA[]=$r;
}

echo json_encode($rA);


?>


