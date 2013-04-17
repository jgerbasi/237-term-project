var MSTICK = (function () {
  var exports = {};

    var MSWIDTH;
    var MSHEIGHT;
    var threshold = 2;
    var speed = 10;
    var limitSize = 36;
    var inputSize = 18;
    var lastTime = Date.now();
    var mStick = new Stick(inputSize);

  function draw() {
    MSctx.clearRect(0,0,MSWIDTH,MSHEIGHT);
    drawMStick();

  };

  function drawMStick() {
    MSctx.save();

    //Base
    MSctx.beginPath();
    MSctx.arc(MSWIDTH/2, MSHEIGHT/2, 36, 0, (Math.PI * 2), true);

    MSctx.lineWidth = 3;
    MSctx.stroke();


    // Input
    MSctx.beginPath();
    MSctx.arc(mStick.input.x,mStick.input.y , 18, 0, (Math.PI * 2), true);
    MSctx.fillStyle = "rgb(0, 0, 0)";
    MSctx.fill();

    MSctx.restore();

  };

   exports.render = function() {

    MSWIDTH = MScanvas.width;
    MSHEIGHT = MScanvas.height;


    mStick.setLimitXY(MSWIDTH/2, MSHEIGHT/2);
    mStick.setInputXY(MSWIDTH/2, MSHEIGHT/2);

    MScanvas.addEventListener("touchstart", function (e) {
      e.preventDefault();
      var touch = e.touches[0];

      mStick.setInputXY(touch.pageX, touch.pageY);
      mStick.active = true;
    });

    document.addEventListener("touchmove", function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      if(mStick.active) {
        mStick.setInputXY(touch.pageX, touch.pageY);
      }
    });

    document.addEventListener("touchend", function (e) {
      var touches = e.changedTouches;
      
      mStick.active = false;
      mStick.setInputXY(MSWIDTH/2, MSHEIGHT/2);
      
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
  mStick.update();

  var deltaX = ((mStick.length * mStick.normal.x)
      * speed * (elapsed / 1000));

  var deltaY = ((mStick.length * mStick.normal.y)
      * speed * (elapsed / 1000));

  var deltaXY = {dX: deltaX, dY: deltaY};
  PLAYER.updateCoords(deltaXY);
};

return exports;

}());