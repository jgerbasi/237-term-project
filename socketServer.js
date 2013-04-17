function checkReady(playerList) {
  count = 0;
  for (p in playerList) {
    player = playerList[p];
    for (d in player) {
      data = player[d];
      if (data.ready !== undefined) {
        if (data.ready === true) count++;
      }
    }
  }
  console.log(count === 3);
  return count === 3;
}

exports.init = function() {
  var io = require('socket.io').listen(8888);

  var playerList = {};
  var lobbies = [];

  var states = {
      LOGGED_IN: 0,
      IN_LOBBY: 1,
      IN_GAME: 2,
  }

  function loop() {
    io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
  }

  function startGameLoop() {
    setInterval(loop, 30);
  }

  var currentState = states.LOGGED_IN;

  io.sockets.on("connection", function(socket) {
      playerList[socket.id] = { isHere: true, playerData: undefined };
      socket.join('gameLobby');

      socket.on('sendPlayerToServer', function(data) {
          playerList[socket.id].playerData = data.player;
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
      });

      // socket.on('getPlayerLocations', function(data) {
      //   io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
      // });

      socket.on('readyToPlay', function() {
        console.log("GOT HERE");
        playerList[socket.id].playerData.ready = true;
        if (checkReady(playerList)) {
          console.log("SHOULD NOT GET HERE");
          startGameLoop();
        }
      });

      socket.on('sendPlayerLocationToServer', function(data) {
        playerList[socket.id].playerData.x = data.x;
        playerList[socket.id].playerData.y = data.y;
      });
        
      socket.on('disconnect', function() {
          console.log("socket id => " + socket.id);
          delete playerList[socket.id];
          socket.leave('gameLobby');
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
      });

    socket.on('msg', function(data) {
      // confirm success to sender
      socket.emit('status', { success: 'true'});
      // broadcast message to everyone else
      socket.broadcast.emit('newmsg', { 
                                        sender: data.sender, 
                                        body: data.body });
      socket.emit('newmsg', { sender: data.sender,
                              body: data.body });
    });
  });
};