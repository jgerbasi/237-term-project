var PLAYER = (function(){
  var exports = {};


  var playerX = 200,
      playerY = 200 ,
      spriteX = 37,
      spriteY = 0,
      spriteWidth = 23,
      spriteHeight = 34,
      spriteIndex = 1,
      frames = 3,
      direction = "",
      bgX = -200,
      bgY = -200;

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

exports.doDraw = function(){
  ctx.clearRect(0,0,400,400);
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,400,400);
  ctx.drawImage(bgImg, 0, 0, 400, 300, bgX, bgY, 800, 800);
  ctx.drawImage(spriteImage,spriteX,spriteY, spriteWidth,spriteHeight, playerX, playerY, spriteWidth, spriteHeight);
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

    exports.doDraw();
    spriteIndex +=1;
    if(spriteIndex > 3){
        spriteIndex = 1;
    }
}

function moveBg(direction){
  if (direction == "left"){
    bgX += 5;
  }

  if (direction == "right"){
    bgX -= 5;
  }

  if (direction == "up"){
    bgY += 5;
  }

  if (direction == "down"){
    bgY -= 5;
  }
}
return exports;
}());