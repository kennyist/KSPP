/*!
 * KSPP
 * Copyright(c) 2017 Tristan James Cunningham
 * MIT Licensed
 */

// Importing
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Routes
var index = require('./routes/index');

// Game importing
var config = new require('./config.js'); 				// Import config file
var GameLoader = new require('./GameLoader.js');		// Import Game Loading class
var TranslationLoader = new require('./kspp/translation.js');	// Import translation Loading class
var GameRoom = new require('./GameRoom.js');			// Import game room class
var RoomManager = new require('./kspp/RoomManager.js');		// Import room manager class
var PlayerManager = new require('./kspp/PlayerManager.js');	// Import player manager class
var GamePlayer = new require('./kspp/GamePlayer.js');		// Import Game player class
var api = new require('./kspp/gameAPI');

// Game Code
var gl = new GameLoader(config);
var tl = new TranslationLoader(config);
var pm = new PlayerManager();
var rm = new RoomManager(pm);


setInterval(function () {								// Start the tick rate for games
	rm.tick();
}, config.tickRate);

// Initialise server
var app = require('express')();							// Import express
var http = require('http').Server(app);					// attach to http server
var io = require('socket.io')(http);					// Import socket IO

// Test if server starts and listens
http.listen(config.port, function() {
	console.log('listening on localhost:' + config.port);
}); 		


/**
 * On socket IO connect
 */
io.on('connection', function(socket) {
	var player = null;

    socket.on('register', function (data) {					// Register game player (data = UID)
    	
    	console.log(data);
    	
        if (data !== null) {								// If data was not empty        	
        	
            if (player = pm.existsUID(data.id)) {				// find player by UID - if session exists
            	
            	if( typeof player.room !== 'undefined' && player.room){
			        if(room = rm.findRoomWithCode(player.room)){		// if player was in room
				        if(room.host.id == player.id){						// if player was host
				    		rm.remove(player.room);					// remove room
				    	} else {
				    		room.removePlayer(player);
				    	}
			        }
		        }
	        
	        	pm.remove(player);               
            }										// new player if UID not exist
            
            player = new GamePlayer(socket);
            player.id = data.id;
            player.lang = data.lang;
            pm.addPlayer(player);
            
        } else {											// create new player
            player = new GamePlayer(socket);
            player.id = data.id;
            player.lang = data.lang;
            pm.addPlayer(player);
        }
        
        var i = rm.activeRoomsCount();
        var j = pm.activePlayers();
        io.sockets.emit("Count-players", j);
        io.sockets.emit("Count-rooms", i);
    });

    socket.on('disconnect', function (data) {
    	console.log("Disconnect: " + data + " ID: " + socket.id);
    	
    	if(typeof socket.id !== 'undefined'){
    		if (player = pm.existsSocketID(socket.id)) {
    			
    		} else {
    			return false;
    		}
    	} else {
    		return false;
    	}
    	
    	if(data == "ping timeout")
    		return false;
    	 
        if(typeof player == 'undefined')
       		return false;
        
        if( typeof player.room !== 'undefined' && player.room){
	        if(room = rm.findRoomWithCode(player.room)){		// if player was in room
		        if(room.host.id == player.id){						// if player was host
		    		rm.remove(player.room);					// remove room
		    	} else {
		    		room.removePlayer(player);
		    	}
	        }
        }
        
        pm.remove(player);
        
        var i = rm.activeRoomsCount();
        var j = pm.activePlayers();
        io.sockets.emit("Count-players", j);
        io.sockets.emit("Count-rooms", i);
    });
    
    socket.on('leaveroom', function (data) {
		
		if (player = pm.existsUID(data)) {
			if(room = rm.findRoomWithCode(player.room)){		// if player was in room
		        if(room.host.id == player.id){						// if player was host
		    		rm.remove(player.room);					// remove room
		    	} else {
		    		room.removePlayer(player);
		    	}
	        }
		}
		
		app.render('index', {config: config}, function(err, html){
			socket.emit("ReplacePage" , html);
		});	
		
		var i = rm.activeRoomsCount();
        var j = pm.activePlayers();
        io.sockets.emit("Count-players", j);
        io.sockets.emit("Count-rooms", i);
    });
    
    // lobby
    
    socket.on('lobby-ready', function(data) {						// When lobby ready button pressed
    	rm.findRoomWithCode(pm.getPlayerRoomCode(data)).startTimer();
	});
	
	socket.on('lobby-cancleReady', function(data) {					// when lobby cancle button is pressed
    	rm.findRoomWithCode(pm.getPlayerRoomCode(data)).stopTimer();
	});
	
	socket.on('lobby-changeGame', function(data) {					// when lobby change game is pressed
    	rm.findRoomWithCode(pm.getPlayerRoomCode(data.uid)).changeGame(data);
	});
    
    // Index

	socket.on('create', function(text) {							// when create room button is pressed
		createRoom(player, socket, text);
	});
	
	socket.on('join', function(data) {										// on attempt to join room
		if(data.name == "" || data.code == ""){								// check name and code is not empty
			socket.emit("Login-error", "Name or Code cannot be empty");		// Send join error to player
			return false;													// stop
		} 
		
		joinRoom(player, socket, data.name, data.code);						// join room
	});
	
	socket.on('game-answer', function(data){								// on player answer game question
		if(rm.findRoomWithCode(pm.getPlayerRoomCode(data.uid))){
			rm.findRoomWithCode(pm.getPlayerRoomCode(data.uid)).sendGameMessage(data); // pass to room manager to pass to game
		}
	});
	
	// Debug
});

/**
 * Create new room
 * @param {GamePlayer} player
 * @param {Socket} socket
 * @param {string} name
 */
function createRoom(player, socket, name){									
	var room = new GameRoom(randomString(config.roomCodeLength), io, app, gl, api, config, tl);
	player.name = name;
	player.room = room.code;
	player.joinRoom(room.code);												// set player socket room code to game room code
	room.addHost(player.classless());										// set player as host
	
	rm.activeRooms.push(room);												// push room to active rooms
	
	app.render('gameRoom', { 
		code: room.code, 
		players: room.players, 
		host: true, 
		games: gl.packages, 
		config: config, 
		selGame: 0,
		strings: tl.translations[player.lang],
  		translations: tl.transInfo,
  		lang: player.lang
	}, function(err, html){
		socket.emit("ReplacePage" , html);
	});																	// render room to host
	
	var i = rm.activeRoomsCount();
    io.sockets.emit("Count-rooms", i);
    var j = pm.activePlayers();
    io.sockets.emit("Count-players", j);
}

/**
 * join player to room
 * @param {GamePlayer} player
 * @param {Socket} socket
 * @param {string} name
 */
function joinRoom(player, socket, name, code){				
	var room;
	code = code.toUpperCase();
	
	if(room = rm.findRoomWithCode(code)){								// does room exist?
		if(room.players.length > config.roomPlayerLimit){						// if room is full, return error
			socket.emit("Login-error", "Room is currently full");
			return false;
		}
		
		if(room.inGame){												// if room in game, return error
			socket.emit("Login-error", "Room is currently in game");
			return false;
		}
		
		player.name = name;
		
		if(room.doesNameExist(player.name)){
			socket.emit("Login-error", "Name is currently being used in this room");
			player.name = null;
			return false;
		}
		
		player.room = code;
		player.joinRoom(room.code);
		room.addPlayer(player.classless());
		
		app.render('gameRoom', { 
			code: room.code, 
			players: room.players, 
			host: false, 
			games: gl.packages, 
			config: config, 
			selGame: 0 ,
			strings: tl.translations[player.lang],
  			translations: tl.transInfo,
  			lang: player.lang
		}, function(err, html){
			socket.emit("ReplacePage" , html);
		});		
		
		room.updateRoom();														// render room to player
	} else {															// if room doesnt exist, return error
		socket.emit("Login-error", "Sorry, This room cannot be found");
		return false;
	}
	
	var i = rm.activeRoomsCount();
    var j = pm.activePlayers();
    io.sockets.emit("Count-players", j);
    io.sockets.emit("Count-rooms", i);
}

/**
 * Get Random string of characters
 * @param {Number} length
 * @return {string} random String
 */
function randomString(length) {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// -

// view engine setup
paths = [path.join(__dirname, 'views')];
paths.push.apply(paths, gl.GetViewLocationArray(__dirname));
app.set('views', paths);
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

gl.packages.forEach(function(data){
	if(data.hasPublic){
		app.use(express.static(path.join(__dirname, config.games.directory + '/' + data.folderName + '/public')));
	}
});

app.set("tl", tl);

app.use('/', index, function(req, res){
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;