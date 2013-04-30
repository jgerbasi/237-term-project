var enemyList = [];
var playerList = [];
var enemyCount = 0;

exports.update = function(lobby) {
  enemyList = lobby.enemyList;
}

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
  enemy.damage = getRandomInt(round, 2*round);
  enemy.health = getRandomInt(5*round, 10*round);
  enemy.speed = getRandomInt(1,2);
  return enemy;
}

exports.spawnEnemies = function(lobby) {
  enemyList = lobby.enemyList;
  enemyCount = lobby.enemyCount;
  if (enemyList.length < 3) {
    var x = getRandomInt(-200, 763);
    var y = getRandomInt(-200, 510);
    var newEnemy = createEnemy(x, y);
    enemyList.push(newEnemy);
    lobby.enemyList.push(newEnemy);
    lobby.enemyCount--;
  }
}


// This is janky aggro
exports.moveEnemies = function(lobby) {
  enemyList = lobby.enemyList;
  playerList = lobby.playerList;
  enemyCount = lobby.enemyCount;
  for (enemy in enemyList) {
    e = enemyList[enemy];
    findAggroTarget(e);
  }
}

function moveEnemy(enemy, targetPlayer) {
  if(targetPlayer !== undefined && targetPlayer !== undefined) {
    if (targetPlayer.y > enemy.y) enemy.y += enemy.speed;
    if (enemy.y > targetPlayer.y) enemy.y -= enemy.speed;
    if (targetPlayer.x > enemy.x) enemy.x += enemy.speed;
    if (enemy.x > targetPlayer.x) enemy.x -= enemy.speed;
  }
  // This is just to test gameOVER scenario, ideally enemies could shoot as well
  checkEnemyCollision(enemy);
}

function findAggroTarget(e) {
  var shortestDistance = undefined;
  targetPlayer = undefined;
  for (p in playerList) {
    player = playerList[p];
    if (player !== undefined && player.x !== undefined && player.y !== undefined) {
      dist = distance(e.x, e.y, player.x, player.y);

      // Find shortest path to player
      if (shortestDistance === undefined ) {
        shortestDistance = dist;
        targetPlayer = player;
      } else {
        if (dist < shortestDistance) {
          shortestDistance = dist;
          targetPlayer = player;
        }
      }
    }
  }
  moveEnemy(e, targetPlayer);
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
          //damages the player
          data.health -= enemy.damage;
          console.log(data.health);
          if (data.health <= 0)
          {
            data.alive = false;
            return true;
          }
            
        }
      }
    }
  }
  return false;
}