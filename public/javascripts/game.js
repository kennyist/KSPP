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
	$("body").html(data);
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
	
	for(var i = 0; i < data.players.length; i++){
		players += "<li class='mdc-list-item'>" + 
					"<span class='mdc-list-item__text'>" + data.players[i].name +
					"<span class='mdc-list-item__text__secondary'>" + data.players[i].score + 
					" Wins</span></span>"+
					"<span class='mdc-list-item__end-detail'>1st</span></li>"+
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
