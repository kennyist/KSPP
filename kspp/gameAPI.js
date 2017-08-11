/*!
 * KSPP
 * GAME API
 * 
 * 	This class handles public functions between game room and and Game packages
 * 
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */


 module.exports = class GameAPI{
 	
 	constructor(room){
		this._room = room;
	}
	
	replacePage(page, data, socket){
		if(socket != null)
		{
			this._room.replacePage(page, data, socket);
		} 
		else 
		{
			this._room.replacePage(page, data);
		}
	}
	
	endGame(winners){
		console.log("Game ended");
		
		this._room.endGame(winners);
		
		this.sendMessageToClient("end-game");
	}
	
	sendMessageToClient(type, data, socket = null){
		
		if(socket){
			this._room.sendMessageToClient(type, data, socket);
		} else {
			this._room.sendMessageToClient(type, data);
		}
	}
	
	sortFunction(a, b, index){
		return this._room.sortFunction(a, b, index);
	}
	
	getHostSocket(){
		return this._room.host.socket;
	}
	
	getPlayerInfo(){
		return this._room.GetPlayerInfo();
	}
	
	playMusic(hostOnly = True, musicClip, repeate = true){
		
		var data = {
			clip: musicClip,
			repeate: repeate
		}
		
		if(hostOnly){
			this.sendMessageToClient("music-play", data, this.getSocket());
		}
		else 
		{
			this.sendMessageToClient("music-play", data);	
		}
		
	}
	
	pausePlayMusic(pause = true){
		var data = { pause: pause };
		
		this.sendMessageToClient("music-pausePlay", data);
	}
	
	stopMusic(){
		this.sendMessageToClient("music-stop");	
	}
	
	playSoundEffect(hostonly = false, soundClip, id){
		
		var data = {
			id: id,
			clip: soundClip
		};
		
		if(hostonly){
			this.sendMessageToClient("soundEfct-play", data, this.getSocket());
		} else {
			this.sendMessageToClient("soundEfct-play", data);	
		}
	}
	
	/*
	 * If null stops all sound effects
	 */
	stopSoundEffect(id){
		
		var data = {
			id: id
		};
		
		this.sendMessageToClient("soundEfct-stop", data);	
	}
	
 	
}