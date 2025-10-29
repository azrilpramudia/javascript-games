document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const gameOverScreen = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');

    // --- Game Constants ---
    const TILE_SIZE = 28; // Each tile is 28x28 pixels
    const ROWS = 21;
    const COLS = 18;
    
    // Adjust canvas size to fit grid perfectly
    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;

    // Colors
    const WALL_COLOR = '#0000FF'; // Blue
    const PELLET_COLOR = '#FFFF00'; // Yellow
    const POWER_PELLET_COLOR = '#FFFFFF'; // White
    const GHOST_COLOR = '#FF0000'; // Red (Blinky)
    const FLEE_GHOST_COLOR = '#0000AA'; // Dark Blue
    const PACMAN_COLOR = '#FFFF00'; // Yellow

    // Maze Layout: 
    // 0 = Wall, 1 = Pellet, 2 = Empty, 3 = Power Pellet, 4 = Ghost Spawn, 5 = Pac-Man Spawn
    let map = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0],
        [0,3,0,0,1,0,0,1,0,0,1,0,0,1,0,0,3,0],
        [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,1,0,1,0,0,0,0,1,0,1,0,0,1,0],
        [0,1,1,1,1,0,1,1,0,0,1,1,0,1,1,1,1,0],
        [0,0,0,0,1,0,0,2,0,0,2,0,0,1,0,0,0,0],
        [0,0,0,0,1,0,2,2,2,2,2,2,0,1,0,0,0,0],
        [0,1,1,1,1,1,2,0,4,4,0,2,1,1,1,1,1,0],
        [0,0,0,0,1,0,2,0,0,0,0,2,0,1,0,0,0,0],
        [0,0,0,0,1,0,2,2,2,2,2,2,0,1,0,0,0,0],
        [0,0,0,0,1,0,0,2,0,0,2,0,0,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0],
        [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],
        [0,3,1,1,1,0,0,1,1,1,1,0,0,1,1,1,3,0],
        [0,0,0,1,1,0,0,1,0,0,1,0,0,1,1,0,0,0],
        [0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
    
    // --- Game State ---
    let score = 0;
    let lives = 3;
    let totalPellets = 0;
    let pelletsEaten = 0;
    let isFleeing = false;
    let fleeTimer = 0;
    let gameRunning = true;
    let pacman;
    let blinky; // Our one ghost
    
    // Pac-Man mouth animation
    let mouthOpen = 0;
    
    // --- Entity Classes ---
    class Entity {
        constructor(x, y, radius, speed) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.speed = speed;
            this.direction = { x: 0, y: 0 };
            this.nextDirection = { x: 0, y: 0 };
        }

        // Get the grid tile the entity is on
        getTile() {
            return {
                col: Math.floor(this.x / TILE_SIZE),
                row: Math.floor(this.y / TILE_SIZE)
            };
        }

        // Check if a move to (x, y) is valid (not a wall)
        canMove(x, y) {
            // Check all 4 corners of the entity's hitbox
            const corners = [
                { x: x - this.radius, y: y - this.radius },
                { x: x + this.radius, y: y - this.radius },
                { x: x - this.radius, y: y + this.radius },
                { x: x + this.radius, y: y + this.radius }
            ];

            for (const corner of corners) {
                const col = Math.floor(corner.x / TILE_SIZE);
                const row = Math.floor(corner.y / TILE_SIZE);
                
                // Check map bounds
                if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
                    return false;
                }
                // Check for wall
                if (map[row][col] === 0) {
                    return false;
                }
            }
            return true;
        }
        
        // Tries to move the entity
        move() {
            let newX = this.x + this.nextDirection.x * this.speed;
            let newY = this.y + this.nextDirection.y * this.speed;

            // Try to turn using the nextDirection
            if (this.canMove(newX, newY)) {
                this.direction = { ...this.nextDirection };
                this.x = newX;
                this.y = newY;
            } 
            // If can't turn, keep going in the current direction
            else {
                newX = this.x + this.direction.x * this.speed;
                newY = this.y + this.direction.y * this.speed;
                if (this.canMove(newX, newY)) {
                    this.x = newX;
                    this.y = newY;
                }
            }
        }
    }

    class Pacman extends Entity {
        constructor(x, y, radius, speed) {
            super(x, y, radius, speed);
            this.angle = 0; // For drawing the mouth
        }

        draw(ctx) {
            // Update mouth animation
            mouthOpen += 0.1;
            const mouthAngle = (Math.abs(Math.sin(mouthOpen)) * 0.2) + 0.05; // 0.05 to 0.25
            
            // Update rotation based on direction
            if (this.direction.x === 1) this.angle = 0;
            else if (this.direction.x === -1) this.angle = Math.PI;
            else if (this.direction.y === 1) this.angle = Math.PI / 2;
            else if (this.direction.y === -1) this.angle = Math.PI * 1.5;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            ctx.fillStyle = PACMAN_COLOR;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, mouthAngle * Math.PI, (2 - mouthAngle) * Math.PI);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    class Ghost extends Entity {
        constructor(x, y, radius, speed, color) {
            super(x, y, radius, speed);
            this.color = color;
            this.state = 'chasing'; // 'chasing', 'fleeing', 'eaten'
            this.direction = { x: 1, y: 0 }; // Start moving right
        }

        draw(ctx) {
            const bodyColor = this.state === 'fleeing' ? FLEE_GHOST_COLOR : this.color;
            ctx.fillStyle = bodyColor;
            
            // Body
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, Math.PI, 0);
            // Bottom "scallops"
            ctx.lineTo(this.x + this.radius, this.y + this.radius);
            ctx.lineTo(this.x + this.radius * 0.66, this.y + this.radius * 0.5);
            ctx.lineTo(this.x + this.radius * 0.33, this.y + this.radius);
            ctx.lineTo(this.x, this.y + this.radius * 0.5);
            ctx.lineTo(this.x - this.radius * 0.33, this.y + this.radius);
            ctx.lineTo(this.x - this.radius * 0.66, this.y + this.radius * 0.5);
            ctx.lineTo(this.x - this.radius, this.y + this.radius);
            ctx.closePath();
            ctx.fill();

            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.1, this.radius * 0.2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.3, this.y - this.radius * 0.1, this.radius * 0.2, 0, 2 * Math.PI);
            ctx.fill();
        }

        // AI for the ghost
        updateAI(target) {
            const possibleMoves = [];
            const opposites = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];

            // Check which directions are valid (not walls)
            for (const move of opposites) {
                // Don't allow 180-degree turns unless at a dead end
                if (move.x === -this.direction.x && move.y === -this.direction.y) {
                    continue;
                }
                if (this.canMove(this.x + move.x * TILE_SIZE, this.y + move.y * TILE_SIZE)) {
                    possibleMoves.push(move);
                }
            }
            
            // If no valid moves (dead end), allow 180-degree turn
            if (possibleMoves.length === 0) {
                const oppositeDir = { x: -this.direction.x, y: -this.direction.y };
                if (this.canMove(this.x + oppositeDir.x * TILE_SIZE, this.y + oppositeDir.y * TILE_SIZE)) {
                    possibleMoves.push(oppositeDir);
                } else {
                    // Stuck, just stay
                    this.nextDirection = { x: 0, y: 0 };
                    return;
                }
            }

            let bestMove = possibleMoves[0];
            let minDistance = Infinity;
            let maxDistance = -Infinity;

            // Find the best move based on state
            for (const move of possibleMoves) {
                const newX = this.x + move.x * this.speed;
                const newY = this.y + move.y * this.speed;
                const distance = Math.hypot(target.x - newX, target.y - newY); // Euclidean distance
                
                if (this.state === 'chasing') {
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestMove = move;
                    }
                } else if (this.state === 'fleeing') {
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        bestMove = move;
                    }
                }
            }
            
            this.nextDirection = bestMove;
        }
    }

    // --- Game Functions ---

    /**
     * Initializes the game state.
     */
    function initializeGame() {
        score = 0;
        lives = 3;
        pelletsEaten = 0;
        totalPellets = 0;
        gameRunning = true;
        isFleeing = false;
        
        scoreDisplay.textContent = score;
        livesDisplay.textContent = '❤️❤️❤️';
        gameOverScreen.classList.add('hidden');
        
        // Find spawn points and count pellets
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const tile = map[row][col];
                if (tile === 1) totalPellets++;
                if (tile === 3) totalPellets++; // Power pellets also count
                
                // Center entity in the tile
                const x = col * TILE_SIZE + TILE_SIZE / 2;
                const y = row * TILE_SIZE + TILE_SIZE / 2;

                if (tile === 5) { // Pac-Man spawn
                    pacman = new Pacman(x, y, TILE_SIZE / 2 - 2, 2.5);
                }
                if (tile === 4) { // Ghost spawn (use first one found)
                    if (!blinky) {
                        blinky = new Ghost(x, y, TILE_SIZE / 2 - 2, 2.5, GHOST_COLOR);
                    }
                }
            }
        }
        
        // Ensure entities are created
        if (!pacman) pacman = new Pacman(1.5 * TILE_SIZE, 1.5 * TILE_SIZE, TILE_SIZE / 2 - 2, 2.5);
        if (!blinky) blinky = new Ghost(8.5 * TILE_SIZE, 9.5 * TILE_SIZE, TILE_SIZE / 2 - 2, 2.5, GHOST_COLOR);

        // Start the game loop
        gameLoop();
    }

    /**
     * Draws the maze (walls, pellets).
     */
    function drawMap() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const tile = map[row][col];
                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;

                if (tile === 0) { // Wall
                    ctx.fillStyle = WALL_COLOR;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                } else if (tile === 1) { // Pellet
                    ctx.fillStyle = PELLET_COLOR;
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 8, 0, 2 * Math.PI);
                    ctx.fill();
                } else if (tile === 3) { // Power Pellet
                    ctx.fillStyle = POWER_PELLET_COLOR;
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
    }

    /**
     * Handles keyboard input.
     */
    function handleInput(e) {
        e.preventDefault(); // Prevent page scrolling
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                pacman.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                pacman.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                pacman.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                pacman.nextDirection = { x: 1, y: 0 };
                break;
        }
    }
    
    /**
     * Updates all game logic.
     */
    function update() {
        if (!gameRunning) return;

        // Move entities
        pacman.move();
        
        // Center ghost update logic around its tile
        const ghostTile = blinky.getTile();
        const pacmanTile = pacman.getTile();
        
        // Only update AI if ghost is at the center of a tile
        const onGridCenter = 
            Math.abs(blinky.x - (ghostTile.col * TILE_SIZE + TILE_SIZE / 2)) < blinky.speed &&
            Math.abs(blinky.y - (ghostTile.row * TILE_SIZE + TILE_SIZE / 2)) < blinky.speed;

        if (onGridCenter) {
            blinky.updateAI(pacman);
        }
        blinky.move();

        // Check collisions
        checkPelletCollision();
        checkGhostCollision();
        
        // Update flee timer
        if (isFleeing) {
            fleeTimer--;
            if (fleeTimer <= 0) {
                isFleeing = false;
                blinky.state = 'chasing';
            }
        }
        
        // Check win condition
        if (pelletsEaten === totalPellets) {
            winGame();
        }
    }
    
    /**
     * Checks for Pac-Man eating pellets.
     */
    function checkPelletCollision() {
        const tile = pacman.getTile();
        const tileType = map[tile.row][tile.col];
        
        if (tileType === 1) { // Eat pellet
            map[tile.row][tile.col] = 2; // Set to empty
            score += 10;
            pelletsEaten++;
            scoreDisplay.textContent = score;
        } else if (tileType === 3) { // Eat power pellet
            map[tile.row][tile.col] = 2; // Set to empty
            score += 50;
            pelletsEaten++;
            scoreDisplay.textContent = score;
            
            // Set ghost to flee
            isFleeing = true;
            fleeTimer = 300; // ~5 seconds at 60fps
            blinky.state = 'fleeing';
        }
    }
    
    /**
     * Checks for Pac-Man colliding with ghosts.
     */
    function checkGhostCollision() {
        const distance = Math.hypot(pacman.x - blinky.x, pacman.y - blinky.y);
        
        if (distance < pacman.radius + blinky.radius) {
            if (blinky.state === 'fleeing') {
                // Eat ghost
                score += 200;
                scoreDisplay.textContent = score;
                // Reset ghost position
                resetGhost(blinky);
            } else if (blinky.state === 'chasing') {
                // Lose a life
                loseLife();
            }
        }
    }
    
    /**
     * Resets ghost to its spawn point.
     */
    function resetGhost(ghost) {
        // Find a spawn point
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (map[row][col] === 4) {
                    ghost.x = col * TILE_SIZE + TILE_SIZE / 2;
                    ghost.y = row * TILE_SIZE + TILE_SIZE / 2;
                    ghost.state = 'chasing';
                    isFleeing = false; // Stop flee mode
                    return;
                }
            }
        }
    }
    
    /**
     * Resets Pac-Man to his spawn point.
     */
    function resetPacman() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (map[row][col] === 5) {
                    pacman.x = col * TILE_SIZE + TILE_SIZE / 2;
                    pacman.y = row * TILE_SIZE + TILE_SIZE / 2;
                    pacman.direction = { x: 0, y: 0 };
                    pacman.nextDirection = { x: 0, y: 0 };
                    return;
                }
            }
        }
    }
    
    /**
     * Handles losing a life.
     */
    function loseLife() {
        lives--;
        
        let lifeIcons = '❤️'.repeat(lives);
        livesDisplay.textContent = lifeIcons;
        
        if (lives <= 0) {
            endGame(false);
        } else {
            // Reset positions for next life
            resetPacman();
            resetGhost(blinky);
        }
    }
    
    /**
     * Handles winning the game.
     */
    function winGame() {
        gameRunning = false;
        // Simple win message
        gameOverScreen.classList.remove('hidden');
        gameOverScreen.querySelector('h2').textContent = 'YOU WIN!';
        gameOverScreen.querySelector('h2').classList.remove('text-red-600');
        gameOverScreen.querySelector('h2').classList.add('text-yellow-400');
    }
    
    /**
     * Handles ending the game (game over).
     */
    function endGame(isWin = false) {
        gameRunning = false;
        if (!isWin) {
            gameOverScreen.classList.remove('hidden');
            gameOverScreen.querySelector('h2').textContent = 'GAME OVER';
            gameOverScreen.querySelector('h2').classList.add('text-red-600');
            gameOverScreen.querySelector('h2').classList.remove('text-yellow-400');
        }
    }

    /**
     * Draws everything on the canvas.
     */
    function draw() {
        // Clear canvas (black background)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawMap();
        
        if (gameRunning) {
            pacman.draw(ctx);
            blinky.draw(ctx);
        }
    }

    /**
     * Main game loop.
     */
    function gameLoop() {
        if (!gameRunning) {
            return; // Stop the loop if game is over
        }
        
        update();
        draw();
        
        requestAnimationFrame(gameLoop);
    }

    // --- Event Listeners ---
    // Focus the canvas to capture key events
    canvas.focus();
    canvas.addEventListener('keydown', handleInput);
    
    restartButton.addEventListener('click', () => {
        // Reloading the page is the simplest way to reset the entire game state
        // A more advanced reset would re-initialize all variables.
        window.location.reload();
    });

    // --- Start Game ---
    initializeGame();
});
