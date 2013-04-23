  function moveEnemy(enemy, targetPlayer) {
    if (targetPlayer.y > enemy.y) enemy.y += 1;
    if (enemy.y > targetPlayer.y) enemy.y -=1;
    if (targetPlayer.x > enemy.x) enemy.x += 1;
    if (enemy.x > targetPlayer.x) enemy.x -=1;
  }

  function findAggroTarget(e) {
    var shortestDistance = undefined;
    var targetPlayer = undefined;
    for (p in playerList) {
      var player = playerList[p];
      for (d in player) {
        var data = player[d];
        if (data.x !== undefined && data.y !== undefined) {
          var dist = distance(e.x, e.y, data.x, data.y);
          if (shortestDistance !== undefined && dist < shortestDistance) {
            shortestDistance = dist;
            targetPlayer = player;
          } else {
            shortestDistance = dist;
            targetPlayer = player;
          }
        }
      }
    }
    moveEnemy(e, targetPlayer);
  }

  // This is janky aggro
  function moveEnemies() {
    for (enemy in enemyList) {
      var e = enemyList[enemy];
      findAggroTarget(e);
    }
  }