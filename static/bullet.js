var BULLET = (function(){
  var exports = {};

  exports.drawBullets = function(bullets) {
    var bgDX = PLAYER.bgOffsetX();
    var bgDY = PLAYER.bgOffsetY();
    for (var i = 0; i < bullets.length; i++) {
      bullet = bullets[i];
      // console.log(bullets[i].x);
      ctx.fillStyle = "blue";
      ctx.fillRect((bullet.x + bgDX), (bullet.y + bgDY), 10, 10);
    }
  }

  return exports;
}());