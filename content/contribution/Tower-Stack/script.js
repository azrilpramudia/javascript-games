const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let blocks = [];
let currentBlock;
let score = 0;
let highScore = 0;
let gameActive = false;
let gameStarted = false;
let speed = 2;
let direction = 1;

const INITIAL_WIDTH = 100;
const BLOCK_HEIGHT = 30;
const BASE_HEIGHT = canvas.height - BLOCK_HEIGHT;

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

class Block {
    constructor(x, y, width, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = BLOCK_HEIGHT;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(this.x, this.y, this.width, this.height / 3);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += speed * direction;
        if (this.x <= 0) {
            this.x = 0;
            direction = 1;
        } else if (this.x + this.width >= canvas.width) {
            this.x = canvas.width - this.width;
            direction = -1;
        }
    }
}

function init() {
    const baseBlock = new Block(
        canvas.width / 2 - INITIAL_WIDTH / 2,
        BASE_HEIGHT,
        INITIAL_WIDTH,
        colors[0]
    );
    blocks.push(baseBlock);
    drawBackground();
    baseBlock.draw();
}

function startGame() {
    document.getElementById('startScreen').classList.add('hide');
    gameStarted = true;
    gameActive = true;
    spawnNewBlock();
    gameLoop();
}

function spawnNewBlock() {
    if (!gameActive) return;
    const previousBlock = blocks[blocks.length - 1];
    const newY = previousBlock.y - BLOCK_HEIGHT;
    const colorIndex = blocks.length % colors.length;
    const startX = Math.random() > 0.5 ? 0 : canvas.width - previousBlock.width;
    currentBlock = new Block(startX, newY, previousBlock.width, colors[colorIndex]);
    direction = startX === 0 ? 1 : -1;
    speed = 2 + score * 0.1;
}

function dropBlock() {
    if (!gameActive || !currentBlock) return;
    const previousBlock = blocks[blocks.length - 1];
    const overlapStart = Math.max(currentBlock.x, previousBlock.x);
    const overlapEnd = Math.min(currentBlock.x + currentBlock.width, previousBlock.x + previousBlock.width);
    const overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth <= 0 || overlapWidth < 10) {
        currentBlock = null;
        endGame();
        return;
    }

    const trimmedBlock = new Block(overlapStart, currentBlock.y, overlapWidth, currentBlock.color);
    blocks.push(trimmedBlock);
    currentBlock = null;
    score++;
    updateScore();

    if (Math.abs(overlapWidth - previousBlock.width) < 2) {
        showPerfect(trimmedBlock.x + trimmedBlock.width / 2, trimmedBlock.y);
    }

    if (blocks.length > 10) {
        blocks.forEach(block => block.y += BLOCK_HEIGHT);
    }

    setTimeout(() => {
        if (gameActive) spawnNewBlock();
    }, 100);
}

function showPerfect(x, y) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PERFECT!', x, y - 10);
}

function updateScore() {
    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function endGame() {
    gameActive = false;
    document.getElementById('finalScore').textContent = score;
    const newHighScoreMsg = document.getElementById('newHighScore');
    newHighScoreMsg.style.display = (score === highScore && score > 0) ? 'block' : 'none';
    document.getElementById('gameOver').classList.add('show');
}

function restartGame() {
    document.getElementById('gameOver').classList.remove('show');
    document.getElementById('startScreen').classList.remove('hide');
    blocks = [];
    score = 0;
    speed = 2;
    direction = 1;
    gameStarted = false;
    gameActive = false;
    updateScore();
    init();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4FACFE');
    gradient.addColorStop(0.5, '#00F2FE');
    gradient.addColorStop(1, '#43E97B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2D3436';
    ctx.fillRect(0, BASE_HEIGHT + BLOCK_HEIGHT, canvas.width, 10);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.arc(130, 100, 40, 0, Math.PI * 2);
    ctx.arc(160, 100, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(300, 200, 25, 0, Math.PI * 2);
    ctx.arc(325, 200, 35, 0, Math.PI * 2);
    ctx.arc(350, 200, 25, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    if (!gameActive) return;
    drawBackground();
    blocks.forEach(block => block.draw());
    if (currentBlock) {
        currentBlock.update();
        currentBlock.draw();
    }
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', () => {
    if (gameStarted && gameActive) dropBlock();
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameStarted && gameActive) dropBlock();
    }
});

init();
