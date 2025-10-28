// Game state
const gameState = {
    score: 0,
    level: 1,
    hints: 3,
    currentSequence: [],
    missingIndex: 0,
    correctAnswer: 0,
    selectedOption: null
};

// Sequence patterns
const patterns = [
    {
        name: "Arithmetic",
        generate: (level) => {
            const start = Math.floor(Math.random() * 20) + 1;
            const diff = Math.floor(Math.random() * 5) + 1;
            const length = 5 + Math.floor(level / 3);
            const sequence = [];
            
            for (let i = 0; i < length; i++) {
                sequence.push(start + i * diff);
            }
            
            return sequence;
        }
    },
    {
        name: "Geometric",
        generate: (level) => {
            const start = Math.floor(Math.random() * 5) + 1;
            const ratio = Math.floor(Math.random() * 3) + 2;
            const length = 5 + Math.floor(level / 3);
            const sequence = [];
            
            for (let i = 0; i < length; i++) {
                sequence.push(start * Math.pow(ratio, i));
            }
            
            return sequence;
        }
    },
    {
        name: "Fibonacci-like",
        generate: (level) => {
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 1;
            const length = 5 + Math.floor(level / 3);
            const sequence = [a, b];
            
            for (let i = 2; i < length; i++) {
                sequence.push(sequence[i-1] + sequence[i-2]);
            }
            
            return sequence;
        }
    },
    {
        name: "Square Numbers",
        generate: (level) => {
            const start = Math.floor(Math.random() * 5) + 1;
            const length = 5 + Math.floor(level / 3);
            const sequence = [];
            
            for (let i = 0; i < length; i++) {
                sequence.push(Math.pow(start + i, 2));
            }
            
            return sequence;
        }
    },
    {
        name: "Prime Numbers",
        generate: (level) => {
            const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
            const start = Math.floor(Math.random() * 5);
            const length = 5 + Math.floor(level / 3);
            return primes.slice(start, start + length);
        }
    }
];

// DOM elements
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const hintsElement = document.getElementById('hints');
const sequenceElement = document.getElementById('sequence');
const optionsElement = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const submitButton = document.getElementById('submit-btn');
const hintButton = document.getElementById('hint-btn');
const nextButton = document.getElementById('next-btn');

// Initialize game
function initGame() {
    updateUI();
    generateNewPuzzle();
    
    // Event listeners
    submitButton.addEventListener('click', checkAnswer);
    hintButton.addEventListener('click', useHint);
    nextButton.addEventListener('click', generateNewPuzzle);
}

// Generate a new puzzle
function generateNewPuzzle() {
    // Clear feedback
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    
    // Select a random pattern
    const patternIndex = Math.floor(Math.random() * patterns.length);
    const pattern = patterns[patternIndex];
    
    // Generate sequence
    gameState.currentSequence = pattern.generate(gameState.level);
    
    // Select a random position to hide (not first or last)
    gameState.missingIndex = Math.floor(Math.random() * (gameState.currentSequence.length - 2)) + 1;
    gameState.correctAnswer = gameState.currentSequence[gameState.missingIndex];
    
    // Generate options (correct answer + 4 distractors)
    const options = [gameState.correctAnswer];
    
    // Generate distractors
    while (options.length < 5) {
        const offset = Math.floor(Math.random() * 10) - 5;
        const distractor = gameState.correctAnswer + offset;
        
        if (distractor > 0 && !options.includes(distractor)) {
            options.push(distractor);
        }
    }
    
    // Shuffle options
    shuffleArray(options);
    
    // Render sequence and options
    renderSequence();
    renderOptions(options);
    
    // Reset selected option
    gameState.selectedOption = null;
}

// Render the sequence with missing number
function renderSequence() {
    sequenceElement.innerHTML = '';
    
    gameState.currentSequence.forEach((num, index) => {
        const numberBox = document.createElement('div');
        numberBox.className = 'number-box';
        
        if (index === gameState.missingIndex) {
            numberBox.classList.add('missing');
            numberBox.textContent = '?';
            numberBox.dataset.index = index;
        } else {
            numberBox.textContent = num;
        }
        
        sequenceElement.appendChild(numberBox);
    });
}

// Render the answer options
function renderOptions(options) {
    optionsElement.innerHTML = '';
    
    options.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.className = 'option';
        optionButton.textContent = option;
        optionButton.dataset.value = option;
        
        optionButton.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.option').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            optionButton.classList.add('selected');
            gameState.selectedOption = parseInt(option);
        });
        
        optionsElement.appendChild(optionButton);
    });
}

// Check the selected answer
function checkAnswer() {
    if (gameState.selectedOption === null) {
        feedbackElement.textContent = 'Please select an answer!';
        feedbackElement.className = 'feedback incorrect';
        return;
    }
    
    if (gameState.selectedOption === gameState.correctAnswer) {
        // Correct answer
        feedbackElement.textContent = 'Correct! Well done!';
        feedbackElement.className = 'feedback correct';
        
        // Update score
        gameState.score += 10 * gameState.level;
        scoreElement.textContent = gameState.score;
        
        // Level up every 3 correct answers
        if (gameState.score % 30 === 0) {
            gameState.level++;
            levelElement.textContent = gameState.level;
            feedbackElement.textContent += ` Level up! You're now at level ${gameState.level}.`;
        }
        
        // Highlight correct answer
        document.querySelectorAll('.option').forEach(btn => {
            if (parseInt(btn.dataset.value) === gameState.correctAnswer) {
                btn.style.background = '#4caf50';
            }
        });
        
        // Reveal the missing number in sequence
        document.querySelector('.number-box.missing').textContent = gameState.correctAnswer;
        document.querySelector('.number-box.missing').style.background = '#4caf50';
    } else {
        // Incorrect answer
        feedbackElement.textContent = `Incorrect. The right answer was ${gameState.correctAnswer}.`;
        feedbackElement.className = 'feedback incorrect';
        
        // Highlight correct and incorrect answers
        document.querySelectorAll('.option').forEach(btn => {
            const value = parseInt(btn.dataset.value);
            if (value === gameState.correctAnswer) {
                btn.style.background = '#4caf50';
            } else if (value === gameState.selectedOption) {
                btn.style.background = '#f44336';
            }
        });
        
        // Reveal the missing number in sequence
        document.querySelector('.number-box.missing').textContent = gameState.correctAnswer;
        document.querySelector('.number-box.missing').style.background = '#4caf50';
    }
}

// Use a hint
function useHint() {
    if (gameState.hints > 0) {
        gameState.hints--;
        hintsElement.textContent = gameState.hints;
        
        // Eliminate two wrong answers
        const wrongOptions = Array.from(document.querySelectorAll('.option'))
            .filter(btn => parseInt(btn.dataset.value) !== gameState.correctAnswer)
            .slice(0, 2);
        
        wrongOptions.forEach(btn => {
            btn.style.opacity = '0.3';
            btn.style.pointerEvents = 'none';
        });
        
        feedbackElement.textContent = 'Two wrong answers have been eliminated!';
        feedbackElement.className = 'feedback hint';
    } else {
        feedbackElement.textContent = 'No hints remaining!';
        feedbackElement.className = 'feedback incorrect';
    }
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    hintsElement.textContent = gameState.hints;
}

// Utility function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);