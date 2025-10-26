

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const posEl = document.getElementById('pos');
const velEl = document.getElementById('vel');
const accEl = document.getElementById('acc');
const forceSlider = document.getElementById('force');
const massSlider = document.getElementById('mass');

let keys = {left:false,right:false,up:false,down:false};

const ball = {
  x: W/2, y: H/2, r:18,
  vx: 0, vy: 0,
  ax: 0, ay: 0,
  m: parseFloat(massSlider.value)
};

const restitution = 1.0; // perfectly elastic bounce

// Input events
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.key === 'ArrowDown') keys.down = true;
  if (e.code === 'Space') { ball.vx = 0; ball.vy = 0; } // stop
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'ArrowUp') keys.up = false;
  if (e.key === 'ArrowDown') keys.down = false;
});
canvas.addEventListener('dblclick', e => {
  const r = canvas.getBoundingClientRect();
  ball.x = e.clientX - r.left;
  ball.y = e.clientY - r.top;
  ball.vx = ball.vy = 0;
});

// Physics step (dt seconds)
function step(dt) {
  const F = Number(forceSlider.value);
  let fx = 0, fy = 0;
  if (keys.left) fx -= F;
  if (keys.right) fx += F;
  if (keys.up) fy -= F;
  if (keys.down) fy += F;

  ball.m = parseFloat(massSlider.value) || 1;
  ball.ax = fx / ball.m;
  ball.ay = fy / ball.m;

  // integrate (explicit Euler)
  ball.vx += ball.ax * dt;
  ball.vy += ball.ay * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // simple elastic collisions with canvas edges
  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = -ball.vx * restitution; }
  if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -ball.vx * restitution; }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = -ball.vy * restitution; }
  if (ball.y + ball.r > H) { ball.y = H - ball.r; ball.vy = -ball.vy * restitution; }
}

// Rendering
function draw() {
  ctx.clearRect(0,0,W,H);

  // slight grid for orientation
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let gx=0; gx<W; gx+=60){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
  for (let gy=0; gy<H; gy+=60){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }
  ctx.restore();

  // shadow
  ctx.beginPath();
  ctx.ellipse(ball.x+4, ball.y+6, ball.r*1.05, ball.r*0.45, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  // ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.stroke();

  // velocity vector
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.lineTo(ball.x + ball.vx * 0.18, ball.y + ball.vy * 0.18);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.stroke();

  // acceleration vector
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.lineTo(ball.x + ball.ax * 6, ball.y + ball.ay * 6);
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.stroke();

  // HUD
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(8,8,220,56);
  ctx.fillStyle = '#e6eef7';
  ctx.font = '12px monospace';
  ctx.fillText(`m = ${ball.m.toFixed(2)} kg`, 16, 26);
  ctx.fillText(`Force = ${forceSlider.value} N`, 16, 44);
}

// UI text update
function ui() {
  posEl.textContent = `${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}`;
  velEl.textContent = `${ball.vx.toFixed(2)}, ${ball.vy.toFixed(2)} px/s`;
  accEl.textContent = `${ball.ax.toFixed(2)}, ${ball.ay.toFixed(2)} px/s²`;
}

// Main loop
let last = performance.now();
function loop(ts) {
  const dt = Math.min((ts - last) / 1000, 0.05);
  last = ts;
  step(dt);
  draw();
  ui();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
