$(document).ready(function() {

  var isPortraitMode = window.innerWidth < window.innerHeight;

  if (isPortraitMode) {
    alert("Please tilt your screen sideways!");
  }

  window.STATES = {
      IN_LOBBY: 0,
      READY_CHECK: 1,
      IN_GAME: 2,
      ROUND_WAIT: 3,
      IN_ROUND: 4,
      ROUND_END: 5,
      GAME_OVER: 6,
  }

  window.currentState = window.STATES.IN_LOBBY;
  var username = docCookies.getItem('username');

  var players = {};
  var player = new Object();
  player.name = username;
  player.x = 0;
  player.y = 0;
  player.alive = true;
  player.ready = false;
  player.health = 5;
  player.movement = 5;
  player.fireRate = 5;
  player.damage = 5;
  player.points = 10;
  player.width = 23;
  player.height = 34;

  window.lobby = undefined;

  socket.emit('sendPlayerToServer', {player: player});

  GAMEPLAY.loadCanvas();
  GAMEPLAY.run();

  function updatePlayerList() {
    $("#players").empty();
    for (id in players) {
      player = players[id];
      if (player !== undefined) {
        if (player.playerData !== undefined) {
            var li = $("<li>").html(player.playerData.name);
            $("#players").append(li);
        }
      }
    }
  }

  function updateLobbyPlayerList(players) {
    $("#lobbyPlayers").empty();
    for (id in players) {
      player = players[id];
      if (player !== undefined) {
        var li = $("<li>").html(player.name);
        var span = $("<span>");
        if (player.ready === true) {
          span.html("Ready");
          span.css('color', 'green');
          li.append(span);
        } else {
          span.html("Not Ready");
          span.css('color', 'red');
          li.append(span);
        }
        $("#lobbyPlayers").append(li);
      }
    }
  }

  function endGame() {
    $('#gameOverlay').hide();
    $('#gamePage').hide();
    $('#gameLobby').show();
  }

  function startGame() {
    window.currentState = window.STATES.READY_CHECK;

    socket.emit('readyToPlay', {lobby: window.lobby});
  }

  function joinLobby() {
    $('#homeLobby').hide();
    $('#gameLobby').show();
    socket.emit('joinLobby', {player: player});
  }

  function createGame() {
    window.currentState = window.STATES.IN_LOBBY;
    $('#homeLobby').hide();
    $('#gameLobby').show();
    socket.emit('makeNewLobby', {lobbyName: username, player: player});
  }

  function failedToJoin() {
    $('#homeLobby').show();health
    $('#gameLobby').hide();
    alert("No Lobbies Available To Join");
  }

  //puts the chat bar in focus when typing a message
  $('#chatbody').click(function() {
    $('#chatbody').focus();
  });

  //updates the skill tree with populated data
  document.getElementById("health").innerHTML=player.health;
  document.getElementById("movement").innerHTML=player.movement;
  document.getElementById("fireRate").innerHTML=player.fireRate;
  document.getElementById("damage").innerHTML=player.damage;

  $('.add').click(function(e) {
    if(document.getElementById("points").innerHTML > 0){
    var td = $(this).parent().prev();
    var count = parseInt(td.html());
    count++;
    td.html(count);
    document.getElementById("points").innerHTML--;
  }
  });

  $('.sub').click(function(e) {
    var td = $(this).parent().prev().prev();
    var count = parseInt(td.html());
    if (count !== 0 & td.html().value > 5){
      count--;
      td.html(count);
      document.getElementById("points").innerHTML++;
    } else {
      td.html(count);
    }
  });

  $('#joinGameButton').click(function() {
    joinLobby();
  });

  $('#startGameButton').click(function() {
    startGame();
  });

  $('#createGameButton').click(function() {
    createGame();
  });

  $('#showPlayerStats').click(function() {
    $('#homeLobby').hide();
    $('#statsPage').show();
    $('#gameLobby').hide();
  });

//Stats Page Buttons
  $('#submitStatsButton').click(function() {
    player.health = parseInt($("#health").html());
    player.movement = parseInt($("#movement").html());
    player.fireRate = parseInt($("#fireRate").html());
    player.damage = parseInt($("#damage").html());
    socket.emit('sendStatsToServer', {player: player});
  });

  $('#showInstructions').click(function() {
    $('#instructions').toggle();
  });

  $('#back').click(function(){
    $('#homeLobby').show();
    $('#statsPage').hide();
  });

  $('#exitLobby').click(function() {
    $('#gameLobby').hide();
    $('#homeLobby').show();
    socket.emit('sendLobbyExitToServer', {lobby: window.lobby});
  });

  socket.on('sendPlayerListToClient', function(data) {
    players = JSON.parse(data.playerList);
    updatePlayerList();
  });

  socket.on('sendReturnToLobbyToClient', function() {
    endGame();
  })

  socket.on('noLobbyAvailable', function() {
    failedToJoin();
  });

  socket.on('updateLobbyName', function(data) {
    window.lobby = data.lobby;
    updateLobbyPlayerList(data.players);
  });

});