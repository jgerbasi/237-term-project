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

  socket.emit('sendPlayerToServer', {player: player});

  GAMEPLAY.loadCanvas();
  GAMEPLAY.run();

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

  function startGame() {
    window.currentState = window.STATES.READY_CHECK;
    $('#homeLobby').hide();
    $('#loadingScreen').show();
    socket.emit('readyToPlay');
  }

  function createGame() {
    window.currentState = window.STATES.IN_LOBBY;
    $('#homeLobby').hide();
    $('#gameLobby').show();
  }

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
    var td = $(this).parent().prev().prev();
    var count = parseInt(td.html());
    if (count !== 0){
      count--;
      td.html(count);
    } else {
      td.html(count);
    }
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

// callOut Div

$('#callOut').click(function(){
  word = "halp faggot";
  socket.emit('sendCallOutToServer', {word:word})
});


// clicking the gun divs
  $('#gun1').click(function(){
    $('#gun1').css("border-color:#000");
    $('#gun2').css("border-color:#fff");
    $('#gun3').css("border-color:#fff");
    alert("u clicked 1");
  });

  $('#gun2').click(function(){
    $('#gun1').css("border-color:#fff");
    $('#gun2').css("border-color:#000");
    $('#gun3').css("border-color:#fff");
    alert("u clicked 2");
  });

  $('#gun3').click(function(){
    $('#gun1').css("border-color:#fff");
    $('#gun2').css("border-color:#fff");
    $('#gun3').css("border-color:#000");
    alert("u clicked 3");
  });

  socket.on('sendPlayerListToClient', function(data) {
    players = JSON.parse(data.playerList);
    updatePlayerList();
  });

  socket.on('sendReturnToLobbyToClient', function() {
    endGame();
  })


});