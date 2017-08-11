/*!
 * KSPP
 * Drawing Game
 * 
 * 	This is a game that runs on KSPP API and uses canvas elemts to allow users to draw images and others to guess what it is
 * 
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */

'use strict';

module.exports = class GamePaint {

	constructor(parent, players, dir, config) {
		this.config = config;
		this.parent = parent;
		this.players = players;
		this.data = require('./GamePaintData.json');
		
		this.round = 0;
		this.roundStage = 0;
		this.pictures = [];
		this.answers = [];
		this.timer = -10000;
		this.timerM = -10000;
		this.answered = 0;
		this.usedWords = [];
	}

	start() {
		this.parent.replacePage("paintStart");
		this.timer = 5000;
		this.timerM = 5000;
	}

	end() {
		this.parent.endGame([]);
	}

	tick() {
		this.timer -= this.config.tickRate;
		
		this.parent.sendMessageToClient("game-timerbar", {
				width : (this.timer / this.timerM) * 100,
				text : "Time left: " + Math.round(this.timer / 1000)
		});
		
		if(this.timer <= 0 && this.timer > -10000){
			this.loadNext();
		}
	}  
	
	loadNext() {
		this.timer = -10001;
		
		switch(this.round){
			case 0:
				this.getDrawings();
			break;
			
			case 1:
				switch(this.roundStage){
					case 0:
						this.showAndAsk();
					break;
					
					case 1:
						this.suggestions();
					break;
					
					case 2:
						this.showAnswer();
					break;
				}
			break;
			
			case 5:
				this.end();
			break;
		}
	}
	
	// ROUND ZERO
	
	getWord() {
		console.log(this.data.words.length - 1);
		var i = this.getRandomInt(0, (this.data.words.length - 1));
		var word = this.data.words[i];

		/*for (var i = 0; i < this.usedWords.length; i++) {
			if (word === this.usedWords[i]) {
				word = this.getWord();
			}
		}*/

		this.usedWords.push(word);

		return word;
	}
	
	getDrawings(){
		console.log("Get drawings");
		
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].word = this.getWord();
				this.parent.replacePage("paintDraw", {
				word : this.players[i].word
			}, this.players[i].socket);
		}
		
		this.parent.replacePage("paintDraw", {
			host : true
		}, this.parent.getHostSocket());
		
		this.timer = 90000;
		this.timerM = 90000;
	}
	
	receiveAnswerDraw(uid, answer){
		var player = this.findPlayer(uid);
		
		if (player.answered)
			return false;
			
		player.answered = true;
		player.right = false;
		this.answered++;
		
		this.pictures.push({
			img : answer,
			pid : uid,
			word : player.word,
			answers: []
		});

		this.parent.replacePage("paintWait", null, player.socket);
		
		console.log(this.players.length + ":" + this.answered);
		
		if(this.checkAnswered()){
			this.round++;
			this.loadNext();
		}
	}
	
	// END ROUND
	
	showEnd(){
		this.parent.replacePage("paintEnd", {
			host : false
		});
		
		this.parent.replacePage("paintEnd", {
			host : true,
			players: this.players.sort(this.sortFunction, "gameScore")
		}, this.parent.getHostSocket());
		
		this.timer = 10000;
		this.timerM = 10000;
		
		this.round = 5;
	}
	
	sortFunction(a, b, index) {
	    if (a[index] === b[index]) {
	        return 0;
	    }
	    else {
	        return (a[index] < b[index]) ? -1 : 1;
	    }
	}
	
	// ROUND ONE
	
	showAndAsk(){
		console.log("show and ask");
		console.log(this.pictures.length);
		if (this.pictures.length <= 0){
			console.log('end');
			this.end();
			return false;
		}

		for (var i = 0; i < this.players.length; i++) {
			console.log("owner's");
			if(this.players[i].id == this.pictures[0].pid){
				this.parent.replacePage("paintShow", {
					owner: true
				}, this.players[i].socket);
			} else {
				console.log("get suggestion");
				this.parent.replacePage("paintShow", {
					src : this.pictures[0].img,
					owner: false
				}, this.players[i].socket);
			}
		}
		
		this.parent.replacePage("paintShow", {
			host : true,
			src: this.pictures[0].img
		}, this.parent.getHostSocket());
		
		this.timer = 30000;
		this.timerM = 30000;
		this.roundStage++;
	}
	
	receiveAnswer(uid, answer){
		var player = this.findPlayer(uid);
		
		if (player.answered)
			return false;
			
		player.answered = true;
		this.answered++;
		
		if(answer == this.pictures[0].word){
			player.right = true;
		} else {	
			this.answers.push({
				answer: answer,
				id: uid,
				chosen: []
			});
		}
		
		if(this.checkAnswered(1)){
			this.loadNext();
		}
	}
	
	suggestions(){
		console.log("suggestions");
		var data = {};
		data.answers = [];
		
		for(var i = 0; i < this.answers.length; i++){
			data.answers.push(this.answers[i].answer);
		}
		
		data.answers.push(this.pictures[0].word);
		
		
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].id == this.pictures[0].pid){
				this.parent.replacePage("paintSuggest", {
					owner: true,
					src : this.pictures[0].img
				}, this.players[i].socket);
			} else {
				this.parent.replacePage("paintSuggest", {
					data : data,
					owner: false,
					src : this.pictures[0].img
				}, this.players[i].socket);
			}
		}
		
		this.parent.replacePage("paintSuggest", {
			host : true,
			data : data,
			src : this.pictures[0].img
		}, this.parent.getHostSocket());
		
		this.timer = 30000;
		this.timerM = 30000;
		this.roundStage++;
	}
	
	receiveAnswerSuggestion(uid, answer){
		
		var player = this.findPlayer(uid);
		
		if (player.answered)
			return false;
		
		console.log("Answer: " + answer);
		
		if(answer > this.answers.length - 1){
			this.findPlayer(uid).right = true;
		} else {		
			this.answers[answer].chosen.push(uid);
		}
		
		player.answered = true;
		this.answered++;
		
		if(this.checkAnswered(1)){
			this.loadNext();
		}
	}
	
	showAnswer(){
		console.log("Show answers");
		var data = [];
		
		data.push({
			title: "Real answer: ",
			answer: this.pictures[0].word,
			score: "+1000",
			names: []
		});
		
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].right){
				this.players[i].right = false;
				
				data[0].names.push(this.players[i].name);
				
				this.players[i].gameScore += 1000;
			}
		}
		
		for(var i = 0; i < this.answers.length; i++){
			
			var chosen = 0;
			var names = [];
			
			for(var j = 0; j < this.answers[i].chosen.length; j++){
				
				console.log(this.answers[i].chosen);
				
				if(this.findPlayer(this.answers[i].id).name === this.findPlayer(this.answers[i].chosen[j]).name){
					
				} else {
					chosen++;
					names.push(this.findPlayer(this.answers[i].chosen[j]).name);
				}
			}
			
			data.push({
				title: this.findPlayer(this.answers[i].id).name + "'s answer: ",
				answer: this.answers[i].answer,
				score: "+" + (250 * chosen),
				names: names
			});
			
			this.findPlayer(this.answers[i].id).score += 250 * chosen;
			
		}
		
		this.parent.replacePage("paintScores", {
			host : false,
			data: data
		});
		
		this.parent.replacePage("paintScores", {
			host : true,
			data: data
		}, this.parent.getHostSocket());
		
		this.pictures.splice(0,1);
		this.answers = [];
		
		this.roundStage = 0;
		this.timer = 10000;
		this.timerM = 10000;
	}
	
	//
	
	checkAnswered(minus = 0) {
		
		if (this.answered < (this.players.length - minus)){
			console.log("false");
			return false;
		}
		
		this.answered = 0;
		
		for(var i = 0; i < this.players.length; i++){
			this.players[i].answered = false;
		}
		
		console.log("true");
		this.timer = -10001;
		return true;
	}

	receiveMessage(data) {
		switch(data.messageType) {
			case "draw":
				this.receiveAnswerDraw(data.uid, data.answer);
			break;
			
			case "answer":
				this.receiveAnswerSuggestion(data.uid, data.answer);
			break;
			
			case "suggestion":
				this.receiveAnswer(data.uid, data.answer);
			break;
		}
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

	resetRound() {
		this.answered = 0;
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].answered = false;
			this.players[i].answer = null;
		}
	}
}
