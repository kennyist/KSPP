var config = {};

config.port = 8000; 		// Server port
config.roomCodeLength = 4;	// Length of room join code
config.roomLimit = 8;		// Max people in a room
config.maxIdleTime = 1000;	// Time before session delete
config.tickRate = 33.33;	// Game refresh rate

config.games = {}; 
config.games.directory = "./Games"; // Local Games Directory;


module.exports = config;