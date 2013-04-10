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

  socket.on('playerList', function(data) {
    players = JSON.parse(data.list);
  });

  function updatePlayers() {
    socket.emit('updatePlayerList');
  }

  updatePlayers();

  function drawPlayers() {
    for (player in players) {
      ctx.fillRect(players[player].x, players[player].y, 50, 50);
    }
  }

  function doDraw(){
    ctx.clearRect(0,0, SCREEN_WIDTH,SCREEN_HEIGHT);
    drawPlayers();
  }

  function loop() {
    doDraw();

  }

  window.setInterval(loop, 1000/30);
});