// --- 1. SETUP CANVAS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 2. GAME VARIABLES ---
let player;
let bullets = [];
let aliens = [];
let keys = {};
let score = 0;
let gameOver = false;

// Updated: Sizing for emojis
const playerWidth = 30;
const playerHeight = 30;
const playerSpeed = 5;

const alienWidth = 30;
const alienHeight = 30;
const alienRows = 5;
const alienCols = 10;
const alienSpacing = 10;
let alienSpeed = 1;
let alienDirection = 1; // 1 for right, -1 for left

const bulletWidth = 15;
const bulletHeight = 30;
const bulletSpeed = 7;

// --- 3. GAME CLASSES ---

// Player Class
class Player {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    // Updated: Draw emoji
    draw() {
        ctx.font = '30px Arial';
        // Note: fillText's y-coordinate is the baseline,
        // so we add height to draw it at the correct 'y' box position.
        ctx.fillText('🚀', this.x, this.y + this.height);
    }

    move() {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - bulletWidth / 2;
        const bulletY = this.y;
        bullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight, bulletSpeed));
    }
}

// Bullet Class
class Bullet {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    // Updated: Draw emoji
    draw() {
        ctx.font = '30px Arial';
        ctx.fillText('🔥', this.x, this.y + this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

// Alien Class
class Alien {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Updated: Draw emoji
    draw() {
        ctx.font = '30px Arial';
        ctx.fillText('👾', this.x, this.y + this.height);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

// --- 4. HELPER FUNCTIONS ---

// Create the grid of aliens
function createAliens() {
    aliens = []; // Clear existing aliens
    for (let r = 0; r < alienRows; r++) {
        for (let c = 0; c < alienCols; c++) {
            const alienX = c * (alienWidth + alienSpacing) + (canvas.width - (alienCols * (alienWidth + alienSpacing)) + alienSpacing) / 2;
            const alienY = r * (alienHeight + alienSpacing) + 50;
            aliens.push(new Alien(alienX, alienY, alienWidth, alienHeight));
        }
    }
}

// Simple Collision Detection (AABB)
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// --- 5. KEYBOARD INPUT ---
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // Prevent shooting multiple bullets by holding space
    if ((e.key === ' ' || e.code === 'Space') && bullets.length < 3) { // Limit bullets on screen
        player.shoot();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// --- 6. GAME LOGIC (UPDATE) ---
function update() {
    if (gameOver) return;

    player.move();

    // Move bullets and check for out-of-bounds
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if (bullets[i].y < 0) {
            bullets.splice(i, 1); // Remove bullet if it goes off-screen
        }
    }

    // Move aliens
    let moveDown = false;
    let alienMovementX = alienSpeed * alienDirection;

    for (const alien of aliens) {
        if ((alien.x + alien.width > canvas.width && alienDirection === 1) || (alien.x < 0 && alienDirection === -1)) {
            moveDown = true;
            break;
        }
    }

    if (moveDown) {
        alienDirection *= -1; // Reverse direction
        for (const alien of aliens) {
            alien.move(0, alienHeight); // Move down
        }
    } else {
        for (const alien of aliens) {
            alien.move(alienMovementX, 0); // Move sideways
        }
    }

    // Check for collisions
    // Bullets vs Aliens
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], aliens[j])) {
                bullets.splice(i, 1); // Remove bullet
                aliens.splice(j, 1); // Remove alien
                score += 10;
                break; // Stop checking this bullet
            }
        }
    }

    // Aliens vs Player
    for (const alien of aliens) {
        if (checkCollision(alien, player)) {
            gameOver = true;
        }
        // Check if aliens reached the bottom
        if (alien.y + alien.height > player.y) {
            gameOver = true;
        }
    }
    
    // Check for Win
    if (aliens.length === 0) {
        gameOver = true;
    }
}

// --- 7. DRAWING LOGIC ---
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    player.draw();

    // Draw bullets
    for (const bullet of bullets) {
        bullet.draw();
    }

    // Draw aliens
    for (const alien of aliens) {
        alien.draw();
    }

    // Draw Score
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New"';
    ctx.fillText('Score: ' + score, 10, 25);

    // Updated: Draw Game Over / Win Message with instructions
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '50px "Courier New"';
        ctx.textAlign = 'center';
        if (aliens.length === 0) {
            ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
        } else {
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        }
        
        ctx.font = '20px "Courier New"';
        ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 2 + 40);

        ctx.font = '16px "Courier New"';
        ctx.fillText('Controls: [←] [→] Move, [Space] Shoot', canvas.width / 2, canvas.height / 2 + 80);
        
        ctx.textAlign = 'left'; // Reset alignment
    }
}

// --- 8. GAME LOOP ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- 9. START GAME ---
function init() {
    const playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - playerHeight - 20;
    player = new Player(playerX, playerY, playerWidth, playerHeight, playerSpeed);
    
    createAliens();
    
    score = 0;
    gameOver = false;
    alienDirection = 1;
    bullets = [];
}

init(); // Initialize the game
gameLoop(); // Start the loop