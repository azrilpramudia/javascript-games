// script.js - Blackjack single-player with Split (no resplitting)
// Plain script (not a module). Ensure this script is loaded with defer or after DOM ready.

///// Constants and state
const SUITS = ["♠","♥","♦","♣"];
const RANKS = [
  {name:"2",value:2},{name:"3",value:3},{name:"4",value:4},{name:"5",value:5},
  {name:"6",value:6},{name:"7",value:7},{name:"8",value:8},{name:"9",value:9},
  {name:"10",value:10},{name:"J",value:10},{name:"Q",value:10},{name:"K",value:10},{name:"A",value:11}
];

let deck = [];
let dealerHand = [];
let playerHands = [];    // array of hands (each hand is an array of cards)
let playerBets = [];     // parallel array of bets per hand
let activeHandIndex = 0;

let balance = 100;
let currentBet = 10;
let inRound = false;
let splitAllowed = false;

///// DOM element bindings (populated after DOM ready)
let el = {};

function bindElements() {
  el = {
    balance: document.getElementById("balance"),
    betInput: document.getElementById("bet-input"),
    betMax: document.getElementById("bet-max"),
    dealBtn: document.getElementById("deal-btn"),
    hitBtn: document.getElementById("hit-btn"),
    standBtn: document.getElementById("stand-btn"),
    doubleBtn: document.getElementById("double-btn"),
    splitBtn: document.getElementById("split-btn"),
    restartBtn: document.getElementById("restart-btn"),
    result: document.getElementById("result"),
    playerHandEl: document.getElementById("player-hand"),
    dealerHandEl: document.getElementById("dealer-hand"),
    playerTotalEl: document.getElementById("player-total"),
    dealerTotalEl: document.getElementById("dealer-total"),
    stackCount: document.getElementById("stack-count")
  };

  Object.entries(el).forEach(([k,v])=>{
    if (!v) console.warn(`Missing DOM element: ${k}`);
  });
}

///// Deck helpers
function createDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r.name, value: r.value });
  return d;
}
function shuffle(d) {
  for (let i = d.length -1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
function ensureDeck() {
  if (!deck || deck.length < 15) {
    // use a single 52-card deck for Blackjack (reshuffle when low)
    deck = shuffle(createDeck());
  }
  updateStackCounts();
}
function draw() {
  ensureDeck();
  return deck.shift();
}

///// Hand utilities
function handValue(hand) {
  let total = hand.reduce((s,c)=>s+(c.value||0),0);
  let aces = hand.filter(c => c.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}
function isBlackjack(hand) {
  return hand.length === 2 && handValue(hand) === 21;
}
function cardValueForSplit(card) {
  if (!card) return null;
  if (["J","Q","K"].includes(card.rank)) return "10";
  return card.rank;
}

///// Rendering
function renderCard(card, hidden=false) {
  const div = document.createElement("div");
  div.className = "card" + (hidden ? " face-down" : "");
  if (hidden) return div;
  const rank = document.createElement("span");
  rank.className = "rank";
  rank.textContent = card.rank;
  const suit = document.createElement("span");
  suit.className = "suit";
  suit.textContent = card.suit;
  if (card.suit === "♥" || card.suit === "♦") suit.style.color = "#e53935";
  div.appendChild(rank);
  div.appendChild(suit);
  return div;
}

function renderHands(showDealerHole=false) {
  // dealer
  el.dealerHandEl.innerHTML = "";
  dealerHand.forEach((c,i) => {
    const hidden = (i === 1 && !showDealerHole && inRound);
    el.dealerHandEl.appendChild(renderCard(c, hidden));
  });
  el.dealerTotalEl.textContent = showDealerHole ? `Total: ${handValue(dealerHand)}` : `Showing: ${dealerHand[0] ? dealerHand[0].value : 0}`;

  // player: render each hand, highlight active
  el.playerHandEl.innerHTML = "";
  playerHands.forEach((hand, idx) => {
    const container = document.createElement("div");
    container.className = "split-hand";
    if (idx === activeHandIndex) container.classList.add("active-hand");

    const label = document.createElement("div");
    label.className = "split-label";
    label.textContent = (playerHands.length > 1) ? `Hand ${idx+1}` : '';
    container.appendChild(label);

    const cardsWrap = document.createElement("div");
    cardsWrap.className = "split-cards";
    hand.forEach(c => cardsWrap.appendChild(renderCard(c,false)));
    container.appendChild(cardsWrap);

    const total = document.createElement("div");
    total.className = "split-total";
    total.textContent = (handValue(hand) <= 21) ? `Total: ${handValue(hand)}` : `BUST: ${handValue(hand)}`;
    container.appendChild(total);

    el.playerHandEl.appendChild(container);
  });

  updateStackCounts();
}

function setButtons(state = {}) {
  // state expects booleans: dealDisabled, hitDisabled, standDisabled, doubleDisabled
  // enforce Deal disabled when in round or when zero balance
  const dealShouldBeDisabled = !!state.dealDisabled || inRound || (balance < 1);
  if (el.dealBtn) el.dealBtn.disabled = dealShouldBeDisabled;

  if (el.hitBtn) el.hitBtn.disabled = !!state.hitDisabled;
  if (el.standBtn) el.standBtn.disabled = !!state.standDisabled;
  if (el.doubleBtn) el.doubleBtn.disabled = !!state.doubleDisabled;

  // Split button state comes from splitAllowed
  if (el.splitBtn) el.splitBtn.disabled = !splitAllowed;

  // Disable bet controls whenever Deal is disabled (so user can't change bet mid-round)
  const betControlsDisabled = dealShouldBeDisabled;

  // make the bet input readonly rather than disabled so value remains readable and selectable
  if (el.betInput) {
    el.betInput.readOnly = betControlsDisabled;
    el.betInput.setAttribute('aria-readonly', betControlsDisabled ? 'true' : 'false');
  }
  if (el.betMax) el.betMax.disabled = betControlsDisabled;


  // If balance is zero, ensure Deal is disabled and show Restart
  if (balance <= 0) {
    if (el.dealBtn) el.dealBtn.disabled = true;
    if (el.restartBtn) el.restartBtn.style.display = "inline-block";
  } else {
    if (el.restartBtn) el.restartBtn.style.display = "none";
  }
}


function updateBalance() {
  if (el.balance) el.balance.textContent = balance;
}
function updateStackCounts() {
  if (el.stackCount) el.stackCount.textContent = deck.length;
}

///// Game flow
function startNewRound() {
  currentBet = Math.max(1, Math.floor(Number(el.betInput.value) || 1));
  if (currentBet > balance) {
    el.result.textContent = "Bet exceeds balance.";
    return;
  }

  // pay initial bet
  balance -= currentBet;
  updateBalance();

  inRound = true;
  activeHandIndex = 0;

  // initial deal
  playerHands = [ [ draw(), draw() ] ];
  playerBets = [ currentBet ];
  dealerHand = [ draw(), draw() ];

  // determine if split allowed (two cards same "value" and enough remaining balance)
  const p1 = playerHands[0];
  splitAllowed = (p1.length === 2 &&
                  cardValueForSplit(p1[0]) === cardValueForSplit(p1[1]) &&
                  balance >= currentBet);
  if (el.splitBtn) el.splitBtn.disabled = !splitAllowed;

  renderHands(false);
  el.result.textContent = "";

  // Blackjack checks (only initial single-hand BJ scenario)
  const playerBJ = isBlackjack(p1);
  const dealerBJ = isBlackjack(dealerHand);
  if (playerBJ || dealerBJ) {
    renderHands(true);
    if (playerBJ && dealerBJ) {
      balance += currentBet; // push
      el.result.textContent = "Push — both blackjack.";
    } else if (playerBJ) {
      balance += Math.floor(currentBet * 2.5); // 3:2 payout
      el.result.textContent = "Blackjack! You win 3:2.";
    } else {
      el.result.textContent = "Dealer blackjack — you lose.";
    }
    inRound = false;
    setButtons({ dealDisabled: false, hitDisabled: true, standDisabled: true, doubleDisabled: true });
    updateBalance();
    return;
  }

  // normal flow - allow actions for the active hand
  setButtons({ dealDisabled: true, hitDisabled: false, standDisabled: false, doubleDisabled: (balance < playerBets[activeHandIndex]) });
  renderHands(false);
}

function onSplit() {
  if (!inRound || !splitAllowed) return;
  const original = playerHands[0];
  if (original.length !== 2) return;
  if (balance < currentBet) {
    el.result.textContent = "Not enough balance to split.";
    return;
  }

  // pay second bet
  balance -= currentBet;
  updateBalance();

  // form two hands, one card each from original + one draw each
  const a = original[0], b = original[1];
  const hand1 = [ a, draw() ];
  const hand2 = [ b, draw() ];
  playerHands = [ hand1, hand2 ];
  playerBets = [ currentBet, currentBet ];
  activeHandIndex = 0;

  splitAllowed = false;
  if (el.splitBtn) el.splitBtn.disabled = true;

  setButtons({ dealDisabled: true, hitDisabled: false, standDisabled: false, doubleDisabled: (balance < playerBets[activeHandIndex]) });
  renderHands(false);
  el.result.textContent = `Split performed. Playing hand 1 of ${playerHands.length}.`;
}

function playerHit() {
  if (!inRound) return;
  const hand = playerHands[activeHandIndex];
  hand.push(draw());
  renderHands(false);
  const v = handValue(hand);
    if (v > 21) {
    const prefix = (playerHands.length === 1) ? '' : `Hand ${activeHandIndex+1} `;
    el.result.textContent = `${prefix}busted (${v}).`;
    proceedToNextHandOrDealer();
    } else {
    setButtons({ dealDisabled: true, hitDisabled: false, standDisabled: false, doubleDisabled: (balance < playerBets[activeHandIndex]) });
  }
}

function playerDouble() {
  if (!inRound) return;
  const handBet = playerBets[activeHandIndex];
  if (balance < handBet) return;
  // take one card, double bet, then stand this hand
  balance -= handBet;
  playerBets[activeHandIndex] = handBet * 2;
  updateBalance();

  const hand = playerHands[activeHandIndex];
  hand.push(draw());
  renderHands(false);

  proceedToNextHandOrDealer();
}

function playerStand() {
  if (!inRound) return;
  proceedToNextHandOrDealer();
}

function proceedToNextHandOrDealer() {
  if (activeHandIndex + 1 < playerHands.length) {
    activeHandIndex++;
    setButtons({
      dealDisabled: true,
      hitDisabled: false,
      standDisabled: false,
      doubleDisabled: (balance < playerBets[activeHandIndex])
    });
    renderHands(false);
    el.result.textContent = `Playing hand ${activeHandIndex + 1}`;
  } else {
    // all player hands done -> dealer plays
    setButtons({ dealDisabled: true, hitDisabled: true, standDisabled: true, doubleDisabled: true });
    renderHands(true);
    dealerPlay();
  }
}

function dealerPlay() {
  // Dealer hits until 17 or more (soft-17 stands)
  while (handValue(dealerHand) < 17) dealerHand.push(draw());
  renderHands(true);
  resolveRound();
}

function resolveRound() {
  const dVal = handValue(dealerHand);
  const messages = [];
  const singleHand = playerHands.length === 1;

  playerHands.forEach((hand, idx) => {
    const bet = playerBets[idx] || currentBet;
    const pVal = handValue(hand);
    let msgBody = '';

    if (pVal > 21) {
      msgBody = `Busted — lose $${bet}.`;
    } else if (dVal > 21) {
      balance += bet * 2;
      msgBody = `Dealer busts — win $${bet}.`;
    } else if (isBlackjack(hand) && hand.length === 2 && singleHand) {
      balance += Math.floor(bet * 2.5);
      msgBody = `Blackjack!`;
    } else if (pVal > dVal) {
      balance += bet * 2;
      msgBody = `Win $${bet}.`;
    } else if (pVal < dVal) {
      msgBody = `Lose $${bet}.`;
    } else {
      balance += bet;
      msgBody = `Push.`;
    }

    const prefix = singleHand ? '' : `Hand ${idx+1}: `;
    messages.push(prefix + msgBody);
  });

  el.result.innerHTML = messages.map(m => `<div>${m}</div>`).join('');
  inRound = false;
  setButtons({ dealDisabled: false, hitDisabled: true, standDisabled: true, doubleDisabled: true });
  updateBalance();
}


///// Controls wiring
function wireEvents() {
  el.dealBtn.addEventListener("click", () => { if (!inRound) startNewRound(); });
  el.hitBtn.addEventListener("click", playerHit);
  el.standBtn.addEventListener("click", playerStand);
  el.doubleBtn.addEventListener("click", playerDouble);
  if (el.splitBtn) el.splitBtn.addEventListener("click", onSplit);

    // Restart: only used as a bankrupt reset to default balance
    el.restartBtn.addEventListener("click", () => {
    balance = 100;
    updateBalance();
    resetTable(); // clears hands, ensures deck, hides restart via setButtons logic
    });

el.betMax.addEventListener("click", () => {
  if (el.betMax.disabled) return;
  el.betInput.value = Math.max(1, balance);
});
// Robust keyboard shortcuts (place inside wireEvents or after you bind elements)'

    document.addEventListener("keydown", (e) => {
    // if a modifier key is pressed, ignore (avoid collisions)
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    const active = document.activeElement;
    const isTextInput = active && (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable
    );

    // Deal: Enter — allow when not typing in an input (but allow if Enter pressed while focused on body)
    if ((e.key === "Enter" || e.code === "Enter")) {
        if (el.dealBtn && !el.dealBtn.disabled && !isTextInput) {
        e.preventDefault();
        startNewRound();
        return;
        }
        // If user is focused in bet input and presses Enter, treat it as "start new round" as well
        if (isTextInput && active.id === "bet-input" && el.dealBtn && !el.dealBtn.disabled) {
        e.preventDefault();
        startNewRound();
        return;
        }
    }

    // Hit: Space (prevent page scroll when used)
    if (e.code === "Space" || e.key === " ") {
        if (el.hitBtn && !el.hitBtn.disabled) {
        e.preventDefault();
        playerHit();
        }
        return;
    }

    // Stand: S
    if (e.key && e.key.toLowerCase() === "s") {
        if (el.standBtn && !el.standBtn.disabled) {
        e.preventDefault();
        playerStand();
        }
        return;
    }

    // Double: D
    if (e.key && e.key.toLowerCase() === "d") {
        if (el.doubleBtn && !el.doubleBtn.disabled) {
        e.preventDefault();
        playerDouble();
        }
        return;
    }

    // Split: P
    if (e.key && e.key.toLowerCase() === "p") {
        if (el.splitBtn && !el.splitBtn.disabled) {
        e.preventDefault();
        onSplit();
        }
        return;
    }
    });

}

///// Reset and init
function resetTable() {
  deck = [];
  dealerHand = [];
  playerHands = [];
  playerBets = [];
  activeHandIndex = 0;
  inRound = false;
  splitAllowed = false;
  el.result.textContent = "";
  if (el.restartBtn) el.restartBtn.style.display = "none";
  setButtons({ dealDisabled: false, hitDisabled: true, standDisabled: true, doubleDisabled: true });
  updateBalance();
  ensureDeck();
  renderHands(false);
}

function init() {
  ensureDeck();
  updateBalance();
  el.betInput.value = currentBet;
  resetTable();
  wireEvents();
}

// Initialize after DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  bindElements();
  try {
    init();
  } catch (err) {
    console.error("Initialization error:", err);
  }
});
