// Whack-a-Mole - simple implementation
(function(){
  const holes = Array.from(document.querySelectorAll('.hole'));
  const scoreBoard = document.getElementById('score');
  const timeDisplay = document.getElementById('time');
  const startBtn = document.getElementById('start');
  const message = document.getElementById('message');
  const difficultySelect = document.getElementById('difficulty');

  let lastHole;
  let timeUp = false;
  let score = 0;
  let gameTimer = null;
  let peepTimer = null;
  let timeLeft = 30;

  function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) return randomHole(holes);
    lastHole = hole;
    return hole;
  }

  function getDifficultyRange() {
    const d = difficultySelect.value;
    if (d === 'easy') return [900,1600];
    if (d === 'hard') return [350,700];
    return [600,1100]; // medium
  }

  function peep() {
    const [min, max] = getDifficultyRange();
    const time = randomTime(min, max);
    const hole = randomHole(holes);
    hole.classList.add('up');
    peepTimer = setTimeout(() => {
      hole.classList.remove('up');
      if (!timeUp) peep();
    }, time);
  }

  function startGame() {
    clearTimers();
    score = 0;
    scoreBoard.textContent = score;
    timeLeft = 30;
    timeDisplay.textContent = timeLeft;
    timeUp = false;
    message.textContent = '';

    // start peeping
    peep();

    gameTimer = setInterval(() => {
      timeLeft -= 1;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function clearTimers() {
    if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
    if (peepTimer) { clearTimeout(peepTimer); peepTimer = null; }
    holes.forEach(h => h.classList.remove('up'));
  }

  function endGame() {
    timeUp = true;
    clearTimers();
    message.textContent = `Time's up! Final score: ${score}`;
  }

  function whack(e) {
    if (!e.isTrusted) return; // prevent fake clicks
    const hole = e.currentTarget;
    if (!hole.classList.contains('up')) return; // only count if mole is up
    score += 1;
    hole.classList.remove('up');
    scoreBoard.textContent = score;
    // small feedback
    hole.classList.add('hit');
    setTimeout(()=> hole.classList.remove('hit'), 150);
  }

  // Attach events
  holes.forEach(h => h.addEventListener('click', whack));
  startBtn.addEventListener('click', startGame);

  // Expose for debugging (optional)
  window.whackAMole = { startGame };
})();
