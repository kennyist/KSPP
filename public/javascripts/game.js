/**
 * @author Kennyist
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
	
	socket.emit('register', localStorage.getItem('gameUniqueId'));
	console.log("sent: " + localStorage.getItem('gameUniqueId'));
});

socket.on("ReplacePage", function(data) {
	$(".KSPPcontent").html(data);
});

socket.on("Login-error", function(data) {
	$("#loginError").show();
	$("#loginError").html(data);
});

// Sounds

var soundEffects = [];
var music;

socket.on("music-play", function(data){
	music = data.clip;
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
	
	for(var i = 0; i < soundEffects.length; i++){
		if(soundEffects[i].key === data.id){
			soundEffects[i].clip.stop().play();
			
			return;
		}
	}
	
	soundEffects.push({
		key: data.id,
		clip: data.clip
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
	
	$('#selectedGame').html("Next game is " + data.game + "!");
	
	for(var i = 0; i < data.players.length; i++){
		players += "<li>" + 
					"<p class='lobby-players-name'>" + data.players[i].name +
					" -</p><p class='lobby-players-score'>" + data.players[i].score + 
					" Wins</p></li>";
	}
	
	$('#lobby-players').html(players);
	$('#lobby-player-count').html("Players: " + data.players.length + "/8");
	
	if(data.ready){
		$('#ready').hide();
		$('#cancle').show();
	} else {
		$('#ready').show();
		$('#cancle').hide();
	}
});

$(document).ready(function(){
	
	mdc.autoInit();
	
	$(document).on("click", "#ready", function(){
		socket.emit("lobby-ready", UID);
		$('#ready').hide();
		$('#cancle').show();
	});
	
	$(document).on("click", "#cancle", function(){
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
		socket.emit("game-answer", {
			uid: UID,
			answer: $('#drawAnswer').val(),
			messageType: "suggestion"
		});
	});
	
	
	$(document).on("click", "#drawAnswer button", function(){
		console.log("sent");
		socket.emit("game-answer", {
			uid: UID,
			answer: $(this).val(),
			messageType: "answer"
		});
	});
	
	$(document).on("click", "#drawAnswer button", function(){
		console.log("sent");
		socket.emit("game-answer", {
			uid: UID,
			answer: $(this).val(),
			messageType: "answer"
		});
	});
	
	$(document).on("click", "#gameChoice li", function(){
		console.log("sent");
		socket.emit("lobby-changeGame", {
			uid: UID,
			game: $(this).val()
		});
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
