var GAMEPLAY = (function() {

  var exports = {};
  var players = {};
  var enemies = {};
  var bullets = [];
  var round = 0;

  socket.on('sendStartGameToClient', function() {
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
      canvas.style.width = '80%';
      canvas.style.left = "10%";
      canvas.style.height = '75%';
      canvas.style.zIndex   = 8;
      canvas.style.position = "absolute";
      

      div.appendChild(canvas);

      //Analog
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
      BULLET.drawBullets(bullets);
    } else if (window.state === window.STATES.IN_ROUND) {
      PLAYER.doDraw(players);
      ENEMY.drawEnemies(enemies);
      BULLET.drawBullets(bullets);
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