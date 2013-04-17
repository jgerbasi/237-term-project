exports.init = function() {
  var io = require('socket.io').listen(8888);

  var playerList = {};

  var states = {
      LOGGED_IN: 0,
  }

  var currentState = states.LOGGED_IN;

  // setInterval(function() {

  // }, 30)

  io.sockets.on("connection", function(socket) {
      playerList[socket.id] = { isHere: true, playerData: undefined };
      socket.join('gameLobby');

      socket.on('sendPlayerToServer', function(data) {
          playerList[socket.id].playerData = data.player;
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
          console.log(playerList);
      });

      socket.on('getPlayerLocations', function(data) {
        io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
        console.log(playerList);
      });

      socket.on('sendPlayerLocationToServer', function(data) {
        playerList[socket.id].playerData.x = data.x;
        playerList[socket.id].playerData.y = data.y;
      });

      // socket.on('sendPlayerToServer', function(data) {
      //     players[data.player.name] = data.player;
      //     socket.emit('sendPlayerListToClient', {list: JSON.stringify(players)});
      //     console.log(players);
      // });

      // socket.on('updatePlayerList', function() {
      //     socket.emit('playerList', {list: JSON.stringify(players)});
      //     console.log(players);
      // });

      socket.on('disconnect', function() {
          console.log("socket id => " + socket.id);
          delete playerList[socket.id];
          socket.leave('gameLobby');
          // console.log(playerList);
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
      });

      // socket.on('getPlayerObj', function() {
      //     socket.emit('sendPlayerObj', {player: players[socket.id]});
      // });

      // socket.on('updatePlayerCoord', function(data) {
      //     players[socket.id] = data.player;
      //     console.log(players);
      // });
      // socket.on('object', function(data) {
      //     socket.broadcast.emit('objectMove', {x: data.x,
      //                                          y: data.y})
      // });
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