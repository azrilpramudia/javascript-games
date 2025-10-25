
const DIFFICULTY = {
  easy:   { speed: 700, startLen: 3 },
  medium: { speed: 480, startLen: 4 },
  hard:   { speed: 320, startLen: 5 }
};

const pads = [
  document.getElementById('pad0'),
  document.getElementById('pad1'),
  document.getElementById('pad2'),
  document.getElementById('pad3')
];
const startBtn = document.getElementById('startBtn');
const diffSelect = document.getElementById('difficulty');
const strictBtn = document.getElementById('strictBtn');
const strictStateEl = document.getElementById('strictState');
const roundEl = document.getElementById('round');
const highEl = document.getElementById('high');
const messageEl = document.getElementById('message');

let sequence = [];
let playerIndex = 0;
let playingBack = false;
let round = 0;
let high = 0;
let strict = false;

// --- WebAudio setup ---
let audioCtx = null;
function initAudio(){
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

// pad frequencies (Hz) — pleasant major-ish set
const PAD_FREQS = [329.63, 392.00, 493.88, 523.25]; // E4, G4, B4, C5

// play a short tone for pad i, duration ms
function playTone(index, duration = 220){
  if (!audioCtx) return Promise.resolve();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = PAD_FREQS[index % PAD_FREQS.length];
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration / 1000 + 0.02);

  return new Promise(res => setTimeout(res, duration + 20));
}

// buzzer for mistakes
function playBuzzer(duration = 400){
  if (!audioCtx) return Promise.resolve();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 120; // low unpleasant tone
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration / 1000 + 0.02);
  return new Promise(res => setTimeout(res, duration + 20));
}

// success jingle (simple arpeggio)
async function playSuccess(){
  if (!audioCtx) return;
  await playTone(0, 140);
  await playTone(1, 110);
  await playTone(3, 160);
}

// utilities
function randInt(max){ return Math.floor(Math.random()*max); }
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

// light pad (visual) and play tone
async function flashPad(i, t){
  if (!pads[i]) return;
  pads[i].classList.add('lit');
  // play sound in parallel
  const p = playTone(i, t);
  await Promise.all([p, sleep(t)]);
  pads[i].classList.remove('lit');
  await sleep(120);
}

// play the sequence to player
async function playSequence(){
  playingBack = true;
  disableInput(true);
  const diff = DIFFICULTY[diffSelect.value];
  const speed = diff.speed;
  for (let i=0;i<sequence.length;i++){
    const idx = sequence[i];
    await flashPad(idx, speed);
  }
  playingBack = false;
  disableInput(false);
  messageEl.textContent = 'Your turn';
}

// start a new game
function startGame(){
  // init/resume audio on first start click (user gesture)
  try {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  } catch(e){ /* ignore */ }

  sequence = [];
  playerIndex = 0;
  round = 0;
  messageEl.textContent = 'Watch';
  nextRound();
}

// next round: add a number and play
async function nextRound(){
  // expand sequence
  sequence.push(randInt(4));
  round++;
  roundEl.textContent = round;
  messageEl.textContent = 'Watch';
  await playSequence();
}

// handle player's input
async function handleInput(i){
  if (playingBack) return;
  // play immediate feedback tone & visual
  pads[i].classList.add('lit');
  playTone(i, 160).then(()=>{}); // fire-and-forget
  setTimeout(()=> pads[i].classList.remove('lit'), 160);

  if (i === sequence[playerIndex]){
    playerIndex++;
    if (playerIndex === sequence.length){
      // round cleared
      high = Math.max(high, round);
      highEl.textContent = high;
      playerIndex = 0;
      messageEl.textContent = 'Good! Next round...';
      await playSuccess();
      await sleep(600);
      nextRound();
    } else {
      messageEl.textContent = `Keep going (${playerIndex}/${sequence.length})`;
    }
  } else {
    // mistake
    if (strict){
      messageEl.textContent = 'Wrong — Strict is ON. Game over.';
      await playBuzzer(450);
      await blinkAll(3);
      gameOver();
    } else {
      messageEl.textContent = 'Wrong — replaying sequence.';
      await playBuzzer(280);
      playerIndex = 0;
      await blinkAll(2);
      playSequence();
    }
  }
}

// visual blink for all pads
async function blinkAll(times=2){
  for(let k=0;k<times;k++){
    pads.forEach(p=>p.classList.add('lit'));
    await sleep(180);
    pads.forEach(p=>p.classList.remove('lit'));
    await sleep(140);
  }
}

// end game
function gameOver(){
  messageEl.textContent = 'Game Over — Press Start';
  sequence = [];
  playerIndex = 0;
  round = 0;
  roundEl.textContent = 0;
  disableInput(true);
}

// enable/disable pointer events on pads
function disableInput(val){
  pads.forEach(p => p.disabled = !!val); // button disabled prevents clicks
}

// event handlers
pads.forEach((p, idx) => {
  p.addEventListener('click', () => { handleInput(idx); });
});

// keyboard support (1-4)
window.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '4'){
    const idx = Number(e.key) - 1;
    handleInput(idx);
  }
});

// start button
startBtn.addEventListener('click', () => {
  disableInput(false);
  // init/resume audio here again for reliability (some browsers)
  try {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  } catch(e){ /* ignore */ }
  startGame();
});

// strict toggle
strictBtn.addEventListener('click', () => {
  strict = !strict;
  strictStateEl.textContent = strict ? 'On' : 'Off';
  strictBtn.style.boxShadow = strict ? '0 8px 20px rgba(255,90,90,0.18)' : '';
});

// init UI
(function init(){
  disableInput(true);
  roundEl.textContent = 0;
  highEl.textContent = 0;
  messageEl.textContent = 'Press Start';
})();