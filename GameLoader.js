// GameLoader.js
'use strict';

module.exports = class GameLoader {
	
	
	constructor(config){
		this.directory = config.games.directory;
		this.games = [];
	}
	
	
	LoadGames(){
		var fs = require('fs');
		var filenames = fs.readdirSync(this.directory);
		var array = [];
		var count = Object.keys(filenames).length;
		var i = 1;
		var dir = this.directory;
		
		
		filenames.forEach(function (name) {
			console.log("loading game "+i+"/"+ count);
			var insert = {};
			
		    if (name === "." || name === "..") {
		        return;
		    }
		    
		    if (fs.lstatSync(dir + "/" + name).isDirectory()) {
		        
		        if (fs.existsSync(dir + "/" + name + "/game.js")) {
				    insert.game = dir + "/" + name + "/game.js";
				    insert.dir = dir + "/" + name;
				    console.log('Game '+ name +' found in:' + insert.dir);
				    
				    if (fs.existsSync(dir + "/" + name + "/config.json")) {
					    var temp = require(dir + "/" + name + "/config.json");
					    insert.details = temp.details;
					    console.log('Config found, Game: '+ insert.details.name+' - Version: '+ insert.details.version +' - Author: '+ insert.details.author);
					    
					    if(insert.game != null){
					    	array.push(insert);
					    }
					}
					else
					{
						console.log("ERROR: config.json file not found, skipping folder");	
					}
				} 
				else
				{
					console.log("ERROR: game.js file not found in '"+ dir + "/" + name +"', skipping folder");	
				}
		    }
			
			i++;
		});
		
		this.packages = array;
	}	
}