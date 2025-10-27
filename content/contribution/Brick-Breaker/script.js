const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let game = {
    score: 0,
    lives: 3,
    isRunning: false,
    ballLaunched: false,
    animationId: null,
    totalBricks: 0,
    bricksRemaining: 0
};

// Paddle
const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 40,
    width: 120,
    height: 15,
    speed: 8,
    dx: 0
};

// Ball with speed mechanics
const ball = {
    x: canvas.width / 2,
    y: paddle.y - 10,
    radius: 8,
    baseSpeed: 4,
    currentSpeed: 4,
    maxSpeed: 8,
    speedIncrement: 0.10,
    bounceCount: 0,
    bouncesForCapIncrease: 10,
    dx: 0,
    dy: 0
};

// Bricks
const brick = {
    rows: 5,
    cols: 10,
    width: 70,
    height: 25,
    padding: 10,
    offsetX: 35,
    offsetY: 60,
    visible: [],
    colors: []
};

// Colors for different brick types
const brickColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

// Initialize bricks with random pattern
function initBricks() {
    brick.visible = [];
    brick.colors = [];
    game.totalBricks = 0;
    game.bricksRemaining = 0;
    
    for (let row = 0; row < brick.rows; row++) {
        brick.visible[row] = [];
        brick.colors[row] = [];
        for (let col = 0; col < brick.cols; col++) {
            const hasBrick = Math.random() < 0.8;
            brick.visible[row][col] = hasBrick;
            
            if (hasBrick) {
                game.totalBricks++;
                game.bricksRemaining++;
                brick.colors[row][col] = brickColors[Math.floor(Math.random() * brickColors.length)];
            }
        }
    }
    
    // Ensure at least 30 bricks
    if (game.totalBricks < 30) {
        for (let i = 0; i < 30 - game.totalBricks; i++) {
            const row = Math.floor(Math.random() * brick.rows);
            const col = Math.floor(Math.random() * brick.cols);
            if (!brick.visible[row][col]) {
                brick.visible[row][col] = true;
                brick.colors[row][col] = brickColors[Math.floor(Math.random() * brickColors.length)];
                game.bricksRemaining++;
            }
        }
        game.totalBricks = game.bricksRemaining;
    }
    
    updateBricksDisplay();
}

// Draw paddle
function drawPaddle() {
    ctx.save();
    
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fill();
    
    ctx.restore();
}

// Draw ball
function drawBall() {
    ctx.save();
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#667eea');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
}

// Draw bricks
function drawBricks() {
    for (let row = 0; row < brick.rows; row++) {
        for (let col = 0; col < brick.cols; col++) {
            if (brick.visible[row][col]) {
                const brickX = brick.offsetX + col * (brick.width + brick.padding);
                const brickY = brick.offsetY + row * (brick.height + brick.padding);
                
                ctx.save();
                
                ctx.fillStyle = brick.colors[row][col];
                ctx.beginPath();
                ctx.roundRect(brickX, brickY, brick.width, brick.height, 5);
                ctx.fill();
                
                const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brick.height);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fill();
                
                ctx.restore();
            }
        }
    }
}

// Move paddle
function movePaddle() {
    paddle.x += paddle.dx;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Increase ball speed
function increaseBallSpeed() {
    ball.bounceCount++;
    
    // Gradually increase speed until current max cap
    if (ball.currentSpeed < ball.maxSpeed) {
        ball.currentSpeed += ball.speedIncrement;
        
        // Cap at maxSpeed
        if (ball.currentSpeed > ball.maxSpeed) {
            ball.currentSpeed = ball.maxSpeed;
        }
        
        // Update ball velocity to match new speed
        const currentVelocity = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (currentVelocity > 0) {
            ball.dx = (ball.dx / currentVelocity) * ball.currentSpeed;
            ball.dy = (ball.dy / currentVelocity) * ball.currentSpeed;
        }
    }
    
    // After 10 bounces at max speed, increase the cap
    if (ball.bounceCount >= ball.bouncesForCapIncrease && ball.currentSpeed >= ball.maxSpeed) {
        ball.bounceCount = 0;
        ball.maxSpeed += 1;
        
        // Continue increasing speed with new cap
        ball.currentSpeed += ball.speedIncrement;
        
        // Update ball velocity
        const currentVelocity = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (currentVelocity > 0) {
            ball.dx = (ball.dx / currentVelocity) * ball.currentSpeed;
            ball.dy = (ball.dy / currentVelocity) * ball.currentSpeed;
        }
    }
}

// Move ball
function moveBall() {
    if (!game.ballLaunched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
        return;
    }
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (left and right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
        playSound('wall');
    }
    
    // Top wall collision
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
        playSound('wall');
    }
    
    // Paddle collision
    if (ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {
        
        // Calculate hit position on paddle (-1 to 1)
        const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        
        // Adjust angle based on hit position
        const angle = hitPos * Math.PI / 3; // Max 60 degrees
        
        ball.dx = ball.currentSpeed * Math.sin(angle);
        ball.dy = -ball.currentSpeed * Math.cos(angle);
        
        // Ensure minimum vertical speed
        if (Math.abs(ball.dy) < 2) {
            ball.dy = ball.dy > 0 ? 2 : -2;
        }
        
        ball.y = paddle.y - ball.radius;
        increaseBallSpeed();
        playSound('paddle');
    }
    
    // Bottom wall - lose life
    if (ball.y + ball.radius > canvas.height) {
        game.lives--;
        updateLives();
        
        if (game.lives > 0) {
            resetBall();
            playSound('lose');
        } else {
            gameOver();
        }
    }
}

// Check brick collision
function checkBrickCollision() {
    for (let row = 0; row < brick.rows; row++) {
        for (let col = 0; col < brick.cols; col++) {
            if (brick.visible[row][col]) {
                const brickX = brick.offsetX + col * (brick.width + brick.padding);
                const brickY = brick.offsetY + row * (brick.height + brick.padding);
                
                if (ball.x + ball.radius > brickX &&
                    ball.x - ball.radius < brickX + brick.width &&
                    ball.y + ball.radius > brickY &&
                    ball.y - ball.radius < brickY + brick.height) {
                    
                    brick.visible[row][col] = false;
                    game.bricksRemaining--;
                    updateBricksDisplay();
                    
                    const ballTop = ball.y - ball.radius;
                    const ballBottom = ball.y + ball.radius;
                    const ballLeft = ball.x - ball.radius;
                    const ballRight = ball.x + ball.radius;
                    
                    const brickTop = brickY;
                    const brickBottom = brickY + brick.height;
                    const brickLeft = brickX;
                    const brickRight = brickX + brick.width;
                    
                    const overlapTop = ballBottom - brickTop;
                    const overlapBottom = brickBottom - ballTop;
                    const overlapLeft = ballRight - brickLeft;
                    const overlapRight = brickRight - ballLeft;
                    
                    const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);
                    
                    if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                        ball.dy *= -1;
                    } else {
                        ball.dx *= -1;
                    }
                    
                    game.score += 10;
                    updateScore();
                    playSound('brick');
                    
                    if (game.bricksRemaining === 0) {
                        victory();
                    }
                    
                    return;
                }
            }
        }
    }
}

// Reset ball
function resetBall() {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dx = 0;
    ball.dy = 0;
    ball.currentSpeed = ball.baseSpeed;
    ball.maxSpeed = 8;
    ball.bounceCount = 0;
    game.ballLaunched = false;
}

// Launch ball
function launchBall() {
    if (!game.ballLaunched) {
        game.ballLaunched = true;
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        ball.dx = ball.currentSpeed * Math.sin(angle);
        ball.dy = -ball.currentSpeed * Math.cos(angle);
    }
}

// Update UI
function updateScore() {
    document.getElementById('score').textContent = game.score;
}

function updateLives() {
    document.getElementById('lives').textContent = game.lives;
}

function updateBricksDisplay() {
    document.getElementById('bricks').textContent = game.bricksRemaining;
}

// Victory
function victory() {
    game.isRunning = false;
    cancelAnimationFrame(game.animationId);
    
    document.getElementById('victoryScore').textContent = game.score;
    document.getElementById('victory').classList.remove('hidden');
}

// Game over
function gameOver() {
    game.isRunning = false;
    cancelAnimationFrame(game.animationId);
    
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Restart game
function restartGame() {
    game.score = 0;
    game.lives = 3;
    
    updateScore();
    updateLives();
    
    initBricks();
    resetBall();
    
    paddle.x = canvas.width / 2 - 60;
    
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('victory').classList.add('hidden');
    game.isRunning = true;
    gameLoop();
}

// Sound effects (simple beep sounds)
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'paddle':
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.1;
            break;
        case 'brick':
            oscillator.frequency.value = 500;
            gainNode.gain.value = 0.1;
            break;
        case 'wall':
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.05;
            break;
        case 'lose':
            oscillator.frequency.value = 100;
            gainNode.gain.value = 0.2;
            break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    drawBricks();
    drawPaddle();
    drawBall();
    
    // Show "Press SPACE" message if ball not launched
    if (!game.ballLaunched) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to launch', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}

// Game loop
function gameLoop() {
    if (!game.isRunning) return;
    
    movePaddle();
    moveBall();
    checkBrickCollision();
    draw();
    
    game.animationId = requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        paddle.dx = -paddle.speed;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        paddle.dx = paddle.speed;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        launchBall();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
        e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
        paddle.dx = 0;
    }
});

// Mouse controls
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;
    
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

canvas.addEventListener('click', () => {
    launchBall();
});

// Button events
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('newGameBtn').addEventListener('click', restartGame);

// Initialize and start game
initBricks();
updateScore();
updateLives();
game.isRunning = true;
gameLoop();