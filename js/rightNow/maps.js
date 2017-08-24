

//---- show the map---
function dispInitLoc(){
	var lastUserLoc = document.getElementById('lastUserLoc').value;
	var z=5;
	if(lastUserLoc != ""){lastUserLoc = lastUserLoc.split(',');z=11}
	if(lastUserLoc == ""){
		showKey();
		lastUserLoc = [40.21, -98.55];
	}
										   //[40.21, -98.55], 5
										   //[45.51, -122.68]
										   
	mapObj.map.setView(lastUserLoc, z);
	var osmUrl=makeOsmUrl();
	var osm = new L.TileLayer(osmUrl,{
		attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
	});
	mapObj.nonZoomMap = [osm,false];
	mapObj.map.addLayer(osm);
  initialClock();
	setTimeout(function(){
		fetchPostsAndDisplay();
		nextMeetupFetch();
	},200);
}

//function addPointerEvents(){
//	mapObj.pointerEventsWork=false;
//}

function centerCrossHair(){
//	if(mapObj.pointerEventsWork){
//		classListAdd(document.getElementById('crosshair1'),'hidden');
//		classListAdd(document.getElementById('crosshair2'),'hidden');
//		document.getElementById('crosshair').style.left = (document.documentElement.clientWidth - 100)/2+"px";
//		document.getElementById('crosshair').style.top = (document.documentElement.clientHeight - 100)/2+"px";
//		return;
//	}
//	classListAdd(document.getElementById('crosshair'),'hidden');
	document.getElementById('crosshair1').style.left = (document.documentElement.clientWidth - 90)/2+"px";
	document.getElementById('crosshair1').style.top = (document.documentElement.clientHeight - 1)/2+"px";
	document.getElementById('crosshair2').style.left = (document.documentElement.clientWidth - 1)/2+"px";
	document.getElementById('crosshair2').style.top = (document.documentElement.clientHeight - 90)/2+"px";
}
window.onresize=function(){centerCrossHair();}

function viewPortScale(){
	document.getElementById("viewport").setAttribute("content",
      "initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0");
  setTimeout(function(){
  	document.getElementById("viewport").setAttribute("content",
      "initial-scale=1.0, minimum-scale=.80, maximum-scale=1.5, user-scalable=1");
  },1000);
}

function moveKeyBtn(){
	if(document.documentElement.clientWidth < 375){
		classListAdd(document.getElementById('keyBtn'),'sideKeyBtnClass');
	}
}



function init() {
//		document.elementFromPoint(10, 10).click();
		viewPortScale();
		moveKeyBtn();
		centerCrossHair();
		dispInitLoc();
		if(!navigator.geolocation){classListAdd(document.getElementById('goToMyLoc'),'hidden');}
}


function makeOsmUrl(){
	return '/xvdg/naDarker/{z}/{x}/{y}.png';
}


init();


// --- functions to fetch posts and display them ---
function refreshListBtn(){
	var e = document.getElementById('listBtn');
	e.style.opacity=0;
	setTimeout(function(){
		e.style.opacity=1;},300);
}


function refreshMarkers(){
	var lat = parseFloat(mapObj.map.getCenter().lat.toFixed(5));
	var lng = parseFloat(mapObj.map.getCenter().lng.toFixed(5));
	var params={lat:lat, lng:lng, fetchTimeObjs:mapObj.fetchTimeObjs, postIdsFaved:mapObj.postIdsFaved};
	$.get('php/rightNow/getPosts.php', params, function(result){
		result = JSON.parse(result);
		mapObj.map.eachLayer(function(layer){
			if(layer._popup){if(!layer._popup._isOpen){
				mapObj.map.removeLayer(layer);}
			}
		});
		if(result.length>0){
			displayPostIcons(result,0);
//			mapObj.map.setView(mapObj.map.getCenter(),ma);
		}
	});
}

function fetchPostsAndDisplay(){
	hidePopupsAndOpenDivs();
	var fetchTimeObjs = mapObj.fetchTimeObjs;
	var lat = parseFloat(mapObj.map.getCenter().lat.toFixed(5));
	var lng = parseFloat(mapObj.map.getCenter().lng.toFixed(5));
	var params={lat:lat, lng:lng, fetchTimeObjs:fetchTimeObjs, postIdsFaved:mapObj.postIdsFaved};
	$.get('php/rightNow/getPosts.php', params, function(result){
		result = JSON.parse(result);
		for(var i=0;i<result.length;i++){
			result[i].post = result[i].post.replace(/\\/g,'');
		}
		//display on map
		displayPostIcons(result,1);
		refreshListBtn();
	});
	hideConfirmDel();
	if(classListContains(document.getElementById('listDivContainer'),'hidden')!=1){getPostsAndCreateList();}
}


function displayPostIcons(posts,clear){
	if(clear==1){
		for(var i=0;i<mapObj.markersGroup.length;i++){
			mapObj.map.removeLayer(mapObj.markersGroup[i]);
		}
		mapObj.markersGroup=[];
	}
	for(var i=0;i<posts.length;i++){
		var l=3; var r=0;
		if(document.documentElement.clientWidth>1000){r=50; l=150;}
		var marker = makeMarker(posts[i]).on('click', showPostFromMap)
			.bindPopup(postContent(posts[i]),
				{autoPanPaddingTopLeft:[l,0],keepInView:true,minWidth:setPopupWidth(.70),
					autoPanPaddingBottomRight:[r,0],maxWidth:setPopupWidth(.85)});
		marker.id = posts[i].id;
		marker.postIp = posts[i].postIp;
		mapObj.markersGroup.push(marker);
		mapObj.map.addLayer(marker);	
	}
}

function updatePopupContent(){
	if(!document.querySelectorAll('.leaflet-popup-content')[0]){return;}
	var c = document.querySelectorAll('.leaflet-popup-content')[0].innerHTML;
	mapObj.map.eachLayer(function(layer){
		if(layer._popup){if(layer._popup._isOpen){layer._popup.setContent(c);}}
	});
}




function postIdRead(id){
	for(var i=0;i<mapObj.postIdsRead.length; i++){
		if(id == mapObj.postIdsRead[i]){return true;}
	}
	return false;
}

function postIdFaved(id){
	id = id.toString();
	for(var i=0;i<mapObj.postIdsFaved.length; i++){
		if(id == mapObj.postIdsFaved[i]){return i;}
	}
	return -1;
}


function makeMarker(postObj){ 
	//return L.circleMarker([parseFloat(postObj.lat), parseFloat(postObj.lng)],{radius:1, color:'red'});
	var zoom = mapObj.map.getZoom();
	var iclass= "markerBlue";
	var v = parseInt(postObj.voteCount);
	if(v>35){v=0; iclass="markerDarkBlue";}
	var now = new Date().getTime() + 1800000;
	var m = (zoom - 15.5)*4;
	if(postObj.startTime*1000 < now){iclass="markerRed";}
	if((postObj.startTime*1000 < now) && (v>35)){iclass="markerDarkRed";}
	var favBonus = (postIdFaved(postObj.id)!=-1) ? 3 : 0;
	if(zoom==14){m=-1.5 + favBonus;}
	if(zoom==15){m=2 + favBonus;}
	var divHtml = "";
	if(postIdFaved(postObj.id)!=-1){
		iclass="markerYellow"; m=0;
		divHtml = "<div style='word-wrap:break-word;text-align:center;font-size:7px;line-height:7px;'>"+
			postObj.post.substr(0,18).replace(/<[^>]{0,}>/g,'').replace(/<[^ ]{0,}/g,'')+"</div>";
	}
	if(zoom > 15){m = (zoom - 15.5)*10 + favBonus;}
	if(zoom==14 ){
		divHtml = "<div style='word-wrap:break-word;text-align:center;font-size:7px;line-height:7px;'>"+
			postObj.post.substr(0,18+m).replace(/<[^>]{0,}>/g,'').replace(/<[^ ]{0,}/g,'')+"</div>";}
	if(zoom==15){
		divHtml = "<div style='word-wrap:break-word;text-align:center;font-size:7px;line-height:7px;'>"+
			postObj.post.substr(0,18+m).replace(/<[^>]{0,}>/g,'').replace(/<[^ ]{0,}/g,'')+"</div>";}
	if(zoom==16){
		divHtml = "<div style='word-wrap:break-word;text-align:center;font-size:7px;line-height:7px;'>"+
			postObj.post.substr(0,20+m).replace(/<[^>]{0,}>/g,'').replace(/<[^ ]{0,}/g,'')+"</div>";}
	if(zoom==17){
		divHtml = "<div style='word-wrap:break-word;text-align:center;font-size:7px;line-height:7px;'>"+
			postObj.post.substr(0,30+m).replace(/<[^>]{0,}>/g,'').replace(/<[^ ]{0,}/g,'')+"</div>";}
	if(zoom==18){
		divHtml = "<div style='word-wrap:break-word;text-align:center;font-size:7px;line-height:7px;'>"+
			postObj.post.substr(0,55+m).replace(/<[^>]{0,}>/g,'').replace(/<[^ ]{0,}/g,'')+"</div>";}
	
	var op = (postIdRead(postObj.id) && postIdFaved(postObj.id)==-1) ? .67 : 1;
	var zoff = (postIdFaved(postObj.id) != -1) ? 1010 : 0;
	var size = 21 + m;
	if(size<0){size = 1;}
	return L.marker([parseFloat(postObj.lat), parseFloat(postObj.lng)],{
		icon: L.divIcon({iconSize:[size, size], className:iclass, html:divHtml}),
		opacity: op,
		zIndexOffset: zoff
	});
}



function voteCol(num){
	var col = "#124d93";
	if(num < 0){col="red";}
	return col;
}

function paintFavedPostPopup(id){
	if(document.querySelectorAll('.leaflet-popup-tip')[0]){
		var popCon = document.querySelectorAll('.leaflet-popup-content-wrapper')[0];
		var tip = document.querySelectorAll('.leaflet-popup-tip')[0];
		if(postIdFaved(id)==-1){classListRemove(popCon,'favGold'); classListRemove(tip,'favGold');}
		else{classListAdd(popCon,'favGold'); classListAdd(tip,'favGold');}
	}
}

function favPost(postId){
	var popCon = document.querySelectorAll('.leaflet-popup-content-wrapper')[0];
	var tip = document.querySelectorAll('.leaflet-popup-tip')[0];
	classListToggle(popCon,'favGold'); classListToggle(tip,'favGold');
	var favedIndex = postIdFaved(postId);
	if(favedIndex != -1){mapObj.postIdsFaved.splice(favedIndex, 1);}
	else{mapObj.postIdsFaved.push(postId);}
}

function showPostFromMap(e){
	if(document.documentElement.clientWidth < 1000){
		hideLowerIslands();
		hideUpperIslands();
	}
	classListAdd(document.getElementById('crosshair1'),'hidden');
	classListAdd(document.getElementById('crosshair2'),'hidden');
	hideContactInfoDiv();
	classListAdd(document.getElementById('geoLocateDiv'),'hidden');
	mapObj.recenterLatLng = [e.target._latlng.lat,e.target._latlng.lng];
	setTimeout(function(){paintFavedPostPopup(e.target.id);},200);
	return;
}



function postContent(postObj){
	var del = "";
	var backBtn = "";
	var googDir = "";
	postObj.post = postObj.post.replace(/(<a)/gi,"$1 target='_blank'");
	var mat = postObj.post.match(/When: ([0-9]*)/);
	if(mat){
		var d = new Date(parseInt(mat[1])*1000);
		var day = dayOfWeek(d.getDay());
		if(d.getDate() == new Date().getDate()){ day='Today';}
		postObj.post = postObj.post.replace(/When: [0-9]*/,"When: "+day+", "+nonMilTime(d)[0]+", "+nonMilTime(d)[1]);
	}
	if(postObj.googDir==1){
		var left = (setPopupWidth(1)<650)? "style='margin-left:"+setPopupWidth(1)/2-15+"px;'" : "style='margin-left:265px;'";
		googDir="<a class='googleMapsLink' "+left+" target='_blank' href='https://www.google.com/maps/place/"+
				postObj.lat+"+"+postObj.lng+"/@"+postObj.lat+","+postObj.lng+",17z'></a>";
	}
	googDir="";
	var mxht = document.documentElement.clientHeight - 110;
	return ""+
		"<div class='postContainerClass' id='postContainer'>"+
			"<div class='postContent' id='postContent' style='max-height:"+mxht+"px;'>"+
				"<div class='postTime'>"+m2n(postObj.startTime)+"</div>"+
				"<div style='margin-top:10px;'>"+postObj.post+"</div>"+
			"</div>"+
			"<span class='favPostBtnClass' onclick='favPost("+postObj.id+");'></span>"+
				del+googDir+backBtn+
		"</div>";
}


function nonMilTime(d){
	var m = d.getMonth() + 1;
	var dt = d.getDate();
	var hr = d.getHours();
	var mi = d.getMinutes();
	if(mi<10){mi="0"+mi;}
	var ampm = 'am';
	if(hr > 12){hr=hr-12; ampm='pm';}
	if(hr==12){hr=12; ampm='pm';}
	if(hr==0){hr=12; ampm='am';}
	return [ m+"/"+dt, hr+":"+mi+ampm ];
}

function dayOfWeek(num){
	switch (num){
		case 0:return 'Sun';
		case 1:return 'Mon';
		case 2:return 'Tues';
		case 3:return 'Wed';
		case 4:return 'Thurs';
		case 5:return 'Fri';
		case 6:return 'Sat'; 
	}
}

function m2n(time){
	var now = new Date().getTime();
	var d = new Date(time*1000);
	var sa = nonMilTime(new Date(d.getTime()));
	var mAgo = (now-time*1000)/1000/60;
	var daystr = dayOfWeek(d.getDay());
	if(d.getDate()==new Date().getDate()){daystr="Today";sa[0]="";}
	if(mAgo<1 && mAgo >0){return "seconds ago";}
	if(mAgo<0 || mAgo>=60){return daystr+" "+sa[0]+" "+sa[1];}
	if(mAgo>0 && mAgo<60){return parseInt(mAgo)+"min ago";}
}


//-----showing and hiding things----------
function showContactInfoDiv(){classListRemove(document.getElementById('contactInfoDiv'),'hidden');}
function hideContactInfoDiv(){classListAdd(document.getElementById('contactInfoDiv'),'hidden');}
function hideLowerIslands(){
	mapObj.map._controlContainer.hidden=true;
	classListAdd(document.getElementById('geolocateBtn'),'hidden');
	classListAdd(document.getElementById('contactBtn'),'hidden');
	classListAdd(document.getElementById('postIslndBtn'),'hidden');
	classListAdd(document.getElementById('keyBtn'),'hidden');
}
function showIslands(){
	mapObj.map._controlContainer.hidden=false;
	classListRemove(document.getElementById('geolocateBtn'),'hidden');
	classListRemove(document.getElementById('postIslndBtn'),'hidden');	
	classListRemove(document.getElementById('contactBtn'),'hidden');
	classListRemove(document.getElementById('clockBtn'),'hidden');	
	classListRemove(document.getElementById('listBtn'),'hidden');
	classListRemove(document.getElementById('rightNowLogo'),'hidden');
	classListRemove(document.getElementById('crosshair1'),'hidden');
	classListRemove(document.getElementById('crosshair2'),'hidden');
	classListRemove(document.getElementById('keyBtn'),'hidden');
	viewPortScale();
	refreshMarkers();
}
function hideUpperIslands(){
	classListAdd(document.getElementById('clockBtn'),'hidden');	
	classListAdd(document.getElementById('listBtn'),'hidden');
	classListAdd(document.getElementById('rightNowLogo'),'hidden');
	classListAdd(document.getElementById('crosshair1'),'hidden');
	classListAdd(document.getElementById('crosshair2'),'hidden');
}


function hidePopupsAndOpenDivs(){
	mapObj.map.closePopup();
	hideContactInfoDiv();
//	hideKey();
	classListAdd(document.getElementById('geoLocateDiv'),'hidden');
}



//-----map listeners and activity -----
function onMapClick(e) { 
	hidePopupsAndOpenDivs();
	classListAdd(document.getElementById('crosshair1'),'hidden');
	classListAdd(document.getElementById('crosshair2'),'hidden');
	if(document.documentElement.clientWidth<900){hideUpperIslands();}
	mapObj.postLatLng = mapObj.map.getCenter();
	mapObj.recenterLatLng = mapObj.map.getCenter();
	mapObj.popup.options.maxWidth=setPopupWidth(.84);
	mapObj.popup.options.minWidth=setPopupWidth(.84);
	mapObj.popup
		.setLatLng(mapObj.map.getCenter())
		.setContent(postInputDiv())
		.openOn(mapObj.map);
	hideConfirmDel();
	classListRemove(document.querySelectorAll('.leaflet-popup-close-button')[0],'hidden');
	if(document.documentElement.clientHeight < 600){hideLowerIslands();}
}


function recenterLatLng(){
	mapObj.map.setView(mapObj.recenterLatLng, mapObj.map.getZoom());
}
//-124.2303,43.6580,-120.8904,46.3071
function whatCityImIn(){
	var lng=mapObj.map.getCenter().lng;
	var lat=mapObj.map.getCenter().lat;	
	if(lng>-124.2303 && lng<-120.8904 &&lat>43.6580&&lat<46.3071){
		return 'Portland';
	}
	return 0;
}


function changeMap(){
	if(whatCityImIn()=='Portland' && mapObj.map.getZoom()>11){
		if(mapObj.zoomMap[1]==true){
			mapObj.map.removeLayer(mapObj.nonZoomMap[0]);
			mapObj.map.options.maxZoom=14;
			var osm = new L.TileLayer('/xvdg/portland14Darker/{z}/{x}/{y}.png',{
				attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
			});
			mapObj.nonZoomMap[1]=true;
			mapObj.zoomMap=[osm,false];
			mapObj.map.addLayer(osm);
		}
		return;
	}
	if(mapObj.map.getZoom()<13){
		if(mapObj.nonZoomMap[1]==true){
			mapObj.map.removeLayer(mapObj.zoomMap[0]);
			mapObj.map.options.maxZoom=12;
			var osm = new L.TileLayer('/xvdg/naMoreTowns/{z}/{x}/{y}.png',{
				attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
			});
			mapObj.zoomMap[1]=true;
			mapObj.map.addLayer(osm);
			mapObj.nonZoomMap=[osm,false];
		}
	}
}

//mapObj.map.on('click', onMapClick);
mapObj.map.on('dragend', function(){refreshListBtn(); changeMap();});
mapObj.map.on('zoomend', changeMap);
mapObj.map.on('popupclose', function(){recenterLatLng(); showIslands();});






// --------------map key -----------
function hideKey(){classListAdd(document.getElementById('keyContainer'),'hidden');}
function showKey(){
	console.log('tried');
	var greet="<b>RightNow<em class='white'>Map</em></b> KEY: <div style='margin-top:9px;'></div>";
	if(document.getElementById('lastUserLoc').value==""){
		greet="<div style='margin-top:10px;text-align:center;'>"+
			"Welcome to <b>RightNow<em class='white'>Map</em></b>!<br><br></div>"+
			"Here's a KEY to help you get started:<div style='margin-top:9px;'></div>"; 
	}
	var str = ""+
	  "<div class='hideKeyX' onclick='hideKey()'>X</div>"+
	  "<div class='keyText'> "+greet+
			"<b class='keyList'></b> : Read Posts (sorted by date, or distance from the center of the map)<br>"+
			"<b class='keyStar'></b> : Favorite a post and make it appear on the map<br>"+
			"<b class='keyPost'></b> : Make a post!<br>"+
			"<b class='keyGeo'></b> : Search for an address or place"+
		"</div>";	
	document.getElementById('keyContainer').innerHTML=str;
	classListRemove(document.getElementById('keyContainer'),'hidden');
}


function nextMeetupFetch(){
	//$.get('php/rightNow/fetchSchedule.php',function(response){});
}






