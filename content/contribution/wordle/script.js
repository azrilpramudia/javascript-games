class WordleGame {
    constructor() {
        this.solution = '';
        this.guesses = [];
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameOver = false;
        this.maxRows = 6;
        
        // Load saved stats
        this.stats = this.loadStats();
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateStatsDisplay();
    }

    initializeGame() {
        // Choose random solution from words.js
        this.solution = SOLUTION_WORDS[Math.floor(Math.random() * SOLUTION_WORDS.length)].toUpperCase();
        console.log('Solution:', this.solution); // For testing - remove in production
        
        // Create game grid
        this.createGameGrid();
        
        // Reset game state
        this.guesses = [];
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameOver = false;
        
        // Reset keyboard
        this.resetKeyboard();
        
        // Clear message
        this.hideMessage();
        
        // Enable restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.disabled = false;
        }
    }

    createGameGrid() {
        const gameGrid = document.getElementById('game-grid');
        gameGrid.innerHTML = '';
        
        for (let row = 0; row < this.maxRows; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'grid-row';
            
            for (let col = 0; col < 5; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                rowDiv.appendChild(tile);
            }
            
            gameGrid.appendChild(rowDiv);
        }
    }

    setupEventListeners() {
        // Physical keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            const key = e.key.toUpperCase();
            
            if (key === 'ENTER') {
                this.submitGuess();
            } else if (key === 'BACKSPACE') {
                this.deleteLetter();
            } else if (key.match(/[A-Z]/) && key.length === 1) {
                this.addLetter(key);
            }
        });

        // Virtual keyboard input
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                if (this.gameOver) return;
                
                const keyValue = key.dataset.key;
                
                if (keyValue === 'ENTER') {
                    this.submitGuess();
                } else if (keyValue === 'BACKSPACE') {
                    this.deleteLetter();
                } else {
                    this.addLetter(keyValue);
                }
            });
        });
    }

    addLetter(letter) {
        if (this.currentGuess.length < 5) {
            this.currentGuess += letter;
            this.updateCurrentRowDisplay();
        }
    }

    deleteLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateCurrentRowDisplay();
        }
    }

    updateCurrentRowDisplay() {
        const currentRowTiles = document.querySelectorAll(`[data-row="${this.currentRow}"]`);
        
        currentRowTiles.forEach((tile, index) => {
            if (index < this.currentGuess.length) {
                tile.textContent = this.currentGuess[index];
            } else {
                tile.textContent = '';
            }
        });
    }

    submitGuess() {
        // Validate guess length
        if (this.currentGuess.length !== 5) {
            this.showMessage('Not enough letters', 'error');
            return;
        }

        // Validate guess is in word list (using words.js)
        if (!VALID_GUESSES.includes(this.currentGuess.toLowerCase())) {
            this.showMessage('Not in word list', 'error');
            return;
        }

        // Process the guess
        this.guesses.push(this.currentGuess);
        this.evaluateGuessAndColorTiles();
        
        // Check win condition
        if (this.currentGuess === this.solution) {
            this.gameOver = true;
            this.updateStats(true); // Won!
            this.showMessage('Excellent! You won!', 'success');
            return;
        }
        
        // Check lose condition
        if (this.currentRow >= this.maxRows - 1) {
            this.gameOver = true;
            this.updateStats(false); // Lost!
            this.showMessage(`Game Over! The word was: ${this.solution}`, 'error');
            return;
        }
        
        // Move to next row
        this.currentRow++;
        this.currentGuess = '';
    }

    evaluateGuessAndColorTiles() {
        const currentRowTiles = document.querySelectorAll(`[data-row="${this.currentRow}"]`);
        const solutionLetters = this.solution.split('');
        const guessLetters = this.currentGuess.split('');
        
        // Count letter frequencies in solution for duplicate handling
        const solutionLetterCount = {};
        solutionLetters.forEach(letter => {
            solutionLetterCount[letter] = (solutionLetterCount[letter] || 0) + 1;
        });
        
        // Initialize results array
        const tileResults = new Array(5).fill('absent');
        
        // FIRST PASS: Mark correct positions (GREEN tiles)
        guessLetters.forEach((letter, index) => {
            if (letter === solutionLetters[index]) {
                tileResults[index] = 'correct';
                solutionLetterCount[letter]--; // Reduce available count
            }
        });
        
        // SECOND PASS: Mark present letters (YELLOW tiles)
        guessLetters.forEach((letter, index) => {
            if (tileResults[index] === 'absent' && solutionLetterCount[letter] > 0) {
                tileResults[index] = 'present';
                solutionLetterCount[letter]--; // Reduce available count
            }
        });
        
        // Apply color coding to tiles and keyboard
        tileResults.forEach((result, index) => {
            // Color the grid tile
            currentRowTiles[index].classList.add(result);
            
            // Update keyboard key status
            this.updateKeyboardKeyStatus(guessLetters[index], result);
        });
    }

    updateKeyboardKeyStatus(letter, result) {
        const keyElement = document.querySelector(`[data-key="${letter}"]`);
        if (!keyElement) return;
        
        // Don't downgrade key status (correct > present > absent)
        if (keyElement.classList.contains('correct')) return;
        if (keyElement.classList.contains('present') && result === 'absent') return;
        
        // Remove previous status and add new one
        keyElement.classList.remove('correct', 'present', 'absent');
        keyElement.classList.add(result);
    }

    resetKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
    }

    // NEW: Score tracking methods
    updateStats(won) {
        this.stats.gamesPlayed++;
        
        if (won) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
        } else {
            this.stats.currentStreak = 0;
        }
        
        this.saveStats();
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        document.getElementById('games-played').textContent = this.stats.gamesPlayed;
        
        const winPercentage = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100)
            : 0;
        document.getElementById('win-percentage').textContent = winPercentage;
        document.getElementById('current-streak').textContent = this.stats.currentStreak;
    }

    loadStats() {
        const saved = localStorage.getItem('wordle-stats');
        return saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0
        };
    }

    saveStats() {
        localStorage.setItem('wordle-stats', JSON.stringify(this.stats));
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type} show`;
        
        // Auto-hide message after 2 seconds
        setTimeout(() => {
            this.hideMessage();
        }, 2000);
    }

    hideMessage() {
        const messageElement = document.getElementById('message');
        messageElement.className = 'message';
    }
}

// Global game instance
let game;

// Global restart function
function restartGame() {
    if (game) {
        game.initializeGame();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new WordleGame();
});