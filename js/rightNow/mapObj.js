// map object global var
//for saving favs
var pIdsFvTmp = document.getElementById('userFavPosts').value.split(',');
if(pIdsFvTmp[0]==""){pIdsFvTmp=[];}
var mapObj = {
	map: new L.Map('map',{
		maxBounds:L.latLngBounds([-11.31,-240],[60.91,5.50]),
	 	minZoom:4,
	 	maxZoom:12,
		fadeAnimation:false,
		zoomAnimation:true,
	}),
	popup: L.popup({
		autoPanPaddingTopLeft:[3,0],
		autoPanPaddingBottomRight:[0,8000],
		keepInView: true,
		minWidth: setPopupWidth(.86),
		maxWidth: setPopupWidth(.86),
	}),
	postLatLng: [],
	nonZoomMap: [1,false], //used for switching back and forth between maps upon zoom from user
	zoomMap: [1,true], //ditto to above ^^  see maps.js 
	markersGroup: [], //this is all the dots on the map 
	LocTries: 3, //sometimes refreshing nav.geolocation will work, so we try a few times
	postIdsRead: [], //for fading out opacity on dots on map
	postIdsFaved: pIdsFvTmp, //for coloring dots yellow! this is stored in a cookie                                                       
	fetchTimeObjs: [], //for fetching posts.. gets used all the time
	lastEventInpVal: 0, //for event Scheduling inputs (similar to select(this) )
	eventTimeLoaded:0, //the post Time to add to postTimes when 'add' is clicked
	eventTimes: [], //used for multi-date event scheduling
	listPosts: [], //for listing posts in listView 
	listWithinXMiles: 5, //list search radius
	listSortBy: 'date', //used to sort the list locally without querying database
	listSearchWords: '', //find searchwords locally without querying database
	listScrollFetchCount: [0,true,false], //for autoloading btmOfLst: fetchcount,okToFetch,reachedEndofDB 
	listPostsPerFetch:12,
	fetching:false, //to stop popup from closing on auto-refresh 
	recenterLatLng:[0,0], //for recentering the map after closing divs
};


//for setting proper popupWidth IE doesn't support css media inquery
function setPopupWidth(rat){
	var w = document.documentElement.clientWidth*(rat);
	
	if(w>650){return 650;}
	else{return w;}
}


//classList things for ie
function classListContains(el,str){
	var classListStr = el.className;
	var classList = el.className.split(' ');
	for(var i=0;i<classList.length;i++){
		if(classList[i]==str){return 1;}
	}
	return 0;
}

function classListAdd(el,str){
	if(classListContains(el,str) == 0){
		el.className = el.className + " "+str; }
}

function classListRemove(el,str){
	var classListStr = "";
	var classList = el.className.split(' ');
	for(var i=0;i<classList.length;i++){
		if(classList[i] != str){classListStr += " "+classList[i]}
	}
	el.className = classListStr.substr(1,classListStr.length);
}

function classListToggle(el,str){
	var classListStr = "";
	var classList = el.className.split(' ');
	var contains = 0;
	for(var i=0;i<classList.length;i++){
		if(classList[i] == str){contains=1;}
		if(classList[i] != str){classListStr += " "+classList[i];}
	}
	if(contains == 0){el.className = classListStr.substr(1,classListStr.length) + " " + str; }
	if(contains == 1){el.className = classListStr.substr(1,classListStr.length);}
}

	
