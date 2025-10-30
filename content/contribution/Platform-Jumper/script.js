const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');

let playerBottom = 150;
let playerLeft = 175;
let gravity = 2;
let isJumping = false;
let platforms = [];
let score = 0;

const platformCount = 5;
const platformGap = 120;

// Create initial platforms
function createPlatforms() {
  for (let i = 0; i < platformCount; i++) {
    const platformBottom = i * platformGap;
    const platformLeft = Math.floor(Math.random() * 300);
    createPlatform(platformLeft, platformBottom);
  }
}

// Create single platform
function createPlatform(left, bottom) {
  const plat = document.createElement('div');
  plat.classList.add('platform');
  plat.style.left = left + 'px';
  plat.style.bottom = bottom + 'px';
  game.appendChild(plat);
  platforms.push(plat);
}

// Player jump
function jump() {
  if (isJumping) return;
  isJumping = true;
  let upInterval = setInterval(() => {
    playerBottom += 15;
    player.style.bottom = playerBottom + 'px';
    if (playerBottom >= 400) { // peak
      clearInterval(upInterval);
      fall();
    }
  }, 20);
}

// Player fall
function fall() {
  isJumping = false;
  let downInterval = setInterval(() => {
    playerBottom -= gravity;
    player.style.bottom = playerBottom + 'px';

    // Check for platform collision
    platforms.forEach(plat => {
      let platBottom = parseInt(plat.style.bottom);
      let platLeft = parseInt(plat.style.left);
      if (
        playerBottom <= platBottom + 15 &&
        playerBottom >= platBottom &&
        playerLeft + 50 >= platLeft &&
        playerLeft <= platLeft + 100 &&
        !isJumping
      ) {
        jump();
      }
    });

    if (playerBottom <= 0) {
      clearInterval(downInterval);
      alert(`Game Over! Your Score: ${score}`);
      location.reload();
    }
  }, 20);
}

// Move platforms down
function movePlatforms() {
  setInterval(() => {
    platforms.forEach(plat => {
      let bottom = parseInt(plat.style.bottom);
      bottom -= 2;
      plat.style.bottom = bottom + 'px';

      // Remove platforms below screen and add new
      if (bottom < -15) {
        plat.remove();
        platforms.shift();
        score++;
        scoreEl.textContent = `Score: ${score}`;
        const newBottom = 600;
        const newLeft = Math.floor(Math.random() * 300);
        createPlatform(newLeft, newBottom);
      }
    });
  }, 30);
}

// Move player left/right
function control(e) {
  if (e.key === 'ArrowLeft') {
    playerLeft -= 20;
    if (playerLeft < 0) playerLeft = 0;
    player.style.left = playerLeft + 'px';
  } else if (e.key === 'ArrowRight') {
    playerLeft += 20;
    if (playerLeft > 350) playerLeft = 350;
    player.style.left = playerLeft + 'px';
  }
}

document.addEventListener('keydown', control);

// Start game
createPlatforms();
fall();
movePlatforms();
