/**
 * KSPP - Game Room
 * Copyright (C) 2017  Tristan Cunningham
 */
   'use strict';
   
var express = require('express');

module.exports = class GameRoom{
	
	/**
	 * Construct GamePlayer
	 * @param {code} room Code
	 * @param {io} socket Io
	 * @param {app} App data
	 */
	constructor(code, io, app, gameLoader, api, config){
		this.code = code;
		this.players = [];
		this.io = io;
		this.app = app;
		this.ready = false;
		this.timer = 5000;
		this.timerM = 5000;		// Timer start time
		this.selectedGame = 0;
		this.gamePackage = null;
		this.packages = gameLoader.packages;
		this.inGame = false;
		this.host = {};				// host player data
		this.api = new api(this);
		this.maxplayers = config.roomPlayerLimit;
		this.minplayers = 2;
	}
	
	/**
	 * Start Timer - starts ready countdown
	 */
	startTimer(){
		this.timer = 5000;
		this.timerM = 5000;
		this.ready = true;
	}
	
	/**
	 * Stop Timer - Stops ready countdown
	 */
	stopTimer(){
		this.timer = 5000;
		this.timerM = 5000;
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
		console.log(this);
		var game = require(this.packages[this.selectedGame].game);
		
		this.gamePackage = new game(this.api, this.players, this.packages[0].dir);
		this.inGame = true;
		this.gamePackage.start();
	}
	
	getGameName(index){		
		return this.packages[index].details.name;
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
		
		this.replacePage('gameRoom', { code: this.code, players: this.players, games: this.packages });
		this.replacePage('gameRoom', { code: this.code, players: this.players, host: true, games: this.packages }, this.host.socket);
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
		
		console.log(page);
		
		var temp, host;
		
		this.app.render(page, data, function(err, html){
			temp = html;
			console.log(err);
		});
		
		
		data.host = true;
		this.app.render(page, data, function(err, html){
			host = html;
		});
		
		console.log(temp);
		
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
			maxPlayers: this.maxplayers,
			minPlayers: this.minplayers,
			timer: Math.round(this.timer / 1000),
			ready: this.ready,
			message: (message) ? message : "Update",
			game: this.packages[this.selectedGame].details
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
			this.minplayers = this.packages[this.selectedGame].details.minPlayers;
			this.updateRoom();
		}
	}
	
	doesNameExist(name){
		for(var i = 0; i < this.players.length; i++){
			if(this.players.name == name){
				return true;
			}
		}
		
		return false;
	}
	
}