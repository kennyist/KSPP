/*!
 * KSPP
 * TRANSLATIONS CLASS
 * 
 * 	This class handles finding and loading in translation files
 * 
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */

'use strict';

module.exports = class Translations {
	
	constructor(config){
		this.directory = config.transaltionDir;
		this.translations = {};
		this.transInfo = [];
		this.Loadtranslations();
	}
	
	Loadtranslations(){
		console.log("\n========== Translation Loader ==========");
		
		var fs = require('fs');
		
		if (!fs.existsSync(this.directory)){
			console.log("\nERROR: Translations directory does not exist at '"+ this.directory +"', Translation loading failed");
			console.log("\n========== Translation Loader failed ========== \n");
			return false;
		}
		
		var filenames = fs.readdirSync(this.directory);
		var array = [];
		var count = Object.keys(filenames).length;
		var i = 1;
		var dir = this.directory;
		var loaded = 0;
		var insert = {};
		var dataInsert = [];
		
		filenames.forEach(function (name) {
			console.log("\nloading translation "+i+"/"+ count);
			
			if (fs.existsSync(dir + "/" + name)) {
				
				console.log("Found: " + name);
				
				var config = require("." + dir + "/" + name);
				
				if(config.translation.language){
					console.log("language: " + config.translation.language);
					
					if(config.translation.shortCode){
						console.log("Shortcode: " + config.translation.shortCode);
						
						if(config.translation.icon){
							console.log("Icon: " + config.translation.icon);
							
							if(config.strings){
								console.log("Strings found");
								insert[config.translation.shortCode] = config.strings;
								insert[config.translation.shortCode].icon = config.translation.icon;
								dataInsert.push(config.translation);								
								loaded++;
							} else {
								console.log("ERROR: No strings found");
							}
						} else {
							console.log("ERROR: Icon not set");
						}
						
					} else {
						console.log("ERROR: Shortcode not set");
					}
					
					
				} else {
					console.log("Language not set, skipping");
				}
			}
			
			i++;
		});
		
		this.translations = insert;
		this.transInfo = dataInsert;
		
		if(!this.isEmpty(this.translations)){
			console.log("\n========== " + Object.keys(this.translations).length + " Translations loaded succesfully ========== \n");
		} else {
			console.log("\n========== No Translations loaded succesfully ========== \n");
		}
	}
	
	isEmpty(obj) {
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }
	
	    return true;
	}
}