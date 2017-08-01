/**
 * KSPP - Game player
 * Copyright (C) 2017  Tristan Cunningham
 */

 module.exports = class GamePlayer{
	
	/**
	 * Construck GamePlayer
	 * @param {Socket} socket
	 */
	constructor(socket){
		this.name = "Default";
		this.socket = socket;
		this.room = "";
		this.score = 0;
		this.gameScore = 0;
		this.id = "";
		this.disconnected = false;
	}
	
	/**
	 * return player data as classless
	 * @return {object} player data
	 */
	classless(){
		return {
			name: this.name,
			socket: this.socket,
			score: this.score,
			gameScore: this.gameScore,
			id: this.id,
			room: this.room
		}
	}
	
	/**
	 * Bind player to room
	 * @param {string} room code
	 */
	joinRoom(room){
		this.room = room;
		this.socket.join(room);
	}
}