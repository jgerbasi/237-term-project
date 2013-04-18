var ENEMY = (function() {
  var exports = {};

  exports.drawEnemies = function(enemies) {
    var bgDX = PLAYER.bgOffsetX();
    var bgDY = PLAYER.bgOffsetY();
    for (enemy in enemies) {
      e = enemies[enemy];
      ctx.fillStyle = "red";
      ctx.fillRect((e.x + bgDX), (e.y + bgDY), 20, 20);
    }
  }
  return exports;
}());