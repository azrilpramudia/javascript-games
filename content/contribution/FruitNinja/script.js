const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let fruits = [];
let score = 0;
let missed = 0;
let gameOver = false;
let fruitSpeed = 2;
let spawnRate = 90;
let frameCount = 0;

const fruitImages = ["🍎", "🍌", "🍉", "🍊", "🍓", "🍒", "🥝", "🍇"];
const bombEmoji = "💣";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnFruit() {
  const x = random(50, canvas.width - 50);
  const size = random(40, 60);
  const isBomb = Math.random() < 0.3; 
  const emoji = isBomb
    ? bombEmoji
    : fruitImages[Math.floor(Math.random() * fruitImages.length)];

  fruits.push({
    x,
    y: canvas.height + size,
    size,
    speed: random(fruitSpeed, fruitSpeed + 2),
    emoji,
    sliced: false,
    isBomb,
  });
}

function drawFruit(fruit) {
  ctx.save();
  ctx.font = `${fruit.size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(fruit.emoji, fruit.x, fruit.y);
  ctx.restore();
}

function updateFruits() {
  fruits.forEach((fruit) => {
    fruit.y -= fruit.speed;
  });

  fruits = fruits.filter((fruit) => {
    if (fruit.y + fruit.size < 0) {
      if (!fruit.isBomb) {
        missed++;
        updateStats();
      }
      return false;
    }
    return true;
  });

  if (missed >= 5 && !gameOver) {
    endGame("You missed too many fruits!");
  }
}

canvas.addEventListener("mousemove", (e) => {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  fruits.forEach((fruit) => {
    if (
      !fruit.sliced &&
      Math.abs(fruit.x - x) < fruit.size / 2 &&
      Math.abs(fruit.y - y) < fruit.size / 2
    ) {
      fruit.sliced = true;

      if (fruit.isBomb) {
        endGame("💣 You sliced a bomb!");
      } else {
        score++;
        updateStats();
      }
    }
  });

  fruits = fruits.filter((f) => !f.sliced);
});

function updateStats() {
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("missed").textContent = `Missed: ${missed} / 5`;
}

function endGame(message) {
  gameOver = true;
  document.getElementById("game-over-text").textContent = message;
  document.getElementById("final-score").textContent = score;
  document.getElementById("game-over").classList.remove("hidden");
}

document.getElementById("restart-btn").addEventListener("click", () => {
  score = 0;
  missed = 0;
  fruits = [];
  fruitSpeed = 2;
  spawnRate = 90;
  frameCount = 0;
  gameOver = false;
  updateStats();
  document.getElementById("game-over").classList.add("hidden");
  animate();
});

function animate() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  frameCount++;
  if (frameCount % spawnRate === 0) {
    spawnFruit();
  }

  updateFruits();
  fruits.forEach(drawFruit);

  if (frameCount % 300 === 0) {
    if (spawnRate > 40) spawnRate -= 5;
    fruitSpeed += 0.2;
  }

  requestAnimationFrame(animate);
}

updateStats();
animate();
