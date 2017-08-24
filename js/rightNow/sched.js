//-------- Schedule event things----------
function eiclear(self){
	self.style.backgroundColor='blue';
	self.style.color='#fff';
	oldVal = self.value;
	self.value='';
	self.onblur = function(){
		self.style.color = '#000';
		self.style.backgroundColor='#fff';
		if(self.value==''){self.value=oldVal;}
	}
}

function milTime(hr,ampm){
	hr = parseInt(hr);
	if(/^am$/i.test(ampm) && hr<12){return hr;}
	if(/^am$/i.test(ampm) && hr==12){return 0;}
	if(/^pm$/i.test(ampm) && hr<12){return hr+12;}
	if(/^pm$/i.test(ampm) && hr==12){return 12;}
	if(hr>12 && hr<24){return hr;}
	else{return 'HourInvalid';} 
}


function eventTimeStr(d){
	if(d=='Invalid Date'){return "<span style='color:red;'>Invalid Date</span><br>";}
	var day = d.toString().slice(0,10)+" "+d.getFullYear()+", ";
	var time = nonMilTime(d);
	return day+time[1];
}


function scheduleDiv(){
	var d = new Date();
	var b = (mapObj.eventTimes.length>0) ? "Ok, use these times!" : "Back";
	var ht = document.documentElement.clientHeight*.27;
	if(ht>135){ht=135;}
	return""+
  "<div id='scheduleDiv' class='schedDivClass'>"+
  	"<div class='closeSchedClass' onclick='mapObj.map.closePopup();'>X</div>"+
  	"<div style='font-size:19px;'><b><em class='white'>Post time:</em></b></div>"+
  	"<div id='schedBtnsTextContainer'>"+schedBtns()+"<br></div>"+
		"<div class='btn blue' style='margin-top:7px;margin-left:-3px;display:inline-block;' "+
  		"onclick='dhSchedDiv()' id='schedOkOrBack'>"+b+"</div>"+
  	"<div class='btn red' id='eAdBtn' style='margin-left:15px;display:inline-block;' "+
  		"onclick='addEventDate()'>add time</div>"+
  	"<div id='eventDatesBack' style='height:"+ht+"px;overflow-y:auto;font-size:16px;'>"+
  		schedDatesStr(false)+
  	"</div>"+
  "</div>";	  
}


function nearestHalfHour(){
	var now = new Date().getTime();
	var d = now%1800000;
	if(d >= 900000){return now + (1800000-d);}
	else{return now - d;} 
}

function asSchedBtn(num){
	mapObj.eventTimeLoaded = mapObj.eventTimeLoaded + num;
	if(mapObj.eventTimeLoaded < new Date().getTime() - 1800000){
		mapObj.eventTimeLoaded = nearestHalfHour() - 1800000;
	}
	document.getElementById('eventStartTime').innerHTML = 
		eventTimeStr(new Date(mapObj.eventTimeLoaded));
}

function schedBtns(){
	var d1 = new Date(nearestHalfHour());
	mapObj.eventTimeLoaded = d1.getTime();
	return ""+
	"<div id='eventStartTime' style='font-size:16px;margin-bottom:-14px;'>"+
		eventTimeStr(d1)+"</div><br>"+
	"<div>"+
		"<span class='schedArwsL' onclick='asSchedBtn(-86400000)'></span>"+
		"<span class='schedArwsL' style='opacity:.7;' onclick='asSchedBtn(-7200000)'></span>"+
		"<span class='schedArwsL' style='opacity:.5;' onclick='asSchedBtn(-900000)'></span>&nbsp;&nbsp;"+
		"<span class='schedArwsR' style='opacity:.5;' onclick='asSchedBtn(900000)'></span>"+
		"<span class='schedArwsR' style='opacity:.7;' onclick='asSchedBtn(7200000)'></span>"+
		"<span class='schedArwsR' onclick='asSchedBtn(86400000)'></span>"+
	"</div>";
}


function addEventDate(){
	for(var i=0;i<mapObj.eventTimes.length;i++){
		if(Math.abs(mapObj.eventTimeLoaded - mapObj.eventTimes[i])<18000000){
					classListAdd(document.getElementById('schedOkOrBack'), 'hidden');
					document.getElementById('eAdBtn').innerHTML = "Overlapping dates!"
					setTimeout(function(){
						classListRemove(document.getElementById('schedOkOrBack'),'hidden');
						document.getElementById('eAdBtn').innerHTML = "add time";},1000);
					return;
				}
	}
	mapObj.eventTimes.push(mapObj.eventTimeLoaded);
	document.getElementById('eventDatesBack').innerHTML=schedDatesStr(false);
	document.getElementById('schedOkOrBack').innerHTML='Ok, use these times!';
}


function cmpEventTimes(a,b){return a.start - b.start;}

function schedDatesStr(front){
	mapObj.eventTimes = mapObj.eventTimes.sort(cmpEventTimes);
	if(mapObj.eventTimes.length==0 && front){
		return "This will be posted on<br> ? ? ?<br>"+
			"<div class='clkHrEdEvTmClass' id='clkHrEdEvTm' onclick='dhSchedDiv()'>"+
				"(click here to add post times)</div>";
	}
	if(mapObj.eventTimes.length==0 && !front){
		return "<div style='margin-top:20px;color:#777;'>"+
  			"Select a time and click 'add time'<br>"+
  			"(you can add multiple dates)"+
  		"</div>";
	}
	var str="<div style='margin-top:10px;color:#777;'>"+
		"This will be posted on: </div>";
	for(var i=0;i<mapObj.eventTimes.length;i++){
		var d1s = nonMilTime(new Date(mapObj.eventTimes[i]));
		var day1 = dayOfWeek(new Date(mapObj.eventTimes[i]).getDay());
		var estr = '';
		var xornot = '';
		if(!front){xornot="<span class='closeSchedDivClass' "+
			"onclick='rmEventTime("+i+")'>X</span>";}
		str += "<div style='margin-top:10px;color:#333;'>"+day1+" "+ d1s[0]+", "+d1s[1]+
			xornot+"</div>";
	}
	if(front){str+="<div class='clkHrEdEvTmClass' id='clkHrEdEvTm' onclick='dhSchedDiv()'>"+
		"(click here to edit post times)</div>";}
	return str;
}

function rmEventTime(index){
	mapObj.eventTimes.splice(index,1);
	document.getElementById('eventDatesBack').innerHTML=schedDatesStr();
	if(mapObj.eventTimes.length == 0){
		document.getElementById('schedOkOrBack').innerHTML='Back';}
}


function updateFrontEventDates(){
	document.getElementById('eventDatesFront').innerHTML=schedDatesStr(true);
}
function dhPostBtnCover(){
	if(mapObj.eventTimes.length > 0){
		classListAdd(document.getElementById('postBtnCover'),'hidden');
	}
	else{classListRemove(document.getElementById('postBtnCover'),'hidden');}
}


function dhEventDatesFront(){
	qkpostOrEventChanges();
	updateFrontEventDates();
	if(document.getElementById('qkpstChkBox').checked){
		classListAdd(document.getElementById('eventDatesFront'),'hidden');
		classListAdd(document.getElementById('editGoogLoc'),'hidden');
	}
	if(document.getElementById('eventChkBox').checked){
		classListRemove(document.getElementById('eventDatesFront'),'hidden');
		classListRemove(document.getElementById('editGoogLoc'),'hidden');
	}
	updatePostInputPopup();
}

function dhSchedDiv(){
	updateFrontEventDates();
	classListToggle(document.querySelectorAll('.leaflet-popup-close-button')[0],'hidden');
	classListToggle(document.getElementById('postInput'),'hidden');
	classListToggle(document.getElementById('postButtons'),'hidden');
	classListToggle(document.getElementById('eventDatesFront'),'hidden');
	document.getElementById('scheduleDivContainer').innerHTML=scheduleDiv();
	classListToggle(document.getElementById('scheduleDivContainer'),'hidden');
	classListToggle(document.getElementById('postInpTopDiv'),'hidden');
	updatePostInputPopup();
}



