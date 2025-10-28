// Get the canvas element and its 2D drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Variables ---

// Ball properties
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 2,  // Velocity (direction) on X-axis
    dy: -2, // Velocity (direction) on Y-axis
    radius: 10,
    color: '#0095DD'
};

// Paddle properties
let paddle = {
    height: 10,
    width: 75,
    x: (canvas.width - 75) / 2, // Start in the middle
    speed: 7
};

// Brick properties
let brick = {
    rowCount: 3,
    columnCount: 5,
    width: 75,
    height: 20,
    padding: 10,
    offsetTop: 30,
    offsetLeft: 30,
    color: '#0095DD'
};

// Create the bricks array
// We use a 2D array to hold the column (c) and row (r) of bricks
let bricks = [];
for(let c = 0; c < brick.columnCount; c++) {
    bricks[c] = [];
    for(let r = 0; r < brick.rowCount; r++) {
        // status: 1 = alive, 0 = broken
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Game state
let score = 0;
let lives = 3;
let rightPressed = false;
let leftPressed = false;

// --- Event Listeners for User Input ---

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

// --- Drawing Functions ---

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c = 0; c < brick.columnCount; c++) {
        for(let r = 0; r < brick.rowCount; r++) {
            if(bricks[c][r].status === 1) {
                // Calculate the x and y position for each brick
                let brickX = (c * (brick.width + brick.padding)) + brick.offsetLeft;
                let brickY = (r * (brick.height + brick.padding)) + brick.offsetTop;
                
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brick.width, brick.height);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
}

// --- Collision Detection ---

function collisionDetection() {
    for(let c = 0; c < brick.columnCount; c++) {
        for(let r = 0; r < brick.rowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                // Check if the ball's center is inside the brick's coordinates
                if(ball.x > b.x && ball.x < b.x + brick.width && ball.y > b.y && ball.y < b.y + brick.height) {
                    ball.dy = -ball.dy; // Reverse ball's Y direction
                    b.status = 0; // Set brick status to "broken"
                    score++;
                    
                    // Check for win
                    if(score === brick.rowCount * brick.columnCount) {
                        alert('YOU WIN, CONGRATULATIONS!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// --- Main Game Loop ---

function draw() {
    // 1. Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Draw all game elements
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    
    // 3. Check for collisions
    collisionDetection();
    
    // 4. Update Ball Position
    
    // Bounce off left and right walls
    if(ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    // Bounce off top wall
    if(ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } 
    // Check for bottom wall
    else if(ball.y + ball.dy > canvas.height - ball.radius) {
        // Check if it hit the paddle
        if(ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy; // Bounce
        } else {
            // Ball hit the bottom - Lose a life
            lives--;
            if(lives === 0) {
                // Game Over
                alert('GAME OVER');
                document.location.reload();
            } else {
                // Reset ball and paddle
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                ball.dx = 2;
                ball.dy = -2;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        }
    }
    
    // 5. Update Paddle Position
    if(rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if(leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    
    // 6. Move the ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Request the next frame
    requestAnimationFrame(draw);
}

// Start the game loop
draw();