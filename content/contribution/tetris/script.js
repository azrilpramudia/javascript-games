// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // --- Game Setup & Constants ---
    const canvas = document.getElementById('gameBoard');
    const context = canvas.getContext('2d');
    const nextCanvas = document.getElementById('nextPieceCanvas');
    const nextContext = nextCanvas.getContext('2d');
    
    const scoreElement = document.getElementById('score');
    const linesElement = document.getElementById('lines');
    const levelElement = document.getElementById('level');
    const startButton = document.getElementById('startButton');
    const messageOverlay = document.getElementById('messageOverlay');
    const messageText = document.getElementById('messageText');
    const finalScoreElement = document.getElementById('finalScore');
    
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30; // 30px per block
    const NEXT_CANVAS_SIZE = 120; // 4x4 grid at 30px
    
    // Set canvas dimensions
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    
    // Set next piece canvas dimensions
    nextCanvas.width = NEXT_CANVAS_SIZE;
    nextCanvas.height = NEXT_CANVAS_SIZE;

    // Colors for the Tetrominoes
    const COLORS = {
        'I': '#00f0f0', // Cyan
        'J': '#0000f0', // Blue
        'L': '#f0a000', // Orange
        'O': '#f0f000', // Yellow
        'S': '#00f000', // Green
        'T': '#a000f0', // Purple
        'Z': '#f00000'  // Red
    };
    
    // Tetromino shapes
    const TETROMINOES = {
        'I': [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        'J': [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        'L': [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        'O': [
            [1, 1],
            [1, 1]
        ],
        'S': [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        'T': [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        'Z': [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ]
    };
    
    // --- Game State Variables ---
    let board;
    let currentPiece;
    let nextPiece;
    let score;
    let lines;
    let level;
    let isPlaying;
    let gameLoopId;
    let lastTime;
    let dropCounter;
    let dropInterval;

    // Scoring system
    const linePoints = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines

    // --- Game Functions ---

    /**
     * Initializes or resets the game state.
     */
    function initGame() {
        // Create an empty 2D array for the board
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        
        score = 0;
        lines = 0;
        level = 0;
        isPlaying = true;
        lastTime = 0;
        dropCounter = 0;
        dropInterval = 1000; // 1 second per drop at level 0
        
        nextPiece = getRandomPiece();
        spawnNewPiece();
        
        updateUI();
        
        // Hide game over message
        messageOverlay.classList.remove('show');
        startButton.textContent = 'Reset Game';

        // Stop any existing game loop before starting a new one
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
        }
        gameLoop(0); // Start the game loop
    }

    /**
     * The main game loop using requestAnimationFrame.
     * @param {number} time - The current timestamp provided by requestAnimationFrame.
     */
    function gameLoop(time) {
        if (!isPlaying) return;

        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {
            playerDrop();
        }

        draw();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    /**
     * Draws the entire game state (board and current piece).
     */
    function draw() {
        // Clear the main canvas
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the locked pieces on the board
        drawMatrix(board, { x: 0, y: 0 }, context);
        
        // Draw the currently falling piece
        drawMatrix(currentPiece.shape, currentPiece.pos, context, currentPiece.color);
        
        // Draw grid lines
        drawGrid();
    }

    /**
     * Draws grid lines on the main canvas.
     */
    function drawGrid() {
        context.strokeStyle = '#2a2a4e'; // Dark grid color
        context.lineWidth = 1;

        for (let x = 0; x <= canvas.width; x += BLOCK_SIZE) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        for (let y = 0; y <= canvas.height; y += BLOCK_SIZE) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }
    }
    
    /**
     * Draws a matrix (board or piece) onto a given context.
     * @param {number[][]} matrix - The 2D array to draw.
     * @param {{x: number, y: number}} offset - The {x, y} position to start drawing from.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     * @param {string} [color] - The color to use (for pieces). If not provided, uses board colors.
     */
    function drawMatrix(matrix, offset, ctx, color) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const blockColor = color || COLORS[value]; // Use provided color or lookup from board
                    ctx.fillStyle = blockColor;
                    ctx.fillRect((offset.x + x) * BLOCK_SIZE,
                                 (offset.y + y) * BLOCK_SIZE,
                                 BLOCK_SIZE, BLOCK_SIZE);
                    
                    // Add a slight bevel effect
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.strokeRect((offset.x + x) * BLOCK_SIZE + 2,
                                   (offset.y + y) * BLOCK_SIZE + 2,
                                   BLOCK_SIZE - 4, BLOCK_SIZE - 4);
                }
            });
        });
    }
    
    /**
     * Draws the next piece on the next-piece canvas.
     */
    function drawNextPiece() {
        // Clear the next-piece canvas
        nextContext.fillStyle = '#000';
        nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        const shape = nextPiece.shape;
        const color = nextPiece.color;
        
        // Center the piece in the small canvas
        const scale = BLOCK_SIZE * 0.8; // Slightly smaller blocks for next piece
        const offsetX = (nextCanvas.width - shape[0].length * scale) / 2;
        const offsetY = (nextCanvas.height - shape.length * scale) / 2;

        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    nextContext.fillStyle = color;
                    nextContext.fillRect(offsetX + x * scale,
                                         offsetY + y * scale,
                                         scale, scale);
                    
                    nextContext.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    nextContext.strokeRect(offsetX + x * scale + 2,
                                           offsetY + y * scale + 2,
                                           scale - 4, scale - 4);
                }
            });
        });
    }

    /**
     * Generates a new random piece.
     * @returns {{shape: number[][], color: string, pos: {x: number, y: number}}}
     */
    function getRandomPiece() {
        const pieces = 'I' + 'J' + 'L' + 'O' + 'S' + 'T' + 'Z';
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        const shape = TETROMINOES[type];
        const color = COLORS[type];
        
        return {
            shape: shape,
            color: color,
            type: type, // Store type for locking
            pos: { x: 0, y: 0 }
        };
    }

    /**
     * Spawns the next piece onto the game board.
     */
    function spawnNewPiece() {
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();
        
        // Set start position (centered horizontally)
        currentPiece.pos.x = Math.floor((COLS - currentPiece.shape[0].length) / 2);
        currentPiece.pos.y = 0;
        
        drawNextPiece();
        
        // Check for Game Over
        if (checkCollision(board, currentPiece)) {
            gameOver();
        }
    }

    /**
     * Handles the player-controlled drop (soft drop).
     */
    function playerDrop() {
        if (!isPlaying) return;
        
        currentPiece.pos.y++;
        if (checkCollision(board, currentPiece)) {
            // Collision detected, move back up and lock
            currentPiece.pos.y--;
            lockPiece();
            spawnNewPiece();
        }
        dropCounter = 0; // Reset drop timer
    }
    
    /**
     * Handles player movement (left/right).
     * @param {number} dir - Direction to move (-1 for left, 1 for right).
     */
    function playerMove(dir) {
        if (!isPlaying) return;

        currentPiece.pos.x += dir;
        if (checkCollision(board, currentPiece)) {
            // Collision detected, move back
            currentPiece.pos.x -= dir;
        }
    }

    /**
     * Handles player rotation.
     */
    function playerRotate() {
        if (!isPlaying) return;

        const originalShape = currentPiece.shape;
        const rotatedShape = rotateMatrix(originalShape);
        
        const originalPos = currentPiece.pos.x;
        let offset = 1;
        
        currentPiece.shape = rotatedShape;
        
        // Wall kick logic
        while (checkCollision(board, currentPiece)) {
            currentPiece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1)); // 1, -1, 2, -2...
            
            // If offset is too large, rotation is impossible
            if (Math.abs(offset) > currentPiece.shape[0].length) {
                currentPiece.shape = originalShape; // Revert rotation
                currentPiece.pos.x = originalPos;   // Revert position
                return; // Exit function
            }
        }
    }
    
    /**
     * Rotates a given matrix (piece shape) 90 degrees clockwise.
     * @param {number[][]} matrix - The matrix to rotate.
     * @returns {number[][]} The new rotated matrix.
     */
    function rotateMatrix(matrix) {
        const N = matrix.length;
        const newMatrix = Array.from({ length: N }, () => Array(N).fill(0));
        
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                newMatrix[x][N - 1 - y] = matrix[y][x];
            }
        }
        return newMatrix;
    }

    /**
     * Handles the "hard drop" (space bar).
     */
    function playerHardDrop() {
        if (!isPlaying) return;
        
        // Keep moving down until a collision is detected
        while (!checkCollision(board, currentPiece)) {
            currentPiece.pos.y++;
        }
        // Move back up one step (to the last valid position)
        currentPiece.pos.y--;
        
        lockPiece();
        spawnNewPiece();
        dropCounter = 0; // Reset drop timer
    }

    /**
     * Checks for collision between a piece and the board boundaries or other locked pieces.
     * @param {number[][]} gameBoard - The main game board.
     * @param {{shape: number[][], pos: {x: number, y: number}}} piece - The piece to check.
     * @returns {boolean} True if there is a collision, false otherwise.
     */
    function checkCollision(gameBoard, piece) {
        const { shape, pos } = piece;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape.length; x++) {
                if (shape[y][x] !== 0) { // If it's a block of the piece
                    const newX = pos.x + x;
                    const newY = pos.y + y;
                    
                    // Check wall collisions
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }
                    // Check floor collision (handled by newY >= ROWS)
                    
                    // Check collision with other locked pieces
                    // Make sure newY is non-negative before checking board
                    if (newY >= 0 && gameBoard[newY][newX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Locks the current piece onto the board.
     */
    function lockPiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardX = currentPiece.pos.x + x;
                    const boardY = currentPiece.pos.y + y;
                    // Only lock pieces that are within the board (prevents game over flicker)
                    if (boardY >= 0) {
                        board[boardY][boardX] = currentPiece.type;
                    }
                }
            });
        });
        
        // After locking, check for line clears
        clearLines();
    }

    /**
     * Checks for and clears completed lines from the board.
     */
    function clearLines() {
        let linesCleared = 0;
        
        // Iterate from the bottom row up
        for (let y = ROWS - 1; y >= 0; y--) {
            // Check if the row is full
            if (board[y].every(value => value !== 0)) {
                // Row is full
                linesCleared++;
                
                // Remove the row
                const removedRow = board.splice(y, 1)[0];
                // Add a new empty row at the top
                board.unshift(Array(COLS).fill(0));
                
                // Since we removed a row, we need to check the same 'y' index again
                y++;
            }
        }
        
        // Update score and level if lines were cleared
        if (linesCleared > 0) {
            score += linePoints[linesCleared] * (level + 1);
            lines += linesCleared;
            
            // Update level: increase level every 10 lines
            level = Math.floor(lines / 10);
            
            // Update drop speed
            // Speeds up by 10% per level, capped at a minimum interval
            dropInterval = Math.max(100, 1000 - (level * 100));
            
            updateUI();
        }
    }

    /**
     * Updates the Score, Lines, and Level display.
     */
    function updateUI() {
        scoreElement.textContent = score;
        linesElement.textContent = lines;
        levelElement.textContent = level;
    }

    /**
     * Ends the game.
     */
    function gameOver() {
        isPlaying = false;
        cancelAnimationFrame(gameLoopId); // Stop the loop
        
        // Show game over message
        messageText.textContent = "GAME OVER";
        finalScoreElement.textContent = `Score: ${score}`;
        messageOverlay.classList.add('show');
        
        startButton.textContent = 'Play Again?';
    }

    // --- Event Listeners ---
    
    /**
     * Handles keyboard input.
     * @param {KeyboardEvent} event - The keyboard event.
     */
    function handleKeyDown(event) {
        if (!isPlaying) return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault(); // Prevent page scrolling
                playerMove(-1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                playerMove(1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                playerDrop();
                break;
            case 'ArrowUp':
                event.preventDefault();
                playerRotate();
                break;
            case ' ': // Space bar
                event.preventDefault();
                playerHardDrop();
                break;
        }
    }
    
    // Listen for key presses
    document.addEventListener('keydown', handleKeyDown);

    // Listen for start/reset button click
    startButton.addEventListener('click', () => {
        initGame();
    });
    
    // --- Initial UI Setup (pre-game) ---
    // Show a "Press Start" message initially
    messageText.textContent = "Press Start";
    finalScoreElement.textContent = "to Play";
    messageOverlay.classList.add('show');
    drawGrid(); // Draw the empty grid before start
});
