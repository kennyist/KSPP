/*!
 * KSPP
 * WEBSITE JS FUNCTIONS
 * 
 * 	This file handles all js elements on the website
 * 
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */

var socket = io();
var UID = "";

// SETUP 

socket.on("connect", function(){
	console.log("connected");
	
	if(!localStorage.getItem('gameUniqueId')){
		UID = Math.random().toString(36).substring(3,16) + +new Date;
		localStorage.setItem('gameUniqueId', UID);
	} else {
		UID = localStorage.getItem('gameUniqueId');
	}
	
	socket.emit('register', { id: localStorage.getItem('gameUniqueId'), lang: $.cookie("lang") });
	console.log("sent: " + localStorage.getItem('gameUniqueId'));
});

socket.on("ReplacePage", function(data) {
	$("body").html(data);
});

socket.on("Login-error", function(data) {
	$("#loginError").show();
	$("#loginError").html(data);
});

// Game setup

socket.on("loadStyles", function(data){
	console.log(data);
	
	for(var i = 0; i < data.length; i++){
		var styles = document.createElement('link');
	    styles.type="text/css";
	    styles.rel="stylesheet";
	    styles.href="./"+ data[i];
	    document.head.appendChild(styles);
   }
});

socket.on("removeStyles", function(data){
	console.log(data);
	for(var i = 0; i < data.length; i++){
		$('link[rel=stylesheet][href~="./'+ data[i] +'"]').remove();
   }
});

// Stats

socket.on("Count-players", function(data){
	$("#activeplayers").html(data);
});

socket.on("Count-rooms", function(data){
	$("#activerooms").html(data);
});

// Sounds

var soundEffects = [];
var music;

socket.on("music-play", function(data){
	music = new Audio(data.clip);
	music.play();
});

socket.on("music-stop", function(){
	music.stop();
	music = null;
});

socket.on("music-pausePlay", function(data){
	if(data.pause){
		music.pause();
	}
	else {
		music.play();
	}
});

socket.on("soundEfct-play", function(data){
	
	console.log("Effect: " + data.key);
	
	for(var i = 0; i < soundEffects.length; i++){
		if(soundEffects[i].key === data.id){
			soundEffects[i].clip.currentTime=0;
			soundEffects[i].clip.play();
			
			return;
		}
	}
	
	soundEffects.push({
		key: data.id,
		clip: new Audio(data.clip)
	});
	
	soundEffects[soundEffects.length - 1].clip.play();
	
});

socket.on("soundEfct-stop", function(data){
	
	if(data.id != null){
		for(var i = 0; i < soundEffects.length; i++){
			if(soundEffects[i].key === data.id){
				soundEffects[i].clip.stop();
				
				return;
			}
		}
	}
	else 
	{
		for(var i = 0; i < soundEffects.length; i++){
			soundEffects[i].clip.stop();
		}
	}
	

});

socket.on("end-game", function(){
	music = null;
	soundEffects = [];
});

// Joining 

function createRoom(){
	socket.emit('create', $('input[name="name"]').val());
}

function joinRoom(){
	socket.emit('join', {name: $('input[name="name"]').val(), code: $('input[name="code"]').val()});
}



// Lobby

socket.on("room-lobby-update", function(data){
	console.log(data.message);
	
	var players = "";
	
	for(var i = 0; i < data.players.length; i++){
		players += "<li class='mdc-list-item'>" + 
					"<span class='mdc-list-item__text'>" + data.players[i].name +
					"<span class='mdc-list-item__text__secondary'>" + data.players[i].score + 
					" Wins</span></span>"+
					"<span class='mdc-list-item__end-detail'>"+ numberSuffix(i+1) +"</span></li>"+
					"<li class='mdc-list-divider' role='seporator'></li>";
	}
	
	$('#lobby-players').html(players);
	$('#playerCount').html(data.players.length + "/" + data.maxPlayers + " Players:");
	
	
	if(data.players.length >= data.minPlayers){
		$("#ready").html("Start Game");
		$("#ready").prop("disabled", false);
	} else {
		$("#ready").html("Start game: "+ data.players.length + "/" + data.minPlayers + " players required");
		$("#ready").prop("disabled", true);
	}
	
	if(data.ready){
		$('#ready').hide();
		$('#cancel').show();
	} else {
		$('#ready').show();
		$('#cancel').hide();
	}
	
	$('#selectedGame .mdc-card__media').css("background-image","url('"+data.game.headerimg+"')");
	$('#selectedGame .mdc-card__title').html(data.game.name);
	$('#selectedGame .mdc-card__subtitle').html(data.game.author);
	$('#selectedGame .mdc-card__supporting-text').html(data.game.summary);
	$('#selectedGame a').attr("href", data.game.link);
});

$(document).ready(function(){
	
	// COOKIES
	
	console.log("cookies");
	
	if(!$.cookie("lang")){
		console.log("cookie not found");
		var CookieSet = $.cookie("lang", "en", {
		   expires : 365,
		   path    : '/'
		   });
	}
	
	//
	
	window.onbeforeunload = confirmExit;
	
	function confirmExit()
	{
	  socket.emit("Disconnectme", UID);
	}
  
	
	mdc.autoInit();
	
	$(document).on("click", "#ready", function(){
		socket.emit("lobby-ready", UID);
		$('#ready').hide();
		$('#cancle').show();
	});
	
	$(document).on("click", "#cancel", function(){
		socket.emit("lobby-cancleReady", UID);
		$('#ready').show();
		$('#cancle').hide();
	});
	
	$(document).on("click", ".answer button", function(){
		socket.emit("game-answer", {uid: UID, answer: $(this).attr("value"), messageType: "answer"});
	});
	
	$(document).on("click", "#sendPicture", function(){
		console.log(document.getElementById("drawCanvas").toDataURL());
		socket.emit("game-answer", {
			uid: UID,
			answer: document.getElementById("drawCanvas").toDataURL(),
			messageType: "draw"
		});
	});
	
	$(document).on("click", "#drawAnswerSend", function(){
		
		if($('#drawAnswer').val() == "")
			return false;
		
		socket.emit("game-answer", {
			uid: UID,
			answer: $('#drawAnswer').val(),
			messageType: "suggestion"
		});
	});
	
	
	$(document).on("click", "#drawAnswer button", function(){
		console.log("sent: " + $(this).attr("val"));
		socket.emit("game-answer", {
			uid: UID,
			answer: $(this).attr("val"),
			messageType: "answer"
		});
	});
	
	$(document).on("click", "#gameChoice button", function(){
		console.log("sent");
		socket.emit("lobby-changeGame", {
			uid: UID,
			game: $(this).val()
		});
		
		$("button:disabled").html("Select game");
		$("button:disabled").prop('disabled', false);
		
		$(this).prop('disabled', true);
		$(this).html("Selected");
	});
	
	$(document).on("click", "#leaveroom", function(){
		
		location.reload(); 
		
		return false; 
		
		console.log("sent");
		socket.emit("leaveroom", {
			uid: UID
		});
		
		$('#countdown-bar-bg').hide();
	});
	
	$(document).on("click", "#lang", function(){
		$('#langbox').show();
	});
	
	$(document).on("click", "#langbox li", function(){
		var CookieSet = $.cookie("lang", $(this).attr("val"), {
		   expires : 365,
		   path    : '/'
		   });
		   
		   location.reload(); 
	});
	
});

// game

socket.on("game-timerbar", function(data) {
	$("#countdown-bar-bg").show();
	
	$("#countdown-bar").css({width: data.width + "%"});
	$("#countdown-bar-bg p").html(data.text);
	
	if(data.width <= 0){
		$("#countdown-bar-bg").hide();
	}
});

socket.on("trivia-panswer", function(data){
	console.log("Got answer: " + data);
	$("li[value='"+ data +"']").removeClass("no");
	$("li[value='"+ data +"']").addClass("yes");
});

// helpers

function numberSuffix(i) {
    var j = i % 10, k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
