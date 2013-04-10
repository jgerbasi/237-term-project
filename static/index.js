$(document).ready(function() {
  $("#welcome").append(docCookies.getItem('username') + "! Welcome to Horde Slayer");

  const SCREEN_WIDTH  = 600,
      SCREEN_HEIGHT = 600;


  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  canvas.setAttribute('tabindex','0');
  canvas.focus();

  var players = [];

  var x = Math.floor(Math.random() * (SCREEN_WIDTH-50));
  var y = Math.floor(Math.random() * (SCREEN_HEIGHT-50));

  var player = new Object();
  player.name = docCookies.getItem('username');
  player.x = x;
  player.y = y;

  socket.emit('sendPlayerToServer', {player: player});

  // socket.on('sendPlayerObj', function(data) {
  //   player = data.player;
  //   player.x = x;
  //   player.y = y;
  //   console.log(player);
  //   socket.emit('updatePlayerCoord', {player: player});
  // });

  function doDraw(){
    ctx.clearRect(0,0, SCREEN_WIDTH,SCREEN_HEIGHT);

    ctx.fillRect(x, y, 50, 50);
  }

  function loop() {
    doDraw();

  }

  window.setInterval(loop, 1000/30);
});