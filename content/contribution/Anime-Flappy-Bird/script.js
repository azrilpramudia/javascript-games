const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 500;

let orb = { x: 80, y: 200, size: 14, velocity: 0, gravity: 0.25, lift: -6.5 };
let beams = [];
let score = 0;
let gameRunning = false;

const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", startGame);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") orb.velocity = orb.lift;
});
document.addEventListener("click", () => {
  if (gameRunning) orb.velocity = orb.lift;
});

function startGame() {
  document.querySelector(".overlay").style.display = "none";
  resetGame();
  gameRunning = true;
  requestAnimationFrame(update);
}

function resetGame() {
  orb.y = 200;
  orb.velocity = 0;
  beams = [];
  score = 0;
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0a0020");
  gradient.addColorStop(1, "#12002e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Floating anime-style lights
  for (let i = 0; i < 20; i++) {
    const x = (Math.sin(Date.now() / 1000 + i) + 1) * 200;
    const y = (i * 25 + Date.now() / 30) % canvas.height;
    ctx.fillStyle = `rgba(255, ${150 + i * 5}, 255, 0.25)`;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawOrb() {
  const glow = ctx.createRadialGradient(orb.x, orb.y, 2, orb.x, orb.y, 20);
  glow.addColorStop(0, "#fff");
  glow.addColorStop(1, "#ff00ff44");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
  ctx.fill();
}

function drawBeams() {
  ctx.fillStyle = "#6b00f0";
  for (let beam of beams) {
    ctx.fillRect(beam.x, 0, beam.width, beam.top);
    ctx.fillRect(beam.x, beam.bottom, beam.width, canvas.height - beam.bottom);
  }
}

function drawScore() {
  ctx.fillStyle = "#ffccff";
  ctx.font = "22px VT323";
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  orb.velocity += orb.gravity;
  orb.y += orb.velocity;

  // Stop falling out of screen
  if (orb.y + orb.size > canvas.height || orb.y - orb.size < 0) {
    gameOver();
    return;
  }

  // Generate beams slowly
  if (Math.random() < 0.015) {
    let top = Math.random() * 160 + 60; // more balanced
    let gap = 140; // wider gap for easier play
    beams.push({ x: canvas.width, width: 50, top, bottom: top + gap });
  }

  for (let i = beams.length - 1; i >= 0; i--) {
    let beam = beams[i];
    beam.x -= 2; // slower movement

    // Collision check with a small forgiveness margin
    let margin = 3;
    if (
      orb.x + orb.size - margin > beam.x &&
      orb.x - orb.size + margin < beam.x + beam.width &&
      (orb.y - orb.size + margin < beam.top ||
        orb.y + orb.size - margin > beam.bottom)
    ) {
      gameOver();
      return;
    }

    if (beam.x + beam.width < 0) {
      beams.splice(i, 1);
      score++;
    }
  }

  drawBeams();
  drawOrb();
  drawScore();

  if (gameRunning) requestAnimationFrame(update);
}

function gameOver() {
  gameRunning = false;
  document.querySelector(".overlay").style.display = "block";
  document.querySelector("h1").textContent = `Game Over 💔 | Score: ${score}`;
  document.querySelector("#startBtn").textContent = "Try Again";
}
