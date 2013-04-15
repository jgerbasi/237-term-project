var PLAYER = (function(){
  var exports = {};


  var playerX = 200,
      playerY = 200 ,
      spriteX = 5,
      spriteY = 11,
      spriteWidth = 22,
      spriteHeight = 33,
      spriteIndex = 0,
      frames = 3,
      direction = "",
      bgX = -200,
      bgY = -200;

  var spriteImage = new Image();
      spriteImage.src = "sheet.png";

  var bgImg = new Image();
      bgImg.src = "map1.png";

//   var playerImg = {
//   "left1": {"sx":7 , "sy":35 , "swidth":17 , "sheight":33 },
//   "left2": {"sx":35 , "sy":35 , "swidth":21 , "sheight":33 },
//   "left3": {"sx":71 , "sy":35 , "swidth":17 , "sheight":33 },

//   "right1": {"sx":35 , "sy":69 , "swidth":21 , "sheight":33 },
//   "right2": {"sx":8 , "sy":69 , "swidth":17 , "sheight":33 },
//   "right3": {"sx":72 , "sy":69 , "swidth":17 , "sheight":33 },

//   "up1": {"sx":35 , "sy":103 , "swidth":27 , "sheight":33 },
//   "up2": {"sx":6 , "sy":103 , "swidth":21 , "sheight":33 },
//   "up3": {"sx":70 , "sy":103 , "swidth":21 , "sheight":33 },

//   "down1": {"sx":5 , "sy":1 , "swidth":22 , "sheight":33 },
//   "down2": {"sx":3 , "sy":1 , "swidth":27 , "sheight":33 },
//   "down3": {"sx":70 , "sy":1 , "swidth":22 , "sheight":33 }
// }


exports.onKeyDown = function(){
  console.log(event.keyCode);
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
      if(spriteIndex !== 2){
        spriteWidth = 17;
      }
      else
        spriteWidth = 21;
    }

    if (direction === "down"){
      spriteY = 1;
      if(spriteIndex === 2){
        spriteWidth = 27;
      }
      else
        spriteWidth = 22;
    }

    if (direction === "left"){
      spriteY = 35;
      if(spriteIndex !== 2){
        spriteWidth = 17;
      }
      else
        spriteWidth = 21;
    }

    if (direction === "up"){
      spriteY = 103;
      if(spriteIndex === 1){
        spriteWidth = 27;
      }
      else
        spriteWidth = 22;
    }

    exports.doDraw();
    spriteIndex +=1;
    if(spriteIndex > 3){
        spriteIndex = 0;
        spriteX = 5;
    }
    else{
      spriteX += spriteWidth;
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