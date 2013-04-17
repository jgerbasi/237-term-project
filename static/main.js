$(document).ready(function() {

  var states = {
      LOGGED_IN: 0,
      IN_GAME: 1,
  }

  var currentState = states.LOGGED_IN;
  var username = docCookies.getItem('username');

  var players = {};
  var player = new Object();
  player.name = username;

  function updatePlayerList() {
    $("#players").empty();
    for (id in players) {
      player = players[id];
      if (player !== undefined) {
        if (player.playerData !== undefined) {
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

  function startGame() {
    var currentState = states.IN_GAME;
    $('#homeLobby').hide();
    $('#gameCanvas').show();
    GAMEPLAY.loadCanvas("gameDiv")
    GAMEPLAY.init();
    console.log("start game method invoked");
  }

  $('#startGameButton').click(function() {
    startGame();
  })

});