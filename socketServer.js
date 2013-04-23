exports.init = function() {
  var io = require('socket.io').listen(8888);
  io.set('log level', 1);

  var playerList = {};
  var lobbies = [];
  var enemyList = [];
  var bullets = [];
  var roundStart = false;
  var round = 0;
  var enemyCount = 0;
  var gameOver = false;

  var states = {
      LOGGED_IN: 0,
      IN_LOBBY: 1,
      IN_GAME: 2,
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

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

  function distance(x1,y1,x2,y2) {
    var x = x2 - x1;
    var y = y2 - y1;
    var hyp = Math.sqrt(x*x + y*y);
    return hyp;
  }

  function createEnemy(x, y) {
    var enemy = {};
    enemy.x = x;
    enemy.y = y;
    enemy.width = 20;
    enemy.height = 20;
    return enemy;
  }

  function spawnEnemies() {
    if (enemyList.length < 3) {
      var x = getRandomInt(-200, 763);
      var y = getRandomInt(-200, 510);
      enemyList.push(createEnemy(x, y));
      enemyCount--;
    }
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
    gameOver = true;
    io.sockets.emit('sendGameOverToClient');
    return true;
  }

  function checkEnemyCollision(enemy) {
    for (p in playerList) {
      player = playerList[p];
      for (d in player) {
        data = player[d];
        if (data !== undefined && data.x !== undefined && data.y !== undefined) {
          // HTML5 ROCKS COLLISION DETECTION
          if (data.x < enemy.x + enemy.width &&
            data.x + data.width > enemy.x &&
            data.y < enemy.y + enemy.height &&
            data.y + data.height > enemy.y) 
          {
            data.alive = false;
            checkGameOver();
            return true;
          }
        }
      }
    }
    return false;
  }

  function moveEnemy(enemy, targetPlayer) {
    if(targetPlayer !== undefined && targetPlayer !== undefined) {
      if (targetPlayer.y > enemy.y) enemy.y += 1;
      if (enemy.y > targetPlayer.y) enemy.y -=1;
      if (targetPlayer.x > enemy.x) enemy.x += 1;
      if (enemy.x > targetPlayer.x) enemy.x -=1;
    }
    // This is just to test gameOVER scenario, ideally enemies could shoot as well
    checkEnemyCollision(enemy);
  }

  function findAggroTarget(e) {
    var shortestDistance = undefined;
    targetData = undefined;
    for (p in playerList) {
      player = playerList[p];
      for (d in player) {
        data = player[d];
        if (data !== undefined && data.x !== undefined && data.y !== undefined) {
          dist = distance(e.x, e.y, data.x, data.y);

          // Find shortest path to player
          if (shortestDistance === undefined ) {
            shortestDistance = dist;
            targetData = data;
          } else {
            if (dist < shortestDistance) {
              shortestDistance = dist;
              targetData = data;
            }
          }
        }
      }
    }
    moveEnemy(e, targetData);
  }

  // This is janky aggro
  function moveEnemies() {
    for (enemy in enemyList) {
      e = enemyList[enemy];
      findAggroTarget(e);
    }
  }
  function moveBullets() {
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].x += bullets[i].dx;
      bullets[i].y += bullets[i].dy;
      if (checkCollision(bullets[i])) {
        bullets.splice(i, 1);
        i--;
      }
      // should not be hardcoded
      else {
        if (bullets[i].x < -200 || bullets[i].x > 763 || bullets[i].y < -200 || bullets[i].y > 510) {
          console.log(bullets[i].x);
          bullets.splice(i, 1);
          i--;
        }
      }

    }
  }

  function checkRoundOver() {
    if (enemyCount === 0 && enemyList.length === 0) {
      // send last enemy update
      io.sockets.emit('sendEnemyLocationsToClient', {enemyList: JSON.stringify(enemyList)});
      roundStart = false;
      io.sockets.emit('sendRoundOverToClient');
    }
  }

  function checkCollision(bullet) {
    for (var i = 0; i < enemyList.length; i++) {
      enemy = enemyList[i];
      // HTML5 ROCKS COLLISION DETECTION
      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) 
      {
        console.log(i);
        enemyList.splice(i, 1);
        i--;
        checkRoundOver();
        return true;
      }
    }
    return false;
  }

  function createBullet(player, dx, dy) {
    var bullet = {};
    bullet.x = player.x + 12;
    bullet.y = player.y + 17;
    bullet.dx = dx *3;
    bullet.dy = dy *3;
    bullet.start = true;
    bullet.height = 5;
    bullet.width = 5;
    bullets.push(bullet);
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
    io.sockets.emit('sendStartRoundToClient');
    round++;
    roundStart = true;
    enemyCount = round;
  }

  function resetGame() {
    enemyList = [];
    round = 0;
    roundstart = false;
    enemyCount = 0;
    gameOver = false;
  }

  function loop() {
    if (gameOver) {
      // stop the server side game clock
      clearInterval(gameTimer);
    } else {
      if (roundStart) {
        if (enemyCount > 0) {
          spawnEnemies();
        }
        moveEnemies();
        io.sockets.emit('sendEnemyLocationsToClient', {enemyList: JSON.stringify(enemyList)});
      }
      moveBullets();
      io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
      io.sockets.emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(bullets)});
    }

  }

  function startGameLoop() {
    gameTimer = setInterval(loop, 30);
  }

  var currentState = states.LOGGED_IN;

  io.sockets.on("connection", function(socket) {
      playerList[socket.id] = { isHere: true, playerData: undefined };
      socket.join('gameLobby');

      socket.on('sendPlayerToServer', function(data) {
          playerList[socket.id].playerData = data.player;
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
      });

      socket.on('readyToPlay', function() {
        if (playerList[socket.id].playerData.ready !== undefined) {
          playerList[socket.id].playerData.ready = true;
          if (checkReady(playerList)) {
            io.sockets.emit('sendStartGameToClient');
            console.log('starting new game');
            startGameLoop();
          }
        }
      });

      // This starts a new round and shows the overlay on the client
      // for 5 seconds and then spawns enemies
      socket.on('newRound', function() {
        io.sockets.emit('sendRoundWaitToClient');
        setTimeout(function() {
          startRound();
        }, 5000);
      });

      socket.on('endGame', function() {
        resetGame();
        playerList[socket.id].playerData.ready = false;
        io.sockets.emit('sendGameOverScreenToClient');
        setTimeout(function() {
          io.sockets.emit('sendReturnToLobbyToClient');
        }, 5000);
      })

      socket.on('sendPlayerLocationToServer', function(data) {
        if (playerList[socket.id].playerData !== undefined && data.x !== undefined && data.y !== undefined) {
          playerList[socket.id].playerData.x = data.x;
          playerList[socket.id].playerData.y = data.y;
        }
      });

      socket.on('sendBulletLocationToServer', function(data) {
        if (data.dX !== undefined && data.dY !== undefined) {
          player = playerList[socket.id].playerData;
          createBullet(player, data.dX, data.dY);
        }
      });
        
      socket.on('disconnect', function() {
          console.log("socket id => " + socket.id);
          delete playerList[socket.id];
          socket.leave('gameLobby');
          io.sockets.emit('sendPlayerListToClient', {playerList: JSON.stringify(playerList)});
      });

    socket.on('msg', function(data) {
      socket.emit('status', { success: 'true'});
      socket.broadcast.emit('newmsg', { 
                                        sender: data.sender, 
                                        body: data.body });
      socket.emit('newmsg', { sender: data.sender,
                              body: data.body });
    });
  });
};