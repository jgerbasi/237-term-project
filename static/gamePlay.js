var GAMEPLAY = (function() {

  var exports = {};
  var players = {};
  var enemies = {};
  var bullets = [];
  var gun = 1;
  var round = 0;

  // callOut Div

  $(document).ready(function() {

    $('#callOut').click(function(){
      console.log("clicked on callout");
      $('#help').show();
      $('#run').show();
      $('#callOut').hide();
    });

    $('#help').click(function(){
      $('#help').hide();
      $('#run').hide();
      $('#callOut').show();
      socket.emit('sendCalloutToServer', {callout: "help", lobby: window.lobby});
    });

    $('#run').click(function(){
      $('#help').hide();
      $('#run').hide();
      $('#callOut').show();
      socket.emit('sendCalloutToServer', {callout: "run", lobby: window.lobby});
    });

    // clicking the gun divs
    $('#gun1').click(function(){
      $('#gun1').css("border-color:#000");
      $('#gun2').css("border-color:#fff");
      $('#gun3').css("border-color:#fff");
      gun = 1;
    });

    $('#gun2').click(function(){
      $('#gun1').css("border-color:#fff");
      $('#gun2').css("border-color:#000");
      $('#gun3').css("border-color:#fff");
      gun = 2;
    });
  });

  socket.on('sendStartGameToClient', function() {
    $('#gameLobby').hide();
    $('#gamePage').show();
    window.state = window.STATES.IN_GAME;
  }) 

  socket.on('sendRoundWaitToClient', function() {
    window.state = window.STATES.ROUND_WAIT;
    round++;
    var overlay = $('#gameOverlay');
    overlay.html("ROUND " + round + " STARTING");
    overlay.show();
  });

  socket.on('sendStartRoundToClient', function() {
    console.log("sent start round to client");
    window.state = window.STATES.IN_ROUND;
    var overlay = $('#gameOverlay');
    overlay.hide();
  })

  socket.on('sendGameOverToClient', function() {
    window.state = window.STATES.GAME_OVER;
    enemies = [];
    var overlay = $('#gameOverlay');
    overlay.html("GAME OVER LOL, YOU SURVIVED " + round + " ROUNDS!");
    round = 0;
    overlay.show();
  });

  socket.on('sendPlayerLocationsToClient', function(data) {
    players = JSON.parse(data.playerList);
  });

  socket.on('sendEnemyLocationsToClient', function(data) {
    enemies = JSON.parse(data.enemyList);
  });

  socket.on('sendBulletLocationsToClient', function(data) {
    bullets = JSON.parse(data.bulletList);
    console.log("bullet list client => ", bullets);
    console.log("lobby cleint name => ", window.lobby);
  });

  socket.on('sendHelpCalloutToClient', function() {
    var audioElement1 = document.createElement('audio');
    audioElement1.setAttribute('src', 'help.mp3');
    audioElement1.setAttribute('autoplay', 'autoplay');
    $.get();
    audioElement1.play();
  });

  socket.on('sendRunCalloutToClient', function() {
    var audioElement2 = document.createElement('audio');
    audioElement2.setAttribute('src', 'run.mp3');
    audioElement2.setAttribute('autoplay', 'autoplay');
    $.get();
    audioElement2.play();
  });

  exports.loadCanvas = function() {

      // Gameplay Area
      canvas = document.createElement('canvas');
      div = document.getElementById('gameDiv');
      div.style.width = '100%';
      div.style.height = '50%'; 
      canvas.id     = "gameCanvas";
      canvas.width  = 568;
      canvas.height = 320;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex   = 8;
      canvas.style.position = "absolute";
      

      div.appendChild(canvas);

      //Analogs
      MScanvas = document.createElement('canvas');
      div = document.getElementById('analogDiv'); 
      MScanvas.id     = "movementStick";
      MScanvas.width  = 100;
      MScanvas.height = 100;
      MScanvas.style.zIndex   = 8;
      MScanvas.style.position = "absolute";
      div.appendChild(MScanvas);
      MSTICK.render();

      SScanvas = document.createElement('canvas');
      div = document.getElementById('shootDiv'); 
      SScanvas.id     = "shootingStick";
      SScanvas.width  = 100;
      SScanvas.height = 100;
      SScanvas.style.zIndex   = 8;
      SScanvas.style.position = "absolute";
      div.appendChild(SScanvas);
      SSTICK.render();

      //Game Canvas
      canvas = document.getElementById("gameCanvas");
      canvas.setAttribute('tabindex','0');
      ctx = canvas.getContext("2d");

      MScanvas = document.getElementById("movementStick");
      MSctx = MScanvas.getContext("2d");

      SScanvas = document.getElementById("shootingStick");
      SSctx = SScanvas.getContext("2d");

      canvas.focus();
    }

  function loop() {
    if (window.state === window.STATES.ROUND_WAIT) {
      PLAYER.doDraw(players);
      GUN.drawGun(gun,players);
      BULLET.drawBullets(bullets);
    } else if (window.state === window.STATES.IN_ROUND) {
      PLAYER.doDraw(players);
      ENEMY.drawEnemies(enemies);
      BULLET.drawBullets(bullets);
      GUN.drawGun(gun,players);
    } else {
      // do nothing
    }
  }


  exports.run = function(){
    canvas.addEventListener('keydown', PLAYER.onKeyDown, false);

    setInterval(loop, 30);
  }

return exports;
}());