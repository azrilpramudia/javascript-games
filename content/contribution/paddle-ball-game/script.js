const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 3
};

const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100
};

const computerPaddle = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100
};

let playerScore = 0;
let computerScore = 0;
let keys = {};

// Draw functions
function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawNet() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

// Update game
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Ball collision with top/bottom walls
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    // Ball collision with paddles
    if (ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y && ball.y < playerPaddle.y + playerPaddle.height) {
        ball.velocityX = -ball.velocityX;
    }

    if (ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y && ball.y < computerPaddle.y + computerPaddle.height) {
        ball.velocityX = -ball.velocityX;
    }

    // Score points
    if (ball.x < 0) {
        computerScore++;
        computerScoreEl.textContent = computerScore;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        playerScoreEl.textContent = playerScore;
        resetBall();
    }

    // Player paddle movement
    if (keys['w'] && playerPaddle.y > 0) {
        playerPaddle.y -= 7;
    }
    if (keys['s'] && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += 7;
    }

    // Computer AI
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    if (computerCenter < ball.y - 35) {
        computerPaddle.y += 5;
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y -= 5;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawBall();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerPaddle.y = mouseY - playerPaddle.height / 2;
    
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y > canvas.height - playerPaddle.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
});

gameLoop();