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

function createEnemy(x, y, lobby) {
  var round = lobby.round;
  var enemy = {};
  enemy.x = x;
  enemy.y = y;
  enemy.width = 20;
  enemy.height = 20;
  enemy.damage = round;
  enemy.health = 10;
  enemy.speed = getRandomInt(1,2);
  return enemy;
}

exports.spawnEnemies = function(lobby) {
  enemyList = lobby.enemyList;
  enemyCount = lobby.enemyCount;
  if (enemyList.length < 3) {
    var x = getRandomInt(-200, 763);
    var y = getRandomInt(-200, 510);
    var newEnemy = createEnemy(x, y, lobby);
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
      if (player !== undefined && player.x !== undefined && player.y !== undefined) {
        // HTML5 ROCKS COLLISION DETECTION
        if (player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y) 
        {
          //damages the player
          player.health -= enemy.damage;
          if (player.health <= 0)
          {
            player.alive = false;
            return true;
          }
            
        }
      }
    }
  return false;
}