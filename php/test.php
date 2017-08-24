<?php
#$conn = new mysqli('localhost', 'root', '', 'rightNowDB', '3306');
#$fbLines = fopen("/var/www/html/php/fb.txt","r") or die("unable to open file");
#error_reporting(E_ALL);
#ini_set('display_errors', 1);

$curl_handle = curl_init('https://www.meetup.com/New-Haven-Road-Runners/events/236634198/');
$data_string = "";
curl_setopt ($curl_handle, CURLOPT_RETURNTRANSFER, 1);
curl_setopt ($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
curl_setopt ($curl_handle, CURLOPT_WRITEFUNCTION, function($handle,$data){
	global $data_string;
	$data_string .= $data;
	if (strlen($data_string) > 99000) {
		  return 0;
	}
	else{
		  return strlen($data);
	}
});
curl_exec($curl_handle);
$pattern = '/block meta-gphoto align-center margin-top margin-bottom/';
preg_match($pattern, $data_string, $matches, PREG_OFFSET_CAPTURE);
$str = substr($data_string, $matches[0][1],500);
$pat = "/<img src=([^ ]*)/";
preg_match($pat,$str,$matches);
$img = substr($matches[1],1,-1);

echo "<img src='$img'>";
echo 'greg';
?>

