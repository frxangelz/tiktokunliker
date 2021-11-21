/*
	TikTok Unliker - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
	github : 
*/

tick_count = 0;
cur_url = "test";
following_page = 'https://www.tiktok.com/';

const _MAX_UNFOLLOW_TO_RELOAD = 40;

last_click = 0;
last_call = 0;
reload = 0;
enabled = 0;
no_buttons = false;
overlimit = false;
r_interval = 0;

first = true;
cur_unfollow = 0;

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	fastway : 0,
	unfollow_friends : true
}

function check_following_page(){

	if(cur_url.indexOf('tiktok.com') !== -1)
		return true;
	return false;
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}


var last_unlike_url = '';
function _unfollow(){
	
	if(cur_url.indexOf("/video/") === -1){
	
		return false;
	}
	
	if(last_unlike_url == cur_url){
		console.log("wait for close button....");
		return true;
	}
	
	last_unlike_url = cur_url;
	
	// close btn
	var cbtn = document.querySelector('button[class*="StyledCloseIconContainer"]');
	if(!cbtn){
		console.log("no close button found !");
		return;
	}
	
	var btn = document.querySelector('span[data-e2e="browse-like-icon"]');
	if(!btn) { 
		console.log('span[data-e2e="browse-like-icon"] not found !');
		return false; 
	}
	
	// unlike it
	console.log("unliked !");
	btn.click();
	
	config.total++;
	cur_unfollow++;
	chrome.extension.sendMessage({action: 'inc'}, function(response){
				if(response.status == false)
					config.enable = 0;
	});	

	var tmDelay = 2000;
	if(config.fastway) {
		tmDelay = 200;
	}
	
	setTimeout(function(){
		cbtn.click();
	},tmDelay);
	
	return true;
}

/* hanya nama fungsi unfollow, sebenarnya unlike, males ganti-nya :) */
var tab = null;

function unfollow(){

	tab = document.querySelector('span[class*="SpanLiked"]');
	if(!tab){
		console.log("No Liked Tab found !");
		info("please go to profile page");
		return;
	}
	
	var section = document.querySelector('div[data-e2e="user-liked-item-list"]');
	if(!section){
		console.log("section not found !");
		tab.click();
		return;
	}
	
	var items = section.querySelectorAll('div[data-e2e="user-liked-item"]');
	if ((!items) || (items.length < 1)){ 
	
		console.log("no Button Found :(");
		no_buttons = true;
		return; 
	}
	
	var txt;
	var a = null;
	for(var i=0; i<items.length; i++){

		txt = items[i].getAttribute("signed");
		if(txt === "1") { continue; }

		items[i].setAttribute("signed","1");
		// check for link
		a = items[i].querySelector('a[href*="/video/"]');
		if(!a){
			console.log("invalid links");
			continue;
		}
		
		console.log("items clicked !");
		a.click();
		items[i].scrollIntoView();
		return;
	}	

	console.log("No Button :(");
	// butuh reload, tidak nemu yang dicari :)
	no_buttons = true;
}
 
function noVideo(){
	var vids = document.getElementsByTagName('video');
	for(var i=0; i<vids.length; i++){
		vids[i].parentNode.removeChild(vids[i]);
	}
}

function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}
	
function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	info.textContent = "Unliked : "+config.total+", "+txt;
}
	
function simulateMouseOver(myTarget) {
  var event = new MouseEvent('mouseover', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var canceled = !myTarget.dispatchEvent(event);
  if (canceled) {
    //console.log("canceled");
  } else {
    //console.log("not canceled");
  }
}
	
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.total = request.total;
		config.max = request.max;
		config.chance = request.chance;
		config.interval = request.interval;
		config.fastway = request.fastway;
		config.unfollow_friends = request.unfollow_friends;
		tick_count = 0;
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				console.log("removed");
				info.parentNode.removeChild(info);
			}
			config.total = 0;
			overlimit = false;
			first = true;
		}
	}
});
 
    chrome.extension.sendMessage({}, function(response) {
    
	   var readyStateCheckInterval = setInterval(function() {
	       if (document.readyState === "complete") {

			   
		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.total = response.total;
					config.max = response.max;
					config.chance = response.chance;
					config.interval = response.interval;
					config.fastway = response.fastway;
					config.unfollow_friends = response.unfollow_friends;
					
					r_interval = get_random(config.interval,config.chance); 
					console.log("got interval : "+r_interval);
				});
		   }
		   
		   cur_url = window.location.href;
           tick_count= tick_count+1; 

		   
		   if((config.enable == 1) && (cur_url.indexOf('tiktok.com') !== -1) && (config.total < config.max)){

		   noVideo();
		   show_info();

		   // check halaman following
		   if(check_following_page()){
			   
			if(_unfollow()) {
				if(cur_unfollow >= _MAX_UNFOLLOW_TO_RELOAD){ no_buttons = true; return; }
				if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); }
				return;
			}

			if (overlimit) {
				
				if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
				return;
			}
			   
			if(no_buttons) {

				var no_button_wait = 30;
				if(config.fastway) { no_button_wait = 10; }
				if(tick_count > no_button_wait){
			
					console.log("No Button, Reload");
					tick_count = 0;
					window.location.href=cur_url;
				} else {
					var c = no_button_wait - tick_count;
					info("Waiting For "+c+" seconds to reload");
				}
				
		
				return;
			}
			   
			   if(config.fastway) { 
				   r_interval = 1;
				   info("no delay");
				}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					unfollow();
					r_interval = get_random(config.interval,config.chance); 
					//console.log("got interval : "+r_interval);
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
		   } else {
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					r_interval = get_random(config.interval,config.chance); 
					window.location.href = following_page;
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
			   
		   }
				
		   } else {
			console.log('tick disable');
		   }

	   }
	}, 1000);
	
});

