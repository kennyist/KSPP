/**
 * KSPP - Player Manager
 * Copyright (C) 2017  Tristan Cunningham
 */

 module.exports = class PlayerManager{
 	
 	constructor(){
 		this.players = [];
 	}	
 	
 	/*
	 * add Player - Adds player to server
	 * @param {GamePlayer} PlayerData
	 */
 	addPlayer(player){
 		this.players.push(player);
 	}
 	
 	/*
	 * Get player room code - gets the room of a player by there UID
	 * @param {string} player ID
	 */
 	getPlayerRoomCode(id){
 		var player = this.existsUID(id);
 		console.log(player);
 		
 		return player.room;
 	}
 	
 	/*
	 * Exists UID - Checks if player exists
	 * @param {string} player ID
	 * @return {GamePlayer} player data
	 */
 	existsUID(id){
 		for(var i = 0; i < this.players.length; i++){
 			if(this.players[i].id == id){
 				console.log("id: " + id + " found");
 				return this.players[i];
 			}
 		}
 	}
 	
 	/*
	 * remove - remove player from the server
	 * @param {string} player ID
	 */
 	remove(player){
 		
 		for(var i = 0; i < this.players.length; i++){
 			if(this.players[i].id == player.id){
 				this.players.splice(i,1);
 			}
 		}
 	}
}