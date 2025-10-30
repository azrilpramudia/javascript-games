// ====== BACKGROUND PARTICLES ======
const bgCanvas = document.getElementById("backgroundCanvas");
const bgCtx = bgCanvas.getContext("2d");
function resizeBg() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBg();

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * bgCanvas.width;
    this.y = Math.random() * bgCanvas.height;
    this.size = Math.random() * 2 + 0.8;
    this.color = `hsla(${Math.random()*360},100%,65%,${0.7+Math.random()*0.3})`;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10 || this.x > bgCanvas.width + 10 || this.y < -10 || this.y > bgCanvas.height + 10) this.reset();
  }
  draw() {
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    bgCtx.fillStyle = this.color;
    bgCtx.shadowBlur = 10;
    bgCtx.shadowColor = this.color;
    bgCtx.fill();
  }
}
const particles = Array.from({length: 120}, () => new Particle());
function animateParticles() {
  bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
  for (let p of particles) { p.update(); p.draw(); }
  requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener("resize", () => { resizeBg(); });

// ====== BUBBLE SHOOTER (fixed shooting logic) ======
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");

// set canvas to desired size (match your HTML attrs or set here)
gameCanvas.width = 800;
gameCanvas.height = 600;

const colors = ["#ff5c8a", "#5cffff", "#ffd54f", "#b45cff", "#4fff72"];
const bubbleRadius = 20;
let score = 0;

const shooter = {
  x: gameCanvas.width / 2,
  y: gameCanvas.height - 40,
  radius: bubbleRadius,
  color: colors[Math.floor(Math.random()*colors.length)]
};

let bubbles = [];
function createBubbles() {
  bubbles = [];
  const rows = 5;
  const cols = 15;
  const startX = 50;
  const startY = 50;
  const xGap = 45;
  const yGap = 45;
  for (let r=0; r<rows; r++){
    for (let c=0; c<cols; c++){
      bubbles.push({
        x: startX + c * xGap,
        y: startY + r * yGap,
        color: colors[Math.floor(Math.random()*colors.length)],
        popped: false,
        popAnim: 0 // for pop animation
      });
    }
  }
}
createBubbles();

let activeShot = null; // { x, y, vx, vy, color }
const shotSpeed = 9;

// helper: create shot velocity from angle or target coords
function fireShotTowards(targetX, targetY) {
  const dx = targetX - shooter.x;
  const dy = targetY - shooter.y;
  const len = Math.hypot(dx, dy) || 1;
  const vx = (dx / len) * shotSpeed;
  const vy = (dy / len) * shotSpeed;
  activeShot = {
    x: shooter.x,
    y: shooter.y,
    vx, vy,
    color: shooter.color,
    radius: bubbleRadius * 0.9
  };
  // pick a new color for next shot
  shooter.color = colors[Math.floor(Math.random()*colors.length)];
}

// draw functions
function drawBubbles() {
  for (let b of bubbles) {
    if (!b.popped) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, bubbleRadius, 0, Math.PI*2);
      // gradient + glow
      const g = ctx.createRadialGradient(b.x-6,b.y-6,4,b.x,b.y,bubbleRadius);
      g.addColorStop(0, "#fff");
      g.addColorStop(1, b.color);
      ctx.fillStyle = g;
      ctx.shadowBlur = 18;
      ctx.shadowColor = b.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (b.popAnim > 0) {
      // pop animation (expand + fade)
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.popAnim);
      ctx.beginPath();
      ctx.arc(b.x, b.y, bubbleRadius * (1 + (1 - b.popAnim)*0.6), 0, Math.PI*2);
      ctx.fillStyle = b.color;
      ctx.shadowBlur = 24;
      ctx.shadowColor = b.color;
      ctx.fill();
      ctx.restore();
      b.popAnim -= 0.05;
    }
  }
}

function drawShooter() {
  ctx.beginPath();
  ctx.arc(shooter.x, shooter.y, shooter.radius, 0, Math.PI*2);
  const g = ctx.createRadialGradient(shooter.x-6, shooter.y-6, 4, shooter.x, shooter.y, shooter.radius);
  g.addColorStop(0, "#fff");
  g.addColorStop(1, shooter.color);
  ctx.fillStyle = g;
  ctx.shadowBlur = 20;
  ctx.shadowColor = shooter.color;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawShot() {
  if (!activeShot) return;
  ctx.beginPath();
  ctx.arc(activeShot.x, activeShot.y, activeShot.radius, 0, Math.PI*2);
  const g = ctx.createRadialGradient(activeShot.x-4, activeShot.y-4, 3, activeShot.x, activeShot.y, activeShot.radius);
  g.addColorStop(0, "#fff");
  g.addColorStop(1, activeShot.color);
  ctx.fillStyle = g;
  ctx.shadowBlur = 18;
  ctx.shadowColor = activeShot.color;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// collision helper
function checkCollision(shot, bubble) {
  const dx = shot.x - bubble.x;
  const dy = shot.y - bubble.y;
  return Math.hypot(dx, dy) < (shot.radius + bubbleRadius);
}

// main update
function update() {
  ctx.clearRect(0,0,gameCanvas.width,gameCanvas.height);

  // draw grid and shooter
  drawBubbles();
  drawShooter();

  // update shot
  if (activeShot) {
    activeShot.x += activeShot.vx;
    activeShot.y += activeShot.vy;

    // wall bounce on left/right
    if (activeShot.x < activeShot.radius) {
      activeShot.x = activeShot.radius;
      activeShot.vx *= -1;
    } else if (activeShot.x > gameCanvas.width - activeShot.radius) {
      activeShot.x = gameCanvas.width - activeShot.radius;
      activeShot.vx *= -1;
    }

    // collision vs bubbles
    for (let b of bubbles) {
      if (!b.popped && checkCollision(activeShot, b)) {
        // only pop same color
        if (b.color === activeShot.color) {
          b.popped = true;
          b.popAnim = 1.0;
          score += 10;
        } else {
          // small bounce-back effect: reverse shot slightly
          activeShot.vx *= -0.6;
          activeShot.vy *= -0.6;
        }
        // consume shot on contact (classic shooter) - remove if you prefer sticking behavior
        activeShot = null;
        break;
      }
    }

    // remove shot if it goes above top
    if (activeShot && activeShot.y < -50) activeShot = null;

    // draw shot after updating
    drawShot();
  }

  // HUD
  ctx.fillStyle = "#fff";
  ctx.font = "18px Poppins";
  ctx.fillText("Score: " + score, 12, 24);

  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Input handling
gameCanvas.addEventListener("mousemove", (e) => {
  const rect = gameCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  // keep shooter x inside bounds
  shooter.x = Math.max(shooter.radius, Math.min(gameCanvas.width - shooter.radius, mx));
});

gameCanvas.addEventListener("click", (e) => {
  // compute target inside canvas coords
  const rect = gameCanvas.getBoundingClientRect();
  const tx = e.clientX - rect.left;
  const ty = e.clientY - rect.top;
  if (!activeShot) {
    fireShotTowards(tx, ty);
  }
});

// restart
document.getElementById("restartBtn").addEventListener("click", () => {
  createBubbles();
  score = 0;
  activeShot = null;
  shooter.color = colors[Math.floor(Math.random()*colors.length)];
});
