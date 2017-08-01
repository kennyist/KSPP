# KSPP
Party Pack Game Service

# API:  
  
## File Structer  
  
Game folders are placed in 'root/Games' by default (can be changed in config.js), the game folder layout is:
  
* gameRoot  - any name
  * /public  - All public files such as images and css
  * /views  -  Jade view files
  * config.json - Game config file, needed for author and game details
  * game.js  -  This is the start point when a game is ran

## config.json

This json file contains details section this app uses.

	{
		"details": {
			"author": "",
		    "name": "",
		    "version": 0,
		    "headerimg": "./",
		    "summary": "",
		    "minPlayers": 2,
		    "maxPlayers": 8
		}
	}


## game.js

The app automatically looks for a file named 'games.js', The app will skip the folder if no games.js exists.

Functions:
* start(){}  The start point of the game  
* tick(){}   Called every app Tick (33ms by default)

* replacePage(page, data, socket);	Replaces the current view for the client. 
	* page 	The jade template (stored in the view folder)
	* data 	All data to pass to the template
	* socket if used, only the sockets client will receive the new page
	
* endGame(winners) Ends the game from the lobby level, giving points to the winners
	* winners Array of winner IDs
	
* sendMessageToClient(type, data)	Send a scoket.IO message to all clients in the game
	* Type	String name of data type
	* data	Data to be sent along with message
	
* sortFunction(a, b, index)	

* getSocket() returns hosts socket

* getPlayerInfo() returns player info for all clients

* PlayMusic() Plays music on the game
	* HostOnly True/False play on the hosts screen only
	* musicClip The music clip (Audio variable)
	* repeate True/False repeate the music
	
* pausePlayMusic()
	* puase True: pause the music. False: play the music
	
* stopMusic()	stops music from playing

* playSoundEffect() Play a sound effect in game, can have multple effects going and stored via ID system
	* soundClip The sound effect file in audio format
	* id string ID for this clip 

* stopSoundEffect() stops a sound effect by ID 
	* id if null stops all sound effects or string id of the effect to stop
