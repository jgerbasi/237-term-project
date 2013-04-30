exports.init = function() {
  var io = require('socket.io').listen(8888);
  var SERVER_ENEMY = require('./serverEnemy');
  var SERVER_BULLET = require('./serverBullet');
  io.set('log level', 1);

  var playerList = {};
  var lobbies = [];
  global.initLobby = {};

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

    console.log("player count ", lobby.playerCount);
    return count === lobby.playerCount;
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
      io.sockets.in(lobby.name).emit('updateLobbyName', {lobby: lobby.name, players: lobby.playerList});
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
    console.log("lobby => ", lobby);
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
    console.log(lobby.playerList);
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
        var lobby = new Object;
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
        socket.emit('updateLobbyName', {lobby: lobby.name, players: lobby.playerList});
      });

      socket.on('joinLobby', function(data) {
        var foundLobby = false;
        for (var i = 0; i < lobbies.length; i++) {
          if (lobbies[i].playerCount < 4 && lobbies[i].state === STATES.IN_LOBBY) {
            console.log(lobbies[i].round);
            socket.join(lobbies[i].name);
            lobbies[i].playerList[socket.id] = (playerList[socket.id].playerData);
            lobbies[i].playerCount++;

            foundLobby = true;
            io.sockets.in(lobbies[i].name).emit('updateLobbyName', {lobby: lobbies[i].name, players: lobbies[i].playerList});
          }
        }
        if (!foundLobby) {
          socket.emit('noLobbyAvailable');
        }
      });

      socket.on('sendStatsToServer', function(data) {
        playerData=playerList[socket.id].playerData
        if (playerData !== undefined && playerData.health !== undefined 
            && playerData.movement !== undefined && playerData.fireRAte !== undefined
            && playerData.damage !== undefined){
                playerData.health = data.health;
                playerData.movement = data.movement;
                playerData.fireRAte = data.fireRAte;
                playerData.damage = data.damage;
                // io.sockets.emit('sendPlayerStatsToClient', {playerList: JSON.stringify(playerList)});
        }

      });

      socket.on('readyToPlay', function(data) {
        for (var i = 0; i < lobbies.length; i++) {
          var lobby = lobbies[i];
          var lobbyName = lobby.name;
          if (lobby.playerList[socket.id] !== undefined && lobby.playerList[socket.id].ready !== undefined) {
            if (lobbyName === data.lobby) {
              console.log("lobby name => ", lobbyName);
              lobbies[i].playerList[socket.id].ready = true;
              lobbies[i].state = STATES.READY_CHECK;
              io.sockets.in(lobbies[i].name).emit('updateLobbyName', {lobby: lobbies[i].name, players: lobbies[i].playerList});
              if (checkReady(lobbies[i])) {
                lobbies[i].state = STATES.IN_GAME;
                io.sockets.in(lobbies[i].name).emit('sendStartGameToClient');
                io.sockets.in(lobbies[i].name).emit('sendRoundWaitToClient');
                global.initLobby = lobbies[i]
                setTimeout(function() {
                  console.log("lobby in set timeout => ", global.initLobby);
                  startRound(global.initLobby);
                  io.sockets.in(global.initLobby.name).emit('sendStartRoundToClient');
                }, 1000);
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

      socket.on('sendCalloutToServer', function(data) {
        for (var i = 0; i < lobbies.length; i++) {  
          var lobby = lobbies[i];
          var lobbyName = lobby.name;
          if (data.callout !== undefined && data.lobby !== undefined){
            if (lobbyName === data.lobby) {
              if (data.callout === "help") io.sockets.in(lobby.name).emit('sendHelpCalloutToClient');
              if (data.callout === "run") io.sockets.in(lobby.name).emit('sendRunCalloutToClient');
            }
          }
        }
      });

      socket.on('sendLobbyExitToServer', function(data) {
        for (var i = 0; i < lobbies.length; i++) {
          var lobby = lobbies[i];
          var lobbyName = lobby.name;
          if (data.lobby !== undefined) {
            if (lobbyName === data.lobby) {
              console.log("test");
              socket.leave(lobby.name);
              lobby.playerCount--;
              var playerID = socket.id;
              var lobbyPlayerList = lobby.playerList; 
              delete lobbyPlayerList[playerID];
              io.sockets.in(lobby.name).emit('updateLobbyName', {lobby: lobby.name, players: lobby.playerList});
              if (lobby.playerCount == 0) lobbies.splice(i, 1);
            }
          }
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