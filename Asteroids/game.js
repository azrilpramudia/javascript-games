// --- 1. SETUP CANVAS & DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');

// --- 2. GAME VARIABLES ---
let player;
let bullets = [];
let asteroids = [];
let keys = {};
let score = 0;
let lives = 3;
let gameOver = false;
let level = 1;

const FRICTION = 0.05; // Slows the ship down
const ROTATION_SPEED = 0.05;
const THRUST_SPEED = 0.1;
const BULLET_SPEED = 7;
const BULLET_LIFESPAN = 80; // Frames
const ASTEROID_COUNT = 3;
const ASTEROID_SPEED = 1;

// --- 3. GAME CLASSES ---

// Base class for all moving objects
class GameObject {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = 0;
        this.vy = 0;
    }

    // Handles wrapping around the screen edges
    handleScreenWrap() {
        if (this.x < 0 - this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = 0 - this.radius;
        if (this.y < 0 - this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = 0 - this.radius;
    }

    // Checks collision with another GameObject (circle-based)
    isCollidingWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + other.radius;
    }
}

// Player (Ship)
class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 15); // radius = 15
        this.angle = -Math.PI / 2; // Point up
        this.isThrusting = false;
        this.isInvincible = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -this.radius); // Nose
        ctx.lineTo(this.radius / 1.2, this.radius / 1.2);
        ctx.lineTo(-this.radius / 1.2, this.radius / 1.2);
        ctx.closePath();
        
        // Make invincible player blink
        ctx.strokeStyle = this.isInvincible ? (Math.floor(Date.now() / 200) % 2 ? '#fff' : '#555') : '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw thruster
        if (this.isThrusting) {
            ctx.beginPath();
            ctx.moveTo(0, this.radius / 1.2 + 3);
            ctx.lineTo(5, this.radius / 1.2 + 10);
            ctx.lineTo(-5, this.radius / 1.2 + 10);
            ctx.closePath();
            ctx.fillStyle = 'red';
            ctx.fill();
        }
        ctx.restore();
    }

    update() {
        // Rotate
        if (keys['ArrowLeft']) this.angle -= ROTATION_SPEED;
        if (keys['ArrowRight']) this.angle += ROTATION_SPEED;

        // Thrust
        this.isThrusting = keys['ArrowUp'];
        if (this.isThrusting) {
            this.vx += Math.cos(this.angle - Math.PI / 2) * THRUST_SPEED;
            this.vy += Math.sin(this.angle - Math.PI / 2) * THRUST_SPEED;
        }

        // Apply friction
        this.vx *= (1 - FRICTION);
        this.vy *= (1 - FRICTION);

        // Move
        this.x += this.vx;
        this.y += this.vy;
        
        this.handleScreenWrap();
    }

    shoot() {
        const bulletVx = Math.cos(this.angle - Math.PI / 2) * BULLET_SPEED + this.vx;
        const bulletVy = Math.sin(this.angle - Math.PI / 2) * BULLET_SPEED + this.vy;
        // Start bullet from ship's nose
        const bulletX = this.x + Math.cos(this.angle - Math.PI / 2) * this.radius;
        const bulletY = this.y + Math.sin(this.angle - Math.PI / 2) * this.radius;

        bullets.push(new Bullet(bulletX, bulletY, bulletVx, bulletVy));
    }

    // Reset after being hit
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.vx = 0;
        this.vy = 0;
        this.angle = -Math.PI / 2;
        this.isInvincible = true;
        // Invincibility for 3 seconds
        setTimeout(() => {
            this.isInvincible = false;
        }, 3000);
    }
}

// Bullet
class Bullet extends GameObject {
    constructor(x, y, vx, vy) {
        super(x, y, 3); // radius = 3
        this.vx = vx;
        this.vy = vy;
        this.lifespan = BULLET_LIFESPAN;
    }

    draw() {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifespan--;
        this.handleScreenWrap();
    }
}

// Asteroid
class Asteroid extends GameObject {
    constructor(x, y, radius, level) {
        super(x, y, radius);
        this.level = level; // 2 = Large, 1 = Small
        this.vx = Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1);
        this.vy = Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1);
    }

    draw() {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Simple circle for this version
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.handleScreenWrap();
    }
}

// --- 4. HELPER FUNCTIONS ---

// Spawn all asteroids for a new level
function createAsteroids() {
    asteroids = [];
    const count = ASTEROID_COUNT + level;
    for (let i = 0; i < count; i++) {
        let x, y;
        // Ensure asteroids don't spawn on the player
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.sqrt((x - player.x)**2 + (y - player.y)**2) < 100); // 100px safe zone
        
        asteroids.push(new Asteroid(x, y, 40, 2)); // Level 2 = Large
    }
}

// Handle asteroid splitting
function breakAsteroid(asteroid, index) {
    if (asteroid.level === 2) { // Large -> 2 Small
        asteroids.push(new Asteroid(asteroid.x, asteroid.y, 20, 1));
        asteroids.push(new Asteroid(asteroid.x, asteroid.y, 20, 1));
        score += 20;
    } else { // Small -> Destroyed
        score += 50;
    }
    asteroids.splice(index, 1);
    scoreDisplay.textContent = score;
    
    // Check for next level
    if (asteroids.length === 0) {
        level++;
        createAsteroids();
    }
}

// Handle player getting hit
function playerHit() {
    if (player.isInvincible) return;
    
    lives--;
    livesDisplay.textContent = lives;
    if (lives <= 0) {
        gameOver = true;
    } else {
        player.reset();
    }
}

// --- 5. KEYBOARD INPUT ---
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && !gameOver) {
        player.shoot();
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// --- 6. GAME LOOP ---
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '50px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px "Courier New"';
        ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 2 + 40);
        return;
    }

    // 1. Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Update Objects
    player.update();
    
    // Update bullets (and remove old ones)
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if (bullets[i].lifespan <= 0) {
            bullets.splice(i, 1);
        }
    }
    
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].update();
    }

    // 3. Check Collisions
    // Bullets vs Asteroids
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (bullets[i] && asteroids[j] && bullets[i].isCollidingWith(asteroids[j])) {
                breakAsteroid(asteroids[j], j);
                bullets.splice(i, 1);
                break; // Stop checking this bullet
            }
        }
    }

    // Player vs Asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (asteroids[i] && player.isCollidingWith(asteroids[i])) {
            playerHit();
            break; // Only hit one asteroid at a time
        }
    }

    // 4. Draw Objects
    player.draw();
    bullets.forEach(bullet => bullet.draw());
    asteroids.forEach(asteroid => asteroid.draw());

    // 5. Repeat
    requestAnimationFrame(gameLoop);
}

// --- 7. START GAME ---
function init() {
    player = new Player(canvas.width / 2, canvas.height / 2);
    livesDisplay.textContent = lives;
    scoreDisplay.textContent = score;
    createAsteroids();
    gameLoop();
}

init();