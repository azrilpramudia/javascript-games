// --- 1. SETUP CANVAS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');

// --- 2. GAME VARIABLES ---
const tileSize = 20; // The size of each square in the grid
let score = 0;
let gameOver = false;
let gameWin = false;
let pelletCount = 0;

// Game map (2D Array)
// 1 = Wall, 0 = Pellet, 2 = Empty, 3 = Power Pellet
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 0, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 1, 1, 0, 2, 2, 2, 2, 2, 2], // Tunnel
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// --- 3. GAME CLASSES ---

// Player (Pac-Man)
class Player {
    constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.dx = 0;
        this.dy = 0;
        this.nextDx = 0;
        this.nextDy = 0;
    }

    draw() {
        ctx.fillStyle = '#FFFF00'; // Yellow
        ctx.beginPath();
        ctx.arc(this.x * tileSize + tileSize / 2, this.y * tileSize + tileSize / 2, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    // Check if the next move is valid (not a wall)
    isMoveValid(dx, dy) {
        const nextX = this.x + dx;
        const nextY = this.y + dy;
        // Check for tunnel
        if (nextX < 0) {
            this.x = map[0].length - 1;
            return false;
        }
        if (nextX >= map[0].length) {
            this.x = 0;
            return false;
        }
        // Check for wall
        if (map[nextY][nextX] === 1) {
            return false;
        }
        return true;
    }

    move() {
        // Try to apply the "next" direction first (buffers input)
        if (this.isMoveValid(this.nextDx, this.nextDy)) {
            this.dx = this.nextDx;
            this.dy = this.nextDy;
        }
        
        // If current direction is valid, move
        if (this.isMoveValid(this.dx, this.dy)) {
            this.x += this.dx;
            this.y += this.dy;
        }
    }
    
    eat() {
        const tile = map[this.y][this.x];
        if (tile === 0) { // Pellet
            map[this.y][this.x] = 2; // Set tile to empty
            score += 10;
            pelletCount--;
        } else if (tile === 3) { // Power Pellet
            map[this.y][this.x] = 2; // Set tile to empty
            score += 50;
            scareGhosts();
        }
    }
}

// Ghost
class Ghost {
    constructor(x, y, radius, speed, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed; // Note: In tile-based, speed is how often they move
        this.color = color;
        this.dx = 0;
        this.dy = -1; // Start moving up
        this.isScared = false;
    }

    draw() {
        ctx.fillStyle = this.isScared ? '#0000FF' : this.color;
        ctx.beginPath();
        ctx.arc(this.x * tileSize + tileSize / 2, this.y * tileSize + tileSize / 2, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    // Simplified random movement
    move() {
        const possibleMoves = [];
        const [dx, dy] = [this.dx, this.dy];

        // Check potential directions (don't reverse unless stuck)
        if (this.isMoveValid(0, -1) && dy !== 1) possibleMoves.push([0, -1]); // Up
        if (this.isMoveValid(0, 1) && dy !== -1) possibleMoves.push([0, 1]);  // Down
        if (this.isMoveValid(-1, 0) && dx !== 1) possibleMoves.push([-1, 0]); // Left
        if (this.isMoveValid(1, 0) && dx !== -1) possibleMoves.push([1, 0]);  // Right

        // Check if current direction is still valid
        if (this.isMoveValid(dx, dy) && possibleMoves.length <= 2) {
             this.x += dx;
             this.y += dy;
        } else {
             // Choose a new random direction from valid moves
             if (possibleMoves.length > 0) {
                const [newDx, newDy] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.dx = newDx;
                this.dy = newDy;
                this.x += this.dx;
                this.y += this.dy;
             } else {
                // Must be a dead end, reverse direction
                this.dx = -dx;
                this.dy = -dy;
                this.x += this.dx;
                this.y += this.dy;
             }
        }
    }
    
    isMoveValid(dx, dy) {
        const nextX = this.x + dx;
        const nextY = this.y + dy;
        // Check for tunnel
        if (nextX < 0) {
            this.x = map[0].length - 1;
            return false;
        }
        if (nextX >= map[0].length) {
            this.x = 0;
            return false;
        }
        // Check for wall
        return map[nextY][nextX] !== 1;
    }
}

// --- 4. GAME OBJECTS ---
let player = new Player(1, 1, 8, 1); // x, y, radius, speed (1 tile per frame)
let ghosts = [
    new Ghost(13, 11, 8, 1, '#FF0000'), // Blinky (Red)
    new Ghost(14, 11, 8, 1, '#FFB8FF'), // Pinky (Pink)
    new Ghost(13, 13, 8, 1, '#00FFFF'), // Inky (Cyan)
    new Ghost(14, 13, 8, 1, '#FFB852')  // Clyde (Orange)
];
let scareTimer = null;

// --- 5. HELPER FUNCTIONS ---

// Draw the map (walls, pellets)
function drawMap() {
    pelletCount = 0; // Recalculate pellet count each frame
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = map[y][x];
            if (tile === 1) { // Wall
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else if (tile === 0) { // Pellet
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                pelletCount++;
            } else if (tile === 3) { // Power Pellet
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                pelletCount++; // Also a pellet
            }
        }
    }
}

function scareGhosts() {
    ghosts.forEach(ghost => ghost.isScared = true);
    // Clear existing timer if one is running
    if (scareTimer) clearTimeout(scareTimer);
    // Set new timer
    scareTimer = setTimeout(() => {
        ghosts.forEach(ghost => ghost.isScared = false);
        scareTimer = null;
    }, 7000); // 7 seconds
}

function checkCollisions() {
    ghosts.forEach((ghost, index) => {
        if (ghost.x === player.x && ghost.y === player.y) {
            if (ghost.isScared) {
                // Eat ghost
                score += 200;
                // Send ghost back to "house" (simplified)
                ghost.x = 13 + (index % 2);
                ghost.y = 11 + Math.floor(index / 2);
                ghost.isScared = false;
            } else {
                // Game Over
                gameOver = true;
            }
        }
    });
}

function checkWin() {
    if (pelletCount === 0) {
        gameWin = true;
    }
}

// --- 6. KEYBOARD INPUT ---
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            player.nextDx = 0;
            player.nextDy = -1;
            break;
        case 'ArrowDown':
            player.nextDx = 0;
            player.nextDy = 1;
            break;
        case 'ArrowLeft':
            player.nextDx = -1;
            player.nextDy = 0;
            break;
        case 'ArrowRight':
            player.nextDx = 1;
            player.nextDy = 0;
            break;
    }
});

// --- 7. GAME LOOP ---
let lastTime = 0;
const gameSpeed = 150; // Milliseconds per frame update

function gameLoop(timestamp) {
    if (gameOver || gameWin) {
        // Draw Game Over / Win Message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFF00';
        ctx.font = '50px "Courier New"';
        ctx.textAlign = 'center';
        const message = gameWin ? 'YOU WIN!' : 'GAME OVER';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        ctx.font = '20px "Courier New"';
        ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 2 + 40);
        return; // Stop the loop
    }

    // Control game speed
    let deltaTime = timestamp - lastTime;
    if (deltaTime < gameSpeed) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastTime = timestamp;

    // 1. Update
    player.move();
    player.eat();
    ghosts.forEach(ghost => ghost.move());
    checkCollisions();
    checkWin();
    scoreDisplay.textContent = score;

    // 2. Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear
    drawMap();
    player.draw();
    ghosts.forEach(ghost => ghost.draw());

    // 3. Repeat
    requestAnimationFrame(gameLoop);
}

// --- 8. START GAME ---
requestAnimationFrame(gameLoop);