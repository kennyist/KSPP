// GameTrivia.js
'use strict';

module.exports = class GamePaint {

	constructor(parent, players) {
		this.config = {tickRate: 33.33};
		this.parent = parent;
		this.players = players;
		this.data = require('./GamePaintData.json');
		this.round = 0;
		this.roundStage = 0;
		this.timer = -10000;
		this.timerM = -10000;
		this.usedWords = [];
		this.answered = 0;
		this.pictures = [];
	}

	start() {
		this.parent.replacePage("paintStart");
		this.timerM = 5000;
		this.roundStage++;
	}

	end() {
		this.parent.endGame([]);
	}

	tick() {
		if(this.timer > this.timerM) this.timer = this.timerM;
		
		if (this.timer <= 0 && this.timer > -9000) {
			this.timer = -10000;
			this.timerM = 0;

			this.loadNext();

		} else if (this.timer > -10) {
			this.timer -= this.config.tickRate;

			this.parent.sendMessageToClient("game-timerbar", {
				width : (this.timer / this.timerM) * 100,
				text : "Time left: " + Math.round(this.timer / 1000)
			});

		} else {
			if (this.timerM > 0) {
				this.timer = this.timerM;
			}
		}
	}

	loadNext() {
		console.log("stage: " + this.roundStage);
		
		if(this.totalRounds){
			if(this.totalRounds > 0){
				if(this.round > this.totalRounds){
					this.end();
				}
			}
		}
		
		if (this.round > 0) {
			if(this.pictures.length <= 0){
				this.end();
			}
			this.normalRound();
		} else {
			this.roundZero();
		}
	}

	getWord() {
		var i = this.getRandomInt(0, (this.data.words.length - 1));
		var word = this.data.words[i];

		for (var i = 0; i < this.usedWords.length; i++) {
			if (word === this.usedWords[i]) {
				word = this.getWord();
			}
		}

		this.usedWords.push(word);

		return word;
	}

	roundZero() {
		switch(this.roundStage) {
		case 1:
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].word = this.getWord();

				this.parent.replacePage("paintDraw", {
					word : this.players[i].word
				}, this.players[i].socket);
			}

			this.parent.replacePage("paintDraw", {
				host : true
			}, this.parent.host.socket);

			this.timerM = 90000;
			break;
		}
	}

	receiveMessage(data) {
		switch(data.messageType) {
			case "draw":
				this.receiveAnswerDraw(data.uid, data.answer);
			break;
			
			case "suggestion":
				this.receiveAnswerSuggestion(data.uid, data.answer);
			break;
			
			case "answer":
				this.receiveAnswer(data.uid, data.answer);
			break;
		}
	}
	
	receiveAnswer(uid, answer){
		var player = this.findPlayer(uid);
		
		if (player.answered)
			return false;
			
		player.answered = true;
		player.answer = answer;
		this.answered++;
		
		console.log("answered");
		this.checkAnswered();
	}
	
	checkAnswered(override = false) {
		
		if (!override) {
			if (this.answered < (this.players.length - 1))
				return false;
		}
		
		this.roundStage++;
		this.resetRound();
		this.loadNext();
	}
	
	receiveAnswerSuggestion(uid, answer){
		var player = this.findPlayer(uid);
		
		if (player.answered)
			return false;
			
		player.answered = true;
		this.answered++;
		
		this.pictures[0].answers.push({answer: answer, uid: uid});
		
		this.parent.replacePage("paintWait", null, player.socket);
		
		this.checkSuggestAnswered();
	}
	
	checkSuggestAnswered(override = false) {
		
		if (!override) {
			if (this.answered < (this.players.length - 1))
				return false;
		}
		
		this.resetRound();
		this.loadNext();
	}

	receiveAnswerDraw(uid, answer) {
		var player = this.findPlayer(uid);
		
		if (player.answered)
			return false;

		player.answered = true;
		this.answered++;

		this.pictures.push({
			img : answer,
			pid : uid,
			word : player.word,
			answers: []
		});

		this.parent.replacePage("paintWait", null, player.socket);

		this.checkDrawAnswered();
	}

	checkDrawAnswered(override = false) {
		
		if (!override) {
			if (this.answered < this.players.length)
				return false;
		}

		this.totalRounds = this.answered;
		this.resetRound();
		this.round++;
		this.roundStage = 0;
		this.loadNext();
	}

	normalRound() {
		switch(this.roundStage) {
			case 0:
			console.log("showandask");
				this.showAndAsk();
				this.roundStage++;
			break;
			
			case 1:
			console.log("suggestion");
				this.suggestions();
			break;
			
			case 2:
			console.log("scores");
				this.scores();
			break;
		}
	}
	
	
	scores(){
		this.parent.replacePage("paintScores", {
		});
		
		this.timerM = 15000;
		this.round++;
		this.roundStage = 0;
		this.pictures.splice(0, 1);
	}
	
	suggestions(){
		
		var data = [];
		
		for(var j = 0; j < this.pictures[0].answers.length; j++){
			data.push({
				word: this.pictures[0].answers[j]
			});
			
			data.push({
				word: {answer: this.pictures[0].word, uid: "0"}
			});
		}
		
		console.log(data);
		
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].id == this.pictures[0].pid){
				this.parent.replacePage("paintSuggest", {
					owner: true
				}, this.players[i].socket);
			} else {
				this.parent.replacePage("paintSuggest", {
					data : data,
					owner: false
				}, this.players[i].socket);
			}
		}
		
		this.parent.replacePage("paintSuggest", {
			host : true
		}, this.parent.host.socket);
		
		this.timerM = 30000;
	}

	showAndAsk() {
		if (this.pictures.length < 1)
			this.end();

		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].id == this.pictures[0].pid){
				this.parent.replacePage("paintShow", {
					owner: true
				}, this.players[i].socket);
			} else {
				this.parent.replacePage("paintShow", {
					src : this.pictures[0].img,
					owner: false
				}, this.players[i].socket);
			}
		}
		
		this.parent.replacePage("paintDraw", {
			host : true
		}, this.parent.host.socket);
		
		this.timerM = 30000;
		
	}

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

	resetRound() {
		this.answered = 0;
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].answered = false;
			this.players[i].answer = null;
		}
	}
}
