const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants ---
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const BIRD_X = 50; // Bird's constant x-position

const PIPE_WIDTH = 64;
const PIPE_GAP = 150; // Gap between top and bottom pipe
const PIPE_SPEED = 2.2;
const PIPE_INTERVAL = 150; // Frames between new pipes

const GRAVITY = 0.33;
const LIFT = -6.8; // Velocity on flap

// --- Game Variables ---
let bird = {
    x: BIRD_X,
    y: canvas.height / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocity: 0
};

let pipes = [];
let score = 0;
let frameCount = 0;
let gameState = 'start'; // 'start', 'playing', 'gameOver'

// Visual/UX extras
let highScore = Number(localStorage.getItem('flappy_highscore') || 0);
let groundOffset = 0; // scrolling ground
let clouds = [];
let wingPhase = 0; // bird wing animation
let scorePulse = 0; // frames left for score pulse animation

// --- Game Functions ---

/**
 * Main game loop. Updates game logic and redraws the canvas.
 */
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Keep the loop running
}

/**
 * Updates all game logic (bird position, pipes, collisions).
 */
function update() {
    // Always drift clouds for ambience
    updateClouds();

    if (gameState !== 'playing') return;

    // Animate ground and bird wing
    groundOffset = (groundOffset + PIPE_SPEED) % 48;
    wingPhase += 0.18;

    // --- Bird Logic ---
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Check for collision with ground
    const groundHeight = 80; // visual ground strip
    if (bird.y + bird.height > canvas.height - groundHeight) {
        gameOver();
    }
    // Check for collision with ceiling
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }

    // --- Pipe Logic ---
    frameCount++;

    // Add a new pipe
    if (frameCount % PIPE_INTERVAL === 0) {
        // Random Y position for the gap
        const margin = 40;
        const usable = canvas.height - groundHeight - PIPE_GAP - margin * 2;
        const topPipeHeight = Math.random() * usable + margin;
        pipes.push({
            x: canvas.width,
            topHeight: topPipeHeight,
            scored: false
        });
    }

    // Move and check pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= PIPE_SPEED;

        // Check for collision with bird
        if (
            bird.x < p.x + PIPE_WIDTH &&
            bird.x + bird.width > p.x &&
            (bird.y < p.topHeight || bird.y + bird.height > p.topHeight + PIPE_GAP)
        ) {
            gameOver();
        }

        // Check for score
        if (p.x + PIPE_WIDTH < bird.x && !p.scored) {
            score++;
            p.scored = true;
            scorePulse = 15; // animate score
        }

        // Remove pipe if it's off-screen
        if (p.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

/**
 * Draws everything on the canvas.
 */
function draw() {
    drawSky();
    drawSun();
    drawClouds();
    drawPipes();
    drawGround();
    drawBird();
    drawHud();
    drawOverlays();
}

function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#7fd3ff');
    g.addColorStop(0.55, '#66c6f5');
    g.addColorStop(1, '#b9ecff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    const x = canvas.width - 70;
    const y = 70;
    const r = 26;
    const g = ctx.createRadialGradient(x - 8, y - 8, 8, x, y, r + 24);
    g.addColorStop(0, 'rgba(255,240,160,0.9)');
    g.addColorStop(0.6, 'rgba(255,240,160,0.6)');
    g.addColorStop(1, 'rgba(255,240,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r + 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe17a';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function ensureClouds() {
    if (clouds.length) return;
    const count = 6;
    for (let i = 0; i < count; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 140 + 10,
            s: Math.random() * 0.7 + 0.5, // scale
            v: Math.random() * 0.3 + 0.1 // speed
        });
    }
}

function updateClouds() {
    ensureClouds();
    for (const c of clouds) {
        c.x -= c.v; // slow drift
        if (c.x < -120) {
            c.x = canvas.width + Math.random() * 120;
            c.y = Math.random() * 140 + 10;
            c.s = Math.random() * 0.7 + 0.5;
            c.v = Math.random() * 0.3 + 0.1;
        }
    }
}

function drawClouds() {
    ctx.save();
    for (const c of clouds) {
        const x = c.x, y = c.y, s = c.s;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        roundedCloud(x, y, 46 * s, 24 * s);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#4aa8d1';
        roundedCloud(x + 2, y + 12 * s, 40 * s, 14 * s);
        ctx.globalAlpha = 1;
    }
    ctx.restore();
}

function roundedCloud(x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, h * 0.48, 0, 0, Math.PI * 2);
    ctx.ellipse(x - w * 0.35, y + 2, w * 0.35, h * 0.32, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.35, y + 3, w * 0.38, h * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipes() {
    for (let p of pipes) {
        const cap = 12;
        // gradient green pipe
        const g = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
        g.addColorStop(0, '#1e8f32');
        g.addColorStop(0.5, '#2cab3d');
        g.addColorStop(1, '#1a7a2c');

        ctx.fillStyle = g;
        // Top pipe body
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        // Top cap
        ctx.fillStyle = '#2eb143';
        ctx.fillRect(p.x - 4, p.topHeight - cap, PIPE_WIDTH + 8, cap);

        // Bottom pipe
        const bottomY = p.topHeight + PIPE_GAP;
        ctx.fillStyle = g;
        ctx.fillRect(p.x, bottomY, PIPE_WIDTH, canvas.height - bottomY);
        // Bottom cap
        ctx.fillStyle = '#2eb143';
        ctx.fillRect(p.x - 4, bottomY, PIPE_WIDTH + 8, cap);

        // Pipe shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(p.x + PIPE_WIDTH - 6, 0, 6, p.topHeight);
        ctx.fillRect(p.x + PIPE_WIDTH - 6, bottomY, 6, canvas.height - bottomY);
    }
}

function drawGround() {
    const groundHeight = 80;
    const y = canvas.height - groundHeight;
    // ground gradient
    const g = ctx.createLinearGradient(0, y, 0, canvas.height);
    g.addColorStop(0, '#7cc56e');
    g.addColorStop(1, '#4aa84f');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, canvas.width, groundHeight);

    // top grass edge
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(0, y, canvas.width, 3);

    // repeating dirt stripes to show scrolling
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y + 18, canvas.width, groundHeight - 18);
    ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    const stripeW = 48;
    for (let x = -groundOffset; x < canvas.width + stripeW; x += stripeW) {
        ctx.fillRect(x, y + 26, 24, 10);
        ctx.fillRect(x + 12, y + 46, 24, 10);
    }
    ctx.restore();
}

function drawBird() {
    const cx = bird.x + bird.width / 2;
    const cy = bird.y + bird.height / 2;
    const angle = Math.max(-0.45, Math.min(1.0, bird.velocity * 0.08)); // tilt with velocity

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(-cx, -cy);

    // body
    const bodyGrad = ctx.createLinearGradient(bird.x, bird.y, bird.x, bird.y + bird.height);
    bodyGrad.addColorStop(0, '#ffef6c');
    bodyGrad.addColorStop(1, '#ffca45');
    roundedRect(bird.x, bird.y, bird.width, bird.height, 10, bodyGrad, '#d69119');

    // wing (flaps)
    const wp = Math.sin(wingPhase) * 6;
    roundedRect(bird.x + 6, bird.y + 10 - wp * 0.6, 18, 12, 6, '#ffd35b', '#cc9a1e');

    // eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width - 12, bird.y + 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width - 10, bird.y + 9, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = '#ff9f1a';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width - 2, bird.y + bird.height / 2 - 2);
    ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height / 2 + 2);
    ctx.lineTo(bird.x + bird.width - 2, bird.y + bird.height / 2 + 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function roundedRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function drawHud() {
    // Score with slight pulse when incrementing
    const centerX = canvas.width / 2;
    const y = 54;
    const scale = scorePulse > 0 ? 1 + scorePulse * 0.015 : 1;
    if (scorePulse > 0) scorePulse--;
    ctx.save();
    ctx.translate(centerX, y);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -y);

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String(score), centerX + 1, y + 2);
    ctx.fillStyle = '#fff';
    ctx.fillText(String(score), centerX, y);
    ctx.restore();
}

function drawOverlays() {
    if (gameState === 'start') {
        drawBanner('Tap or press Space to start');
    } else if (gameState === 'gameOver') {
        drawGameOver();
    }
}

function drawBanner(text) {
    const w = canvas.width * 0.82;
    const h = 86;
    const x = (canvas.width - w) / 2;
    const y = canvas.height * 0.42 - h / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRectPath(x, y, w, h, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, y + h / 2 + 8);
}

function roundRectPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawGameOver() {
    const w = canvas.width * 0.84;
    const h = 170;
    const x = (canvas.width - w) / 2;
    const y = canvas.height * 0.36;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRectPath(x, y, w, h, 14);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Game Over', canvas.width / 2, y + 42);

    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, y + 76);
    ctx.fillText(`Best: ${highScore}`, canvas.width / 2, y + 102);

    ctx.font = '18px Arial';
    ctx.fillText('Click or press Space to restart', canvas.width / 2, y + 136);
}

/**
 * Handles the "flap" action.
 */
function flap() {
    bird.velocity = LIFT;
    // give the wing a kick
    wingPhase += 0.8;
}

/**
 * Changes game state to 'gameOver'.
 */
function gameOver() {
    gameState = 'gameOver';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappy_highscore', String(highScore));
    }
}

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameState = 'playing';
    scorePulse = 0;
}

/**
 * Handles user input (click or spacebar).
 */
function handleInput() {
    if (gameState === 'start') {
        gameState = 'playing';
        flap(); // Give an initial flap to start
    } else if (gameState === 'playing') {
        flap();
    } else if (gameState === 'gameOver') {
        resetGame();
    }
}

// --- Event Listeners ---
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        handleInput();
    }
});

canvas.addEventListener('click', function() {
    handleInput();
});

// --- Start the Game ---
gameLoop();