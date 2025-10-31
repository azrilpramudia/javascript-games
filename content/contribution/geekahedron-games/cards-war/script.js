// script.js — Cards: War with step-by-step war resolution, button toggle, and restart

// ---------- Deck setup ----------
const suits = ["♠", "♥", "♦", "♣"];
const ranks = [
  { name: "2", value: 2 }, { name: "3", value: 3 }, { name: "4", value: 4 },
  { name: "5", value: 5 }, { name: "6", value: 6 }, { name: "7", value: 7 },
  { name: "8", value: 8 }, { name: "9", value: 9 }, { name: "10", value: 10 },
  { name: "J", value: 11 }, { name: "Q", value: 12 }, { name: "K", value: 13 },
  { name: "A", value: 14 }
];

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank: rank.name, value: rank.value });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ---------- Game state ----------
let player1Deck = [];
let player2Deck = [];
let contestPile = [];
let warPending = false;
let lastRevealed = { p1: null, p2: null };

const WAR_FACE_DOWN = 3;

// ---------- UI elements (expects these IDs in HTML) ----------
const card1El = document.getElementById("card1");
const card2El = document.getElementById("card2");
const stackCount1El = document.getElementById("stack-count1");
const stackCount2El = document.getElementById("stack-count2");
const resultEl = document.getElementById("result");
const nextRoundBtn = document.getElementById("next-round");
const continueWarBtn = document.getElementById("continue-war");
const restartBtn = document.getElementById("restart-btn");

// ---------- UI helpers ----------
function renderCardElement(element, card) {
  if (!element) return;
  if (!card) {
    element.innerHTML = "";
    element.setAttribute("aria-label", "face down card");
    return;
  }
  element.innerHTML = `${card.rank}${card.suit}`;
  element.setAttribute("aria-label", `${card.rank} of ${card.suit}`);
}

function updateCounts() {
  if (stackCount1El) stackCount1El.textContent = player1Deck.length;
  if (stackCount2El) stackCount2El.textContent = player2Deck.length;
}

function showContinueWar() {
  if (continueWarBtn) continueWarBtn.style.display = "inline-block";
  if (nextRoundBtn) nextRoundBtn.style.display = "none";
}

function hideContinueWar() {
  if (continueWarBtn) continueWarBtn.style.display = "none";
  if (nextRoundBtn) nextRoundBtn.style.display = "inline-block";
}

function setGameControlsEnabled(enabled) {
  if (nextRoundBtn) nextRoundBtn.disabled = !enabled;
  if (continueWarBtn) continueWarBtn.disabled = !enabled;
}

// ---------- Game lifecycle ----------
function startGame() {
  const fullDeck = shuffle(createDeck());
  player1Deck = fullDeck.slice(0, 26);
  player2Deck = fullDeck.slice(26);
  contestPile = [];
  warPending = false;
  lastRevealed = { p1: null, p2: null };
  renderCardElement(card1El, null);
  renderCardElement(card2El, null);
  resultEl.textContent = "Game started! Click Play Round to draw.";
  hideContinueWar();
  if (restartBtn) restartBtn.style.display = "none";
  setGameControlsEnabled(true);
  updateCounts();
}

function endGame() {
  warPending = false;
  hideContinueWar();
  setGameControlsEnabled(false); // disable play + continue buttons
  if (player1Deck.length === 0 && player2Deck.length === 0) {
    resultEl.textContent = "Game over: draw.";
  } else if (player1Deck.length === 0) {
    resultEl.textContent = "Player 2 wins the game!";
  } else if (player2Deck.length === 0) {
    resultEl.textContent = "Player 1 wins the game!";
  }
  if (restartBtn) restartBtn.style.display = "inline-block"; // show restart option
}

// ---------- Helpers for card movement ----------
function drawCards(deck, n) {
  const drawn = [];
  for (let i = 0; i < n && deck.length > 0; i++) drawn.push(deck.shift());
  return drawn;
}

function awardContestTo(winnerDeck) {
  winnerDeck.push(...contestPile);
  contestPile = [];
  lastRevealed = { p1: null, p2: null };
  warPending = false;
  hideContinueWar();
  updateCounts();
}

// ---------- Core gameplay: Play Round ----------
function playRound() {
  if (warPending) {
    resultEl.textContent = "War is pending — click Continue War to resolve it.";
    return;
  }

  if (player1Deck.length === 0 || player2Deck.length === 0) {
    endGame();
    return;
  }

  const c1 = player1Deck.shift();
  const c2 = player2Deck.shift();
  contestPile.push(c1, c2);

  renderCardElement(card1El, c1);
  renderCardElement(card2El, c2);
  lastRevealed.p1 = c1;
  lastRevealed.p2 = c2;
  updateCounts();

  if (c1.value > c2.value) {
    resultEl.textContent = "Player 1 wins the round!";
    awardContestTo(player1Deck);
  } else if (c2.value > c1.value) {
    resultEl.textContent = "Player 2 wins the round!";
    awardContestTo(player2Deck);
  } else {
    resultEl.textContent = "War! Click Continue War to place face-down cards and reveal.";
    warPending = true;
    showContinueWar();
  }

  if (player1Deck.length === 0 || player2Deck.length === 0) {
    endGame();
  }
}

// ---------- Step-by-step war resolution ----------
function continueWarStep() {
  if (!warPending) {
    resultEl.textContent = "No war pending. Click Play Round to start a new battle.";
    return;
  }

  const p1Down = drawCards(player1Deck, WAR_FACE_DOWN);
  const p2Down = drawCards(player2Deck, WAR_FACE_DOWN);
  contestPile.push(...p1Down, ...p2Down);

  const p1Up = player1Deck.length > 0 ? player1Deck.shift() : null;
  const p2Up = player2Deck.length > 0 ? player2Deck.shift() : null;

  if (!p1Up && !p2Up) {
    resultEl.textContent = "Both players ran out during war. Splitting contested cards.";
    while (contestPile.length) {
      if (player1Deck.length <= player2Deck.length) player1Deck.push(contestPile.shift());
      else player2Deck.push(contestPile.shift());
    }
    warPending = false;
    hideContinueWar();
    updateCounts();
    return;
  } else if (!p1Up) {
    if (p2Up) contestPile.push(p2Up);
    player2Deck.push(...contestPile);
    contestPile = [];
    warPending = false;
    hideContinueWar();
    resultEl.textContent = "Player 1 cannot continue war. Player 2 collects the pile and wins the game!";
    updateCounts();
    endGame();
    return;
  } else if (!p2Up) {
    if (p1Up) contestPile.push(p1Up);
    player1Deck.push(...contestPile);
    contestPile = [];
    warPending = false;
    hideContinueWar();
    resultEl.textContent = "Player 2 cannot continue war. Player 1 collects the pile and wins the game!";
    updateCounts();
    endGame();
    return;
  }

  contestPile.push(p1Up, p2Up);
  renderCardElement(card1El, p1Up);
  renderCardElement(card2El, p2Up);
  lastRevealed.p1 = p1Up;
  lastRevealed.p2 = p2Up;
  updateCounts();

  if (p1Up.value > p2Up.value) {
    resultEl.textContent = "Player 1 wins the war and collects the pile!";
    awardContestTo(player1Deck);
  } else if (p2Up.value > p1Up.value) {
    resultEl.textContent = "Player 2 wins the war and collects the pile!";
    awardContestTo(player2Deck);
  } else {
    resultEl.textContent = "War again! Click Continue War to escalate.";
    warPending = true;
    showContinueWar();
  }

  if (player1Deck.length === 0 || player2Deck.length === 0) {
    endGame();
  }
}

// Auto-Play

// Auto-play state
let autoIntervalId = null;
let autoRunning = false;

function getAutoDelay() {
  const slider = document.getElementById("auto-speed");
  return slider ? Number(slider.value) : 400;
}

function setAutoControls(enabled) {
  // disable manual controls when auto is running
  const nextBtn = document.getElementById("next-round");
  const contBtn = document.getElementById("continue-war");
  const autoBtn = document.getElementById("auto-toggle");
  if (nextBtn) nextBtn.disabled = !enabled;
  if (contBtn) contBtn.disabled = !enabled;
  if (autoBtn) autoBtn.disabled = false; // auto button remains clickable
}

// Start auto-play loop
async function startAuto() {
  if (autoRunning) return;
  autoRunning = true;
  setPlayButtonVisuallyDisabled(true);
  document.getElementById("auto-toggle").textContent = "Auto: On";
  setAutoControls(false);
  // use an async loop rather than setInterval so we can await delays and war steps
  while (autoRunning) {
    // If game ended, stop
    if (!player1Deck.length || !player2Deck.length) break;

    if (warPending) {
      // automatically continue the war one step
      continueWarStep();
      await sleep(getAutoDelay());
      // continue the loop so if another war is pending it will continue automatically
      continue;
    }

    // no war pending: play a round
    playRound();
    await sleep(getAutoDelay());

    // If playRound triggered a war, the next loop iteration will handle it
  }

  stopAuto();
}

function setPlayButtonVisuallyDisabled(disabled) {
  const playBtn = document.getElementById("next-round");
  if (!playBtn) return;
  playBtn.disabled = disabled;
  playBtn.classList.toggle("disabled-look", disabled);
}

// Stop auto-play
function stopAuto() {
  autoRunning = false;
  setPlayButtonVisuallyDisabled(false);
  document.getElementById("auto-toggle").textContent = "Auto: Off";
  setAutoControls(true);
  // ensure manual buttons are in the right visible state wrt warPending
  if (warPending) showContinueWar();
  else hideContinueWar();
}

// tiny sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Display auto speed
const speedSlider = document.getElementById("auto-speed");
const speedValue = document.getElementById("auto-speed-value");
if (speedSlider && speedValue) {
  speedSlider.addEventListener("input", () => {
    speedValue.textContent = `${speedSlider.value}ms`;
  });
}


// Toggle handler for the Auto button
const autoBtn = document.getElementById("auto-toggle");
if (autoBtn) {
  autoBtn.addEventListener("click", () => {
    if (autoRunning) stopAuto();
    else startAuto();
  });
}

// When Restart or endGame runs, ensure auto stops
const restartBtnEl = document.getElementById("restart-btn");
if (restartBtnEl) restartBtnEl.addEventListener("click", () => {
  stopAuto();
  restartGame();
});

// Also stop auto if the user manually clicks Continue War or Play Round
const continueWarBtnEl = document.getElementById("continue-war");
if (continueWarBtnEl) continueWarBtnEl.addEventListener("click", () => {
  stopAuto();
});
const nextRoundBtnEl = document.getElementById("next-round");
if (nextRoundBtnEl) nextRoundBtnEl.addEventListener("click", () => {
  stopAuto();
});

// If sleep is not desired for a given environment you can replace await sleep(...) with setTimeout-based pacing.


// ---------- Restart ----------
function restartGame() {
  startGame();
}

// ---------- Event listeners ----------
nextRoundBtn.addEventListener("click", () => {
  if (!player1Deck.length && !player2Deck.length) {
    startGame();
    return;
  }
  playRound();
});

continueWarBtn.addEventListener("click", () => {
  continueWarStep();
});

if (restartBtn) restartBtn.addEventListener("click", () => restartGame());

// Start automatically on load
startGame();
