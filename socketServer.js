exports.init = function() {
  var io = require('socket.io').listen(8888);
  var SERVER_ENEMY = require('./serverEnemy');
  var SERVER_BULLET = require('./serverBullet');
  io.set('log level', 1);

  var playerList = {};
  var lobbies = [];

  var STATES = {
      IN_LOBBY: 0,
      READY_CHECK: 1,
      IN_GAME: 2,
      ROUND_WAIT: 3,
      IN_ROUND: 4,
      ROUND_END: 5,
      GAME_OVER: 6,
  }

  function checkReady(lobby) {
    count = 0;
    for (p in lobby.playerList) {
      player = lobby.playerList[p];
      if (player !== undefined && player.ready !== undefined) {
        if (player.ready === true) {
          count++;
        }
      }   
    }
    return count === 1;
  }

  function resetGame(lobby) {
    lobby.enemyList = [];
    lobby.round = 0;
    lobby.enemyCount = 0;
    for (p in lobby.playerList) {
      player = lobby.playerList[p];
      if (player !== undefined && player.ready !== undefined) {
        player.ready = false;
      }
    }
  }

  function endGame(lobby) {
    lobby.state = STATES.GAME_OVER;
    io.sockets.in(lobby.name).emit('sendGameOverToClient');
    resetGame(lobby);
    setTimeout(function() {
      io.sockets.in(lobby.name).emit('sendReturnToLobbyToClient');
    }, 5000);
  }

  function checkGameOver(lobby) {
    for (p in lobby.playerList) {
      player = lobby.playerList[p];
      if (player !== undefined && player.alive !== undefined) {
        if (player.alive === true) return false;
      }
    }
    endGame(lobby);
    return true;
  }

  function checkRoundOver(lobby) {
    if (lobby.enemyCount === 0 && lobby.enemyList.length === 0) {
      // send last enemy update
      io.sockets.in(lobby.name).emit('sendEnemyLocationsToClient', {enemyList: JSON.stringify(lobby.enemyList)});
      lobby.state = STATES.ROUND_END;
      io.sockets.in(lobby.name).emit('sendRoundWaitToClient');
      setTimeout(function() {
        startRound(lobby);
        io.sockets.in(lobby.name).emit('sendStartRoundToClient');
      }, 5000);
      return true;
    }
    return false;
  }

  function startRound(lobby) {
    // MAke sure everyone starts out alive
    for (p in lobby.playerList) {
      player = lobby.playerList[p];
      if (player !== undefined && player.alive !== undefined) {
        player.alive = true;
      }
    }
    lobby.round++;
    lobby.state = STATES.IN_ROUND;
    lobby.enemyCount = lobby.round;
  }

  function loop() {
    for (var i = 0; i < lobbies.length; i++) {
      var lobby = lobbies[i];
      var lobbyName = lobby.name;
      var currentState = lobbies[i].state;
      if (currentState === STATES.IN_LOBBY) {
        // nothing
      } else if (currentState === STATES.READY_CHECK) {
        // nothing
      } else if (currentState === STATES.IN_GAME) {
        SERVER_BULLET.moveBullets(lobby);
        io.sockets.in(lobbyName).emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(lobby.playerList)});
        io.sockets.in(lobbyName).emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(lobby.bulletList)});
      } else if (currentState === STATES.ROUND_WAIT) {
        SERVER_BULLET.moveBullets(lobby);
        io.sockets.in(lobbyName).emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(lobby.playerList)});
        io.sockets.in(lobbyName).emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(lobby.bulletList)});
      } else if (currentState === STATES.IN_ROUND) {
        if (lobby.enemyCount > 0) {
          SERVER_ENEMY.spawnEnemies(lobby);
        }
        if (!checkRoundOver(lobby)) {
          checkGameOver(lobby);
        }
        SERVER_ENEMY.moveEnemies(lobby);
        io.sockets.in(lobbyName).emit('sendEnemyLocationsToClient', {enemyList: JSON.stringify(lobby.enemyList)});
        SERVER_BULLET.moveBullets(lobby);
        io.sockets.in(lobbyName).emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(lobby.playerList)});
        io.sockets.in(lobbyName).emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(lobby.bulletList)});
      } else if (currentState === STATES.ROUND_END) {
        SERVER_BULLET.moveBullets(lobby);
        io.sockets.in(lobbyName).emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(lobby.playerList)});
        io.sockets.in(lobbyName).emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(lobby.bulletList)});
      } else if (currentState === STATES.GAME_OVER) {
        // nothing
      } else {
        // should not get here
      }
    }
  }

  setInterval(loop, 30);

  io.sockets.on("connection", function(socket) {
      playerList[socket.id] = { isHere: true, playerData: undefined };

      socket.on('sendPlayerToServer', function(data) {
          playerList[socket.id].playerData = data.player;
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
      });

      socket.on('makeNewLobby', function(data) {
        socket.join(data.lobbyName);
        lobby = new Object;
        lobby.name = data.lobbyName;
        lobby.state = STATES.IN_LOBBY;
        lobby.enemyList = [];
        lobby.playerList = {};
        lobby.playerCount = 0;
        lobby.playerList[socket.id] = (playerList[socket.id].playerData);
        lobby.playerCount++;
        lobby.enemyList = [];
        lobby.bulletList = [];
        lobby.round = 0;
        lobbies.push(lobby);
        socket.emit('updateLobbyName', {lobby: lobby.name});
      });

      socket.on('joinLobby', function(data) {
        foundLobby = false;
        for (var i = 0; i < lobbies.length; i++) {
          if (lobbies[i].playerCount < 4 && lobbies[i].round === 0) {
            socket.join(lobbies[i].name);
            lobbies[i].playerList[socket.id] = (playerList[socket.id].playerData);
            console.log(lobbies[i].playerList);
            lobby.playerCount++;

            foundLobby = true;
            socket.emit('updateLobbyName', {lobby: lobbies[i].name});
          }
        }
        if (!foundLobby) {
          socket.emit('noLobbyAvailable');
        }
      });

      socket.on('sendStatsToServer', function(data) {
        console.log(data);
        playerData=playerList[socket.id].playerData
        if (playerData !== undefined && playerData.health !== undefined 
            && playerData.movement !== undefined && playerData.fireRAte !== undefined
            && playerData.damage !== undefined){
                playerData.health = data.health;
                playerData.movement = data.movement;
                playerData.fireRAte = data.fireRAte;
                playerData.damage = data.damage;
                console.log(playerData);
                // io.sockets.emit('sendPlayerStatsToClient', {playerList: JSON.stringify(playerList)});
        }

      });

      socket.on('readyToPlay', function(data) {
        for (var i = 0; i < lobbies.length; i++) {
          var lobby = lobbies[i];
          var lobbyName = lobby.name;
          console.log("lobby => " + lobby);
          if (lobby.playerList[socket.id] !== undefined && lobby.playerList[socket.id].ready !== undefined) {
            if (lobbyName === data.lobby) {
              lobby.playerList[socket.id].ready = true;
              lobby.state = STATES.READY_CHECK;
              if (checkReady(lobby)) {
                lobby.state = STATES.IN_GAME;
                io.sockets.in(lobby.name).emit('sendStartGameToClient');
                io.sockets.in(lobby.name).emit('sendRoundWaitToClient');
                setTimeout(function() {
                  startRound(lobby);
                  io.sockets.in(lobbyName).emit('sendStartRoundToClient');
                }, 5000);
              }
            }
          }
        }
      });

      socket.on('sendPlayerLocationToServer', function(data) {
        for (var i = 0; i < lobbies.length; i++) {
          var lobby = lobbies[i];
          var lobbyName = lobby.name;
          if (lobby.playerList[socket.id] !== undefined && data.x !== undefined && data.y !== undefined && data.lobby !== undefined) {
            if (lobbyName === data.lobby) {
              lobby.playerList[socket.id].x = data.x;
              lobby.playerList[socket.id].y = data.y;
            }
          }
        }
      });

      socket.on('sendBulletLocationToServer', function(data) {
        for (var i = 0; i < lobbies.length; i++) {
          var lobby = lobbies[i];
          var lobbyName = lobby.name;
          if (data.dX !== undefined && data.dY !== undefined && data.lobby !== undefined) {
            if (lobbyName === data.lobby) {
              player = lobby.playerList[socket.id];
              SERVER_BULLET.createBullet(player, data.dX, data.dY, lobby);
            }
          }
        }
      });

      socket.on('sendCallOutToServer', function(data) {
        if (data.callOut !== undefined){
          player = playerList[socket.id].playerData;
          PLAYER.callOut(player, data.callout);
        }
      });

    // ============================
    // ==== Chatroom ==============
    // ============================
    socket.on('msg', function(data) {
      socket.emit('status', { success: 'true'});
      socket.broadcast.emit('newmsg', { 
                                        sender: data.sender, 
                                        body: data.body });
      socket.emit('newmsg', { sender: data.sender,
                              body: data.body });
    });

    socket.on('disconnect', function() {
      console.log("socket id => " + socket.id);
      delete playerList[socket.id];
      socket.leave('gameLobby');
      io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
    });
  });
};