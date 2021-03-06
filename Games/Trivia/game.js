/*!
 * KSPP
 * Trivia Game
 * 
 * 	This is a simple trivia game running on the KSPP API
 * 
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */


'use strict';

module.exports = class GameTrivia {

	constructor(parent, players, directory, config) {
		this.parent = parent;
		this.players = players;
		this.round = 1;
		this.roundQuestions = 0;
		this.data = require('./GameTriviaData.json');
		this.usedQuestions = [];
		this.currentQuestion = 0;
		this.answered = 0;
		this.timer = -1000;
		this.timerM = 0;
		this.nextPage = 0; // 0 = question
		this.scoreMulti = 1;
		this.config = config;
		this.dir = directory;
		this.answerSound = './sound/trivia-answer.wav';
	}

	start() {
		this.parent.replacePage("triviaStart", {
			players : this.players
		});
		this.loadNext();
	}

	end() {
		var max = 0, winners = [];
		
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].gameScore > max) max = this.players[i].gameScore;	
		}
		
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].gameScore == max) winners.push(this.players[i].id);	
		}
		
		this.parent.endGame(winners);
	}

	tick() {
		if (this.timer <= 0 && this.timer > -9000) {
			this.timer = -10000;
			this.timerM = 0;

			switch(this.nextPage) {
			case 0:
				this.loadNext();
				break;

			case 1:
				this.nextPage = 0;
				this.CheckAllAnswered(true);
				break;
			}
		} else if (this.timer > -10) {
			this.timer -= this.config.tickRate;
			this.parent.sendMessageToClient("game-timerbar", {
				width : (this.timer / this.timerM) * 100,
				text: "Time left: " + Math.round(this.timer / 1000) 
			});
		} else {
			if (this.timerM > 0) {
				this.timer = this.timerM;
			}
		}
	}

	//

	loadNext() {
		console.log("loadnext");
		if (this.roundQuestions <= 0) {
			this.loadRoundScreen(this.round);
			this.roundQuestions++;
		} else {
			switch(this.round) {
			case 1:
				if (this.roundQuestions > 3) {
					this.round++;
					this.roundQuestions = 0;
					this.loadNext();
				} else {
					this.roundQuestions++;
					this.loadQuestion();
				}
				break;

			case 2:
				if (this.roundQuestions > 3) {
					this.round++;
					this.roundQuestions = 0;
					this.scoreMulti = 2;
					this.loadNext();
				} else {
					this.roundQuestions++;
					this.loadQuestion();
				}
				break;

			case 3:
				if (this.roundQuestions > 1) {
					this.round++;
					this.roundQuestions = 1;
					this.scoreMulti = 3;
					this.loadNext();
				} else {
					this.roundQuestions++;
					this.loadQuestion();
				}
				break;

			case 4:
				this.loadEndScreen();
				this.round++;
				break;

			case 5:
				this.end();
				break;
			}
		}

		console.log(this.roundQuestions + " - round: " + this.round);
	}

	loadRoundScreen(round) {
		
		this.parent.replacePage("triviaRound", {
			data : this.data.questions[this.currentQuestion],
			round : this.round,
			text: "New round, Points have increased!"
		});
		
		this.timerM = 3000;
	}

	loadEndScreen() {
		this.parent.replacePage("triviaEnd", {
			data : this.data.questions[this.currentQuestion],
			players : this.players.sort(this.sortFunction, "gameScore")
		});
		this.timerM = 5000;
	}
	
	sortFunction(a, b, index) {
	    if (a[index] === b[index]) {
	        return 0;
	    }
	    else {
	        return (a[index] < b[index]) ? -1 : 1;
	    }
	}
	

	loadQuestion() {
		this.currentQuestion = this.getRandomInt(0, this.data.questions.length - 1);
		this.parent.replacePage("triviaQuestion", {
			data : this.data.questions[this.currentQuestion],
			players: this.players
		});

		this.nextPage = 1;
		this.timerM = 10000;
	}

	receiveMessage(data) {
		switch(data.messageType) {
		case "answer":
			this.receiveAnswer(data.uid, data.answer);
			break;
		}
	}

	receiveAnswer(UID, answer) {
		var player = this.findPlayer(UID);
		if (player.answered)
			return false;

		player.answered = true;
		player.answer = answer;
		this.answered++;
		
		this.parent.playSoundEffect(true, this.answerSound, "answer");
		this.parent.sendMessageToClient("trivia-panswer", this.getPlayerIndex(UID));


		this.parent.replacePage("triviaWait", {
			data : this.data.questions[this.currentQuestion]
		}, player.socket);

		this.CheckAllAnswered();
	}
	
	getPlayerIndex(UID){
		for (var i = 0; i < this.players.length; i++) {
			if (UID == this.players[i].id) {
				return i;
			}
		}
	}

	resetRound() {
		this.answered = 0;
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].answered = false;
			this.players[i].answer = null;
		}
	}

	CheckAllAnswered( override = false) {
		if (!override) {
			if (this.answered < this.players.length)
				return false;
		}

		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].answer) {
				if (this.players[i].answer == this.data.questions[this.currentQuestion].correct) {
					this.players[i].scoreTA = 1000 * this.scoreMulti;
					console.log(this.players[i].gameScore);
					this.players[i].gameScore += 1000 * this.scoreMulti;
					console.log(this.players[i].gameScore);
				} else {
					this.players[i].scoreTA = 0;
				}
			} else {
				this.players[i].scoreTA = 0;
			}
		}

		this.timerM = 10000;
		this.timer = 10000;
		this.nextPage = 0; 
		
		console.log(this.players);

		this.parent.replacePage("triviaEndScore", {
			data : this.data.questions[this.currentQuestion],
			players: this.players
		});
		
		this.resetRound();
	}
	
	

	//

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	findPlayer(UID) {
		for (var i = 0; i < this.players.length; i++) {
			if (UID == this.players[i].id) {
				return this.players[i];
			}
		}
	}

}