/* Gravity Ball — platformer
   - Circle ball under gravity
   - Rectangular platforms (solid top)
   - Move left/right, jump if on ground
   - Reach the flag (destination rectangle) to win
   - Gravity slider and mobile controls
*/

/* ====== Setup / canvas ====== */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  // match CSS width/height while keeping drawing resolution high
  const rect = canvas.getBoundingClientRect();
  // set internal canvas pixel size
  canvas.width = Math.min(window.innerWidth * 0.9, 1000) * devicePixelRatio;
  canvas.height = (window.innerHeight * 0.66) * devicePixelRatio;
  canvas.style.width = `${Math.min(window.innerWidth * 0.9, 1000)}px`;
  canvas.style.height = `${window.innerHeight * 0.66}px`;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); // scale for DPI
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ====== Level data (platforms, start, goal) ======
   You can add more levels by appending to levels[].
   Platform object: {x, y, w, h}
*/
const levels = [
  {
    platforms: [
      {x:20,y:420,w:300,h:20},
      {x:360,y:360,w:200,h:20},
      {x:600,y:300,w:180,h:20},
      {x:270,y:520,w:200,h:20},
      {x:820,y:480,w:120,h:20}
    ],
    start: {x:60,y:380},
    goal: {x:880,y:240,w:40,h:40}
  },
  {
    platforms: [
      {x:0,y:520,w:220,h:20},
      {x:260,y:460,w:180,h:20},
      {x:480,y:400,w:140,h:20},
      {x:660,y:340,w:120,h:20},
      {x:820,y:280,w:120,h:20}
    ],
    start: {x:20,y:480},
    goal: {x:900,y:220,w:40,h:40}
  }
];

let levelIndex = 0;

/* ====== Physics & player ====== */
const state = {
  gravity: 900, // pixels/sec^2 (adjustable by slider)
  frictionGround: 0.85,
  moveAccel: 1600,
  maxSpeedX: 420,
  jumpVel: -520
};

const ball = {
  x: 100,
  y: 100,
  r: 16,
  vx: 0,
  vy: 0,
  onGround: false,
  color: '#77ddff'
};

let platforms = [];
let goal = null;

/* ====== Input ====== */
const keys = {left:false,right:false,jump:false};
document.addEventListener('keydown', e => {
  if (e.code==='ArrowLeft' || e.key==='a') keys.left = true;
  if (e.code==='ArrowRight' || e.key==='d') keys.right = true;
  if (e.code==='Space' || e.code==='ArrowUp' || e.key==='w') { keys.jump = true; }
});
document.addEventListener('keyup', e => {
  if (e.code==='ArrowLeft' || e.key==='a') keys.left = false;
  if (e.code==='ArrowRight' || e.key==='d') keys.right = false;
  if (e.code==='Space' || e.code==='ArrowUp' || e.key==='w') { keys.jump = false; }
});

// mobile buttons
const mLeft = document.getElementById('mLeft');
const mRight = document.getElementById('mRight');
const mJump = document.getElementById('mJump');
if (mLeft) {
  mLeft.addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.left=true; });
  mLeft.addEventListener('touchend', (e)=>{ e.preventDefault(); keys.left=false; });
  mRight.addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.right=true; });
  mRight.addEventListener('touchend', (e)=>{ e.preventDefault(); keys.right=false; });
  mJump.addEventListener('touchstart', (e)=>{ e.preventDefault(); keys.jump=true; setTimeout(()=>keys.jump=false, 150); });
}

/* ====== UI hooks ====== */
const gravityRange = document.getElementById('gravityRange');
const gravityVal = document.getElementById('gravityVal');
const restartBtn = document.getElementById('restartBtn');
const nextBtn = document.getElementById('nextBtn');
const messageEl = document.getElementById('message');
const levelNumEl = document.getElementById('levelNum');

gravityRange.addEventListener('input', () => {
  state.gravity = Number(gravityRange.value);
  gravityVal.textContent = gravityRange.value;
});
gravityVal.textContent = gravityRange.value;

restartBtn.addEventListener('click', () => loadLevel(levelIndex));
nextBtn.addEventListener('click', () => {
  levelIndex = (levelIndex+1) % levels.length;
  loadLevel(levelIndex);
});

/* ====== Level loader ====== */
function loadLevel(idx) {
  const L = levels[idx];
  platforms = L.platforms.map(p => ({...p}));
  ball.x = L.start.x;
  ball.y = L.start.y;
  ball.vx = 0; ball.vy = 0; ball.onGround = false;
  goal = {...L.goal};
  messageEl.textContent = 'Reach the flag!';
  levelNumEl.textContent = (idx+1);
}
loadLevel(levelIndex);

/* ====== Collision helpers ====== */
function rectCircleCollidesCircleTop(rect, cx, cy, r) {
  // check if circle is touching rect top area (vertical overlap)
  // We'll do simple resolution in main loop
  return false;
}

/* Resolving collisions: we use axis-aligned rectangles (platforms).
   We will check ball's next position and resolve vertical collisions first,
   then horizontal collisions to avoid tunnelling.
*/
function resolveCollisions(dt) {
  // predict next position
  const nextX = ball.x + ball.vx * dt;
  const nextY = ball.y + ball.vy * dt;

  // reset onGround
  ball.onGround = false;

  // vertical resolution
  // move Y, check for overlaps with platforms
  ball.y = nextY;
  for (let p of platforms) {
    if (circleRectOverlap(ball.x, ball.y, ball.r, p)) {
      // we collided; determine whether collision from top or bottom
      const prevY = ball.y - ball.vy * dt;
      if (prevY + ball.r <= p.y) {
        // landed on top
        ball.y = p.y - ball.r - 0.001;
        ball.vy = 0;
        ball.onGround = true;
      } else if (prevY - ball.r >= p.y + p.h) {
        // hit roof from below
        ball.y = p.y + p.h + ball.r + 0.001;
        ball.vy = Math.min(0, ball.vy); // push downwards
      } else {
        // side-ish overlap; push out vertically
        if (ball.vy > 0) {
          ball.y = p.y - ball.r - 0.001;
          ball.vy = 0;
          ball.onGround = true;
        } else {
          ball.y = p.y + p.h + ball.r + 0.001;
          ball.vy = Math.min(0, ball.vy);
        }
      }
    }
  }

  // horizontal resolution
  ball.x = nextX;
  for (let p of platforms) {
    if (circleRectOverlap(ball.x, ball.y, ball.r, p)) {
      const prevX = ball.x - ball.vx * dt;
      if (prevX + ball.r <= p.x) {
        // collided with left side of platform
        ball.x = p.x - ball.r - 0.001;
        ball.vx = 0;
      } else if (prevX - ball.r >= p.x + p.w) {
        // collided with right side
        ball.x = p.x + p.w + ball.r + 0.001;
        ball.vx = 0;
      } else {
        // fallback
        if (ball.vx > 0) {
          ball.x = p.x - ball.r - 0.001;
          ball.vx = 0;
        } else {
          ball.x = p.x + p.w + ball.r + 0.001;
          ball.vx = 0;
        }
      }
    }
  }

  // keep inside canvas horizontally
  ball.x = Math.max(ball.r, Math.min(canvas.width/ devicePixelRatio - ball.r, ball.x));
  // bottom floor (fall out of world)
  const worldBottom = canvas.height / devicePixelRatio;
  if (ball.y - ball.r > worldBottom + 120) {
    // fell: reset level
    messageEl.textContent = 'You fell — restarting level';
    setTimeout(()=> loadLevel(levelIndex), 700);
  }
}

function circleRectOverlap(cx, cy, r, rect) {
  // rect: {x,y,w,h}
  // find closest point to circle center
  const rx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ry = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - rx;
  const dy = cy - ry;
  return (dx*dx + dy*dy) <= r*r;
}

/* ====== Game loop ====== */
let last = performance.now();
function gameLoop(now) {
  const dt = Math.min(0.032, (now - last) / 1000); // cap dt to avoid huge jumps
  last = now;

  // physics: gravity
  ball.vy += state.gravity * dt;

  // horizontal control
  if (keys.left) {
    ball.vx -= state.moveAccel * dt;
  }
  if (keys.right) {
    ball.vx += state.moveAccel * dt;
  }
  // apply friction when on ground
  if (ball.onGround) {
    ball.vx *= state.frictionGround;
    if (Math.abs(ball.vx) < 6) ball.vx = 0;
  } else {
    // small aerial drag
    ball.vx *= 0.997;
  }

  // clamp horizontal speed
  ball.vx = Math.max(-state.maxSpeedX, Math.min(state.maxSpeedX, ball.vx));

  // jumping (edge triggered)
  if (keys.jump && ball.onGround) {
    ball.vy = state.jumpVel;
    ball.onGround = false;
  }

  // resolve collisions and move ball
  resolveCollisions(dt);

  // check goal collision
  if (goal && rectCircleOverlap(goal, ball.x, ball.y, ball.r)) {
    messageEl.textContent = '🎉 Level Complete!';
    // automatically advance to next level after short delay
    setTimeout(()=> {
      levelIndex = (levelIndex + 1) % levels.length;
      loadLevel(levelIndex);
    }, 700);
  }

  // rendering
  drawScene();

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

/* draw entire scene */
function drawScene() {
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // scale back because ctx scaled for DPR earlier
  const pw = canvas.width / devicePixelRatio;
  const ph = canvas.height / devicePixelRatio;

  // background gradient
  const g = ctx.createLinearGradient(0,0,0,ph);
  g.addColorStop(0,'#071029');
  g.addColorStop(1,'#0f2740');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,pw,ph);

  // draw platforms
  ctx.fillStyle = '#1b3b52';
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  for (let p of platforms) {
    ctx.fillStyle = '#183047';
    roundRect(ctx, p.x, p.y, p.w, p.h, 6, true, false);
  }

  // draw goal flag
  if (goal) {
    ctx.save();
    ctx.fillStyle = '#ffd166';
    roundRect(ctx, goal.x, goal.y, goal.w, goal.h, 6, true, false);
    // flag pole
    ctx.strokeStyle = '#fff2';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(goal.x + 8, goal.y + goal.h); ctx.lineTo(goal.x + 8, goal.y - 24); ctx.stroke();
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath(); ctx.moveTo(goal.x + 8, goal.y - 24); ctx.lineTo(goal.x + 30, goal.y - 16); ctx.lineTo(goal.x + 8, goal.y - 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // draw ball
  const g2 = ctx.createRadialGradient(ball.x-6, ball.y-8, 4, ball.x, ball.y, ball.r);
  g2.addColorStop(0,'#ffffff');
  g2.addColorStop(1, ball.color);
  ctx.fillStyle = g2;
  ctx.shadowBlur = 20;
  ctx.shadowColor = ball.color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // optional: display small debug
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.font = '12px Poppins';
  ctx.fillText(`vx:${Math.round(ball.vx)} vy:${Math.round(ball.vy)}`, 12, 42);
}

/* small helpers */
function roundRect(ctx, x, y, w, h, r, fill=true, stroke=true) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function rectCircleOverlap(rect, cx, cy, r) {
  // return true if circle intersects rect
  const rx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ry = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - rx; const dy = cy - ry;
  return (dx*dx + dy*dy) <= r*r;
}
