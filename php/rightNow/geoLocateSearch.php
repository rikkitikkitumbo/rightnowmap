<?php 


$sw = $_POST["searchWords"];


$str = urlencode($sw);

$ress = file_get_contents("https://www.google.com/maps/place/$str",null,null,0,1000);
$pattern = "/\(\[\[\[[^,]*,([^,]*),([^\]]*)/";
preg_match($pattern,$ress,$matches);

$lat = round(floatval($matches[2]),5);
$lng = round(floatval($matches[1]),5);

if($lat > 17.8951 && $lat < 50.1205 && $lng > -160.927734 && $lng < -62.490234){	 	
	echo $matches[2].",".$matches[1];
}else{
	$str = urlencode($sw." ,United States");
	$ress = file_get_contents("https://www.google.com/maps/place/$str",null,null,0,1000);
	$pattern = "/\(\[\[\[[^,]*,([^,]*),([^\]]*)/";
	preg_match($pattern,$ress,$matches);
	echo $matches[2].",".$matches[1];
}



?>


