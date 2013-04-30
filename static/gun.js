var GUN = (function(){
  var exports = {};

  var gun1Image = new Image();
      gun1Image.src = "rifle.png";

  var gun2Image = new Image();
      gun2Image.src = "mahcine_gun.png";

  exports.drawGun = function(gun) {
    var bgDX = PLAYER.bgOffsetX();
    var bgDY = PLAYER.bgOffsetY();
    var gun = gun;

    if(gun == 1){
      ctx.drawImage(gun1Image,0,0,25,17,(bullet.x + bgDX), (bullet.y + bgDY), 25,17);
    }
  }

  return exports;
}());