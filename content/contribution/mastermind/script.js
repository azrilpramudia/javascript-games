document.addEventListener("DOMContentLoaded", () => {

    // --- Constants and State ---
    const COLORS = ["color-1", "color-2", "color-3", "color-4", "color-5", "color-6"];
    const CODE_LENGTH = 4;
    const MAX_ATTEMPTS = 10;

    let secretCode = [];
    let currentAttempt = 0;
    let currentGuess = [];
    let selectedColor = null;

    // --- DOM Elements ---
    const gameBoard = document.getElementById("game-board");
    const colorPalette = document.getElementById("color-palette");
    const checkButton = document.getElementById("check-button");
    const secretCodeContainer = document.getElementById("secret-code");
    
    // Modal Elements
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const newGameButton = document.getElementById("new-game-button");

    // --- Game Initialization ---
    function init() {
        console.log("Initializing game...");
        currentAttempt = 0;
        currentGuess = new Array(CODE_LENGTH).fill(null);
        selectedColor = null;
        checkButton.disabled = true;
        
        generateSecretCode();
        createGameBoard();
        createColorPalette();
        
        // Hide modal and secret code
        modal.classList.add("hidden");
        revealSecretCode(false);
    }

    function generateSecretCode() {
        secretCode = [];
        for (let i = 0; i < CODE_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * COLORS.length);
            secretCode.push(COLORS[randomIndex]);
        }
        console.log("Secret Code:", secretCode); // For debugging
    }

    function createColorPalette() {
        colorPalette.innerHTML = ""; // Clear old palette
        COLORS.forEach(color => {
            const colorOption = document.createElement("div");
            colorOption.classList.add("color-option", color);
            colorOption.dataset.color = color;
            colorOption.addEventListener("click", () => handleColorPick(colorOption));
            colorPalette.appendChild(colorOption);
        });
    }

    function createGameBoard() {
        gameBoard.innerHTML = ""; // Clear old board
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const row = document.createElement("div");
            row.classList.add("guess-row");
            row.dataset.attempt = i;

            // 1. Create Guess Pegs
            const pegRow = document.createElement("div");
            pegRow.classList.add("peg-row");
            for (let j = 0; j < CODE_LENGTH; j++) {
                const peg = document.createElement("div");
                peg.classList.add("peg", "guess");
                peg.dataset.index = j;
                peg.addEventListener("click", () => handlePegClick(peg, i, j));
                pegRow.appendChild(peg);
            }
            
            // 2. Create Feedback Pegs
            const feedbackContainer = document.createElement("div");
            feedbackContainer.classList.add("feedback-pegs");
            for (let j = 0; j < CODE_LENGTH; j++) {
                const feedbackPeg = document.createElement("div");
                feedbackPeg.classList.add("feedback-peg");
                feedbackContainer.appendChild(feedbackPeg);
            }

            row.appendChild(pegRow);
            row.appendChild(feedbackContainer);
            gameBoard.appendChild(row);
        }
        updateActiveRow();
    }

    // --- Event Handlers ---

    function handleColorPick(colorOption) {
        // Remove 'selected' from previously selected
        const oldSelected = document.querySelector(".color-option.selected");
        if (oldSelected) {
            oldSelected.classList.remove("selected");
        }
        
        // Add 'selected' to new one
        colorOption.classList.add("selected");
        selectedColor = colorOption.dataset.color;
    }

    function handlePegClick(peg, attempt, index) {
        // Only allow clicking on the current attempt's row
        if (attempt !== currentAttempt) return;

        if (selectedColor) {
            // Set the peg's color
            peg.className = `peg guess ${selectedColor}`; // Reset classes
            currentGuess[index] = selectedColor;
            
            // Check if the guess is complete
            checkButton.disabled = !currentGuess.every(color => color !== null);
        }
    }

    checkButton.addEventListener("click", handleSubmitGuess);
    newGameButton.addEventListener("click", init);

    // --- Game Logic ---

    function handleSubmitGuess() {
        // 1. Evaluate the guess
        const { blackPegs, whitePegs } = evaluateGuess(currentGuess, secretCode);

        // 2. Render the feedback
        renderFeedback(blackPegs, whitePegs);

        // 3. Check for win or loss
        if (blackPegs === CODE_LENGTH) {
            // WIN
            showGameEndModal(true);
            revealSecretCode(true);
        } else if (currentAttempt === MAX_ATTEMPTS - 1) {
            // LOSS
            showGameEndModal(false);
            revealSecretCode(true);
        } else {
            // 4. Move to the next attempt
            currentAttempt++;
            currentGuess = new Array(CODE_LENGTH).fill(null);
            checkButton.disabled = true;
            updateActiveRow();
        }
    }

    function evaluateGuess(guess, code) {
        let blackPegs = 0;
        let whitePegs = 0;

        // Create copies of the arrays to avoid changing the originals
        const guessCopy = [...guess];
        const codeCopy = [...code];

        // 1. First pass: Check for "Black Pegs" (correct color, correct position)
        for (let i = codeCopy.length - 1; i >= 0; i--) {
            if (guessCopy[i] === codeCopy[i]) {
                blackPegs++;
                // Remove the matched items so they aren't counted again
                codeCopy.splice(i, 1);
                guessCopy.splice(i, 1);
            }
        }

        // 2. Second pass: Check for "White Pegs" (correct color, wrong position)
        // We use the modified copies that only contain non-black-peg colors
        for (let i = 0; i < guessCopy.length; i++) {
            const color = guessCopy[i];
            const foundIndex = codeCopy.indexOf(color);

            if (foundIndex !== -1) {
                whitePegs++;
                // Remove the matched item from the code copy so it's not double-counted
                codeCopy.splice(foundIndex, 1);
            }
        }

        return { blackPegs, whitePegs };
    }

    function renderFeedback(blackPegs, whitePegs) {
        const feedbackContainer = document.querySelector(`.guess-row[data-attempt="${currentAttempt}"] .feedback-pegs`);
        const feedbackPegs = feedbackContainer.children;
        
        let pegIndex = 0;
        for (let i = 0; i < blackPegs; i++) {
            feedbackPegs[pegIndex].classList.add("black");
            pegIndex++;
        }
        for (let i = 0; i < whitePegs; i++) {
            feedbackPegs[pegIndex].classList.add("white");
            pegIndex++;
        }
    }

    // --- UI Helper Functions ---

    function updateActiveRow() {
        document.querySelectorAll(".guess-row").forEach((row, index) => {
            if (index === currentAttempt) {
                row.classList.add("active");
            } else {
                row.classList.remove("active");
            }
        });
    }

    function revealSecretCode(show) {
        const pegs = secretCodeContainer.children;
        for(let i = 0; i < CODE_LENGTH; i++) {
            if (show) {
                pegs[i].className = `peg solution ${secretCode[i]}`;
            } else {
                pegs[i].className = "peg solution"; // Reset to empty
            }
        }
    }

    function showGameEndModal(didWin) {
        modal.classList.remove("hidden");
        if (didWin) {
            modalTitle.textContent = "You Won!";
            modalMessage.textContent = `You guessed the code in ${currentAttempt + 1} attempts!`;
        } else {
            modalTitle.textContent = "Game Over";
            modalMessage.textContent = "You ran out of attempts. Better luck next time!";
        }
    }

    // --- Start the game ---
    init();
});