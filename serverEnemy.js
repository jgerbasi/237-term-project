var ENEMY = (function() {
  var exports = {};
  exports.enemyList = [];

    exports.Flyer = function(xPos, yPos, respawn) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.spriteX = 0;
    this.spriteY = 0;
    this.height = 32;
    this.width = 31;
    this.health = 30;
    this.type = "flyer";

  // Animates the helicopter blades.
  this.draw = function() {
    //ctx.clearRect(0,0,568,320);
    ctx.fillStyle = "red";
    ctx.fillRect(this.xPos, this.yPos, 20, 20);
  }

    
    // Move towards Mega Man
    this.aggro = function() {
      // if (distance(this.xPos + this.width/2, this.yPos + this.height/2, 
      //     PLAYER.playerX, PLAYER.playerY) > 300)
          // ;

      var pY = PLAYER.getPlayerY();
      var pX = PLAYER.getPlayerX();
      // console.log("py: " + pY + "|  px: " + pX);

      //enemy aggro
      if (pY > this.yPos){
        this.yPos += 3;
      }
      if(this.yPos > pY){
        this.yPos -=3;
      }
      if (pX > this.xPos){
        this.xPos += 3;
      }
      if (this.xPos > pX){
        this.xPos -=3;
      }

      // console.log(this.xPos,this.yPos);

      // // enemyCollisionToMegaman();
      //   if (pY > this.yPos) 
      //     this.yPos = ((this.yPos + 5) > pY) ? pY : this.yPos + .5;
      //   else
      //     this.yPos = ((this.yPos - 5) < pY) ? pY : this.yPos - .5;    
      //   if (pX > this.xPos) 
      //     this.xPos += .5;
      //   else
      //     this.xPos -= .5;
    }
    return;
  }

  // function distance(x1,y1,x2,y2) {
  //   var x = x2 - x1;
  //   var y = y2 - y1;
  //   var hyp = Math.sqrt(x*x + y*y);
  //   return hyp;
  // }

  exports.setEnemyList = function(newList){
    exports.enemyList = newList;
    exports.drawEnemies();
  }

  exports.drawEnemies = function() {
    for (var i = 0; i < exports.enemyList.length; i++) {
      var e = exports.enemyList[i];
      e.aggro();
      e.draw();
    }
  }

  exports.getEnemies = function() {
    var result = [];

    result.push(new ENEMY.Flyer(200, 300));
    result.push(new ENEMY.Flyer(160, 240));
    result.push(new ENEMY.Flyer(300, 200));

    return exports.setEnemyList(result);
  }

  return exports;
}());