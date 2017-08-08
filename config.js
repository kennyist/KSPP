var config = {};
config.games = {};
config.footer = {};
// Do not edit above

config.port = 8000; 		// Server port
config.roomCodeLength = 4;	// Length of room join code
config.roomPlayerLimit = 8;	// Max people in a room
config.roomLimit = 10;		// Max Rooms allowed 
config.maxIdleTime = 1000;	// Time before session delete
config.tickRate = 33;	// Game refresh rate

// Games
config.games.directory = "./Games"; // Local Games Directory;
config.games.filter = ['']; 		// Names (Directory Name, case sensitive) of games to filter out


// Footer
config.footer.survey = true;
config.footer.links = [
	{
		icon: "fa-github",
		link: "http://www.github.com/kspp"
	},
	{
		icon: "fa-twitter",
		link: ""
	},
	{
		icon: "fa-facebook",
		link: ""
	}
];


module.exports = config;