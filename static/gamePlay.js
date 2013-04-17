var GAMEPLAY = (function() {
  var exports = {};
  console.log("GAMEPLAY LOADED");
  players = {};

  socket.on('sendPlayerLocationsToClient', function(data) {
    players = JSON.parse(data.playerList);
    console.log(players);
  });

  exports.loadCanvas = function(div_id) {
      var canvas = document.createElement('canvas');
      div = document.getElementById(div_id); 
      canvas.id     = "gameCanvas";
      canvas.width  = 400;
      canvas.height = 400;
      canvas.style.zIndex   = 8;
      canvas.style.position = "absolute";
      canvas.style.border   = "1px solid";
      div.appendChild(canvas);
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