// GameRoom.js
   'use strict';
   
var express = require('express');

module.exports = class GameRoom{
	
	/**
	 * Construct GamePlayer
	 * @param {code} room Code
	 * @param {io} socket Io
	 * @param {app} App data
	 */
	constructor(code, io, app){
		this.code = code;
		this.players = [];
		this.io = io;
		this.app = app;
		this.ready = false;
		this.timer = 10000;
		this.timerM = 10000;		// Timer start time
		this.selectedGame = 0;
		this.gamePackage = null;
		this.inGame = false;
		this.host = {};				// host player data
	}
	
	/**
	 * Start Timer - starts ready countdown
	 */
	startTimer(){
		this.timer = 1000;
		this.timerM = 1000;
		this.ready = true;
	}
	
	/**
	 * Stop Timer - Stops ready countdown
	 */
	stopTimer(){
		this.timer = 10000;
		this.timerM = 10000;
		this.ready = false;
		this.updateRoom();
	}
	
	/**
	 * game tick - on receive tick, push to game and lower timers
	 */
	tick(){
		if(this.ready){
			this.timer -= 33.33;
			this.updateRoom();
		}
		
		if(this.timer <= 0 && this.ready){
			this.timer = 0;
			this.ready = false;
			this.updateRoom();
			this.startGame();
		}
		
		if(this.inGame){
			this.gamePackage.tick();
		}
	}
	
	/**
	 * Start game - Loads game package and starts game
	 */
	startGame(){		
		var game = null;
		
		switch(this.selectedGame){
			case 0:
				game = require('./GameTrivia.js'); 
				console.log("loading trivia");
			break;
			
			case 1:
				game = require('./GamePaint.js');
				console.log("loading paint");
			break;
		}
		
		this.gamePackage = new game(this, this.players);
		this.inGame = true;
		this.gamePackage.start();
	}
	
	getGameName(index){
		var game = null;
		
		switch(this.selectedGame){
			case 0:
				game = "Trivia"; 
			break;
			
			case 1:
				game = "Drawing Game";
			break;
		}
		
		return game;
	}
	
	/**
	 * end game - End game and sends winners to room
	 */
	endGame(winners){
		this.inGame = false;
		this.gamePackage = null;
		
		if(winners){
			for(var i = 0; i < winners.length; i++){
				for(var j = 0; j < this.players.length; j++){
					console.log(winners[i] + " - " + this.players[j].id);
					if(winners[i] == this.players[j].id){
						this.players[j].score++;
					}
				}
			}
		}
		
		this.replacePage('gameRoom', { code: this.code, players: this.players });
		this.replacePage('gameRoom', { code: this.code, players: this.players, host: true }, this.host.socket);
	}
	
	/**
	 * get player from room 
	 * @return {array} player data
	 */
	GetPlayerInfo(){
		var ret = [];
		
		for(var i = 0; i < this.players.length; i++){
			ret.push({name: this.players[i].name, score: this.players[i].score, id: this.players[i].id});
		}
		
		return ret;
	}
	
	/**
	 * Add player - Adds player to room and sets them up
	 * @param {object} player data
	 */
	addPlayer(player){
		if(this.inGame) return false;
		
		this.players.push(player);
		this.updateRoom("New player Joined");
		
		this.stopTimer();
	}
	
	
	updatePlayer(player){
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].id == player.id){
				this.players[i].id = player.id;
				this.players[i].socket = player.socket;
				
				if(this.inGame){
					this.replacePage("gamePages/wait", {host: false}, player.socket);
				} else {
					this.replacePage("gameRoom", {code: this.code, players: this.players, host: false, game: this.getGameName(this.selectedGame)}, player.socket);
				}
			}
		}
	}
	
	/**
	 * Add host - Adds host data
	 * @param {object} player data
	 */
	addHost(player){
		this.host = player;
	}
	
	/**
	 * replacePage
	 * @param {string} page name
	 * @param {object} page data
	 * @param {socket} if not null - sends to this client only
	 */
	replacePage(page, data, socket){
		if(!data) data = {};
		
		var temp, host;
		
		this.app.render(page, data, function(err, html){
			temp = html;
		});
		
		
		data.host = true;
		this.app.render(page, data, function(err, html){
			host = html;
		});
		
		if(socket){
			socket.emit("ReplacePage" , temp);
		} else {
			this.io.to(this.code).emit("ReplacePage" , temp);
			this.host.socket.emit("ReplacePage" , host);
		}
	}
	
	/*
	 * update room - updates room data to players
	 * @param {string} message - optional message
	 */
	updateRoom(message){
		var data = {
			players: this.GetPlayerInfo(),
			timer: Math.round(this.timer / 1000),
			ready: this.ready,
			message: (message) ? message : "Update",
			game: this.getGameName(this.selectedGame)
		};
		
		this.io.to(this.code).emit("room-lobby-update", data);
		this.io.to(this.code).emit("game-timerbar", {
			text: "Game starts in: " + data.timer,
			width: (this.timer / this.timerM) * 100
		});
	}
	
	/*
	 * send game message - Send message to current game
	 * @param {data} message data
	 */
	sendGameMessage(data){
		this.gamePackage.receiveMessage(data);
	}
	
	/*
	 * send message to clents - Send message to all room clients
	 * @param {data} message data
	 */
	sendMessageToClient(type, data){
		this.io.to(this.code).emit(type, data);
	}
	
	/*
	 * sort array
	 */
	sortFunction(a, b, index) {
	    if (a[index] === b[index]) {
	        return 0;
	    }
	    else {
	        return (a[index] < b[index]) ? -1 : 1;
	    }
	}
	
	changeGame(data){
		console.log("change game");
		if(this.host.id == data.uid){
			this.selectedGame = data.game;
			this.updateRoom();
		}
	}
	
}