var ENEMY = (function() {
  var exports = {};

  var enemySpriteSheet = new Image();
  enemySpriteSheet.src = "enemySprites.png";

  exports.drawEnemies = function(enemies) {
    var bgDX = PLAYER.bgOffsetX();
    var bgDY = PLAYER.bgOffsetY();
    
    for (var i = 0; i < enemies.length; i++) {
      e = enemies[i];
      ctx.drawImage(enemySpriteSheet,e.spriteX, e.spriteY, e.spriteWidth, e.spriteHeight, (e.x + bgDX), (e.y + bgDY), e.width, e.height);
    }
  }
  return exports;
}());