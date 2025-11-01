/* freecell/game.js
   Same FreeCell implementation as before but renders the suit next to the rank
   at the top-left of each card for clearer, Klondike-like styling.
*/

const SUITS = ['♥','♣','♦','♠'];
const RANKS = [1,2,3,4,5,6,7,8,9,10,11,12,13];

let deck = [];
let tableau = [];
let freeCells = [null, null, null, null];
let foundations = { '♥':[], '♣':[], '♦':[], '♠':[]};
let selected = null;
let moveCount = 0;

function createShuffledDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function formatRank(r) {
  if (r === 1) return 'A';
  if (r === 11) return 'J';
  if (r === 12) return 'Q';
  if (r === 13) return 'K';
  return String(r);
}

function getColor(card) {
  return (card && (card.suit === '♥' || card.suit === '♦')) ? 'red' : 'black';
}

/* Rendering: rank and suit inline at the top-left */
function renderCardElement(card, zone, colIndex, cardIndex) {
  const el = document.createElement('div');
  el.className = 'card';
  if (card) el.classList.add(getColor(card));
  // top-left inline rank + suit; center left empty for drag/hover visuals
  el.innerHTML = `
    <div class="top">
      <span class="rank">${card ? formatRank(card.rank) : ''}</span>
      <span class="suit-inline">${card ? card.suit : ''}</span>
    </div>
    <div class="center"></div>
    <div class="suit">${card ? card.suit : ''}</div>
  `;
  el.dataset.zone = zone;
  el.dataset.col = String(colIndex);
  el.dataset.index = String(cardIndex);
  el.style.pointerEvents = 'auto';
  return el;
}

function render() {
  const status = document.getElementById('status');
  if (status) status.textContent = `Moves: ${moveCount}`;

  const fc = document.getElementById('free-cells');
  fc.innerHTML = '';
  freeCells.forEach((card, i) => {
    const el = renderCardElement(card, 'free', i, card ? 0 : -1);
    el.classList.add('freecell-slot');
    if (!card) el.classList.add('empty-slot');
    if (selected && selected.zone === 'free' && selected.col === i) el.classList.add('selected');
    fc.appendChild(el);
  });

  const fd = document.getElementById('foundations');
  fd.innerHTML = '';
    SUITS.forEach((suit, i) => {
    const pile = foundations[suit];
    const top = pile[pile.length - 1] || null;
    const el = renderCardElement(top, 'foundation', i, pile.length - 1);
    el.classList.add('foundation-slot');

    // add suit-specific class for placeholder coloring
    const suitClass = { '♠':'suit-spades', '♣':'suit-clubs', '♥':'suit-hearts', '♦':'suit-diamonds' }[suit];
    el.classList.add(suitClass);

    // if empty, show subtle placeholder suit marker (keeps clickable area visible)
    if (!top) {
        const ph = document.createElement('div');
        ph.className = 'suit-placeholder';
        ph.textContent = suit;
        el.appendChild(ph);
    }

  fd.appendChild(el);
});


  const tb = document.getElementById('tableau');
  tb.innerHTML = '';
  tableau.forEach((col, colIndex) => {
    const stack = document.createElement('div');
    stack.className = 'stack';
    col.forEach((card, i) => {
      const el = renderCardElement(card, 'tableau', colIndex, i);
      el.style.zIndex = i;
      if (selected && selected.zone === 'tableau' && selected.col === colIndex && selected.index === i) el.classList.add('selected');
      stack.appendChild(el);
    });
    if (col.length === 0) {
      const ph = renderCardElement(null, 'tableau', colIndex, -1);
      ph.classList.add('empty-slot');
      stack.appendChild(ph);
    }
    tb.appendChild(stack);
  });
}

/* Game start/reset */

function startGame() {
  deck = createShuffledDeck();
  tableau = Array.from({ length: 8 }, () => []);
  deck.forEach((c, i) => tableau[i % 8].push(c));
  freeCells = [null, null, null, null];
  foundations = { '♠':[], '♥':[], '♦':[], '♣':[] };
  selected = null;
  moveCount = 0;
  render();
}

/* Selection & moves (coordinate-based selection) */

function handleClick(target) {
  if (!selected) {
    if (target.zone === 'free' && !freeCells[target.col]) return;
    if (target.zone === 'foundation') {
      const pile = foundations[SUITS[target.col]] || [];
      if (pile.length === 0) return;
    }
    selected = { zone: target.zone, col: target.col, index: target.index };
    render();
    return;
  }

  if (selected.zone === target.zone && selected.col === target.col && selected.index === target.index) {
    selected = null;
    render();
    return;
  }

  const srcCard = resolveCard(selected);
  const dstCard = resolveCard(target);

  const moved = tryMove(
    { zone: selected.zone, col: selected.col, index: selected.index, card: srcCard },
    { zone: target.zone, col: target.col, index: target.index, card: dstCard }
  );
  if (moved) moveCount++;
  selected = null;
  render();
  checkWin();
}

function resolveCard(coord) {
  if (!coord) return null;
  if (coord.zone === 'tableau') {
    const colArr = tableau[coord.col] || [];
    return (coord.index >= 0 && coord.index < colArr.length) ? colArr[coord.index] : null;
  }
  if (coord.zone === 'free') return freeCells[coord.col] || null;
  if (coord.zone === 'foundation') {
    const pile = foundations[SUITS[coord.col]] || [];
    return pile[pile.length - 1] || null;
  }
  return null;
}

function tryMove(src, dst) {
  if (!src || !src.card) return false;

    // foundation move (dst.col is numeric index into SUITS)
    if (dst.zone === 'foundation') {
    const suit = SUITS[dst.col];
    const pile = foundations[suit];
    const top = pile[pile.length - 1] || null;

    // empty foundation: only an Ace of the same suit may be placed
    if (!top) {
        if (src.card.rank === 1 && src.card.suit === suit) {
        removeCard(src);
        pile.push(src.card);
        return true;
        }
        return false;
    }

    // non-empty foundation: must be same suit and next rank
    if (top.suit === src.card.suit && top.rank + 1 === src.card.rank) {
        removeCard(src);
        pile.push(src.card);
        return true;
    }

    return false;
    }

  if (dst.zone === 'free') {
    if (!freeCells[dst.col]) {
      removeCard(src);
      freeCells[dst.col] = src.card;
      return true;
    }
    return false;
  }

  if (dst.zone === 'tableau') {
    const destCol = tableau[dst.col];
    if (destCol.length === 0) {
      return moveSequenceIfPossible(src, dst.col);
    }
    const destTop = destCol[destCol.length - 1];
    if (isOppositeColor(src.card, destTop) && src.card.rank === destTop.rank - 1) {
      return moveSequenceIfPossible(src, dst.col);
    }
    return false;
  }

  return false;
}

/* Sequence moves */

function moveSequenceIfPossible(src, destColIndex) {
  if (src.zone === 'free') {
    const card = freeCells[src.col];
    if (!card) return false;
    tableau[destColIndex].push(card);
    freeCells[src.col] = null;
    return true;
  }

  if (src.zone !== 'tableau') return false;

  const col = tableau[src.col];
  const seq = col.slice(src.index);
  for (let i = 0; i < seq.length - 1; i++) {
    if (!(seq[i].rank === seq[i+1].rank + 1 && isOppositeColor(seq[i], seq[i+1]))) return false;
  }

  const freeAvailable = freeCells.filter(c => !c).length;
  const emptyTableaux = tableau.filter((c, idx) => c.length === 0 && idx !== src.col).length;
  const maxMovable = (freeAvailable + 1) * (emptyTableaux + 1);
  if (seq.length > maxMovable) return false;

  tableau[destColIndex] = tableau[destColIndex].concat(seq);
  tableau[src.col] = col.slice(0, src.index);
  return true;
}

function isOppositeColor(a, b) {
  if (!a || !b) return false;
  return getColor(a) !== getColor(b);
}

function removeCard(src) {
  if (src.zone === 'tableau') {
    const col = tableau[src.col];
    tableau[src.col] = col.slice(0, src.index);
  } else if (src.zone === 'free') {
    freeCells[src.col] = null;
  }
}

/* Win detection */

function checkWin() {
  const total = SUITS.reduce((acc, s) => acc + foundations[s].length, 0);
  if (total === 52) {
    setTimeout(() => alert(`You win! Moves: ${moveCount}`), 50);
  }
}

/* Delegated click wiring (parse dataset.col as Number consistently) */

function attachDelegation() {
  const gameEl = document.getElementById('game');
  if (!gameEl) return;
  gameEl.addEventListener('click', (ev) => {
    const cardEl = ev.target.closest('.card');
    if (!cardEl || !gameEl.contains(cardEl)) return;
    const zone = cardEl.dataset.zone;
    const col = Number(cardEl.dataset.col);
    const index = Number(cardEl.dataset.index);

    let cardObj = null;
    if (zone === 'tableau') {
      const colArr = tableau[col] || [];
      cardObj = (index >= 0 && index < colArr.length) ? colArr[index] : null;
    } else if (zone === 'free') {
      cardObj = freeCells[col] || null;
    } else if (zone === 'foundation') {
      const suit = SUITS[col];
      const pile = foundations[suit] || [];
      cardObj = pile[pile.length - 1] || null;
    }

    handleClick({ zone, col, index, card: cardObj });
  });
}

/* DOM init */

window.startGame = startGame;

window.addEventListener('DOMContentLoaded', () => {
  let game = document.getElementById('game');
  if (!game) {
    game = document.createElement('div');
    game.id = 'game';
    document.body.appendChild(game);
  }
  if (!document.getElementById('top-row')) {
    const top = document.createElement('div');
    top.id = 'top-row';
    const fc = document.createElement('div'); fc.id = 'free-cells'; fc.className = 'zone';
    const fd = document.createElement('div'); fd.id = 'foundations'; fd.className = 'zone';
    top.appendChild(fc);
    top.appendChild(fd);
    game.appendChild(top);
  }
  if (!document.getElementById('tableau')) {
    const tb = document.createElement('div'); tb.id = 'tableau'; tb.className = 'zone';
    game.appendChild(tb);
  }
  if (!document.getElementById('status')) {
    const st = document.createElement('div'); st.id = 'status'; st.style.marginTop = '8px';
    game.appendChild(st);
  }

  attachDelegation();
  startGame();
});
