// GameLoader.js
'use strict';

module.exports = class GameLoader {
	
	
	constructor(config){
		this.directory = config.games.directory;
		this.packages = [];
		this.LoadGames();
	}
	
	
	LoadGames(){
		console.log("\n========== Game Loader ==========");
		
		var fs = require('fs');
		
		if (!fs.existsSync(this.directory)){
			console.log("\nERROR: Game Directory does not exist at '"+ this.directory +"', Game loading failed");
			console.log("\n========== Game Loader failed ========== \n");
			return false;
		}
		
		var filenames = fs.readdirSync(this.directory);
		var array = [];
		var count = Object.keys(filenames).length;
		var i = 1;
		var dir = this.directory;
		
		filenames.forEach(function (name) {
			console.log("\nloading game "+i+"/"+ count);
			var insert = {};
			
		    if (name === "." || name === "..") {
		        return;
		    }
		    
		    if (fs.lstatSync(dir + "/" + name).isDirectory()) {
		        
		        if (fs.existsSync(dir + "/" + name + "/game.js")) {
				    insert.game = dir + "/" + name + "/game.js";
				    insert.dir = dir + "/" + name;
				    insert.folderName = name;
				    console.log('Game '+ name +' found in:' + insert.dir);
				    
				    if (fs.existsSync(dir + "/" + name + "/config.json")) {
					    var temp = require(dir + "/" + name + "/config.json");
					    insert.details = temp.details;
					    console.log('Config found, Game: '+ insert.details.name+' - Version: '+ insert.details.version +' - Author: '+ insert.details.author);
					    
					    if(fs.existsSync(dir + "/" + name + "/public")){
					    	insert.hasPublic = true;
					    	console.log('Public folder found');
					    }
					    else 
					    {
					    	insert.hasPublic = false;
					    }
					    
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
		
		console.log("\n========== " + this.packages.length + " Games loaded succesfully ========== \n");
		
		return true;
	}	
	
	GetViewLocationArray(basePath){
		var path = require('path');
		var array = [];
		
		for(var i=0,j=this.packages.length; i<j; i++){
		  array.push(path.join(basePath, this.packages[i].dir + "\\views"));
		};
		
		return array;
	}
}