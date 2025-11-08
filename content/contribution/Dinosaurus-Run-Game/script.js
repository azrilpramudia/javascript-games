// ==============================
// Dino Run - script.js
// Features: Auto day/night, clouds parallax, moving ground
// Robust: image fallback, safe RAF loop, input (touch/keyboard)
// ==============================

/* ====== DOM ====== */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const btnStart = document.getElementById('btnStart');
const btnPause = document.getElementById('btnPause');
const btnRestart = document.getElementById('btnRestart');
const scoreEl = document.getElementById('score');
const hiscoreEl = document.getElementById('hiscore');

/* ====== Settings & State ====== */
const STATE = {
  running: false,
  paused: false,
  gameOver: false,
  lastTime: 0,
  accumulator: 0
};

const CONFIG = {
  groundY: 200,          // y position of ground top (in canvas px)
  gravity: 0.9,
  baseSpeed: 6,
  dayNightInterval: 20000, // ms
  cloudCount: 4,
  canvasWidth: 900,
  canvasHeight: 240
};

let game = {
  dino: { x: 60, y: CONFIG.groundY - 42, w: 44, h: 42, vy: 0, onGround: true, frame: 0, frameTimer: 0 },
  obstacles: [],
  clouds: [],
  groundOffset: 0,
  speed: CONFIG.baseSpeed,
  score: 0,
  hiscore: Number(localStorage.getItem('dino-hiscore') || 0),
  isNight: false,
  skyColor: '#f0f0f0',
  groundColor: '#444'
};

/* ====== Assets (with fallback) ====== */
const assets = {
  dinoImg: new Image(),
  cactusImg: new Image(),
  loaded: { dino:false, cactus:false }
};
// put your images in assets/ if available
assets.dinoImg.src = 'assets/dino.png';
assets.cactusImg.src = 'assets/cactus.png';

assets.dinoImg.onload = () => assets.loaded.dino = true;
assets.cactusImg.onload = () => assets.loaded.cactus = true;

/* ====== Canvas DPI fit & responsive sizing ====== */
function fitCanvas() {
  // keep internal size constant, but scale with devicePixelRatio
  const cssWidth = canvas.clientWidth || CONFIG.canvasWidth;
  const ratio = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.width = Math.round(cssWidth * ratio);
  canvas.height = Math.round((cssWidth * (CONFIG.canvasHeight/CONFIG.canvasWidth)) * ratio);
  canvas.style.height = (cssWidth * (CONFIG.canvasHeight/CONFIG.canvasWidth)) + 'px';
  ctx.setTransform(ratio,0,0,ratio,0,0); // so drawing uses CSS pixels
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

/* ====== Init clouds ====== */
function initClouds() {
  game.clouds = [];
  for (let i=0;i<CONFIG.cloudCount;i++){
    game.clouds.push({
      x: Math.random() * CONFIG.canvasWidth,
      y: 20 + Math.random() * 80,
      speed: 0.4 + Math.random() * 0.9,
      w: 44 + Math.random()*30,
      h: 20 + Math.random()*10
    });
  }
}

/* ====== Spawning obstacles ====== */
let spawnTimer = 1000;
function maybeSpawnCactus(dt) {
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    // choose size
    const sizes = [{w:18,h:36},{w:26,h:46},{w:40,h:60}];
    const s = sizes[Math.floor(Math.random()*sizes.length)];
    game.obstacles.push({
      x: CONFIG.canvasWidth + 20,
      y: CONFIG.groundY - s.h,
      w: s.w,
      h: s.h
    });
    // reset with some randomness & scale with speed
    spawnTimer = 700 + Math.random()*900 - Math.min(game.speed*40, 500);
  }
}

/* ====== Day/Night toggle ====== */
function applyDayNight(isNight){
  game.isNight = isNight;
  if (isNight) {
    game.skyColor = '#111';
    game.groundColor = '#999';
  } else {
    game.skyColor = '#f0f0f0';
    game.groundColor = '#444';
  }
}
setInterval(() => applyDayNight(!game.isNight), CONFIG.dayNightInterval);
applyDayNight(false);

/* ====== Input ====== */
function jump(){
  if (game.gameOver) return;
  if (!STATE.running) { startGame(); return; }
  if (game.dino.onGround) {
    game.dino.vy = -16;
    game.dino.onGround = false;
  }
}
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); jump(); }
  if (e.code === 'KeyP') togglePause();
  if (e.code === 'Enter') restartGame();
});
canvas.addEventListener('pointerdown', jump);
canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); jump(); }, {passive:false});

/* ====== Controls ====== */
btnStart.addEventListener('click', ()=>{ if(!STATE.running) startGame(); });
btnPause.addEventListener('click', togglePause);
btnRestart.addEventListener('click', restartGame);

function togglePause(){
  if (!STATE.running || game.gameOver) return;
  STATE.paused = !STATE.paused;
  if (!STATE.paused) {
    // resume loop
    STATE.lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

/* ====== Game lifecycle ====== */
function startGame(){
  if (STATE.running && !game.gameOver) return;
  // reset state
  game.dino.x = 60;
  game.dino.y = CONFIG.groundY - 42;
  game.dino.vy = 0;
  game.dino.onGround = true;
  game.obstacles = [];
  game.score = 0;
  game.speed = CONFIG.baseSpeed;
  game.gameOver = false;
  STATE.running = true;
  STATE.paused = false;
  spawnTimer = 800;
  initClouds();
  fitCanvas();
  STATE.lastTime = performance.now();
  requestAnimationFrame(loop);
}

function restartGame(){
  STATE.running = false; // stop previous loops safely
  game.obstacles = [];
  startGame();
}

function endGame(){
  game.gameOver = true;
  STATE.running = false;
  // update hiscore
  if (game.score > game.hiscore) {
    game.hiscore = game.score;
    localStorage.setItem('dino-hiscore', String(game.hiscore));
  }
  hiscoreEl.textContent = game.hiscore;
  // brief UI notification (you can replace by modal)
  setTimeout(()=> alert(`Game Over!\nSkor kamu: ${game.score}`), 50);
}

/* ====== Collision ====== */
function rectsOverlap(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* ====== Draw helpers ====== */
function drawGround(ctx){
  // moving pattern to simulate ground scroll
  const groundH = 20;
  ctx.fillStyle = game.groundColor;
  ctx.fillRect(0, CONFIG.groundY, CONFIG.canvasWidth, groundH);

  // dashed pattern (parallax) uses groundOffset
  ctx.fillStyle = (game.isNight ? '#444' : '#e6e6e6');
  const tileW = 24;
  for (let x = - (game.groundOffset % tileW); x < CONFIG.canvasWidth; x += tileW) {
    ctx.fillRect(x, CONFIG.groundY, tileW/3, 6);
  }
}

function drawClouds(ctx, dt){
  ctx.fillStyle = (game.isNight ? '#888' : '#dcdcdc');
  for (let c of game.clouds){
    // simple ellipse cloud
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w*0.6, c.h*0.7, 0, 0, Math.PI*2);
    ctx.fill();
    // move
    c.x -= c.speed * (game.speed/CONFIG.baseSpeed) * (dt/16.67);
    if (c.x + c.w < 0) c.x = CONFIG.canvasWidth + Math.random()*80;
  }
}

/* ====== Draw Dino & Cactus (with fallback) ====== */
function drawDino(ctx, dt){
  // animate frame when on ground
  if (!game.dino.onGround) {
    // jumping frame (single)
    if (assets.loaded.dino) ctx.drawImage(assets.dinoImg, game.dino.x, game.dino.y, game.dino.w, game.dino.h);
    else {
      // fallback rectangle with small eye
      ctx.fillStyle = "#333";
      ctx.fillRect(game.dino.x, game.dino.y, game.dino.w, game.dino.h);
      ctx.fillStyle = "#fff";
      ctx.fillRect(game.dino.x + game.dino.w - 12, game.dino.y + 8, 6, 6);
    }
  } else {
    // running animation (2-frame mimic)
    game.dino.frameTimer += dt;
    if (game.dino.frameTimer > 120) {
      game.dino.frame = (game.dino.frame + 1) % 2;
      game.dino.frameTimer = 0;
    }
    if (assets.loaded.dino) {
      // if only one image available, just draw it; else you can replace this with sprite sheet logic
      ctx.drawImage(assets.dinoImg, game.dino.x, game.dino.y, game.dino.w, game.dino.h);
      // slight leg offset illusion
      if (game.dino.frame === 1) {
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(game.dino.x+6, game.dino.y + game.dino.h, 12, 6);
      }
    } else {
      // fallback simple dino: body + two legs toggling
      ctx.fillStyle = "#333";
      ctx.fillRect(game.dino.x, game.dino.y, game.dino.w, game.dino.h);
      // eye
      ctx.fillStyle = "#fff";
      ctx.fillRect(game.dino.x + game.dino.w - 12, game.dino.y + 8, 6, 6);
      // legs (animated)
      ctx.fillStyle = "#222";
      if (game.dino.frame === 0) {
        ctx.fillRect(game.dino.x+6, game.dino.y + game.dino.h, 6, 8);
        ctx.fillRect(game.dino.x + game.dino.w - 14, game.dino.y + game.dino.h, 6, 10);
      } else {
        ctx.fillRect(game.dino.x+6, game.dino.y + game.dino.h, 6, 10);
        ctx.fillRect(game.dino.x + game.dino.w - 14, game.dino.y + game.dino.h, 6, 8);
      }
    }
  }
}

function drawCacti(ctx){
  for (let c of game.obstacles){
    if (assets.loaded.cactus) {
      ctx.drawImage(assets.cactusImg, c.x, c.y, c.w, c.h);
    } else {
      ctx.fillStyle = "#1b5e20";
      ctx.fillRect(c.x, c.y, c.w, c.h);
      // small arms
      ctx.fillRect(c.x - 6, c.y + 10, 6, 12);
      ctx.fillRect(c.x + c.w, c.y + 8, 6, 10);
    }
  }
}

/* ====== Update & Render Loop (single RAF safely) ====== */
function loop(now) {
  if (!STATE.running) return; // if stopped, don't continue
  if (STATE.paused) { STATE.lastTime = now; requestAnimationFrame(loop); return; }

  const dt = Math.min(60, now - (STATE.lastTime || now)); // clamp dt
  STATE.lastTime = now;

  // Clear using sky color
  ctx.clearRect(0,0, canvas.width, canvas.height);
  // draw sky (fill CSS-px width/height)
  ctx.fillStyle = game.skyColor;
  ctx.fillRect(0,0, CONFIG.canvasWidth, CONFIG.canvasHeight);

  // update clouds
  drawClouds(ctx, dt);

  // update ground offset
  game.groundOffset += game.speed * (dt/16.67);
  drawGround(ctx);

  // Dino physics
  game.dino.y += game.dino.vy * (dt/16.67);
  game.dino.vy += CONFIG.gravity * (dt/16.67);
  // land check
  if (game.dino.y >= CONFIG.groundY - game.dino.h) {
    game.dino.y = CONFIG.groundY - game.dino.h;
    game.dino.vy = 0;
    game.dino.onGround = true;
  } else game.dino.onGround = false;

  // draw dino
  drawDino(ctx, dt);

  // update obstacles
  for (let i = game.obstacles.length - 1; i >= 0; i--) {
    const o = game.obstacles[i];
    o.x -= game.speed * (dt/16.67);
    // collision
    if (rectsOverlap({x:game.dino.x, y:game.dino.y, w:game.dino.w, h:game.dino.h}, o)) {
      endGame();
      return; // stop early to avoid multiple alerts
    }
    // offscreen
    if (o.x + o.w < -20) {
      game.obstacles.splice(i,1);
      game.score += 1;
      scoreEl.textContent = game.score;
      // increase speed every few points to raise difficulty
      if (game.score % 6 === 0) game.speed += 0.4;
    }
  }

  // spawn new cacti
  maybeSpawnCactus(dt);

  // draw cacti
  drawCacti(ctx);

  // HUD
  scoreEl.textContent = game.score;
  hiscoreEl.textContent = game.hiscore;

  // request next frame
  requestAnimationFrame(loop);
}

/* ====== Start up tasks ====== */
function setup(){
  // ensure the logical canvas size matches our CONFIG for drawing math
  // we'll draw in CSS pixels (ctx transform already applied)
  canvas.style.width = '100%';
  // fitCanvas already set transform; but we also want internal drawing area consistent with CONFIG
  // We'll set a virtual viewport for our drawing math:
  canvas.getContext('2d').resetTransform?.(); // safe attempt if available
  // We already called fitCanvas() earlier and set transform to devicePixelRatio.
  initClouds();
  // place initial obstacle so game doesn't feel empty
  game.obstacles = [{ x: CONFIG.canvasWidth - 60, y: CONFIG.groundY - 36, w: 18, h: 36 }];
  scoreEl.textContent = game.score;
  hiscoreEl.textContent = game.hiscore;
}
setup();

/* ====== Safe preload: wait small time for images but don't block forever ====== */
let preloadTimeout = setTimeout(()=>{
  // start without waiting if user hasn't interacted
  // we do nothing here; user must press "Mulai" to begin
}, 600);

