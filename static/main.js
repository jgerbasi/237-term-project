$(document).ready(function() {
  var username = docCookies.getItem('username');
  console.log("i like penis");

  var players = {};
  var player = new Object();
  player.name = username;

  function updatePlayerList() {
    $("#players").empty();
    for (id in players) {
      player = players[id];
      if (player !== undefined) {
        if (player.playerData !== undefined) {
            console.log(player.playerData.name);
            $("#players").append($("<li>").html(player.playerData.name));
        }
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