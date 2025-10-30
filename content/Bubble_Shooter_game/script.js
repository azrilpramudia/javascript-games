// ==================== GAME CONFIGURATION ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// Canvas dimensions
canvas.width = 700;
canvas.height = 500;

// Game constants
const BUBBLE_RADIUS = 20;
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
const ROWS = 8;
const COLS = 13;
const SHOOTER_Y = canvas.height - 50;

// ==================== GAME STATE ====================
let score = 0;
let bubbles = [];
let currentBubble = null;
let nextBubble = null;
let shooterAngle = -Math.PI / 2;
let isShooting = false;

// ==================== AUDIO SETUP ====================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to create shoot sound
function playShootSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Function to create pop sound
function playPopSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// ==================== BUBBLE CLASS ====================
class Bubble {
    constructor(x, y, color, row = null, col = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = BUBBLE_RADIUS;
        this.row = row;
        this.col = col;
        this.velocityX = 0;
        this.velocityY = 0;
        this.popping = false;
        this.popProgress = 0;
    }

    draw() {
        ctx.save();
        
        if (this.popping) {
            // Popping animation
            const scale = 1 + (this.popProgress * 0.5);
            const alpha = 1 - this.popProgress;
            ctx.globalAlpha = alpha;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Shine effect
            const gradient = ctx.createRadialGradient(
                this.x - this.radius / 3,
                this.y - this.radius / 3,
                0,
                this.x,
                this.y,
                this.radius * scale
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        } else {
            // Normal bubble
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Shine effect
            const gradient = ctx.createRadialGradient(
                this.x - this.radius / 3,
                this.y - this.radius / 3,
                0,
                this.x,
                this.y,
                this.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
    }

    update() {
        if (this.velocityX !== 0 || this.velocityY !== 0) {
            this.x += this.velocityX;
            this.y += this.velocityY;

            // Wall collision
            if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
                this.velocityX *= -1;
                this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            }
        }

        if (this.popping) {
            this.popProgress += 0.1;
        }
    }
}

// ==================== GAME INITIALIZATION ====================
function initGame() {
    score = 0;
    updateScore();
    bubbles = [];
    isShooting = false;

    // Create initial bubble grid
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            // Offset every other row
            const offsetX = (row % 2 === 0) ? 0 : BUBBLE_RADIUS;
            const x = col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + offsetX + 30;
            const y = row * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + 30;
            
            // Only fill first few rows
            if (row < 5) {
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                bubbles.push(new Bubble(x, y, color, row, col));
            }
        }
    }

    // Create current and next bubbles
    currentBubble = new Bubble(
        canvas.width / 2,
        SHOOTER_Y,
        COLORS[Math.floor(Math.random() * COLORS.length)]
    );
    
    nextBubble = new Bubble(
        canvas.width / 2 + 60,
        SHOOTER_Y,
        COLORS[Math.floor(Math.random() * COLORS.length)]
    );
}

// ==================== SHOOTING MECHANICS ====================
function shootBubble(angle) {
    if (isShooting) return;
    
    isShooting = true;
    const speed = 8;
    currentBubble.velocityX = Math.cos(angle) * speed;
    currentBubble.velocityY = Math.sin(angle) * speed;
    
    playShootSound();
}

function snapBubbleToGrid(bubble) {
    let minDist = Infinity;
    let snapRow = 0;
    let snapCol = 0;
    let snapX = 0;
    let snapY = 0;

    // Find closest grid position
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const offsetX = (row % 2 === 0) ? 0 : BUBBLE_RADIUS;
            const x = col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + offsetX + 30;
            const y = row * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + 30;
            
            const dist = Math.hypot(bubble.x - x, bubble.y - y);
            
            if (dist < minDist) {
                minDist = dist;
                snapRow = row;
                snapCol = col;
                snapX = x;
                snapY = y;
            }
        }
    }

    bubble.x = snapX;
    bubble.y = snapY;
    bubble.row = snapRow;
    bubble.col = snapCol;
    bubble.velocityX = 0;
    bubble.velocityY = 0;
    
    bubbles.push(bubble);
}

// ==================== COLLISION DETECTION ====================
function checkCollisions() {
    for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];
        const dist = Math.hypot(currentBubble.x - bubble.x, currentBubble.y - bubble.y);
        
        if (dist < BUBBLE_RADIUS * 2) {
            snapBubbleToGrid(currentBubble);
            checkMatches(currentBubble);
            removeFloatingBubbles();
            
            // Create new bubble
            currentBubble = nextBubble;
            currentBubble.x = canvas.width / 2;
            currentBubble.y = SHOOTER_Y;
            
            nextBubble = new Bubble(
                canvas.width / 2 + 60,
                SHOOTER_Y,
                COLORS[Math.floor(Math.random() * COLORS.length)]
            );
            
            isShooting = false;
            return;
        }
    }

    // Check if bubble reached top
    if (currentBubble.y - BUBBLE_RADIUS <= 0) {
        snapBubbleToGrid(currentBubble);
        checkMatches(currentBubble);
        removeFloatingBubbles();
        
        currentBubble = nextBubble;
        currentBubble.x = canvas.width / 2;
        currentBubble.y = SHOOTER_Y;
        
        nextBubble = new Bubble(
            canvas.width / 2 + 60,
            SHOOTER_Y,
            COLORS[Math.floor(Math.random() * COLORS.length)]
        );
        
        isShooting = false;
    }
}

// ==================== MATCH DETECTION ====================
function checkMatches(bubble) {
    const matches = [];
    const visited = new Set();
    const queue = [bubble];
    
    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.row},${current.col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (current.color === bubble.color) {
            matches.push(current);
            
            // Check neighbors
            const neighbors = getNeighbors(current);
            neighbors.forEach(neighbor => {
                const nKey = `${neighbor.row},${neighbor.col}`;
                if (!visited.has(nKey)) {
                    queue.push(neighbor);
                }
            });
        }
    }
    
    // Pop if 3 or more matches
    if (matches.length >= 3) {
        matches.forEach(b => {
            b.popping = true;
        });
        
        setTimeout(() => {
            bubbles = bubbles.filter(b => !matches.includes(b));
        }, 200);
        
        playPopSound();
        updateScore(matches.length * 10);
    }
}

function getNeighbors(bubble) {
    const neighbors = [];
    const { row, col } = bubble;
    const isEvenRow = row % 2 === 0;
    
    // Define neighbor offsets based on row parity
    const offsets = isEvenRow ? [
        [-1, -1], [-1, 0],
        [0, -1], [0, 1],
        [1, -1], [1, 0]
    ] : [
        [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, 0], [1, 1]
    ];
    
    offsets.forEach(([dRow, dCol]) => {
        const neighbor = bubbles.find(b => 
            b.row === row + dRow && b.col === col + dCol
        );
        if (neighbor) neighbors.push(neighbor);
    });
    
    return neighbors;
}

// ==================== FLOATING BUBBLES ====================
function removeFloatingBubbles() {
    const connected = new Set();
    const queue = [];
    
    // Find all bubbles in top row
    bubbles.forEach(bubble => {
        if (bubble.row === 0) {
            queue.push(bubble);
            connected.add(bubble);
        }
    });
    
    // BFS to find all connected bubbles
    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = getNeighbors(current);
        
        neighbors.forEach(neighbor => {
            if (!connected.has(neighbor)) {
                connected.add(neighbor);
                queue.push(neighbor);
            }
        });
    }
    
    // Remove floating bubbles
    const floating = bubbles.filter(b => !connected.has(b));
    if (floating.length > 0) {
        floating.forEach(b => b.popping = true);
        
        setTimeout(() => {
            bubbles = bubbles.filter(b => connected.has(b));
        }, 200);
        
        if (floating.length > 0) {
            playPopSound();
            updateScore(floating.length * 5);
        }
    }
}

// ==================== SCORE SYSTEM ====================
function updateScore(points = 0) {
    score += points;
    scoreElement.textContent = score;
    
    if (points > 0) {
        scoreElement.classList.add('updated');
        setTimeout(() => {
            scoreElement.classList.remove('updated');
        }, 300);
    }
}

// ==================== DRAWING FUNCTIONS ====================
function drawShooter() {
    // Draw shooter base
    ctx.save();
    ctx.translate(canvas.width / 2, SHOOTER_Y);
    
    // Shooter platform
    ctx.fillStyle = '#555';
    ctx.fillRect(-40, 10, 80, 20);
    
    // Aim line
    ctx.rotate(shooterAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -100);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.restore();
}

function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all bubbles
    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
    });
    
    // Draw shooter
    drawShooter();
    
    // Draw current bubble
    if (currentBubble) {
        currentBubble.update();
        currentBubble.draw();
    }
    
    // Draw next bubble preview
    if (nextBubble) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        nextBubble.draw();
        ctx.restore();
        
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Next', nextBubble.x, nextBubble.y + 40);
    }
    
    // Check collisions if shooting
    if (isShooting) {
        checkCollisions();
    }
    
    requestAnimationFrame(drawGame);
}

// ==================== EVENT LISTENERS ====================
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    shooterAngle = Math.atan2(mouseY - SHOOTER_Y, mouseX - canvas.width / 2);
    
    // Limit angle to prevent shooting downward
    shooterAngle = Math.max(-Math.PI + 0.1, Math.min(-0.1, shooterAngle));
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - SHOOTER_Y, mouseX - canvas.width / 2);
    const clampedAngle = Math.max(-Math.PI + 0.1, Math.min(-0.1, angle));
    
    shootBubble(clampedAngle);
});

restartBtn.addEventListener('click', () => {
    initGame();
});

// ==================== START GAME ====================
initGame();
drawGame();