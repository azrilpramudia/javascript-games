const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants ---
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const BIRD_X = 50; // Bird's constant x-position

const PIPE_WIDTH = 60;
const PIPE_GAP = 150; // Gap between top and bottom pipe
const PIPE_SPEED = 2;
const PIPE_INTERVAL = 150; // Frames between new pipes

const GRAVITY = 0.3;
const LIFT = -6; // Velocity on flap

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
    if (gameState !== 'playing') return;

    // --- Bird Logic ---
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Check for collision with ground
    if (bird.y + bird.height > canvas.height) {
        gameOver();
    }
    // Check for collision with ceiling (optional, but good)
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }

    // --- Pipe Logic ---
    frameCount++;

    // Add a new pipe
    if (frameCount % PIPE_INTERVAL === 0) {
        // Random Y position for the gap
        const topPipeHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
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
    // Clear the canvas (sky blue background)
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Bird (yellow)
    ctx.fillStyle = '#fafa00';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Draw Pipes (green)
    ctx.fillStyle = '#228B22';
    for (let p of pipes) {
        // Top pipe
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        // Bottom pipe
        let bottomPipeY = p.topHeight + PIPE_GAP;
        ctx.fillRect(p.x, bottomPipeY, PIPE_WIDTH, canvas.height - bottomPipeY);
    }

    // Draw Score
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        ctx.strokeText(score, canvas.width / 2, 50);
        ctx.fillText(score, canvas.width / 2, 50);
    }

    // Draw Messages
    if (gameState === 'start') {
        ctx.font = '25px Arial';
        ctx.strokeText('Click or Press Space to Start', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Click or Press Space to Start', canvas.width / 2, canvas.height / 2);
    }

    if (gameState === 'gameOver') {
        ctx.font = '40px Arial';
        ctx.strokeText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '25px Arial';
        ctx.strokeText('Click to Restart', canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 20);
    }
}

/**
 * Handles the "flap" action.
 */
function flap() {
    bird.velocity = LIFT;
}

/**
 * Changes game state to 'gameOver'.
 */
function gameOver() {
    gameState = 'gameOver';
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