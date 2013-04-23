var ENEMY = (function() {
  var exports = {};

  exports.drawEnemies = function(enemies) {
    var bgDX = PLAYER.bgOffsetX();
    var bgDY = PLAYER.bgOffsetY();
    for (var i = 0; i < enemies.length; i++) {
      e = enemies[i];
      ctx.fillStyle = "red";
      ctx.fillRect((e.x + bgDX), (e.y + bgDY), e.width, e.height);
    }
  }
  return exports;
}());