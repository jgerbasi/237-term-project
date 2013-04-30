var GUN = (function(){
  var exports = {};

  const CANVASHEIGHT = 320,
        CANVASWIDTH = 568,
        BUFFER = 400;
  
  var gunWidth = 17;
  var gunHeight = 25;
  var dx;
  var dy;
  var angle;

  var gun1Image = new Image();
      gun1Image.src = "images/rifle.png";

  var gun1Flip = new Image();
      gun1Flip.src = "images/rifle_flip.png";

  var gun2Image = new Image();
      gun2Image.src = "images/machine_gun.png";

  var gun2Flip = new Image();
      gun2Flip.src = "images/machine_gun.png";

  exports.moveGun = function(sDeltaXY) {
    dx = sDeltaXY.dX;
    dy = sDeltaXY.dY;
    angle = Math.atan2(dy,dx) * 180/Math.PI;
    console.log("angle " + angle);
          // console.log("dx: " + dx + "dy: " + dy);
  }

  exports.drawGun = function(gun) {
    var gun = gun;
    if (gun === 1) {
        if (angle > -90 && angle < 90){
        ctx.save();
        ctx.translate(292,170);
        ctx.rotate(angle* Math.PI/180);
        ctx.translate(-299,-175);
        ctx.drawImage(gun1Image,0,0,25,17,(CANVASWIDTH/2) + gunWidth, (CANVASHEIGHT/2) + gunHeight, 16,12);
        ctx.restore();
      }
      else{
        ctx.save();
        ctx.translate(299,185);
        ctx.rotate(angle* Math.PI/185);
        ctx.translate(-299,-185);
        ctx.drawImage(gun1Flip,0,0,25,17,(CANVASWIDTH/2) + gunWidth, (CANVASHEIGHT/2) + gunHeight, 16,12);
        ctx.restore();
      }
    }
    if (gun === 2) {
        if (angle > -90 && angle < 90){
        ctx.save();
        ctx.translate(292,170);
        ctx.rotate(angle* Math.PI/180);
        ctx.translate(-299,-175);
        ctx.drawImage(gun2Image,0,0,25,17,(CANVASWIDTH/2) + gunWidth, (CANVASHEIGHT/2) + gunHeight, 16,12);
        ctx.restore();
      }
      else{
        ctx.save();
        ctx.translate(299,185);
        ctx.rotate(angle* Math.PI/185);
        ctx.translate(-299,-185);
        ctx.drawImage(gun2Flip,0,0,25,17,(CANVASWIDTH/2) + gunWidth, (CANVASHEIGHT/2) + gunHeight, 16,12);
        ctx.restore();
      }
  }
}
  return exports;
}());