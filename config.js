var config = {};
config.games = {};
config.footer = {};

/* ---------- EDIT BELOW ---------- */

config.port = 8000; 						// Server port
config.name = "KS: party pack";				// Website name
config.roomCodeLength = 4;					// Length of room join code
config.roomPlayerLimit = 8;					// Max people in a room
config.roomLimit = 100;						// Max Rooms allowed 
config.tickRate = 33;						// Game refresh rate
config.transaltionDir = "./translations";  	// Translations folder

// Analytics
config.googleAnalytics = "";	// Google analytics tracking code

// Games
config.games.directory = "./Games"; 		// Local Games Directory;
config.games.filter = ['_template']; 		// Names (Directory Name, case sensitive) of games to filter out


// Footer
config.footer.survey = false;				// Enable alpha warning and survey link
config.footer.links = [						// Footer Links, max 4-5 before css problems
	{
		icon: "fa-github",							// Font awsome icon
		link: "https://github.com/kennyist/KSPP"	// Icon click link
	},
	{
		icon: "fa-twitter",
		link: "https://twitter.com/Kennyist_Studio"
	},
	{
		icon: "fa-facebook",
		link: "https://www.facebook.com/OfficialKSPP/"
	}
];

/* ---------- EDIT ABOVE ---------- */

module.exports = config;