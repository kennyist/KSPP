// scoreTester
'use strict';

module.exports = class scoreTester {

	constructor(parent, players, directory) {
		this.parent = parent;
		this.players = players;
		this.config = {tickRate: 33.33};
		this.dir = directory;
		this.winner = null;
		this.timer = 10000;
	}

	start() {
		
		this.winner = Math.floor((Math.random() * this.players.length));
		
		this.parent.replacePage("scoreTester", {
			name : this.players[this.winner].name
		});
	}

	end() {
		var winners = [];
		winners.push(this.players[this.winner].id);
		this.parent.endGame(winners);
	}

	tick() {
		if (this.timer <= 0) {
			this.end();			
		} else if (this.timer > -10) {
			this.timer -= this.config.tickRate;
			this.parent.sendMessageToClient("game-timerbar", {
				width : (this.timer / 10000) * 100,
				text: "Time left: " + Math.round(this.timer / 1000) 
			});
		}
	}
}