const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    velocity: 0,
    gravity: 0.6,
    jump: -12
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
let score = 0;
let gameStarted = false;
let gameRunning = true;

// Create pipe
function createPipe() {
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomY: pipeHeight + pipeGap
    });
}

// Draw bird
function drawBird() {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    });
}

// Update game
function update() {
    if (!gameRunning || !gameStarted) return;

    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Update pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= 2;
        
        // Score when passing pipe
        if (pipe.x + pipeWidth < bird.x && !pipe.scored) {
            score++;
            scoreElement.textContent = score;
            pipe.scored = true;
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    // Create new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }

    // Check collisions
    checkCollisions();
}

// Check collisions
function checkCollisions() {
    // Ground and ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver();
    }

    // Pipes
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x) {
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                gameOver();
            }
        }
    });
}

// Game over
function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 80);
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPipes();
    drawBird();
    
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE or TAP to start!', canvas.width / 2, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls
function jump() {
    if (!gameStarted) {
        gameStarted = true;
        return;
    }
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
    if (e.code === 'KeyR' && !gameRunning) {
        location.reload();
    }
});

canvas.addEventListener('click', jump);

// Start game
gameLoop();