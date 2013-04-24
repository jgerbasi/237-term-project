function checkCollision(bullet) {
  for (var i = 0; i < enemyList.length; i++) {
    enemy = enemyList[i];
    // HTML5 ROCKS COLLISION DETECTION
    if (bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y) 
    {
      console.log(i);
      enemyList.splice(i, 1);
      i--;
      return true;
    }
  }
  return false;
}

exports.moveBullets = function() {
  for (var i = 0; i < bullets.length; i++) {
      bullets[i].x += bullets[i].dx;
      bullets[i].y += bullets[i].dy;
      if (checkCollision(bullets[i])) {
        bullets.splice(i, 1);
        i--;
      }
      // should not be hardcoded
      else {
        if (bullets[i].x < -200 || bullets[i].x > 763 || bullets[i].y < -200 || bullets[i].y > 510) {
          console.log(bullets[i].x);
          bullets.splice(i, 1);
          i--;
        }
      }

    }
  }

exports.createBullet = function(player, dx, dy) {
  var bullet = {};
  bullet.x = player.x + 12;
  bullet.y = player.y + 17;
  bullet.dx = dx *3;
  bullet.dy = dy *3;
  bullet.start = true;
  bullet.height = 5;
  bullet.width = 5;
  bullets.push(bullet);
}