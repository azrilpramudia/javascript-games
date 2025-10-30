const colors = [
    { name: 'red', hex: '#ef4444' },
    { name: 'blue', hex: '#3b82f6' },
    { name: 'green', hex: '#22c55e' },
    { name: 'yellow', hex: '#eab308' },
    { name: 'purple', hex: '#a855f7' },
    { name: 'orange', hex: '#f97316' },
    { name: 'pink', hex: '#ec4899' },
    { name: 'cyan', hex: '#06b6d4' },
    { name: 'lime', hex: '#84cc16' }
];

let gameState = {
    score: 0,
    level: 1,
    highScore: 0,
    sequence: [],
    playerSequence: [],
    isPlaying: false,
    timeLeft: 100,
    timerInterval: null
};

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const sequenceDisplay = document.getElementById('sequenceDisplay');
const orbGrid = document.getElementById('orbGrid');
const startBtn = document.getElementById('startBtn');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const timerFill = document.getElementById('timerFill');

// Load high score
const savedHighScore = localStorage.getItem('colorChainHighScore');
if (savedHighScore) {
    gameState.highScore = parseInt(savedHighScore);
    highScoreEl.textContent = gameState.highScore;
}

function createOrbGrid() {
    orbGrid.innerHTML = '';
    colors.forEach(color => {
        const orb = document.createElement('button');
        orb.className = 'orb';
        orb.style.background = color.hex;
        orb.dataset.color = color.name;
        orb.addEventListener('click', () => handleOrbClick(color.name, orb));
        orbGrid.appendChild(orb);
    });
}

function generateSequence() {
    const length = Math.min(2 + Math.floor(gameState.level / 2), 6);
    gameState.sequence = [];
    for (let i = 0; i < length; i++) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        gameState.sequence.push(randomColor);
    }
}

function displaySequence() {
    sequenceDisplay.innerHTML = '';
    gameState.sequence.forEach((color, index) => {
        setTimeout(() => {
            const orb = document.createElement('div');
            orb.className = 'sequence-orb';
            orb.style.background = color.hex;
            sequenceDisplay.appendChild(orb);
        }, index * 300);
    });
}

function handleOrbClick(colorName, orbElement) {
    if (!gameState.isPlaying) return;

    gameState.playerSequence.push(colorName);
    const currentIndex = gameState.playerSequence.length - 1;
    
    if (gameState.sequence[currentIndex].name === colorName) {
        orbElement.classList.add('correct');
        setTimeout(() => orbElement.classList.remove('correct'), 300);
        
        if (gameState.playerSequence.length === gameState.sequence.length) {
            gameState.score += gameState.level * 10;
            gameState.level++;
            updateUI();
            setTimeout(nextRound, 1000);
        }
    } else {
        orbElement.classList.add('wrong');
        setTimeout(() => orbElement.classList.remove('wrong'), 300);
        endGame();
    }
}

function startTimer() {
    gameState.timeLeft = 100;
    timerFill.style.width = '100%';
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft -= 0.5;
        timerFill.style.width = gameState.timeLeft + '%';
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 50);
}

function nextRound() {
    gameState.playerSequence = [];
    generateSequence();
    displaySequence();
    startTimer();
}

function startGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.isPlaying = true;
    gameState.playerSequence = [];
    
    gameOverEl.classList.add('hidden');
    startBtn.classList.add('hidden');
    
    updateUI();
    nextRound();
}

function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('colorChainHighScore', gameState.highScore);
        highScoreEl.textContent = gameState.highScore;
    }
    
    finalScoreEl.textContent = gameState.score;
    gameOverEl.classList.remove('hidden');
}

function updateUI() {
    scoreEl.textContent = gameState.score;
    levelEl.textContent = gameState.level;
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    startBtn.classList.remove('hidden');
    startGame();
});

createOrbGrid();
