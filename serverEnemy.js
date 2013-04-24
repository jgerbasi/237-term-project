function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

exports.spawnEnemies = function() {
  if (enemyList.length < 3) {
    var x = getRandomInt(-200, 763);
    var y = getRandomInt(-200, 510);
    enemyList.push(createEnemy(x, y));
    enemyCount--;
  }
}


// This is janky aggro
exports.moveEnemies = function() {
  for (enemy in enemyList) {
    e = enemyList[enemy];
    findAggroTarget(e);
  }
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
          return true;
        }
      }
    }
  }
  return false;
}