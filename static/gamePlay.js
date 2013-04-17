var canvas = document.getElementById("canvas1");
var ctx = canvas.getContext("2d");

// const SCREEN_HEIGHT = 400,
//       SCREEN_WIDTH = 400;

function loop() {
  PLAYER.doDraw();
}

function run(){
    canvas.addEventListener('keydown', PLAYER.onKeyDown, false);
    //canvas.addEventListener('keyup', onKeyUp, false);

    // make canvas focusable, then give it focus!
    canvas.setAttribute('tabindex','0');
    canvas.focus();

    mapdev = setInterval(loop,300);

}
// window.onload(PLAYER.doDraw());
run();