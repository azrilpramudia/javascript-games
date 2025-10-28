
const player = document.getElementById('player');
const gameContainer = document.querySelector('.game-container');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const finalScoreDisplay = document.getElementById('finalScore');
const finalHighScoreDisplay = document.getElementById('finalHighScore');

let isJumping = false;
let isSliding = false;
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let obstacleSpeed = 2;
let obstacleInterval;
let scoreInterval;
let obstacles = [];

highScoreDisplay.textContent = highScore;


function createCloud() {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    const size = Math.random() * 40 + 40;
    cloud.style.width = size + 'px';
    cloud.style.height = size * 0.6 + 'px';
    cloud.style.top = Math.random() * 150 + 20 + 'px';
    cloud.style.left = '900px';
    cloud.style.animationDuration = (Math.random() * 20 + 30) + 's';
    gameContainer.appendChild(cloud);
    setTimeout(() => cloud.remove(), 50000);
}

// Create initial clouds
for (let i = 0; i < 3; i++) {
    setTimeout(createCloud, i * 10000);
}
setInterval(createCloud, 15000);

// === PLAYER ACTIONS ===
function jump() {
    if (!isJumping && !isSliding && gameRunning) {
        isJumping = true;
        player.classList.add('jumping');
        setTimeout(() => {
            player.classList.remove('jumping');
            isJumping = false;
        }, 600);
    }
}

function slide() {
    if (!isSliding && !isJumping && gameRunning) {
        isSliding = true;
        player.classList.add('sliding');
        setTimeout(() => {
            player.classList.remove('sliding');
            isSliding = false;
        }, 600);
    }
}

// === CONTROLS ===
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        // If game hasn't started yet, clicking space will start it
        if (!gameRunning && startScreen.style.display !== 'none') {
            startGame();
        } else {
            jump();
        }
    } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        slide();
    }
});

// === OBSTACLES ===
function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';

    const random = Math.random();
    if (random > 0.6) {
        obstacle.classList.add('obstacle-bird');
        obstacle.innerHTML = `
            <div class="bird-body">
                <div class="bird-wing"></div>
                <div class="bird-wing"></div>
            </div>
        `;
    } else {
        obstacle.innerHTML = '<div class="obstacle-cactus"></div>';
    }

    const duration = 3 / obstacleSpeed;
    obstacle.style.animationDuration = duration + 's';

    gameContainer.appendChild(obstacle);
    obstacles.push(obstacle);

    setTimeout(() => {
        obstacle.remove();
        obstacles = obstacles.filter(o => o !== obstacle);
    }, duration * 1000);
}

// === COLLISION CHECK ===
function checkCollision() {
    const playerRect = player.getBoundingClientRect();

    for (let obstacle of obstacles) {
        const obstacleRect = obstacle.getBoundingClientRect();

        if (!(playerRect.right < obstacleRect.left + 10 ||
              playerRect.left > obstacleRect.right - 10 ||
              playerRect.bottom < obstacleRect.top + 10 ||
              playerRect.top > obstacleRect.bottom - 10)) {
            endGame();
            return;
        }
    }

    if (gameRunning) {
        requestAnimationFrame(checkCollision);
    }
}

// === SCORING ===
function updateScore() {
    score++;
    scoreDisplay.textContent = score;

    if (score % 100 === 0) {
        obstacleSpeed += 0.2;
    }
}

// === GAME LOOP ===
function startGame() {
    startScreen.style.display = 'none'; // Hide start screen
    gameRunning = true;
    score = 0;
    obstacleSpeed = 2;
    scoreDisplay.textContent = score;
    gameOverScreen.classList.remove('show');

    // Clear previous obstacles
    obstacles.forEach(o => o.remove());
    obstacles = [];

    obstacleInterval = setInterval(() => {
        createObstacle();
    }, 2000);

    scoreInterval = setInterval(updateScore, 100);

    checkCollision();
}

function endGame() {
    gameRunning = false;
    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = highScore;
    }

    finalScoreDisplay.textContent = score;
    finalHighScoreDisplay.textContent = highScore;
    gameOverScreen.classList.add('show');
}

function restartGame() {
    gameOverScreen.classList.remove('show');
    startGame();
}

// === INFO MESSAGE ===
setTimeout(() => {
    if (!gameRunning) {
        console.log('Press SPACE or click START GAME to begin!');
    }
}, 100);

