// Grid settings
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const cols = 20; // grid columns
const rows = 20; // grid rows
const tile = canvas.width / cols; // tile size

// Game state
let snake;
let dir;
let nextDir; // to avoid multiple turns per tick
let food;
let scoreEl = document.getElementById("score");
let score = 0;
let loopId = null;
let speed = 140; // ms per step
let running = false;

function reset() {
  snake = [];
  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);
  for (let i = 0; i < 5; i++) snake.push({ x: startX - i, y: startY });
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  placeFood();
  score = 0;
  speed = 140;
  scoreEl.textContent = score;
  running = false;
  draw();
  showOverlay("Press Start to play");
}

function placeFood() {
  while (true) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    if (!snake.some((s) => s.x === x && s.y === y)) {
      food = { x, y };
      break;
    }
  }
}

function start() {
  if (running) return;
  hideOverlay();
  running = true;
  if (loopId) clearInterval(loopId);
  loopId = setInterval(step, speed);
}

function pause() {
  if (!running) return;
  running = false;
  if (loopId) clearInterval(loopId);
  showOverlay("Paused");
}

function restart() {
  if (loopId) clearInterval(loopId);
  reset();
  start();
}

function step() {
  // update direction
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // wall collision
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    gameOver();
    return;
  }
  // self collision
  if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // food
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    placeFood();
    // speed up a bit every 3 points
    if (score % 3 === 0 && speed > 40) {
      speed = Math.max(40, speed - 8);
      clearInterval(loopId);
      loopId = setInterval(step, speed);
    }
  } else {
    snake.pop(); // move forward
  }

  draw();
}

function draw() {
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // optional subtle grid
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * tile);
    ctx.lineTo(canvas.width, j * tile);
    ctx.stroke();
  }

  // draw food
  ctx.fillStyle = "#f97316";
  drawRect(food.x, food.y);

  // draw snake
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    ctx.fillStyle = i === 0 ? "#60a5fa" : "#3b82f6";
    drawRect(s.x, s.y, 6);
  }
}

function drawRect(gridX, gridY, pad = 4) {
  const px = gridX * tile + pad / 2;
  const py = gridY * tile + pad / 2;
  const size = tile - pad;
  const r = 8;
  roundRect(ctx, px, py, size, size, r);
  ctx.fill();
}

// rounded rect helper
function roundRect(ctx, x, y, w, h, r) {
  const min = Math.min(w, h) / 2;
  if (r > min) r = min;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function gameOver() {
  running = false;
  if (loopId) clearInterval(loopId);
  showOverlay("Game Over — Score: " + score + "\nPress Restart");
}

// overlay helpers
const overlay = document.getElementById("gameOverlay");
function showOverlay(text) {
  overlay.style.display = "flex";
  overlay.innerHTML = `<div class="overlay"><div class="box"><h3 style="margin:0">${
    text.split("\n")[0]
  }</h3><p class="small">${text
    .split("\n")
    .slice(1)
    .join("<br>")}</p></div></div>`;
}
function hideOverlay() {
  overlay.style.display = "none";
  overlay.innerHTML = "";
}

// controls
document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("pauseBtn").addEventListener("click", () => {
  running ? pause() : start();
});
document.getElementById("restartBtn").addEventListener("click", restart);

// keyboard input
window.addEventListener("keydown", (e) => {
  const key = e.key;
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
    ].includes(key)
  ) {
    e.preventDefault();
  }
  if (key === "ArrowUp" || key === "w" || key === "W") setNextDir(0, -1);
  if (key === "ArrowDown" || key === "s" || key === "S") setNextDir(0, 1);
  if (key === "ArrowLeft" || key === "a" || key === "A") setNextDir(-1, 0);
  if (key === "ArrowRight" || key === "d" || key === "D") setNextDir(1, 0);
});

function setNextDir(x, y) {
  // prevent reversing
  if (x === -dir.x && y === -dir.y) return;
  // set nextDir, but only one change per step will be applied
  nextDir = { x, y };
}

// mobile pad
document
  .getElementById("btnUp")
  .addEventListener("pointerdown", () => setNextDir(0, -1));
document
  .getElementById("btnDown")
  .addEventListener("pointerdown", () => setNextDir(0, 1));
document
  .getElementById("btnLeft")
  .addEventListener("pointerdown", () => setNextDir(-1, 0));
document
  .getElementById("btnRight")
  .addEventListener("pointerdown", () => setNextDir(1, 0));

// init
reset();
