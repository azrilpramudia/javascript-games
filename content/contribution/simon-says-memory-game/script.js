(function(){
  const startBtn = document.getElementById('startBtn');
  const board = document.getElementById('board');
  const levelEl = document.getElementById('level');
  const scoreEl = document.getElementById('score');

  let sequence = [];
  let playerIndex = 0;
  let accepting = false;
  let level = 0;
  let score = 0;
  let numTiles = 4;
  let tiles = [];

  const COLORS = ['#2563eb','#16a34a','#f59e0b','#9333ea','#ef4444','#0ea5e9','#22c55e','#eab308'];

  function setStatus(){
    levelEl.textContent = level;
    scoreEl.textContent = score;
    startBtn.textContent = (sequence.length ? 'Restart' : 'Start Game');
  }

  function createTiles(n){
    board.innerHTML = '';
    tiles = [];
    const grid = Math.ceil(Math.sqrt(n));
    board.style.gridTemplateColumns = `repeat(${grid}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${grid}, 1fr)`;
    for(let i=0;i<n;i++){
      const d = document.createElement('div');
      d.className = 'tile';
      d.style.background = COLORS[i % COLORS.length];
      d.textContent = (i+1);
      d.dataset.id = String(i);
      d.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        handlePlayerInput(i);
      });
      d.tabIndex = 0;
      d.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlayerInput(i);
        }
      });
      tiles.push(d);
      board.appendChild(d);
    }
  }

  function rndIndex(){ return Math.floor(Math.random()*numTiles); }

  function flash(i, duration=420){
    const el = tiles[i];
    if(!el) return;
    el.classList.add('flash');
    setTimeout(()=> el.classList.remove('flash'), duration);
  }

  async function playSequence(){
    accepting = false;
    await wait(300);
    for(let i=0;i<sequence.length;i++){
      flash(sequence[i]);
      await wait(480 - Math.min(level*6, 300));
    }
    playerIndex = 0;
    accepting = true;
  }

  function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

  function nextLevel(){
    level++;
    if((level - 1) % 5 === 0 && level > 1){
      numTiles++;
      numTiles = Math.min(numTiles, 12);
      createTiles(numTiles);
    }
    sequence.push(rndIndex());
    setStatus();
    playSequence();
  }

  function handlePlayerInput(id){
    if(!accepting) return;
    flash(id, 260);
    if(id === sequence[playerIndex]){
      playerIndex++;
      score++;
      setStatus();
      if(playerIndex === sequence.length){
        accepting = false;
        setTimeout(nextLevel, 520);
      }
    } else {
      accepting = false;
      indicateLoss();
    }
  }

  function indicateLoss(){
    board.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' }
    ], { duration: 380, easing: 'ease-out' });
    for(let i=0;i<tiles.length;i++){
      setTimeout(()=> flash(i, 160), i*40);
    }
    setTimeout(()=> startGame(true), 700);
  }

  function startGame(){
    sequence = [];
    playerIndex = 0;
    accepting = false;
    level = 0;
    score = 0;
    numTiles = 4;
    createTiles(numTiles);
    setStatus();
    setTimeout(nextLevel, 300);
  }

  startBtn.addEventListener('click', () => {
    startGame(true);
  });

  createTiles(numTiles);
  setStatus();

  board.addEventListener('keydown', e => {
    if(e.key >= '1' && e.key <= '9'){
      const idx = Number(e.key) - 1;
      if(idx < tiles.length) handlePlayerInput(idx);
    }
  });

  document.addEventListener('touchmove', e => e.preventDefault(), { passive:false });
})();
