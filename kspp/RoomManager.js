// RoomManager.js
   'use strict';

module.exports = class RoomManager{
	
	constructor(){
		this.activeRooms = [];
	}
	
	/*
	 * Find room with code - find room with room code
	 * @param {string} room code
	 * @return {GameRoom} room data
	 */
	findRoomWithCode(code){
		for(var i = 0; i < this.activeRooms.length; i++){
			if(this.activeRooms[i].code == code){
				return this.activeRooms[i];
			}
		}
		return false;
	}
	
	/*
	 * tick - on receive tick send to all active rooms
	 */
	tick(){
		for(var i = 0; i < this.activeRooms.length; i++){
			this.activeRooms[i].tick();
		}
	}
	
	/*
	 * Remove - remove room from server
	 * @param {string} room code
	 */
	remove(code){
		for(var i = 0; i < this.activeRooms.length; i++){
 			if(this.activeRooms[i].code == code){
 				this.activeRooms.splice(i,1);
 			}
 		}
 		
 		console.log("Room removed");
	}
}