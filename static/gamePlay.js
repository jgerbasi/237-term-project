var GAMEPLAY = (function() {
  var exports = {};
  console.log("GAMEPLAY LOADED");
  players = {};

  socket.on('sendPlayerLocationsToClient', function(data) {
    players = JSON.parse(data.playerList);
    console.log(players);
  });

  exports.loadCanvas = function() {

      // Gameplay Area
      var canvas = document.createElement('canvas');
      div = document.getElementById('gameDiv'); 
      canvas.id     = "gameCanvas";
      canvas.width  = 400;
      canvas.height = 400;
      canvas.style.zIndex   = 8;
      canvas.style.position = "absolute";
      canvas.style.border   = "1px solid";
      div.appendChild(canvas);

      // Analog
      var MScanvas = document.createElement('canvas');
      div = document.getElementById('analogDiv'); 
      MScanvas.id     = "movementStick";
      MScanvas.width  = 100;
      MScanvas.height = 50;
      MScanvas.style.zIndex   = 8;
      MScanvas.style.position = "absolute";
      MScanvas.style.border   = "1px solid";
      div.appendChild(MScanvas);
    }

  function loop() {
    socket.emit('getPlayerLocations');
    PLAYER.doDraw(players);
  }

  function run(){
    canvas.addEventListener('keydown', PLAYER.onKeyDown, false);
    console.log("test");
    //canvas.addEventListener('keyup', onKeyUp, false);

    setInterval(loop, 30);
  }
  // window.onload(PLAYER.doDraw());

  exports.init = function () {
    console.log("init began");
    canvas = document.getElementById("gameCanvas");
    canvas.setAttribute('tabindex','0');
    ctx = canvas.getContext("2d");
    canvas.focus();
    run();

  // const SCREEN_HEIGHT = 400,
  //       SCREEN_WIDTH = 400;
  };
return exports;
}());