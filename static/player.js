var PLAYER = (function(){
  var exports = {};

  var username = docCookies.getItem('username');
  console.log("canvas.width");

  var spawnX = 284,
      spawnY = 160,
      playerX = 284,
      playerY = 160;
      spriteX = 37,
      spriteY = 0,
      spriteWidth = 23,
      spriteHeight = 34,
      spriteIndex = 1,
      frames = 3,
      direction = "",
      bgX = -200,
      bgY = -200,
      bgDX = 0,
      bgDY = 0,
      bulletX = spawnX,
      bulletY = spawnY;

  var spriteImage = new Image();
      spriteImage.src = "sheet.png";

  var bgImg = new Image();
      bgImg.src = "map1.png";


exports.onKeyDown = function(){
  
  //moveLeft
  if ((event.keyCode === 65)) {
    playerDir = "left";
    animateSprite(playerDir);
    moveBg(playerDir);
    }

  //moveRight
  if ((event.keyCode === 68)) {
    playerDir = "right";
    animateSprite(playerDir);
    moveBg(playerDir);
    }

  // moveUp
  if ((event.keyCode === 87)) {
    playerDir = "up";
    animateSprite(playerDir);
    moveBg(playerDir);
    }

  // moveDown
  if ((event.keyCode === 83)) {
    playerDir = "down";
    animateSprite(playerDir);
    moveBg(playerDir);
    }
}

exports.doDraw = function(players){
  ctx.clearRect(0,0,400,400);
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,400,400);
  ctx.drawImage(bgImg, 0, 0, 400, 300, bgX, bgY, 968, 720);
  for (p in players) {
    player = players[p];
    for (d in player) {
      data = player[d];
      if (data.name !== username && data.x !== undefined && data.y !== undefined) {
        ctx.drawImage(spriteImage,spriteX,spriteY, spriteWidth,spriteHeight, (data.x + bgDX), (data.y + bgDY), spriteWidth, spriteHeight);
      }
    }
  }
  ctx.drawImage(spriteImage,spriteX,spriteY, spriteWidth,spriteHeight, spawnX, spawnY, spriteWidth, spriteHeight);
}

exports.makeBullet = function(sDeltaXY){
  var change = sDeltaXY;
  bulletX = playerX;
  bulletY = playerY;
  PLAYER.moveBullet(change);
}

exports.moveBullet = function(sDeltaXY){
  if(sDeltaXY.dX !== 0 || sDeltaXY.dY !==0){
  bulletX += sDeltaXY.dX;
  bulletY += sDeltaXY.dY;
  ctx.fillStyle = "blue";
  ctx.fillRect(bulletX, bulletY, 40, 40);
  }
}

exports.getPlayerX = function(){
  return playerX;
}

exports.getPlayerY = function(){
  return playerY;
}

function animateSprite(direction){
    if (direction === "right"){
      spriteY = 69;
      if(spriteIndex === 1)
        spriteX = 8;
      if(spriteIndex === 2)
        spriteX = 40;
      if(spriteIndex === 3)
        spriteX = 72;
    
    }

    if (direction === "down"){
      spriteY = 0;
      if(spriteIndex === 1)
        spriteX = 5;
      if(spriteIndex === 2)
        spriteX = 37;
      if(spriteIndex === 3)
        spriteX = 70;
    }

    if (direction === "left"){
      spriteY = 35;
      if(spriteIndex === 1)
        spriteX = 7;
      if(spriteIndex === 2)
        spriteX = 39;
      if(spriteIndex === 3)
        spriteX = 71;
      
    }

    if (direction === "up"){
      spriteY = 103;
      if(spriteIndex === 1)
        spriteX = 6;
      if(spriteIndex === 2)
        spriteX = 37;
      if(spriteIndex === 3)
        spriteX = 70;
    }

    spriteIndex +=1;
    if(spriteIndex > 3){
        spriteIndex = 1;
    }
}

exports.updateCoords = function(deltaXY) {
  bgX -= deltaXY.dX;
  bgY -= deltaXY.dY;
  bgDX -= deltaXY.dX;
  bgDY -= deltaXY.dY;

  playerX += deltaXY.dX;
  playerY += deltaXY.dY;
  socket.emit("sendPlayerLocationToServer", {x: playerX, y: playerY});
}

exports.bgOffsetX = function() {
  return bgDX;
}

exports.bgOffsetY = function() {
  return bgDY;
}

function moveBg(direction){
  if (direction == "left" && bgX < canvas.width/2){
    bgX += 10;
    bgDX += 10;
    playerX -= 10;
  }

  if (direction == "right" && bgX + 968 - spriteWidth > 200){
    bgX -= 10;
    bgDX -= 10;
    playerX += 10;
  }

  if (direction == "up" && bgY < canvas.height/2){
    bgY += 10;
    bgDY += 10;
    playerY -= 10;
  }

  if (direction == "down" && bgY + 720 - spriteHeight > 200){
    bgY -= 10;
    bgDY -= 10;
    playerY += 10;
  }
  socket.emit("sendPlayerLocationToServer", {x: playerX, y: playerY});
}
return exports;
}());