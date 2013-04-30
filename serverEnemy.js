var enemyList = [];
var playerList = [];
var enemyCount = 0;
global.round = 0;

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

var Enemy = function(x,y,type) {
  this.type = type;
  this.curRound = global.round;
  this.x = x;
  this.y = y;
  this.damage = this.curRound;
  this.health = this.curRound * 2;
  this.speed = this.curRound;
  this.spriteIndex = 1;
  this.direction = "";
}
  
var SpeedEnemy = function(x,y) {
  Enemy.call(this);
  this.type = "speedEnemy";
  this.x = x;
  this.y = y;
  this.spriteX = 2;
  this.spriteY = 64;
  this.spriteWidth = 30;
  this.spriteHeight = 31;
  this.width = this.spriteWidth;
  this.height = this.spriteHeight;
  this.speed = 1/2; 
}
  
SpeedEnemy.prototype = new Enemy();
SpeedEnemy.prototype.constructor = SpeedEnemy;

function animate(enemy){
  if (enemy.direction === "right"){
    console.log("right:" + enemy.spriteIndex);
    if(enemy.spriteIndex === 1){
      enemy.spriteX = 2;
      enemy.spriteY = 32;
      enemy.spriteWidth = 25;
      enemy.spriteHeight = 31;
    }
    if(enemy.spriteIndex === 2){
      enemy.spriteX = 33;
      enemy.spriteY = 33;
      enemy.spriteWidth = 26;
      enemy.spriteHeight = 30;
    }
  }

  if (enemy.direction === "down"){
        console.log("down:" + enemy.spriteIndex);

    if(enemy.spriteIndex === 1){
      enemy.spriteX = 2;
      enemy.spriteY = 64;
      enemy.spriteWidth = 30;
      enemy.spriteHeight = 31;

    }
    if(enemy.spriteIndex === 2){
      enemy.spriteX = 36;
      enemy.spriteY = 65;
      enemy.spriteWidth = 26;
      enemy.spriteHeight = 30;
    }
  }

  if (enemy.direction === "left"){
        console.log("left:" + enemy.spriteIndex);

    if(enemy.spriteIndex === 1){
      enemy.spriteX = 7;
      enemy.spriteY = 97;
      enemy.spriteWidth = 26;
      enemy.spriteHeight = 30;
    }
    if(enemy.spriteIndex === 2){
      enemy.spriteX = 39;
      enemy.spriteY = 96;
      enemy.spriteWidth = 25;
      enemy.spriteHeight = 31;
    }
  }

  if (enemy.direction === "up"){
        console.log("up:" + enemy.spriteIndex);

    if(enemy.spriteIndex === 1){
      enemy.spriteX = 6;
      enemy.spriteY = 2;
      enemy.spriteWidth = 26;
      enemy.spriteHeight = 29;
    }
    if(enemy.spriteIndex === 2){
      enemy.spriteX = 34;
      enemy.spriteY = 3;
      enemy.spriteWidth = 30;
      enemy.spriteHeight = 28;
    }
  }
}

function updateSpriteIndex(enemy){
  enemy.spriteIndex +=1;
  if(enemy.spriteIndex > 2){
      enemy.spriteIndex = 1;
  }
}

exports.spawnEnemies = function(lobby) {
  enemyList = lobby.enemyList;
  enemyCount = lobby.enemyCount;
  global.round = lobby.round;
  if (enemyList.length < 3) {
    var x = getRandomInt(-200, 763);
    var y = getRandomInt(-200, 510);
    var newEnemy = new SpeedEnemy(x,y);
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

function moveUp(enemy) {
  enemy.y += enemy.speed;
}

function moveEnemy(enemy, targetPlayer) {
  if(targetPlayer !== undefined && targetPlayer !== undefined) {
    if (targetPlayer.y > enemy.y){ 
      if(enemy.direction = "up"){
        enemy.direction = "down";
      }
      updateSpriteIndex(enemy);
      animate(enemy);
      // enemy.y += enemy.speed;
      moveUp(enemy);
      
    }
    if (enemy.y > targetPlayer.y){
      if(enemy.direction = "down"){ 
        enemy.direction = "up";
      }
      updateSpriteIndex(enemy);
      animate(enemy);
      enemy.y -= enemy.speed;

    }
    if (targetPlayer.x > enemy.x){
      if(enemy.direction = "left"){
        enemy.direction = "right";
      }
      updateSpriteIndex(enemy);
      animate(enemy);
      enemy.x += enemy.speed;

    }
    if (enemy.x > targetPlayer.x){
      if(enemy.direction = "right"){
         enemy.direction = "left";
      }
      updateSpriteIndex(enemy);
      animate(enemy);
      enemy.x -= enemy.speed;
    }
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