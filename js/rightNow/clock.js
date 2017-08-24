//----clock stuff!------
function displayClock(){
	var e = document.getElementById('clockSlideDiv');
	if(document.documentElement.clientWidth>800){
		e.style.width="67%";
		e.style.marginLeft="18%";
	}
	classListRemove(e,'hidden');
}

function clockGuts(){
	var e = document.getElementById('clockSlideDiv');
 	var ht = (document.documentElement.clientHeight - 100) +"px";
 	e.innerHTML =  ""+
 	"<div class='closeClockClass' onclick='closeClockSlideDiv()'>X</div>"+
 	"<div class='clockClearAll btn' style='color:#ef2525;padding:5px 7px;' onclick='clockAS(-1)'> - </div>"+ 
	"<div class='clockClearAll btn red' id='clockClearBtn' onclick='clearClock()'>clear</div>"+
	"<div class='clockClearAll btn gold' onclick='allClock()'>all</div>"+
	"<div class='clockClearAll btn blue' style='font-size:18px;' onclick='closeClockSlideDiv()'>save</div>"+
	"<div class='clockClearAll btn' style='color:green;' onclick='clockAS(1)'> + </div>"+	
	"<div class='clockAS_0' style='height:"+ht+";overflow-y:auto;' "+
		"id='clockDays'>"+makeClockDays(0)+"</div>";
}

function clkNonMil(hr){
	var ampm = 'am';
	if(hr > 12){hr=hr-12; ampm='pm';}
	if(hr==12){hr=12; ampm='pm';}
	if(hr==0){hr=12; ampm='am';}
	return hr+ampm;
}

function makeClockDays(offset){
	var str =  "";
	var now = new Date().getTime();
	if(new Date().getHours() < 3){now = now-86400000;}
	var days=[];
	for(var i=0;i<100;i++){
		var d = new Date(now + i*86400000);
		var dayname = dayOfWeek(d.getDay());
		var m = d.getMonth() + 1;
		var date = d.getDate();
		var dstr = dayname+" "+m+"/"+date;
		if(i==0 && now < new Date()-50000){dstr += " (Yesterday)";}
		if(i==0 && now >= new Date() - 50000){dstr += " (Today)";}
		if(i==1 && now < new Date()-50000){dstr += " (Today)";}
		var d2 = new Date(now + (i+1)*86400000);
		var end4 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 0,0,0,0).getTime();
		var end3 = end4 - 21600000 + offset*3600000;
		var end2 = end3 - 14400000;
		var end1 = end2 - 14400000;
		var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0,0).getTime();
		var ckSty = "display: inline-block;margin: 12px 0px 16px;color: #444;"+
			"border:1px solid #444;border-radius: 6px;padding: 3px;";
		var lbSty = "color:#8bce7e;margin-left:5px;";
		str+=""+
			"<div class='clkDysDivs' id='clkChkDy"+i+"'>"+
				"<span id='clkChkDySpn"+i+"' class='ARCDayOn' style='"+ckSty+
					"' onclick='addRemClockDay("+i+",this)'>"+dstr+"</span><br>"+
				"<div class='clockIntradayBtn "+start+"Y"+end1+"' id='clockIntraday"+i+"a' "+
					"onclick='addRemClockIntraday("+start+","+end1+",this)'>"+
					"<div style='height:17px'></div>M O R N I N G"+
					"<div class='clockIntradayLbls'>"+clkNonMil(10+offset)+"</div>"+
				"</div>"+
				"<div class='clockIntradayBtn "+end1+"Y"+end2+"' id='clockIntraday"+i+"b' "+
					"onclick='addRemClockIntraday("+end1+","+end2+",this)'>"+
					"<div style='height:17px'></div>M I D - D A Y"+
					"<div class='clockIntradayLbls'>"+clkNonMil(14+offset)+"</div>"+
				"</div>"+
				"<div class='clockIntradayBtn "+end2+"Y"+end3+"' id='clockIntraday"+i+"c' "+
					"onclick='addRemClockIntraday("+end2+","+end3+",this)'>"+
					"<div style='height:17px'></div>A F T E R N O O N"+
					"<div class='clockIntradayLbls'>"+clkNonMil(18+offset)+"</div>"+
				"</div>"+
				"<div class='clockIntradayBtn "+end3+"Y"+end4+"' id='clockIntraday"+i+"d' "+
					"onclick='addRemClockIntraday("+end3+","+end4+",this)'>"+
					"<div style='height:17px'></div>N I G H T"+
					"<div class='clockIntradayLbls' style='"+lbSty+"'>12am</div>"+
				"</div>"+
			"</div>";
	}	
	return str ;
}

function clockAS(as){
	mapObj.fetchTimeObjs=[];
	ts=[];
	for(var i=0;i<100;i++){
		var abcd = ["a","b","c","d"];
		for(var j=0;j<4;j++){
			if(classListContains(document.getElementById("clockIntraday"+i+abcd[j]),"gold")){
				ts.push("clockIntraday"+i+abcd[j]);
			}
		}
	}
	var n = parseInt(document.getElementById('clockDays').className.split("_")[1]);
	if(n+as>5 || n+as<-6){return;}
	if(as==-1){document.getElementById('clockDays').innerHTML=makeClockDays(n -1);}
	if(as==1){document.getElementById('clockDays').innerHTML=makeClockDays(n + 1);}
	for(var i=0;i<ts.length;i++){
		document.getElementById(ts[i]).click();	
	}
	document.getElementById('clockDays').className="clockAS_"+(n+as);
}


function addRemClockDay(i,el){
	if(el.className == 'ARCDayOn'){
		var abcd = ["a","b","c","d"];
		for(var j=0;j<4;j++){
			if(!classListContains(document.getElementById("clockIntraday"+i+abcd[j]),"gold")){
				var e = document.getElementById("clockIntraday"+i+abcd[j]);
				addRemClockIntraday(e.className.split(/[ Y]/)[1], e.className.split(/[ Y]/)[2], e);
			}
		}
		el.className='ARCDayOff'; return;
	}
	if(el.className == 'ARCDayOff'){
		var abcd = ["a","b","c","d"];
		for(var j=0;j<4;j++){
			if(classListContains(document.getElementById("clockIntraday"+i+abcd[j]),"gold")){
				var e = document.getElementById("clockIntraday"+i+abcd[j]);
				addRemClockIntraday(e.className.split(/[ Y]/)[1], e.className.split(/[ Y]/)[2], e);
			}
		}
		el.className='ARCDayOn';
	}
}


function addRemClockIntraday(s,e,self){
	classListToggle(self,"gold");
	var contains = -1;
	for(var i=0;i<mapObj.fetchTimeObjs.length;i++){
		if(mapObj.fetchTimeObjs[i].end==e){
			contains=i;
		}
	}
	if(contains==-1){mapObj.fetchTimeObjs.push({start:s,end:e});}
	if(contains!=-1){mapObj.fetchTimeObjs.splice(contains,1);}
}



function closeClockSlideDiv(){
	classListAdd(document.getElementById('clockSlideDiv'),'hidden');
	if(classListContains(document.getElementById('listDivContainer'),'hidden')){ fetchPostsAndDisplay();}
	else{listReset(); getPostsAndCreateList();}
}

function initialClock(){
	clockGuts();
	var n = 0;
	var hrs = new Date().getHours();
	if(hrs < 3){n=1;}
	var a = document.getElementById("clockIntraday"+n+"a");
	var b = document.getElementById("clockIntraday"+n+"b");
	var c = document.getElementById("clockIntraday"+n+"c");
	var d = document.getElementById("clockIntraday"+n+"d");
	var a1 = document.getElementById("clockIntraday"+(n+1)+"a");
	var b1 = document.getElementById("clockIntraday"+(n+1)+"b");	
	if(hrs<10){addRemClockIntraday(a.className.split(/[ Y]/)[1], a.className.split(/[ Y]/)[2], a)}
	if(hrs<14){addRemClockIntraday(b.className.split(/[ Y]/)[1], b.className.split(/[ Y]/)[2], b)}
	if(hrs<18){addRemClockIntraday(c.className.split(/[ Y]/)[1], c.className.split(/[ Y]/)[2], c)}
	if(hrs<=23){addRemClockIntraday(d.className.split(/[ Y]/)[1], d.className.split(/[ Y]/)[2], d)}
	addRemClockIntraday(a1.className.split(/[ Y]/)[1], a1.className.split(/[ Y]/)[2], a1);
	addRemClockIntraday(b1.className.split(/[ Y]/)[1], b1.className.split(/[ Y]/)[2], b1);
	document.getElementById("clkChkDySpn"+n).className='ARCDayOff';
}

function clockErasePast(){
	var now = new Date().getTime() - 1800000;
	var tmpFetchTimeObjs = $.extend(true,[],mapObj.fetchTimeObjs);
	for(var i =0;i<mapObj.fetchTimeObjs.length;i++){
		if(mapObj.fetchTimeObjs[i].start < now){tmpFetchTimeObjs[i].start = now;}
	}
	return tmpFetchTimeObjs;
}

function allClock(){
	var abcd=["a","b","c","d"];
	for(var i=0;i<100;i++){
		document.getElementById("clkChkDySpn"+i).className="ARCDayOff";
		for(var j=0;j<4;j++){
			classListAdd(document.getElementById("clockIntraday"+i+abcd[j]),"gold");
		}
	}
	mapObj.fetchTimeObjs = [{start:new Date().getTime(),end:new Date().getTime() + 8640000000}];
}

function clearClock(){
	var abcd=["a","b","c","d"];
	for(var i=0;i<100;i++){
		document.getElementById("clkChkDySpn"+i).className="ARCDayOn";
		for(var j=0;j<4;j++){
			classListRemove(document.getElementById("clockIntraday"+i+abcd[j]),"gold");
		}
	}
	mapObj.fetchTimeObjs = [];
}



