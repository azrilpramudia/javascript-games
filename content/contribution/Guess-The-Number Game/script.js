// Guess The Number — simple logic + localStorage best score

const newGameBtn = document.getElementById('newGame');
const guessBtn = document.getElementById('guessBtn');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');
const rangeSelect = document.getElementById('range');
const difficultySelect = document.getElementById('difficulty');
const guessInput = document.getElementById('guessInput');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const remainingEl = document.getElementById('remaining');
const bestEl = document.getElementById('best');

let secret = null;
let attempts = 0;
let maxAttempts = 7;
let maxRange = 100;

const BEST_KEY = 'guess-number-best';

// load best
let best = Number(localStorage.getItem(BEST_KEY) || 0);
bestEl.textContent = best > 0 ? best : '—';

// helper to start game
function startNewGame() {
  maxRange = Number(rangeSelect.value);
  maxAttempts = Number(difficultySelect.value);
  secret = Math.floor(Math.random() * maxRange) + 1;
  attempts = 0;
  attemptsEl.textContent = attempts;
  remainingEl.textContent = maxAttempts - attempts;
  guessInput.value = '';
  guessInput.disabled = false;
  guessInput.focus();
  setMessage(`New game started: guess a number between 1 and ${maxRange}`, '');  
}

// set message with optional class: 'high' 'low' 'ok' ''
function setMessage(text, type='') {
  messageEl.textContent = text;
  messageEl.className = 'message' + (type ? ' ' + type : '');
}

// guess handler
function makeGuess() {
  const val = Number(guessInput.value);
  if (!val || val < 1 || val > maxRange) {
    setMessage(`Please enter a number between 1 and ${maxRange}.`, 'low');
    return;
  }
  attempts++;
  attemptsEl.textContent = attempts;
  remainingEl.textContent = Math.max(0, maxAttempts - attempts);

  if (val === secret) {
    setMessage(`🎉 Correct! You guessed ${secret} in ${attempts} attempts!`, 'ok');
    guessInput.disabled = true;
    // update best (fewest attempts)
    if (best === 0 || attempts < best) {
      best = attempts;
      localStorage.setItem(BEST_KEY, best);
      bestEl.textContent = best;
      setMessage(`🎉 New best: ${attempts} attempts!`, 'ok');
    }
    return;
  }

  if (attempts >= maxAttempts) {
    setMessage(`☠️ Out of attempts — the number was ${secret}. Start a new game.`, 'high');
    guessInput.disabled = true;
    return;
  }

  // give hint
  if (val < secret) {
    setMessage(`⬆️ Too low! Try a higher number.`, 'low');
  } else {
    setMessage(`⬇️ Too high! Try a lower number.`, 'high');
  }

  guessInput.select();
}

// hint: reveal range hint
function giveHint() {
  const gap = Math.max(1, Math.floor(maxRange * 0.12));
  const low = Math.max(1, secret - gap);
  const high = Math.min(maxRange, secret + gap);
  setMessage(`Hint: number is between ${low} and ${high} (inclusive)`, '');
}

// reset best
function resetBest() {
  if (!confirm('Reset best score?')) return;
  localStorage.removeItem(BEST_KEY);
  best = 0;
  bestEl.textContent = '—';
  setMessage('Best score reset.', '');
}

// event wiring
newGameBtn.addEventListener('click', startNewGame);
guessBtn.addEventListener('click', makeGuess);
hintBtn.addEventListener('click', giveHint);
resetBtn.addEventListener('click', resetBest);

// keyboard: Enter to guess
guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') makeGuess();
});

// init
setMessage('Press "New Game" to start', '');
attemptsEl.textContent = attempts;
remainingEl.textContent = maxAttempts;
