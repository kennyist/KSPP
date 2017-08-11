/*!
 * KSPP
 * ROOM MANAGER CLASS
 * 
 * 	This class handles game all the rooms created and provides functions to find rooms and remove rooms from the system.
 * 
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */

module.exports = class RoomManager{
	
	constructor(playerManager){
		this.activeRooms = [];
		this.pm = playerManager;
	}
	
	activeRoomsCount(){
		return this.activeRooms.length;
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
 				this.activeRooms[i].killRoom(this.pm);
 				this.activeRooms.splice(i,1);
 			}
 		}
	}
}