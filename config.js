var config = {};

config.port = 8000; 		// Server port
config.roomCodeLength = 4;	// Length of room join code
config.roomPlayerLimit = 8;	// Max people in a room
config.roomLimit = 10;		// Max Rooms allowed 
config.maxIdleTime = 1000;	// Time before session delete
config.tickRate = 33;	// Game refresh rate

config.games = {}; 
config.games.directory = "./Games"; // Local Games Directory;
config.games.filter = []; 			// Names (Directory Name) of games to filter out


module.exports = config;