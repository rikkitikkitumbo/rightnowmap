<?php 


$postIds = preg_split('[,]',$_POST["postIds"]);
$userIp = addslashes($_SERVER['REMOTE_ADDR']);

$orStr='';
for($i=0;$i<count($postIds);$i++){
	$orStr=$orStr."id=".$postIds[$i]."||";
}
$orStr=substr($orStr,0,strlen($orStr)-2);



include('/var/DBcred.php');
$conn = new mysqli($HOST,$USER,$PASSWORD,$DATABASE,$PORT);


$result = $conn->query("delete from Posts where postIp='$userIp' and ($orStr)");
echo $conn->error;
echo $result;

?>
