/*!
 * KSPP
 * PLAYER MANAGER CLASS
 * 
 * 	This class handles all players connected and functions to find players by ID's, remove players from games and from the
 * 	system.
 * 
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */

 module.exports = class PlayerManager{
 	
 	constructor(){
 		this.players = [];
 	}	
 	
 	activePlayers(){
 		return this.players.length;
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
 				return this.players[i];
 			}
 		}
 	}
 	
 	existsSocketID(id){
 		for(var i = 0; i < this.players.length; i++){
 			if(this.players[i].socket.id == id){
 				return this.players[i];
 			}
 		}
 	}
 	
 	unlinkRoom(players){
 		for(var i = 0; i < players.length; i++){
 			this.existsUID(players[i].id).room = null;
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