/**
 * @author Kennyist
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
		this._room.endGame(winners);
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
 	
}