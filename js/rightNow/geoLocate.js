// geoLocate stuff (go to users location, or search for place/address 
function showGeoLocateDiv(){classListRemove(document.getElementById('geoLocateDiv'),'hidden');}
function hideGeoLocateDiv(){classListAdd(document.getElementById('geoLocateDiv'),'hidden');}

function goToGeoLocation(){
	mapObj.LocTries --;
	var options = {timeout:2500,enableHighAccuracy:true, maximumAge:Infinity};
	navigator.geolocation.getCurrentPosition(dispGivenLoc,geoLocateError,options);
}

function geoLocateError(){
	if(mapObj.LocTries > 0){goToGeoLocation(); return;}
	var e = document.getElementById('geoLocateError');
	classListRemove(e,'hidden');
	setTimeout(function(){classListAdd(e,'hidden');},4000);
}

function dispGivenLoc(position) {
  var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	if(lat > 17.8951143037 && lat < 50.120578098 && lng > -160.927734375 && lng < -62.490234375){
		hideGeoLocateDiv();
		mapObj.map.setView([lat,lng], 12);
		changeMap();
		mapObj.map.setView([lat,lng], 14);
	}else{
		geoLocateError();
	}
}

function mapGeoLocateSearch(){
	classListAdd(document.getElementById('geoLocateSearchBtn'),'searching');
	var searchWords = document.getElementById('geoLocateSearchWords').value;
	$.post('php/rightNow/geoLocateSearch.php',{searchWords:searchWords},function(res){
		var lat = parseFloat(res.split(',')[0]);
		var lng = parseFloat(res.split(',')[1]);
		if(lat > 17.8951143037 && lat < 50.120578098 && lng > -160.927734375 && lng < -62.490234375){
			hideGeoLocateDiv();
			mapObj.map.setView([lat,lng],11);
			classListRemove(document.getElementById('geoLocateSearchBtn'),'searching');
		}
	});
}


function eventGeoLocateSearch(){
	classListAdd(document.getElementById('eventGeoLocateSearchBtn'),'searching');
	var searchWords = document.getElementById('geoLocateSearchWords').value;
	$.post('php/rightNow/geoLocateSearch.php',{searchWords:searchWords},function(res){
		var lat = parseFloat(res.split(',')[0]);
		var lng = parseFloat(res.split(',')[1]);
		if(lat > 17.8951143037 && lat < 50.120578098 && lng > -160.927734375 && lng < -62.490234375){
			var str = document.querySelectorAll('.leaflet-popup-content')[0].innerHTML;
			var addrVal = document.getElementById('geoLocateSearchWords').value;
			var btnPostStr = document.getElementById('btnPost').innerHTML;
			var eventTitleVal = document.getElementById('eventTitle').value;
			mapObj.map.closePopup();
			mapObj.map.setView([lat,lng],mapObj.map.getZoom());
			onMapClick();
			document.querySelectorAll('.leaflet-popup-content')[0].innerHTML=str;
			classListRemove(document.getElementById('eventGeoLocateSearchBtn'),'searching');
			document.getElementById('geoLocateSearchWords').value = addrVal;
			document.getElementById('eventTitle').value = eventTitleVal;
			document.getElementById('edGoogLocChkBx').checked=true;
			document.getElementById('btnPost').innerHTML=btnPostStr;
		}
	});
}







