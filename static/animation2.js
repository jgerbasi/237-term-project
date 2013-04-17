var canvas = document.getElementById("myCanvas2");
var ctx = canvas.getContext("2d");

// globals
  var frame = 0;

  var bgX = -200;
  var bgY = -200;

  sprite = new Image();
  sprite.src = "sheet.png";

  bgImg = new Image();
  bgImg.src = "map1.png";



function draw(){

}


function onKeyDown(){
  var moveLeft = false;
  var moveRight = false;
  var moveUp = false;
  var moveDown = false;

  //moveLeft
  if ((event.keyCode === 37)) {
    moveLeft = true;
    moveBg("left");
    playerMove("left");
    }

  //moveRight
  if ((event.keyCode === 39)) {
    moveRight = true;
    moveBg("right");
    playerMove("right");    
    }

  // moveUp
  if ((event.keyCode === 38)) {
    moveUp = true;
    moveBg("up");
    playerMove("up");
    }

  // moveDown
  if ((event.keyCode === 40)) {
    moveDown = true;
    moveBg("down");
    playerMove("down");    
    }
}



function playerMove(diretion){
  //draws player
  if (diretion === "left"){
    if (frame%3 == 0){
      ctx.drawImage(sprite, 7, 35, 17, 33, canvas.width/2, canvas.height/2, 17, 33)
    }
    if (frame%3 == 1){
      ctx.drawImage(sprite, 35, 35, 21, 33, canvas.width/2, canvas.height/2, 21, 33)
    }
    if (frame%3 == 2){
      ctx.drawImage(sprite, 71, 35, 17, 33, canvas.width/2, canvas.height/2, 17, 33)
    }
    frame++;
  }

  if (diretion === "right"){
    if (frame%3 == 0){
      ctx.drawImage(sprite, 35, 69, 21, 33, canvas.width/2, canvas.height/2, 21, 33)
    }
    if (frame%3 == 1){
      ctx.drawImage(sprite, 8, 69, 17, 33, canvas.width/2, canvas.height/2, 17, 33)
    }
    if (frame%3 == 2){
      ctx.drawImage(sprite, 72, 69, 17, 33, canvas.width/2, canvas.height/2, 17, 33)
    }
    frame++;
  }


  if (diretion === "up"){
    if (frame%3 == 0){
      ctx.drawImage(sprite, 35, 103, 27, 33, canvas.width/2, canvas.height/2, 27, 33)
    }
    if (frame%3 == 1){
      ctx.drawImage(sprite, 6, 103, 21, 33, canvas.width/2, canvas.height/2, 21, 33)
    }
    if (frame%3 == 2){
      ctx.drawImage(sprite, 70, 103, 21, 33, canvas.width/2, canvas.height/2, 21, 33)
    }
    frame++;
  }


  if (diretion === "down"){
    if (frame%3 == 0){
      ctx.drawImage(sprite, 5, 1, 22, 33, canvas.width/2, canvas.height/2, 22, 33)
    }
    if (frame%3 == 1){
      ctx.drawImage(sprite, 35, 1, 27, 33, canvas.width/2, canvas.height/2, 27, 33)
    }
    if (frame%3 == 2){
      ctx.drawImage(sprite, 70, 1, 22, 33, canvas.width/2, canvas.height/2, 22, 33)
    }
    frame++;
  }
}

function moveBg(direction){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (direction == "left"){
    bgX += 5;
    ctx.drawImage(bgImg, 0, 0, 400, 300, bgX, bgY, 800, 800);
  }

  if (direction == "right"){
    bgX -= 5;
    ctx.drawImage(bgImg, 0, 0, 400, 300, bgX, bgY, 800, 800);
  }

  if (direction == "up"){
    bgY += 5;
    ctx.drawImage(bgImg, 0, 0, 400, 300, bgX, bgY, 800, 800);
  }

  if (direction == "down"){
    bgY -= 5;
    ctx.drawImage(bgImg, 0, 0, 400, 300, bgX, bgY, 800, 800);
  }
}

function run(){
    canvas.addEventListener('keydown', onKeyDown, false);
    //canvas.addEventListener('keyup', onKeyUp, false);

    // make canvas focusable, then give it focus!
    canvas.setAttribute('tabindex','0');
    canvas.focus();

    mapdev = setInterval(draw,100);

}

run();