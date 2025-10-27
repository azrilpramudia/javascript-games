const ROWS = 6;
const COLS = 7;
let currentPlayer = 1;
let gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let gameMode = 'player'; // 'player' or 'bot'
let gameActive = true;

function selectMode(mode) {
    gameMode = mode;
    const buttons = document.querySelectorAll('.mode-button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    newGame();
}

function newGame() {
    gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentPlayer = 1;
    gameActive = true;
    document.querySelector('.turn-indicator').textContent = 'Current Turn: Player 1';
    createBoard();
}

function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    for (let col = 0; col < COLS; col++) {
        const column = document.createElement('div');
        column.className = 'column';
        column.onclick = () => dropPiece(col);

        for (let row = ROWS - 1; row >= 0; row--) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            column.appendChild(cell);
        }
        board.appendChild(column);
    }
}

function dropPiece(col) {
    if (!gameActive) return;
    
    // Player's move
    let row = findLowestEmptyRow(col);
    if (row === -1) return; // Column is full

    gameBoard[row][col] = currentPlayer;
    updateBoard();
    
    if (checkWin(row, col)) {
        document.querySelector('.turn-indicator').textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        return;
    }

    if (checkDraw()) {
        document.querySelector('.turn-indicator').textContent = "It's a draw!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    document.querySelector('.turn-indicator').textContent = `Current Turn: Player ${currentPlayer}`;

    // Bot's move
    if (gameMode === 'bot' && currentPlayer === 2 && gameActive) {
        setTimeout(() => {
            const botCol = getBotMove();
            dropPiece(botCol);
        }, 500);
    }
}

function findLowestEmptyRow(col) {
    for (let row = 0; row < ROWS; row++) {
        if (gameBoard[row][col] === 0) {
            return row;
        }
    }
    return -1;
}

function checkDraw() {
    return gameBoard.every(row => row.every(cell => cell !== 0));
}

function getBotMove() {
    // Create a copy of the board for simulation
    function copyBoard() {
        return gameBoard.map(row => [...row]);
    }

    // Evaluate a position (higher score is better for bot)
    function evaluatePosition(board, row, col, player) {
        let score = 0;
        const directions = [
            [0, 1],  // horizontal
            [1, 0],  // vertical
            [1, 1],  // diagonal /
            [1, -1]  // diagonal \
        ];

        for (let [dx, dy] of directions) {
            // Count pieces in both directions
            let count = 1;
            let spaces = 0;
            let blocked = false;

            // Check in positive direction
            for (let i = 1; i < 4; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
                    blocked = true;
                    break;
                }
                
                if (board[newRow][newCol] === player) {
                    count++;
                } else if (board[newRow][newCol] === 0) {
                    spaces++;
                    break;
                } else {
                    blocked = true;
                    break;
                }
            }

            // Check in negative direction
            for (let i = 1; i < 4; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
                    blocked = true;
                    break;
                }
                
                if (board[newRow][newCol] === player) {
                    count++;
                } else if (board[newRow][newCol] === 0) {
                    spaces++;
                    break;
                } else {
                    blocked = true;
                    break;
                }
            }

            // Score based on the sequence
            if (count >= 4) return 100000;  // Winning move
            if (count === 3 && spaces >= 1 && !blocked) score += 100;  // Potential win
            if (count === 2 && spaces >= 2 && !blocked) score += 10;   // Building sequence
        }
        
        // Bonus for center columns
        score += Math.max(0, 3 - Math.abs(3 - col)) * 2;
        
        return score;
    }

    // Try each column and evaluate the resulting position
    const moveScores = [];
    for (let col = 0; col < COLS; col++) {
        const row = findLowestEmptyRow(col);
        if (row === -1) {
            moveScores.push(-1000000);  // Invalid move
            continue;
        }

        let score = 0;
        const boardCopy = copyBoard();
        
        // Check immediate win
        boardCopy[row][col] = 2;
        if (checkWin(row, col)) {
            return col;  // Winning move, take it immediately
        }
        
        // Check if opponent wins next move
        let opponentWinNext = false;
        for (let oppCol = 0; oppCol < COLS; oppCol++) {
            const oppRow = findLowestEmptyRow(oppCol);
            if (oppRow !== -1) {
                boardCopy[oppRow][oppCol] = 1;
                if (checkWin(oppRow, oppCol)) {
                    opponentWinNext = true;
                    if (col === oppCol) {
                        score += 80;  // Block opponent's winning move
                    }
                }
                boardCopy[oppRow][oppCol] = 0;
            }
        }
        
        // Evaluate the position
        score += evaluatePosition(boardCopy, row, col, 2);  // Evaluate for bot
        score -= evaluatePosition(boardCopy, row, col, 1);  // Consider opponent's position
        
        // Add some randomness to make the bot less predictable
        score += Math.random() * 5;
        
        moveScores.push(score);
    }

    // Choose the move with the highest score
    let bestScore = -1000000;
    let bestMoves = [];
    
    for (let col = 0; col < COLS; col++) {
        if (moveScores[col] > bestScore) {
            bestScore = moveScores[col];
            bestMoves = [col];
        } else if (moveScores[col] === bestScore) {
            bestMoves.push(col);
        }
    }
    
    // Randomly choose from equally good moves
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function updateBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.querySelector(
                `[data-row="${row}"][data-col="${col}"]`
            );
            cell.className = 'cell';
            if (gameBoard[row][col] === 1) cell.classList.add('red');
            if (gameBoard[row][col] === 2) cell.classList.add('yellow');
        }
    }
}

function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]], // horizontal
        [[1, 0], [-1, 0]], // vertical
        [[1, 1], [-1, -1]], // diagonal
        [[1, -1], [-1, 1]] // other diagonal
    ];

    for (let dir of directions) {
        const winningCells = [[row, col]];
        let count = 1;

        // Check both directions
        for (let [deltaRow, deltaCol] of dir) {
            let r = row + deltaRow;
            let c = col + deltaCol;

            while (
                r >= 0 && r < ROWS &&
                c >= 0 && c < COLS &&
                gameBoard[r][c] === currentPlayer
            ) {
                winningCells.push([r, c]);
                count++;
                r += deltaRow;
                c += deltaCol;
            }
        }

        if (count >= 4) {
            // Highlight winning cells
            winningCells.forEach(([r, c]) => {
                const cell = document.querySelector(
                    `[data-row="${r}"][data-col="${c}"]`
                );
                cell.classList.add('winner');
            });
            return true;
        }
    }
    return false;
}

function countDirection(row, col, deltaRow, deltaCol) {
    let count = 0;
    let r = row + deltaRow;
    let c = col + deltaCol;

    while (
        r >= 0 && r < ROWS &&
        c >= 0 && c < COLS &&
        gameBoard[r][c] === currentPlayer
    ) {
        count++;
        r += deltaRow;
        c += deltaCol;
    }
    return count;
}

function resetGame() {
    gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentPlayer = 1;
    gameActive = true;
    document.querySelector('.turn-indicator').textContent =
        'Current Turn: Player 1';
    // Remove winner class from all cells
    document.querySelectorAll('.cell.winner').forEach(cell => {
        cell.classList.remove('winner');
    });
    updateBoard();
}

// Initialize the game
createBoard();