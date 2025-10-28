const gameBoard = document.getElementById('gameBoard');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const winMessage = document.getElementById('winMessage');
const loseMessage = document.getElementById('loseMessage');

const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let cards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;
let timeLeft = 60;
let gameStarted = false;
let gameEnded = false;
let timerInterval;

function createCards() {
    const cardSymbols = [...symbols, ...symbols];
    cardSymbols.sort(() => Math.random() - 0.5);
    
    cards = cardSymbols.map((symbol, index) => ({
        id: index,
        symbol: symbol,
        flipped: false,
        matched: false
    }));
}

function renderBoard() {
    gameBoard.innerHTML = '';
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.id = card.id;
        
        if (card.flipped || card.matched) {
            cardEl.textContent = card.symbol;
            cardEl.classList.add('flipped');
        }
        
        if (card.matched) {
            cardEl.classList.add('matched');
        }
        
        cardEl.addEventListener('click', () => flipCard(card.id));
        gameBoard.appendChild(cardEl);
    });
}

function flipCard(cardId) {
    const card = cards[cardId];
    
    if (!gameStarted || gameEnded || card.flipped || card.matched || flippedCards.length === 2) return;
    
    card.flipped = true;
    flippedCards.push(card);
    renderBoard();
    
    if (flippedCards.length === 2) {
        moves++;
        movesEl.textContent = moves;
        
        setTimeout(() => {
            if (flippedCards[0].symbol === flippedCards[1].symbol) {
                flippedCards[0].matched = true;
                flippedCards[1].matched = true;
                matches++;
                matchesEl.textContent = matches;
                
                if (matches === symbols.length) {
                    endGame(true);
                }
            } else {
                flippedCards[0].flipped = false;
                flippedCards[1].flipped = false;
            }
            
            flippedCards = [];
            renderBoard();
        }, 1000);
    }
}

function startGame() {
    gameStarted = true;
    gameEnded = false;
    startBtn.disabled = true;
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function endGame(won) {
    gameEnded = true;
    clearInterval(timerInterval);
    
    if (won) {
        winMessage.classList.remove('hidden');
    } else {
        loseMessage.classList.remove('hidden');
    }
}

function resetGame() {
    clearInterval(timerInterval);
    moves = 0;
    matches = 0;
    timeLeft = 60;
    gameStarted = false;
    gameEnded = false;
    flippedCards = [];
    
    timerEl.textContent = timeLeft;
    movesEl.textContent = moves;
    matchesEl.textContent = matches;
    startBtn.disabled = false;
    
    winMessage.classList.add('hidden');
    loseMessage.classList.add('hidden');
    
    createCards();
    renderBoard();
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initialize game
resetGame();