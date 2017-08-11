// scoreTester
'use strict';

module.exports = class scoreTester {

	constructor(api, players, directory, config) {
		this.api = api;
		this.players = players;
		this.config = config;
		this.timer = 10000;
		this.timerStart = false;
	}
	
	// Start point of any game folder
	start() {
		this.api.replacePage("templateView", {
			players : this.players
		});
		
		this.timerStart = true;
	}
	
	// Called when a player leaves the game
	playerLeft(player){
		var index = this.players.indexOf(player);
		
		if (index > -1) {
		    this.players.splice(index, 1);
		}
	}
	
	// Force called if players in game dont meet the minumu
	end() {
		// Call the end game from API
		this.api.endGame(this.players[0].id);
	}

	tick() {
		if (this.timer <= 0) {
			
			this.end();												// End the game
			
		} else if (this.timerStart) {
			
			this.timer -= this.config.tickRate;						// Minus time by config.tickrate
			
			this.api.sendMessageToClient("game-timerbar", {		// Update countdown time bar
				width : (this.timer / 10000) * 100,
				text: "Time left: " + Math.round(this.timer / 1000) 
			});
		}
	}
}