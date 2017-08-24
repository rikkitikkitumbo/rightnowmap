//functions for the list div
function showList(){
	hideLowerIslands();
	if(document.documentElement.clientWidth>800){
		document.getElementById('listDivContainer').style.width="65%";
		document.getElementById('listDivContainer').style.marginLeft="19%";
	}
	document.getElementById('listDivContainer').style.height= ""+
		(document.documentElement.clientHeight - 14)+"px";
	document.getElementById('listDivContainer').innerHTML=makeListBtns();
	classListRemove(document.getElementById('listDivContainer'),'hidden');
	listReset();
	getPostsAndCreateList();
}

function hideList(){
	listReset();
	classListAdd(document.getElementById('listDivContainer'),'hidden');
	showIslands();
}

function listReset(){
	document.getElementById('listBtmContainer').innerHTML=""+
		"<div id='listBtmMessage' style='color:#777;text-align:center;'><br>Loading...</div>";
	mapObj.listPosts=[];
	mapObj.listScrollFetchCount=[0,false,false];
	setTimeout(function(){mapObj.listScrollFetchCount[1]=true;},3000);
}


function listSortByDate(){
	mapObj.listSortBy='date';
	classListRemove(document.getElementById('listSortByDistance'),"purple");
	classListAdd(document.getElementById('listSortByDate'),"purple");
//	mapObj.listPosts = mapObj.listPosts.sort(listCmpDate);
//	createList(mapObj.listPosts);
	listReset();
	getPostsAndCreateList();
}

function listSortByDistance(){
	mapObj.listSortBy='distance';
	classListRemove(document.getElementById('listSortByDate'),'purple');
	classListAdd(document.getElementById('listSortByDistance'),'purple');
//	mapObj.listPosts = mapObj.listPosts.sort(listCmpDis);
//	createList(mapObj.listPosts);
	listReset();
	getPostsAndCreateList();
}

function listSortBySearchWords(){
	mapObj.listSearchWords = document.getElementById('listSearchWords').value;
	if(mapObj.listSearchWords==''){createList(mapObj.listPosts); return;}
	for(var i=0;i<mapObj.listPosts.length;i++){
		mapObj.listPosts[i].searchWordCount=listHighlightSearchWords(mapObj.listPosts[i].post)[1];
	}
	mapObj.listPosts = mapObj.listPosts.sort(listCmpSearchWords);
	createList(mapObj.listPosts);
}

function listCmpDate(objA, objB){
	return objA.startTime - objB.startTime;
}

function listCmpDis(objA,objB){
	return listCalcDistance(objA) - listCalcDistance(objB);
}

function listCmpSearchWords(objA,objB){
	return objB.searchWordCount - objA.searchWordCount;
}


function makeListBtns(){
	var w = 'width:97%;left:0px;';
	if(document.documentElement.clientWidth>800){w='left:19%;width:65%;';}
	var ht = "style='height:"+(document.documentElement.clientHeight - 32)+"px;'";
	var datePurple = (mapObj.listSortBy=='date')? " purple":"";
	var disPurple = (mapObj.listSortBy=='distance')?" purple":"";
	return ""+
	"<div class='listDivClass' id='listDiv' "+ht+" onscroll='listScrollAtBtm(this)'>"+
		"<span class='closeListClass' onclick='hideList()'>X</span>"+
		"<input type='text' id='listSearchWords' class='listSearchWordsClass' "+
				"placeholder='keyword filter (optional)' value=''/>"+
		"<div class='btn blue searchListBtnClass' id='searchListBtn' onclick='listReset();getPostsAndCreateList()'></div><br>"+ 
		"<div class='listFilters' style='background-color:#f3d542;' onclick='displayClock()'>select Dates</div>"+
	//		"<div class='listFilters' style='background-color:#ff7e7e;margin-left:8px;'>select Categories</div>"+
		"<span style='margin-left:5px;'><input id='listShowPastEv' type='checkbox' onclick='listReset();getPostsAndCreateList();'"+
			"style='height: 22px;width: 22px;vertical-align: middle;' >Show past events</span>"+
		"<br><div class='listFilters"+datePurple+"' id='listSortByDate' "+
			"onclick='listSortByDate()'>sort by Date</div>"+
		"<div class='listFilters"+disPurple+"' id='listSortByDistance' style='margin-left:8px;' "+
			"onclick='listSortByDistance()'>sort by Distance</div>"+
		"<div class='listWithinXMilesClass' >Within "+
			"<input type='text' value='"+mapObj.listWithinXMiles+"' style='font-size:19px;width:28px;text-align:center;'"+
				"id='listInpWithinXMiles' onfocus='listSelectWithinInp();' onblur='listDeWithinInp()' />"+
			" miles <span style='font-weight:normal;font-size:13px;'>"+
			"(from center of map)</span>"+
		"</div>"+
		"<div class='listGotoTopClass' style='"+w+"' onclick='listGotoTop()'>scroll to top</div>"+
		"<div id='listBtmContainer' class='listBtmContainerClass'>"+
			"<div id='listBtmMessage' style='color:#777;text-align:center;'><br>Loading...</div>"+
		"<div>"+
	"</div>";
}

function makeListStr(posts){
	if(posts.length==0 && mapObj.listPosts.length==0){
		mapObj.listScrollFetchCount[2]=true;
		return "<div id='listBtmMessage"+mapObj.listScrollFetchCount[0]+"' "+
			"style='color:#666;text-align:center;'><br>No results...<br></div>";}
	if(posts.length==0){
		mapObj.listScrollFetchCount[2]=true;
		return "<div id='listBtmMessage"+mapObj.listScrollFetchCount[0]+"' "+
		"style='color:#666;margin:5px;text-align:center;'><br>No more Posts...<br><br></div>";}
	var str='';
	var mi = mapObj.listScrollFetchCount[0]*mapObj.listPostsPerFetch;
	for(var i=0;i<posts.length;i++){
		if(listCalcDistance(posts[i]) < mapObj.listWithinXMiles &&
			listHighlightSearchWords(posts[i].post)[1]!=0){
			var favGold = '';
			if(postIdFaved(posts[i].id)!=-1){favGold='favGold';}
			str+= ""+
			"<div id='listEl"+(i+mi)+"' class='listElContainerClass "+favGold+"'>"+
				"<span style='color:#666;'>"+m2n(posts[i].startTime)+"-</span>"+
				"<span style='color:"+voteCol(posts[i].voteCount)+";'>("+posts[i].voteCount+")</span>"+
				"<span style='margin-left:13px;color:#666'><b>"+listCalcDistance(posts[i]).toFixed(2)+"mi</b></span>"+
				"<br><span style='color:#222;display:inline-block;width:84%;'>"+
					listMakelilPost(posts[i].post)+"</span>"+
				"<div style='display:inline-block;vertical-align:top;width:15%;margin:4px 0px 9px;'>"+
					"<span class='btn blue' style='padding:4px 13px;'"+
						" onclick='listShowExpandedPost("+(i+mi)+")'>...</span>"+
					"<span class='listLilStarClass' onclick='listFavPost("+(i+mi)+")'></span>"+
				"</div>"+
			"</div>";
		}
	}
	str += ""+
		"<div id='listBtmMessage"+mapObj.listScrollFetchCount[0]+"'>"+
			"<span style='color:#666;text-align:center;margin:5px 0px 10px;display:block;'>"+
				"Loading more...</span>"+
		"</div>";
	return str;
}

function listScrollAtBtm(el){
	if(el.scrollHeight - el.clientHeight >= el.scrollTop &&
	el.scrollHeight - el.clientHeight <= el.scrollTop + 1 &&
	mapObj.listScrollFetchCount[1]==true && mapObj.listScrollFetchCount[2]==false){
		mapObj.listScrollFetchCount[1]=false;
		mapObj.listScrollFetchCount[0] +=1;
		getPostsAndCreateList();
	}
}


function listShowExpandedPost(index){
	var oLook = document.getElementById('listEl'+index).innerHTML;
	var postObj = mapObj.listPosts[index];
	var googDir = "";
	if(mapObj.listPosts[index].googDir==1){
		googDir="<a class='googleMapsLink' style='margin:0px 0px 3px 2%;' target='_blank' href='https://www.google.com/maps/place/"+
				postObj.lat+"+"+postObj.lng+"/@"+postObj.lat+","+postObj.lng+",17z'></a>";
	}
	var edit="";
	var del="";
	if(mapObj.listPosts[index].editable==true){
		edit = "<div class='listEditPostClass btn' onclick='editPost"+
		"("+index+")'>Edit</div>";
		del="<div class='listDelPostClass btn' onclick='confirmDel"+
			"("+mapObj.listPosts[index].id+","+index+")'>Delete</div>";
	}
	var str = ""+
	"<span class='listMinimizePostClass' onclick='listMinimizePost("+index+")'>__</span>"+
	"<a class='upVote' id='upVote"+postObj.id+"' onclick='upVote("+postObj.id+","+index+");'></a>"+
	"<div class='voteCount' id='voteCount"+postObj.id+"' style='color:"+voteCol(postObj.voteCount)+";'>("+postObj.voteCount+")</div>"+
	"<a class='downVote' id='downVote"+postObj.id+"' onclick='downVote("+postObj.id+","+index+")'></a>"+
	"<div style='margin-top:10px;'></div>"+	
	"<span style='color:#666;'>"+m2n(postObj.startTime)+"-</span>"+
	"<span style='margin-left:13px;color:#666'><b>"+listCalcDistance(postObj).toFixed(2)+"mi</b></span>"+
	"<div class='listPostClass'>"+listHighlightSearchWords(postObj.post)[0]+"</div>"+
	"<span class='listFavBtnClass' onclick='listFavPost("+index+")'></span>"+
	"<span class='listGoToMapBtnClass btn' onclick='listGoToMap("+index+")'>toMap</span>"+
    googDir+edit+del;
	document.getElementById('listEl'+index).innerHTML = str;
}

function listSelectWithinInp(){
	var e = document.getElementById('listInpWithinXMiles');
	e.value='';
	e.style.backgroundColor='blue';
}

function listDeWithinInp(){
	document.getElementById('listInpWithinXMiles').style.backgroundColor='white';
	if(!document.getElementById('listInpWithinXMiles').value){return;}
	mapObj.listWithinXMiles = parseFloat(document.getElementById('listInpWithinXMiles').value);
	listReset();
	getPostsAndCreateList();
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function listHighlightSearchWords(str){
	str = str.replace(/(<a)/gi,"$1 target='_blank'");
	var mat = str.match(/When: ([0-9]*)/);
	if(mat){
		var d = new Date(parseInt(mat[1])*1000);
		var day = dayOfWeek(d.getDay());
		if(d.getDate() == new Date().getDate()){ day='Today';}
		str = str.replace(/When: [0-9]*/,"When: "+day+", "+nonMilTime(d)[0]+", "+nonMilTime(d)[1]);
	}
	if(mapObj.listSearchWords==''){return [str,1];}
	var tStr = '';
	var changeCount = 0;
	var keywords = mapObj.listSearchWords;
	if(keywords != ''){
		var kwA = keywords.replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(/[ ,]/);
		for(var i=0;i<kwA.length;i++){
			var re = new RegExp("("+escapeRegExp(kwA[i])+"(?![^<]*<\/a>))","gi");
			tStr = str.replace(re, "<em class='white'>$1</em>");
			if(str != tStr){changeCount++;}
			str = str.replace(re, "<em class='white'>$1</em>");
		}
	}
	return [str,changeCount];
}

function listMakelilPost(post){
	post = post.replace(/^(<b>[^~]*<\/b>)([^~]*<\/a><br>)/, "$1");
	if(document.documentElement.clientWidth>=600){
		post = post.replace(/<br>/gi," ").replace(/^<b>/,"~~~")
		.replace(/<\/b>/,"~!~").replace(/<[^>]*>/gi,"").replace(/</gi,"")
		.replace(/Description: /,"").replace(/~~~/,"<b>").replace(/~!~/,"</b>").substr(0,480)+
		"...";
	}
	if(document.documentElement.clientWidth < 600){
		post = post.replace(/<br>/gi," ").replace(/^<b>/,"~~~")
		.replace(/<\/b>/,"~!~").replace(/<[^>]*>/gi,"").replace(/</gi,"")
		.replace(/Description: /,"").replace(/~~~/,"<b>").replace(/~!~/,"</b>").substr(0,200)+
		"...";
	}
	post=listHighlightSearchWords(post)[0];
	return post;
}

function listMinimizePost(index){
	var postObj = mapObj.listPosts[index];
	var str = ""+
	"<span style='color:#666;'>"+m2n(postObj.startTime)+"-</span>"+
	"<span style='color:"+voteCol(postObj.voteCount)+";'>("+postObj.voteCount+")</span>"+
	"<span style='margin-left:13px;color:#666'><b>"+listCalcDistance(postObj).toFixed(2)+"mi</b></span>"+
	"<span style='color:#222;display:inline-block;width:84%;'>"+
		listMakelilPost(postObj.post)+"</span>"+
	"<div style='display:inline-block;vertical-align:top;width:15%;margin:4px 0px 9px;'>"+
		"<span class='btn blue' style='padding:4px 13px;'"+
			" onclick='listShowExpandedPost("+index+")'>...</span>"+
		"<span class='listLilStarClass' onclick='listFavPost("+index+")'></span>"+
	"</div>";
	str=listHighlightSearchWords(str)[0];
	document.getElementById('listEl'+index).innerHTML = str;
}

function listFavPost(index){
	var postId = mapObj.listPosts[index].id;
	classListToggle(document.getElementById('listEl'+index),'favGold');
	var favedIndex = postIdFaved(postId);
	if(favedIndex != -1){mapObj.postIdsFaved.splice(favedIndex, 1);}
	else{mapObj.postIdsFaved.push(postId);}
}	

function listGoToMap(index){
	var postId = mapObj.listPosts[index].id;
	var postObj = mapObj.listPosts[index];
	if(postIdFaved(postId) == -1){
		mapObj.postIdsFaved.push(postId);}
	hideList();
	fetchPostsAndDisplay();
	mapObj.map.setView([postObj.lat,postObj.lng],11);
}


function listCalcDistance(postObj){
	var mapC = mapObj.map.getCenter();
  var	postLat = parseFloat(postObj.lat);
	var postLng = parseFloat(postObj.lng);
	var latDiff = Math.abs(mapC.lat - postLat);
	var lngDiff = Math.abs(mapC.lng - postLng);
	var avgLatRad = mapC.lat * (Math.PI/180);
	var csqrd = Math.pow(latDiff*69.172,2) + Math.pow(lngDiff*69.172*(Math.cos(avgLatRad)),2);
	return Math.sqrt(csqrd);
}

function listGotoTop(){document.getElementById('listDiv').scrollTop=0;}

function getPostsAndCreateList(){
	if(mapObj.listWithinXMiles <= 0){return;}
	var tmpFetchTimeObjs = $.extend(true,[],mapObj.fetchTimeObjs);
	if(document.getElementById('listShowPastEv').checked==false){tmpFetchTimeObjs = clockErasePast();}
	var lat = parseFloat(mapObj.map.getCenter().lat.toFixed(5));
	var lng = parseFloat(mapObj.map.getCenter().lng.toFixed(5));
	mapObj.listSearchWords = document.getElementById('listSearchWords').value;
	var params={lat:lat, lng:lng, fetchTimeObjs:tmpFetchTimeObjs,
		sortBy:mapObj.listSortBy, withinAmt:mapObj.listWithinXMiles,
		keyWords:mapObj.listSearchWords,scrollCount:mapObj.listScrollFetchCount[0],
		postsPerFetch:mapObj.listPostsPerFetch};
	$.get('php/rightNow/getPostsForList.php', params, function(result){
		document.getElementById('listBtmMessage').innerHTML='';
		result = JSON.parse(result);
		for(var i=0;i<result.length;i++){mapObj.listPosts.push(result[i]);}
		document.getElementById('listBtmContainer').innerHTML += makeListStr(result);
		if(mapObj.listScrollFetchCount[0] > 0){
			document.getElementById("listBtmMessage"+(mapObj.listScrollFetchCount[0]-1)).innerHTML='';
		}
		if(mapObj.listPosts.length<mapObj.listPostsPerFetch && mapObj.listPosts.length>0){
			mapObj.listScrollFetchCount[2]=true;
			document.getElementById("listBtmMessage"+mapObj.listScrollFetchCount[0]).innerHTML= ""+
			"<span style='color:#666;text-align:center;margin:5px;display:block;'><br>No more Posts...<br><br></span>";
		}
		setTimeout(function(){mapObj.listScrollFetchCount[1]=true;},500);
	});	
}





