let deck = [];
let pyramid = [];
let stock = [];
let waste = [];
let selected = [];
let gameOver = false;

function startGame() {
  deck = createDeck();
  shuffle(deck);
  pyramid = [];
  selected = [];
  waste = [];
  gameOver = false;


  // Deal pyramid: 7 rows, 1+2+...+7 = 28 cards
  let index = 0;
  for (let row = 0; row < 7; row++) {
    const rowCards = [];
    for (let col = 0; col <= row; col++) {
      const card = deck[index++];
      card.row = row;
      card.col = col;
      card.removed = false;
      rowCards.push(card);
    }
    pyramid.push(rowCards);
  }

  // Remaining cards go to stock
  stock = deck.slice(index);
  render();
}

function createDeck() {
  const suits = ['♠','♥','♦','♣'];
  const deck = [];
  for (let s of suits) {
    for (let r = 1; r <= 13; r++) {
      deck.push({ suit: s, rank: r });
    }
  }
  return deck;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getSuitColor(card) {
  if (!card || card.removed) return '';
  return (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
}


function render() {
  const pyramidEl = document.getElementById('pyramid');
  pyramidEl.innerHTML = '';
  for (let r = 0; r < pyramid.length; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'pyramid-row';

    for (let c = 0; c < pyramid[r].length; c++) {
      const card = pyramid[r][c];
      const el = document.createElement('div');
      el.className = 'card ' + getSuitColor(card);

      if (card.removed) {
        el.classList.add('removed');
        el.textContent = ''; // empty placeholder
      } else if (isUncovered(r, c)) {
        el.textContent = formatCard(card);
        el.onclick = () => selectCard(card);
        if (selected.includes(card)) el.classList.add('selected');
      } else {
        el.classList.add('back');
      }

      rowEl.appendChild(el);
    }

    pyramidEl.appendChild(rowEl);
  }

const stockEl = document.getElementById('stock');
if (stock.length) {
  stockEl.className = 'card back';
  stockEl.textContent = '';
  stockEl.onclick = () => draw();
} else {
  stockEl.className = 'card empty-stock';
  stockEl.textContent = '';
  stockEl.onclick = () => draw(); // still clickable!
}



  const wasteEl = document.getElementById('waste');
  wasteEl.className = 'card ' + getSuitColor(top);
  if (waste.length) {
    const top = waste[waste.length - 1];
    wasteEl.textContent = formatCard(top);
    if (selected.includes(top)) wasteEl.classList.add('selected');
    wasteEl.onclick = () => selectCard(top);
  } else {
    wasteEl.textContent = '';
    wasteEl.onclick = null;
  }

  document.getElementById('status').textContent = `Stock: ${stock.length} cards`;
}

function formatCard(card) {
  const rankMap = {1:'A',11:'J',12:'Q',13:'K'};
  return (rankMap[card.rank] || card.rank) + card.suit;
}

function isUncovered(r, c) {
  if (r === 6) return true;
  const belowLeft = pyramid[r + 1][c];
  const belowRight = pyramid[r + 1][c + 1];
  return belowLeft.removed && belowRight.removed;
}

function isWasteCard(card) {
  return waste.length && card === waste[waste.length - 1];
}


function selectCard(card) {
  if (gameOver) return;

  if (selected.includes(card)) {
    selected = selected.filter(c => c !== card);
  } else {
    selected.push(card);
  }

  if (selected.length === 2) {
  const [a, b] = selected;
  const sum = a.rank + b.rank;
  if (sum === 13) {
    if (isWasteCard(a)) waste.pop();
    else a.removed = true;

    if (isWasteCard(b)) waste.pop();
    else b.removed = true;
  }
  selected = [];
  } else if (selected.length === 1 && card.rank === 13) {
    if (isWasteCard(card)) {
      waste.pop(); // remove top waste card
    } else {
      card.removed = true;
    }
    selected = [];
  }


  render();
}

function draw() {
  if (gameOver) return;

  if (stock.length === 0) {
    showFinalScore();
    return;
  }
  const card = stock.pop();
  waste.push(card);
  render();
}


function showFinalScore() {
  const totalCleared = pyramid.flat().filter(c => c.removed).length;
  const remaining = 28 - totalCleared;
  const message = `Game over! You cleared ${totalCleared} of 28 cards. ${remaining} remain.`;
  document.getElementById('status').textContent = message;
  gameOver = true;
}
