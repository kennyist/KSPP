/**
 * KSPP - game API: Public api for custom games
 * Copyright (C) 2017  Tristan Cunningham
 */

 module.exports = class GamePlayer{
 	
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
	
	sendMessageToClient(type, data){
		this._room.sendMessageToClient(type, data);
	}
	
	sortFunction(a, b, index){
		return this._room.sortFunction(a, b, index);
	}
	
	getSocket(){
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
			
		}
		else 
		{
			sendMessageToClient("music-play", data);	
		}
		
	}
	
	pausePlayMusic(pause = true){
		var data = { pause: pause };
		
		sendMessageToClient("music-pausePlay", data);
	}
	
	stopMusic(){
		sendMessageToClient("music-stop");	
	}
	
	playSoundEffect(soundClip, id){
		
		var data = {
			id: id,
			clip: soundClip
		};
		
		sendMessageToClient("soundEfct-play", data);	
	}
	
	/*
	 * If null stops all sound effects
	 */
	stopSoundEffect(id){
		
		var data = {
			id: id
		};
		
		sendMessageToClient("soundEfct-stop", data);	
	}
	
 	
}