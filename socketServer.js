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
  console.log(count === 1);
  return count === 1;
}

exports.init = function() {
  var io = require('socket.io').listen(8888);
  io.set('log level', 1);

  var playerList = {};
  var lobbies = [];
  var enemyList = [];
  var bullets = [];

  var states = {
      LOGGED_IN: 0,
      IN_LOBBY: 1,
      IN_GAME: 2,
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
    e1 = createEnemy(200, 300);
    e2 = createEnemy(160, 240);
    e3 = createEnemy(300, 200);
    enemyList.push(e1);
    enemyList.push(e2);
    enemyList.push(e3);
  }

  function moveEnemy(enemy, targetPlayer) {
    if(targetPlayer !== undefined && targetPlayer !== undefined) {
      if (targetPlayer.y > enemy.y) enemy.y += 1;
      if (enemy.y > targetPlayer.y) enemy.y -=1;
      if (targetPlayer.x > enemy.x) enemy.x += 1;
      if (enemy.x > targetPlayer.x) enemy.x -=1;
    }
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
        return true;
      }
    }
    return false;
  }

  function createBullet(player, dx, dy) {
    var bullet = {};
    bullet.x = player.x;
    bullet.y = player.y;
    bullet.dx = dx *3;
    bullet.dy = dy *3;
    bullet.start = true;
    bullet.height = 5;
    bullet.width = 5;
    bullets.push(bullet);
  }

  function loop() {
    // moveEnemies();
    moveBullets();
    // console.log("THIS IS THE ENEMY LIST => " + JSON.stringify(enemyList));
    io.sockets.emit('sendEnemyLocationsToClient', {enemyList: JSON.stringify(enemyList)});
    io.sockets.emit('sendPlayerLocationsToClient', {playerList: JSON.stringify(playerList)});
    io.sockets.emit('sendBulletLocationsToClient', {bulletList: JSON.stringify(bullets)});
  }

  function startGameLoop() {
    spawnEnemies();
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
        if (playerList[socket.id].playerData !== undefined && data.x !== undefined && data.y !== undefined) {
          playerList[socket.id].playerData.x = data.x;
          playerList[socket.id].playerData.y = data.y;
        }
      });

      socket.on('sendBulletLocationToServer', function(data) {
        // console.log("request sent to make bullet");
        if (data.dX !== undefined && data.dY !== undefined) {
          // console.log(data.dX, data.dY);
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