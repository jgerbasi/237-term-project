var SSTICK = (function () {
  var exports = {};

    var SSWIDTH;
    var SSHEIGHT;
    var threshold = 2;
    var speed = 10;
    var limitSize = 36;
    var inputSize = 18;
    var lastTime = Date.now();
    var sStick = new Stick(inputSize);
    var canShoot = true;

  function draw() {
    SSctx.clearRect(0,0,SSWIDTH,SSHEIGHT);
    drawSStick();

  };

  function drawSStick() {
    SSctx.save();

    //Base
    SSctx.beginPath();
    SSctx.arc(SSWIDTH/2, SSHEIGHT/2, 36, 0, (Math.PI * 2), true);
    SSctx.strokeStyle = "rgb(255,255,255)";
    SSctx.lineWidth = 3;
    SSctx.stroke();


    // Input
    SSctx.beginPath();
    SSctx.arc(sStick.input.x,sStick.input.y , 18, 0, (Math.PI * 2), true);
    SSctx.fillStyle = "rgb(255,255,255)";
    SSctx.fill();

    SSctx.restore();

  };

   exports.render = function() {

    SSWIDTH = SScanvas.width;
    SSHEIGHT = SScanvas.height;


    sStick.setLimitXY(SSWIDTH/2, SSHEIGHT/2);
    sStick.setInputXY(SSWIDTH/2, SSHEIGHT/2);

    SScanvas.addEventListener("touchstart", function (e) {
      e.preventDefault();
      var stouch = e.touches[0];
      sStick.onlyLimit = true;
      sStick.setInputXY(stouch.pageX - (window.innerWidth - SSWIDTH) , stouch.pageY - (window.innerHeight - SSHEIGHT));
      sStick.active = true;
    });

    SScanvas.addEventListener("touchmove", function (e) {
      e.preventDefault();
      var stouch = e.targetTouches[0];
      if(sStick.active) {
        sStick.setInputXY(stouch.pageX - (window.innerWidth - SSWIDTH), stouch.pageY - (window.innerHeight - SSHEIGHT));
      }
    });

    SScanvas.addEventListener("touchend", function (e) {
      var stouches = e.changedTouches;
      sStick.onlyLimit = false;
      sStick.active = false;
      sStick.setInputXY(SSWIDTH/2, SSHEIGHT/2);
      
    });

    setInterval(main, 1);
  };

  function main () {
    var now = Date.now();
    var elapsed = (now - lastTime);

    update(elapsed);
    draw();

    lastTime = now;
};

function update(elapsed) {
  sStick.update();

  var sdeltaX = ((sStick.length * sStick.normal.x)
      * speed * (elapsed / 1000));

  var sdeltaY = ((sStick.length * sStick.normal.y)
      * speed * (elapsed / 1000));

  var sdeltaXY = {dX: sdeltaX, dY: sdeltaY};
  if (sdeltaXY.dX !== 0 && sdeltaXY.dY !== 0) {
    if (canShoot) {
      PLAYER.makeBullet(sdeltaXY);
      GUN.moveGun(sdeltaXY);
      canShoot = false;
      setTimeout(function() {
        canShoot = true;
      }, 300);
    }
    
  }

};

return exports;

}());