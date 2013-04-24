exports.init = function() {
  var io = require('socket.io').listen(8888);
  var SERVER_ENEMY = require('./serverEnemy');
  var SERVER_BULLET = require('./serverBullet');
  io.set('log level', 1);

  global.playerList = {};
  var lobbies = [];
  global.enemyList = [];
  global.bullets = [];
  var round = 0;
  global.enemyCount = 0;

  var STATES = {
      IN_LOBBY: 0,
      READY_CHECK: 1,
      IN_GAME: 2,
      ROUND_WAIT: 3,
      IN_ROUND: 4,
      ROUND_END: 5,
      GAME_OVER: 6,
  }

  var currentState = STATES.IN_LOBBY;

  function checkReady(playerList) {
    count = 0;
    for (p in playerList) {
      player = playerList[p];
      for (d in player) {
        data = player[d];
        if (data !== undefined && data.ready !== undefined) {
          if (data.ready === true) {
            count++;
          }
        }
      }
    }
    return count === 2;
  }

  function resetGame() {
    enemyList = [];
    round = 0;
    enemyCount = 0;
    for (p in playerList) {
      player = playerList[p];
      for (d in player) {
        data = player[d];
        if (data !== undefined && data.ready !== undefined) {
          data.ready = false;
        }
      }
    }
  }

  function endGame() {
    currentState = STATES.GAME_OVER;
    io.sockets.emit('sendGameOverToClient');
    resetGame();
    setTimeout(function() {
      io.sockets.emit('sendReturnToLobbyToClient');
    }, 5000);
  }

  function checkGameOver() {
    for (p in playerList) {
      player = playerList[p];
      for (d in player) {
        data = player[d];
        if (data !== undefined && data.alive !== undefined) {
          if (data.alive === true) return false;
        }
      }
    }
    endGame();
    return true;
  }

  function checkRoundOver() {
    if (enemyCount === 0 && enemyList.length === 0) {
      // send last enemy update
      io.sockets.emit('sendEnemyLocationsToClient', {enemyList: JSON.stringify(enemyList)});
      currentState = STATES.ROUND_END;
      io.sockets.emit('sendRoundWaitToClient');
      setTimeout(function() {
        startRound();
        io.sockets.emit('sendStartRoundToClient');
      }, 5000);
      return true;
    }
    return false;
  }

  function startRound() {
    // MAke sure everyone starts out alive
    for (p in playerList) {
      player = playerList[p];
      for (d in player) {
        data = player[d];
        if (data !== undefined && data.alive !== undefined) {
          data.alive = true;
        }
      }
    }
    round++;
    currentState = STATES.IN_ROUND;
    enemyCount = round;
  }

  function loop() {
    if (currentState === STATES.IN_LOBBY) {
      // nothing
    } else if (currentState === STATES.READY_CHECK) {
      // nothing
    } else if (currentState === STATES.IN_GAME) {
      SERVER_BULLET.moveBullets();
      io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
      io.sockets.emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(bullets)});
    } else if (currentState === STATES.ROUND_WAIT) {
      SERVER_BULLET.moveBullets();
      io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
      io.sockets.emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(bullets)});
    } else if (currentState === STATES.IN_ROUND) {
      if (enemyCount > 0) {
        SERVER_ENEMY.spawnEnemies();
      }
      if (!checkRoundOver()) {
        checkGameOver();
      }
      SERVER_ENEMY.moveEnemies();
      io.sockets.emit('sendEnemyLocationsToClient', {enemyList: JSON.stringify(enemyList)});
      SERVER_BULLET.moveBullets();
      io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
      io.sockets.emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(bullets)});
    } else if (currentState === STATES.ROUND_END) {
      SERVER_BULLET.moveBullets();
      io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
      io.sockets.emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(bullets)});
    } else if (currentState === STATES.GAME_OVER) {
      // nothing
    } else {
      // should not get here
    }
  }

  setInterval(loop, 30);

  io.sockets.on("connection", function(socket) {
      playerList[socket.id] = { isHere: true, playerData: undefined };
      socket.join('gameLobby');

      socket.on('sendPlayerToServer', function(data) {
          playerList[socket.id].playerData = data.player;
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
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

      socket.on('readyToPlay', function() {
        if (playerList[socket.id].playerData.ready !== undefined) {
          playerList[socket.id].playerData.ready = true;
          currentState = STATES.READY_CHECK;
          if (checkReady(playerList)) {
            currentState = STATES.IN_GAME;
            io.sockets.emit('sendStartGameToClient');
            io.sockets.emit('sendRoundWaitToClient');
            setTimeout(function() {
              startRound();
              io.sockets.emit('sendStartRoundToClient');
            }, 5000);
          }
        }
      });

      socket.on('sendRoundWaitToServer', function() {
        currentState = STATES.ROUND_WAIT;
      });

      socket.on('sendPlayerLocationToServer', function(data) {
        if (playerList[socket.id].playerData !== undefined && data.x !== undefined && data.y !== undefined) {
          playerList[socket.id].playerData.x = data.x;
          playerList[socket.id].playerData.y = data.y;
        }
      });

      socket.on('sendBulletLocationToServer', function(data) {
        if (data.dX !== undefined && data.dY !== undefined) {
          player = playerList[socket.id].playerData;
          SERVER_BULLET.createBullet(player, data.dX, data.dY);
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