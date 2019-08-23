// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('../lib')(server);
var port = process.env.PORT || 3000;
var Game = require('./game');
var game = new Game();

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;
var users = [];

io.on('connection', (socket) => {
  var addedUser = false;

  //Start game when play button is clicked

  socket.on('playButtonClicked', function() {
    game.startGame();
    io.emit("game message", {
      message: "Game Started"
    });

    setTimeout(() => {
      io.emit("game command", {
        command: "showWeapons"
      });

      io.emit("game message", {
        message: "Choose your weapon"
      });
    }, 200);
  });

  //Assigning selected weapon to corresponding active user
  socket.on('weaponSelected', (selectedWeapon, username) => {

    for (var i = 0; i < users.length; i++){
      if(username === users[i].username){
        users[i].selectedWeapon = selectedWeapon;
      }
      // console.log(users[i].username, users[i].selectedWeapon);
    };
    
    var endGame = true;
    for (var i = 0; i < users.length; i++){
      if(users[i].selectedWeapon === ""){
        endGame = false;
      }
    }

    if (endGame){
      determineWinner();
    }

  }); 

  // Function to determine the winner
  function determineWinner(){
    console.log("Avengers Assemble!!!!!!!!!!");
    for (var i = 0; i < users.length; i++){
      
    };
  };

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    // if(data === "start") {
    //   console.log("start typed");
    //   game.startGame();
    //   io.emit("game message", {
    //     message: "Game Started"
    //   });

    //   setTimeout(() => {
    //     io.emit("game command", {
    //       command: "showWeapons"
    //     });

    //     io.emit("game message", {
    //       message: "Choose your weapon"
    //     });
    //   }, 2500);
    // }
   
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;
    var user = {"username":username, "selectedWeapon":""};
    users.push(user);
    // we store the username in the socket session for this client
    socket.username = user.username;
    // ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: users.length,
      users:users
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: users.length,
      users:users
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    for(var i = users.length - 1; i >= 0; i--) {
      if(users[i].username === socket.username) {
        users.splice(i, 1);
      }
    }
// console.log(users,socket.username);
    if (addedUser) {
      // --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: users.length,
        users:users
      });
    }
  });
});
