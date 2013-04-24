$(document).ready(function() {

  var states = {
      LOGGED_IN: 0,
      IN_LOBBY: 1,
      IN_GAME: 2,
  }

  var currentState = states.LOGGED_IN;
  var username = docCookies.getItem('username');

  var players = {};
  var player = new Object();
  player.name = username;
  player.x = undefined;
  player.y = undefined;
  player.alive = true;
  player.ready = false;
  player.health = 0;
  player.movement = 0;
  player.fireRate = 0;
  player.damage = 0;
  player.points = 10;
  player.width = 23;
  player.height = 34;

  //adds points to the stats page
    $('p').html(player.points);

  //puts the chat bar in focus when typing a message
  $('#chatbody').click(function() {
    $('#chatbody').focus();
  });

  //updates the skill tree
  $('.add').click(function(e) {
    var td = $(this).parent().prev();
    var count = parseInt(td.html());
    count++;
    td.html(count);
  });

  $('.sub').click(function(e) {
    var td = $(this).parent().prev();
    var count = parseInt(td.html());
    if (count !== 0){
      count--;
      td.html(count);
    }
    else
    {
      td.html(count);
    }
  });

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

  function endGame() {
    $('#gameOverlay').hide();
    $('#gamePage').hide();
    $('#homeLobby').show();
  }

  socket.emit('sendPlayerToServer', {player: player});

  socket.on('sendPlayerListToClient', function(data) {
    players = JSON.parse(data.playerList);
    updatePlayerList();
  });

  socket.on('sendReturnToLobbyToClient', function() {
    endGame();
  })


  function startGame() {
    var currentState = states.IN_GAME;
    $('#homeLobby').hide();
    $('#gamePage').show();
    socket.emit('readyToPlay');
    GAMEPLAY.loadCanvas();
  }

  function createGame() {
    var currentState = states.IN_LOBBY;
    $('#homeLobby').hide();
    $('#gameLobby').show();
  }
//Home lobby Buttons
  $('#startGameButton').click(function() {
    startGame();
  });

  $('#createGameButton').click(function() {
    createGame();
  });

  $('#showPlayerStats').click(function() {
    $('#homeLobby').hide();
    $('#statsPage').show();
  });

//Stats Page Buttons
  $('#submitStatsButton').click(function() {
    player.health = parseInt($("#health").html());
    player.movement = parseInt($("#movement").html());
    player.fireRate = parseInt($("#fireRate").html());
    player.damage = parseInt($("#damage").html());
    socket.emit('sendStatsToServer', {player: player});
  });

  $('#back').click(function(){
    $('#homeLobby').show();
    $('#statsPage').hide();
  })


});