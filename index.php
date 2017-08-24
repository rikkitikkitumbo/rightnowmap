
<?php 
$ufp = "";
$luloc="";
if(isset($_COOKIE['userFavPosts'])){$ufp = $_COOKIE['userFavPosts'];}
if(isset($_COOKIE['lastUserLoc'])){$luloc = $_COOKIE['lastUserLoc'];}

?>

<!doctype html>
<html lang="en-US" xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>RightNowMap</title>
      <meta name="description" content="Things going on around you, right now." />
      <meta id="viewport" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.4, minimum-scale=.80"/>
      <meta name="mobile-web-app-capable" content="yes">
      <link rel="apple-touch-icon" href="apple-touch-icon.png" />
      <link rel="icon" sizes="192x192" href="nonAppleIcon.png" />
      <link type='text/css' rel="stylesheet" href="/css/leaflet77.css" />
      <link type='text/css' rel="stylesheet" href="/css/rightNow.css" />
      <link type='text/css' rel="stylesheet" href="/css/clock.css" />
      <link type='text/css' rel="stylesheet" href="/css/list.css" />
      <link type='text/css' rel="stylesheet" href="/css/sched.css" />
      <link type='text/css' rel="stylesheet" href="/css/geoLocate.css" />
      <link type='text/css' rel="stylesheet" href="/css/key.css" />
   </head>
	<body>
	<input id='userFavPosts' class='hidden' value="<?php global $ufp; echo $ufp ?>"/>
	<input id='lastUserLoc' class='hidden' value="<?php global $luloc; echo $luloc ?>"/>
	<div id="map" ></div> 
	<!--<div id='pntEvent1' class='pntEvent1Class' onclick='addPointerEvents()'></div>
	<div id='pntEvent2' class='pntEvent2Class'></div>-->
	
	<div id='crosshair' class='crosshairClass' ></div>
	<div id='crosshair1' class='crosshairClass1'></div>
	<div id='crosshair2' class='crosshairClass2' ></div>
	<div id="rightNowLogo" class="island rightNowLogoClass">
		RightNow<em class='white'>Map</em>
	</div>
	<div id="clockBtn" class="island clockBtnClass" onclick='displayClock()'>
		<span></span>
	</div>
	<div class='geoLocateBtnClass island' id='geolocateBtn' onclick='showGeoLocateDiv()'></div>
	<div class='postIslndBtnClass island' id='postIslndBtn' onclick='onMapClick()'></div>
	<div class='contactBtnClass' id='contactBtn' onclick='showContactInfoDiv()'>Support</div>
	<div class='listBtnClass slowOpacity island' id='listBtn' onclick='showList()'></div>
	<div class='keyBtnClass island' id='keyBtn' onclick='showKey()' >
		<b><em class='white'>{</em></b><span style='color:#222;font-weight:bold;font-size:15px;'>KEY</span><b><em class='white'>}</em></b>
	</div>
	
<!-- 	$$$$$$$$ Hidden things $$$$$$$$ -->
	<div id="clockSlideDiv" class="hidden island clockSlideDivClass"></div>
	<div id='bigImgContainer' class='bigImgContainerClass hidden'>
		<img id='bigImg' alt='1' src=''></img>
		<span class='delBigImg' onclick="closeBigImg()">X</span>
		<span class='rotBigImg' onclick="rotateBigImg(this)">Rotate</span>
	</div>
	<div id='confirmPost' class='island hidden' style='left:0;bottom:17%;text-align:center;padding:80px 7px;'>
		      Please confirm that the content of your post is not 'spam', and is appropriate for all users!<br><br>
		      (PS You can downvote any post with inappropriate content.  A post that receives enough downvotes will be automatically deleted!)
		      <br><br>
		      <span class="btn red" style="margin-left:7%;" onclick="closeConfirmPost();">Cancel</span>
		      <span class="btn blue" id="confirmPostBtn" onclick="" style="margin-left:7%;">I accept</span><br>
	</div>
	<div class='confirmDelClass hidden' id='confirmDel'></div>
	
	<div id='geoLocateDiv' class='island geoLocateDivClass hidden'>
		<span class='closeListClass' style='margin-right:10px;' onclick='hideGeoLocateDiv()'>X</span>
		<input type='text' id='geoLocateSearchWords' class='listSearchWordsClass' style='width:61%;color:#888;'
			value='Search for address or place' onclick='placeHold(this)'/>
		<div id='geoLocateSearchBtn' class='btn blue searchListBtnClass' 
			onclick='mapGeoLocateSearch();' ></div>
		<br><br>
		<span id='goToMyLoc' class='btn blue' onclick='goToGeoLocation()' style='margin:15px 0px 0px 10%;display:inline-block;'>
			Go to my current location</span>
		<div id='geoLocateError' class='hidden' style='margin-left:10%;'>
			Sorry, couldn't find your location</div>
	</div>
	
	<div class='listDivContainerClass island hidden' id='listDivContainer'>
		<br><div style='color:#777;text-align:center;'>Loading...</div></div>
	
	<div class='island hidden' id='contactInfoDiv' style='text-align:center;bottom:55px;padding:9px;'>
		<b><em class='white'>Questions?&nbsp;&nbsp;Comments?</em></b><br>
		<span style='float:right;font-size:30px;color:red;margin-top:-24px;cursor:pointer;'  
			onclick='hideContactInfoDiv()'>&nbsp;X</span>
		rightnow@rightNowMap.com<br><br>
		<b><em class='white'>How-to Video:</em></b><a href='https://www.youtube.com/watch?v=r3Uh4B-okvs&feature=youtu.be' target='_blank'>
			youtube.com/rightNowHowTo</a><br>
	</div>
	
	<div class='island hidden' id='keyContainer' 
		style='position:absolute;left:0;bottom:25%;'></div>
	
	</body>
	<script type='text/javascript' src="/js/jquery1.12.4.js"></script>
	<script type='text/javascript' src="/js/leaflet77.js"></script>
	<script type='text/javascript' src="/js/rightNow/mapObj.js"></script>
	<script type='text/javascript' src="/js/rightNow/postsCrud.js"></script>
	<script type='text/javascript' src="/js/rightNow/clock.js"></script>
	<script type='text/javascript' src="/js/rightNow/maps.js"></script>
	<script type='text/javascript' src="/js/rightNow/list.js"></script>
	<script type='text/javascript' src="/js/rightNow/sched.js"></script>
	<script type='text/javascript' src="/js/rightNow/geoLocate.js"></script>
</html>



