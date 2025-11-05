(function() {
    // Game constants
    const COLS = 8;
    const ROWS = 12;
    const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
    
    // Game elements
    const gameBoard = document.getElementById('gameBoard');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const startBtn = document.getElementById('startBtn');
    const gameOverScreen = document.getElementById('gameOver');
    const finalScoreDisplay = document.getElementById('finalScore');
    const restartBtn = document.getElementById('restartBtn');
    
    // Control buttons
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const dropBtn = document.getElementById('dropBtn');

    // Game state
    let score = 0;
    let level = 1;
    let grid = [];
    let currentPiece = null;
    let gameLoop = null;
    let dropSpeed = 1000;
    let isGameOver = false;

    // Initialize the game grid
    function initGrid() {
        grid = Array(ROWS).fill().map(() => Array(COLS).fill(null));
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'block';
                cell.style.gridRow = row + 1;
                cell.style.gridColumn = col + 1;
                gameBoard.appendChild(cell);
            }
        }
    }

    // Create a new piece
    function createPiece() {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
            color: color,
            position: { col: Math.floor(COLS/2) - 1, row: 0 },
            blocks: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 1, col: 0 }
            ]
        };
    }

    // Update the visual board
    function updateBoard() {
        // Clear all blocks
        const blocks = document.querySelectorAll('.block');
        blocks.forEach(block => block.className = 'block');

        // Draw grid blocks
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (grid[row][col]) {
                    const index = row * COLS + col;
                    blocks[index].classList.add(grid[row][col]);
                }
            }
        }

        // Draw current piece
        if (currentPiece) {
            currentPiece.blocks.forEach(block => {
                const row = currentPiece.position.row + block.row;
                const col = currentPiece.position.col + block.col;
                if (row >= 0) {
                    const index = row * COLS + col;
                    blocks[index].classList.add(currentPiece.color);
                }
            });
        }
    }

    // Check if a position is valid
    function isValidMove(piece, newPosition) {
        return piece.blocks.every(block => {
            const row = newPosition.row + block.row;
            const col = newPosition.col + block.col;
            return row >= 0 && row < ROWS && col >= 0 && col < COLS && !grid[row][col];
        });
    }

    // Lock the current piece in place
    function lockPiece() {
        currentPiece.blocks.forEach(block => {
            const row = currentPiece.position.row + block.row;
            const col = currentPiece.position.col + block.col;
            if (row >= 0) grid[row][col] = currentPiece.color;
        });
    }

    // Check for and clear matches
    function checkMatches() {
        let matched = new Set();

        // Check horizontal matches
        for (let row = 0; row < ROWS; row++) {
            let count = 1;
            let color = grid[row][0];
            
            for (let col = 1; col < COLS; col++) {
                if (grid[row][col] && grid[row][col] === color) {
                    count++;
                    if (count >= 3) {
                        for (let i = 0; i < count; i++) {
                            matched.add(row * COLS + (col - i));
                        }
                    }
                } else {
                    count = 1;
                    color = grid[row][col];
                }
            }
        }

        // Check vertical matches
        for (let col = 0; col < COLS; col++) {
            let count = 1;
            let color = grid[0][col];
            
            for (let row = 1; row < ROWS; row++) {
                if (grid[row][col] && grid[row][col] === color) {
                    count++;
                    if (count >= 3) {
                        for (let i = 0; i < count; i++) {
                            matched.add((row - i) * COLS + col);
                        }
                    }
                } else {
                    count = 1;
                    color = grid[row][col];
                }
            }
        }

        // Clear matched blocks and update score
        if (matched.size > 0) {
            const blocks = document.querySelectorAll('.block');
            matched.forEach(index => {
                const row = Math.floor(index / COLS);
                const col = index % COLS;
                grid[row][col] = null;
                blocks[index].classList.add('matched');
            });

            score += matched.size * 100;
            scoreDisplay.textContent = score;

            // Level up every 1000 points
            const newLevel = Math.floor(score / 1000) + 1;
            if (newLevel > level) {
                level = newLevel;
                levelDisplay.textContent = level;
                dropSpeed = Math.max(100, 1000 - (level - 1) * 100);
            }

            setTimeout(() => {
                // Drop remaining blocks
                for (let col = 0; col < COLS; col++) {
                    let writeRow = ROWS - 1;
                    for (let row = ROWS - 1; row >= 0; row--) {
                        if (grid[row][col]) {
                            if (writeRow !== row) {
                                grid[writeRow][col] = grid[row][col];
                                grid[row][col] = null;
                            }
                            writeRow--;
                        }
                    }
                }
                updateBoard();
                checkMatches();
            }, 300);

            return true;
        }

        return false;
    }

    // Game loop
    function update() {
        const newPosition = {
            row: currentPiece.position.row + 1,
            col: currentPiece.position.col
        };

        if (isValidMove(currentPiece, newPosition)) {
            currentPiece.position = newPosition;
        } else {
            lockPiece();
            if (!checkMatches()) {
                currentPiece = createPiece();
                if (!isValidMove(currentPiece, currentPiece.position)) {
                    gameOver();
                    return;
                }
            }
        }

        updateBoard();
    }

    // Move piece left/right
    function movePiece(direction) {
        if (!currentPiece || isGameOver) return;
        
        const newPosition = {
            row: currentPiece.position.row,
            col: currentPiece.position.col + direction
        };

        if (isValidMove(currentPiece, newPosition)) {
            currentPiece.position = newPosition;
            updateBoard();
        }
    }

    // Rotate piece
    function rotatePiece() {
        if (!currentPiece || isGameOver) return;

        const rotated = {
            ...currentPiece,
            blocks: currentPiece.blocks.map(block => ({
                row: -block.col,
                col: block.row
            }))
        };

        if (isValidMove(rotated, currentPiece.position)) {
            currentPiece.blocks = rotated.blocks;
            updateBoard();
        }
    }

    // Quick drop
    function quickDrop() {
        if (!currentPiece || isGameOver) return;
        
        while (isValidMove(currentPiece, {
            row: currentPiece.position.row + 1,
            col: currentPiece.position.col
        })) {
            currentPiece.position.row++;
        }
        update();
    }

    // Game over
    function gameOver() {
        isGameOver = true;
        clearInterval(gameLoop);
        gameOverScreen.classList.remove('hidden');
        finalScoreDisplay.textContent = score;
    }

    // Start new game
    function startGame() {
        // Reset game state
        score = 0;
        level = 1;
        dropSpeed = 1000;
        isGameOver = false;
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        gameOverScreen.classList.add('hidden');

        // Clear and initialize the grid
        initGrid();
        currentPiece = createPiece();
        updateBoard();

        // Start game loop
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, dropSpeed);
    }

    // Event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    leftBtn.addEventListener('click', () => movePiece(-1));
    rightBtn.addEventListener('click', () => movePiece(1));
    rotateBtn.addEventListener('click', rotatePiece);
    dropBtn.addEventListener('click', quickDrop);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                movePiece(-1);
                break;
            case 'ArrowRight':
                movePiece(1);
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case 'ArrowDown':
                quickDrop();
                break;
        }
    });

    // Initialize the game
    initGrid();
})();