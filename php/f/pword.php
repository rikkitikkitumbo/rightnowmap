<?php
session_start();

echo "<script type='text/javascript' src='/js/jquery1.12.4.js'></script>";
echo "<input id='pword' />";
echo "<span onclick='sendPword()'>CLICK</span>";
echo "
<script>
function sendPword(){
	console.log('yay');
	var p = document.getElementById('pword').value;
	$.get('pword.php',{pword:p},function(res){});
}
</script>";

$pword = $_GET["pword"];
$_SESSION["pword"] = $pword;
echo "pword changed to: $pword";

?>
