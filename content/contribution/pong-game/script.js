(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const leftScoreEl = document.getElementById('leftScore');
  const rightScoreEl = document.getElementById('rightScore');
  const resetBtn = document.getElementById('resetBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const difficultySelect = document.getElementById('difficulty');
  const singleMode = document.getElementById('singleMode');

  function resizeCanvas() {
    const ratio = Math.min(window.innerWidth * 0.95 / 900, window.innerHeight * 0.75 / 500, 1);
    canvas.style.width = Math.round(900 * ratio) + 'px';
    canvas.style.height = Math.round(500 * ratio) + 'px';
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const PADDLE_WIDTH = 12;
  const PADDLE_HEIGHT = 90;
  const BALL_SIZE = 12;

  let left = { x: 20, y: (canvas.height - PADDLE_HEIGHT) / 2 };
  let right = { x: canvas.width - 20 - PADDLE_WIDTH, y: (canvas.height - PADDLE_HEIGHT) / 2 };
  let ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 0, vy: 0 };

  let scores = { left: 0, right: 0 };
  let isPaused = true;
  let serveTo = Math.random() < 0.5 ? -1 : 1;
  let difficulty = parseFloat(difficultySelect.value);
  let aiEnabled = singleMode.checked;

  const keys = {};
  window.addEventListener('keydown', e => { 
    keys[e.key.toLowerCase()] = true; 
    if (e.key === ' ') { 
      isPaused = !isPaused; 
      pauseBtn.textContent = isPaused ? 'Resume' : 'Pause'; 
    } 
  });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const y = (e.clientY - rect.top) * scaleY;
    left.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, y - PADDLE_HEIGHT / 2));
  });

  canvas.addEventListener('click', () => { 
    if (isPaused) { 
      serve(); 
      isPaused = false; 
      pauseBtn.textContent = 'Pause'; 
    } 
  });

  resetBtn.addEventListener('click', reset);
  pauseBtn.addEventListener('click', () => { 
    isPaused = !isPaused; 
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause'; 
  });
  difficultySelect.addEventListener('change', () => { 
    difficulty = parseFloat(difficultySelect.value); 
  });
  singleMode.addEventListener('change', () => { 
    aiEnabled = singleMode.checked; 
  });

  function reset() {
    scores.left = 0; 
    scores.right = 0; 
    updateScore();
    left.y = (canvas.height - PADDLE_HEIGHT) / 2;
    right.y = (canvas.height - PADDLE_HEIGHT) / 2;
    ball.x = canvas.width / 2; 
    ball.y = canvas.height / 2; 
    ball.vx = 0; 
    ball.vy = 0;
    isPaused = true;
    pauseBtn.textContent = 'Pause';
  }

  function serve() {
    const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8);
    const speed = 6;
    ball.vx = speed * (serveTo === 1 ? 1 : -1) * Math.cos(angle);
    ball.vy = speed * Math.sin(angle);
  }

  function updateScore() { 
    leftScoreEl.textContent = scores.left; 
    rightScoreEl.textContent = scores.right; 
  }

  function aiMove() { 
    const center = right.y + PADDLE_HEIGHT / 2; 
    const delta = ball.y - center; 
    right.y += delta * difficulty * 2; 
    right.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, right.y)); 
  }

  function clamp(v, a, b) { 
    return Math.max(a, Math.min(b, v)); 
  }

  function step() {
    if (keys['w']) left.y -= 7; 
    if (keys['s']) left.y += 7; 
    left.y = clamp(left.y, 0, canvas.height - PADDLE_HEIGHT);
    
    if (keys['arrowup']) right.y -= 7; 
    if (keys['arrowdown']) right.y += 7; 
    right.y = clamp(right.y, 0, canvas.height - PADDLE_HEIGHT);
    
    if (aiEnabled && !keys['arrowup'] && !keys['arrowdown']) aiMove();

    if (!isPaused) {
      ball.x += ball.vx; 
      ball.y += ball.vy;
      
      if (ball.y <= 0) { 
        ball.y = 0; 
        ball.vy *= -1; 
      }
      if (ball.y + BALL_SIZE >= canvas.height) { 
        ball.y = canvas.height - BALL_SIZE; 
        ball.vy *= -1; 
      }

      if (ball.x <= left.x + PADDLE_WIDTH && ball.x + BALL_SIZE >= left.x) {
        if (ball.y + BALL_SIZE >= left.y && ball.y <= left.y + PADDLE_HEIGHT) {
          const hitPos = (ball.y + BALL_SIZE/2) - (left.y + PADDLE_HEIGHT/2);
          const normalized = hitPos / (PADDLE_HEIGHT/2);
          const speed = Math.hypot(ball.vx, ball.vy) * 1.05;
          const angle = normalized * (Math.PI/3);
          ball.vx = Math.abs(speed * Math.cos(angle));
          ball.vy = speed * Math.sin(angle);
          ball.x = left.x + PADDLE_WIDTH + 0.5;
        }
      }

      if (ball.x + BALL_SIZE >= right.x && ball.x <= right.x + PADDLE_WIDTH) {
        if (ball.y + BALL_SIZE >= right.y && ball.y <= right.y + PADDLE_HEIGHT) {
          const hitPos = (ball.y + BALL_SIZE/2) - (right.y + PADDLE_HEIGHT/2);
          const normalized = hitPos / (PADDLE_HEIGHT/2);
          const speed = Math.hypot(ball.vx, ball.vy) * 1.05;
          const angle = normalized * (Math.PI/3);
          ball.vx = -Math.abs(speed * Math.cos(angle));
          ball.vy = speed * Math.sin(angle);
          ball.x = right.x - BALL_SIZE - 0.5;
        }
      }

      if (ball.x + BALL_SIZE < 0) { 
        scores.right += 1; 
        serveTo = -1; 
        updateScore(); 
        isPaused = true; 
        ball.x = canvas.width/2; 
        ball.y = canvas.height/2; 
        ball.vx = 0; 
        ball.vy = 0; 
      }
      if (ball.x > canvas.width) { 
        scores.left += 1; 
        serveTo = 1; 
        updateScore(); 
        isPaused = true; 
        ball.x = canvas.width/2; 
        ball.y = canvas.height/2; 
        ball.vx = 0; 
        ball.vy = 0; 
      }
    }
  }

  function drawNet() { 
    const seg = 14; 
    ctx.fillStyle = 'rgba(79,209,197,0.12)'; 
    for (let y = 0; y < canvas.height; y += seg * 2) 
      ctx.fillRect(canvas.width/2 - 1.5, y, 3, seg); 
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, 'rgba(79,209,197,0.03)');
    g.addColorStop(0.5, 'rgba(167,139,250,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = g; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawNet();
    
    const gPaddle = ctx.createLinearGradient(0, 0, 0, PADDLE_HEIGHT);
    gPaddle.addColorStop(0, '#4fd1c5');
    gPaddle.addColorStop(1, '#38b2a8');
    ctx.fillStyle = gPaddle;
    ctx.shadowColor = 'rgba(79,209,197,0.6)';
    ctx.shadowBlur = 20;
    roundRect(ctx, left.x, left.y, PADDLE_WIDTH, PADDLE_HEIGHT, 6, true);
    ctx.shadowBlur = 0;
    
    const gPaddle2 = ctx.createLinearGradient(0, 0, 0, PADDLE_HEIGHT);
    gPaddle2.addColorStop(0, '#a78bfa');
    gPaddle2.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gPaddle2;
    ctx.shadowColor = 'rgba(167,139,250,0.6)';
    ctx.shadowBlur = 20;
    roundRect(ctx, right.x, right.y, PADDLE_WIDTH, PADDLE_HEIGHT, 6, true);
    ctx.shadowBlur = 0;
    
    const gBall = ctx.createRadialGradient(ball.x + BALL_SIZE/2, ball.y + BALL_SIZE/2, 0, ball.x + BALL_SIZE/2, ball.y + BALL_SIZE/2, BALL_SIZE);
    gBall.addColorStop(0, '#ffffff');
    gBall.addColorStop(0.5, '#4fd1c5');
    gBall.addColorStop(1, '#38b2a8');
    ctx.fillStyle = gBall;
    ctx.shadowColor = 'rgba(79,209,197,0.8)';
    ctx.shadowBlur = 25;
    roundRect(ctx, ball.x, ball.y, BALL_SIZE, BALL_SIZE, BALL_SIZE/2, true);
    ctx.shadowBlur = 0;
    
    if (isPaused) { 
      ctx.fillStyle = 'rgba(230,238,248,0.95)'; 
      ctx.font = '600 20px Inter, system-ui, Arial'; 
      ctx.textAlign = 'center'; 
      ctx.shadowColor = 'rgba(79,209,197,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText('Click or press Space to serve', canvas.width/2, canvas.height/2 - 28);
      ctx.shadowBlur = 0;
    }
  }

  function roundRect(ctx, x, y, w, h, r, fill) { 
    ctx.beginPath(); 
    ctx.moveTo(x + r, y); 
    ctx.arcTo(x + w, y, x + w, y + h, r); 
    ctx.arcTo(x + w, y + h, x, y + h, r); 
    ctx.arcTo(x, y + h, x, y, r); 
    ctx.arcTo(x, y, x + w, y, r); 
    ctx.closePath(); 
    if (fill) ctx.fill(); 
    else ctx.stroke(); 
  }

  function loop() { 
    step(); 
    draw(); 
    requestAnimationFrame(loop); 
  }
  
  reset(); 
  loop();
})();