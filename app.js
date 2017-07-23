

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var config = new require('./config.js'); 				// Import config file
var GameLoader = new require('./GameLoader.js');		// Import Game Loading class
var GameRoom = new require('./GameRoom.js');			// Import game room class
var RoomManager = new require('./RoomManager.js');		// Import room manager class
var PlayerManager = new require('./PlayerManager.js');	// Import player manager class
var GamePlayer = new require('./GamePlayer.js');		// Import Game player class

// Game Code
var gl = new GameLoader(config);
var rm = new RoomManager(); 
var pm = new PlayerManager();

//
var app = require('express')();							//  Import express
var http = require('http').Server(app);					// attach to http server
var io = require('socket.io')(http);					// Import socket IO

// Test if server starts and listens
http.listen(config.port, function() {
	console.log('listening on localhost:' + config.port);
}); 		

/**
 * Start game tick rate
 */
setInterval(function () {
	rm.tick();
}, config.tickRate);

/**
 * On socket IO connect
 */
io.on('connection', function(socket) {
	var player = null;

    socket.on('register', function (data) {					// Register game player (data = UID)
    	
    	console.log("register: " + data);
    	
        if (data !== null) {								// If data was not empty
            if (player = pm.existsUID(data)) {				// find playter by UID - if session exists
            	player.socket = socket;
            	player.joinRoom(player.room);
            	if(player.room){
            		rm.findRoomWithCode(player.room).updatePlayer(player);
            	}
                player.disconnected = false;
                console.log("Reconected: " + player.id);
            } else {										// new player if UID not exist
                player = new GamePlayer(socket);
                player.id = data;
                pm.addPlayer(player);
            }
        } else {											// create new player
            player = new GamePlayer(socket);
            player.id = data;
            pm.addPlayer(player);
        }
    });

    socket.on('disconnect', function () {
        player.disconnected = true;
        setTimeout(function () {							// Start timout, if no reconencted in this time, remove player from server
            if (player.disconnected){
            	
            	if(room = rm.findRoomWithCode(player.room)){		// if player was in room
	            	if(room.host == player.id){						// if player was host
	            		if(toom.host.id == player.id)
	            			rm.remove(player.room);					// remove room
	            	}
            	}
            	
            	pm.remove(player);									// remove player
            	console.log("player removed: "+player.id);
            }
        }, config.maxIdleTime);
    });
    
    // lobby
    
    socket.on('lobby-ready', function(data) {						// When lobby ready button pressed
    	console.log("Room ready " + data);
    	rm.findRoomWithCode(pm.getPlayerRoomCode(data)).startTimer();
	});
	
	socket.on('lobby-cancleReady', function(data) {					// when lobby cancle button is pressed
    	console.log("Room Cancled " + data);
    	rm.findRoomWithCode(pm.getPlayerRoomCode(data)).stopTimer();
	});
	
	socket.on('lobby-changeGame', function(data) {					// when lobby change game is pressed
    	console.log(data);
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
		rm.findRoomWithCode(pm.getPlayerRoomCode(data.uid)).sendGameMessage(data); // pass to room manager to pass to game
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
	var room = new GameRoom(randomString(config.roomCodeLength), io, app);
	player.name = name;
	player.room = room.code;
	player.joinRoom(room.code);												// set player socket room code to game room code
	room.addHost(player.classless());										// set player as host
	room.loadGames();
	
	rm.activeRooms.push(room);												// push room to active rooms
	
	app.render('gameRoom', { code: room.code, players: room.players, host: true, game: "Trivia" }, function(err, html){
		socket.emit("ReplacePage" , html);
	});																		// render room to host
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
		if(room.players.length > config.roomLimit){						// if room is full, return error
			socket.emit("Login-error", "Room is currently full");
			return false;
		}
		
		if(room.inGame){												// if room in game, return error
			socket.emit("Login-error", "Room is currently in game");
			return false;
		}
		
		player.name = name;
		player.room = code;
		player.joinRoom(room.code);
		room.addPlayer(player.classless());
		
		app.render('gameRoom', { code: room.code, players: room.players, host: false  }, function(err, html){
			socket.emit("ReplacePage" , html);
		});																// render room to player
	} else {															// if room doesnt exist, return error
		socket.emit("Login-error", "Sorry, This room cannot be found");
		return false;
	}
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
		//console.log(path.join(__dirname, config.games.directory + '/' + data.folderName + '/public'));
		app.use(express.static(path.join(__dirname, config.games.directory + '/' + data.folderName + '/public')));
	}
});

app.use('/', index);

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
