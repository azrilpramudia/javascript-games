// Simple, well-commented snake game (grid based)
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const restartBtn = document.getElementById('restart');

  const width = canvas.width; // 400
  const height = canvas.height; // 400
  const cols = 20; // grid columns
  const rows = 20; // grid rows
  const cellW = width / cols;
  const cellH = height / rows;

  let snake = [{x:10,y:10}];
  let dir = {x:0,y:0};
  let food = {x:5,y:5};
  let score = 0;
  let gameOver = false;
  let speed = 120; // ms per tick
  let timer = null;

  // initialize a fresh game state. The game will start when the player
  // presses an arrow/WASD key (prevents immediate self-collision on start).
  function start(){
    snake = [{x:10,y:10}];
    dir = {x:0,y:0};
    placeFood();
    score = 0;
    gameOver = false;
    scoreEl.textContent = 'Score: 0';
    // stop any running timer
    if(timer) { clearInterval(timer); timer = null; }
    // update highscore display
    updateHighscoreDisplay();
    draw();
  }

  function placeFood(){
    // simple random free cell
    while(true){
      const x = Math.floor(Math.random()*cols);
      const y = Math.floor(Math.random()*rows);
      if(!snake.some(s=>s.x===x && s.y===y)){
        food = {x,y};
        return;
      }
    }
  }

  function tick(){
    if(gameOver) return;
    // move snake head
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    // check wall collision
    if(head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows){
      endGame();
      return;
    }

    // check self collision
    if(snake.some(s => s.x === head.x && s.y === head.y)){
      endGame();
      return;
    }

  snake.unshift(head);

    // eat food
    if(head.x === food.x && head.y === food.y){
      score += 1;
      scoreEl.textContent = `Score: ${score}`;
      placeFood();
      // speed up slightly every 5 points
      if(score % 5 === 0 && speed > 40){
        speed = Math.floor(speed * 0.9);
        clearInterval(timer);
        timer = setInterval(tick, speed);
      }
    } else {
      snake.pop(); // remove tail
    }

    draw();
  }

  function endGame(){
    gameOver = true;
    clearInterval(timer);
    timer = null;
    // flash the canvas with red overlay
    ctx.fillStyle = 'rgba(200,30,30,0.22)';
    ctx.fillRect(0,0,width,height);
    // draw message
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over — Press Restart', width/2, height/2);
    // store highscore
    saveHighscore();
  }

  // draw everything; includes simple decorative grid and improved visuals
  function draw(){
    // background
    // subtle gradient background
    const g = ctx.createLinearGradient(0,0,0,height);
    g.addColorStop(0,'#051026');
    g.addColorStop(1,'#071126');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,width,height);

    // grid optional subtle lines
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for(let i=0;i<=cols;i++){
      ctx.beginPath();
      ctx.moveTo(i*cellW,0);
      ctx.lineTo(i*cellW,height);
      ctx.stroke();
    }
    for(let j=0;j<=rows;j++){
      ctx.beginPath();
      ctx.moveTo(0,j*cellH);
      ctx.lineTo(width,j*cellH);
      ctx.stroke();
    }

    // draw food with pulsing effect
    const pulse = 1 + Math.sin(Date.now()/200)/8; // gentle pulse
    const fx = food.x*cellW + cellW/2;
    const fy = food.y*cellH + cellH/2;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#1fb85a';
    ctx.shadowColor = 'rgba(34,197,94,0.6)';
    ctx.shadowBlur = 12;
    ctx.arc(fx, fy, Math.min(cellW,cellH)/2.6 * pulse, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // draw snake as rounded circles for nicer visuals
    for(let i=0;i<snake.length;i++){
      const seg = snake[i];
      const cx = seg.x*cellW + cellW/2;
      const cy = seg.y*cellH + cellH/2;
      ctx.beginPath();
      if(i===0){
        // head brighter with small glow
        ctx.fillStyle = '#86ffd0';
        ctx.shadowColor = 'rgba(134,255,208,0.45)';
        ctx.shadowBlur = 10;
        ctx.arc(cx, cy, Math.min(cellW,cellH)/2.2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#2ec16a';
        ctx.arc(cx, cy, Math.min(cellW,cellH)/2.6, 0, Math.PI*2);
        ctx.fill();
      }
    }

    // draw subtle border around grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0.5,0.5,width-1,height-1);
  }

  function rect(gx, gy){
    // kept for compatibility if needed; draws a slightly inset rectangle
    ctx.fillRect(gx*cellW+1, gy*cellH+1, cellW-2, cellH-2);
  }

  // controls
  window.addEventListener('keydown', e => {
    const k = e.key;
    if(k === 'ArrowUp' || k === 'w' || k === 'W') { if(dir.y===1) return; dir = {x:0,y:-1}; }
    if(k === 'ArrowDown' || k === 's' || k === 'S') { if(dir.y===-1) return; dir = {x:0,y:1}; }
    if(k === 'ArrowLeft' || k === 'a' || k === 'A') { if(dir.x===1) return; dir = {x:-1,y:0}; }
    if(k === 'ArrowRight' || k === 'd' || k === 'D') { if(dir.x===-1) return; dir = {x:1,y:0}; }
    // start moving on first keypress (prevents immediate self-collision)
    if((dir.x !== 0 || dir.y !== 0) && !timer && !gameOver){
      timer = setInterval(tick, speed);
    }
    // allow Enter to restart after game over
    if(gameOver && (k === 'Enter' || k === ' ')){
      start();
    }
  });

  restartBtn.addEventListener('click', ()=> start());

  // highscore helpers
  const HS_KEY = 'snake_highscore_v1';
  function getHighscore(){
    try{ return parseInt(localStorage.getItem(HS_KEY)) || 0 }catch(e){ return 0 }
  }
  function saveHighscore(){
    const hs = getHighscore();
    if(score > hs){
      try{ localStorage.setItem(HS_KEY, String(score)); }catch(e){}
      updateHighscoreDisplay();
    }
  }
  function updateHighscoreDisplay(){
    const hs = getHighscore();
    const highEl = document.getElementById('highscore');
    if(highEl) highEl.textContent = `High: ${hs}`;
  }

  // init
  start();

})();
