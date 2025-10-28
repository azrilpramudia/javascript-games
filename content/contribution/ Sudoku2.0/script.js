// Simple Sudoku implementation with preset puzzles.
(function(){
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const livesEl = document.getElementById('lives');
  const timerEl = document.getElementById('timer');
  const scoreEl = document.getElementById('score');
  const newBtn = document.getElementById('newBtn');
  const checkBtn = document.getElementById('checkBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  // Multiple preset puzzles with different difficulties
  const PUZZLES = [
    {
      name: 'Easy 1',
      puzzle: [5,3,0,0,7,0,0,0,0,6,0,0,1,9,5,0,0,0,0,9,8,0,0,0,0,6,0,8,0,0,0,6,0,0,0,3,4,0,0,8,0,3,0,0,1,7,0,0,0,2,0,0,0,6,0,6,0,0,0,0,2,8,0,0,0,0,4,1,9,0,0,5,0,0,0,0,8,0,0,7,9],
      solution: [5,3,4,6,7,8,9,1,2,6,7,2,1,9,5,3,4,8,1,9,8,3,4,2,5,6,7,8,5,9,7,6,1,4,2,3,4,2,6,8,5,3,7,9,1,7,1,3,9,2,4,8,5,6,9,6,1,5,3,7,2,8,4,2,8,7,4,1,9,6,3,5,3,4,5,2,8,6,1,7,9]
    },
    {
      name: 'Easy 2',
      puzzle: [0,2,0,6,0,8,0,0,0,5,8,0,0,0,9,7,0,0,0,0,0,0,4,0,0,0,0,3,7,0,0,0,0,5,0,0,6,0,0,0,0,0,0,0,4,0,0,8,0,0,0,0,1,3,0,0,0,0,2,0,0,0,0,0,0,9,8,0,0,0,3,6,0,0,0,3,0,6,0,9,0],
      solution: [1,2,3,6,7,8,9,4,5,5,8,4,2,3,9,7,6,1,9,6,7,1,4,5,3,2,8,3,7,2,4,6,1,5,8,9,6,9,1,5,8,3,2,7,4,4,5,8,7,9,2,6,1,3,8,3,6,9,2,4,1,5,7,2,1,9,8,5,7,4,3,6,7,4,5,3,1,6,8,9,2]
    },
    {
      name: 'Medium 1',
      puzzle: [0,0,0,0,0,0,6,8,0,0,0,0,0,6,0,0,0,3,0,7,0,0,9,0,2,0,0,0,5,0,0,0,7,0,0,0,0,0,0,3,0,0,0,7,8,0,0,0,6,0,0,0,4,0,0,0,1,0,3,0,0,2,0,7,0,0,0,2,0,0,0,0,0,4,0,0,0,0,0,0,0],
      solution: [5,4,3,2,1,9,6,8,7,9,8,2,4,6,7,1,5,3,1,7,6,5,9,3,2,4,8,2,5,8,1,4,7,9,3,6,3,1,9,3,5,2,4,7,8,6,2,4,6,7,8,3,9,1,4,3,1,9,3,5,8,2,7,7,6,5,8,2,1,3,9,4,8,9,7,7,4,6,5,1,2]
    },
    {
      name: 'Medium 2', 
      puzzle: [0,0,0,2,6,0,7,0,1,6,8,0,0,7,0,0,9,0,1,9,0,0,0,4,5,0,0,8,2,0,1,0,0,0,4,0,0,0,4,6,0,2,9,0,0,0,5,0,0,0,3,0,2,8,0,0,9,3,0,0,0,7,4,0,4,0,0,5,0,0,3,6,7,0,3,0,1,8,0,0,0],
      solution: [4,3,5,2,6,9,7,8,1,6,8,2,5,7,1,4,9,3,1,9,7,8,3,4,5,6,2,8,2,6,1,9,5,3,4,7,3,7,4,6,8,2,9,1,5,9,5,1,7,4,3,6,2,8,5,1,9,3,2,6,8,7,4,2,4,8,9,5,7,1,3,6,7,6,3,4,1,8,2,5,9]
    },
    {
      name: 'Hard 1',
      puzzle: [0,0,0,0,0,0,0,1,0,4,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,5,0,4,0,7,0,0,8,0,0,0,3,0,0,0,0,1,0,9,0,0,0,0,3,0,0,4,0,0,2,0,0,0,5,0,1,0,0,0,0,0,0,0,0,8,0,6,0,0,0],
      solution: [6,9,3,7,8,4,2,1,5,4,8,7,1,2,5,6,3,9,1,2,5,3,6,9,8,4,7,9,3,2,6,5,1,4,8,7,5,6,8,2,4,7,3,9,1,7,4,1,8,9,3,5,6,2,3,1,6,4,7,8,2,5,9,2,5,9,1,3,6,7,8,4,8,7,4,5,1,2,9,3,6]
    }
  ];

  let current = null; // {puzzle, solution, original}
  let selectedIndex = -1;
  let lives = 5;
  let gameStartTime = null;
  let gameTime = 0;
  let timerInterval = null;
  let isPaused = false;
  let gameOver = false;
  let score = 0;

  function makeCell(idx, value, prefilled){
    const cell = document.createElement('div');
    cell.className = 'cell';
    const r = Math.floor(idx/9), c = idx%9;
    // box borders
    if ((c+1)%3===0 && c!==8) cell.classList.add('box-border-right');
    if ((r+1)%3===0 && r!==8) cell.classList.add('box-border-bottom');
    cell.dataset.r = r; cell.dataset.c = c; cell.dataset.i = idx;

    if (prefilled){
      cell.classList.add('prefilled');
      cell.textContent = value;
    } else {
      const input = document.createElement('input');
      // make inputs readonly to avoid mobile keyboard when using the on-screen keypad
      input.type = 'text'; input.inputMode = 'numeric'; input.maxLength = 1; input.readOnly = true;
      input.value = value||'';
      // still allow keyboard input via global listener
      input.addEventListener('input', onInput);
      cell.appendChild(input);
      // allow selecting by tap/click
      cell.addEventListener('click', ()=> selectCell(idx));
    }
    return cell;
  }

  function render(){
    boardEl.innerHTML = '';
    const p = current.original;
    for(let i=0;i<81;i++){
      const v = p[i];
      const pre = v!==0;
      boardEl.appendChild(makeCell(i, pre?v:'' , pre));
    }
    statusEl.textContent = '';
  }

  function onInput(e){
    const val = e.target.value.replace(/[^1-9]/g,'');
    e.target.value = val;
    clearHighlights();
  }
  // keyboard handling (global) to support desktop typing even though inputs are readonly
  function onKeyDown(e){
    if (selectedIndex<0) return;
    if (e.key==='Backspace' || e.key==='Delete'){
      setCellValue(selectedIndex, 0);
      return;
    }
    if (/^[1-9]$/.test(e.key)){
      setCellValue(selectedIndex, Number(e.key));
      return;
    }
    // navigation
    if (e.key==='ArrowLeft') { moveSelection(-1); e.preventDefault(); }
    if (e.key==='ArrowRight') { moveSelection(1); e.preventDefault(); }
    if (e.key==='ArrowUp') { moveSelection(-9); e.preventDefault(); }
    if (e.key==='ArrowDown') { moveSelection(9); e.preventDefault(); }
  }

  document.addEventListener('keydown', onKeyDown);

  function collectGrid(){
    const cells = boardEl.querySelectorAll('.cell');
    const out = [];
    cells.forEach(c=>{
      if (c.classList.contains('prefilled')) out.push(Number(c.textContent)||0);
      else out.push(Number(c.querySelector('input').value)||0);
    });
    return out;
  }

  function check(){
    if (gameOver || isPaused) return;
    
    const grid = collectGrid();
    const sol = current.solution;
    clearHighlights();
    let wrongCount = 0;
    let emptyCount = 0;
    
    for(let i=0;i<81;i++){
      if (grid[i]===0) { 
        emptyCount++; 
        continue; 
      }
      if (grid[i]!==sol[i]){
        wrongCount++;
        markWrong(i);
      }
    }
    
    // show conflicts (duplicate in row/col/box)
    showConflicts(grid);
    
    if(wrongCount === 0 && emptyCount === 0){
      celebrateWin();
    } else if(wrongCount > 0) {
      showPopup('Check Results', `Found ${wrongCount} incorrect cell(s) and ${emptyCount} empty cell(s). Wrong cells are highlighted in red.`);
    } else {
      showPopup('Check Results', `No errors found! ${emptyCount} cells remaining to complete the puzzle.`);
    }
  }

  function showConflicts(grid){
    // rows
    for(let r=0;r<9;r++){
      const seen = {};
      for(let c=0;c<9;c++){
        const v = grid[r*9+c];
        if(!v) continue;
        const key = v;
        if(seen[key]!==undefined){
          markConflict(r*9+c); markConflict(seen[key]);
        } else seen[key]=r*9+c;
      }
    }
    // cols
    for(let c=0;c<9;c++){
      const seen = {};
      for(let r=0;r<9;r++){
        const v = grid[r*9+c]; if(!v) continue;
        if(seen[v]!==undefined){ markConflict(r*9+c); markConflict(seen[v]); }
        else seen[v]=r*9+c;
      }
    }
    // boxes
    for(let br=0;br<3;br++) for(let bc=0;bc<3;bc++){
      const seen = {};
      for(let r=0;r<3;r++) for(let c=0;c<3;c++){
        const rr = br*3+r, cc = bc*3+c; const v = grid[rr*9+cc]; if(!v) continue;
        if(seen[v]!==undefined){ markConflict(rr*9+cc); markConflict(seen[v]); }
        else seen[v]=rr*9+cc;
      }
    }
  }

  function markWrong(i){
    const cell = boardEl.children[i];
    cell.classList.add('wrong');
  }
  function markConflict(i){
    const cell = boardEl.children[i];
    cell.classList.add('conflict');
  }
  function clearHighlights(){
    boardEl.querySelectorAll('.cell').forEach(c=> c.classList.remove('wrong','conflict'));
  }

  function hint(){
    const grid = collectGrid();
    const empties = [];
    for(let i=0;i<81;i++) if(grid[i]===0) empties.push(i);
    if(empties.length===0){ statusEl.textContent='No empty cells to hint.'; return; }
    const idx = empties[Math.floor(Math.random()*empties.length)];
    const val = current.solution[idx];
    const cell = boardEl.children[idx];
    if(!cell.classList.contains('prefilled')){
      setCellValue(idx, val, true);
      cell.classList.add('hint');
      setTimeout(()=>cell.classList.remove('hint'), 900);
    }
    clearHighlights(); statusEl.textContent = 'Hint filled one cell.';
  }

  function solve(){
    for(let i=0;i<81;i++){
      const cell = boardEl.children[i];
      if(cell.classList.contains('prefilled')) continue;
      setCellValue(i, current.solution[i]);
    }
    clearHighlights(); statusEl.textContent='Solution shown.';
  }

  function reset(){
    if (gameOver) return;
    
    showPopup('Reset Game', 'Are you sure you want to reset? This will clear all progress.', [
      { text: 'Cancel', action: 'this.closest(\'.modal\').remove();', class: 'secondary' },
      { text: 'Reset', action: 'this.closest(\'.modal\').remove(); doReset();', class: 'primary' }
    ]);
  }

  function doReset() {
    // Reset to original puzzle state
    current.original = current.puzzle.slice();
    
    // Reset game state but keep same puzzle
    lives = 5;
    gameTime = 0;
    gameStartTime = Date.now();
    gameOver = false;
    isPaused = false;
    score = 0;
    selectedIndex = -1;
    
    render();
    updateLives();
    updateScore();
    startTimer();
    statusEl.textContent = 'Game reset. Timer restarted.';
  }

  function newPuzzle(){
    const pick = PUZZLES[Math.floor(Math.random()*PUZZLES.length)];
    current = { puzzle: pick.puzzle.slice(), solution: pick.solution.slice(), original: pick.puzzle.slice(), name: pick.name };
    lives = 5;
    gameTime = 0;
    gameStartTime = Date.now();
    gameOver = false;
    isPaused = false;
    score = 0;
    selectedIndex = -1;
    
    render();
    updateLives();
    updateScore();
    startTimer();
    statusEl.textContent = `New puzzle: ${pick.name}`;
  }
  
  function updateLives() {
    livesEl.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.innerHTML = '❤️';
      heart.classList.add(i < lives ? 'full' : 'empty');
      livesEl.appendChild(heart);
    }
  }
  
  function updateScore() {
    scoreEl.textContent = score;
  }
  
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isPaused && !gameOver) {
        gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }
  
  function loseLife() {
    if (gameOver) return;
    
    lives--;
    updateLives();
    
    // Animate heart loss
    const hearts = livesEl.querySelectorAll('.heart');
    if (hearts[lives]) {
      hearts[lives].animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1.5)', opacity: 0.5 },
        { transform: 'scale(0.8)', opacity: 0.3 }
      ], { duration: 500 });
    }
    
    if (lives <= 0) {
      gameOver = true;
      showGameOverModal();
    } else {
      statusEl.textContent = `Wrong! ${lives} lives remaining`;
    }
  }
  
  function showPopup(title, message, buttons = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const buttonsHtml = buttons.length > 0 
      ? buttons.map(btn => `<button onclick="${btn.action}" class="${btn.class || ''}">${btn.text}</button>`).join('')
      : '<button onclick="this.closest(\'.modal\').remove();">OK</button>';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${title}</h2>
        <p>${message}</p>
        <div class="modal-buttons">${buttonsHtml}</div>
      </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
  }

  function showGameOverModal() {
    showPopup('Game Over!', `You've run out of lives. Better luck next time!<br>Time: ${timerEl.textContent}`, [
      { text: 'New Game', action: 'this.closest(\'.modal\').remove(); newPuzzle();', class: 'primary' }
    ]);
  }
  
  function celebrateWin() {
    gameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    
    // Calculate bonus score
    const timeBonus = Math.max(0, 300 - gameTime); // up to 300 points for speed
    const livesBonus = lives * 100; // 100 points per remaining life
    score = timeBonus + livesBonus;
    updateScore();
    
    // Animate all cells
    const cells = boardEl.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
      setTimeout(() => {
        cell.style.animation = 'celebration 0.6s ease';
      }, i * 20);
    });
    
    statusEl.innerHTML = `🎉 Congratulations! Puzzle solved! 🎉<br>Score: ${score} points`;
  }

  // selection and keypad support
  function selectCell(i){
    if (gameOver || isPaused) return;
    // don't select prefilled
    const cell = boardEl.children[i];
    if(!cell || cell.classList.contains('prefilled')) return;
    if (selectedIndex>=0) boardEl.children[selectedIndex].classList.remove('selected');
    selectedIndex = i;
    cell.classList.add('selected');
    // show hint/status
    if (!gameOver && !isPaused) {
      statusEl.textContent = `Selected cell ${Math.floor(i/9)+1},${(i%9)+1}`;
    }
  }

  function moveSelection(delta){
    let cur = selectedIndex;
    if (cur<0) cur = 0;
    let next = cur + delta;
    if (next<0 || next>=81) return;
    selectCell(next);
  }

  function setCellValue(i, val, suppressStatus){
    if (gameOver || isPaused) return;
    const cell = boardEl.children[i];
    if(!cell || cell.classList.contains('prefilled')) return;
    const input = cell.querySelector('input');
    input.value = val?String(val):'';
    // tiny animation
    cell.animate([{ transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 160 });
    // real-time conflict detection
    clearHighlights();
    const grid = collectGrid();
    showConflicts(grid);

    // immediate correctness check: if a non-empty value is placed and it's wrong,
    // lose a life and clear the value
    if (val && current && current.solution && !gameOver){
      const correct = current.solution[i];
      if (Number(val) !== correct){
        // show red feedback
        cell.classList.add('wrong');
        
        // lose a life
        loseLife();
        
        // remove the wrong value after a short delay
        setTimeout(()=>{
          if (!gameOver) { // only clear if game isn't over
            input.value = '';
            cell.classList.remove('wrong');
            clearHighlights();
            showConflicts(collectGrid());
          }
        }, 800);
        return;
      }
    }

    // check for solved
    if(grid.every((v,i)=> v!==0 && v===current.solution[i])){
      celebrateWin();
    } else if(!suppressStatus && !gameOver){
      statusEl.textContent = '';
    }
  }

  // keypad wiring
  const keypad = document.getElementById('keypad');
  if (keypad){
    keypad.addEventListener('click', (e)=>{
      if (gameOver || isPaused) return;
      
      const key = e.target.closest('.key');
      if (!key) return;
      
      // Add press animation
      key.style.transform = 'scale(0.95)';
      setTimeout(() => key.style.transform = '', 150);
      
      const k = key.dataset.key;
      if (k==='erase'){
        if (selectedIndex>=0) setCellValue(selectedIndex, 0);
      } else if (k==='hint'){
        hint();
        // Small score penalty for using hints
        score = Math.max(0, score - 20);
        updateScore();
      } else if (k==='clear'){
        if (selectedIndex>=0) setCellValue(selectedIndex, 0);
      } else {
        if (selectedIndex<0){ 
          showPopup('No Cell Selected', 'Please select a cell first by clicking on an empty cell.');
          return; 
        }
        setCellValue(selectedIndex, Number(k));
        // move to next cell for faster input
        moveSelection(1);
      }
    });
  }


  function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (isPaused) {
      boardEl.style.filter = 'blur(5px)';
      statusEl.textContent = 'Game Paused';
    } else {
      boardEl.style.filter = 'none';
      statusEl.textContent = '';
    }
  }

  // wire buttons
  newBtn.addEventListener('click', newPuzzle);
  checkBtn.addEventListener('click', check);
  resetBtn.addEventListener('click', reset);
  pauseBtn.addEventListener('click', ()=>{ if (!gameOver) togglePause(); });

  // start
  newPuzzle();

})();
