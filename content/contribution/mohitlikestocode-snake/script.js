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

  function start(){
    snake = [{x:10,y:10}];
    dir = {x:0,y:0};
    placeFood();
    score = 0;
    gameOver = false;
    scoreEl.textContent = 'Score: 0';
    if(timer) clearInterval(timer);
    timer = setInterval(tick, speed);
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
    // flash the canvas with red overlay
    ctx.fillStyle = 'rgba(200,30,30,0.22)';
    ctx.fillRect(0,0,width,height);
    // draw message
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over — Press Restart', width/2, height/2);
  }

  function draw(){
    // background
    ctx.fillStyle = '#071126';
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

    // draw food
    ctx.fillStyle = '#22c55e';
    rect(food.x, food.y);

    // draw snake
    for(let i=0;i<snake.length;i++){
      ctx.fillStyle = i===0 ? '#56ffa7' : '#2ec16a';
      rect(snake[i].x, snake[i].y);
    }
  }

  function rect(gx, gy){
    ctx.fillRect(gx*cellW+1, gy*cellH+1, cellW-2, cellH-2);
  }

  // controls
  window.addEventListener('keydown', e => {
    const k = e.key;
    if(k === 'ArrowUp' || k === 'w' || k === 'W') { if(dir.y===1) return; dir = {x:0,y:-1}; }
    if(k === 'ArrowDown' || k === 's' || k === 'S') { if(dir.y===-1) return; dir = {x:0,y:1}; }
    if(k === 'ArrowLeft' || k === 'a' || k === 'A') { if(dir.x===1) return; dir = {x:-1,y:0}; }
    if(k === 'ArrowRight' || k === 'd' || k === 'D') { if(dir.x===-1) return; dir = {x:1,y:0}; }
    // start moving on first keypress
    if(dir.x !== 0 || dir.y !== 0){ if(!timer) timer = setInterval(tick, speed); }
  });

  restartBtn.addEventListener('click', ()=> start());

  // init
  start();

})();
