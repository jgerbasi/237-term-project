exports.init = function() {
  var io = require('socket.io').listen(8888);

  // onlinePlayers = [];

  var playerList = {};

  var states = {
      START: 0,
      KILLED: 1,
      LOGGED_IN: 2,
  }

  var currentState = states.START;

  // setInterval(function() {

  // }, 30)

  io.sockets.on("connection", function(socket) {
      playerList[socket.id] = { isHere: true, playerData: undefined };

      socket.on('sendPlayerToServer', function(data) {
          playerList[socket.id].playerData = data.player;
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
          console.log(playerList);
      })

      // socket.on('sendPlayerToServer', function(data) {
      //     players[data.player.name] = data.player;
      //     socket.emit('sendPlayerListToClient', {list: JSON.stringify(players)});
      //     console.log(players);
      // });

      // socket.on('updatePlayerList', function() {
      //     socket.emit('playerList', {list: JSON.stringify(players)});
      //     console.log(players);
      // });

      socket.on('disconnect', function(socket) {
          console.log("socket id => " + playerList[socket.id]);
          delete playerList[socket.id];
          console.log(playerList);
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
      socket.broadcast.emit('newmsg', { body: data.body });
      socket.emit('newmsg', { body: data.body });
    });
  });
};