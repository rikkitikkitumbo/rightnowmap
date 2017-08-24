<?php 

include('/var/DBcred.php');
$conn = new mysqli($HOST, $USER, $PASSWORD, $DATABASE, $PORT);



//meetup
$now = time();
$twodays = time() + 259200;  //2days= 172800
$r = $conn->query("select nextFetch from FetchSchedule where name='meetup' and nextFetch<$now");

if($f = $r->fetch_assoc()["nextFetch"]){
	include('fetch/meetup.php');
	$conn->query("update FetchSchedule set nextFetch=$twodays where name='meetup'");
	echo $conn->error;
	echo 'fetched meetup data';
	return;
}

echo 'no need';











?>
