$(document).ready(function() {
  var username = docCookies.getItem('username');

  var players = [];
  var player = new Object();
  player.name = username;

  function updatePlayerList() {
    for (id in players) {
      player = players[id];
      if (player !== true) {
        $("#players").html();
        $("#players").append($("<li>").html(player.name));
        console.log(player.name);
      }
    }
  }

  socket.emit('sendPlayerToServer', {player: player});

  socket.on('sendPlayerListToClient', function(data) {
    players = JSON.parse(data.playerList);
    console.log(players);
    updatePlayerList();
  });

});