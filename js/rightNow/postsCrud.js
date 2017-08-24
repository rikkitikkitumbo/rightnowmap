
//----------user posts crud stuff-----------
function charCount(){
	var str = document.getElementById('postInput').innerHTML;
	var re = /((http|https|ftp):\/\/[^ ]*\.[^ ]*)/g;
	str = str.replace(re, "<a href='$1' target='_blank'>$1</a>");
	var len = 4000000 - str.length;
	if (len>=0){
		document.getElementById('postCount').innerHTML = "";
		return 1;
	}
	if (len<0){
		document.getElementById('postCount').innerHTML ="TOO MANY CHARACTERS ("+len+")";
		shakeshake(document.getElementById('postCount'));
		return 0;
	}
}


function updatePostInputPopup(){
	var edGoogLocChkBxChecked = document.getElementById('edGoogLocChkBx').checked;
	var geoLocSearchWordsVal = document.getElementById('geoLocateSearchWords').value;
	var eventTitleVal = document.getElementById('eventTitle').value;
	var c = document.querySelectorAll('.leaflet-popup-content')[0].innerHTML;
	mapObj.popup.setContent(c);
	document.getElementById('edGoogLocChkBx').checked=edGoogLocChkBxChecked;
	document.getElementById('geoLocateSearchWords').value=geoLocSearchWordsVal;
	document.getElementById('eventTitle').value = eventTitleVal;
}

function dhEditGoogLoc(){
	var GogBxChecked = document.getElementById('edGoogLocChkBx').checked;
	classListToggle(document.getElementById('eventGoogLocSearch'),'hidden');
	updatePostInputPopup();
	document.getElementById('edGoogLocChkBx').checked=GogBxChecked;
}	

function placeHold(el){
	var oVal = el.value;
	if(oVal=="Post Title"||oVal=="This post needs a Title!!!"||
	oVal=="Address/Place, City, State"||
	oVal=="keyword filter (optional)"){
  	el.value='';
	}
	if(el.innerHTML.match(/Post description goes here.../)){
		el.innerHTML="";
	}
	el.style.color='#222';
}

function postInputDiv(){
	var imgH = ""; if(!window.FileReader){imgH="hidden";}
	var pHt = document.documentElement.clientHeight - 340;
	if(document.documentElement.clientWidth < 600){
		pHt = document.documentElement.clientHeight - 525;
	}
	if(pHt<105){pHt=105;}
	return ""+
	"<div id='scheduleDivContainer' class='hidden'></div>"+
	"<div id='postInpTopDiv' style='margin:-5px 0px 5px 0px;'>"+
		"<input type='checkbox' id='edGoogLocChkBx' class='edGoogLocChkBxClass name='ne' "+
			"onclick='dhEditGoogLoc()'/> Provide <b><em class='white'>googleMaps</em></b> directions link"+
		"<div id='eventGoogLocSearch' class='hidden'>"+
			"<input type='text' id='geoLocateSearchWords' class='listSearchWordsClass' onclick='placeHold(this)' "+
			"style='width:72%;margin-top:0px;color:#999' value='Address/Place, City, State' oninput=''/>"+
			"<div id='eventGeoLocateSearchBtn' class='btn blue searchListBtnClass'"+ 
				"onclick='eventGeoLocateSearch();' ></div>"+
		"</div>"+
		"<input type='text' id='eventTitle' onclick='placeHold(this)' style='margin-top:1px;width:90%;"+
			"font-size:17px;text-align:center;color:#999;' maxLength='62' value='Post Title'/>"+
	"</div>"+
	"<div contenteditable='true' id='postInput' class='postInputClass' "+
		" onblur='charCount()' onclick='placeHold(this)' style='height:"+pHt+"px;'>"+
		"<div style='color:#666;'>Post description goes here...<br> "+
			"(hint: enter keywords at the end of your post to make it more searchable)</div>"+
	"</div>"+
	"<div class='postButtonsClass' id='postButtons'>"+
		"<span id='postCount' class='postCountClass' ></span>"+
		"<label for='imgInp' class='postInpInsPhoto' onclick='addImgError();'>"+
			"<input type='file' id='imgInp' class='hidden' name='img' onchange='addImg(this);' />"+
			"Insert Photo"+
		"</label>"+
		"<span id='btnPostContainer'>"+
			"<div class='btnClickPost' onclick='post(\"normalPost\")' id='btnPost'>Post</div>"+
		"</span>"+
	"</div>"+
	"<input type='text' id='imgInpTxt' class='hidden' name='img' placeholder='image address url' "+
			"style='margin-top:6px;' onchange='compressImage(this.value);'/>"+
	"<div class='postInputBottomDivContainer'>"+
		"<div id='postingDiv' class='downImgClass hidden'>Posting...</div>"+
		"<div id='eventDatesFront' style='margin-top:10px;' class='downImgClass'>"+schedDatesStr(true)+"</div>"+ 
	"</div>";
}	

function showImgTxtInp(){classListRemove(document.getElementById('imgInpTxt'),'hidden');}

function addImg(input) {
  document.getElementById('postInput').innerHTML += ""+
  	"<br><br><p style='text-align:center;color:#777;'>-uploading image-</p>";
	classListAdd(document.getElementById('imgInpTxt'),'hidden');
	document.getElementById('postInput').scrollTop=document.getElementById('postInput').scrollHeight - document.getElementById('postInput').clientHeight;
	if(window.FileReader){
		var reader = new FileReader();
		reader.onload = function (e) {
			compressImage(e.target.result);
		}
		setTimeout(function(){reader.readAsDataURL(input.files[0]);},100);
	}
}

function addImgError(){
	if(!window.FileReader){
		alert("Sorry, your browser doesn't support adding files."+
		" Try a different internet browser :)");}  
}

function compressImage(src){
	if(src.substr(5,5)!='image' && src.substr(0,4)!='http'){
		alert('Sorry, you are only allowed to upload images');
		var PIstr = document.getElementById('postInput').innerHTML;
		document.getElementById('postInput').innerHTML = PIstr.substr(0,PIstr.length-70);
		return;	
	}
	var img = new Image();
	var canvas = document.createElement('canvas');
	img.src=src;
	setTimeout(function(){
		var cw= setPopupWidth(.75);
		if(cw>550){cw=550;}
		var r = cw/img.width
		var ch = img.height*r;
		canvas.width = img.width*r*3;
		canvas.height = ch*3;
		canvas.getContext('2d').drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);
		if(src.substr(0,4)!='http'){src = canvas.toDataURL('image/jpeg');}
		var PIstr = document.getElementById('postInput').innerHTML;
		document.getElementById('postInput').innerHTML = PIstr.substr(0,PIstr.length-70);
		document.getElementById('postInput').innerHTML += ""+
			"<br><img src="+src+"><br><br><br>";
		charCount();
		setTimeout(function(){
			updatePostInputPopup();
			document.getElementById('postInput').scrollTop=document.getElementById('postInput').scrollHeight + document.getElementById('postInput').clientHeight;
		},300);
	},300);
}


function shakeshake(e){
	e.style.marginLeft='8px';
	setTimeout(function(){e.style.marginLeft='0px';},80);
	setTimeout(function(){e.style.marginLeft='8px';},160);
	setTimeout(function(){e.style.marginLeft='0px';},240);
}


function postSuccessConent(type){
	if(type == "normal"){
		return "<div id='psc' class='postSuccessContainer'>Thanks for posting!<br>"+
			" Your post will be displayed during the times it was scheduled."+
			" You can see your post by clicking the <b style='text-shadow:2px 1px 0px white;'>"+
				"List</b> button in the top right."+
		"</div>"; 
	}
	if(type == "update"){
		return "<div id='psc' class='postSuccessContainer'>Updated!<br>"+
			" Your post will be displayed during the times it was scheduled."+
			" You can see your post by clicking the <b style='text-shadow:2px 1px 0px white;'>"+
				"List</b> button in the top right."+
		"</div>"; 
	}
}

function postFailureContent(failMes){
	if(failMes=='overposting'){
		return "<div id='psc' class='postSuccessContainer'>"+
			"<div style='color:red;'><br>Sorry, you are posting too much.</div>"+
			" You can edit a post by finding it in the <b style='text-shadow:2px 1px 0px white;'>"+
			"List</b>, expanding it with <span class='btn blue'> ... </span>, "+
			"and clicking the <b>edit</b> button.";
	}
	return ""+
	"<div id='psc' class='postSuccessContainer' style='color:red;'>"+failMes+"</div>"; 
}




function fillEditPost(index){
	if(mapObj.listPosts[index].googDir==1){document.getElementById('edGoogLocChkBx').click();}
	var regEx = /^<b>([^\-]+)-<\/b><br>/;
	var eventTitle = regEx.exec(mapObj.listPosts[index].post);
	document.getElementById('eventTitle').value=eventTitle[1];
	document.getElementById('eventTitle').style.color="#222";
	document.getElementById('postInput').innerHTML=mapObj.listPosts[index].post.replace(regEx,"");
	mapObj.eventTimes = [];
	var updateIds = "";
	$.get('/php/rightNow/getPostsToUpdate.php',{ids:mapObj.listPosts[index].delKey},function(res){
		res = JSON.parse(res);
		for(var i=0;i<res.length;i++){
			updateIds += res[i].id+","; 
			mapObj.eventTimes.push(res[i].startTime*1000);
		}
		document.getElementById('eventDatesFront').innerHTML=schedDatesStr(true);
		document.getElementById('btnPostContainer').innerHTML=""+
		"<button type='button' class='btnClickPost' id='btnPost'"+
			"onclick='post(\""+updateIds+"\")'>Update</button>";
	});
}

function editPost(index){
	if(document.getElementById('listDivContainer')){
		classListAdd(document.getElementById('listDivContainer'),'hidden');
	}
	mapObj.map.setView([mapObj.listPosts[index].lat,mapObj.listPosts[index].lng],12);
	setTimeout(function(){
		onMapClick();
		fillEditPost(index);
	},500);
}

function makeEventPost(post){
	var title=document.getElementById('eventTitle').value;
	title = title.replace(/<|>/g,"");
	return "<b>"+title+" -</b><br>"+post;
}

function prePostCheck(){
	if(charCount() != 1){return;}
	if(mapObj.eventTimes.length==0){
		document.getElementById('clkHrEdEvTm').style.color="red";
		document.getElementById('clkHrEdEvTm').innerHTML="This post needs a time!!!";
		setTimeout(function(){
			document.getElementById('clkHrEdEvTm').style.color="white";
			document.getElementById('clkHrEdEvTm').innerHTML="(Click here to edit times)";
		},2000);
		return 0;
	}
	if(document.getElementById('eventTitle').value=='Post Title' || 
		document.getElementById('eventTitle').value=='' ||
		document.getElementById('eventTitle').value=='This post needs a Title!!!'){
		document.getElementById('eventTitle').style.color="red";
		document.getElementById('eventTitle').value="This post needs a Title!!!";
		setTimeout(function(){
			document.getElementById('eventTitle').style.color="#999";
			document.getElementById('eventTitle').value="Post Title";
		},1000);	
		return 0;
	}
	return 1;
}

function showConfirmPost(updateIds){
    if(prePostCheck() != 1){return;}
    if(document.documentElement.clientHeight > 1000){
            document.getElementById('confirmPost').style.bottom='43%';}
    classListRemove(document.getElementById('confirmPost'),'hidden');
    document.getElementById('confirmPostBtn').onclick=function(){post(updateIds);closeConfirmPost();}
}

function closeConfirmPost(){
    classListAdd(document.getElementById('confirmPost'),'hidden');
}

function post(updateIds){
	if(prePostCheck() != 1){return;}
	document.getElementById('btnPost').onclick='';
	if(document.getElementById('postingDiv')){
		classListRemove(document.getElementById('postingDiv'),'hidden');}
	if(updateIds != "normalPost"){updateIds = updateIds.slice(0,-1).split(',');}
	var googDir = (document.getElementById('edGoogLocChkBx').checked==true)?1:0;
	var post = " "+document.getElementById('postInput').innerHTML;
	var re = /([^"])((http|https|ftp):\/\/[^ ]*\.[^ <]*)/g;
	post = post.replace(re, "$1 <a href='$2' target='_blank'>$2</a>");
	var lat = parseFloat(mapObj.postLatLng.lat.toFixed(5));
	var lng = parseFloat(mapObj.postLatLng.lng.toFixed(5));
	var img = '';
	if(img==document.URL){img='';}
	var eventTimes = mapObj.eventTimes;
	post = makeEventPost(post);
	var params = {lat:lat,lng:lng,post:post,googDir:googDir,
		eventTimes:eventTimes,img:img,updateIds:updateIds};
	$.post('php/rightNow/post.php', params, function(result){
		result = JSON.parse(result);
		if(result[0]==1){
			mapObj.popup.options.autoPanPaddingTopLeft=[0,0];
			mapObj.popup.options.autoPanPaddingBottomRight=[0,0];
			document.querySelectorAll('.leaflet-popup-content')[0].innerHTML=
				postSuccessConent(result[1]);
			mapObj.map.setView([lat,lng],mapObj.map.getZoom());
			setTimeout(function(){
				mapObj.popup.options.autoPanPaddingTopLeft=[3,0];
				mapObj.popup.options.autoPanPaddingBottomRight=[0,8000];
			},2000);
		}
		if(result[0] !=1){
			mapObj.popup.setContent(postFailureContent(result[1]));
		}
	});
}

function confirmDel(postId,index){
	var delal = '';
	if(mapObj.listPosts[index].delKey.split(',').length>1){
		delal="<span style='font-size:14px;font-weight:normal;'>"+
			"<input id='delAllLike' style='width:16px;height:16px;vertical-align:sub;' type='checkbox'>"+
				"Delete all scheduled days"+
		"</span><br>";
	}
	var guts = "Are you sure you want to <em class='white'>delete</em> this post?<br>"+delal+
		"<br><span class='blue btn' onclick='hideConfirmDel()'>No</span>"+
		"<span class='red btn' onclick='delPost("+postId+","+index+")'>Yes</span>";
	if(document.documentElement.clientWidth<600){
		document.getElementById('confirmDel').style.width="80%";
		document.getElementById('confirmDel').style.left="7%";
	}
	document.getElementById('confirmDel').innerHTML = guts;	
	classListRemove(document.getElementById('confirmDel'),'hidden');
}

function hideConfirmDel(){
	classListAdd(document.getElementById('confirmDel'),'hidden');
}

function delPost(postId,index){
	if(document.getElementById('delAllLike')){
		if(document.getElementById('delAllLike').checked){
			postId=mapObj.listPosts[index].delKey;
		}
	}
	hideConfirmDel();
	$.post('php/rightNow/delPost.php',{postIds:postId},function(response){
		if(response==1){
			listReset();
			getPostsAndCreateList();
		}
	});
}

function upVote(postId, index){
	$.post('php/rightNow/upVote.php',{postId:postId}, function(response){
		var e = document.getElementById("upVote"+postId);
		var c = document.getElementById("voteCount"+postId);
		var orig = c.innerHTML; 
		if(response ==2){
			var count = parseInt(orig.slice(1,-1)) + 1;
			c.innerHTML = "("+count+")";
			c.style.color = voteCol(count);
			mapObj.listPosts[index].voteCount++;
		}
		else{shakeshake(e);}
	});
}

function downVote(postId,index){
	$.post('php/rightNow/downVote.php', {postId:postId}, function(response){
		var e = document.getElementById("downVote"+postId);
		var c = document.getElementById("voteCount"+postId);
		var orig = c.innerHTML; 
		if(response ==2){
			var count = parseInt(orig.slice(1,-1)) - 1;
			c.innerHTML = "("+count+")";
			c.style.color = voteCol(count);
			mapObj.listPosts[index].voteCount--;
			if(count<-5){
				alert('This post has been deleted due to down-voting.  Thanks for keeping RightNow Map clean!');
				listReset();
				getPostsAndCreateList();
			}
		}
		else{shakeshake(e);}
	});
}
